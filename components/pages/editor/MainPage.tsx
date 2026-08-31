"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { EditorToolbar } from "./EditorToolbar";
import { RawMarkdownEditor } from "./RawMarkdownEditor";
import { EditablePreview } from "./EditablePreview";
import { StatusBar } from "./StatusBar";
import { FileAttachmentModal } from "./FileAttachmentModal";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useEditorContext } from "@/context/EditorContext";
import { UploadCloudIcon } from "lucide-react";

export const MainPage: React.FC = () => {
  const { viewMode, loadFile } = useEditorContext();
  const [windowDrag, setWindowDrag] = useState<boolean>(false);

  // Global drag-and-drop file upload listener
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setWindowDrag(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setWindowDrag(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setWindowDrag(false);
      dragCounter = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.name.match(/\.(md|markdown|txt|mdown|mkd)$/i)) {
          await loadFile(file);
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [loadFile]);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Global Drag & Drop Overlay */}
      {windowDrag && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md border-4 border-dashed border-primary animate-in fade-in-0 duration-150 p-6 pointer-events-none">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="size-20 rounded-full bg-primary/20 text-primary flex items-center justify-center animate-bounce">
              <UploadCloudIcon className="size-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">Drop your Markdown file here</h2>
              <p className="text-sm text-muted-foreground">Release to instantly open and edit</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header />

      {/* Editor Formatting Toolbar (visible for split & editor-only modes) */}
      {viewMode !== "preview-only" && <EditorToolbar />}

      {/* Main Workspace Area */}
      <main className="relative flex-1 w-full overflow-hidden">
        {viewMode === "split" && (
          <ResizablePanelGroup orientation="horizontal" className="h-full w-full">
            {/* Raw Markdown Editor Pane */}
            <ResizablePanel defaultSize={50} minSize={25}>
              <RawMarkdownEditor />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Live Interactive Editable Preview Pane */}
            <ResizablePanel defaultSize={50} minSize={25}>
              <EditablePreview />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        {viewMode === "editor-only" && (
          <div className="h-full w-full">
            <RawMarkdownEditor />
          </div>
        )}

        {viewMode === "preview-only" && (
          <div className="h-full w-full">
            <EditablePreview />
          </div>
        )}
      </main>

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* File Attachment Modal Dialog */}
      <FileAttachmentModal />
    </div>
  );
};
