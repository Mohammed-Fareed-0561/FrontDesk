"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Type,
  Image,
  MousePointerClick,
  LayoutGrid,
  Calendar,
  FormInput,
  LayoutTemplate,
  FileText,
  Palette,
  ChevronRight,
  Pencil,
  Trash2,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { WebsitePage, WebsiteSection, WebsiteComponent, WebsiteTemplate, SectionPack } from "@/types";
import type { DesignerLeftTab, ComponentPreset, SectionPreset } from "@/lib/designer/types";
import { ordered, slugify } from "@/lib/designer/utils";
import { ThemeEditor } from "@/components/website/ThemeEditor";
import type { WebsiteTheme } from "@/providers/ThemeProvider";
import { apiClient } from "@/lib/api/client";

interface LeftPanelProps {
  pages: WebsitePage[];
  currentPageId: string | null;
  sections: WebsiteSection[];
  onSelectPage: (id: string) => void;
  onCreatePage: (title: string, slug: string) => Promise<void>;
  onRenamePage: (id: string, title: string, slug: string) => Promise<void>;
  onDeletePage: (id: string) => Promise<void>;
  onAddSection: (section: {
    sectionType: string;
    sortOrder: number;
    content: string;
    styleConfig?: string;
    visibilityConfig?: string | null;
    components?: Array<{
      componentType: string;
      sortOrder: number;
      props: string;
      content: string;
      styleConfig?: string;
      assetRefs?: string | null;
      sourceType?: string | null;
      sourceId?: string | null;
      sourceVersion?: string | null;
    }>;
  }) => void;
  onAddComponent: (sectionId: string, component: Omit<WebsiteComponent, "id" | "createdAt" | "updatedAt" | "sectionId">) => void;
  themeConfig: string | null;
  onSaveTheme: (theme: WebsiteTheme) => Promise<void>;
  businessId: string;
  onTemplateImported?: () => void;
}

const COMPONENT_PRESETS: ComponentPreset[] = [
  {
    kind: "heading",
    label: "Text",
    description: "Add a heading or paragraph",
    icon: "type",
    componentType: "text",
    defaultContent: { text: "Your text here" },
    defaultProps: {},
  },
  {
    kind: "image",
    label: "Photo",
    description: "Add a photo or banner",
    icon: "image",
    componentType: "image",
    defaultContent: { src: "", alt: "Photo" },
    defaultProps: {},
  },
  {
    kind: "button",
    label: "Button",
    description: "Add a button or link",
    icon: "button",
    componentType: "button",
    defaultContent: { text: "Click me", href: "#" },
    defaultProps: {},
  },
  {
    kind: "gallery",
    label: "Gallery",
    description: "Show multiple photos",
    icon: "gallery",
    componentType: "gallery",
    defaultContent: { images: [] },
    defaultProps: {},
  },
  {
    kind: "services",
    label: "Services",
    description: "Show your services",
    icon: "services",
    componentType: "services",
    defaultContent: { heading: "Our Services", items: [] },
    defaultProps: {},
  },
  {
    kind: "products",
    label: "Products",
    description: "Show your products",
    icon: "products",
    componentType: "products",
    defaultContent: { heading: "Our Products", items: [] },
    defaultProps: {},
  },
  {
    kind: "booking",
    label: "Booking",
    description: "Let customers book",
    icon: "booking",
    componentType: "booking",
    defaultContent: { heading: "Book an Appointment" },
    defaultProps: {},
  },
  {
    kind: "form",
    label: "Form",
    description: "Collect customer information",
    icon: "form",
    componentType: "form",
    defaultContent: { heading: "Contact Us", fields: ["name", "email", "message"] },
    defaultProps: {},
  },
];

