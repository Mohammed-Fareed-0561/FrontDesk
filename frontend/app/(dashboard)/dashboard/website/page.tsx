"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiClient } from "@/lib/api/client";
import { useBusiness } from "@/hooks/useBusiness";
import type { Website, WebsiteComponent, WebsitePage as WebsitePageRecord, WebsiteSection } from "@/types";
import type { WebsiteTheme } from "@/providers/ThemeProvider";
import { ThemeEditor } from "@/components/website/ThemeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowDown, ArrowUp, Check, Globe, Pencil, Plus, Save, Trash2 } from "lucide-react";

function parseObject(value: string | null | undefined): Record<string, any> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function parseArray(value: string | null | undefined): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function componentLabel(component: WebsiteComponent) {
  const data = parseObject(component.content);
  return String(data.text || data.label || component.componentType);
}

function ordered<T extends { sortOrder: number; id: string }>(items: T[] | undefined) {
  return [...(items || [])].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
}

function toPatch(website: Website) {
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

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export default function WebsitePage() {
  const { selectedId } = useBusiness();
  const { toast } = useToast();
  const [website, setWebsite] = useState<Website | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [componentId, setComponentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pageSaving, setPageSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editPageTitle, setEditPageTitle] = useState("");
  const [editPageSlug, setEditPageSlug] = useState("");
  const [themeSaving, setThemeSaving] = useState(false);

  const loadWebsite = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient<Website>(`/businesses/${selectedId}/website`);
      setWebsite(data);
      setPageId((current) => current && data.pages?.some((page) => page.id === current) ? current : data.pages?.[0]?.id || null);
      setComponentId(null);
    } catch (error: any) {
      setLoadError(error.message || "Could not load website");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { loadWebsite(); }, [loadWebsite]);

  const currentPage = website?.pages?.find((page) => page.id === pageId) || null;
  const selectedComponent = useMemo(() => {
    for (const section of currentPage?.sections || []) {
      const component = section.components?.find((item) => item.id === componentId);
      if (component) return component;
    }
    return null;
  }, [currentPage, componentId]);

  const updateComponent = (changes: Partial<WebsiteComponent>) => {
    if (!website || !selectedComponent) return;
    setWebsite({
      ...website,
      pages: website.pages?.map((page) => ({
        ...page,
        sections: page.sections?.map((section) => ({
          ...section,
          components: section.components?.map((component) => component.id === selectedComponent.id ? { ...component, ...changes } : component),
        })),
      })),
    });
    setSaved(false);
  };

  const updateJsonField = (field: "props" | "content" | "styleConfig", value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("must be an object");
      updateComponent({ [field]: JSON.stringify(parsed) });
    } catch {
      // Invalid JSON remains unchanged and is reported by the save contract if submitted.
    }
  };

  const save = async () => {
    if (!selectedId || !website) return;
    setSaving(true);
    setSaved(false);
    try {
      await apiClient(`/businesses/${selectedId}/website`, { method: "PATCH", body: toPatch(website) });
      setSaved(true);
      toast({ title: "Website changes saved" });
    } catch (error: any) {
      toast({ title: "Could not save website", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const createPage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !website) return;
    setPageSaving(true);
    setPageError(null);
    try {
      const created = await apiClient<WebsitePageRecord>(`/businesses/${selectedId}/website/pages`, {
        method: "POST",
        body: { title: newPageTitle, slug: newPageSlug || slugify(newPageTitle) },
      });
      setWebsite({ ...website, pages: [...(website.pages || []), created] });
      setPageId(created.id);
      setComponentId(null);
      setNewPageTitle("");
      setNewPageSlug("");
      setShowNewPage(false);
      toast({ title: "Page created" });
    } catch (error: any) {
      setPageError(error.message || "Could not create page");
    } finally {
      setPageSaving(false);
    }
  };

  const beginPageEdit = (page: WebsitePageRecord) => {
    setEditingPageId(page.id);
    setEditPageTitle(page.title);
    setEditPageSlug(page.slug);
    setPageError(null);
  };

  const updatePage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !website || !editingPageId) return;
    setPageSaving(true);
    setPageError(null);
    try {
      const updated = await apiClient<WebsitePageRecord>(`/businesses/${selectedId}/website/pages/${editingPageId}`, {
        method: "PATCH",
        body: { title: editPageTitle, slug: editPageSlug },
      });
      setWebsite({ ...website, pages: website.pages?.map((page) => page.id === updated.id ? updated : page) });
      setEditingPageId(null);
      toast({ title: "Page updated" });
    } catch (error: any) {
      setPageError(error.message || "Could not update page");
    } finally {
      setPageSaving(false);
    }
  };

  const saveTheme = async (theme: WebsiteTheme) => {
    if (!selectedId || !website) return;
    setThemeSaving(true);
    try {
      await apiClient(`/businesses/${selectedId}/website/theme`, {
        method: "PATCH",
        body: theme,
      });
      setWebsite({ ...website, themeConfig: JSON.stringify(theme) });
      toast({ title: "Theme saved" });
    } catch (error: any) {
      toast({ title: "Could not save theme", description: error.message });
    } finally {
      setThemeSaving(false);
    }
  };

  const deletePage = async (page: WebsitePageRecord) => {
    if (!selectedId || !website) return;
    setPageSaving(true);
    setPageError(null);
    try {
      await apiClient(`/businesses/${selectedId}/website/pages/${page.id}`, { method: "DELETE" });
      const remaining = (website.pages || []).filter((item) => item.id !== page.id);
      setWebsite({ ...website, pages: remaining });
      if (page.id === pageId) {
        setPageId(remaining[0]?.id || null);
        setComponentId(null);
      }
      toast({ title: "Page deleted" });
    } catch (error: any) {
      setPageError(error.message || "Could not delete page");
    } finally {
      setPageSaving(false);
    }
  };

  const deleteComponent = async () => {
    if (!selectedId || !selectedComponent) return;
    setDeleting(true);
    try {
      await apiClient(`/businesses/${selectedId}/website/components/${selectedComponent.id}`, { method: "DELETE" });
      setComponentId(null);
      await loadWebsite();
      toast({ title: "Component deleted" });
    } catch (error: any) {
      toast({ title: "Could not delete component", description: error.message });
    } finally {
      setDeleting(false);
    }
  };

  const moveComponent = (direction: -1 | 1) => {
    if (!website || !selectedComponent) return;
    const page = website.pages?.find((item) => item.id === pageId);
    const section = page?.sections?.find((item) => item.components?.some((component) => component.id === selectedComponent.id));
    if (!section?.components) return;
    const items = ordered(section.components);
    const index = items.findIndex((item) => item.id === selectedComponent.id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    const components = items.map((component, itemIndex) => ({ ...component, sortOrder: itemIndex }));
    setWebsite({ ...website, pages: website.pages?.map((item) => item.id !== pageId ? item : { ...item, sections: item.sections?.map((candidate) => candidate.id === section.id ? { ...candidate, components } : candidate) }) });
    setSaved(false);
  };

  if (!selectedId) return <EmptyState title="No business selected" description="Create or select a business before opening the website editor." />;
  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-[520px] w-full" /></div>;
  if (loadError) return <EmptyState title="Could not load website" description={loadError}><Button onClick={loadWebsite}>Try again</Button></EmptyState>;
  if (!website) return <EmptyState title="Website is empty" description="This business does not have a website document yet." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">Website editor</h1><p className="text-muted-foreground">Edit structured website content without changing stored configuration into code.</p></div>
        <div className="flex items-center gap-2">{saved && <span className="flex items-center gap-1 text-sm text-green-600"><Check className="h-4 w-4" />Saved</span>}<Button onClick={save} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save changes"}</Button></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <Card className="h-fit"><CardHeader><div className="flex items-center justify-between gap-2"><div><CardTitle className="text-base">Pages</CardTitle><CardDescription>Select a page to edit.</CardDescription></div><Button size="icon" variant="outline" aria-label="Create page" onClick={() => { setShowNewPage((current) => !current); setPageError(null); }}><Plus className="h-4 w-4" /></Button></div></CardHeader><CardContent className="space-y-3">
          {pageError && <p role="alert" className="text-sm text-destructive">{pageError}</p>}
          {showNewPage && <form className="space-y-2 rounded-md border p-3" onSubmit={createPage}><Label htmlFor="new-page-title">Page title</Label><Input id="new-page-title" value={newPageTitle} onChange={(event) => { setNewPageTitle(event.target.value); if (!newPageSlug) setNewPageSlug(slugify(event.target.value)); }} required /><Label htmlFor="new-page-slug">Page slug</Label><Input id="new-page-slug" value={newPageSlug} onChange={(event) => setNewPageSlug(event.target.value)} required /><Button type="submit" aria-label="Submit create page" className="w-full" disabled={pageSaving}>{pageSaving ? "Creating…" : "Create page"}</Button></form>}
          {ordered(website.pages).map((page) => editingPageId === page.id ? <form key={page.id} className="space-y-2 rounded-md border p-3" onSubmit={updatePage}><Label htmlFor={`edit-page-title-${page.id}`}>Page title</Label><Input id={`edit-page-title-${page.id}`} value={editPageTitle} onChange={(event) => setEditPageTitle(event.target.value)} required /><Label htmlFor={`edit-page-slug-${page.id}`}>Page slug</Label><Input id={`edit-page-slug-${page.id}`} value={editPageSlug} onChange={(event) => setEditPageSlug(event.target.value)} required /><div className="flex gap-2"><Button type="submit" disabled={pageSaving}>{pageSaving ? "Saving…" : "Save page"}</Button><Button type="button" variant="ghost" onClick={() => setEditingPageId(null)}>Cancel</Button></div></form> : <div key={page.id} className="flex items-center gap-1"><Button aria-label={`Select ${page.title} page`} variant={page.id === pageId ? "secondary" : "ghost"} className="min-w-0 flex-1 justify-start" onClick={() => { setPageId(page.id); setComponentId(null); }}>{page.title}<span className="ml-auto text-xs text-muted-foreground">/{page.slug}</span></Button><Button size="icon" variant="ghost" aria-label={`Edit ${page.title} page`} onClick={() => beginPageEdit(page)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${page.title} page`} disabled={pageSaving || (website.pages?.length || 0) <= 1} onClick={() => deletePage(page)}><Trash2 className="h-4 w-4" /></Button></div>)}
          {!website.pages?.length && <p className="text-sm text-muted-foreground">No pages yet.</p>}
          {(website.pages?.length || 0) <= 1 && <p className="text-xs text-muted-foreground">The last page cannot be deleted.</p>}
        </CardContent></Card>

        <Card><CardHeader><CardTitle>{currentPage?.title || "Page canvas"}</CardTitle><CardDescription>{currentPage ? `/${currentPage.slug} · Select a component to inspect it.` : "Select a page to begin."}</CardDescription></CardHeader><CardContent className="space-y-4">{!currentPage && <p className="py-12 text-center text-sm text-muted-foreground">This website has no editable pages.</p>}{ordered(currentPage?.sections).map((section) => <SectionCanvas key={section.id} section={section} selectedId={componentId} onSelect={setComponentId} onMove={moveComponent} />)}{currentPage && !currentPage.sections?.length && <p className="py-12 text-center text-sm text-muted-foreground">This page has no sections.</p>}</CardContent></Card>

        <div className="space-y-4">
          <Card className="h-fit"><CardHeader><CardTitle>Properties</CardTitle><CardDescription>{selectedComponent ? selectedComponent.componentType : "No component selected"}</CardDescription></CardHeader><CardContent>{!selectedComponent ? <p className="text-sm text-muted-foreground">Select a component from the canvas to edit supported configuration.</p> : <ComponentProperties component={selectedComponent} onChange={updateComponent} onJsonChange={updateJsonField} onDelete={deleteComponent} deleting={deleting} />}</CardContent></Card>
          <ThemeEditor themeConfig={website.themeConfig} onSave={saveTheme} />
        </div>
      </div>
    </div>
  );
}

function SectionCanvas({ section, selectedId, onSelect, onMove }: { section: WebsiteSection; selectedId: string | null; onSelect: (id: string) => void; onMove: (direction: -1 | 1) => void }) {
  return <div className="rounded-lg border bg-muted/20 p-4"><div className="mb-3 flex items-center justify-between"><div><Badge variant="outline">{section.sectionType}</Badge><p className="mt-1 text-xs text-muted-foreground">Section {section.sortOrder}</p></div></div><div className="space-y-2">{ordered(section.components).map((component, index, items) => <div key={component.id} className={`flex items-center gap-2 rounded-md border bg-background p-3 ${selectedId === component.id ? "border-primary ring-1 ring-primary" : ""}`}><button type="button" className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onSelect(component.id)} aria-label={`Select ${component.componentType} component`}><span className="block font-medium">{component.componentType}</span><span className="block truncate text-xs text-muted-foreground">{componentLabel(component)}</span></button><Button variant="ghost" size="icon" aria-label={`Move ${component.componentType} up`} disabled={index === 0} onClick={() => { onSelect(component.id); onMove(-1); }}><ArrowUp className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Move ${component.componentType} down`} disabled={index === items.length - 1} onClick={() => { onSelect(component.id); onMove(1); }}><ArrowDown className="h-4 w-4" /></Button></div>)}{!section.components?.length && <p className="text-sm text-muted-foreground">No components in this section.</p>}</div></div>;
}

