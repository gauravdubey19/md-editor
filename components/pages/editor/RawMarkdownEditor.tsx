"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useEditorContext } from "@/context/EditorContext";

export const RawMarkdownEditor: React.FC = () => {
  const {
    markdown,
    setMarkdown,
    setCursorPosition,
    registerEditorRef,
    registerLineNumbersRef,
    handleEditorScroll,
    insertSnippet,
    undo,
    redo,
    downloadMarkdown,
  } = useEditorContext();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  // Split lines for line numbers
  const lines = React.useMemo(() => markdown.split(/\r\n|\r|\n/), [markdown]);
  const totalLines = Math.max(lines.length, 1);

  // Register textarea and line numbers refs into context
  useEffect(() => {
    registerEditorRef(textareaRef.current);
    registerLineNumbersRef(lineNumbersRef.current);
    return () => {
      registerEditorRef(null);
      registerLineNumbersRef(null);
    };
  }, [registerEditorRef, registerLineNumbersRef]);

  // Update cursor position
  const updateCursorInfo = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    const selectionStart = el.selectionStart;
    const textBefore = el.value.substring(0, selectionStart);
    const linesBefore = textBefore.split(/\r\n|\r|\n/);
    const lineNumber = linesBefore.length;
    const columnNumber = linesBefore[linesBefore.length - 1].length + 1;

    setCursorPosition({ line: lineNumber, column: columnNumber });
  }, [setCursorPosition]);

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent);
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // Tab & Shift+Tab handling
    if (e.key === "Tab") {
      e.preventDefault();
      const el = textareaRef.current;
      if (!el) return;

      const start = el.selectionStart;
      const end = el.selectionEnd;
      const value = el.value;

      if (e.shiftKey) {
        // Dedent 2 spaces if present before cursor or selection
        if (start > 1 && value.substring(start - 2, start) === "  ") {
          const next = value.substring(0, start - 2) + value.substring(start);
          setMarkdown(next, "raw");
          setTimeout(() => {
            el.setSelectionRange(start - 2, start - 2);
            updateCursorInfo();
          }, 0);
        }
      } else {
        // Indent 2 spaces
        const next = value.substring(0, start) + "  " + value.substring(end);
        setMarkdown(next, "raw");
        setTimeout(() => {
          el.setSelectionRange(start + 2, start + 2);
          updateCursorInfo();
        }, 0);
      }
      return;
    }

    // Ctrl/Cmd + B -> Bold
    if (modifier && e.key.toLowerCase() === "b") {
      e.preventDefault();
      insertSnippet((sel) => {
        const text = sel || "bold text";
        return {
          text: `**${text}**`,
          cursorOffset: 2,
          selectionLength: text.length,
        };
      });
      return;
    }

    // Ctrl/Cmd + I -> Italic
    if (modifier && e.key.toLowerCase() === "i") {
      e.preventDefault();
      insertSnippet((sel) => {
        const text = sel || "italic text";
        return {
          text: `*${text}*`,
          cursorOffset: 1,
          selectionLength: text.length,
        };
      });
      return;
    }

    // Ctrl/Cmd + K -> Link
    if (modifier && e.key.toLowerCase() === "k") {
      e.preventDefault();
      insertSnippet((sel) => {
        const text = sel || "link text";
        return {
          text: `[${text}](https://example.com)`,
          cursorOffset: text.length + 3,
          selectionLength: 19,
        };
      });
      return;
    }

    // Ctrl/Cmd + S -> Save/Download
    if (modifier && e.key.toLowerCase() === "s") {
      e.preventDefault();
      downloadMarkdown();
      return;
    }

    // Ctrl/Cmd + Z / Y -> Undo / Redo
    if (modifier && e.key.toLowerCase() === "z") {
      if (e.shiftKey) {
        e.preventDefault();
        redo();
      } else {
        e.preventDefault();
        undo();
      }
      return;
    }

    if (modifier && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
      return;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value, "raw");
    updateCursorInfo();
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-background">
      {/* Line Numbers Column */}
      <div
        ref={lineNumbersRef}
        aria-hidden="true"
        className="hidden sm:flex flex-col select-none border-r border-border/60 bg-muted/20 px-2 py-4 text-right font-mono text-[12px] leading-[1.65rem] text-muted-foreground/50 overflow-hidden shrink-0 w-12"
      >
        {Array.from({ length: totalLines }).map((_, index) => (
          <div key={index} className="h-[1.65rem] leading-[1.65rem]">
            {index + 1}
          </div>
        ))}
      </div>

      {/* Editor Textarea */}
      <div className="relative flex-1 h-full w-full overflow-hidden">
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={handleChange}
          onScroll={handleEditorScroll}
          onKeyUp={updateCursorInfo}
          onClick={updateCursorInfo}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste markdown content here..."
          spellCheck="false"
          className="h-full w-full resize-none border-none bg-transparent p-4 font-mono text-[13px] leading-[1.65rem] text-foreground focus:outline-none focus:ring-0 selection:bg-primary/20 selection:text-primary overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20"
        />
      </div>
    </div>
  );
};
