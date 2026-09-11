"use client";

import { useMemo } from "react";
import { Globe } from "lucide-react";
import type { WebsitePage, WebsiteSection, WebsiteComponent } from "@/types";
import { ordered, parseObject, componentLabel, getResponsiveConfig, getEffectiveStyle, getResponsiveValue } from "@/lib/designer/utils";
import type { DesignerSelection, DeviceMode } from "@/lib/designer/types";

interface CenterCanvasProps {
  page: WebsitePage | null;
  selection: DesignerSelection;
  device: DeviceMode;
  zoom: number;
  onSelect: (type: "component" | "section", id: string) => void;
  onDeselect: () => void;
}

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

function buildFilterCSS(config: Record<string, any>): string {
  const parts: string[] = [];
  if (config.brightness !== undefined && config.brightness !== 100) parts.push(`brightness(${config.brightness / 100})`);
  if (config.contrast !== undefined && config.contrast !== 100) parts.push(`contrast(${config.contrast / 100})`);
  if (config.saturation !== undefined && config.saturation !== 100) parts.push(`saturate(${config.saturation / 100})`);
  if (config.blur !== undefined && config.blur > 0) parts.push(`blur(${config.blur}px)`);
  if (config.grayscale !== undefined && config.grayscale > 0) parts.push(`grayscale(${config.grayscale / 100})`);
  if (config.hueRotate !== undefined && config.hueRotate > 0) parts.push(`hue-rotate(${config.hueRotate}deg)`);
  return parts.length > 0 ? parts.join(" ") : "none";
}

function buildObjectPosition(config: Record<string, any>): string {
  const pos = config.position || "center";
  const map: Record<string, string> = {
    center: "50% 50%",
    top: "50% 0%",
    bottom: "50% 100%",
    left: "0% 50%",
    right: "100% 50%",
  };
  return map[pos] || map.center;
}

