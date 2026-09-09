import { z } from "zod";

// Security: sanitize CSS string values to prevent injection
function sanitizeCssValue(value: string): string {
  // Strip potentially dangerous characters: <, >, javascript:, expression(, url(
  return value
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/expression\(/gi, "")
    .replace(/url\(/gi, "")
    .trim();
}

// Maximum theme payload size (10KB)
const MAX_THEME_SIZE = 10240;

// Color token schema — hex only for safety
const colorTokenSchema = z.object({
  value: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
  name: z.string().max(50).optional(),
});

// Typography token schema
const typographyTokenSchema = z.object({
  fontFamily: z.string().max(200).transform(sanitizeCssValue).default('"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'),
  headingFontFamily: z.string().max(200).transform(sanitizeCssValue).optional(),
  baseFontSize: z.string().max(20).transform(sanitizeCssValue).default("0.9375rem"),
  headingWeight: z.string().max(10).transform(sanitizeCssValue).default("700"),
  bodyWeight: z.string().max(10).transform(sanitizeCssValue).default("400"),
  lineHeight: z.string().max(20).transform(sanitizeCssValue).default("1.5rem"),
});

// Spacing token schema
const spacingTokenSchema = z.object({
  unit: z.string().max(20).transform(sanitizeCssValue).default("4px"),
  scale: z.object({
    xs: z.string().max(20).transform(sanitizeCssValue).optional(),
    sm: z.string().max(20).transform(sanitizeCssValue).optional(),
    md: z.string().max(20).transform(sanitizeCssValue).optional(),
    lg: z.string().max(20).transform(sanitizeCssValue).optional(),
    xl: z.string().max(20).transform(sanitizeCssValue).optional(),
    "2xl": z.string().max(20).transform(sanitizeCssValue).optional(),
  }).optional(),
});

// Border radius token schema
const radiusTokenSchema = z.object({
  sm: z.string().max(50).transform(sanitizeCssValue).default("calc(var(--radius) - 4px)"),
  md: z.string().max(50).transform(sanitizeCssValue).default("calc(var(--radius) - 2px)"),
  lg: z.string().max(50).transform(sanitizeCssValue).default("var(--radius)"),
  xl: z.string().max(50).transform(sanitizeCssValue).optional(),
  "2xl": z.string().max(50).transform(sanitizeCssValue).optional(),
  full: z.string().max(50).transform(sanitizeCssValue).optional(),
});

// Shadow token schema
const shadowTokenSchema = z.object({
  sm: z.string().max(200).transform(sanitizeCssValue).default("0 1px 2px 0 rgb(0 0 0 / 0.05)"),
  md: z.string().max(200).transform(sanitizeCssValue).default("0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"),
  lg: z.string().max(200).transform(sanitizeCssValue).default("0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"),
});

// Button style schema
const buttonTokenSchema = z.object({
  radius: z.string().max(50).transform(sanitizeCssValue).default("var(--radius)"),
  fontWeight: z.string().max(10).transform(sanitizeCssValue).default("500"),
  style: z.enum(["solid", "outline", "ghost"]).default("solid"),
});

// Complete theme schema
export const themeConfigSchema = z.object({
  colors: z.object({
    primary: colorTokenSchema.default({ value: "#1e293b" }),
    secondary: colorTokenSchema.default({ value: "#64748b" }),
    background: colorTokenSchema.default({ value: "#ffffff" }),
    surface: colorTokenSchema.default({ value: "#f8fafc" }),
    text: colorTokenSchema.default({ value: "#1e293b" }),
    muted: colorTokenSchema.default({ value: "#94a3b8" }),
    border: colorTokenSchema.default({ value: "#e2e8f0" }),
    success: colorTokenSchema.default({ value: "#16a34a" }),
    warning: colorTokenSchema.default({ value: "#d97706" }),
    danger: colorTokenSchema.default({ value: "#dc2626" }),
  }).default({}),
  typography: typographyTokenSchema.default({}),
  spacing: spacingTokenSchema.default({}),
  radius: radiusTokenSchema.default({}),
  shadows: shadowTokenSchema.default({}),
  buttons: buttonTokenSchema.default({}),
  components: z.record(z.any()).optional(),
}).refine(
  (data) => JSON.stringify(data).length <= MAX_THEME_SIZE,
  { message: `Theme configuration exceeds maximum size of ${MAX_THEME_SIZE} bytes` }
);

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

// Default theme that matches the existing design system
export const defaultTheme: ThemeConfig = {
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
  spacing: {
    unit: "4px",
    scale: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
      "2xl": "48px",
    },
  },
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

// Helper function to get theme config with defaults
export function getThemeConfig(themeConfig?: string | null): ThemeConfig {
  if (!themeConfig) {
    return defaultTheme;
  }
  try {
    const parsed = JSON.parse(themeConfig);
    const validated = themeConfigSchema.parse(parsed);
    return validated;
  } catch {
    return defaultTheme;
  }
}

// Helper function to validate theme config
export function validateThemeConfig(themeConfig: unknown): { success: boolean; data?: ThemeConfig; error?: string } {
  try {
    const validated = themeConfigSchema.parse(themeConfig);
    return { success: true, data: validated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}