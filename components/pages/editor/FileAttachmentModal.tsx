"use client";

import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloudIcon, SparklesIcon, CheckCircle2Icon, FolderOpenIcon, AlertCircleIcon } from "lucide-react";
import { useEditorContext } from "@/context/EditorContext";
import { SAMPLE_DOCUMENTS } from "@/lib/markdown-utils";

export const FileAttachmentModal: React.FC = () => {
  const { isAttachmentModalOpen, setIsAttachmentModalOpen, loadFile, loadSample } = useEditorContext();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.name.match(/\.(md|markdown|txt|mdown|mkd)$/i)) {
      setErrorMsg("Please upload a valid Markdown file (.md, .markdown, or .txt)");
      return;
    }

    const success = await loadFile(file);
    if (success) {
      setSuccessFile(file.name);
      setTimeout(() => {
        setSuccessFile(null);
        setIsAttachmentModalOpen(false);
      }, 700);
    } else {
      setErrorMsg("Failed to read the selected file. Please try again.");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sampleId: string) => {
    loadSample(sampleId);
    setIsAttachmentModalOpen(false);
  };

  return (
    <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FolderOpenIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Attach or Import Markdown File</DialogTitle>
              <DialogDescription className="text-xs">Upload your local .md document or select a preset template</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Hidden File Input */}
        <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt,.mdown" className="hidden" onChange={handleFileInputChange} />

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          {successFile ?
            <div className="flex flex-col items-center gap-2 text-emerald-500 animate-in zoom-in-90 duration-200">
              <CheckCircle2Icon className="size-12" />
              <p className="font-semibold text-sm">Loaded {successFile} successfully!</p>
            </div>
          : <div className="flex flex-col items-center gap-3">
              <div className="size-14 rounded-3xl bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                <UploadCloudIcon className="size-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Click to browse or drag & drop your <span className="text-primary font-mono">.md</span> file
                </p>
                <p className="text-xs text-muted-foreground">Supports Markdown (.md, .markdown) and plain text (.txt)</p>
              </div>
              <div className="flex gap-2 pt-1">
                <Badge variant="outline" className="text-[11px] font-mono">
                  .md
                </Badge>
                <Badge variant="outline" className="text-[11px] font-mono">
                  .markdown
                </Badge>
                <Badge variant="outline" className="text-[11px] font-mono">
                  .txt
                </Badge>
              </div>
            </div>
          }
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preset Sample Templates */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Or Load a Preset Template</h4>
            <Badge variant="secondary" className="text-[10px]">
              Ready to edit
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <Card
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className="cursor-pointer border-border/70 hover:border-primary/60 hover:bg-muted/40 transition-all rounded-2xl group shadow-none"
              >
                <CardContent className="p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-medium text-xs group-hover:text-primary">
                    <SparklesIcon className="size-3.5 text-primary shrink-0" />
                    <span className="truncate">{sample.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{sample.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsAttachmentModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
