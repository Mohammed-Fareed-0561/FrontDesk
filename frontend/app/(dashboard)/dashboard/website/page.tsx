"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import type { Website } from "@/types";
import { Globe, Eye, UploadCloud, Palette, Layout, QrCode, ExternalLink, Copy, Check, Paintbrush, Smartphone, Monitor } from "lucide-react";
import Link from "next/link";

export default function WebsitePage() {
  const { toast } = useToast();
  const { selected, selectedId } = useBusiness();
  const businessId = selectedId;
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [qr, setQr] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState({ primary: "#0f172a", secondary: "#334155" });

  const fetchWebsite = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const w = await apiClient<Website>(`/businesses/${businessId}/website`);
      setWebsite(w);
      if (w.themeConfig) {
        try {
          const t = JSON.parse(w.themeConfig);
          setTheme({ primary: t.primary || "#0f172a", secondary: t.secondary || "#334155" });
        } catch {}
      }
      const q = await apiClient<any>(`/businesses/${businessId}/qr`).catch(() => null);
      setQr(q);
    } catch (e: any) {
      toast({ title: "Could not load website", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsite();
  }, [businessId]);

  const handleSaveTheme = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      await apiClient(`/businesses/${businessId}/website`, { method: "PATCH", body: { themeConfig: theme } });
      toast({ title: "Theme saved" });
      fetchWebsite();
    } catch (e: any) {
      toast({ title: "Could not save", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!businessId) return;
    setPublishing(true);
    try {
      const res = await apiClient<any>(`/businesses/${businessId}/website/publish`, { method: "POST" });
      toast({ title: "Website published", description: `Version ${res.versionId.slice(0, 8)} is now live` });
      fetchWebsite();
    } catch (e: any) {
      toast({ title: "Publish failed", description: e.message });
    } finally {
      setPublishing(false);
    }
  };

  const copyUrl = async () => {
    if (!qr?.publicUrl) return;
    await navigator.clipboard.writeText(qr.publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!businessId) {
    return <div className="space-y-6"><h1 className="text-2xl font-bold">Website</h1><Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Create a business to build your website.</p><Button asChild className="mt-4"><a href="/dashboard/business">Go to Business</a></Button></CardContent></Card></div>;
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  const publicUrl = qr?.publicUrl || (selected ? `${typeof window !== "undefined" ? window.location.origin : ""}/b/${selected.slug}` : "");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website</h1>
          <p className="text-muted-foreground">Your digital storefront — mobile-first, fast, and always in sync with your catalog.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(previewMode === "desktop" ? "mobile" : "desktop")}>
            {previewMode === "desktop" ? <Smartphone className="mr-2 h-4 w-4" /> : <Monitor className="mr-2 h-4 w-4" />} {previewMode === "desktop" ? "Mobile preview" : "Desktop preview"}
          </Button>
          <Button onClick={handlePublish} disabled={publishing}><UploadCloud className="mr-2 h-4 w-4" />{publishing ? "Publishing…" : website?.status === "published" ? "Publish update" : "Publish"}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Preview</CardTitle><CardDescription>How customers see you — {website?.status === "published" ? "published" : "draft"}</CardDescription></div>
              <Badge variant={website?.status === "published" ? "success" : "warning"}>{website?.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${previewMode === "mobile" ? "max-w-[360px]" : "max-w-full"}`}>
                <div className="bg-gradient-to-b from-slate-900 to-slate-700 p-6 text-white" style={{ background: theme.primary }}>
                  <div className="text-sm opacity-80">Welcome to</div>
                  <h2 className="text-2xl font-bold">{selected?.name}</h2>
                  <p className="mt-1 text-sm opacity-90 line-clamp-2">{selected?.description || "Fresh, local, made with care."}</p>
                  <a href={publicUrl} target="_blank" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">View menu <ExternalLink className="h-3 w-3" /></a>
                </div>
                <div className="p-4 space-y-3">
                  {website?.pages?.[0]?.sections?.slice(0, 3).map((s: any, i: number) => {
                    const c = JSON.parse(s.content);
                    return (
                      <div key={s.id || i} className="rounded-lg border p-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase">{s.sectionType}</div>
                        <div className="font-medium">{c.heading || c.title || s.sectionType}</div>
                        {c.subheading && <div className="text-sm text-muted-foreground">{c.subheading}</div>}
                      </div>
                    );
                  }) || <div className="text-sm text-muted-foreground">No sections yet — your catalog will appear here.</div>}
                </div>
                <div className="flex items-center justify-between border-t p-3 text-xs text-muted-foreground">
                  <span>{selected?.phone || "Add phone"}</span><span>{selected?.slug}.frontdesk</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Layout className="h-4 w-4" /> Pages & sections</CardTitle><CardDescription>Structured — change content, not code. Theme tokens keep design consistent.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {website?.pages?.map((p) => (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between"><span className="font-medium">{p.title}</span><Badge variant="outline">/{p.slug}</Badge></div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.sections?.map((s) => <Badge key={s.id} variant="secondary">{s.sectionType}</Badge>)}
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">No pages yet.</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-4 w-4" /> Theme</CardTitle><CardDescription>One change updates the whole site.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Primary</Label><div className="flex gap-2"><Input type="color" value={theme.primary} onChange={(e) => setTheme({ ...theme, primary: e.target.value })} className="h-9 w-16 p-1" /><Input value={theme.primary} onChange={(e) => setTheme({ ...theme, primary: e.target.value })} /></div></div>
              <div className="space-y-2"><Label>Secondary</Label><div className="flex gap-2"><Input type="color" value={theme.secondary} onChange={(e) => setTheme({ ...theme, secondary: e.target.value })} className="h-9 w-16 p-1" /><Input value={theme.secondary} onChange={(e) => setTheme({ ...theme, secondary: e.target.value })} /></div></div>
              <Button onClick={handleSaveTheme} disabled={saving} className="w-full"><Paintbrush className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save theme"}</Button>
              <p className="text-xs text-muted-foreground">Tokens: --color-primary, --color-secondary. No random colors.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-4 w-4" /> QR & public URL</CardTitle><CardDescription>Share anywhere — menu stays in sync.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-white p-4 text-center">
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted"><QrCode className="h-12 w-12 text-muted-foreground" /></div>
                <p className="mt-2 text-xs text-muted-foreground">QR points to your public page. Print it, stick it, share it.</p>
              </div>
              <div className="flex gap-2">
                <Input readOnly value={publicUrl} className="flex-1 text-xs" />
                <Button size="sm" variant="outline" onClick={copyUrl}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1"><a href={publicUrl} target="_blank"><ExternalLink className="mr-2 h-3 w-3" /> Open</a></Button>
                <Button variant="outline" size="sm" asChild><Link href={`/b/${selected?.slug}`} target="_blank"><Globe className="mr-2 h-3 w-3" /> Preview</Link></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Publish checklist</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Check className={`h-4 w-4 ${selected?.name ? "text-green-600" : "text-muted-foreground"}`} /> Business name</div>
              <div className="flex items-center gap-2"><Check className={`h-4 w-4 ${selected?.phone ? "text-green-600" : "text-muted-foreground"}`} /> Contact</div>
              <div className="flex items-center gap-2"><Check className={`h-4 w-4 ${website?.pages?.length ? "text-green-600" : "text-muted-foreground"}`} /> At least one page</div>
              <Separator />
              <Button onClick={handlePublish} disabled={publishing} className="w-full"><UploadCloud className="mr-2 h-4 w-4" />{publishing ? "Publishing…" : "Publish now"}</Button>
              <p className="text-xs text-muted-foreground">Published version is immutable — you can restore later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
