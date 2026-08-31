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
  isDragOver: boolean;
  theme: "light" | "dark" | "system";
  syncSource: "none" | "raw" | "preview" | "external";
  canUndo: boolean;
  canRedo: boolean;
  isSyncScrollEnabled: boolean;
  // Actions
  setMarkdown: (content: string, source?: "raw" | "preview" | "external") => void;
  setFileName: (name: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setPreviewEditMode: (mode: PreviewEditMode) => void;
  setCursorPosition: (pos: { line: number; column: number }) => void;
  setIsAttachmentModalOpen: (open: boolean) => void;
  setIsDragOver: (dragOver: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
  setIsSyncScrollEnabled: (enabled: boolean) => void;
  toggleSyncScroll: () => void;
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

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialSample = SAMPLE_DOCUMENTS[0];
  const [markdown, setMarkdownState] = useState<string>(initialSample.content);
  const [fileName, setFileName] = useState<string>("welcome.md");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [previewEditMode, setPreviewEditMode] = useState<PreviewEditMode>("visual-edit");
  const [cursorPosition, setCursorPosition] = useState<{
    line: number;
    column: number;
  }>({ line: 1, column: 1 });
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isSyncScrollEnabled, setIsSyncScrollEnabled] = useState<boolean>(true);
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
  const [history, setHistory] = useState<string[]>([initialSample.content]);
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
        // LocalStorage access might fail in restricted environments
      }
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const toggleSyncScroll = useCallback(() => {
    setIsSyncScrollEnabled((prev) => !prev);
  }, []);

  // Initialize theme from storage or default
  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

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

  // Bidirectional synchronized scrolling
  const handleEditorScroll = useCallback(() => {
    const editorEl = editorTextareaRef.current;
    if (!editorEl) return;

    // Synchronize line numbers column with editor textarea
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorEl.scrollTop;
    }

    if (!isSyncScrollEnabled) return;
    if (scrollSourceRef.current === "preview") return;

    const previewEl = previewScrollContainerRef.current;
    if (!previewEl) return;

    scrollSourceRef.current = "editor";
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    const editorMax = editorEl.scrollHeight - editorEl.clientHeight;
    const previewMax = previewEl.scrollHeight - previewEl.clientHeight;

    if (editorMax > 0 && previewMax > 0) {
      const scrollRatio = editorEl.scrollTop / editorMax;
      previewEl.scrollTop = scrollRatio * previewMax;
    }

    scrollTimerRef.current = setTimeout(() => {
      scrollSourceRef.current = null;
    }, 100);
  }, [isSyncScrollEnabled]);

  const handlePreviewScroll = useCallback(() => {
    if (!isSyncScrollEnabled) return;
    if (scrollSourceRef.current === "editor") return;

    const previewEl = previewScrollContainerRef.current;
    const editorEl = editorTextareaRef.current;
    if (!previewEl || !editorEl) return;

    scrollSourceRef.current = "preview";
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    const previewMax = previewEl.scrollHeight - previewEl.clientHeight;
    const editorMax = editorEl.scrollHeight - editorEl.clientHeight;

    if (previewMax > 0 && editorMax > 0) {
      const scrollRatio = previewEl.scrollTop / previewMax;
      editorEl.scrollTop = scrollRatio * editorMax;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = editorEl.scrollTop;
      }
    }

    scrollTimerRef.current = setTimeout(() => {
      scrollSourceRef.current = null;
    }, 100);
  }, [isSyncScrollEnabled]);

  // Update markdown and manage undo history
  const setMarkdown = useCallback(
    (newContent: string, source: "raw" | "preview" | "external" = "raw") => {
      if (isInternalUpdatingRef.current) return;

      setSyncSource(source);
      setMarkdownState(newContent);
      setIsDirty(true);

      // Add to history with debounce/branching
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        if (sliced[sliced.length - 1] === newContent) return prev;
        const next = [...sliced, newContent];
        if (next.length > MAX_HISTORY) next.shift();
        return next;
      });
      setHistoryIndex((prev) => {
        const nextIdx = Math.min(prev + 1, MAX_HISTORY - 1);
        return nextIdx;
      });
    },
    [historyIndex],
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetContent = history[targetIndex];
      isInternalUpdatingRef.current = true;
      setMarkdownState(targetContent);
      setHistoryIndex(targetIndex);
      setSyncSource("raw");
      setTimeout(() => {
        isInternalUpdatingRef.current = false;
      }, 50);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetContent = history[targetIndex];
      isInternalUpdatingRef.current = true;
      setMarkdownState(targetContent);
      setHistoryIndex(targetIndex);
      setSyncSource("raw");
      setTimeout(() => {
        isInternalUpdatingRef.current = false;
      }, 50);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Insert markdown snippet into raw editor at current cursor position
  const insertSnippet = useCallback(
    (generator: SnippetGenerator) => {
      const textarea = editorTextareaRef.current;
      if (!textarea) {
        // Fallback: append snippet to bottom
        const result = generator("");
        setMarkdown(markdown + "\n\n" + result.text, "raw");
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const result = generator(selectedText);

      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);
      const nextContent = before + result.text + after;

      setMarkdown(nextContent, "raw");

      // Restore and position cursor
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + (result.cursorOffset !== undefined ? result.cursorOffset : result.text.length);
        const selLength = result.selectionLength || 0;
        textarea.setSelectionRange(newCursorPos, newCursorPos + selLength);
      }, 0);
    },
    [markdown, setMarkdown],
  );

  // Load a file from disk
  const loadFile = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        const text = await file.text();
        setMarkdown(text, "external");
        setFileName(file.name);
        setIsDirty(false);
        return true;
      } catch (err: unknown) {
        console.error("Error reading file:", err);
        return false;
      }
    },
    [setMarkdown],
  );

  // Load a preset sample document
  const loadSample = useCallback(
    (sampleId: string) => {
      const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
      if (sample) {
        setMarkdown(sample.content, "external");
        setFileName(`${sample.id}.md`);
        setIsDirty(false);
      }
    },
    [setMarkdown],
  );

  // Create new blank document
  const createNewFile = useCallback(
    (defaultName: string = "untitled.md") => {
      setMarkdown("# Untitled Document\n\nStart writing markdown here...", "external");
      setFileName(defaultName);
      setIsDirty(false);
    },
    [setMarkdown],
  );

  // Download raw markdown file
  const downloadMarkdown = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
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

  // Download converted HTML document
  const downloadHtml = useCallback(() => {
    const bodyHtml = markdownToHtml(markdown);
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName.replace(/\.md$/, "")}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1, h2, h3 { color: #111; margin-top: 1.5em; }
    pre { background: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; background: #f4f4f5; padding: 2px 6px; border-radius: 4px; }
    pre code { padding: 0; background: none; }
    blockquote { border-left: 4px solid #e4e4e7; margin: 0; padding-left: 16px; color: #71717a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #e4e4e7; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f5; }
    hr { border: none; border-top: 1px solid #e4e4e7; margin: 2em 0; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.md$/, "")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [markdown, fileName]);

  // Copy raw markdown to clipboard
  const copyMarkdown = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(markdown);
      return true;
    } catch {
      return false;
    }
  }, [markdown]);

  // Copy rendered HTML to clipboard
  const copyHtml = useCallback(async (): Promise<boolean> => {
    try {
      const html = markdownToHtml(markdown);
      await navigator.clipboard.writeText(html);
      return true;
    } catch {
      return false;
    }
  }, [markdown]);

  // Format document
  const formatDocument = useCallback(() => {
    const formatted = formatMarkdownContent(markdown);
    if (formatted !== markdown) {
      setMarkdown(formatted, "raw");
    }
  }, [markdown, setMarkdown]);

  // Interactive task checkbox toggle (finds N-th task in markdown and flips checked state)
  const toggleTaskCheckbox = useCallback(
    (taskIndex: number) => {
      const lines = markdown.split(/\r\n|\r|\n/);
      let currentTaskCount = 0;
      let updated = false;

      const newLines = lines.map((line) => {
        const match = line.match(/^(\s*[-*+]\s+\[)([ xX])(\]\s+.*)$/);
        if (match) {
          if (currentTaskCount === taskIndex) {
            const isChecked = match[2].toLowerCase() === "x";
            const newStatus = isChecked ? " " : "x";
            updated = true;
            currentTaskCount++;
            return `${match[1]}${newStatus}${match[3]}`;
          }
          currentTaskCount++;
        }
        return line;
      });

      if (updated) {
        setMarkdown(newLines.join("\n"), "preview");
      }
    },
    [markdown, setMarkdown],
  );

  const value: EditorContextValue = {
    markdown,
    fileName,
    isDirty,
    viewMode,
    previewEditMode,
    cursorPosition,
    stats,
    isAttachmentModalOpen,
    isDragOver,
    theme,
    syncSource,
    canUndo,
    canRedo,
    isSyncScrollEnabled,
    setMarkdown,
    setFileName,
    setViewMode,
    setPreviewEditMode,
    setCursorPosition,
    setIsAttachmentModalOpen,
    setIsDragOver,
    setTheme,
    toggleTheme,
    setIsSyncScrollEnabled,
    toggleSyncScroll,
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

export function useEditorContext(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
}
