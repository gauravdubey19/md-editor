"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Share2Icon,
  CopyIcon,
  CheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  SparklesIcon,
  GitForkIcon,
  Loader2Icon,
  ShieldCheckIcon,
  FileTextIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  TimerIcon,
  LockIcon,
} from "lucide-react";
import { useEditorContext } from "@/context/EditorContext";

interface TTLPreset {
  label: string;
  seconds: number;
  badge: string;
  description: string;
}

const TTL_PRESETS: TTLPreset[] = [
  { label: "5 min", seconds: 5 * 60, badge: "Ephemeral", description: "Quick one-time share" },
  { label: "10 min", seconds: 10 * 60, badge: "Quick", description: "Short review session" },
  { label: "30 min", seconds: 30 * 60, badge: "Meeting", description: "Standard live sync" },
  { label: "1 hour", seconds: 60 * 60, badge: "Standard", description: "1-Hour collaboration" },
  { label: "5 hours", seconds: 5 * 60 * 60, badge: "Half-day", description: "Extended workspace" },
  { label: "24 hours", seconds: 24 * 60 * 60, badge: "1 Day", description: "Full-day access link" },
];

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setIsShareModalOpen, markdown, fileName, stats, theme, parentShareToken } = useEditorContext();

  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [selectedTtl, setSelectedTtl] = useState<number>(60 * 60); // Default 1 hour
  const [customValue, setCustomValue] = useState<string>("2");
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours" | "days">("hours");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedExpiresAt, setGeneratedExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [baseTime, setBaseTime] = useState<number>(() => Date.now());

  // Periodically refresh reference clock for human-readable preview
  useEffect(() => {
    const timer = setInterval(() => {
      setBaseTime(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Effective TTL calculation
  const effectiveTtlSeconds = useMemo((): number => {
    if (activeTab === "preset") {
      return selectedTtl;
    }
    const val = Math.max(1, parseFloat(customValue) || 1);
    if (customUnit === "minutes") return Math.round(val * 60);
    if (customUnit === "hours") return Math.round(val * 3600);
    if (customUnit === "days") return Math.round(val * 86400);
    return 3600;
  }, [activeTab, selectedTtl, customValue, customUnit]);

  // Human readable expiry preview string
  const formattedExpiryTime = useMemo((): string => {
    const targetDate = new Date(baseTime + effectiveTtlSeconds * 1000);
    const currentDate = new Date(baseTime);
    const isToday = currentDate.toDateString() === targetDate.toDateString();
    const tomorrow = new Date(baseTime + 86400000);
    const isTomorrow = tomorrow.toDateString() === targetDate.toDateString();

    const timeStr = targetDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return `${targetDate.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
  }, [baseTime, effectiveTtlSeconds]);

  const handleGenerateShareLink = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fileName || "Untitled.md",
          markdown,
          metadata: {
            wordCount: stats.words,
            charCount: stats.characters,
            lineCount: stats.lines,
            readTimeMinutes: stats.readingTimeMinutes,
            theme,
          },
          ttlSeconds: effectiveTtlSeconds,
          parentToken: parentShareToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate share link.");
      }

      setGeneratedUrl(data.shareUrl);
      setGeneratedExpiresAt(data.expiresAt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create share link.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareNative = async () => {
    if (!generatedUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: fileName || "Markdown Context",
          text: `View shared markdown context: ${fileName}`,
          url: generatedUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      await handleCopy();
    }
  };

  const resetAndClose = () => {
    setIsShareModalOpen(false);
    setTimeout(() => {
      setGeneratedUrl(null);
      setGeneratedExpiresAt(null);
      setErrorMessage(null);
      setActiveTab("preset");
      setSelectedTtl(60 * 60);
    }, 200);
  };

  return (
    <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
      <DialogContent className="sm:max-w-125 p-0 overflow-hidden bg-card text-card-foreground border-border/80 shadow-2xl rounded-3xl gap-0">
        {/* Header with gradient accent */}
        <div className="relative p-5 pb-4 bg-muted/30 border-b border-border/60">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center border border-primary/25 shadow-xs shrink-0">
                <Share2Icon className="size-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <span>Share Context</span>
                  <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 font-normal border-primary/30 text-primary bg-primary/5">
                    Time-Limited (TTL)
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Generate an encrypted, immutable snapshot URL.
                </DialogDescription>
              </div>
            </div>

            {/* Document Context Chip */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-background/80 border border-border/60 text-xs font-mono">
                <FileTextIcon className="size-3 text-muted-foreground" />
                <span className="font-medium text-foreground truncate max-w-45">{fileName || "Untitled.md"}</span>
                <span className="text-muted-foreground text-[10px]">• {stats.words} words</span>
              </div>

              {parentShareToken && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                  <GitForkIcon className="size-3" />
                  <span>Forked snapshot</span>
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {!generatedUrl ?
            <>
              {/* Duration Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ClockIcon className="size-3.5 text-primary" />
                    <span>Choose Duration (TTL)</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <TimerIcon className="size-3 text-amber-500" />
                    <span>Auto-expires</span>
                  </span>
                </div>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "preset" | "custom")} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full h-8 bg-muted/60 p-0.5 rounded-xl border border-border/60">
                    <TabsTrigger
                      value="preset"
                      className="text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                    >
                      Presets
                    </TabsTrigger>
                    <TabsTrigger
                      value="custom"
                      className="text-xs font-medium rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
                    >
                      Custom Duration
                    </TabsTrigger>
                  </TabsList>

                  {/* Preset Grid (3x2) */}
                  <TabsContent value="preset" className="mt-3">
                    <div className="grid grid-cols-3 gap-2">
                      {TTL_PRESETS.map((preset) => {
                        const isSelected = activeTab === "preset" && selectedTtl === preset.seconds;
                        return (
                          <button
                            key={preset.seconds}
                            type="button"
                            onClick={() => setSelectedTtl(preset.seconds)}
                            className={`group relative flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                              isSelected ?
                                "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                              : "border-border/60 hover:border-border bg-muted/20 hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-xs font-bold tracking-tight">{preset.label}</span>
                              {isSelected && <CheckCircle2Icon className="size-3.5 text-primary shrink-0 animate-in zoom-in-50 duration-150" />}
                            </div>
                            <span
                              className={`text-[10px] line-clamp-1 transition-colors ${
                                isSelected ? "text-primary/80 font-medium" : "text-muted-foreground"
                              }`}
                            >
                              {preset.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* Custom Duration Config using shadcn Select */}
                  <TabsContent value="custom" className="mt-3">
                    <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[11px] text-muted-foreground mb-1 block">Amount</label>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            value={customValue}
                            onChange={(e) => setCustomValue(e.target.value)}
                            placeholder="e.g. 2"
                            className="h-8.5 text-xs font-mono bg-background border-border/80"
                          />
                        </div>
                        <div className="w-36">
                          <label className="text-[11px] text-muted-foreground mb-1 block">Unit</label>
                          <Select
                            value={customUnit}
                            onValueChange={(val) => {
                              if (val === "minutes" || val === "hours" || val === "days") {
                                setCustomUnit(val);
                              }
                            }}
                          >
                            <SelectTrigger
                              size="sm"
                              className="w-full h-8.5 rounded-xl border border-border/80 bg-background px-2.5 text-xs text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-xl">
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Dynamic Expiry Calculated Pill */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/5 border border-primary/15 text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ClockIcon className="size-3.5 text-primary" />
                  <span>Calculated Expiration:</span>
                </span>
                <span className="font-semibold text-foreground font-mono text-[11px]">{formattedExpiryTime}</span>
              </div>

              {/* Security & Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-[11px]">
                  <LockIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">Immutable Snapshot</span>
                    <span className="text-muted-foreground text-[10px] leading-tight block">Future workspace edits won&apos;t alter this link.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-[11px]">
                  <ShieldCheckIcon className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">Copy-on-Edit Fork</span>
                    <span className="text-muted-foreground text-[10px] leading-tight block">Recipients can view and fork their own copy.</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">{errorMessage}</div>
              )}

              <Separator className="my-2" />

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={resetAndClose} disabled={isLoading} className="text-xs h-8 rounded-xl">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateShareLink}
                  disabled={isLoading}
                  className="text-xs h-8 px-4 gap-1.5 shadow-sm rounded-xl font-medium"
                >
                  {isLoading ?
                    <>
                      <Loader2Icon className="size-3.5 animate-spin" />
                      <span>Generating Link...</span>
                    </>
                  : <>
                      <SparklesIcon className="size-3.5" />
                      <span>Generate Share Link</span>
                    </>
                  }
                </Button>
              </div>
            </>
          : /* Success State - Generated Link View */
            <div className="space-y-4 animate-in fade-in-0 duration-200">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2Icon className="size-4.5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Share Link Ready!</h4>
                <p className="text-[11px] text-muted-foreground">Anyone with this URL can view and fork your markdown document.</p>
              </div>

              {/* Link Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Share URL</span>
                  {generatedExpiresAt && (
                    <Badge variant="outline" className="text-[10px] h-4.5 font-mono text-amber-500 border-amber-500/30">
                      Expires{" "}
                      {new Date(generatedExpiresAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-border bg-muted/40">
                  <Input readOnly value={generatedUrl} className="h-8 text-xs font-mono border-none bg-transparent focus-visible:ring-0 select-all" />
                  <Button
                    variant={copied ? "secondary" : "default"}
                    size="sm"
                    onClick={handleCopy}
                    className={`h-8 px-3 text-xs gap-1.5 shrink-0 rounded-xl transition-all ${
                      copied ? "bg-emerald-500 text-white hover:bg-emerald-600" : ""
                    }`}
                  >
                    {copied ?
                      <>
                        <CheckIcon className="size-3.5" />
                        <span>Copied!</span>
                      </>
                    : <>
                        <CopyIcon className="size-3.5" />
                        <span>Copy Link</span>
                      </>
                    }
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <a href={generatedUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <span>Open in new tab</span>
                    <ExternalLinkIcon className="size-3" />
                  </a>

                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleShareNative}
                      className="text-[11px] h-6 text-muted-foreground hover:text-foreground"
                    >
                      <Share2Icon className="size-3 mr-1" />
                      <span>Share...</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGeneratedUrl(null);
                      setGeneratedExpiresAt(null);
                    }}
                    className="text-xs h-8 rounded-xl gap-1"
                  >
                    <RefreshCwIcon className="size-3" />
                    <span>Create Another</span>
                  </Button>
                  <Button variant="default" size="sm" onClick={resetAndClose} className="text-xs h-8 px-4 rounded-xl">
                    Done
                  </Button>
                </div>
              </div>
            </div>
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};
