import type { WebsiteComponent, WebsiteSection } from "@/types";
import type { ComponentKind, DeviceMode, ResponsiveConfig, ResponsiveOverride } from "./types";

export function parseObject(value: string | null | undefined): Record<string, any> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function parseArray(value: string | null | undefined): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function ordered<T extends { sortOrder: number; id: string }>(items: T[] | undefined): T[] {
  return [...(items || [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

export function componentLabel(component: WebsiteComponent): string {
  const content = parseObject(component.content);
  return String(content.text || content.label || content.heading || component.componentType);
}

export function classifyComponent(component: WebsiteComponent): ComponentKind {
  const type = component.componentType.toLowerCase();
  if (type === "text" || type === "heading") return "heading";
  if (type === "paragraph") return "paragraph";
  if (type === "image" || type === "photo" || type === "banner") return "image";
  if (type === "gallery" || type === "carousel") return "gallery";
  if (type === "button" || type === "cta" || type === "link") return "button";
  if (type === "services" || type === "service-list") return "services";
  if (type === "products" || type === "product-list") return "products";
  if (type === "booking" || type === "booking-widget") return "booking";
  if (type === "form" || type === "contact-form") return "form";
  if (type === "testimonials" || type === "reviews") return "testimonials";
  if (type === "contact" || type === "contact-info") return "contact";
  if (type.includes("hero")) return "heading";
  if (type.includes("about")) return "paragraph";
  return "unknown";
}

export function toPatch(website: import("@/types").Website) {
  return {
    name: website.name || undefined,
    pages: ordered(website.pages).map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      pageType: page.pageType || undefined,
      sortOrder: page.sortOrder,
      seoConfig: parseObject(page.seoConfig),
      sections: ordered(page.sections).map((section) => ({
        id: section.id,
        sectionType: section.sectionType,
        sortOrder: section.sortOrder,
        content: parseObject(section.content),
        styleConfig: parseObject(section.styleConfig),
        visibilityConfig: parseObject(section.visibilityConfig),
        components: ordered(section.components).map((component) => ({
          id: component.id,
          componentType: component.componentType,
          sortOrder: component.sortOrder,
          props: parseObject(component.props),
          content: parseObject(component.content),
          styleConfig: parseObject(component.styleConfig),
          assetRefs: parseArray(component.assetRefs),
          sourceType: component.sourceType || undefined,
          sourceId: component.sourceId || undefined,
          sourceVersion: component.sourceVersion || undefined,
        })),
      })),
    })),
  };
}

export function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

/* ── Responsive Helpers ────────────────────────────────────── */

export function getResponsiveConfig(styleConfig: string | null | undefined): ResponsiveConfig {
  const parsed = parseObject(styleConfig);
  return parsed.responsive || {};
}

export function setResponsiveConfig(
  styleConfig: string | null | undefined,
  device: Exclude<DeviceMode, "desktop">,
  overrides: Partial<ResponsiveOverride> | null
): string {
  const parsed = parseObject(styleConfig);
  const responsive = parsed.responsive || {};
  if (overrides === null || Object.keys(overrides).length === 0) {
    delete responsive[device];
  } else {
    responsive[device] = overrides;
  }
  parsed.responsive = responsive;
  return JSON.stringify(parsed);
}

export function getResponsiveValue<T extends keyof ResponsiveOverride>(
  responsive: ResponsiveConfig,
  device: DeviceMode,
  property: T,
  defaultValue: ResponsiveOverride[T]
): ResponsiveOverride[T] {
  if (device === "desktop") return defaultValue;
  if (device === "tablet") {
    if (responsive.tablet?.[property] !== undefined) return responsive.tablet[property] as ResponsiveOverride[T];
    return defaultValue;
  }
  if (device === "mobile") {
    if (responsive.mobile?.[property] !== undefined) return responsive.mobile[property] as ResponsiveOverride[T];
    if (responsive.tablet?.[property] !== undefined) return responsive.tablet[property] as ResponsiveOverride[T];
    return defaultValue;
  }
  return defaultValue;
}

export function getEffectiveStyle(
  responsive: ResponsiveConfig,
  device: DeviceMode,
  baseStyle: Record<string, any>
): Record<string, any> {
  if (device === "desktop") return baseStyle;
  const overrides: Record<string, any> = {};
  const tablet = responsive.tablet || {};
  const mobile = responsive.mobile || {};
  const source = device === "mobile" ? { ...tablet, ...mobile } : tablet;
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined && value !== null) {
      overrides[key] = value;
    }
  }
  return { ...baseStyle, ...overrides };
}

export function hasResponsiveOverride(
  responsive: ResponsiveConfig,
  device: DeviceMode,
  property: keyof ResponsiveOverride
): boolean {
  if (device === "desktop") return false;
  if (device === "mobile" && responsive.mobile?.[property] !== undefined) return true;
  if (responsive.tablet?.[property] !== undefined) return true;
  return false;
}

export function clearResponsiveOverride(
  responsive: ResponsiveConfig,
  device: Exclude<DeviceMode, "desktop">,
  property: keyof ResponsiveOverride
): ResponsiveConfig {
  const result = { ...responsive };
  if (result[device]) {
    const deviceCopy = { ...result[device] };
    delete deviceCopy[property];
    if (Object.keys(deviceCopy).length === 0) {
      delete result[device];
    } else {
      result[device] = deviceCopy;
    }
  }
  return result;
}
