import type { Website, WebsiteComponent, WebsitePage, WebsiteSection } from "@/types";

export type DesignerLeftTab = "add" | "sections" | "elements" | "uploads" | "pages" | "style";

export type DeviceMode = "desktop" | "tablet" | "mobile";

export type SelectionType = "component" | "section" | null;

export interface DesignerSelection {
  type: SelectionType;
  id: string | null;
}

export interface DesignerState {
  website: Website | null;
  currentPageId: string | null;
  selection: DesignerSelection;
  leftTab: DesignerLeftTab;
  device: DeviceMode;
  zoom: number;
  saving: boolean;
  saved: boolean;
  loading: boolean;
  loadError: string | null;
  hasUnsavedChanges: boolean;
}

export type ComponentKind =
  | "text"
  | "heading"
  | "paragraph"
  | "image"
  | "gallery"
  | "button"
  | "services"
  | "products"
  | "booking"
  | "form"
  | "testimonials"
  | "contact"
  | "unknown";

export interface ComponentPreset {
  kind: ComponentKind;
  label: string;
  description: string;
  icon: string;
  componentType: string;
  defaultContent: Record<string, any>;
  defaultProps: Record<string, any>;
}

export interface SectionPreset {
  sectionType: string;
  label: string;
  description: string;
  category: string;
  defaultContent: Record<string, any>;
  defaultComponents: Array<{
    componentType: string;
    sortOrder: number;
    content: Record<string, any>;
    props: Record<string, any>;
  }>;
}
