"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useBusiness } from "@/hooks/useBusiness";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Globe,
  Inbox,
  Banknote,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShoppingBag,
  Users,
  Target,
  Layers,
  ExternalLink,
  Clock,
  TrendingUp,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { AnalyticsOverview } from "@/types";
import { getProfileForBusinessType, mapLegacyBusinessType, DASHBOARD_WIDGETS } from "@/config/business";

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale || "en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function humaniseEvent(type: string): string {
  const map: Record<string, string> = {
    enquiry_created: "New enquiry received",
    enquiry_replied: "Enquiry replied",
    booking_created: "Booking created",
    booking_confirmed: "Booking confirmed",
    booking_cancelled: "Booking cancelled",
    booking_completed: "Booking completed",
    order_created: "New order placed",
    order_confirmed: "Order confirmed",
    order_cancelled: "Order cancelled",
    order_completed: "Order completed",
    product_created: "Product added to catalog",
    product_updated: "Product updated",
    customer_created: "New customer added",
    payment_received: "Payment received",
    website_published: "Website published",
    website_draft: "Website saved as draft",
    import_completed: "Data import completed",
  };
  const key = type.toLowerCase().replace(/ /g, "_");
  return map[key] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { selected, selectedId, businesses, loading: bizLoading } = useBusiness();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Redirect to onboarding if no businesses
  useEffect(() => {
    if (!authLoading && !bizLoading && businesses.length === 0) {
      router.push("/onboarding");
    }
  }, [authLoading, bizLoading, businesses, router]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selectedId) return;
    setAnalyticsLoading(true);
    (async () => {
      try {
        const data = await apiClient<AnalyticsOverview>(`/businesses/${selectedId}/analytics/overview`);
        setAnalytics(data);
      } catch {
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    })();
  }, [selectedId]);

  if (authLoading || bizLoading) {
    return <DashboardSkeleton />;
  }

  const businessType = mapLegacyBusinessType(selected?.businessType ?? null);
  const profile = getProfileForBusinessType(businessType);
  const widgets = DASHBOARD_WIDGETS[businessType] ?? DASHBOARD_WIDGETS.other;
  const modules = (selected?.enabledModules ? JSON.parse(selected.enabledModules) : profile.recommended) as string[];

  const hasOrders = modules.includes("orders") && widgets.includes("today_orders");
  const hasBookings = modules.includes("bookings") && widgets.includes("today_bookings");
  const hasRevenue = modules.includes("payments") || widgets.includes("revenue");
  const hasLeads = modules.includes("leads") && widgets.includes("leads");

  const currency = selected?.currency || "INR";
  const locale = selected?.locale || "en-IN";

  // ── attention items ──────────────────────────────────────────────────────
  type AttentionItem = { label: string; href: string; icon: React.ElementType; variant: "warning" | "info" };
  const attentionItems: AttentionItem[] = [];

  if ((analytics?.counts.newEnquiries ?? 0) > 0) {
    attentionItems.push({
      label: `${analytics!.counts.newEnquiries} unread enquir${analytics!.counts.newEnquiries === 1 ? "y" : "ies"} waiting`,
      href: "/dashboard/inbox",
      icon: Inbox,
      variant: "warning",
    });
  }
  if ((analytics?.counts.products ?? 0) === 0 && modules.includes("catalog")) {
    attentionItems.push({
      label: "Your catalog is empty — add your first product",
      href: "/dashboard/catalog",
      icon: Package,
      variant: "info",
    });
  }
  if (!analytics?.website) {
    attentionItems.push({
      label: "No website yet — set up your online presence",
      href: "/dashboard/website",
      icon: Globe,
      variant: "info",
    });
  } else if (analytics.website.status !== "published") {
    attentionItems.push({
      label: "Your website is not published — visitors can't find you",
      href: "/dashboard/website",
      icon: Globe,
      variant: "warning",
    });
  }
  if ((analytics?.financials.pendingRevenue ?? 0) > 0) {
    attentionItems.push({
      label: `${formatCurrency(analytics!.financials.pendingRevenue!, currency, locale)} in pending payments`,
      href: "/dashboard/orders",
      icon: Banknote,
      variant: "warning",
    });
  }

  // ── stat cards ────────────────────────────────────────────────────────────
  type StatDef = { title: string; value: string | number; icon: React.ElementType; href: string; sub: string };
  const stats: StatDef[] = [];

  if (hasOrders) {
    stats.push({ title: "Orders", value: analyticsLoading ? "…" : (analytics?.counts.orders ?? 0), icon: ShoppingBag, href: "/dashboard/orders", sub: "total orders" });
  }
  if (hasBookings) {
    stats.push({ title: "Bookings", value: analyticsLoading ? "…" : (analytics?.counts.bookings ?? 0), icon: Calendar, href: "/dashboard/bookings", sub: "total bookings" });
  }
  if (hasLeads) {
    stats.push({ title: "Leads", value: analyticsLoading ? "…" : (analytics?.counts.customers ?? 0), icon: Target, href: "/dashboard/customers", sub: "potential clients" });
  }
  if (!hasLeads) {
    stats.push({ title: "Customers", value: analyticsLoading ? "…" : (analytics?.counts.customers ?? 0), icon: Users, href: "/dashboard/inbox", sub: "total customers" });
  }
  if (!hasOrders && !hasBookings) {
    stats.push({ title: "Catalog", value: analyticsLoading ? "…" : (analytics?.counts.products ?? 0), icon: modules.includes("menu") ? Layers : Package, href: "/dashboard/catalog", sub: "items listed" });
  }
  stats.push({ title: "Enquiries", value: analyticsLoading ? "…" : (analytics?.counts.enquiries ?? 0), icon: Inbox, href: "/dashboard/inbox", sub: analytics?.counts.newEnquiries ? `${analytics.counts.newEnquiries} unread` : "all read" });
  if (hasRevenue) {
    stats.push({ title: "Revenue", value: analyticsLoading ? "…" : formatCurrency(analytics?.financials.paidRevenue ?? 0, currency, locale), icon: Banknote, href: "/dashboard/orders", sub: "payments received" });
  }

  // ── quick actions ─────────────────────────────────────────────────────────
  type QuickAction = { label: string; desc: string; href: string; icon: React.ElementType; primary?: boolean };
  const quickActions: QuickAction[] = [];

  if (modules.includes("importer")) {
    quickActions.push({ label: "Import data", desc: "From PDF, CSV, photo, or URL", href: "/dashboard/importer", icon: Upload, primary: true });
  }
  if (modules.includes("catalog") || modules.includes("menu")) {
    quickActions.push({ label: modules.includes("menu") ? "Manage menu" : "Manage catalog", desc: "Prices, categories, availability", href: "/dashboard/catalog", icon: modules.includes("menu") ? Layers : Package });
  }
  if (modules.includes("bookings")) {
    quickActions.push({ label: "View bookings", desc: "Upcoming appointments", href: "/dashboard/bookings", icon: Calendar });
  }
  if (modules.includes("orders")) {
    quickActions.push({ label: "View orders", desc: "Track and fulfil orders", href: "/dashboard/orders", icon: ShoppingBag });
  }
  quickActions.push({ label: "Website & QR", desc: "Preview, publish, share", href: "/dashboard/website", icon: Globe });

  const visibleActions = quickActions.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {selected?.name || user?.displayName || "there"} 👋
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {attentionItems.length > 0
              ? `You have ${attentionItems.length} item${attentionItems.length > 1 ? "s" : ""} that need your attention.`
              : "Everything looks good — here's your overview."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1 sm:mt-0">
          {analytics?.website?.status === "published" && (
            <Button asChild variant="outline" size="sm">
              <a href={selected?.websiteUrl || "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View site
              </a>
            </Button>
          )}
          {analytics?.website?.status !== "published" && (
            <Button asChild size="sm">
              <Link href="/dashboard/website">
                <Globe className="mr-1.5 h-3.5 w-3.5" />
                Publish site
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Attention Banner ── */}
      {attentionItems.length > 0 && (
        <div className="flex flex-col gap-2">
          {attentionItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-accent/50 ${
                item.variant === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                  : "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200"
              }`}
            >
              {item.variant === "warning" ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              ) : (
                <Bell className="h-4 w-4 shrink-0 text-blue-500" />
              )}
              <span className="flex-1 font-medium">{item.label}</span>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-50" />
            </Link>
          ))}
        </div>
      )}

      {/* ── Stats ── */}
      {analyticsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16" />
                <Skeleton className="mt-2 h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.slice(0, 4).map((s) => (
            <StatCard key={s.title} {...s} value={String(s.value)} />
          ))}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleActions.map((a) => (
            <QuickActionCard key={a.label} {...a} />
          ))}
        </div>
      </div>

      {/* ── Website Status ── */}
      <WebsiteStatusCard website={analytics?.website ?? null} loading={analyticsLoading} businessSlug={selected?.slug} />

      {/* ── Recent Activity ── */}
      {analytics && analytics.recentEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>What has happened across your business</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {analytics.recentEvents.slice(0, 8).map((ev, i) => (
                <li key={i} className="flex items-center justify-between px-6 py-3 text-sm hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{humaniseEvent(ev.type)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">{relativeTime(ev.at)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Empty state (new business) ── */}
      {!selected && businesses.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <TrendingUp className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <h3 className="font-semibold text-lg">Start with your business</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Create your business profile, then import your menu or catalog. Your website and QR code will be ready automatically.
            </p>
            <Button asChild className="mt-5">
              <Link href="/dashboard/business">
                Create business <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, href, sub }: { title: string; value: string; icon: React.ElementType; href: string; sub?: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        <Link href={href} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ label, desc, href, icon: Icon, primary }: { label: string; desc: string; href: string; icon: React.ElementType; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-3 rounded-lg border p-4 text-sm transition-all hover:shadow-sm ${
        primary
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
          : "border-border hover:border-primary/20 hover:bg-accent/30"
      }`}
    >
      <div className={`mt-0.5 rounded-md p-1.5 shrink-0 ${primary ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className={`font-medium leading-snug ${primary ? "text-primary" : ""}`}>{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{desc}</p>
      </div>
    </Link>
  );
}

function WebsiteStatusCard({
  website,
  loading,
  businessSlug,
}: {
  website: { status: string; id: string } | null;
  loading: boolean;
  businessSlug?: string;
}) {
  if (loading) return null;

  const published = website?.status === "published";
  const previewUrl = businessSlug ? `/s/${businessSlug}` : null;

  return (
    <Card className={published ? "border-green-200 dark:border-green-900/40" : "border-dashed"}>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${published ? "bg-green-100 dark:bg-green-950/50" : "bg-muted"}`}>
            <Globe className={`h-4 w-4 ${published ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-sm font-medium">
              {published ? "Website is live" : website ? "Website is in draft" : "No website yet"}
            </p>
            <p className="text-xs text-muted-foreground">
              {published
                ? "Customers can find you online."
                : website
                ? "Publish it so customers can find you."
                : "Set up your free online presence."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {published && previewUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Preview
              </a>
            </Button>
          )}
          <Button asChild size="sm" variant={published ? "outline" : "default"}>
            <Link href="/dashboard/website">
              {published ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                  Manage
                </>
              ) : (
                <>
                  <Globe className="mr-1.5 h-3.5 w-3.5" />
                  {website ? "Publish now" : "Create website"}
                </>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-7 w-16" /><Skeleton className="mt-2 h-3 w-20" /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