const SECTION_PRESETS: SectionPreset[] = [
  {
    sectionType: "hero",
    label: "Hero",
    description: "Large banner with headline",
    category: "Hero",
    defaultContent: { heading: "Welcome to Our Business" },
    defaultComponents: [
      { componentType: "text", sortOrder: 0, content: { text: "Welcome to Our Business" }, props: {} },
    ],
  },
  {
    sectionType: "about",
    label: "About",
    description: "Tell your story",
    category: "About",
    defaultContent: { heading: "About Us" },
    defaultComponents: [
      { componentType: "text", sortOrder: 0, content: { text: "About Us" }, props: {} },
      { componentType: "text", sortOrder: 1, content: { text: "We are a business that cares about quality." }, props: {} },
    ],
  },
  {
    sectionType: "features",
    label: "Features",
    description: "Highlight key features",
    category: "Features",
    defaultContent: { heading: "Why Choose Us" },
    defaultComponents: [
      { componentType: "text", sortOrder: 0, content: { text: "Quality Service" }, props: {} },
      { componentType: "text", sortOrder: 1, content: { text: "Fast Delivery" }, props: {} },
      { componentType: "text", sortOrder: 2, content: { text: "Best Value" }, props: {} },
    ],
  },
  {
    sectionType: "services",
    label: "Services",
    description: "Showcase your services",
    category: "Services",
    defaultContent: { heading: "Our Services" },
    defaultComponents: [
      { componentType: "services", sortOrder: 0, content: { heading: "Our Services", items: [] }, props: {} },
    ],
  },
  {
    sectionType: "products",
    label: "Products",
    description: "Display your products",
    category: "Products",
    defaultContent: { heading: "Our Products" },
    defaultComponents: [
      { componentType: "products", sortOrder: 0, content: { heading: "Our Products", items: [] }, props: {} },
    ],
  },
  {
    sectionType: "gallery",
    label: "Gallery",
    description: "Photo gallery section",
    category: "Gallery",
    defaultContent: { heading: "Gallery" },
    defaultComponents: [
      { componentType: "gallery", sortOrder: 0, content: { heading: "Gallery", images: [] }, props: {} },
    ],
  },
  {
    sectionType: "testimonials",
    label: "Testimonials",
    description: "Customer reviews",
    category: "Testimonials",
    defaultContent: { heading: "What Our Customers Say" },
    defaultComponents: [
      { componentType: "testimonials", sortOrder: 0, content: { heading: "What Our Customers Say", items: [] }, props: {} },
    ],
  },
  {
    sectionType: "contact",
    label: "Contact",
    description: "Contact information",
    category: "Contact",
    defaultContent: { heading: "Get in Touch" },
    defaultComponents: [
      { componentType: "contact", sortOrder: 0, content: { heading: "Get in Touch" }, props: {} },
    ],
  },
  {
    sectionType: "cta",
    label: "Call to Action",
    description: "Encourage action",
    category: "CTA",
    defaultContent: { heading: "Ready to Get Started?" },
    defaultComponents: [
      { componentType: "text", sortOrder: 0, content: { text: "Ready to Get Started?" }, props: {} },
      { componentType: "button", sortOrder: 1, content: { text: "Get Started", href: "#" }, props: {} },
    ],
  },
  {
    sectionType: "faq",
    label: "FAQ",
    description: "Frequently asked questions",
    category: "FAQ",
    defaultContent: { heading: "Frequently Asked Questions" },
    defaultComponents: [
      { componentType: "text", sortOrder: 0, content: { text: "Frequently Asked Questions" }, props: {} },
    ],
  },
  {
    sectionType: "image-text",
    label: "Image + Text",
    description: "Image with text side by side",
    category: "Media",
    defaultContent: { heading: "Image Section" },
    defaultComponents: [
      { componentType: "image", sortOrder: 0, content: { src: "", alt: "Section image" }, props: {} },
      { componentType: "text", sortOrder: 1, content: { text: "Add your description here." }, props: {} },
    ],
  },
  {
    sectionType: "text-block",
    label: "Text Block",
    description: "Simple text content",
    category: "Content",
    defaultContent: { heading: "Text Content" },
    defaultComponents: [
      { componentType: "text", sortOrder: 0, content: { text: "Add your content here." }, props: {} },
    ],
  },
  {
    sectionType: "footer",
    label: "Footer",
    description: "Page footer with links",
    category: "Footer",
    defaultContent: { heading: "Footer" },
    defaultComponents: [
      { componentType: "text", sortOrder: 0, content: { text: "© 2024 Your Business. All rights reserved." }, props: {} },
    ],
  },
];

