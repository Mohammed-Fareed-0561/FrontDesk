"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { useBusiness } from "@/hooks/useBusiness";
import type { AnalyticsOverview } from "@/types";
import { Activity, BarChart3, Clock, FileText, Package, Globe, Users, MessageSquare, TrendingUp } from "lucide-react";

export default function ActivityPage() {
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    (async () => {
      setLoading(true);
      try {
        const [ov, lg] = await Promise.all([
          apiClient<AnalyticsOverview>(`/businesses/${businessId}/analytics/overview`),
          apiClient<any[]>(`/businesses/${businessId}/audit-logs`),
        ]);
        setOverview(ov);
        setLogs(lg);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [businessId]);

  if (!businessId) return <div className="space-y-6"><h1 className="text-2xl font-bold">Activity</h1><Card><CardContent className="py-12 text-center">Create a business first</CardContent></Card></div>;

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Activity className="h-6 w-6" /> Activity</h1>
        <p className="text-muted-foreground">A simple, trustworthy history — what happened, who did it, when.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Products" value={String(overview?.counts.products ?? 0)} icon={Package} />
        <Metric title="Enquiries" value={String(overview?.counts.enquiries ?? 0)} icon={MessageSquare} sub={`${overview?.counts.newEnquiries ?? 0} new`} />
        <Metric title="Customers" value={String(overview?.counts.customers ?? 0)} icon={Users} />
        <Metric title="Imports" value={String(overview?.counts.imports ?? 0)} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Timeline</CardTitle>
            <CardDescription>Every important change is recorded for you.</CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No activity yet. Publish your website or add a product to see events.</div>
            ) : (
              <ul className="space-y-3">
                {logs.slice(0, 12).map((l) => (
                  <li key={l.id} className="flex gap-3 rounded-md border p-3">
                    <div className="mt-0.5"><div className="h-2 w-2 rounded-full bg-primary" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-medium">{l.action.replace(/_/g, " ")}</span><Badge variant="outline" className="text-xs">{l.entityType || "system"}</Badge><span className="text-muted-foreground">· {l.actorType}:{l.actorId?.slice(0, 6) || "—"}</span></div>
                      <div className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleString("en-IN")}</div>
                      {l.afterData && <div className="mt-1 truncate text-xs text-muted-foreground">{l.afterData.slice(0, 120)}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Website</span><Badge variant={overview?.website?.status === "published" ? "success" : "secondary"}>{overview?.website?.status || "draft"}</Badge></div>
              <div className="flex justify-between"><span>Products</span><span className="font-medium">{overview?.counts.products}</span></div>
              <div className="flex justify-between"><span>New enquiries</span><span className="font-medium">{overview?.counts.newEnquiries}</span></div>
              <div className="flex justify-between"><span>Customers</span><span className="font-medium">{overview?.counts.customers}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> What’s next?</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Connect WhatsApp to turn enquiries into chats.</p>
              <p>Add Business Memory (e.g. “Tamil + English”) so Copilot respects it.</p>
              <Button variant="outline" size="sm" asChild><a href="/dashboard/copilot">Ask Copilot</a></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon, sub }: { title: string; value: string; icon: React.ElementType; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader>
      <CardContent><div className="text-2xl font-bold">{value}</div>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</CardContent>
    </Card>
  );
}
