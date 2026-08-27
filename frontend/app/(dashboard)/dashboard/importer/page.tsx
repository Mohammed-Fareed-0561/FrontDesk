"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import type { ImportJob } from "@/types";
import { Globe, FileText, FileSpreadsheet, Image as ImageIcon, Upload, CheckCircle2, Clock, AlertTriangle, Eye, ArrowRight, Sparkles } from "lucide-react";

const sources = [
  { id: "website" as const, icon: Globe, label: "Website", desc: "Paste your existing website URL", hint: "We’ll extract business info, products and images" },
  { id: "pdf" as const, icon: FileText, label: "PDF", desc: "Upload a menu or brochure", hint: "PDF text is extracted and structured" },
  { id: "csv" as const, icon: FileSpreadsheet, label: "CSV / Excel", desc: "Paste or upload spreadsheet data", hint: "Columns: name, price, category, description" },
  { id: "image" as const, icon: ImageIcon, label: "Image", desc: "Photo of your menu", hint: "We’ll read text from the image (mock for v0.1)" },
];

export default function ImporterPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const [source, setSource] = useState<(typeof sources)[number]["id"]>("website");
  const [url, setUrl] = useState("");
  const [csvText, setCsvText] = useState("name,price,category,description\nCappuccino,120,Beverages,Rich coffee\nVeg Puff,35,Snacks,Crispy puff");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [preview, setPreview] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);

  const businessId = selectedId;

  const fetchJobs = async () => {
    if (!businessId) return;
    setJobsLoading(true);
    try {
      const data = await apiClient<ImportJob[]>(`/businesses/${businessId}/imports`);
      setJobs(data);
    } catch (e: any) {
      toast({ title: "Could not load imports", description: e.message });
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [businessId]);

  const handleImport = async () => {
    if (!businessId) return toast({ title: "Create a business first" });
    setLoading(true);
    try {
      let payload: any = { sourceType: source };
      if (source === "website") {
        if (!url) throw new Error("Enter a website URL");
        payload.url = url;
      } else if (source === "csv") {
        // parse csvText into rawData
        const lines = csvText.trim().split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((l) => {
          const vals = l.split(",");
          const obj: any = {};
          headers.forEach((h, i) => (obj[h] = vals[i]?.trim()));
          return obj;
        });
        payload.rawData = rows;
      } else {
        // pdf/image mock uses same flow without file
        payload.fileName = `${source}-upload`;
      }
      const job = await apiClient<ImportJob>(`/businesses/${businessId}/imports`, { method: "POST", body: payload });
      toast({ title: "Import started", description: `Found items — ready to review` });
      await fetchJobs();
      // auto open preview
      const pv = await apiClient<any>(`/businesses/${businessId}/imports/${job.id}/preview`);
      setPreview(pv);
      setSelectedJob(job);
      setPreviewOpen(true);
    } catch (e: any) {
      toast({ title: "Import failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const openPreview = async (job: ImportJob) => {
    if (!businessId) return;
    try {
      const pv = await apiClient<any>(`/businesses/${businessId}/imports/${job.id}/preview`);
      setPreview(pv);
      setSelectedJob(job);
      setPreviewOpen(true);
    } catch (e: any) {
      toast({ title: "Could not load preview", description: e.message });
    }
  };

  const handleConfirm = async () => {
    if (!businessId || !selectedJob || !preview) return;
    setLoading(true);
    try {
      const approveIds = preview.items.filter((i: any) => i.entityType === "product" || i.entityType === "category").map((i: any) => i.id);
      const res = await apiClient<any>(`/businesses/${businessId}/imports/${selectedJob.id}/confirm`, { method: "POST", body: { approveIds } });
      toast({ title: "Import applied", description: `${res.createdProducts} products, ${res.createdCategories} categories added` });
      setPreviewOpen(false);
      fetchJobs();
    } catch (e: any) {
      toast({ title: "Could not confirm", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Importer</h1>
        <p className="text-muted-foreground">Import your existing business info instead of starting from scratch.</p>
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">Create a business first</p><Button asChild className="mt-4"><a href="/dashboard/business">Go to Business</a></Button></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bring your business here</h1>
        <p className="text-muted-foreground">Import from what you already have. We’ll structure it, you review it, then publish.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1 · Choose source</CardTitle>
          <CardDescription>Pick where your business info lives today.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((s) => {
            const Icon = s.icon;
            const active = source === s.id;
            return (
              <button key={s.id} onClick={() => setSource(s.id as any)} className={`rounded-lg border p-4 text-left transition-all hover:bg-muted ${active ? "ring-2 ring-primary border-primary" : ""}`}>
                <Icon className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="mt-3 font-medium">{s.label}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
                {active && <Badge className="mt-2" variant="secondary"><CheckCircle2 className="mr-1 h-3 w-3" /> Selected</Badge>}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2 · Provide details</CardTitle>
          <CardDescription>
            {source === "website" && "We’ll fetch public info — prices, categories, hours — and let you confirm."}
            {source === "csv" && "Paste CSV with headers. We validate and detect duplicates."}
            {source === "pdf" && "v0.1 demo: we’ll mock extraction. In production, PDF text is parsed."}
            {source === "image" && "v0.1 demo: mocked image OCR. Works without paid AI."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {source === "website" && (
            <div className="space-y-2">
              <Label>Website URL *</Label>
              <div className="flex gap-2">
                <Input placeholder="https://yourbusiness.example" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
                <Button onClick={handleImport} disabled={loading}>{loading ? "Importing…" : "Import"} <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          )}
          {source === "csv" && (
            <div className="space-y-3">
              <Label>CSV data</Label>
              <Textarea rows={6} value={csvText} onChange={(e) => setCsvText(e.target.value)} className="font-mono text-sm" />
              <Button onClick={handleImport} disabled={loading}><Upload className="mr-2 h-4 w-4" />{loading ? "Processing…" : "Process CSV"}</Button>
            </div>
          )}
          {(source === "pdf" || source === "image") && (
            <div className="space-y-3">
              <div className="rounded-md border border-dashed p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Demo import</p>
                <p className="text-xs text-muted-foreground">No file needed for demo — we’ll generate sample products.</p>
              </div>
              <Button onClick={handleImport} disabled={loading}><Sparkles className="mr-2 h-4 w-4" />{loading ? "Extracting…" : "Run demo extraction"}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Recent imports</CardTitle><CardDescription>Status: pending → processing → review_required → completed</CardDescription></div>
          <Button variant="outline" size="sm" onClick={fetchJobs}>Refresh</Button>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : jobs.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No imports yet. Your first import will appear here.</div>
          ) : (
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={j.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={j.status === "completed" ? "success" : j.status === "review_required" ? "warning" : j.status === "failed" ? "destructive" : "secondary"}>{j.status}</Badge>
                    <span className="font-medium">{j.sourceType}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[180px]">{j.sourceReference}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground hidden sm:inline">{new Date(j.createdAt).toLocaleString("en-IN")}</span>
                    <Button size="sm" variant="outline" onClick={() => openPreview(j)}><Eye className="mr-2 h-3 w-3" /> Review</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Review import</DialogTitle>
            <DialogDescription>Check what we found. Uncheck anything you don’t want. Conflicts are highlighted.</DialogDescription>
          </DialogHeader>
          {!preview ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-5">
              {preview.conflicts?.length > 0 && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 font-medium text-amber-800"><AlertTriangle className="h-4 w-4" /> {preview.conflicts.length} conflict(s) — price differs from your catalog</div>
                  <ul className="mt-2 space-y-1 text-sm text-amber-900">
                    {preview.conflicts.map((c: any) => (
                      <li key={c.id} className="flex justify-between"><span>{c.entityType}</span><span>Existing ₹{JSON.parse(c.existingValue||"{}").price} → Imported ₹{JSON.parse(c.importedValue||"{}").price}</span></li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-amber-700">On confirm, new products are added; existing price conflicts are kept as-is (choose “use imported” in full version).</p>
                </div>
              )}
              <div>
                <h4 className="font-medium">Products found · {preview.items.filter((i: any) => i.entityType === "product").length}</h4>
                <div className="mt-2 grid gap-2">
                  {preview.items.filter((i: any) => i.entityType === "product").map((it: any) => {
                    const d = typeof it.entityData === "string" ? JSON.parse(it.entityData) : it.entityData;
                    return (
                      <div key={it.id} className="flex items-center justify-between rounded-md border p-3">
                        <div><div className="font-medium">{d.name}</div><div className="text-sm text-muted-foreground">{d.category} · ₹{d.price}</div></div>
                        <Badge variant="outline">conf {Math.round((it.confidenceScore||0.9)*100)}%</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
                <Clock className="h-4 w-4" /> Import <span className="font-medium">{selectedJob?.id.slice(0, 8)}</span> · {preview.items.length} items
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button onClick={handleConfirm} disabled={loading}>{loading ? "Applying…" : "Approve & add to catalog"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
