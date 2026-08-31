"use client";

import React, { useState } from "react";
import { useEditorContext } from "@/context/EditorContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileTextIcon,
  UploadCloudIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  PlusIcon,
  ColumnsIcon,
  FileCodeIcon,
  EyeIcon,
  SunIcon,
  MoonIcon,
  Wand2Icon,
  SparklesIcon,
  FileDownIcon,
  FileCheckIcon,
  Edit2Icon,
  ArrowUpDownIcon,
  Share2Icon,
} from "lucide-react";
import { SAMPLE_DOCUMENTS } from "@/lib/markdown-utils";

export const Header: React.FC = () => {
  const {
    fileName,
    setFileName,
    isDirty,
    viewMode,
    setViewMode,
    theme,
    toggleTheme,
    isSyncScrollEnabled,
    toggleSyncScroll,
    setIsAttachmentModalOpen,
    setIsShareModalOpen,
    createNewFile,
    downloadMarkdown,
    downloadHtml,
    copyMarkdown,
    copyHtml,
    formatDocument,
    loadSample,
  } = useEditorContext();

  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const handleCopyMd = async () => {
    const success = await copyMarkdown();
    if (success) {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

  const handleCopyHtml = async () => {
    const success = await copyHtml();
    if (success) {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3">
      {/* Brand & File Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <FileTextIcon className="size-4.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight hidden md:inline-block">Markdown Studio</span>
        </div>

        <div className="h-4 w-px bg-border hidden md:block" />

        {/* File Name Pill */}
        <div className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted/90 transition-colors border border-border/60 rounded-2xl px-2.5 py-1">
          {isEditingName ?
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className="h-6 w-36 sm:w-44 text-xs font-mono px-1.5 py-0 border-none bg-transparent focus-visible:ring-1"
            />
          : <div onClick={() => setIsEditingName(true)} className="flex items-center gap-1.5 cursor-pointer max-w-37.5 sm:max-w-55">
              <span className="text-xs font-mono font-medium truncate text-foreground">{fileName}</span>
              <Edit2Icon className="size-3 text-muted-foreground hover:text-foreground opacity-60" />
            </div>
          }

          <Badge
            variant={isDirty ? "outline" : "secondary"}
            className={`text-[10px] h-4 px-1.5 font-normal tracking-wide transition-colors ${
              isDirty ? "border-amber-500/50 text-amber-500" : "text-emerald-500 dark:text-emerald-400"
            }`}
          >
            {isDirty ? "Unsaved" : "Synced"}
          </Badge>
        </div>
      </div>

      {/* Center / Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Prominent Attach .md File Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAttachmentModalOpen(true)}
                className="shadow-xs font-medium gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              />
            }
          >
            <UploadCloudIcon className="size-3.5" />
            <span>Attach .md File</span>
          </TooltipTrigger>
          <TooltipContent>Import local Markdown or text file</TooltipContent>
        </Tooltip>

        {/* Share Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsShareModalOpen(true)}
                className="text-xs gap-1.5 font-medium shadow-xs border border-primary/20 hover:border-primary/40 text-primary"
              />
            }
          >
            <Share2Icon className="size-3.5" />
            <span>Share</span>
          </TooltipTrigger>
          <TooltipContent>Generate time-limited, secure share link with custom TTL</TooltipContent>
        </Tooltip>

        {/* New Document Button */}
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="sm" onClick={() => createNewFile()} className="text-xs gap-1" />}>
            <PlusIcon className="size-3.5" />
            <span className="hidden sm:inline">New</span>
          </TooltipTrigger>
          <TooltipContent>Create blank markdown file</TooltipContent>
        </Tooltip>

        {/* Templates Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="text-xs gap-1" />}>
            <SparklesIcon className="size-3.5 text-amber-500" />
            <span className="hidden sm:inline">Templates</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Sample Templates</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {SAMPLE_DOCUMENTS.map((sample) => (
              <DropdownMenuItem key={sample.id} onClick={() => loadSample(sample.id)} className="flex flex-col items-start gap-0.5">
                <div className="font-medium text-xs text-foreground">{sample.title}</div>
                <span className="text-[10px] text-muted-foreground line-clamp-1">{sample.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Prettify / Format */}
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="sm" onClick={formatDocument} className="text-xs gap-1" />}>
            <Wand2Icon className="size-3.5 text-indigo-400" />
            <span className="hidden md:inline">Format</span>
          </TooltipTrigger>
          <TooltipContent>Format and clean markdown spacing</TooltipContent>
        </Tooltip>

        {/* Sync Scroll Toggle Button */}
        {viewMode === "split" && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={isSyncScrollEnabled ? "secondary" : "outline"}
                  size="sm"
                  onClick={toggleSyncScroll}
                  className={`text-xs gap-1.5 transition-all ${
                    isSyncScrollEnabled ? "text-primary font-medium" : "text-muted-foreground opacity-60"
                  }`}
                />
              }
            >
              <ArrowUpDownIcon className="size-3.5" />
              <span className="hidden lg:inline">{isSyncScrollEnabled ? "Sync Scroll On" : "Sync Scroll Off"}</span>
            </TooltipTrigger>
            <TooltipContent>
              {isSyncScrollEnabled ? "Synchronized scrolling enabled (click to disable)" : "Synchronized scrolling disabled (click to enable)"}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Export / Download Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="text-xs gap-1.5" />}>
            <DownloadIcon className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Download Files</DropdownMenuLabel>
            <DropdownMenuItem onClick={downloadMarkdown}>
              <FileDownIcon className="size-4 mr-2 text-primary" />
              <span>Download .md</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadHtml}>
              <FileCodeIcon className="size-4 mr-2 text-sky-500" />
              <span>Download .html</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Copy to Clipboard</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleCopyMd}>
              {copiedMd ?
                <CheckIcon className="size-4 mr-2 text-emerald-500" />
              : <CopyIcon className="size-4 mr-2" />}
              <span>{copiedMd ? "Copied MD!" : "Copy Markdown"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyHtml}>
              {copiedHtml ?
                <FileCheckIcon className="size-4 mr-2 text-emerald-500" />
              : <CopyIcon className="size-4 mr-2" />}
              <span>{copiedHtml ? "Copied HTML!" : "Copy HTML"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* View Mode Controls */}
        <div className="flex items-center bg-muted/60 p-0.5 rounded-2xl border border-border/60">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={viewMode === "split" ? "secondary" : "ghost"}
                  size="icon-xs"
                  onClick={() => setViewMode("split")}
                  className={`size-7 rounded-xl ${viewMode === "split" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                />
              }
            >
              <ColumnsIcon className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Split View (Editor + Live Preview)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={viewMode === "editor-only" ? "secondary" : "ghost"}
                  size="icon-xs"
                  onClick={() => setViewMode("editor-only")}
                  className={`size-7 rounded-xl ${viewMode === "editor-only" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                />
              }
            >
              <FileCodeIcon className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Source Markdown Editor Only</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant={viewMode === "preview-only" ? "secondary" : "ghost"}
                  size="icon-xs"
                  onClick={() => setViewMode("preview-only")}
                  className={`size-7 rounded-xl ${viewMode === "preview-only" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"}`}
                />
              }
            >
              <EyeIcon className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Interactive Live Preview Only</TooltipContent>
          </Tooltip>
        </div>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
              />
            }
          >
            {theme === "dark" ?
              <SunIcon className="size-4 text-amber-400" />
            : <MoonIcon className="size-4 text-sky-400" />}
          </TooltipTrigger>
          <TooltipContent>Toggle Light/Dark Theme</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
};
