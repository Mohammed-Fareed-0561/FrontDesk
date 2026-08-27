"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import type { Category, Product } from "@/types";
import { Search, Plus, Package, Pencil, Trash2, Tag, MoreHorizontal, X, Check, AlertCircle, ShoppingBag } from "lucide-react";

type Paginated<T> = { data: T[]; meta: { page: number; pageSize: number; total: number } };

export default function CatalogPage() {
  const { toast } = useToast();
  const { selected, selectedId } = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // form state
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "", status: "active" as Product["status"], availability: "available" as Product["availability"] });

  const businessId = selectedId;

  const fetchData = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [prodRes, catData] = await Promise.all([
        apiClient<any>(`/businesses/${businessId}/products`, { params: { page, pageSize: 12, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined, categoryId: categoryFilter !== "all" ? categoryFilter : undefined } }),
        apiClient<Category[]>(`/businesses/${businessId}/categories`),
      ]);
      // prodRes is {success,data,meta} but apiClient returns data only; we need meta. Use raw.
      // Our apiClient returns data.data, so to get meta we need to call fetch directly or use alternative.
      // Workaround: fetch products with raw pagination by calling fetch manually for meta.
      // For now, assume prodRes is array and we derive total from length if meta missing.
      // Let's do a second fetch for meta via apiClientRaw if needed.
      if (Array.isArray(prodRes)) {
        setProducts(prodRes);
        setTotal(prodRes.length);
      } else if (prodRes && (prodRes as any).data) {
        setProducts((prodRes as any).data);
        setTotal((prodRes as any).meta?.total ?? (prodRes as any).data.length);
      } else {
        setProducts([]);
      }
      setCategories(catData);
    } catch (e: any) {
      toast({ title: "Could not load catalog", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, page, statusFilter, categoryFilter]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchData();
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", categoryId: "", status: "active", availability: "available" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setShowProductDialog(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: p.price != null ? String(p.price) : "", categoryId: p.categoryId || "", status: p.status, availability: p.availability });
    setShowProductDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    if (!form.name.trim()) return toast({ title: "Name is required" });
    const payload: any = { name: form.name.trim(), description: form.description || undefined, price: form.price ? Number(form.price) : undefined, categoryId: form.categoryId || undefined, status: form.status, availability: form.availability };
    try {
      if (editing) {
        await apiClient(`/businesses/${businessId}/products/${editing.id}`, { method: "PATCH", body: payload });
        toast({ title: "Product updated", description: `${payload.name} saved` });
      } else {
        await apiClient(`/businesses/${businessId}/products`, { method: "POST", body: payload });
        toast({ title: "Product added", description: `${payload.name} is now in your catalog` });
      }
      setShowProductDialog(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast({ title: "Could not save", description: err.message });
    }
  };

  const handleDelete = async (p: Product) => {
    if (!businessId) return;
    if (!confirm(`Remove "${p.name}" from catalog? You can restore it later from archived.`)) return;
    try {
      await apiClient(`/businesses/${businessId}/products/${p.id}`, { method: "DELETE" });
      toast({ title: "Product removed" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Could not delete", description: err.message });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !newCategoryName.trim()) return;
    try {
      await apiClient(`/businesses/${businessId}/categories`, { method: "POST", body: { name: newCategoryName.trim() } });
      toast({ title: "Category added" });
      setNewCategoryName("");
      setShowCategoryDialog(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Could not create category", description: err.message });
    }
  };

  const empty = !loading && products.length === 0;

  if (!selected && !businessId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
          <p className="text-muted-foreground">Manage what customers see.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Create a business first</h3>
            <p className="text-sm text-muted-foreground">Your catalog lives inside a business.</p>
            <Button asChild className="mt-4"><a href="/dashboard/business">Go to Business</a></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
          <p className="text-muted-foreground">Manage products, prices and availability. Changes go live when you publish.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)}><Tag className="mr-2 h-4 w-4" /> Category</Button>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add product</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products, e.g. Chocolate Cake" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : empty ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><ShoppingBag className="h-6 w-6" /></div>
            <h3 className="mt-4 text-lg font-semibold">{search ? "No matches" : "Your catalog is empty"}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{search ? "Try a different search or clear filters." : "Add your first product or import from a website, PDF or spreadsheet."}</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add product</Button>
              <Button variant="outline" asChild><a href="/dashboard/importer">Import</a></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardHeader className="pb-3"><CardTitle className="text-base">Products <span className="text-sm font-normal text-muted-foreground">· {total} total</span></CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-muted sm:flex"><Package className="h-5 w-5 text-muted-foreground" /></div>
                          <div>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">{p.description || "No description"}</div>
                          </div>
                          {p.isFeatured && <Badge variant="success" className="ml-2">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{p.category ? <Badge variant="outline">{p.category.name}</Badge> : <span className="text-muted-foreground text-sm">—</span>}</TableCell>
                      <TableCell>{p.price != null ? `₹${p.price}` : <span className="text-amber-600 text-sm">No price</span>}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={p.status === "active" ? "success" : p.status === "archived" ? "secondary" : "warning"} className="w-fit">{p.status}</Badge>
                          <span className="text-xs text-muted-foreground">{p.availability}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {products.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted"><Package className="h-6 w-6 text-muted-foreground" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium leading-tight">{p.name}</h3>
                        <Badge variant={p.status === "active" ? "success" : "secondary"} className="shrink-0">{p.status}</Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description || "No description"}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="font-medium">{p.price != null ? `₹${p.price}` : "No price"}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground text-xs">{p.availability}</span>
                        {p.category && <Badge variant="outline" className="ml-auto">{p.category.name}</Badge>}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}><Pencil className="mr-2 h-3 w-3" /> Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} · {total} products</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={products.length < 12}>Next</Button>
            </div>
          </div>
        </>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" /> Categories</CardTitle><CardDescription>Group products for your menu</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary" className="px-3 py-1">{c.name}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={(o) => { if (!o) resetForm(); setShowProductDialog(o); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>{editing ? "Update what customers see." : "Add a product to your catalog. You can edit it anytime."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Chocolate Truffle Cake" required /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Rich, moist cake for celebrations" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="650" /></div>
              <div className="space-y-2"><Label>Category</Label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="active">Active — visible to customers</option>
                  <option value="draft">Draft — hidden</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Availability</Label>
                <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value as any })} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="coming_soon">Coming soon</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save changes" : "Add product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>New category</DialogTitle><DialogDescription>Group your products — e.g. Cakes, Beverages.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Cakes" required /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