export function LeftPanel({
  pages,
  currentPageId,
  sections,
  onSelectPage,
  onCreatePage,
  onRenamePage,
  onDeletePage,
  onAddSection,
  onAddComponent,
  themeConfig,
  onSaveTheme,
  businessId,
  onTemplateImported,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<DesignerLeftTab>("add");
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageSlug, setEditPageSlug] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: Array<{ id: DesignerLeftTab; label: string; icon: typeof Plus }> = [
    { id: "add", label: "Add", icon: Plus },
    { id: "sections", label: "Sections", icon: LayoutTemplate },
    { id: "elements", label: "Elements", icon: Type },
    { id: "templates", label: "Templates", icon: Sparkles },
    { id: "pages", label: "Pages", icon: FileText },
    { id: "style", label: "Style", icon: Palette },
  ];

  const filteredPresets = COMPONENT_PRESETS.filter(
    (p) =>
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;
    await onCreatePage(newPageTitle, newPageSlug || slugify(newPageTitle));
    setNewPageTitle("");
    setNewPageSlug("");
    setShowNewPage(false);
  };

  const handleRenamePage = async (pageId: string) => {
    if (!editPageTitle.trim()) return;
    await onRenamePage(pageId, editPageTitle, editPageSlug);
    setEditingPageId(null);
  };

  const handleAddComponent = (preset: ComponentPreset) => {
    const targetSection = sections[0];
    if (!targetSection) return;
    onAddComponent(targetSection.id, {
      componentType: preset.componentType,
      sortOrder: (targetSection.components?.length || 0),
      props: JSON.stringify(preset.defaultProps),
      content: JSON.stringify(preset.defaultContent),
      styleConfig: "{}",
      assetRefs: null,
      sourceType: null,
      sourceId: null,
      sourceVersion: null,
    });
  };

  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-white">
      {/* Tab navigation */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            aria-label={tab.label}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "add" && (
          <AddTab
            presets={filteredPresets}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={handleAddComponent}
            firstSectionId={sections[0]?.id}
          />
        )}
        {activeTab === "sections" && (
          <SectionsTab
            presets={SECTION_PRESETS}
            onAddSection={onAddSection}
          />
        )}
        {activeTab === "elements" && (
          <ElementsTab
            presets={COMPONENT_PRESETS}
            firstSectionId={sections[0]?.id}
            onAddComponent={onAddComponent}
          />
        )}
        {activeTab === "templates" && (
          <TemplatesTab
            businessId={businessId}
            onTemplateImported={onTemplateImported}
          />
        )}
        {activeTab === "pages" && (
          <PagesTab
            pages={pages}
            currentPageId={currentPageId}
            showNewPage={showNewPage}
            newPageTitle={newPageTitle}
            newPageSlug={newPageSlug}
            editingPageId={editingPageId}
            editPageTitle={editPageTitle}
            editPageSlug={editPageSlug}
            onSelectPage={onSelectPage}
            onShowNewPage={setShowNewPage}
            onNewPageTitleChange={(v) => { setNewPageTitle(v); if (!newPageSlug) setNewPageSlug(slugify(v)); }}
            onNewPageSlugChange={setNewPageSlug}
            onCreatePage={handleCreatePage}
            onBeginEdit={(page) => { setEditingPageId(page.id); setEditPageTitle(page.title); setEditPageSlug(page.slug); }}
            onEditPageTitleChange={setEditPageTitle}
            onEditPageSlugChange={setEditPageSlug}
            onSavePageEdit={handleRenamePage}
            onCancelEdit={() => setEditingPageId(null)}
            onDeletePage={onDeletePage}
            totalPages={pages.length}
          />
        )}
        {activeTab === "style" && (
          <StyleTab themeConfig={themeConfig} onSaveTheme={onSaveTheme} />
        )}
      </div>
    </div>
  );
}

