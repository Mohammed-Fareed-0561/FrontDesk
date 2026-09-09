"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Palette, Save, Check } from "lucide-react";
import type { WebsiteTheme } from "@/providers/ThemeProvider";

const defaultTheme: WebsiteTheme = {
  colors: {
    primary: { value: "#1e293b" },
    secondary: { value: "#64748b" },
    background: { value: "#ffffff" },
    surface: { value: "#f8fafc" },
    text: { value: "#1e293b" },
    muted: { value: "#94a3b8" },
    border: { value: "#e2e8f0" },
    success: { value: "#16a34a" },
    warning: { value: "#d97706" },
    danger: { value: "#dc2626" },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    baseFontSize: "0.9375rem",
    headingWeight: "700",
    bodyWeight: "400",
    lineHeight: "1.5rem",
  },
  spacing: { unit: "4px" },
  radius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  buttons: {
    radius: "var(--radius)",
    fontWeight: "500",
    style: "solid",
  },
};

function parseThemeConfig(raw: string | null): WebsiteTheme {
  if (!raw) return defaultTheme;
  try {
    const parsed = JSON.parse(raw);
    return {
      colors: { ...defaultTheme.colors, ...parsed.colors },
      typography: { ...defaultTheme.typography, ...parsed.typography },
      spacing: { ...defaultTheme.spacing, ...parsed.spacing },
      radius: { ...defaultTheme.radius, ...parsed.radius },
      shadows: { ...defaultTheme.shadows, ...parsed.shadows },
      buttons: { ...defaultTheme.buttons, ...parsed.buttons },
    };
  } catch {
    return defaultTheme;
  }
}

interface ThemeEditorProps {
  themeConfig: string | null;
  onSave: (theme: WebsiteTheme) => Promise<void>;
}

export function ThemeEditor({ themeConfig, onSave }: ThemeEditorProps) {
  const [theme, setTheme] = useState<WebsiteTheme>(() => parseThemeConfig(themeConfig));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateColor = (key: keyof typeof theme.colors, value: string) => {
    setTheme((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: { value } },
    }));
    setSaved(false);
  };

  const updateTypography = (key: keyof typeof theme.typography, value: string) => {
    setTheme((prev) => ({
      ...prev,
      typography: { ...prev.typography, [key]: value },
    }));
    setSaved(false);
  };

  const updateRadius = (key: keyof typeof theme.radius, value: string) => {
    setTheme((prev) => ({
      ...prev,
      radius: { ...prev.radius, [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(theme);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </CardTitle>
            <CardDescription>Customize your website appearance.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="flex items-center gap-1 text-sm text-green-600"><Check className="h-4 w-4" />Saved</span>}
            <Button size="sm" onClick={handleSave} disabled={saving} aria-label="Save theme">
              <Save className="mr-1 h-3 w-3" />{saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Colors */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Colors</Label>
          {(["primary", "secondary", "background", "surface", "text", "muted", "border", "success", "warning", "danger"] as const).map((key) => (
            <div key={key} className="flex items-center gap-2">
              <Label htmlFor={`color-${key}`} className="w-20 text-xs capitalize">{key}</Label>
              <input
                id={`color-${key}`}
                type="color"
                value={theme.colors[key].value}
                onChange={(e) => updateColor(key, e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
                aria-label={`${key} color`}
              />
              <Input
                value={theme.colors[key].value}
                onChange={(e) => updateColor(key, e.target.value)}
                className="h-8 flex-1 font-mono text-xs"
                placeholder="#000000"
                aria-label={`${key} hex value`}
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Typography */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Typography</Label>
          <div className="space-y-2">
            <Label htmlFor="font-family" className="text-xs">Font family</Label>
            <Input
              id="font-family"
              value={theme.typography.fontFamily}
              onChange={(e) => updateTypography("fontFamily", e.target.value)}
              aria-label="Font family"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="base-font-size" className="text-xs">Base size</Label>
              <Input
                id="base-font-size"
                value={theme.typography.baseFontSize}
                onChange={(e) => updateTypography("baseFontSize", e.target.value)}
                aria-label="Base font size"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="heading-weight" className="text-xs">Heading weight</Label>
              <Input
                id="heading-weight"
                value={theme.typography.headingWeight}
                onChange={(e) => updateTypography("headingWeight", e.target.value)}
                aria-label="Heading weight"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Border Radius */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Border Radius</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["sm", "md", "lg"] as const).map((key) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`radius-${key}`} className="text-xs uppercase">{key}</Label>
                <Input
                  id={`radius-${key}`}
                  value={theme.radius[key]}
                  onChange={(e) => updateRadius(key, e.target.value)}
                  aria-label={`${key} radius`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
