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
import type { Customer, Service, Booking } from "@/types";
import { Search, Plus, Calendar, Eye, Check, X, Clock, AlertCircle, Trash2, User, Briefcase } from "lucide-react";

function statusBadge(s: string) {
  if (s === "pending") return <Badge variant="warning">pending</Badge>;
  if (s === "confirmed") return <Badge variant="secondary">confirmed</Badge>;
  if (s === "completed") return <Badge variant="success">completed</Badge>;
  if (s === "cancelled") return <Badge variant="destructive">cancelled</Badge>;
  if (s === "no_show") return <Badge variant="outline">no-show</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

export default function BookingsPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Booking | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [customerNotes, setCustomerNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await apiClientRaw(`/businesses/${businessId}/bookings`, {
        params: { page, pageSize: 10, search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined, date: dateFilter || undefined },
      });
      setBookings(raw.data || []);
      setTotal(raw.meta?.total ?? (raw.data?.length || 0));
    } catch (e: any) {
      setError(e.message);
      toast({ title: "Could not load bookings", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesCustomers = async () => {
    if (!businessId) return;
    try {
      const [svcs, custs] = await Promise.all([
        apiClient<Service[]>(`/businesses/${businessId}/services`, { params: { pageSize: 100 } }).catch(() => []),
        apiClient<Customer[]>(`/businesses/${businessId}/customers`, { params: { pageSize: 100 } }).catch(() => []),
      ]);
      setServices(Array.isArray(svcs) ? (svcs as any).data || svcs : []);
      setCustomers(Array.isArray(custs) ? (custs as any).data || custs : []);
      // fallback if apiClient returns {data: []} shape
      if (!Array.isArray(svcs) && (svcs as any)?.data) setServices((svcs as any).data);
      if (!Array.isArray(custs) && (custs as any)?.data) setCustomers((custs as any).data);
    } catch {}
  };

  useEffect(() => { fetchBookings(); }, [businessId, page, statusFilter, dateFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBookings(); }, 400);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { if (showCreate) fetchServicesCustomers(); }, [showCreate, businessId]);

  const openDetail = async (b: Booking) => {
    if (!businessId) return;
    try {
      const full = await apiClient<Booking>(`/businesses/${businessId}/bookings/${b.id}`);
      setSelected(full);
      setShowDetail(true);
    } catch (e: any) {
      toast({ title: "Could not load booking", description: e.message });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    if (!date || !time) return toast({ title: "Select date and time" });
    setCreating(true);
    try {
      let finalCustomerId = customerId || undefined;
      if (!finalCustomerId && (newCustomerName.trim() || newCustomerPhone.trim())) {
        const c = await apiClient<Customer>(`/businesses/${businessId}/customers`, { method: "POST", body: { name: newCustomerName.trim() || undefined, phone: newCustomerPhone.trim() || undefined } });
        finalCustomerId = c.id;
      }
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      const payload: any = {
        customerId: finalCustomerId,
        serviceId: serviceId || undefined,
        startTime,
        durationMinutes: duration ? Number(duration) : undefined,
        customerNotes: customerNotes || undefined,
        internalNotes: internalNotes || undefined,
        source: "MANUAL",
      };
      const created = await apiClient<Booking>(`/businesses/${businessId}/bookings`, { method: "POST", body: payload });
      toast({ title: "Booking created", description: `${created.bookingNumber} — ${new Date(created.startTime).toLocaleString()}` });
      setShowCreate(false);
      setServiceId(""); setCustomerId(""); setNewCustomerName(""); setNewCustomerPhone(""); setDate(""); setTime(""); setDuration("60"); setCustomerNotes(""); setInternalNotes("");
      fetchBookings();
    } catch (err: any) {
      toast({ title: "Could not create booking", description: err.message });
    } finally {
      setCreating(false);
    }
  };

  const doAction = async (action: "confirm" | "cancel" | "complete" | "no_show") => {
    if (!businessId || !selected) return;
    const id = selected.id;
    let url = "";
    let msg = "";
    if (action === "confirm") { url = `/businesses/${businessId}/bookings/${id}/confirm`; msg = "Confirm this booking?"; }
    if (action === "cancel") { url = `/businesses/${businessId}/bookings/${id}/cancel`; msg = "Cancel this booking?"; }
    if (action === "complete") { url = `/businesses/${businessId}/bookings/${id}/complete`; msg = "Mark as completed?"; }
    if (action === "no_show") { url = `/businesses/${businessId}/bookings/${id}/no-show`; msg = "Mark as no-show?"; }
    if (msg && !confirm(msg)) return;
    setActionLoading(action);
    try {
      const updated = await apiClient<Booking>(url, { method: "POST" });
      setSelected(updated);
      toast({ title: `Booking ${action}`, description: `${updated.bookingNumber} is now ${action}` });
      fetchBookings();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message });
    } finally {
      setActionLoading(null);
    }
  };

  const canConfirm = selected?.status === "pending";
  const canCancel = selected?.status === "pending" || selected?.status === "confirmed";
  const canComplete = selected?.status === "confirmed";
  const canNoShow = selected?.status === "confirmed";

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <Card><CardContent className="py-12 text-center"><Calendar className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 font-semibold">Create a business first</h3><p className="text-sm text-muted-foreground">Bookings live inside a business.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage appointments, confirm, complete and handle cancellations. Time is in business timezone.</p>
        </div>
        <Button data-testid="new-booking-btn" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New booking</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by booking number or notes" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 w-40" placeholder="Filter by date" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No-show</option>
              </select>
              <Button variant="outline" onClick={fetchBookings}>Refresh</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : error ? (
        <Card><CardContent className="py-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-destructive" /><p className="mt-2 font-medium">Could not load bookings</p><p className="text-sm text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={fetchBookings}>Retry</Button></CardContent></Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Calendar className="h-6 w-6" /></div>
            <h3 className="mt-4 text-lg font-semibold">{search || statusFilter !== "all" || dateFilter ? "No matches" : "No bookings yet"}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{search ? "Try a different search or clear filters." : "Create your first booking — select customer, service, date and time."}</p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> New booking</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block">
            <CardHeader className="pb-3"><CardTitle className="text-base">Bookings <span className="text-sm font-normal text-muted-foreground">· {total} total</span></CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Booking</TableHead><TableHead>Customer</TableHead><TableHead>Service</TableHead><TableHead>When</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell><div className="font-mono text-sm font-medium">{b.bookingNumber}</div><div className="text-xs text-muted-foreground">{b.source || "MANUAL"}</div></TableCell>
                      <TableCell>{b.customer ? <span className="text-sm">{b.customer.name || b.customer.phone || "—"}</span> : <span className="text-muted-foreground text-sm">— Guest</span>}</TableCell>
                      <TableCell>{b.service ? <span className="text-sm flex items-center gap-1"><Briefcase className="h-3 w-3" />{b.service.name}</span> : <span className="text-muted-foreground text-sm">—</span>}</TableCell>
                      <TableCell><span className="text-sm flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(b.startTime).toLocaleDateString("en-IN")} {new Date(b.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} → {new Date(b.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></TableCell>
                      <TableCell>{statusBadge(b.status)}</TableCell>
                      <TableCell className="text-right"><Button data-testid="view-booking-btn" size="sm" variant="outline" onClick={() => openDetail(b)}><Eye className="mr-2 h-3 w-3" /> View</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:hidden">
            {bookings.map((b) => (
              <Card key={b.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div><div className="font-mono text-sm font-semibold">{b.bookingNumber}</div><div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(b.startTime).toLocaleDateString("en-IN")} {new Date(b.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div></div>
                    <div>{statusBadge(b.status)}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{b.customer?.name || b.customer?.phone || "Guest"}</span>
                    <span className="text-xs flex items-center gap-1"><Briefcase className="h-3 w-3" />{b.service?.name || "—"}</span>
                  </div>
                  <Button data-testid="view-booking-btn" size="sm" variant="outline" className="mt-3 w-full" onClick={() => openDetail(b)}>View details</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Page {page} · {total} bookings</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={bookings.length < 10}>Next</Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent data-testid="booking-detail-dialog" className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2">Booking {selected?.bookingNumber} {selected && statusBadge(selected.status)}</DialogTitle><DialogDescription>Created {selected && new Date(selected.createdAt).toLocaleString("en-IN")} · {selected?.source}</DialogDescription></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Customer</CardTitle></CardHeader><CardContent className="text-sm">
                  {selected.customer ? <><div className="font-medium">{selected.customer.name || "—"}</div><div className="text-muted-foreground">{selected.customer.phone || ""} {selected.customer.email || ""}</div></> : <span className="text-muted-foreground">Guest booking</span>}
                  <div className="mt-2 text-xs text-muted-foreground">ID: {selected.customerId || "—"}</div>
                </CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" /> Service</CardTitle></CardHeader><CardContent className="text-sm">
                  {selected.service ? <><div className="font-medium">{selected.service.name}</div><div className="text-muted-foreground">₹{selected.service.price} · {selected.service.durationMinutes || 60} min</div></> : <span className="text-muted-foreground">— No service</span>}
                </CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Schedule</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Start</span><span>{new Date(selected.startTime).toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">End</span><span>{new Date(selected.endTime).toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span>{Math.round((new Date(selected.endTime).getTime() - new Date(selected.startTime).getTime()) / 60000)} min</span></div>
                  {selected.customerNotes && <div className="pt-2"><span className="font-medium">Customer notes:</span> {selected.customerNotes}</div>}
                  {selected.internalNotes && <div><span className="font-medium">Internal notes:</span> {selected.internalNotes}</div>}
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-2">
                <Button data-testid="confirm-booking-btn" size="sm" disabled={!canConfirm || actionLoading === "confirm"} onClick={() => doAction("confirm")}><Check className="mr-2 h-4 w-4" />{actionLoading === "confirm" ? "..." : "Confirm"}</Button>
                <Button data-testid="complete-booking-btn" size="sm" variant="secondary" disabled={!canComplete || actionLoading === "complete"} onClick={() => doAction("complete")}>Complete</Button>
                <Button data-testid="cancel-booking-btn" size="sm" variant="destructive" disabled={!canCancel || actionLoading === "cancel"} onClick={() => doAction("cancel")}><X className="mr-2 h-4 w-4" />Cancel</Button>
                <Button data-testid="no-show-booking-btn" size="sm" variant="outline" disabled={!canNoShow || actionLoading === "no_show"} onClick={() => doAction("no_show")}>No-show</Button>
                {!canConfirm && !canCancel && !canComplete && !canNoShow && <span className="text-xs text-muted-foreground self-center">No further actions</span>}
              </div>
            </div>
          )}
          <DialogFooter><Button data-testid="close-booking-detail-btn" variant="outline" onClick={() => setShowDetail(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>New booking</DialogTitle><DialogDescription>Select customer, service, date and time. Conflict detection is server-side.</DialogDescription></DialogHeader>
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
                <Label>Service (optional)</Label>
                <select data-testid="service-select" value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">No service / General</option>
                  {services.filter((s) => s.status === "active").map((s) => <option key={s.id} value={s.id}>{s.name} — ₹{s.price} · {s.durationMinutes || 60} min</option>)}
                </select>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input data-testid="booking-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Time</Label><Input data-testid="booking-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
                  <div className="space-y-1"><Label className="text-xs">Duration (min)</Label><Input data-testid="booking-duration" type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Customer notes (optional)</Label>
              <Textarea rows={2} placeholder="Customer request, preferences" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} />
              <Label>Internal notes (optional)</Label>
              <Textarea rows={2} placeholder="Staff notes, private" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button data-testid="create-booking-btn" type="submit" disabled={creating}>{creating ? "Creating…" : "Create booking"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
