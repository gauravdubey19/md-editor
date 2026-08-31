"use client";

import React from "react";
import { useEditorContext } from "@/context/EditorContext";
import { FileTextIcon, ClockIcon, HashIcon, LayersIcon } from "lucide-react";

export const StatusBar: React.FC = () => {
  const { stats, cursorPosition, isDirty, syncSource } = useEditorContext();

  const getSyncLabel = () => {
    if (syncSource === "preview") return "Preview Synced";
    if (syncSource === "raw") return "Source Synced";
    if (isDirty) return "Unsaved Changes";
    return "Synced";
  };

  return (
    <footer className="w-full border-t border-border/80 bg-background/95 backdrop-blur-xs px-3 sm:px-4 py-1.5 flex items-center justify-between gap-3 text-[11px] text-muted-foreground select-none shrink-0">
      {/* Document Metrics */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          <FileTextIcon className="size-3 text-primary" />
          <span>
            <strong className="text-foreground font-mono">{stats.words}</strong> words
          </span>
        </div>

        <div className="flex items-center gap-1">
          <HashIcon className="size-3 text-muted-foreground/70" />
          <span>
            <strong className="text-foreground font-mono">{stats.characters}</strong> chars
          </span>
        </div>

        <div className="flex items-center gap-1">
          <LayersIcon className="size-3 text-muted-foreground/70" />
          <span>
            <strong className="text-foreground font-mono">{stats.lines}</strong> lines
          </span>
        </div>

        <div className="items-center gap-1 hidden md:flex">
          <ClockIcon className="size-3 text-muted-foreground/70" />
          <span>
            ~<strong className="text-foreground font-mono">{stats.readingTimeMinutes}</strong> min read
          </span>
        </div>
      </div>

      {/* Editor State & Position */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Cursor position */}
        <div className="font-mono text-[11px] hidden sm:block">
          Ln <span className="text-foreground font-semibold">{cursorPosition.line}</span>, Col{" "}
          <span className="text-foreground font-semibold">{cursorPosition.column}</span>
        </div>

        {/* Sync Status indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
          <span className="font-medium text-foreground">{getSyncLabel()}</span>
        </div>
      </div>
    </footer>
  );
};
