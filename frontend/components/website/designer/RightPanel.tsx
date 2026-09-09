"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Palette,
  Settings2,
  Image,
  Type,
  MousePointerClick,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { WebsiteComponent, WebsiteSection } from "@/types";
import { parseObject, componentLabel, classifyComponent } from "@/lib/designer/utils";
import type { DesignerSelection } from "@/lib/designer/types";

interface RightPanelProps {
  selection: DesignerSelection;
  component: WebsiteComponent | null;
  section: WebsiteSection | null;
  onUpdateComponent: (id: string, changes: Partial<WebsiteComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: -1 | 1) => void;
  onDuplicateComponent: (id: string) => void;
}

export function RightPanel({
  selection,
  component,
  section,
  onUpdateComponent,
  onDeleteComponent,
  onMoveComponent,
  onDuplicateComponent,
}: RightPanelProps) {
  if (selection.type === "component" && component) {
    return (
      <ComponentEditor
        component={component}
        onUpdate={(changes) => onUpdateComponent(component.id, changes)}
        onDelete={() => onDeleteComponent(component.id)}
        onMove={(dir) => onMoveComponent(component.id, dir)}
        onDuplicate={() => onDuplicateComponent(component.id)}
      />
    );
  }

  if (selection.type === "section" && section) {
    return <SectionEditor section={section} />;
  }

  return <EmptyState />;
}

/* ── Empty State ─────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Settings2 className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">Make your website yours</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Click anything on your website to edit it.
      </p>
      <div className="space-y-2 w-full max-w-[200px]">
        <button className="flex w-full items-center gap-2 rounded-lg border p-2.5 text-left text-sm hover:bg-muted/50 transition-colors">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Change style
        </button>
        <button className="flex w-full items-center gap-2 rounded-lg border p-2.5 text-left text-sm hover:bg-muted/50 transition-colors">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          Add section
        </button>
      </div>
    </div>
  );
}

/* ── Component Editor ────────────────────────────────────────── */

function ComponentEditor({
  component,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
}: {
  component: WebsiteComponent;
  onUpdate: (changes: Partial<WebsiteComponent>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
}) {
  const content = parseObject(component.content);
  const props = parseObject(component.props);
  const kind = classifyComponent(component);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateContent = (key: string, value: any) => {
    onUpdate({ content: JSON.stringify({ ...content, [key]: value }) });
  };

  const updateProps = (key: string, value: any) => {
    onUpdate({ props: JSON.stringify({ ...props, [key]: value }) });
  };

  const headerIcon: Record<string, typeof Type> = {
    heading: Type,
    paragraph: Type,
    text: Type,
    image: Image,
    gallery: Image,
    button: MousePointerClick,
  };
  const Icon = headerIcon[kind] || Settings2;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">
            {kind === "heading" || kind === "text" ? "Edit Text" :
             kind === "image" ? "Edit Photo" :
             kind === "button" ? "Edit Button" :
             `Edit ${component.componentType}`}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            className="rounded p-1.5 hover:bg-muted"
            aria-label="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            className="rounded p-1.5 hover:bg-muted"
            aria-label="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded p-1.5 hover:bg-muted"
            aria-label="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* Text content */}
          {(kind === "heading" || kind === "text" || kind === "paragraph") && (
            <div className="space-y-2">
              <Label htmlFor="edit-text" className="text-xs">Text</Label>
              <Textarea
                id="edit-text"
                value={content.text || ""}
                onChange={(e) => updateContent("text", e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          )}

          {/* Image content */}
          {kind === "image" && (
            <>
              {content.src && (
                <div className="rounded-lg overflow-hidden border">
                  <img src={content.src} alt={content.alt || ""} className="w-full h-32 object-cover" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-src" className="text-xs">Image URL</Label>
                <Input
                  id="edit-src"
                  value={content.src || ""}
                  onChange={(e) => updateContent("src", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-alt" className="text-xs">Alt text</Label>
                <Input
                  id="edit-alt"
                  value={content.alt || ""}
                  onChange={(e) => updateContent("alt", e.target.value)}
                  placeholder="Describe this image"
                  className="h-8 text-xs"
                />
              </div>
            </>
          )}

          {/* Button content */}
          {kind === "button" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-btn-text" className="text-xs">Button text</Label>
                <Input
                  id="edit-btn-text"
                  value={content.text || ""}
                  onChange={(e) => updateContent("text", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-btn-href" className="text-xs">Link URL</Label>
                <Input
                  id="edit-btn-href"
                  value={content.href || ""}
                  onChange={(e) => updateContent("href", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>
            </>
          )}

          {/* Gallery content */}
          {kind === "gallery" && (
            <div className="space-y-2">
              <Label className="text-xs">Images</Label>
              <div className="grid grid-cols-2 gap-2">
                {(content.images || []).map((img: any, i: number) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center relative group/img">
                    {img.src ? (
                      <img src={img.src} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Image className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                ))}
                <button className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                  <span className="text-xs">+ Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Heading/content for non-text types */}
          {["services", "products", "booking", "form", "testimonials", "contact"].includes(kind) && (
            <div className="space-y-2">
              <Label htmlFor="edit-heading" className="text-xs">Heading</Label>
              <Input
                id="edit-heading"
                value={content.heading || ""}
                onChange={(e) => updateContent("heading", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          <Separator />

          {/* Advanced / JSON editing */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              More options
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-props" className="text-xs">Props (JSON)</Label>
                  <Textarea
                    id="edit-props"
                    defaultValue={JSON.stringify(props, null, 2)}
                    onBlur={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        onUpdate({ props: JSON.stringify(parsed) });
                      } catch {}
                    }}
                    rows={4}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-style" className="text-xs">Style (JSON)</Label>
                  <Textarea
                    id="edit-style"
                    defaultValue={JSON.stringify(parseObject(component.styleConfig), null, 2)}
                    onBlur={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        onUpdate({ styleConfig: JSON.stringify(parsed) });
                      } catch {}
                    }}
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={onDelete}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/* ── Section Editor ──────────────────────────────────────────── */

function SectionEditor({ section }: { section: WebsiteSection }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Edit Section</h3>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Section type</Label>
            <Input value={section.sectionType} disabled className="h-8 text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Sort order</Label>
            <Input value={String(section.sortOrder)} disabled className="h-8 text-xs" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs">Content (JSON)</Label>
            <Textarea
              defaultValue={section.content}
              onBlur={(e) => {
                // Content is read-only for now; section editing is via components
              }}
              rows={4}
              className="font-mono text-xs"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}
