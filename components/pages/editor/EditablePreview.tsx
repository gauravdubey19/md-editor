"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useEditorContext } from "@/context/EditorContext";
import { markdownToHtml, htmlToMarkdown } from "@/lib/markdown-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit3Icon, EyeIcon, BoldIcon, ItalicIcon, Heading1Icon, Heading2Icon, ListIcon } from "lucide-react";

export const EditablePreview: React.FC = () => {
  const {
    markdown,
    setMarkdown,
    previewEditMode,
    setPreviewEditMode,
    syncSource,
    toggleTaskCheckbox,
    registerPreviewRef,
    registerPreviewScrollRef,
    handlePreviewScroll,
  } = useEditorContext();

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isTypingInPreviewRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Register elements with context
  useEffect(() => {
    registerPreviewRef(previewContainerRef.current);
    registerPreviewScrollRef(scrollContainerRef.current);
    return () => {
      registerPreviewRef(null);
      registerPreviewScrollRef(null);
    };
  }, [registerPreviewRef, registerPreviewScrollRef]);

  // Helper to check if preview currently has user focus
  const isPreviewFocused = useCallback(() => {
    return typeof document !== "undefined" && previewContainerRef.current !== null && previewContainerRef.current.contains(document.activeElement);
  }, []);

  // Attach event listeners to task checkboxes and code copy buttons inside rendered HTML
  const attachCodeCopyAndTaskListeners = useCallback(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    // Task Checkboxes
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checkboxes.forEach((cb, index) => {
      cb.disabled = false;
      cb.style.cursor = "pointer";
      cb.setAttribute("data-task-index", index.toString());

      cb.onclick = (e) => {
        e.stopPropagation();
        toggleTaskCheckbox(index);
      };
    });

    // Code blocks: add copy button overlay
    const preBlocks = container.querySelectorAll<HTMLPreElement>("pre");
    preBlocks.forEach((pre) => {
      if (pre.querySelector(".code-copy-btn")) return;

      pre.style.position = "relative";
      const btn = document.createElement("button");
      btn.className =
        "code-copy-btn absolute top-2 right-2 flex items-center gap-1 text-[11px] font-medium bg-background/80 hover:bg-background text-foreground/80 hover:text-foreground px-2 py-1 rounded-lg border border-border/80 shadow-xs transition-opacity opacity-0 group-hover:opacity-100";
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`;

      pre.classList.add("group");

      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const code = pre.querySelector("code")?.textContent || pre.textContent || "";
        navigator.clipboard.writeText(code);
        btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg><span class="text-emerald-500">Copied!</span>`;
        setTimeout(() => {
          btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`;
        }, 2000);
      };

      pre.appendChild(btn);
    });
  }, [toggleTaskCheckbox]);

  // Sync Markdown -> HTML in preview
  // If the user is actively typing in the preview, or if the change originated from the preview,
  // do NOT overwrite innerHTML because overwriting innerHTML destroys the active DOM nodes and resets
  // the caret/cursor to the starting line.
  useEffect(() => {
    if (syncSource === "preview" || isTypingInPreviewRef.current || isPreviewFocused()) {
      return;
    }

    if (previewContainerRef.current) {
      const html = markdownToHtml(markdown);
      previewContainerRef.current.innerHTML = html;
      attachCodeCopyAndTaskListeners();
    }
  }, [markdown, syncSource, attachCodeCopyAndTaskListeners, isPreviewFocused]);

  // Re-sync and sanitize when switching to read-only mode
  useEffect(() => {
    if (previewEditMode === "read-only" && previewContainerRef.current) {
      const html = markdownToHtml(markdown);
      previewContainerRef.current.innerHTML = html;
      attachCodeCopyAndTaskListeners();
    }
  }, [previewEditMode, markdown, attachCodeCopyAndTaskListeners]);

  // Handle live user input in contentEditable preview
  const handlePreviewInput = () => {
    if (previewEditMode === "read-only") return;
    isTypingInPreviewRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (previewContainerRef.current) {
        // Convert updated DOM to clean Markdown
        const updatedMarkdown = htmlToMarkdown(previewContainerRef.current);
        setMarkdown(updatedMarkdown, "preview");
      }
      isTypingInPreviewRef.current = false;
    }, 250);
  };

  const handleBlur = () => {
    isTypingInPreviewRef.current = false;
    if (previewContainerRef.current) {
      const updatedMarkdown = htmlToMarkdown(previewContainerRef.current);
      setMarkdown(updatedMarkdown, "preview");
    }
  };

  // Quick formatting actions for WYSIWYG / ContentEditable
  const formatSelection = (command: string, value: string = "") => {
    if (previewEditMode === "read-only") return;
    document.execCommand(command, false, value);
    handlePreviewInput();
  };

  const isEditable = previewEditMode === "visual-edit";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Preview Header & Controls */}
      <div className="flex items-center justify-between border-b border-border/70 bg-card/60 px-3 py-1.5 shrink-0 text-xs">
        <div className="flex items-center gap-2">
          <Badge variant={isEditable ? "default" : "secondary"} className="text-[10px] h-5 gap-1 font-medium transition-all">
            {isEditable ?
              <>
                <Edit3Icon className="size-3" />
                <span>Live Editable Preview</span>
              </>
            : <>
                <EyeIcon className="size-3" />
                <span>Read-Only Preview</span>
              </>
            }
          </Badge>

          {isEditable && <span className="text-[11px] text-muted-foreground hidden sm:inline-block">Click anywhere in text to edit directly</span>}
        </div>

        {/* Visual Quick Actions & Mode Switcher */}
        <div className="flex items-center gap-1">
          {isEditable && (
            <div className="flex items-center bg-muted/50 rounded-xl p-0.5 border border-border/50 mr-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => formatSelection("bold")}
                      className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <BoldIcon className="size-3" />
                </TooltipTrigger>
                <TooltipContent>Bold Selection</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => formatSelection("italic")}
                      className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <ItalicIcon className="size-3" />
                </TooltipTrigger>
                <TooltipContent>Italic Selection</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => formatSelection("formatBlock", "h1")}
                      className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <Heading1Icon className="size-3" />
                </TooltipTrigger>
                <TooltipContent>Heading 1</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => formatSelection("formatBlock", "h2")}
                      className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <Heading2Icon className="size-3" />
                </TooltipTrigger>
                <TooltipContent>Heading 2</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => formatSelection("insertUnorderedList")}
                      className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <ListIcon className="size-3" />
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>
            </div>
          )}

          <Button
            variant={isEditable ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPreviewEditMode(isEditable ? "read-only" : "visual-edit")}
            className="h-6 px-2 text-[11px] gap-1 rounded-xl"
          >
            {isEditable ? "Switch to Read Only" : "Enable Visual Editing"}
          </Button>
        </div>
      </div>

      {/* Rendered Live HTML Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handlePreviewScroll}
        className="relative flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin scrollbar-thumb-muted-foreground/20"
      >
        <div
          ref={previewContainerRef}
          contentEditable={isEditable}
          suppressContentEditableWarning={true}
          onInput={handlePreviewInput}
          onBlur={handleBlur}
          className={`markdown-preview prose dark:prose-invert max-w-none focus:outline-none transition-all ${
            isEditable ? "cursor-text ring-1 focus:ring-primary/20 rounded-2xl p-1" : ""
          }`}
          style={{ minHeight: "100%" }}
        />
      </div>
    </div>
  );
};
