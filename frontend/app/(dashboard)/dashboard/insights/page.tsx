"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { Lightbulb, RefreshCw, Eye, XCircle, TrendingDown, MessageSquare, Package, CalendarX, Users, ShoppingBag, AlertTriangle } from "lucide-react";

type Insight = {
  id: string;
  insightType: string;
  severity: string;
  title: string;
  description: string;
  evidence: string;
  status: string;
  source: string;
  detectedAt: string;
};

const severityColors: Record<string, string> = {
  CRITICAL: "destructive",
  HIGH: "destructive",
  MEDIUM: "warning",
  LOW: "secondary",
  INFO: "outline",
};

const insightIcons: Record<string, any> = {
  SALES_DROP: TrendingDown,
  ENQUIRY_BACKLOG: MessageSquare,
  BOOKING_CANCELLATION_SPIKE: CalendarX,
  LOW_CONVERSION: ShoppingBag,
  PRODUCT_UNAVAILABLE: Package,
  CUSTOMER_INACTIVITY: Users,
  OFFER_EXPIRY: AlertTriangle,
};

export default function InsightsPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchInsights = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const data = await apiClient<Insight[]>(`/businesses/${businessId}/insights${params}`);
      setInsights(Array.isArray(data) ? data : []);
    } catch {
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!businessId) return;
    setRefreshing(true);
    try {
      const res = await apiClient<any>(`/businesses/${businessId}/insights/refresh`, { method: "POST" });
      toast({ title: "Refreshed", description: `${res.total || 0} signal(s) detected` });
      fetchInsights();
    } catch (e: any) {
      toast({ title: "Could not refresh", description: e.message });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSeen = async (id: string) => {
    if (!businessId) return;
    await apiClient(`/businesses/${businessId}/insights/${id}/seen`, { method: "POST" }).catch(() => {});
    fetchInsights();
  };

  const handleDismiss = async (id: string) => {
    if (!businessId) return;
    await apiClient(`/businesses/${businessId}/insights/${id}/dismiss`, { method: "POST" }).catch(() => {});
    toast({ title: "Dismissed" });
    fetchInsights();
  };

  useEffect(() => {
    fetchInsights();
  }, [businessId, filter]);

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Insights</h1>
        <Card>
          <CardContent className="py-12 text-center">Create a business to view insights</CardContent>
        </Card>
      </div>
    );
  }

  const newCount = insights.filter((i) => i.status === "new").length;
  const activeInsights = insights.filter((i) => i.status !== "dismissed");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="h-6 w-6" /> Business Insights
          </h1>
          <p className="text-muted-foreground">Deterministic signals from your business data. Refreshed on demand.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh signals"}
        </Button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={newCount > 0 ? "destructive" : "secondary"}>{newCount} new</Badge>
        <Badge variant="outline">{activeInsights.length} active</Badge>
        <Badge variant="outline">{insights.filter((i) => i.status === "dismissed").length} dismissed</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "new", "seen", "dismissed"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Insights list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <CardContent className="py-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : insights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {filter === "all" ? "No signals detected. Try refreshing." : `No ${filter} insights.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {insights.map((ins) => {
            const Icon = insightIcons[ins.insightType] || Lightbulb;
            return (
              <Card key={ins.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-md bg-muted p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{ins.title}</span>
                        <Badge variant={(severityColors[ins.severity] as any) || "outline"}>{ins.severity}</Badge>
                        <Badge variant="outline">{ins.insightType.replace(/_/g, " ")}</Badge>
                        <Badge variant={ins.status === "new" ? "default" : "secondary"}>{ins.status}</Badge>
                        {ins.source && <Badge variant="outline">{ins.source}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{ins.description}</p>
                      {ins.evidence && (
                        <pre className="mt-2 max-h-24 overflow-auto rounded bg-muted p-2 text-xs">{ins.evidence}</pre>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Detected: {new Date(ins.detectedAt).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {ins.status === "new" && (
                        <Button size="sm" variant="outline" onClick={() => handleSeen(ins.id)}>
                          <Eye className="mr-1 h-3 w-3" /> Seen
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDismiss(ins.id)}>
                        <XCircle className="mr-1 h-3 w-3" /> Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
