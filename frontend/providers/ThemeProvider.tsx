"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

export interface ThemeColors {
  primary: { value: string };
  secondary: { value: string };
  background: { value: string };
  surface: { value: string };
  text: { value: string };
  muted: { value: string };
  border: { value: string };
  success: { value: string };
  warning: { value: string };
  danger: { value: string };
}

export interface ThemeTypography {
  fontFamily: string;
  headingFontFamily?: string;
  baseFontSize: string;
  headingWeight: string;
  bodyWeight: string;
  lineHeight: string;
}

export interface ThemeRadius {
  sm: string;
  md: string;
  lg: string;
  xl?: string;
  "2xl"?: string;
  full?: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeButtons {
  radius: string;
  fontWeight: string;
  style: "solid" | "outline" | "ghost";
}

export interface WebsiteTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: { unit: string; scale?: Record<string, string> };
  radius: ThemeRadius;
  shadows: ThemeShadows;
  buttons: ThemeButtons;
}

interface ThemeContextValue {
  theme: WebsiteTheme;
  cssVariables: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) return null;
  return context;
}

function themeToCssVariables(theme: WebsiteTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  // Colors
  vars["--fd-color-primary"] = theme.colors.primary.value;
  vars["--fd-color-secondary"] = theme.colors.secondary.value;
  vars["--fd-color-background"] = theme.colors.background.value;
  vars["--fd-color-surface"] = theme.colors.surface.value;
  vars["--fd-color-text"] = theme.colors.text.value;
  vars["--fd-color-muted"] = theme.colors.muted.value;
  vars["--fd-color-border"] = theme.colors.border.value;
  vars["--fd-color-success"] = theme.colors.success.value;
  vars["--fd-color-warning"] = theme.colors.warning.value;
  vars["--fd-color-danger"] = theme.colors.danger.value;
  // Typography
  vars["--fd-font-family"] = theme.typography.fontFamily;
  if (theme.typography.headingFontFamily) {
    vars["--fd-font-family-heading"] = theme.typography.headingFontFamily;
  }
  vars["--fd-font-size-base"] = theme.typography.baseFontSize;
  vars["--fd-font-weight-heading"] = theme.typography.headingWeight;
  vars["--fd-font-weight-body"] = theme.typography.bodyWeight;
  vars["--fd-line-height"] = theme.typography.lineHeight;
  // Spacing
  vars["--fd-spacing-unit"] = theme.spacing.unit;
  // Radius
  vars["--fd-radius-sm"] = theme.radius.sm;
  vars["--fd-radius-md"] = theme.radius.md;
  vars["--fd-radius-lg"] = theme.radius.lg;
  // Shadows
  vars["--fd-shadow-sm"] = theme.shadows.sm;
  vars["--fd-shadow-md"] = theme.shadows.md;
  vars["--fd-shadow-lg"] = theme.shadows.lg;
  // Buttons
  vars["--fd-button-radius"] = theme.buttons.radius;
  vars["--fd-button-font-weight"] = theme.buttons.fontWeight;
  return vars;
}

export function ThemeProvider({ theme, children }: { theme: WebsiteTheme; children: ReactNode }) {
  const cssVariables = useMemo(() => themeToCssVariables(theme), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(cssVariables)) {
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(cssVariables)) {
        root.style.removeProperty(key);
      }
    };
  }, [cssVariables]);

  return (
    <ThemeContext.Provider value={{ theme, cssVariables }}>
      {children}
    </ThemeContext.Provider>
  );
}
