"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import type { Customer } from "@/types";
import { Users, Search, UserPlus, Phone, Mail, MoreHorizontal } from "lucide-react";

export default function CustomersPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await apiClient<Customer[]>(`/businesses/${businessId}/customers`, { params: search ? { search } : {} });
      setCustomers(data);
    } catch (e: any) {
      toast({ title: "Could not load customers", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [businessId]);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(), 400);
    return () => clearTimeout(t);
  }, [search]);

  if (!businessId) return <div className="space-y-6"><h1 className="text-2xl font-bold">Customers</h1><Card><CardContent className="py-12 text-center">Create a business first</CardContent></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">People who enquired or ordered — kept private per business.</p>
        </div>
        <Badge variant="secondary">{customers.length} total</Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone or email" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-2"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Users className="h-6 w-6" /></div>
            <h3 className="mt-4 font-semibold">No customers yet</h3>
            <p className="text-sm text-muted-foreground">When someone enquires via your website or WhatsApp, they’ll appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">All customers</CardTitle><CardDescription>Private to your business only</CardDescription></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {customers.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">{c.name?.[0] || "?"}</div>
                    <div>
                      <div className="font-medium">{c.name || "Unknown"}</div>
                      <div className="flex gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone || "—"}</span> <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email || "—"}</span></div>
                    </div>
                  </div>
                  <Badge variant="outline">{c.source || "manual"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
