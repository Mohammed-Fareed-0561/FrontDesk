"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

interface TooltipProps {
  children: React.ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  return <div className="relative group/tooltip inline-flex">{children}</div>;
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, asChild, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("inline-flex", className)} {...props}>
        {children}
      </div>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
}

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, side = "right", className, ...props }, ref) => {
    const sideStyles = {
      top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
      right: "left-full ml-2 top-1/2 -translate-y-1/2",
      bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
      left: "right-full mr-2 top-1/2 -translate-y-1/2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-none absolute z-50 hidden rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border group-hover/tooltip:block whitespace-nowrap animate-in fade-in-0 zoom-in-95",
          sideStyles[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";
