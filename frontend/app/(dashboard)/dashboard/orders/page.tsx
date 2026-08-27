"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { apiClient, apiClientRaw } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import type { Product, Customer, Order } from "@/types";
import { Search, Plus, ShoppingBag, Eye, Check, X, PackageCheck, CreditCard, User, Clock, AlertCircle, Trash2 } from "lucide-react";

function statusBadge(status: string) {
  if (status === "pending") return <Badge variant="warning">pending</Badge>;
  if (status === "confirmed") return <Badge variant="secondary">confirmed</Badge>;
  if (status === "completed") return <Badge variant="success">completed</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}
function paymentBadge(s: string | null | undefined) {
  if (!s) return <Badge variant="outline">—</Badge>;
  if (s === "paid") return <Badge variant="success">paid</Badge>;
  if (s === "unpaid") return <Badge variant="warning">unpaid</Badge>;
  if (s === "failed") return <Badge variant="destructive">failed</Badge>;
  if (s === "refunded") return <Badge variant="secondary">refunded</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

type CartItem = { productId: string; name: string; price: number; quantity: number };

export default function OrdersPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await apiClientRaw(`/businesses/${businessId}/orders`, {
        params: { page, pageSize: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined, paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined },
      });
      setOrders(raw.data || []);
      setTotal(raw.meta?.total ?? (raw.data?.length || 0));
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Could not load orders", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsCustomers = async () => {
    if (!businessId) return;
    try {
      const [prods, custs] = await Promise.all([
        apiClient<Product[]>(`/businesses/${businessId}/products`, { params: { pageSize: 100 } }).catch(() => []),
        apiClient<Customer[]>(`/businesses/${businessId}/customers`, { params: { pageSize: 100 } }).catch(() => []),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCustomers(Array.isArray(custs) ? custs : []);
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
  }, [businessId, page, statusFilter, paymentFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchOrders();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (showCreate) fetchProductsCustomers();
  }, [showCreate, businessId]);

  const previewSubtotal = useMemo(() => cart.reduce((s, c) => s + c.price * c.quantity, 0), [cart]);

  const addToCart = () => {
    const p = products.find((x) => x.id === selectedProductId);
    if (!p) return toast({ title: "Select a product" });
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) return toast({ title: "Quantity must be > 0" });
    const existing = cart.find((c) => c.productId === p.id);
    if (existing) {
      setCart(cart.map((c) => (c.productId === p.id ? { ...c, quantity: c.quantity + q } : c)));
    } else {
      setCart([...cart, { productId: p.id, name: p.name, price: p.price ?? 0, quantity: q }]);
    }
    setQty("1");
  };

  const removeCart = (id: string) => setCart(cart.filter((c) => c.productId !== id));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    if (cart.length === 0) return toast({ title: "Add at least one product" });
    setCreating(true);
    try {
      let finalCustomerId = customerId || undefined;
      if (!finalCustomerId && (newCustomerName.trim() || newCustomerPhone.trim())) {
        const c = await apiClient<Customer>(`/businesses/${businessId}/customers`, {
          method: "POST",
          body: { name: newCustomerName.trim() || undefined, phone: newCustomerPhone.trim() || undefined, source: "manual" },
        });
        finalCustomerId = c.id;
      }
      const payload: any = {
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        notes: notes || undefined,
        source: "MANUAL",
        customerId: finalCustomerId,
      };
      const created = await apiClient<Order>(`/businesses/${businessId}/orders`, { method: "POST", body: payload });
      toast({ title: "Order created", description: `${created.orderNumber} — ₹${created.totalAmount} (server totals)` });
      setShowCreate(false);
      setCart([]);
      setNotes("");
      setCustomerId("");
      setNewCustomerName("");
      setNewCustomerPhone("");
      fetchOrders();
    } catch (err: any) {
      toast({ title: "Could not create order", description: err.message });
    } finally {
      setCreating(false);
    }
  };

  const openDetail = async (o: Order) => {
    if (!businessId) return;
    try {
      const full = await apiClient<Order>(`/businesses/${businessId}/orders/${o.id}`);
      setSelected(full);
      setShowDetail(true);
    } catch (e: any) {
      toast({ title: "Could not load order", description: e.message });
    }
  };

  const doAction = async (action: "confirm" | "cancel" | "complete" | "paid" | "unpaid") => {
    if (!businessId || !selected) return;
    const id = selected.id;
    let url = "";
    let body: any = undefined;
    let confirmMsg = "";
    if (action === "confirm") { url = `/businesses/${businessId}/orders/${id}/confirm`; confirmMsg = "Confirm this order?"; }
    if (action === "cancel") { url = `/businesses/${businessId}/orders/${id}/cancel`; confirmMsg = "Cancel this order? This cannot be undone."; }
    if (action === "complete") { url = `/businesses/${businessId}/orders/${id}/complete`; confirmMsg = "Mark as completed?"; }
    if (action === "paid" || action === "unpaid") { url = `/businesses/${businessId}/orders/${id}/payment`; body = { paymentStatus: action }; confirmMsg = `Mark payment as ${action}?`; }
    if (confirmMsg && !confirm(confirmMsg)) return;
    setActionLoading(action);
    try {
      const updated = await apiClient<Order>(url, { method: "POST", body });
      setSelected(updated);
      toast({ title: `Order ${action}`, description: `${updated.orderNumber} is now ${action}` });
      fetchOrders();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const canConfirm = selected?.status === "pending";
  const canCancel = selected?.status === "pending" || selected?.status === "confirmed";
  const canComplete = selected?.status === "confirmed";

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <Card><CardContent className="py-12 text-center"><ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 font-semibold">Create a business first</h3><p className="text-sm text-muted-foreground">Orders live inside a business.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Track orders, confirm, complete and record payment. Totals are calculated server-side.</p>
        </div>
        <Button data-testid="new-order-btn" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New order</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by order number" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="all">All payment</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <Button variant="outline" onClick={fetchOrders}>Refresh</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><p className="mt-2 font-medium">Could not load orders</p><p className="text-sm text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchOrders}>Retry</Button></CardContent></Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><ShoppingBag className="h-6 w-6" /></div>
            <h3 className="mt-4 text-lg font-semibold">{search || statusFilter !== "all" || paymentFilter !== "all" ? "No matches" : "No orders yet"}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{search ? "Try a different search or clear filters." : "Create your first order — select products and quantity. Server will calculate the total."}</p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New order</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block">
            <CardHeader className="pb-3"><CardTitle className="text-base">Orders <span className="text-sm font-normal text-muted-foreground">· {total} total</span></CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell><div className="font-mono text-sm font-medium">{o.orderNumber}</div><div className="text-xs text-muted-foreground">{o.source || "MANUAL"}</div></TableCell>
                      <TableCell>{o.customer ? <span className="text-sm">{o.customer.name || o.customer.phone || o.customer.email || "—"}</span> : <span className="text-muted-foreground text-sm">— Guest</span>}</TableCell>
                      <TableCell><span className="text-sm flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(o.createdAt).toLocaleDateString("en-IN")} {new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></TableCell>
                      <TableCell><span className="font-medium">₹{o.totalAmount ?? o.subtotal ?? 0}</span><span className="text-xs text-muted-foreground"> {o.currency}</span></TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell>{paymentBadge(o.paymentStatus)}</TableCell>
                      <TableCell className="text-right"><Button data-testid="view-order-btn" size="sm" variant="outline" onClick={() => openDetail(o)}><Eye className="mr-2 h-3 w-3" /> View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:hidden">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div><div className="font-mono text-sm font-semibold">{o.orderNumber}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(o.createdAt).toLocaleDateString("en-IN")}</div></div>
                    <div className="flex flex-col items-end gap-1">{statusBadge(o.status)}{paymentBadge(o.paymentStatus)}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{o.customer?.name || o.customer?.phone || "Guest"}</span>
                    <span className="font-semibold">₹{o.totalAmount ?? o.subtotal ?? 0}</span>
                  </div>
                  <Button data-testid="view-order-btn" size="sm" variant="outline" className="mt-3 w-full" onClick={() => openDetail(o)}>View details</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} · {total} orders</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={orders.length < 10}>Next</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent data-testid="order-detail-dialog" className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2">Order {selected?.orderNumber} {selected && statusBadge(selected.status)}</DialogTitle><DialogDescription>Created {selected && new Date(selected.createdAt).toLocaleString("en-IN")} · {selected?.source} · {selected?.currency}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Customer</CardTitle></CardHeader><CardContent className="text-sm">
                  {selected.customer ? <><div className="font-medium">{selected.customer.name || "—"}</div><div className="text-muted-foreground">{selected.customer.phone || ""} {selected.customer.email || ""}</div></> : <span className="text-muted-foreground">Guest order</span>}
                  <div className="mt-2 text-xs text-muted-foreground">ID: {selected.customerId || "—"}</div>
                </CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment</CardTitle></CardHeader><CardContent className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Status</span>{paymentBadge(selected.paymentStatus)}</div>
                  <div className="flex gap-2">
                    <Button data-testid="mark-paid-btn" size="sm" variant="outline" disabled={actionLoading === "paid" || selected.paymentStatus === "paid"} onClick={() => doAction("paid")}>{actionLoading === "paid" ? "..." : "Mark paid"}</Button>
                    <Button data-testid="mark-unpaid-btn" size="sm" variant="ghost" disabled={actionLoading === "unpaid" || selected.paymentStatus === "unpaid"} onClick={() => doAction("unpaid")}>Mark unpaid</Button>
                  </div>
                </CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Items · {selected.items.length}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {selected.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div><div className="font-medium text-sm">{it.nameSnapshot}</div><div className="text-xs text-muted-foreground">₹{it.unitPrice} × {it.quantity}</div></div>
                      <div className="font-medium">₹{it.totalAmount}</div>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{selected.subtotal}</span></div>
                    {(selected.discountAmount || 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{selected.discountAmount}</span></div>}
                    {(selected.taxAmount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>₹{selected.taxAmount}</span></div>}
                    {(selected.deliveryAmount || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>₹{selected.deliveryAmount}</span></div>}
                    <div className="flex justify-between font-semibold text-base pt-2 border-t"><span>Total</span><span>₹{selected.totalAmount}</span></div>
                    <p className="text-xs text-muted-foreground">Server-calculated. Changing product prices does not affect past orders.</p>
                  </div>
                </CardContent>
              </Card>

              {selected.notes && <Card><CardContent className="pt-4"><div className="text-sm"><span className="font-medium">Notes:</span> {selected.notes}</div></CardContent></Card>}

              <div className="flex flex-wrap gap-2">
                <Button data-testid="confirm-btn" size="sm" disabled={!canConfirm || actionLoading === "confirm"} onClick={() => doAction("confirm")}><Check className="mr-2 h-4 w-4" />{actionLoading === "confirm" ? "..." : "Confirm"}</Button>
                <Button data-testid="complete-btn" size="sm" variant="secondary" disabled={!canComplete || actionLoading === "complete"} onClick={() => doAction("complete")}><PackageCheck className="mr-2 h-4 w-4" />Complete</Button>
                <Button data-testid="cancel-btn" size="sm" variant="destructive" disabled={!canCancel || actionLoading === "cancel"} onClick={() => doAction("cancel")}><X className="mr-2 h-4 w-4" />Cancel</Button>
                {!canConfirm && !canCancel && !canComplete && <span className="text-xs text-muted-foreground self-center">No further status actions</span>}
              </div>
            </div>
          )}
          <DialogFooter><Button data-testid="close-detail-btn" variant="outline" onClick={() => setShowDetail(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>New order</DialogTitle><DialogDescription>Select products and quantity. Server will verify prices and calculate totals.</DialogDescription></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer (optional)</Label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">Guest / Walk-in</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name || c.phone || c.email} {c.phone ? `· ${c.phone}` : ""}</option>)}
                </select>
                <div className="text-xs text-muted-foreground">Or create new below</div>
                <Input placeholder="New customer name" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
                <Input placeholder="Phone (e.g. +919876543210)" value={newCustomerPhone} onChange={(e) => setNewCustomerPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea rows={4} placeholder="e.g. Deliver before 5pm, extra packaging" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <Separator />
            <div className="space-y-3">
              <Label>Products</Label>
              <div className="flex gap-2">
                <select data-testid="product-select" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="flex h-10 w-full rounded-md border bg-background px-3 text-sm flex-1">
                  <option value="">Select product</option>
                  {products.filter((p) => p.status === "active").map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.price} {p.availability !== "available" ? `(${p.availability})` : ""}</option>)}
                </select>
                <Input data-testid="qty-input" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} className="w-24" placeholder="Qty" />
                <Button data-testid="add-to-cart-btn" type="button" variant="secondary" onClick={addToCart}><Plus className="h-4 w-4" /></Button>
              </div>

              {cart.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No items yet. Add a product above.</div>
              ) : (
                <div className="space-y-2">
                  {cart.map((c) => (
                    <div key={c.productId} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-muted-foreground">₹{c.price} × {c.quantity} = ₹{c.price * c.quantity}</div></div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCart(c.productId)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex justify-between text-sm"><span>Preview subtotal</span><span>₹{previewSubtotal}</span></div>
                    <p className="text-xs text-muted-foreground mt-1">Final total calculated server-side using current product prices. Discount/tax/delivery server-managed.</p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button data-testid="create-order-btn" type="submit" disabled={creating || cart.length === 0}>{creating ? "Creating…" : "Create order"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
