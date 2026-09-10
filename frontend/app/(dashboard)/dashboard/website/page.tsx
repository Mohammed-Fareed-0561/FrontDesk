"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { useBusiness } from "@/hooks/useBusiness";
import type { Website, WebsiteComponent, WebsitePage as WebsitePageRecord, WebsiteSection } from "@/types";
import type { WebsiteTheme } from "@/providers/ThemeProvider";
import { parseObject, ordered, toPatch, slugify } from "@/lib/designer/utils";
import type { DesignerSelection, DeviceMode } from "@/lib/designer/types";
import { DesignerTopBar } from "@/components/website/designer/TopBar";
import { LeftPanel } from "@/components/website/designer/LeftPanel";
import { CenterCanvas } from "@/components/website/designer/CenterCanvas";
import { RightPanel } from "@/components/website/designer/RightPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";

export default function WebsiteDesignerPage() {
  const { selectedId } = useBusiness();
  const { toast } = useToast();

  // ── Website data ──────────────────────────────────────────────
  const [website, setWebsite] = useState<Website | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Selection ─────────────────────────────────────────────────
  const [selection, setSelection] = useState<DesignerSelection>({ type: null, id: null });

  // ── UI state ──────────────────────────────────────────────────
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);

  // ── Load website ──────────────────────────────────────────────
  const loadWebsite = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient<Website>(`/businesses/${selectedId}/website`);
      setWebsite(data);
      setCurrentPageId((current) =>
        current && data.pages?.some((page) => page.id === current)
          ? current
          : data.pages?.[0]?.id || null
      );
      setSelection({ type: null, id: null });
      setHasUnsavedChanges(false);
      setSaved(false);
    } catch (error: any) {
      setLoadError(error.message || "Could not load website");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { loadWebsite(); }, [loadWebsite]);

  // ── Derived state ─────────────────────────────────────────────
  const pages = useMemo(() => ordered(website?.pages), [website?.pages]);
  const currentPage = useMemo(
    () => website?.pages?.find((page) => page.id === currentPageId) || null,
    [website?.pages, currentPageId]
  );
  const sections = useMemo(() => ordered(currentPage?.sections), [currentPage?.sections]);

  const selectedComponent = useMemo(() => {
    if (selection.type !== "component" || !currentPage) return null;
    for (const section of currentPage.sections || []) {
      const component = section.components?.find((c) => c.id === selection.id);
      if (component) return component;
    }
    return null;
  }, [currentPage, selection]);

  const selectedSection = useMemo(() => {
    if (selection.type !== "section" || !currentPage) return null;
    return currentPage.sections?.find((s) => s.id === selection.id) || null;
  }, [currentPage, selection]);

  // ── Save ──────────────────────────────────────────────────────
  const save = async () => {
    if (!selectedId || !website) return;
    setSaving(true);
    setSaved(false);
    try {
      await apiClient(`/businesses/${selectedId}/website`, {
        method: "PATCH",
        body: toPatch(website),
      });
      setSaved(true);
      setHasUnsavedChanges(false);
      toast({ title: "Changes saved" });
    } catch (error: any) {
      toast({ title: "Could not save", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Component operations ──────────────────────────────────────
  const markDirty = () => { setHasUnsavedChanges(true); setSaved(false); };

  const updateComponent = (id: string, changes: Partial<WebsiteComponent>) => {
    if (!website) return;
    setWebsite({
      ...website,
      pages: website.pages?.map((page) => ({
        ...page,
        sections: page.sections?.map((section) => ({
          ...section,
          components: section.components?.map((c) =>
            c.id === id ? { ...c, ...changes } : c
          ),
        })),
      })),
    });
    markDirty();
  };

  const deleteComponent = async (id: string) => {
    if (!selectedId || !website) return;
    try {
      await apiClient(`/businesses/${selectedId}/website/components/${id}`, { method: "DELETE" });
      setSelection({ type: null, id: null });
      await loadWebsite();
      toast({ title: "Element deleted" });
    } catch (error: any) {
      toast({ title: "Could not delete", description: error.message });
    }
  };

  const moveComponent = (id: string, direction: -1 | 1) => {
    if (!website || !currentPage) return;
    const section = currentPage.sections?.find((s) =>
      s.components?.some((c) => c.id === id)
    );
    if (!section?.components) return;
    const items = ordered(section.components);
    const index = items.findIndex((c) => c.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    const components = items.map((c, i) => ({ ...c, sortOrder: i }));
    setWebsite({
      ...website,
      pages: website.pages?.map((p) =>
        p.id !== currentPageId
          ? p
          : {
              ...p,
              sections: p.sections?.map((s) =>
                s.id === section.id ? { ...s, components } : s
              ),
            }
      ),
    });
    markDirty();
  };

  const duplicateComponent = (id: string) => {
    if (!website || !currentPage) return;
    const section = currentPage.sections?.find((s) =>
      s.components?.some((c) => c.id === id)
    );
    const original = section?.components?.find((c) => c.id === id);
    if (!section || !original) return;

    const newItem: WebsiteComponent = {
      ...original,
      id: `temp-${Date.now()}`,
      sortOrder: (section.components?.length || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWebsite({
      ...website,
      pages: website.pages?.map((p) =>
        p.id !== currentPageId
          ? p
          : {
              ...p,
              sections: p.sections?.map((s) =>
                s.id === section.id
                  ? { ...s, components: [...(s.components || []), newItem] }
                  : s
              ),
            }
      ),
    });
    markDirty();
    toast({ title: "Element duplicated" });
  };

  const addComponent = (sectionId: string, component: Omit<WebsiteComponent, "id" | "createdAt" | "updatedAt" | "sectionId">) => {
    if (!website || !currentPage) return;
    const newItem: WebsiteComponent = {
      ...component,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sectionId,
    };

    setWebsite({
      ...website,
      pages: website.pages?.map((p) =>
        p.id !== currentPageId
          ? p
          : {
              ...p,
              sections: p.sections?.map((s) =>
                s.id === sectionId
                  ? { ...s, components: [...(s.components || []), newItem] }
                  : s
              ),
            }
      ),
    });
    markDirty();
    toast({ title: "Element added" });
  };

  // ── Section operations ─────────────────────────────────────
  const addSection = (section: {
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
  }) => {
    if (!website || !currentPage) return;
    const newId = `temp-section-${Date.now()}`;
    const newSection: WebsiteSection = {
      ...section,
      id: newId,
      pageId: currentPage.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      styleConfig: section.styleConfig || null,
      visibilityConfig: section.visibilityConfig || null,
      components: (section.components || []).map((c: any, i: number) => ({
        ...c,
        id: `temp-comp-${Date.now()}-${i}`,
        sectionId: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };
    const currentSections = ordered(currentPage.sections || []);
    newSection.sortOrder = currentSections.length;
    newSection.components = (newSection.components || []).map((c: any, i: number) => ({ ...c, sortOrder: i }));

    setWebsite({
      ...website,
      pages: website.pages?.map((p) =>
        p.id !== currentPageId
          ? p
          : { ...p, sections: [...(p.sections || []), newSection] }
      ),
    });
    markDirty();
    toast({ title: "Section added" });
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    if (!website || !currentPage) return;
    const items = ordered(currentPage.sections || []);
    const index = items.findIndex((s) => s.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    const reordered = items.map((s, i) => ({ ...s, sortOrder: i }));

    setWebsite({
      ...website,
      pages: website.pages?.map((p) =>
        p.id !== currentPageId ? p : { ...p, sections: reordered }
      ),
    });
    markDirty();
  };

  const duplicateSection = (id: string) => {
    if (!website || !currentPage) return;
    const original = currentPage.sections?.find((s) => s.id === id);
    if (!original) return;
    const newId = `temp-section-${Date.now()}`;
    const newSection: WebsiteSection = {
      ...original,
      id: newId,
      sortOrder: (currentPage.sections?.length || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: (original.components || []).map((c, i) => ({
        ...c,
        id: `temp-comp-${Date.now()}-${i}`,
        sectionId: newId,
        sortOrder: i,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    setWebsite({
      ...website,
      pages: website.pages?.map((p) =>
        p.id !== currentPageId
          ? p
          : { ...p, sections: [...(p.sections || []), newSection] }
      ),
    });
    markDirty();
    toast({ title: "Section duplicated" });
  };

  const deleteSection = async (id: string) => {
    if (!selectedId || !website || !currentPage) return;
    try {
      await apiClient(`/businesses/${selectedId}/website/sections/${id}`, { method: "DELETE" });
      setSelection({ type: null, id: null });
      await loadWebsite();
      toast({ title: "Section deleted" });
    } catch (error: any) {
      toast({ title: "Could not delete section", description: error.message });
    }
  };

  // ── Page operations ───────────────────────────────────────────
  const createPage = async (title: string, pageSlug: string) => {
    if (!selectedId || !website) return;
    try {
      const created = await apiClient<WebsitePageRecord>(`/businesses/${selectedId}/website/pages`, {
        method: "POST",
        body: { title, slug: pageSlug || slugify(title) },
      });
      setWebsite({ ...website, pages: [...(website.pages || []), created] });
      setCurrentPageId(created.id);
      setSelection({ type: null, id: null });
      toast({ title: "Page created" });
    } catch (error: any) {
      toast({ title: "Could not create page", description: error.message });
    }
  };

  const renamePage = async (id: string, title: string, pageSlug: string) => {
    if (!selectedId || !website) return;
    try {
      const updated = await apiClient<WebsitePageRecord>(`/businesses/${selectedId}/website/pages/${id}`, {
        method: "PATCH",
        body: { title, slug: pageSlug },
      });
      setWebsite({
        ...website,
        pages: website.pages?.map((p) => (p.id === updated.id ? updated : p)),
      });
      toast({ title: "Page renamed" });
    } catch (error: any) {
      toast({ title: "Could not rename page", description: error.message });
    }
  };

  const deletePage = async (id: string) => {
    if (!selectedId || !website) return;
    try {
      await apiClient(`/businesses/${selectedId}/website/pages/${id}`, { method: "DELETE" });
      const remaining = (website.pages || []).filter((p) => p.id !== id);
      setWebsite({ ...website, pages: remaining });
      if (id === currentPageId) {
        setCurrentPageId(remaining[0]?.id || null);
        setSelection({ type: null, id: null });
      }
      toast({ title: "Page deleted" });
    } catch (error: any) {
      toast({ title: "Could not delete page", description: error.message });
    }
  };

  // ── Theme ─────────────────────────────────────────────────────
  const saveTheme = async (theme: WebsiteTheme) => {
    if (!selectedId || !website) return;
    setThemeSaving(true);
    try {
      await apiClient(`/businesses/${selectedId}/website/theme`, {
        method: "PATCH",
        body: theme,
      });
      setWebsite({ ...website, themeConfig: JSON.stringify(theme) });
      toast({ title: "Style saved" });
    } catch (error: any) {
      toast({ title: "Could not save style", description: error.message });
    } finally {
      setThemeSaving(false);
    }
  };

  // ── Preview ───────────────────────────────────────────────────
  const handlePreview = () => {
    if (website?.pages?.[0]) {
      window.open(`/b/${website.pages[0].slug || "home"}`, "_blank");
    }
  };

  // ── Selection helpers ─────────────────────────────────────────
  const handleSelect = (type: "component" | "section", id: string) => {
    setSelection({ type, id });
  };

  const handleDeselect = () => {
    setSelection({ type: null, id: null });
  };

  // ── Loading states ────────────────────────────────────────────
  if (!selectedId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card><CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <Globe className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No business selected</h2>
          <p className="max-w-md text-sm text-muted-foreground">Create or select a business before opening the website editor.</p>
        </CardContent></Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="h-14 border-b bg-white" />
        <div className="flex flex-1">
          <div className="w-[240px] border-r bg-white p-4 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex-1 p-6"><Skeleton className="h-full w-full rounded-lg" /></div>
          <div className="w-[300px] border-l bg-white p-4 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card><CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <Globe className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Could not load website</h2>
          <p className="max-w-md text-sm text-muted-foreground">{loadError}</p>
          <Button onClick={loadWebsite}>Try again</Button>
        </CardContent></Card>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card><CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <Globe className="h-8 w-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Website is empty</h2>
          <p className="max-w-md text-sm text-muted-foreground">This business does not have a website yet.</p>
        </CardContent></Card>
      </div>
    );
  }

  // ── Main editor ───────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Top Bar */}
      <DesignerTopBar
        websiteName={website.name || "My Website"}
        saving={saving}
        saved={saved}
        hasUnsavedChanges={hasUnsavedChanges}
        device={device}
        onDeviceChange={setDevice}
        onPreview={handlePreview}
        onSave={save}
        onPublish={handlePreview}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <LeftPanel
          pages={pages}
          currentPageId={currentPageId}
          sections={sections}
          onSelectPage={(id) => {
            setCurrentPageId(id);
            setSelection({ type: null, id: null });
          }}
          onCreatePage={createPage}
          onRenamePage={renamePage}
          onDeletePage={deletePage}
          onAddSection={addSection}
          onAddComponent={addComponent}
          themeConfig={website.themeConfig}
          onSaveTheme={saveTheme}
          businessId={selectedId}
          onTemplateImported={loadWebsite}
          onSectionPackImported={loadWebsite}
        />

        {/* Center Canvas */}
        <CenterCanvas
          page={currentPage}
          selection={selection}
          device={device}
          zoom={zoom}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
        />

        {/* Right Panel */}
        <div className="w-[300px] border-l bg-white flex flex-col">
          <RightPanel
            selection={selection}
            component={selectedComponent}
            section={selectedSection}
            businessId={selectedId || ""}
            onUpdateComponent={updateComponent}
            onDeleteComponent={deleteComponent}
            onMoveComponent={moveComponent}
            onDuplicateComponent={duplicateComponent}
            onUpdateSection={(id, changes) => {
              if (!website) return;
              setWebsite({
                ...website,
                pages: website.pages?.map((page) => ({
                  ...page,
                  sections: page.sections?.map((s) =>
                    s.id === id ? { ...s, ...changes } : s
                  ),
                })),
              });
              markDirty();
            }}
            onMoveSection={moveSection}
            onDuplicateSection={duplicateSection}
            onDeleteSection={deleteSection}
          />
        </div>
      </div>
    </div>
  );
}