export function CenterCanvas({
  page,
  selection,
  device,
  zoom,
  onSelect,
  onDeselect,
}: CenterCanvasProps) {
  const sections = useMemo(() => ordered(page?.sections), [page?.sections]);

  if (!page) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center space-y-3">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold">Select a page</h2>
          <p className="text-sm text-muted-foreground">Choose a page from the left panel to start editing.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-auto bg-muted/30 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDeselect();
      }}
    >
      <div
        className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden min-h-[600px] transition-all"
        style={{
          maxWidth: DEVICE_WIDTHS[device],
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Let&apos;s build your page</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start with a template or add your own sections.
            </p>
          </div>
        ) : (
          sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              selection={selection}
              device={device}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ── Section Renderer ────────────────────────────────────────── */

function SectionRenderer({
  section,
  selection,
  device,
  onSelect,
}: {
  section: WebsiteSection;
  selection: DesignerSelection;
  device: DeviceMode;
  onSelect: (type: "component" | "section", id: string) => void;
}) {
  const content = parseObject(section.content);
  const rawStyle = parseObject(section.styleConfig);
  const responsive = getResponsiveConfig(section.styleConfig);
  const components = useMemo(() => ordered(section.components), [section.components]);
  const isSelected = selection.type === "section" && selection.id === section.id;
  const bgMedia = rawStyle.backgroundMedia || {};
  const hasVideo = bgMedia.src && bgMedia.type === "video";
  const hasImage = bgMedia.src && bgMedia.type === "image";
  const filterCSS = buildFilterCSS(bgMedia);
  const objectPos = buildObjectPosition(bgMedia);

  const sectionVisible = getResponsiveValue(responsive, device, "visible", true);
  if (!sectionVisible) return null;

  const padding = getResponsiveValue(responsive, device, "padding", rawStyle.padding);
  const bgColor = rawStyle.backgroundColor;

  return (
    <div
      className={`relative group overflow-hidden ${isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"}`}
      style={{
        backgroundColor: bgColor || undefined,
        padding: padding || undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect("section", section.id);
      }}
    >
      {/* Background Video */}
      {hasVideo && (
        <div className="absolute inset-0 z-0">
          <video
            src={bgMedia.src}
            autoPlay={bgMedia.autoplay !== false}
            muted={bgMedia.muted !== false}
            loop={bgMedia.loop !== false}
            playsInline
            poster={bgMedia.poster}
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: bgMedia.fit || "cover",
              objectPosition: objectPos,
              opacity: (bgMedia.opacity ?? 100) / 100,
              filter: filterCSS !== "none" ? filterCSS : undefined,
            }}
          />
          {/* Overlay */}
          {bgMedia.overlay?.enabled && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: bgMedia.overlay.color || "#000000",
                opacity: (bgMedia.overlay.opacity ?? 30) / 100,
              }}
            />
          )}
        </div>
      )}

      {/* Background Image */}
      {hasImage && !hasVideo && (
        <div className="absolute inset-0 z-0">
          <img
            src={bgMedia.src}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{
              objectFit: bgMedia.fit || "cover",
              objectPosition: objectPos,
              opacity: (bgMedia.opacity ?? 100) / 100,
              filter: filterCSS !== "none" ? filterCSS : undefined,
            }}
          />
          {bgMedia.overlay?.enabled && (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: bgMedia.overlay.color || "#000000",
                opacity: (bgMedia.overlay.opacity ?? 30) / 100,
              }}
            />
          )}
        </div>
      )}

      {/* Section label on hover */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="inline-flex items-center rounded bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-white">
          {section.sectionType}
        </span>
      </div>

      {/* Content (on top of background media) */}
      <div className={`relative z-[1] ${(hasVideo || hasImage) ? "text-white" : ""}`}>
        {content.heading && (
          <div className="px-6 pt-8 pb-2">
            <h2 className="text-2xl font-bold">{content.heading}</h2>
          </div>
        )}

        {content.subheading && (hasVideo || hasImage) && (
          <div className="px-6 pb-4">
            <p className="text-sm opacity-90">{content.subheading}</p>
          </div>
        )}

        <div className="p-6">
          {components.length === 0 ? (
            <div className={`py-8 text-center text-sm border border-dashed rounded-lg ${
              (hasVideo || hasImage) ? "border-white/30 text-white/70" : "text-muted-foreground"
            }`}>
              Empty section — add elements from the left panel
            </div>
          ) : (
            <div className="space-y-4">
              {components.map((component) => (
                <ComponentRenderer
                  key={component.id}
                  component={component}
                  isSelected={selection.type === "component" && selection.id === component.id}
                  device={device}
                  onSelect={() => onSelect("component", component.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Component Renderer ──────────────────────────────────────── */

function ComponentRenderer({
  component,
  isSelected,
  device,
  onSelect,
}: {
  component: WebsiteComponent;
  isSelected: boolean;
  device: DeviceMode;
  onSelect: () => void;
}) {
  const content = parseObject(component.content);
  const props = parseObject(component.props);
  const styleConfig = parseObject(component.styleConfig);
  const responsive = getResponsiveConfig(component.styleConfig);
  const kind = component.componentType.toLowerCase();
  const filterCSS = buildFilterCSS(styleConfig);

  const compVisible = getResponsiveValue(responsive, device, "visible", true);
  if (!compVisible) return null;

  const fontSize = getResponsiveValue(responsive, device, "fontSize", undefined);
  const alignment = getResponsiveValue(responsive, device, "alignment", undefined);
  const columns = getResponsiveValue(responsive, device, "columns", undefined);
  const imgFit = getResponsiveValue(responsive, device, "objectFit", undefined);
  const imgPosition = getResponsiveValue(responsive, device, "objectPosition", undefined);
  const btnWidth = getResponsiveValue(responsive, device, "buttonWidth", undefined);
  const btnSize = getResponsiveValue(responsive, device, "buttonSize", undefined);

  const textAlignment = alignment ? { textAlign: alignment as "left" | "center" | "right" } : {};
  const headingStyle = fontSize ? { fontSize: `${fontSize}px` } : {};
  const gridCols = columns || (kind === "gallery" || kind === "carousel" ? 3 : kind === "services" || kind === "service-list" || kind === "testimonials" || kind === "reviews" ? 2 : kind === "products" || kind === "product-list" ? 3 : undefined);
  const gridClass = gridCols === 1 ? "grid-cols-1" : gridCols === 2 ? "grid-cols-2" : gridCols === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <div
      className={`relative group/component rounded transition-all cursor-pointer ${
        isSelected
          ? "ring-2 ring-primary"
          : "hover:ring-1 hover:ring-primary/50"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Component label on hover */}
      <div className="absolute -top-5 left-0 z-10 opacity-0 group-hover/component:opacity-100 transition-opacity">
        <span className="inline-flex items-center rounded bg-foreground/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {component.componentType}
        </span>
      </div>

      {/* Text / Heading */}
      {(kind === "text" || kind === "heading" || kind.includes("hero")) && (
        <div className="py-2" style={{ ...headingStyle, ...textAlignment }}>
          <p className="text-lg font-semibold">{content.text || content.heading || "Text block"}</p>
        </div>
      )}

      {/* Paragraph */}
      {(kind === "paragraph" || kind === "about") && (
        <div className="py-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {content.text || "Paragraph text goes here."}
          </p>
        </div>
      )}

      {/* Image */}
      {(kind === "image" || kind === "photo" || kind === "banner") && (
        <div className="py-2">
          {content.src ? (
            <img
              src={content.src}
              alt={content.alt || "Photo"}
              className="w-full h-48 object-cover rounded-lg"
              style={{
                opacity: (styleConfig.opacity ?? 100) / 100,
                filter: filterCSS !== "none" ? filterCSS : undefined,
                objectFit: imgFit || undefined,
                objectPosition: imgPosition || undefined,
              }}
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Photo placeholder</span>
            </div>
          )}
        </div>
      )}

      {/* Gallery */}
      {(kind === "gallery" || kind === "carousel") && (
        <div className="py-2">
          <div className={`grid ${gridClass} gap-2`}>
            {content.images && content.images.length > 0 ? (
              content.images.map((img: any, i: number) => (
                <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {img.src ? (
                    <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Photo {i + 1}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              [0, 1, 2].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Photo {i + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Button */}
      {(kind === "button" || kind === "cta" || kind === "link") && (
        <div className="py-2" style={textAlignment}>
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md bg-foreground text-background hover:opacity-90 transition-opacity ${
              btnWidth === "full" ? "w-full" : ""
            } ${btnSize === "sm" ? "px-3 py-1.5 text-xs" : btnSize === "lg" ? "px-8 py-3 text-base" : "px-6 py-2.5 text-sm"}`}
          >
            {content.text || "Click me"}
          </button>
        </div>
      )}

      {/* Services */}
      {(kind === "services" || kind === "service-list") && (
        <div className="py-2">
          <div className={`grid ${gridClass} gap-3`}>
            {(content.items || []).length > 0 ? (
              (content.items || []).map((item: any, i: number) => (
                <div key={i} className="rounded-lg border p-3">
                  <p className="font-medium text-sm">{item.name || item.title || `Service ${i + 1}`}</p>
                  {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                </div>
              ))
            ) : (
              <>
                <div className="rounded-lg border p-3"><p className="font-medium text-sm">Service 1</p></div>
                <div className="rounded-lg border p-3"><p className="font-medium text-sm">Service 2</p></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      {(kind === "products" || kind === "product-list") && (
        <div className="py-2">
          <div className={`grid ${gridClass} gap-3`}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <div className="aspect-square bg-muted" />
                <div className="p-2">
                  <p className="text-xs font-medium">Product {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking */}
      {(kind === "booking" || kind === "booking-widget") && (
        <div className="py-2">
          <div className="rounded-lg border p-4 text-center">
            <p className="font-medium">{content.heading || "Book an Appointment"}</p>
            <p className="text-sm text-muted-foreground mt-1">Booking widget</p>
          </div>
        </div>
      )}

      {/* Form */}
      {(kind === "form" || kind === "contact-form") && (
        <div className="py-2">
          <div className="rounded-lg border p-4 space-y-3">
            <p className="font-medium">{content.heading || "Contact Us"}</p>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded" />
              <div className="h-8 bg-muted rounded" />
              <div className="h-16 bg-muted rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Testimonials */}
      {(kind === "testimonials" || kind === "reviews") && (
        <div className="py-2">
          <div className={`grid ${gridClass} gap-3`}>
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg border p-3">
                <p className="text-sm italic text-muted-foreground">&ldquo;Great experience!&rdquo;</p>
                <p className="text-xs font-medium mt-2">Customer {i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      {(kind === "contact" || kind === "contact-info") && (
        <div className="py-2">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="font-medium">{content.heading || "Get in Touch"}</p>
            <p className="text-sm text-muted-foreground">Email: hello@example.com</p>
            <p className="text-sm text-muted-foreground">Phone: (555) 123-4567</p>
          </div>
        </div>
      )}

      {/* Fallback */}
      {![
        "text", "heading", "paragraph", "image", "photo", "banner",
        "gallery", "carousel", "button", "cta", "link",
        "services", "service-list", "products", "product-list",
        "booking", "booking-widget", "form", "contact-form",
        "testimonials", "reviews", "contact", "contact-info",
      ].includes(kind) && (
        <div className="py-2">
          <div className="rounded-lg border p-3 bg-muted/30">
            <p className="text-sm font-medium">{component.componentType}</p>
            <p className="text-xs text-muted-foreground mt-1">{content.text || content.label || "Component"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
