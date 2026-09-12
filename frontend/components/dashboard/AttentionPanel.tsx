"use client";

/**
 * UX-IMPLEMENTATION-02 — Needs Your Attention
 *
 * Surfaces only items backed by real data.
 * Each attention item leads to an actionable next step.
 * Never displays empty/zero/null counts as alerts.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  ShoppingBag,
  Globe,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { AnalyticsOverview } from "@/types";
import type { Capability } from "@/config/business";

interface AttentionItem {
  id: string;
  icon: React.ElementType;
  message: string;
  action: string;
  href: string;
  level: "warning" | "info";
}

interface NeedsAttentionProps {
  analytics: AnalyticsOverview | null;
  hasCapability: (cap: Capability) => boolean;
}

export function NeedsAttention({ analytics, hasCapability }: NeedsAttentionProps) {
  const items: AttentionItem[] = [];

  if (!analytics) return null;

  // Pending orders
  const pendingOrders = analytics.counts.orders; // We track this from overview
  // We only have total order count here; pending orders attention shown if orders→pending>0
  // The overview gives total orders — we'll use the pending check from the page layer
  // (this component receives pre-computed data, see page for derivation)

  // New (unread) enquiries
  const newEnquiries = analytics.counts.newEnquiries ?? 0;
  if (newEnquiries > 0 && hasCapability("inbox")) {
    items.push({
      id: "new-enquiries",
      icon: AlertTriangle,
      message:
        newEnquiries === 1
          ? "1 new enquiry needs a reply"
          : `${newEnquiries} new enquiries need a reply`,
      action: "View Inbox",
      href: "/dashboard/inbox",
      level: "warning",
    });
  }

  // Website not published
  const websiteStatus = analytics.website?.status;
  if (websiteStatus && websiteStatus !== "published" && hasCapability("website")) {
    items.push({
      id: "website-unpublished",
      icon: Globe,
      message:
        websiteStatus === "draft"
          ? "Your website isn't published yet — customers can't find you"
          : "Your website has unpublished changes",
      action: "Edit Website",
      href: "/dashboard/website",
      level: "info",
    });
  }

  if (items.length === 0) {
    return (
      <Card
        id="needs-attention-card"
        className="border-green-200 dark:border-green-900"
      >
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2
            className="h-5 w-5 flex-shrink-0 text-green-600"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Everything looks good — nothing urgent right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="needs-attention-card">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Needs Your Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border px-0 pb-0">
        {items.map((item) => (
          <div
            key={item.id}
            id={`attention-${item.id}`}
            className="flex items-center justify-between gap-4 px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={`h-4 w-4 flex-shrink-0 ${
                  item.level === "warning"
                    ? "text-amber-500"
                    : "text-muted-foreground"
                }`}
                aria-hidden="true"
              />
              <span className="text-sm text-foreground">{item.message}</span>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="flex-shrink-0 text-xs"
            >
              <Link href={item.href}>{item.action}</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Exported attention builders for the page — keeps business logic in the page layer
export function buildAttentionItems(
  analytics: AnalyticsOverview,
  hasCapability: (cap: Capability) => boolean,
  pendingOrderCount: number,
  pendingBookingCount: number,
): AttentionItem[] {
  const items: AttentionItem[] = [];

  const newEnquiries = analytics.counts.newEnquiries ?? 0;
  if (newEnquiries > 0 && hasCapability("inbox")) {
    items.push({
      id: "new-enquiries",
      icon: AlertTriangle,
      message:
        newEnquiries === 1
          ? "1 new enquiry needs a reply"
          : `${newEnquiries} new enquiries need a reply`,
      action: "View Inbox",
      href: "/dashboard/inbox",
      level: "warning",
    });
  }

  if (pendingOrderCount > 0 && hasCapability("orders")) {
    items.push({
      id: "pending-orders",
      icon: ShoppingBag,
      message:
        pendingOrderCount === 1
          ? "1 order is waiting to be confirmed"
          : `${pendingOrderCount} orders are waiting to be confirmed`,
      action: "View Orders",
      href: "/dashboard/orders",
      level: "warning",
    });
  }

  if (pendingBookingCount > 0 && (hasCapability("bookings"))) {
    items.push({
      id: "pending-bookings",
      icon: Calendar,
      message:
        pendingBookingCount === 1
          ? "1 booking request awaits confirmation"
          : `${pendingBookingCount} booking requests await confirmation`,
      action: "View Bookings",
      href: "/dashboard/bookings",
      level: "warning",
    });
  }

  const websiteStatus = analytics.website?.status;
  if (websiteStatus && websiteStatus !== "published" && hasCapability("website")) {
    items.push({
      id: "website-unpublished",
      icon: Globe,
      message:
        websiteStatus === "draft"
          ? "Your website isn't published — customers can't find you online"
          : "Your website has unpublished changes",
      action: "Edit Website",
      href: "/dashboard/website",
      level: "info",
    });
  }

  return items;
}

interface AttentionPanelProps {
  items: AttentionItem[];
}

export function AttentionPanel({ items }: AttentionPanelProps) {
  if (items.length === 0) {
    return (
      <Card
        id="needs-attention-card"
        className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
      >
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle2
            className="h-5 w-5 flex-shrink-0 text-green-600"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Everything looks good — nothing urgent right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="needs-attention-card">
      <CardHeader className="pb-1 pt-4 px-5">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Needs Your Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border px-0 pb-0">
        {items.map((item) => (
          <div
            key={item.id}
            id={`attention-${item.id}`}
            className="flex items-center justify-between gap-4 px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={`h-4 w-4 flex-shrink-0 ${
                  item.level === "warning"
                    ? "text-amber-500"
                    : "text-sky-500"
                }`}
                aria-hidden="true"
              />
              <span className="text-sm leading-snug">{item.message}</span>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="flex-shrink-0 whitespace-nowrap text-xs"
            >
              <Link href={item.href}>{item.action}</Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
