"use client";

import React, { useState, useEffect } from "react";
import { EditorProvider, useEditorContext } from "@/context/EditorContext";
import { MainPage } from "@/components/pages/editor/MainPage";
import { ShareModal } from "@/components/pages/share/ShareModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, GitForkIcon, Share2Icon, EyeIcon } from "lucide-react";
import type { SharedContextPayload } from "@/lib/services/share-service";

interface SharedEditorInnerProps {
  contextData: SharedContextPayload;
}

const SharedEditorInner: React.FC<SharedEditorInnerProps> = ({ contextData }) => {
  const { isDirty, setIsShareModalOpen } = useEditorContext();

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateRemaining = () => {
      const diff = new Date(contextData.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes % 60}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [contextData.expiresAt]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Context Share Banner */}
      <div className="w-full bg-primary/10 border-b border-primary/20 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] h-5 gap-1 bg-background/80 border-primary/30 text-primary font-medium">
            <EyeIcon className="size-3" />
            <span>Shared Context</span>
          </Badge>

          <span className="text-muted-foreground hidden sm:inline-block">
            {isDirty ?
              <span className="text-amber-500 font-medium flex items-center gap-1">
                <GitForkIcon className="size-3" />
                <span>Editing a local copy (forked)</span>
              </span>
            : <span>Viewing snapshot from original author</span>}
          </span>

          {timeLeft && (
            <Badge variant="secondary" className="text-[10px] h-5 gap-1 font-mono text-muted-foreground">
              <ClockIcon className="size-3 text-amber-500" />
              <span>Expires in {timeLeft}</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="xs" variant="default" onClick={() => setIsShareModalOpen(true)} className="h-6 text-[11px] gap-1 shadow-xs font-medium">
            <Share2Icon className="size-3" />
            <span>{isDirty ? "Share Forked Version" : "Re-share Context"}</span>
          </Button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-hidden">
        <MainPage />
      </div>

      {/* Share Modal Dialog */}
      <ShareModal />
    </div>
  );
};

export const SharedEditorWrapper: React.FC<{
  contextData: SharedContextPayload;
}> = ({ contextData }) => {
  return (
    <EditorProvider
      initialMarkdown={contextData.markdown}
      initialFileName={contextData.title}
      initialParentToken={contextData.shareToken}
      initialExpiresAt={contextData.expiresAt}
    >
      <SharedEditorInner contextData={contextData} />
    </EditorProvider>
  );
};
