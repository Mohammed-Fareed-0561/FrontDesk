"use client";

import { useServerStatus } from "@/providers/ServerStatusProvider";
import { WifiOff, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ServerStatusBanner() {
  const { status, retry } = useServerStatus();

  if (status === "connected") return null;

  const isChecking = status === "checking";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2 text-xs font-medium",
        "border-b transition-colors duration-300",
        isChecking
          ? "bg-muted/60 text-muted-foreground border-border"
          : "bg-destructive/10 text-destructive border-destructive/20"
      )}
    >
      <div className="flex items-center gap-2">
        {isChecking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
        ) : (
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>
          {isChecking
            ? "Connecting to server…"
            : "Server unreachable — some features may be unavailable."}
        </span>
      </div>

      {!isChecking && (
        <Button
          variant="ghost"
          size="sm"
          onClick={retry}
          className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
}