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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient, apiClientRaw } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { Search, Plus, BookOpen, Trash2, Eye, RefreshCw, AlertCircle } from "lucide-react";

type KnowledgeDoc = {
  id: string;
  businessId: string;
  title: string;
  content: string;
  sourceType: string;
  status: string;
  createdAt: string;
  chunks: { id: string; content: string; chunkIndex: number }[];
};

export default function KnowledgePage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;

  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceType, setSourceType] = useState("MANUAL");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<KnowledgeDoc | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchDocs = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await apiClient<KnowledgeDoc[]>(`/businesses/${businessId}/knowledge`);
      setDocs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Could not load knowledge", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [businessId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    if (!title.trim() || !content.trim()) return toast({ title: "Title and content required" });
    setCreating(true);
    try {
      const doc = await apiClient<KnowledgeDoc>(`/businesses/${businessId}/knowledge`, { method: "POST", body: { title: title.trim(), content: content.trim(), sourceType } });
      toast({ title: "Knowledge created", description: `${doc.title} — ${doc.chunks?.length || 0} chunks` });
      setShowCreate(false);
      setTitle(""); setContent(""); setSourceType("MANUAL");
      fetchDocs();
    } catch (err: any) {
      toast({ title: "Could not create", description: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!businessId || !confirm("Delete this knowledge source? Chunks will no longer be retrievable.")) return;
    try {
      await apiClient(`/businesses/${businessId}/knowledge/${id}`, { method: "DELETE" });
      toast({ title: "Deleted" });
      fetchDocs();
      setShowDetail(false);
    } catch (e: any) {
      toast({ title: "Could not delete", description: e.message });
    }
  };

  const handleReindex = async (id: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/knowledge/reindex/${id}`, { method: "POST" });
      toast({ title: "Re-indexed" });
      fetchDocs();
    } catch (e: any) {
      toast({ title: "Could not reindex", description: e.message });
    }
  };

  const handleSearch = async () => {
    if (!businessId || !query.trim()) return;
    setSearching(true);
    try {
      const res = await apiClient<any[]>(`/businesses/${businessId}/knowledge/search`, { method: "POST", body: { query: query.trim(), topK: 5 } });
      setResults(Array.isArray(res) ? res : []);
    } catch (e: any) {
      toast({ title: "Search failed", description: e.message });
    } finally {
      setSearching(false);
    }
  };

  const openDetail = async (doc: KnowledgeDoc) => {
    if (!businessId) return;
    try {
      const full = await apiClient<KnowledgeDoc>(`/businesses/${businessId}/knowledge/${doc.id}`);
      setSelected(full);
      setShowDetail(true);
    } catch (e: any) {
      toast({ title: "Could not load", description: e.message });
    }
  };

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Knowledge</h1>
        <Card><CardContent className="py-12 text-center"><BookOpen className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 font-semibold">Create a business first</h3></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Business-provided knowledge for AI. Tenant-isolated, not Business Memory.</p>
        </div>
        <Button data-testid="new-knowledge-btn" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New knowledge</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter by title" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search query for retrieval test" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
              <Button variant="secondary" onClick={handleSearch} disabled={searching || !query.trim()}>{searching ? "..." : "Search"}</Button>
            </div>
          </div>
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">Retrieved ({results.length})</div>
              {results.map((r, i) => (
                <div key={i} className="rounded border p-2 text-sm">
                  <div className="text-xs text-muted-foreground">Score {r.score?.toFixed(2)} · {r.provenance?.title} #{r.provenance?.chunkIndex}</div>
                  <div>{r.content?.slice(0, 200)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><p className="mt-2 font-medium">Could not load</p><p className="text-sm text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchDocs}>Retry</Button></CardContent></Card>
      ) : docs.filter((d) => !search || d.title.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><BookOpen className="h-6 w-6" /></div>
            <h3 className="mt-4 text-lg font-semibold">No knowledge yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Add FAQs, policies, product descriptions for AI to retrieve. Mock embeddings, no external API needed.</p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New knowledge</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Sources · {docs.length}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Source</TableHead><TableHead>Chunks</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {docs.filter((d) => !search || d.title.toLowerCase().includes(search.toLowerCase())).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell><div className="font-medium text-sm">{d.title}</div><div className="text-xs text-muted-foreground">{d.content.slice(0, 60)}...</div></TableCell>
                    <TableCell><Badge variant="outline">{d.sourceType}</Badge></TableCell>
                    <TableCell>{d.chunks?.length || 0}</TableCell>
                    <TableCell><Badge variant={d.status === "active" ? "success" : "secondary"}>{d.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button data-testid="view-knowledge-btn" size="sm" variant="outline" onClick={() => openDetail(d)}><Eye className="mr-1 h-3 w-3" /> View</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleReindex(d.id)}><RefreshCw className="mr-1 h-3 w-3" /> Reindex</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>New knowledge</DialogTitle><DialogDescription>Business-provided knowledge for AI retrieval. Not Business Memory.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input data-testid="knowledge-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Refund policy" required /></div>
            <div className="space-y-2"><Label>Source type</Label><select value={sourceType} onChange={(e) => setSourceType(e.target.value)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="MANUAL">MANUAL</option><option value="FAQ">FAQ</option><option value="POLICY">POLICY</option><option value="PRODUCT">PRODUCT</option></select></div>
            <div className="space-y-2"><Label>Content</Label><Textarea data-testid="knowledge-content" rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="e.g. Refund policy: 30 days..." required /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button data-testid="create-knowledge-btn" type="submit" disabled={creating}>{creating ? "Creating…" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent data-testid="knowledge-detail-dialog" className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>{selected?.sourceType} · {selected?.status} · {selected?.chunks?.length} chunks</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-sm whitespace-pre-wrap rounded border p-3 bg-muted/30">{selected.content}</div>
              <div>
                <div className="text-sm font-medium">Chunks · {selected.chunks.length}</div>
                <div className="mt-2 space-y-2 max-h-60 overflow-auto">
                  {selected.chunks.map((c) => (
                    <div key={c.id} className="rounded border p-2 text-xs">
                      <div className="text-muted-foreground">#{c.chunkIndex} · {c.content.length} chars</div>
                      <div>{c.content.slice(0, 300)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button data-testid="close-knowledge-detail-btn" variant="outline" onClick={() => setShowDetail(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
