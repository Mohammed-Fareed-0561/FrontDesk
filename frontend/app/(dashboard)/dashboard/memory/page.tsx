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
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { Search, Plus, Brain, Eye, Trash2, Edit, RefreshCw, AlertCircle } from "lucide-react";

type Memory = {
  id: string;
  businessId: string;
  content: string;
  memoryType: string | null;
  scope: string;
  scopeEntityId: string | null;
  priority: string | null;
  status: string;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  deletedAt: string | null;
};

export default function MemoryPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [memoryType, setMemoryType] = useState("PREFERENCE");
  const [scope, setScope] = useState("BUSINESS");
  const [priority, setPriority] = useState("MEDIUM");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchMemories = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await apiClient<Memory[]>(`/businesses/${businessId}/memory`);
      setMemories(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Could not load memories", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMemories(); }, [businessId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !content.trim()) return toast({ title: "Content required" });
    setCreating(true);
    try {
      const m = await apiClient<Memory>(`/businesses/${businessId}/memory`, { method: "POST", body: { content: content.trim(), memoryType, scope, priority, source: "OWNER" } });
      toast({ title: "Memory created", description: m.content.slice(0, 50) });
      setShowCreate(false);
      setContent("");
      fetchMemories();
    } catch (err: any) {
      toast({ title: "Could not create", description: err.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!businessId || !confirm("Delete this memory? It will be archived.")) return;
    try {
      await apiClient(`/businesses/${businessId}/memory/${id}`, { method: "DELETE" });
      toast({ title: "Deleted" });
      fetchMemories();
      setShowDetail(false);
    } catch (e: any) {
      toast({ title: "Could not delete", description: e.message });
    }
  };

  const handleSearch = async () => {
    if (!businessId || !query.trim()) return;
    setSearching(true);
    try {
      const res = await apiClient<any[]>(`/businesses/${businessId}/memory/search`, { method: "POST", body: { query: query.trim(), topK: 5 } });
      setResults(Array.isArray(res) ? res : []);
    } catch (e: any) {
      toast({ title: "Search failed", description: e.message });
    } finally {
      setSearching(false);
    }
  };

  const openDetail = async (m: Memory) => {
    if (!businessId) return;
    try {
      const full = await apiClient<Memory>(`/businesses/${businessId}/memory/${m.id}`);
      setSelected(full);
      setShowDetail(true);
    } catch (e: any) {
      toast({ title: "Could not load", description: e.message });
    }
  };

  const filtered = memories.filter((m) => {
    if (search && !m.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (scopeFilter !== "all" && m.scope !== scopeFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return true;
  });

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Memory</h1>
        <Card><CardContent className="py-12 text-center"><Brain className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 font-semibold">Create a business first</h3></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Memory</h1>
          <p className="text-muted-foreground">Explicit preferences and rules for AI. Tenant-isolated, not Business Knowledge.</p>
        </div>
        <Button data-testid="new-memory-btn" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New memory</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filter by content" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="all">All scopes</option>
                <option value="BUSINESS">BUSINESS</option>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="PRODUCT">PRODUCT</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="superseded">Superseded</option>
              </select>
              <Button variant="outline" onClick={fetchMemories}>Refresh</Button>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="Semantic search query" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1" />
            <Button variant="secondary" onClick={handleSearch} disabled={searching || !query.trim()}>{searching ? "..." : "Search"}</Button>
          </div>
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-medium">Retrieved ({results.length})</div>
              {results.map((r, i) => (
                <div key={i} className="rounded border p-2 text-sm">
                  <div className="text-xs text-muted-foreground">Score {r.score?.toFixed(2)} · {r.scope} {r.scopeEntityId || ""}</div>
                  <div>{r.content?.slice(0, 200)}</div>
                  <div className="text-xs text-muted-foreground">Provenance: {r.provenance?.memoryId} · {r.provenance?.scope}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><p className="mt-2 font-medium">Could not load</p><p className="text-sm text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchMemories}>Retry</Button></CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Brain className="h-6 w-6" /></div>
            <h3 className="mt-4 text-lg font-semibold">No memories yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Add explicit preferences like &ldquo;Never discount premium products&rdquo; for AI to remember.</p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New memory</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Memories · {filtered.length}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Content</TableHead><TableHead>Scope</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell><div className="text-sm max-w-xs truncate">{m.content}</div><div className="text-xs text-muted-foreground">{m.memoryType} · {m.priority}</div></TableCell>
                    <TableCell><Badge variant="outline">{m.scope}</Badge>{m.scopeEntityId && <span className="text-xs text-muted-foreground ml-1">{m.scopeEntityId.slice(0, 6)}</span>}</TableCell>
                    <TableCell><Badge variant={m.status === "active" ? "success" : "secondary"}>{m.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button data-testid="view-memory-btn" size="sm" variant="outline" onClick={() => openDetail(m)}><Eye className="mr-1 h-3 w-3" /> View</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
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
          <DialogHeader><DialogTitle>New memory</DialogTitle><DialogDescription>Explicit business preference for AI. Not chat history.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2"><Label>Content *</Label><Textarea data-testid="memory-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="e.g. Never discount premium products" required rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label><select value={memoryType} onChange={(e) => setMemoryType(e.target.value)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="PREFERENCE">PREFERENCE</option><option value="RULE">RULE</option><option value="INSTRUCTION">INSTRUCTION</option><option value="BRAND_PREFERENCE">BRAND_PREFERENCE</option></select></div>
              <div className="space-y-2"><Label>Scope</Label><select value={scope} onChange={(e) => setScope(e.target.value)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="BUSINESS">BUSINESS</option><option value="CUSTOMER">CUSTOMER</option><option value="PRODUCT">PRODUCT</option><option value="CATEGORY">CATEGORY</option></select></div>
            </div>
            <div className="space-y-2"><Label>Priority</Label><select value={priority} onChange={(e) => setPriority(e.target.value)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="MANDATORY">MANDATORY</option></select></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button data-testid="create-memory-btn" type="submit" disabled={creating}>{creating ? "Creating…" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent data-testid="memory-detail-dialog" className="sm:max-w-xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{selected?.content.slice(0, 60)}</DialogTitle><DialogDescription>{selected?.scope} · {selected?.status} · {selected?.memoryType}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-sm whitespace-pre-wrap rounded border p-3 bg-muted/30">{selected.content}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Scope:</span> {selected.scope} {selected.scopeEntityId || ""}</div>
                <div><span className="text-muted-foreground">Priority:</span> {selected.priority}</div>
                <div><span className="text-muted-foreground">Status:</span> {selected.status}</div>
                <div><span className="text-muted-foreground">Source:</span> {selected.source}</div>
              </div>
              <div className="text-xs text-muted-foreground">Created: {new Date(selected.createdAt).toLocaleString()} · Provenance: {selected.id} · Scope {selected.scope}</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => selected && handleDelete(selected.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
            <Button data-testid="close-memory-detail-btn" variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
