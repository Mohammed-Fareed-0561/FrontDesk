"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { MediaPicker, type MediaAsset } from "@/components/media/MediaPicker";
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
  Film,
  Play,
  Sun,
  Contrast,
  Droplets,
  CircleDot,
  Layers,
} from "lucide-react";
import type { WebsiteComponent, WebsiteSection } from "@/types";
import { parseObject, componentLabel, classifyComponent, getResponsiveConfig, setResponsiveConfig, getResponsiveValue, hasResponsiveOverride, clearResponsiveOverride } from "@/lib/designer/utils";
import type { DesignerSelection, DeviceMode, ResponsiveConfig, ResponsiveOverride } from "@/lib/designer/types";

interface RightPanelProps {
  selection: DesignerSelection;
  component: WebsiteComponent | null;
  section: WebsiteSection | null;
  businessId: string;
  device: DeviceMode;
  onUpdateComponent: (id: string, changes: Partial<WebsiteComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: -1 | 1) => void;
  onDuplicateComponent: (id: string) => void;
  onUpdateSection: (id: string, changes: Partial<WebsiteSection>) => void;
  onMoveSection: (id: string, direction: -1 | 1) => void;
  onDuplicateSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
}

export function RightPanel({
  selection,
  component,
  section,
  businessId,
  device,
  onUpdateComponent,
  onDeleteComponent,
  onMoveComponent,
  onDuplicateComponent,
  onUpdateSection,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
}: RightPanelProps) {
  if (selection.type === "component" && component) {
    return (
      <ComponentEditor
        component={component}
        businessId={businessId}
        device={device}
        onUpdate={(changes) => onUpdateComponent(component.id, changes)}
        onDelete={() => onDeleteComponent(component.id)}
        onMove={(dir) => onMoveComponent(component.id, dir)}
        onDuplicate={() => onDuplicateComponent(component.id)}
      />
    );
  }

  if (selection.type === "section" && section) {
    return (
      <SectionEditor
        section={section}
        businessId={businessId}
        device={device}
        onUpdate={(changes) => onUpdateSection(section.id, changes)}
        onMove={(dir) => onMoveSection(section.id, dir)}
        onDuplicate={() => onDuplicateSection(section.id)}
        onDelete={() => onDeleteSection(section.id)}
      />
    );
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

/* ── Slider Control ──────────────────────────────────────────── */

function SliderControl({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  icon: Icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icon?: typeof Sun;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs flex items-center gap-1.5">
          {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
          {label}
        </Label>
        <span className="text-xs text-muted-foreground font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}

/* ── Media Adjustments ───────────────────────────────────────── */

function MediaAdjustments({
  config,
  onChange,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium">Adjustments</Label>
      <SliderControl
        label="Opacity"
        value={config.opacity ?? 100}
        onChange={(v) => onChange("opacity", v)}
        min={0}
        max={100}
        unit="%"
      />
      <SliderControl
        label="Brightness"
        value={config.brightness ?? 100}
        onChange={(v) => onChange("brightness", v)}
        min={0}
        max={200}
        unit="%"
        icon={Sun}
      />
      <SliderControl
        label="Contrast"
        value={config.contrast ?? 100}
        onChange={(v) => onChange("contrast", v)}
        min={0}
        max={200}
        unit="%"
        icon={Contrast}
      />
      <SliderControl
        label="Saturation"
        value={config.saturation ?? 100}
        onChange={(v) => onChange("saturation", v)}
        min={0}
        max={200}
        unit="%"
        icon={Droplets}
      />
      <SliderControl
        label="Blur"
        value={config.blur ?? 0}
        onChange={(v) => onChange("blur", v)}
        min={0}
        max={20}
        unit="px"
      />
      <SliderControl
        label="Grayscale"
        value={config.grayscale ?? 0}
        onChange={(v) => onChange("grayscale", v)}
        min={0}
        max={100}
        unit="%"
      />
      <SliderControl
        label="Hue Rotate"
        value={config.hueRotate ?? 0}
        onChange={(v) => onChange("hueRotate", v)}
        min={0}
        max={360}
        unit="deg"
      />
    </div>
  );
}

/* ── Video Background Controls ───────────────────────────────── */

function VideoBackgroundControls({
  config,
  onChange,
  businessId,
}: {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
  businessId: string;
}) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [posterPickerOpen, setPosterPickerOpen] = useState(false);

  const handleVideoSelect = (asset: MediaAsset) => {
    onChange("assetId", asset.id);
    onChange("src", asset.signedUrl || `/api/v1/public/business/-/media/${asset.id}/file`);
  };

  const handlePosterSelect = (asset: MediaAsset) => {
    onChange("posterAssetId", asset.id);
    onChange("poster", asset.signedUrl || "");
  };

  const overlay = config.overlay || {};

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Background Video</Label>
        {config.src ? (
          <div className="space-y-2">
            <div className="rounded-lg overflow-hidden border bg-muted">
              <video
                src={config.src}
                className="w-full h-24 object-cover"
                muted
                loop
                playsInline
              />
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => setShowMediaPicker(true)}>
              <Film className="h-3.5 w-3.5 mr-1.5" />
              Change Video
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full" onClick={() => setShowMediaPicker(true)}>
            <Film className="h-3.5 w-3.5 mr-1.5" />
            Choose Video
          </Button>
        )}
      </div>

      <Separator />

      <MediaAdjustments config={config} onChange={onChange} />

      <Separator />

      {/* Overlay */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-muted-foreground" />
            Overlay
          </Label>
          <Switch
            checked={overlay.enabled || false}
            onCheckedChange={(v) => onChange("overlay", { ...overlay, enabled: v })}
          />
        </div>
        {overlay.enabled && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs">Overlay Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={overlay.color || "#000000"}
                  onChange={(e) => onChange("overlay", { ...overlay, color: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border"
                />
                <Input
                  value={overlay.color || "#000000"}
                  onChange={(e) => onChange("overlay", { ...overlay, color: e.target.value })}
                  className="h-8 flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <SliderControl
              label="Overlay Opacity"
              value={(overlay.opacity ?? 30)}
              onChange={(v) => onChange("overlay", { ...overlay, opacity: v })}
              min={0}
              max={100}
              unit="%"
            />
          </>
        )}
      </div>

      <Separator />

      {/* Fit & Position */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Fit</Label>
          <select
            value={config.fit || "cover"}
            onChange={(e) => onChange("fit", e.target.value)}
            className="w-full h-8 rounded-md border bg-background px-2 text-xs"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Position</Label>
          <select
            value={config.position || "center"}
            onChange={(e) => onChange("position", e.target.value)}
            className="w-full h-8 rounded-md border bg-background px-2 text-xs"
          >
            <option value="center">Center</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <Separator />

      {/* Playback */}
      <div className="space-y-3">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Play className="h-3 w-3 text-muted-foreground" />
          Playback
        </Label>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Autoplay</Label>
          <Switch
            checked={config.autoplay !== false}
            onCheckedChange={(v) => onChange("autoplay", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Muted</Label>
          <Switch
            checked={config.muted !== false}
            onCheckedChange={(v) => onChange("muted", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs">Loop</Label>
          <Switch
            checked={config.loop !== false}
            onCheckedChange={(v) => onChange("loop", v)}
          />
        </div>
      </div>

      <Separator />

      {/* Poster */}
      <div className="space-y-2">
        <Label className="text-xs">Poster Image</Label>
        {config.poster ? (
          <div className="space-y-2">
            <div className="rounded-lg overflow-hidden border">
              <img src={config.poster} alt="Poster" className="w-full h-16 object-cover" />
            </div>
            <Button size="sm" variant="outline" className="w-full" onClick={() => setPosterPickerOpen(true)}>
              Change Poster
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full" onClick={() => setPosterPickerOpen(true)}>
            Choose Poster Image
          </Button>
        )}
      </div>

      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        businessId={businessId}
        onSelect={handleVideoSelect}
        filter="VIDEO"
        title="Choose Background Video"
      />
      <MediaPicker
        open={posterPickerOpen}
        onOpenChange={setPosterPickerOpen}
        businessId={businessId}
        onSelect={handlePosterSelect}
        filter="IMAGE"
        title="Choose Poster Image"
      />
    </div>
  );
}

/* ── Responsive Controls ──────────────────────────────────── */

function ResponsiveControls({
  device,
  responsive,
  kind,
  onUpdate,
  onClear,
  baseFontSize,
}: {
  device: DeviceMode;
  responsive: ResponsiveConfig;
  kind: string;
  onUpdate: (property: keyof ResponsiveOverride, value: any) => void;
  onClear: (property: keyof ResponsiveOverride) => void;
  baseFontSize?: number;
}) {
  const deviceLabel = device === "tablet" ? "Tablet" : "Mobile";
  const deviceConfig = responsive[device as "tablet" | "mobile"] || {};

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-medium">{deviceLabel} Overrides</Label>
        <p className="text-[10px] text-muted-foreground">
          Override settings for {device} view. Leave empty to use desktop defaults.
        </p>
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label className="text-xs">Visible on {device}</Label>
        <div className="flex items-center gap-2">
          <Switch
            checked={deviceConfig.visible !== false}
            onCheckedChange={(checked) => onUpdate("visible", checked ? undefined : false)}
          />
          <span className="text-xs text-muted-foreground">
            {deviceConfig.visible !== false ? "Shown" : "Hidden"}
          </span>
        </div>
      </div>

      {/* Typography (for text/heading types) */}
      {(kind === "heading" || kind === "text" || kind === "paragraph") && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Font size</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={deviceConfig.fontSize || ""}
                onChange={(e) => onUpdate("fontSize", e.target.value ? Number(e.target.value) : undefined)}
                placeholder={`${baseFontSize || 18}px`}
                min={8}
                max={120}
                className="h-8 text-xs flex-1"
              />
              <span className="text-xs text-muted-foreground">px</span>
              {deviceConfig.fontSize !== undefined && (
                <button
                  type="button"
                  onClick={() => onClear("fontSize")}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Alignment</Label>
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdate("alignment", deviceConfig.alignment === align ? undefined : align)}
                  className={`flex-1 rounded border px-2 py-1 text-xs ${
                    deviceConfig.alignment === align
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {align === "left" ? "Left" : align === "center" ? "Center" : "Right"}
                </button>
              ))}
            </div>
            {deviceConfig.alignment !== undefined && (
              <button
                type="button"
                onClick={() => onClear("alignment")}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset to default
              </button>
            )}
          </div>
        </>
      )}

      {/* Layout (for grid-based components) */}
      {(kind === "services" || kind === "products" || kind === "gallery" ||
        kind === "testimonials" || kind === "contact") && (
        <div className="space-y-2">
          <Label className="text-xs">Columns</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => onUpdate("columns", deviceConfig.columns === col ? undefined : col)}
                className={`flex-1 rounded border px-2 py-1 text-xs ${
                  deviceConfig.columns === col
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
          {deviceConfig.columns !== undefined && (
            <button
              type="button"
              onClick={() => onClear("columns")}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Reset to default
            </button>
          )}
        </div>
      )}

      {/* Image controls */}
      {(kind === "image" || kind === "photo" || kind === "banner") && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Object fit</Label>
            <select
              value={deviceConfig.objectFit || ""}
              onChange={(e) => onUpdate("objectFit", e.target.value || undefined)}
              className="w-full h-8 rounded border bg-background px-2 text-xs"
            >
              <option value="">Default</option>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
            {deviceConfig.objectFit !== undefined && (
              <button
                type="button"
                onClick={() => onClear("objectFit")}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset to default
              </button>
            )}
          </div>
        </>
      )}

      {/* Button controls */}
      {(kind === "button" || kind === "cta" || kind === "link") && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Button width</Label>
            <div className="flex gap-1">
              {(["auto", "full"] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onUpdate("buttonWidth", deviceConfig.buttonWidth === w ? undefined : w)}
                  className={`flex-1 rounded border px-2 py-1 text-xs ${
                    deviceConfig.buttonWidth === w
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {w === "auto" ? "Auto" : "Full width"}
                </button>
              ))}
            </div>
            {deviceConfig.buttonWidth !== undefined && (
              <button
                type="button"
                onClick={() => onClear("buttonWidth")}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset to default
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Button size</Label>
            <div className="flex gap-1">
              {(["sm", "md", "lg"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdate("buttonSize", deviceConfig.buttonSize === s ? undefined : s)}
                  className={`flex-1 rounded border px-2 py-1 text-xs ${
                    deviceConfig.buttonSize === s
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                </button>
              ))}
            </div>
            {deviceConfig.buttonSize !== undefined && (
              <button
                type="button"
                onClick={() => onClear("buttonSize")}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Reset to default
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Component Editor ────────────────────────────────────────── */

function ComponentEditor({
  component,
  businessId,
  device,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
}: {
  component: WebsiteComponent;
  businessId: string;
  device: DeviceMode;
  onUpdate: (changes: Partial<WebsiteComponent>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
}) {
  const content = parseObject(component.content);
  const props = parseObject(component.props);
  const styleConfig = parseObject(component.styleConfig);
  const responsive = getResponsiveConfig(component.styleConfig);
  const kind = classifyComponent(component);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerFilter, setMediaPickerFilter] = useState<"IMAGE" | "VIDEO">("IMAGE");

  const updateContent = (key: string, value: any) => {
    onUpdate({ content: JSON.stringify({ ...content, [key]: value }) });
  };

  const updateProps = (key: string, value: any) => {
    onUpdate({ props: JSON.stringify({ ...props, [key]: value }) });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({ styleConfig: JSON.stringify({ ...styleConfig, [key]: value }) });
  };

  const updateResponsive = (property: keyof ResponsiveOverride, value: any) => {
    if (device === "desktop") return;
    const newConfig = setResponsiveConfig(component.styleConfig, device as "tablet" | "mobile", {
      ...responsive[device as "tablet" | "mobile"],
      [property]: value,
    });
    onUpdate({ styleConfig: newConfig });
  };

  const clearResponsive = (property: keyof ResponsiveOverride) => {
    if (device === "desktop") return;
    const newConfig = setResponsiveConfig(component.styleConfig, device as "tablet" | "mobile", null);
    onUpdate({ styleConfig: newConfig });
  };

  const handleMediaSelect = (asset: MediaAsset) => {
    if (kind === "image") {
      updateContent("src", asset.signedUrl || `/api/v1/public/business/-/media/${asset.id}/file`);
      updateContent("assetId", asset.id);
    }
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
          <button type="button" onClick={() => onMove(-1)} className="rounded p-1.5 hover:bg-muted" aria-label="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onMove(1)} className="rounded p-1.5 hover:bg-muted" aria-label="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onDuplicate} className="rounded p-1.5 hover:bg-muted" aria-label="Duplicate">
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
              <Button size="sm" variant="outline" className="w-full" onClick={() => { setMediaPickerFilter("IMAGE"); setMediaPickerOpen(true); }}>
                <Image className="h-3.5 w-3.5 mr-1.5" />
                {content.src ? "Change Image" : "Choose Image"}
              </Button>
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
              <Separator />
              <MediaAdjustments
                config={styleConfig}
                onChange={updateStyle}
              />
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
                <button
                  className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => { setMediaPickerFilter("IMAGE"); setMediaPickerOpen(true); }}
                >
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

          {/* Responsive Controls */}
          {device !== "desktop" && (
            <ResponsiveControls
              device={device}
              responsive={responsive}
              kind={kind}
              onUpdate={updateResponsive}
              onClear={clearResponsive}
              baseFontSize={kind === "heading" || kind === "text" ? 18 : undefined}
            />
          )}

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
                    defaultValue={JSON.stringify(styleConfig, null, 2)}
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
        <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete
        </Button>
      </div>

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        businessId={businessId}
        onSelect={handleMediaSelect}
        filter={mediaPickerFilter}
      />
    </div>
  );
}

/* ── Section Editor ──────────────────────────────────────────── */

function SectionEditor({
  section,
  businessId,
  device,
  onUpdate,
  onMove,
  onDuplicate,
  onDelete,
}: {
  section: WebsiteSection;
  businessId: string;
  device: DeviceMode;
  onUpdate: (changes: Partial<WebsiteSection>) => void;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const content = parseObject(section.content);
  const style = parseObject(section.styleConfig);
  const responsive = getResponsiveConfig(section.styleConfig);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBgMedia, setShowBgMedia] = useState(false);

  const updateContent = (key: string, value: any) => {
    onUpdate({ content: JSON.stringify({ ...content, [key]: value }) });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({ styleConfig: JSON.stringify({ ...style, [key]: value }) });
  };

  const updateResponsive = (property: keyof ResponsiveOverride, value: any) => {
    if (device === "desktop") return;
    const newConfig = setResponsiveConfig(section.styleConfig, device as "tablet" | "mobile", {
      ...responsive[device as "tablet" | "mobile"],
      [property]: value,
    });
    onUpdate({ styleConfig: newConfig });
  };

  const clearResponsive = (property: keyof ResponsiveOverride) => {
    if (device === "desktop") return;
    const newConfig = setResponsiveConfig(section.styleConfig, device as "tablet" | "mobile", null);
    onUpdate({ styleConfig: newConfig });
  };

  const bgMedia = style.backgroundMedia || {};

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Edit Section</h3>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} className="rounded p-1.5 hover:bg-muted" aria-label="Move section up">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onMove(1)} className="rounded p-1.5 hover:bg-muted" aria-label="Move section down">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onDuplicate} className="rounded p-1.5 hover:bg-muted" aria-label="Duplicate section">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Section type</Label>
            <Input value={section.sectionType} disabled className="h-8 text-xs" />
          </div>

          {content.heading !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="section-heading" className="text-xs">Heading</Label>
              <Input
                id="section-heading"
                value={content.heading || ""}
                onChange={(e) => updateContent("heading", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          {content.subheading !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="section-subheading" className="text-xs">Subheading</Label>
              <Input
                id="section-subheading"
                value={content.subheading || ""}
                onChange={(e) => updateContent("subheading", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          {content.cta !== undefined && (
            <div className="space-y-2">
              <Label htmlFor="section-cta" className="text-xs">Button text</Label>
              <Input
                id="section-cta"
                value={content.cta || ""}
                onChange={(e) => updateContent("cta", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="section-bg" className="text-xs">Background color</Label>
            <div className="flex gap-2">
              <input
                id="section-bg"
                type="color"
                value={style.backgroundColor || "#ffffff"}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <Input
                value={style.backgroundColor || "#ffffff"}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                placeholder="#ffffff"
                className="h-8 flex-1 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-padding" className="text-xs">Padding</Label>
            <Input
              id="section-padding"
              value={style.padding || "2rem"}
              onChange={(e) => updateStyle("padding", e.target.value)}
              placeholder="2rem"
              className="h-8 text-xs"
            />
          </div>

          <Separator />

          {/* Background Media */}
          <div>
            <button
              type="button"
              onClick={() => setShowBgMedia(!showBgMedia)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              {showBgMedia ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Background Media
            </button>
            {showBgMedia && (
              <div className="mt-3">
                <VideoBackgroundControls
                  config={bgMedia}
                  onChange={(key, value) => updateStyle("backgroundMedia", { ...bgMedia, [key]: value })}
                  businessId={businessId}
                />
              </div>
            )}
          </div>

          {/* Responsive Section Controls */}
          {device !== "desktop" && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs font-medium">
                  {device === "tablet" ? "Tablet" : "Mobile"} Overrides
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Override settings for {device} view. Leave empty to use desktop defaults.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Padding</Label>
                <Input
                  value={responsive[device as "tablet" | "mobile"]?.padding || ""}
                  onChange={(e) => updateResponsive("padding", e.target.value || undefined)}
                  placeholder={style.padding || "2rem"}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Visible on {device}</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={responsive[device as "tablet" | "mobile"]?.visible !== false}
                    onCheckedChange={(checked) => updateResponsive("visible", checked ? undefined : false)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {responsive[device as "tablet" | "mobile"]?.visible !== false ? "Shown" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          Delete Section
        </Button>
      </div>
    </div>
  );
}