function ComponentProperties({ component, onChange, onJsonChange, onDelete, deleting }: { component: WebsiteComponent; onChange: (changes: Partial<WebsiteComponent>) => void; onJsonChange: (field: "props" | "content" | "styleConfig", value: string) => void; onDelete: () => void; deleting: boolean }) {
  const content = parseObject(component.content);
  const props = parseObject(component.props);
  const style = parseObject(component.styleConfig);
  return <div className="space-y-4"><div className="space-y-2"><Label htmlFor="component-type">Component type</Label><Input id="component-type" value={component.componentType} disabled /></div><div className="space-y-2"><Label htmlFor="component-label">Text or label</Label><Input id="component-label" value={content.text || content.label || ""} onChange={(event) => onChange({ content: JSON.stringify({ ...content, text: event.target.value }) })} placeholder="Component text" /></div><div className="space-y-2"><Label htmlFor="component-props">Props JSON</Label><Textarea id="component-props" defaultValue={JSON.stringify(props, null, 2)} onBlur={(event) => onJsonChange("props", event.target.value)} aria-describedby="component-props-help" /><p id="component-props-help" className="text-xs text-muted-foreground">Object data only; it is never executed as JavaScript.</p></div><div className="space-y-2"><Label htmlFor="component-style">Style JSON</Label><Textarea id="component-style" defaultValue={JSON.stringify(style, null, 2)} onBlur={(event) => onJsonChange("styleConfig", event.target.value)} /></div><Separator /><Button variant="destructive" className="w-full" onClick={onDelete} disabled={deleting}><Trash2 className="mr-2 h-4 w-4" />{deleting ? "Deleting…" : "Delete component"}</Button></div>;
}

function EmptyState({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return <Card><CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center"><Globe className="h-8 w-8 text-muted-foreground" /><h2 className="text-lg font-semibold">{title}</h2><p className="max-w-md text-sm text-muted-foreground">{description}</p>{children}</CardContent></Card>;
}
