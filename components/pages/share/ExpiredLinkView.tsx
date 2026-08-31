"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClockIcon, FilePlusIcon, HomeIcon, ShieldAlertIcon } from "lucide-react";

export const ExpiredLinkView: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md p-8 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-md shadow-lg text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto size-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-xs">
          <ClockIcon className="size-8 animate-pulse" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">This Share Link Has Expired</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The shared markdown context you are trying to access has reached its configured expiration time (TTL) and is no longer available.
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
          <ShieldAlertIcon className="size-3.5 text-amber-500 shrink-0" />
          <span>Automated security TTL policy enforced</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full gap-1.5 shadow-xs">
              <FilePlusIcon className="size-3.5" />
              <span>Create New Document</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <HomeIcon className="size-3.5" />
              <span>Return to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
