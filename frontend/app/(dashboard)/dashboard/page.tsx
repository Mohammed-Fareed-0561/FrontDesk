"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useBusiness } from "@/hooks/useBusiness";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Globe, Inbox, Banknote, Upload, FileText, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { AnalyticsOverview } from "@/types";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { selected, selectedId, businesses } = useBusiness();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      try {
        const data = await apiClient<AnalyticsOverview>(`/businesses/${selectedId}/analytics/overview`);
        setAnalytics(data);
      } catch {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedId]);

  if (authLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  const setupProgress = () => {
    if (!analytics) return 40;
    let done = 0;
    if (selected) done += 20;
    if ((analytics.counts.products || 0) > 0) done += 25;
    if (analytics.website) done += 25;
    if ((analytics.counts.enquiries || 0) > 0) done += 15;
    if ((analytics.counts.customers || 0) > 0) done += 15;
    return Math.min(100, done);
  };

  const progress = setupProgress();
  const paidRevenue = new Intl.NumberFormat(selected?.locale || "en-IN", {
    style: "currency",
    currency: selected?.currency || "INR",
    maximumFractionDigits: 2,
  }).format(analytics?.financials.paidRevenue ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, {selected?.name || user?.displayName || "there"} 👋</h1>
          <p className="text-muted-foreground">Here’s what needs your attention today.</p>
        </div>
        {businesses.length === 0 && !loading && (
          <Button asChild>
            <Link href="/dashboard/business">Create your first business <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        )}
      </div>

      {/* Setup progress */}
      {selected && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Setup progress</CardTitle>
              <Badge variant={progress === 100 ? "success" : "secondary"}>{progress}%</Badge>
            </div>
            <CardDescription>{progress === 100 ? "You’re all set — keep your catalog fresh!" : "Complete these steps to go live faster."}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="flex items-center gap-2">{(analytics?.counts.products || 0) > 0 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />} Catalog {analytics?.counts.products || 0} products</div>
              <div className="flex items-center gap-2">{analytics?.website?.status === "published" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />} Website {analytics?.website?.status || "draft"}</div>
              <div className="flex items-center gap-2">{(analytics?.counts.enquiries || 0) > 0 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />} {analytics?.counts.newEnquiries || 0} new enquiries</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Products" value={loading ? "-" : String(analytics?.counts.products ?? 0)} icon={Package} href="/dashboard/catalog" sub="in catalog" />
        <StatCard title="New enquiries" value={loading ? "-" : String(analytics?.counts.newEnquiries ?? 0)} icon={Inbox} href="/dashboard/inbox" badge={analytics?.counts.newEnquiries ? `${analytics?.counts.newEnquiries} new` : undefined} />
        <StatCard title="Customers" value={loading ? "-" : String(analytics?.counts.customers ?? 0)} icon={FileText} href="/dashboard/inbox" sub="total" />
        <StatCard title="Payments received" value={loading ? "-" : paidRevenue} icon={Banknote} href="/dashboard/orders" sub="paid payments" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickActionCard title="Import data" description="Website, PDF, CSV or photo — we’ll structure it" icon={Upload} href="/dashboard/importer" primary />
        <QuickActionCard title="Manage catalog" description="Prices, availability, categories" icon={Package} href="/dashboard/catalog" />
        <QuickActionCard title="Website & QR" description="Preview, publish, share QR" icon={Globe} href="/dashboard/website" />
      </div>

      {analytics && analytics.recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>What happened lately — who, what, when</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {analytics.recentEvents.slice(0, 6).map((ev, i) => (
                <li key={i} className="flex items-center justify-between py-3 text-sm">
                  <span className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-muted-foreground" /> <span className="font-medium">{ev.type.replace(/_/g, " ")}</span></span>
                  <span className="text-muted-foreground">{new Date(ev.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!selected && businesses.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <h3 className="font-semibold">Start with your business</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Create your business profile, then import your menu or catalog. We’ll build your website and QR automatically.</p>
            <Button asChild className="mt-4"><Link href="/dashboard/business">Create business</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, href, badge, sub }: { title: string; value: string; icon: React.ElementType; href: string; badge?: string; sub?: string }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value} {badge && <Badge variant="warning" className="ml-2 align-middle">{badge}</Badge>}</div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        <Link href={href} className="mt-2 inline-block text-xs text-muted-foreground hover:text-primary">View →</Link>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, icon: Icon, href, primary }: { title: string; description: string; icon: React.ElementType; href: string; primary?: boolean }) {
  return (
    <Card className={primary ? "border-primary/20" : ""}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`rounded-md p-2 ${primary ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}><Icon className={`h-5 w-5 ${primary ? "text-white" : "text-primary"}`} /></div>
          <div><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent><Button asChild size="sm" variant={primary ? "default" : "outline"}><Link href={href}>Open</Link></Button></CardContent>
    </Card>
  );
}