/* ── Add Tab ─────────────────────────────────────────────────── */

function AddTab({
  presets,
  searchQuery,
  onSearchChange,
  onAdd,
  firstSectionId,
}: {
  presets: ComponentPreset[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAdd: (preset: ComponentPreset) => void;
  firstSectionId?: string;
}) {
  const iconMap: Record<string, typeof Type> = {
    type: Type,
    image: Image,
    button: MousePointerClick,
    gallery: LayoutGrid,
    services: Calendar,
    products: LayoutGrid,
    booking: Calendar,
    form: FormInput,
  };

  return (
    <div className="p-3 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Add</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Drag or click to add to your page</p>
      </div>
      <Input
        placeholder="Search something to add…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 text-xs"
      />
      <div className="space-y-1">
        {presets.map((preset) => {
          const Icon = iconMap[preset.icon] || Type;
          return (
            <button
              key={preset.kind}
              type="button"
              onClick={() => onAdd(preset)}
              disabled={!firstSectionId}
              className="flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{preset.label}</p>
                <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Sections Tab ────────────────────────────────────────────── */

function SectionsTab({
  presets,
  onAddSection,
}: {
  presets: SectionPreset[];
  onAddSection: (section: {
    sectionType: string;
    sortOrder: number;
    content: string;
    styleConfig?: string;
    visibilityConfig?: string | null;
    components?: Array<{
      componentType: string;
      sortOrder: number;
      props: string;
      content: string;
      styleConfig?: string;
      assetRefs?: string | null;
      sourceType?: string | null;
      sourceId?: string | null;
      sourceVersion?: string | null;
    }>;
  }) => void;
}) {
  const categories = Array.from(new Set(presets.map((p) => p.category)));

  return (
    <div className="p-3 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Sections</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Add a ready-made section to your page</p>
      </div>
      {categories.map((category) => (
        <div key={category} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
          {presets
            .filter((p) => p.category === category)
            .map((preset) => (
              <button
                key={preset.sectionType}
                type="button"
                onClick={() => onAddSection({
                  sectionType: preset.sectionType,
                  sortOrder: 0,
                  content: JSON.stringify(preset.defaultContent),
                  styleConfig: "{}",
                  visibilityConfig: null,
                  components: preset.defaultComponents.map((c, i) => ({
                    componentType: c.componentType,
                    sortOrder: i,
                    props: JSON.stringify(c.props),
                    content: JSON.stringify(c.content),
                    styleConfig: "{}",
                    assetRefs: null,
                    sourceType: null,
                    sourceId: null,
                    sourceVersion: null,
                  })),
                })}
                className="flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex h-12 w-16 items-center justify-center rounded bg-muted">
                  <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{preset.label}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </div>
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}

/* ── Elements Tab ────────────────────────────────────────────── */

function ElementsTab({
  presets,
  firstSectionId,
  onAddComponent,
}: {
  presets: ComponentPreset[];
  firstSectionId?: string;
  onAddComponent: (sectionId: string, component: Omit<WebsiteComponent, "id" | "createdAt" | "updatedAt" | "sectionId">) => void;
}) {
  const handleAdd = (preset: ComponentPreset) => {
    if (!firstSectionId) return;
    onAddComponent(firstSectionId, {
      componentType: preset.componentType,
      sortOrder: 0,
      props: JSON.stringify(preset.defaultProps),
      content: JSON.stringify(preset.defaultContent),
      styleConfig: "{}",
      assetRefs: null,
      sourceType: null,
      sourceId: null,
      sourceVersion: null,
    });
  };

  const categories: Array<{ label: string; items: ComponentPreset[] }> = [
    { label: "Text", items: presets.filter((p) => ["heading"].includes(p.kind)) },
    { label: "Media", items: presets.filter((p) => ["image", "gallery"].includes(p.kind)) },
    { label: "Action", items: presets.filter((p) => ["button", "form"].includes(p.kind)) },
    { label: "Business", items: presets.filter((p) => ["services", "products", "booking"].includes(p.kind)) },
  ];

  return (
    <div className="p-3 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Elements</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Add individual elements to your page</p>
      </div>
      {categories.map((cat) => (
        <div key={cat.label} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{cat.label}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.items.map((preset) => (
              <button
                key={preset.kind}
                type="button"
                onClick={() => handleAdd(preset)}
                disabled={!firstSectionId}
                className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  <Type className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-xs font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Pages Tab ───────────────────────────────────────────────── */

function PagesTab({
  pages,
  currentPageId,
  showNewPage,
  newPageTitle,
  newPageSlug,
  editingPageId,
  editPageTitle,
  editPageSlug,
  onSelectPage,
  onShowNewPage,
  onNewPageTitleChange,
  onNewPageSlugChange,
  onCreatePage,
  onBeginEdit,
  onEditPageTitleChange,
  onEditPageSlugChange,
  onSavePageEdit,
  onCancelEdit,
  onDeletePage,
  totalPages,
}: {
  pages: WebsitePage[];
  currentPageId: string | null;
  showNewPage: boolean;
  newPageTitle: string;
  newPageSlug: string;
  editingPageId: string | null;
  editPageTitle: string;
  editPageSlug: string;
  onSelectPage: (id: string) => void;
  onShowNewPage: (show: boolean) => void;
  onNewPageTitleChange: (v: string) => void;
  onNewPageSlugChange: (v: string) => void;
  onCreatePage: () => Promise<void>;
  onBeginEdit: (page: WebsitePage) => void;
  onEditPageTitleChange: (v: string) => void;
  onEditPageSlugChange: (v: string) => void;
  onSavePageEdit: (id: string) => Promise<void>;
  onCancelEdit: () => void;
  onDeletePage: (id: string) => Promise<void>;
  totalPages: number;
}) {
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Pages</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your website pages</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => onShowNewPage(!showNewPage)}
          aria-label="Add page"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showNewPage && (
        <div className="space-y-2 rounded-lg border p-3 bg-muted/30">
          <Label htmlFor="new-page-title" className="text-xs">Page name</Label>
          <Input
            id="new-page-title"
            value={newPageTitle}
            onChange={(e) => onNewPageTitleChange(e.target.value)}
            placeholder="About Us"
            className="h-8 text-xs"
          />
          <Label htmlFor="new-page-slug" className="text-xs">Slug</Label>
          <Input
            id="new-page-slug"
            value={newPageSlug}
            onChange={(e) => onNewPageSlugChange(e.target.value)}
            placeholder="about-us"
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={onCreatePage}>
              Create page
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => onShowNewPage(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {ordered(pages).map((page) => {
          if (editingPageId === page.id) {
            return (
              <div key={page.id} className="space-y-2 rounded-lg border p-3 bg-muted/30">
                <Input
                  value={editPageTitle}
                  onChange={(e) => onEditPageTitleChange(e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Page title"
                />
                <Input
                  value={editPageSlug}
                  onChange={(e) => onEditPageSlugChange(e.target.value)}
                  className="h-7 text-xs"
                  placeholder="page-slug"
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-6 text-xs" onClick={() => onSavePageEdit(page.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={onCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            );
          }
          return (
            <div
              key={page.id}
              className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors cursor-pointer ${
                page.id === currentPageId
                  ? "bg-muted font-medium"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => onSelectPage(page.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelectPage(page.id)}
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm truncate flex-1">{page.title}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onBeginEdit(page); }}
                  className="rounded p-0.5 hover:bg-background"
                  aria-label={`Rename ${page.title}`}
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  disabled={totalPages <= 1}
                  className="rounded p-0.5 hover:bg-background disabled:opacity-30"
                  aria-label={`Delete ${page.title}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
        {!pages.length && (
          <p className="text-xs text-muted-foreground text-center py-4">No pages yet</p>
        )}
        {totalPages <= 1 && (
          <p className="text-[10px] text-muted-foreground">The last page cannot be deleted</p>
        )}
      </div>
    </div>
  );
}

/* ── Style Tab ───────────────────────────────────────────────── */

function StyleTab({
  themeConfig,
  onSaveTheme,
}: {
  themeConfig: string | null;
  onSaveTheme: (theme: WebsiteTheme) => Promise<void>;
}) {
  return (
    <div className="p-3 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Style</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Make it your style</p>
      </div>
      <ThemeEditor themeConfig={themeConfig} onSave={onSaveTheme} />
    </div>
  );
}

/* ── Templates Tab ─────────────────────────────────────────── */

function TemplatesTab({
  businessId,
  onTemplateImported,
}: {
  businessId: string;
  onTemplateImported?: () => void;
}) {
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [packs, setPacks] = useState<SectionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"templates" | "packs">("templates");

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const [tpls, packList] = await Promise.all([
        apiClient<WebsiteTemplate[]>("/templates"),
        apiClient<SectionPack[]>("/section-packs"),
      ]);
      setTemplates(tpls || []);
      setPacks(packList || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handlePreview = async (templateId: string) => {
    if (previewId === templateId) {
      setPreviewId(null);
      setPreviewData(null);
      return;
    }
    setPreviewId(templateId);
    setPreviewLoading(true);
    try {
      const data = await apiClient<any>(`/templates/${templateId}`);
      setPreviewData(data);
    } catch {
      // silently fail
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImport = async (templateId: string) => {
    setImporting(templateId);
    try {
      await apiClient(`/templates/${templateId}/import`, {
        method: "POST",
        body: { businessId },
      });
      onTemplateImported?.();
      setPreviewId(null);
      setPreviewData(null);
    } catch {
      // silently fail
    } finally {
      setImporting(null);
    }
  };

  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const packCategories = Array.from(new Set(packs.map((p) => p.category)));

  if (loading) {
    return (
      <div className="p-3 flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Templates</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Choose a template or section pack</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-0.5">
        <button
          type="button"
          onClick={() => setActiveSection("templates")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeSection === "templates" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Templates
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("packs")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeSection === "packs" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Section Packs
        </button>
      </div>

      {activeSection === "templates" && (
        <>
          {previewId && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium">Preview</p>
                <button
                  type="button"
                  onClick={() => { setPreviewId(null); setPreviewData(null); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>
              {previewLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : previewData ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{previewData.name}</p>
                  <p className="text-xs text-muted-foreground">{previewData.description}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {previewData.pages?.map((p: any) => (
                      <div key={p.id} className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{p.title}</span>
                        <span className="text-muted-foreground">({p.sections?.length || 0} sections)</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs w-full"
                    onClick={() => handleImport(previewId)}
                    disabled={importing === previewId}
                  >
                    {importing === previewId ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    Use This Template
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {categories.map((category) => (
            <div key={category} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
              {templates
                .filter((t) => t.category === category)
                .map((template) => (
                  <div key={template.id} className="rounded-lg border p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                        <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.pageCount || 0} pages</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs flex-1"
                        onClick={() => handlePreview(template.id)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="h-6 text-xs flex-1"
                        onClick={() => handleImport(template.id)}
                        disabled={importing === template.id}
                      >
                        {importing === template.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Use"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </>
      )}

      {activeSection === "packs" && (
        <>
          {packCategories.map((category) => (
            <div key={category} className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{category}</p>
              {packs
                .filter((p) => p.category === category)
                .map((pack) => (
                  <div key={pack.id} className="rounded-lg border p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                        <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{pack.name}</p>
                        <p className="text-xs text-muted-foreground">{pack.sectionCount || 0} sections</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{pack.description}</p>
                  </div>
                ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
