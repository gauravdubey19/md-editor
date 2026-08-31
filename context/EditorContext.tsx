"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  calculateStats,
  formatMarkdownContent,
  markdownToHtml,
  SAMPLE_DOCUMENTS,
  type DocumentStats,
  type ViewMode,
  type PreviewEditMode,
} from "@/lib/markdown-utils";

export interface SnippetResult {
  text: string;
  cursorOffset?: number;
  selectionLength?: number;
}

export type SnippetGenerator = (selectedText: string) => SnippetResult;

export interface EditorContextValue {
  markdown: string;
  fileName: string;
  isDirty: boolean;
  viewMode: ViewMode;
  previewEditMode: PreviewEditMode;
  cursorPosition: { line: number; column: number };
  stats: DocumentStats;
  isAttachmentModalOpen: boolean;
  isShareModalOpen: boolean;
  isDragOver: boolean;
  theme: "light" | "dark" | "system";
  syncSource: "none" | "raw" | "preview" | "external";
  canUndo: boolean;
  canRedo: boolean;
  isSyncScrollEnabled: boolean;
  parentShareToken: string | null;
  sharedExpiresAt: string | null;
  // Actions
  setMarkdown: (content: string, source?: "raw" | "preview" | "external") => void;
  setFileName: (name: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setPreviewEditMode: (mode: PreviewEditMode) => void;
  setCursorPosition: (pos: { line: number; column: number }) => void;
  setIsAttachmentModalOpen: (open: boolean) => void;
  setIsShareModalOpen: (open: boolean) => void;
  setIsDragOver: (dragOver: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  setIsSyncScrollEnabled: (enabled: boolean) => void;
  toggleSyncScroll: () => void;
  setParentShareToken: (token: string | null) => void;
  setSharedExpiresAt: (expiresAt: string | null) => void;
  insertSnippet: (generator: SnippetGenerator) => void;
  registerEditorRef: (ref: HTMLTextAreaElement | null) => void;
  registerPreviewRef: (ref: HTMLDivElement | null) => void;
  registerPreviewScrollRef: (ref: HTMLDivElement | null) => void;
  registerLineNumbersRef: (ref: HTMLDivElement | null) => void;
  handleEditorScroll: () => void;
  handlePreviewScroll: () => void;
  loadFile: (file: File) => Promise<boolean>;
  loadSample: (sampleId: string) => void;
  createNewFile: (defaultName?: string) => void;
  downloadMarkdown: () => void;
  downloadHtml: () => void;
  copyMarkdown: () => Promise<boolean>;
  copyHtml: () => Promise<boolean>;
  formatDocument: () => void;
  toggleTaskCheckbox: (taskIndex: number) => void;
  undo: () => void;
  redo: () => void;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

const MAX_HISTORY = 50;

export interface EditorProviderProps {
  children: React.ReactNode;
  initialMarkdown?: string;
  initialFileName?: string;
  initialParentToken?: string | null;
  initialExpiresAt?: string | null;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  initialMarkdown,
  initialFileName,
  initialParentToken = null,
  initialExpiresAt = null,
}) => {
  const defaultSample = SAMPLE_DOCUMENTS[0];
  const [markdown, setMarkdownState] = useState<string>(initialMarkdown !== undefined ? initialMarkdown : defaultSample.content);
  const [fileName, setFileName] = useState<string>(initialFileName || (initialMarkdown !== undefined ? "shared-document.md" : "welcome.md"));
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [previewEditMode, setPreviewEditMode] = useState<PreviewEditMode>("visual-edit");
  const [cursorPosition, setCursorPosition] = useState<{
    line: number;
    column: number;
  }>({ line: 1, column: 1 });
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isSyncScrollEnabled, setIsSyncScrollEnabled] = useState<boolean>(true);
  const [parentShareToken, setParentShareToken] = useState<string | null>(initialParentToken);
  const [sharedExpiresAt, setSharedExpiresAt] = useState<string | null>(initialExpiresAt);

  const [theme, setThemeState] = useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTheme = localStorage.getItem("md-editor-theme") as "light" | "dark" | "system" | null;
        return savedTheme || "dark";
      } catch {
        return "dark";
      }
    }
    return "dark";
  });
  const [syncSource, setSyncSource] = useState<"none" | "raw" | "preview" | "external">("none");

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([initialMarkdown !== undefined ? initialMarkdown : defaultSample.content]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Element refs for focus, scroll sync, and snippet insertion
  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewDivRef = useRef<HTMLDivElement | null>(null);
  const previewScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  // Scroll synchronization locks
  const scrollSourceRef = useRef<"editor" | "preview" | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInternalUpdatingRef = useRef<boolean>(false);

  // Derived stats
  const stats = React.useMemo(() => calculateStats(markdown), [markdown]);

  // Set theme on html tag
  const applyTheme = useCallback((selectedTheme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (selectedTheme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemDark ? "dark" : "light");
    } else {
      root.classList.add(selectedTheme);
    }
  }, []);

  const setTheme = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      setThemeState(newTheme);
      applyTheme(newTheme);
      try {
        localStorage.setItem("md-editor-theme", newTheme);
      } catch {
        // ignore
      }
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [theme, setTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleSyncScroll = useCallback(() => {
    setIsSyncScrollEnabled((prev) => !prev);
  }, []);

  // Register element refs
  const registerEditorRef = useCallback((ref: HTMLTextAreaElement | null) => {
    editorTextareaRef.current = ref;
  }, []);

  const registerPreviewRef = useCallback((ref: HTMLDivElement | null) => {
    previewDivRef.current = ref;
  }, []);

  const registerPreviewScrollRef = useCallback((ref: HTMLDivElement | null) => {
    previewScrollContainerRef.current = ref;
  }, []);

  const registerLineNumbersRef = useCallback((ref: HTMLDivElement | null) => {
    lineNumbersRef.current = ref;
  }, []);

  // Synchronized scrolling handlers
  const handleEditorScroll = useCallback(() => {
    if (!isSyncScrollEnabled) return;
    const editor = editorTextareaRef.current;
    const preview = previewScrollContainerRef.current;
    const lineNumbers = lineNumbersRef.current;

    if (editor && lineNumbers) {
      lineNumbers.scrollTop = editor.scrollTop;
    }

    if (!editor || !preview) return;

    if (scrollSourceRef.current === "preview") return;
    scrollSourceRef.current = "editor";

    const editorScrollable = editor.scrollHeight - editor.clientHeight;
    if (editorScrollable > 0) {
      const scrollPercentage = editor.scrollTop / editorScrollable;
      const previewScrollable = preview.scrollHeight - preview.clientHeight;
      preview.scrollTop = scrollPercentage * previewScrollable;
    }

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      scrollSourceRef.current = null;
    }, 100);
  }, [isSyncScrollEnabled]);

  const handlePreviewScroll = useCallback(() => {
    if (!isSyncScrollEnabled) return;
    const editor = editorTextareaRef.current;
    const preview = previewScrollContainerRef.current;

    if (!editor || !preview) return;

    if (scrollSourceRef.current === "editor") return;
    scrollSourceRef.current = "preview";

    const previewScrollable = preview.scrollHeight - preview.clientHeight;
    if (previewScrollable > 0) {
      const scrollPercentage = preview.scrollTop / previewScrollable;
      const editorScrollable = editor.scrollHeight - editor.clientHeight;
      editor.scrollTop = scrollPercentage * editorScrollable;
    }

    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      scrollSourceRef.current = null;
    }, 100);
  }, [isSyncScrollEnabled]);

  // Push new state into history stack
  const pushHistory = useCallback(
    (newContent: string) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        if (sliced[sliced.length - 1] === newContent) return prev;
        const updated = [...sliced, newContent];
        if (updated.length > MAX_HISTORY) updated.shift();
        return updated;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [historyIndex],
  );

  // Update markdown with history tracking
  const setMarkdown = useCallback(
    (newContent: string, source: "raw" | "preview" | "external" = "raw") => {
      if (newContent === markdown) return;
      isInternalUpdatingRef.current = true;
      setSyncSource(source);
      setMarkdownState(newContent);
      setIsDirty(true);

      if (source !== "external") {
        pushHistory(newContent);
      }

      setTimeout(() => {
        isInternalUpdatingRef.current = false;
      }, 50);
    },
    [markdown, pushHistory],
  );

  // Undo / Redo Actions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevContent = history[newIndex];
      setMarkdownState(prevContent);
      setSyncSource("external");
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextContent = history[newIndex];
      setMarkdownState(nextContent);
      setSyncSource("external");
      setIsDirty(true);
    }
  }, [history, historyIndex]);

  // Insert snippet / format selection
  const insertSnippet = useCallback(
    (generator: SnippetGenerator) => {
      const textarea = editorTextareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = markdown.substring(start, end);

      const { text, cursorOffset, selectionLength } = generator(selectedText);

      const before = markdown.substring(0, start);
      const after = markdown.substring(end);
      const newMarkdown = before + text + after;

      setMarkdown(newMarkdown, "raw");

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = cursorOffset !== undefined ? start + cursorOffset : start + text.length;
        const newSelLength = selectionLength || 0;
        textarea.setSelectionRange(newCursorPos, newCursorPos + newSelLength);
      }, 0);
    },
    [markdown, setMarkdown],
  );

  // Toggle checklist checkbox
  const toggleTaskCheckbox = useCallback(
    (taskIndex: number) => {
      const checkboxRegex = /^\s*[-*+]\s+\[([ xX])\]\s+/gm;
      let match: RegExpExecArray | null;
      let currentIndex = 0;
      let targetStart = -1;
      let currentCheckChar = " ";

      while ((match = checkboxRegex.exec(markdown)) !== null) {
        if (currentIndex === taskIndex) {
          targetStart = match.index + match[0].indexOf("[") + 1;
          currentCheckChar = match[1];
          break;
        }
        currentIndex++;
      }

      if (targetStart !== -1) {
        const newChar = currentCheckChar === " " ? "x" : " ";
        const updated = markdown.substring(0, targetStart) + newChar + markdown.substring(targetStart + 1);
        setMarkdown(updated, "preview");
      }
    },
    [markdown, setMarkdown],
  );

  // Load uploaded local file
  const loadFile = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        const text = await file.text();
        setMarkdown(text, "external");
        setFileName(file.name);
        setIsDirty(false);
        setParentShareToken(null);
        setSharedExpiresAt(null);
        setHistory([text]);
        setHistoryIndex(0);
        return true;
      } catch (err) {
        console.error("Error reading file:", err);
        return false;
      }
    },
    [setMarkdown],
  );

  // Load sample template
  const loadSample = useCallback(
    (sampleId: string) => {
      const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId) || SAMPLE_DOCUMENTS[0];
      setMarkdown(sample.content, "external");
      setFileName(`${sample.id}.md`);
      setIsDirty(false);
      setParentShareToken(null);
      setSharedExpiresAt(null);
      setHistory([sample.content]);
      setHistoryIndex(0);
    },
    [setMarkdown],
  );

  // Create fresh blank document
  const createNewFile = useCallback(
    (defaultName: string = "untitled.md") => {
      const initialText = `# Untitled Document\n\nStart writing your markdown here...\n`;
      setMarkdown(initialText, "external");
      setFileName(defaultName);
      setIsDirty(false);
      setParentShareToken(null);
      setSharedExpiresAt(null);
      setHistory([initialText]);
      setHistoryIndex(0);
    },
    [setMarkdown],
  );

  // Format document
  const formatDocument = useCallback(() => {
    const formatted = formatMarkdownContent(markdown);
    setMarkdown(formatted, "external");
  }, [markdown, setMarkdown]);

  // Export / Download handlers
  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDirty(false);
  }, [markdown, fileName]);

  const downloadHtml = useCallback(() => {
    const rawHtml = markdownToHtml(markdown);
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 20px;
      color: #24292e;
    }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 85%; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #dfe2e5; padding: 6px 13px; text-align: left; }
    th { background: #f6f8fa; }
    blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding: 0 16px; color: #6a737d; }
    hr { border: none; border-top: 1px solid #dfe2e5; margin: 24px 0; }
  </style>
</head>
<body>
  ${rawHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.md$/i, "")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown, fileName]);

  const copyMarkdown = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(markdown);
      return true;
    } catch {
      return false;
    }
  }, [markdown]);

  const copyHtml = useCallback(async (): Promise<boolean> => {
    try {
      const html = markdownToHtml(markdown);
      await navigator.clipboard.writeText(html);
      return true;
    } catch {
      return false;
    }
  }, [markdown]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const value: EditorContextValue = {
    markdown,
    fileName,
    isDirty,
    viewMode,
    previewEditMode,
    cursorPosition,
    stats,
    isAttachmentModalOpen,
    isShareModalOpen,
    isDragOver,
    theme,
    syncSource,
    canUndo,
    canRedo,
    isSyncScrollEnabled,
    parentShareToken,
    sharedExpiresAt,
    setMarkdown,
    setFileName,
    setViewMode,
    setPreviewEditMode,
    setCursorPosition,
    setIsAttachmentModalOpen,
    setIsShareModalOpen,
    setIsDragOver,
    setTheme,
    toggleTheme,
    setIsSyncScrollEnabled,
    toggleSyncScroll,
    setParentShareToken,
    setSharedExpiresAt,
    insertSnippet,
    registerEditorRef,
    registerPreviewRef,
    registerPreviewScrollRef,
    registerLineNumbersRef,
    handleEditorScroll,
    handlePreviewScroll,
    loadFile,
    loadSample,
    createNewFile,
    downloadMarkdown,
    downloadHtml,
    copyMarkdown,
    copyHtml,
    formatDocument,
    toggleTaskCheckbox,
    undo,
    redo,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditorContext = (): EditorContextValue => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};
