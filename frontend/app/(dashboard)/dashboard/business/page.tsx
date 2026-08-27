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
import type { Business } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { Building2, MapPin, Phone, Mail, Globe, Clock, Save, Plus } from "lucide-react";
import Link from "next/link";

export default function BusinessPage() {
  const { toast } = useToast();
  const { businesses, selected, selectedId, selectBusiness, loading: bizLoading } = useBusiness();
  const [form, setForm] = useState({ name: "", description: "", businessType: "", industry: "", phone: "", email: "", websiteUrl: "" });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name,
        description: selected.description || "",
        businessType: selected.businessType || "",
        industry: selected.industry || "",
        phone: selected.phone || "",
        email: selected.email || "",
        websiteUrl: selected.websiteUrl || "",
      });
    }
  }, [selected]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await apiClient<Business>(`/businesses/${selected.id}`, { method: "PATCH", body: form });
      toast({ title: "Business updated", description: `${updated.name} saved` });
    } catch (err: any) {
      toast({ title: "Could not save", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await apiClient<Business>("/businesses", { method: "POST", body: form });
      toast({ title: "Business created", description: `${created.name} is ready` });
      selectBusiness(created.id);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      toast({ title: "Could not create", description: err.message });
    } finally {
      setCreating(false);
    }
  };

  if (bizLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business</h1>
          <p className="text-muted-foreground">Create your first business to get started. You can import existing info later.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Create business</CardTitle>
            <CardDescription>We’ll set up a workspace and a starter website for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Business name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Royal Bakes" /></div>
                <div className="space-y-2"><Label>Business type</Label><Input value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} placeholder="bakery, cafe, boutique" /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What do customers love about you?" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hello@..." /></div>
              </div>
              <Button type="submit" disabled={creating}>{creating ? "Creating…" : "Create business"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business</h1>
          <p className="text-muted-foreground">Your business profile — what customers see.</p>
        </div>
        {businesses.length > 1 && (
          <div className="flex items-center gap-2">
            <Label className="text-xs">Business</Label>
            <select value={selectedId || ""} onChange={(e) => selectBusiness(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {selected && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Business information</CardTitle>
              <CardDescription>Keep this accurate — it powers your website, QR and WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Business name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Type</Label><Input value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Website URL</Label><Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://..." /></div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save changes"}</Button>
                  <Button type="button" variant="outline" asChild><Link href="/dashboard/importer">Import data</Link></Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">At a glance</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" />{selected.name} <Badge variant="outline" className="ml-auto">{selected.businessType || "business"}</Badge></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{selected.phone || "Add phone"}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{selected.email || "Add email"}</div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><span className="truncate">{selected.websiteUrl || "No website URL"}</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{selected.slug} <span className="text-muted-foreground">· {selected.currency} · {selected.timezone}</span></div>
                <Separator />
                <div className="text-muted-foreground">Public page</div>
                <Link href={`/b/${selected.slug}`} target="_blank" className="text-primary underline text-sm break-all">{typeof window !== "undefined" ? window.location.origin : ""}/b/{selected.slug}</Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Next steps</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Link href="/dashboard/importer" className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"><span>Import your menu / catalog</span><Plus className="h-4 w-4" /></Link>
                <Link href="/dashboard/catalog" className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"><span>Review products</span><Plus className="h-4 w-4" /></Link>
                <Link href="/dashboard/website" className="flex items-center justify-between rounded-md border p-3 hover:bg-muted"><span>Preview & publish website</span><Plus className="h-4 w-4" /></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
