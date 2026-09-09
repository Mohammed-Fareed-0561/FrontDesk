"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Monitor,
  Save,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Check,
  Loader2,
  Globe,
} from "lucide-react";
import type { DeviceMode } from "@/lib/designer/types";

interface DesignerTopBarProps {
  websiteName: string;
  saving: boolean;
  saved: boolean;
  hasUnsavedChanges: boolean;
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  onPreview: () => void;
  onSave: () => void;
  onPublish: () => void;
}

export function DesignerTopBar({
  websiteName,
  saving,
  saved,
  hasUnsavedChanges,
  device,
  onDeviceChange,
  onPreview,
  onSave,
  onPublish,
}: DesignerTopBarProps) {
  return (
    <div className="flex h-14 items-center gap-4 border-b bg-white px-4">
      {/* Left: Brand + Website name */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">
          FrontDesk
        </span>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
          {websiteName}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          {saving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </>
          ) : saved ? (
            <>
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Saved</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Unsaved changes
            </>
          ) : null}
        </span>
      </div>

      {/* Center: Device switcher */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
          {([
            { mode: "desktop" as const, icon: Monitor, label: "Desktop" },
            { mode: "tablet" as const, icon: Tablet, label: "Tablet" },
            { mode: "mobile" as const, icon: Smartphone, label: "Mobile" },
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDeviceChange(mode)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                device === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={label}
              aria-pressed={device === mode}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          aria-label="Preview website"
        >
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          Preview
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || !hasUnsavedChanges}
          aria-label="Save changes"
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          Save
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={onPublish}
          aria-label="Publish website"
        >
          <Globe className="mr-1.5 h-3.5 w-3.5" />
          Publish
        </Button>
      </div>
    </div>
  );
}
