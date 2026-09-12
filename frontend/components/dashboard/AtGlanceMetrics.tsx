"use client";

/**
 * UX-IMPLEMENTATION-02 — At a Glance Metrics
 *
 * Shows capability-aware metrics for the selected business.
 * Never displays NaN, undefined, or null in the UI.
 * All values are guarded before rendering.
 */

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Calendar,
  Users,
  Banknote,
  Package,
  MessageSquare,
  Target,
} from "lucide-react";
import type { AnalyticsOverview, Business } from "@/types";
import type { Capability } from "@/config/business";

interface MetricCardProps {
  id: string;
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  href: string;
  loading: boolean;
}

function safeStr(v: unknown): string {
  if (v === null || v === undefined || (typeof v === "number" && !isFinite(v))) {
    return "—";
  }
  return String(v);
}

function MetricCard({ id, title, value, sub, icon: Icon, href, loading }: MetricCardProps) {
  return (
    <Card
      id={id}
      className="hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div
          className="text-2xl font-bold tracking-tight"
          aria-label={`${title}: ${loading ? "Loading" : value}`}
        >
          {loading ? (
            <span className="inline-block h-7 w-20 animate-pulse rounded bg-muted" />
          ) : (
            value
          )}
        </div>
        {sub && !loading && (
          <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
        )}
        <Link
          href={href}
          className="mt-2 inline-block text-xs text-muted-foreground hover:text-primary focus:text-primary focus:outline-none focus:underline"
          aria-label={`View ${title}`}
        >
          View →
        </Link>
      </CardContent>
    </Card>
  );
}

interface AtGlanceProps {
  analytics: AnalyticsOverview | null;
  business: Business | null;
  hasCapability: (cap: Capability) => boolean;
  loading: boolean;
}

function formatCurrency(amount: number, business: Business | null): string {
  if (!isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(business?.locale || "en-IN", {
      style: "currency",
      currency: business?.currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${business?.currency || "₹"} ${amount.toFixed(0)}`;
  }
}

export function AtGlanceMetrics({ analytics, business, hasCapability, loading }: AtGlanceProps) {
  const counts = analytics?.counts;
  const financials = analytics?.financials;

  const metrics: MetricCardProps[] = [];

  // Revenue — always useful if payments capability exists
  if (hasCapability("payments") || hasCapability("orders")) {
    const paid = financials?.paidRevenue ?? 0;
    metrics.push({
      id: "metric-revenue",
      title: "Revenue received",
      value: formatCurrency(isFinite(paid) ? paid : 0, business),
      sub:
        (financials?.pendingRevenue ?? 0) > 0
          ? `+ ${formatCurrency(financials!.pendingRevenue!, business)} pending`
          : undefined,
      icon: Banknote,
      href: "/dashboard/orders",
      loading,
    });
  }

  // Orders
  if (hasCapability("orders")) {
    metrics.push({
      id: "metric-orders",
      title: "Total orders",
      value: safeStr(counts?.orders ?? 0),
      icon: ShoppingBag,
      href: "/dashboard/orders",
      loading,
    });
  }

  // Bookings
  if (hasCapability("bookings")) {
    metrics.push({
      id: "metric-bookings",
      title: "Total bookings",
      value: safeStr(counts?.bookings ?? 0),
      icon: Calendar,
      href: "/dashboard/bookings",
      loading,
    });
  }

  // Customers
  if (hasCapability("customers")) {
    metrics.push({
      id: "metric-customers",
      title: "Customers",
      value: safeStr(counts?.customers ?? 0),
      icon: Users,
      href: "/dashboard/customers",
      loading,
    });
  }

  // Leads (for freelancers / agencies)
  if (hasCapability("leads") && !hasCapability("customers")) {
    metrics.push({
      id: "metric-leads",
      title: "Leads",
      value: safeStr(counts?.customers ?? 0),
      icon: Target,
      href: "/dashboard/customers",
      loading,
    });
  }

  // Products / Catalog / Menu / Services
  if (hasCapability("catalog") || hasCapability("menu") || hasCapability("services")) {
    const label = hasCapability("menu")
      ? "Menu items"
      : hasCapability("services")
      ? "Services"
      : "Products";
    metrics.push({
      id: "metric-products",
      title: label,
      value: safeStr(counts?.products ?? 0),
      icon: hasCapability("services") ? Users : Package,
      href: "/dashboard/catalog",
      loading,
    });
  }

  // New enquiries — always relevant
  if (hasCapability("inbox")) {
    const newEnq = counts?.newEnquiries ?? 0;
    metrics.push({
      id: "metric-enquiries",
      title: "Enquiries",
      value: safeStr(counts?.enquiries ?? 0),
      sub: newEnq > 0 ? `${newEnq} new` : undefined,
      icon: MessageSquare,
      href: "/dashboard/inbox",
      loading,
    });
  }

  if (metrics.length === 0) return null;

  return (
    <section aria-label="At a glance metrics">
      <h2 className="sr-only">At a glance</h2>
      <div
        id="metrics-grid"
        className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.slice(0, 4).map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>
    </section>
  );
}
