"use client";

/**
 * UX-IMPLEMENTATION-02 — Business Dashboard & Insights Experience
 *
 * This page replaces the previous dashboard with a business-owner command center.
 *
 * Data sources (real data only, no fabricated values):
 *   - /api/v1/businesses/:id/analytics/overview  → counts, financials, website, recentEvents
 *   - /api/v1/businesses/:id/orders?status=pending → pending order count
 *   - /api/v1/businesses/:id/bookings?status=pending → pending booking count
 *   - BusinessProvider → capabilities, hasCapability
 *
 * Tenant isolation: each API call scopes data to selectedId resolved from the
 * workspace-validated backend. Business switching re-fetches all data.
 *
 * Business types: restaurant/cafe/bakery/salon/barbershop/clinic/retail/
 *                 ecommerce/agency/freelancer/consultant/education/
 *                 real_estate/service_business/portfolio/other
 */

import { useAuth } from "@/providers/AuthProvider";
import { useBusinessContext } from "@/providers/BusinessProvider";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { AnalyticsOverview } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, RefreshCw, Building2 } from "lucide-react";

// Dashboard sub-components
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { AttentionPanel, buildAttentionItems } from "@/components/dashboard/AttentionPanel";
import { AtGlanceMetrics } from "@/components/dashboard/AtGlanceMetrics";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WebsiteStatus } from "@/components/dashboard/WebsiteStatus";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { EmptyBusinessState } from "@/components/dashboard/EmptyBusinessState";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PendingCounts {
  orders: number;
  bookings: number;
}

interface DashboardData {
  analytics: AnalyticsOverview;
  pending: PendingCounts;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeTotal(meta: any): number {
  if (!meta) return 0;
  const n = Number(meta.total);
  return Number.isFinite(n) ? n : 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    selected,
    selectedId,
    businesses,
    loading: bizLoading,
    hasCapability,
    capabilities,
  } = useBusinessContext();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to onboarding only when we are certain there are no businesses
  useEffect(() => {
    if (!authLoading && !bizLoading && businesses.length === 0) {
      router.push("/onboarding");
    }
  }, [authLoading, bizLoading, businesses, router]);

  const fetchDashboard = useCallback(async (bizId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fire analytics overview request first (primary data source)
      const analyticsPromise = apiClient<AnalyticsOverview>(
        `/businesses/${bizId}/analytics/overview`
      );

      // Conditionally fetch pending orders/bookings based on capabilities.
      // We hit these here so they load in parallel with analytics.
      const pendingOrdersPromise = hasCapability("orders")
        ? apiClient<any>(`/businesses/${bizId}/orders`, {
            params: { status: "pending", pageSize: 1 },
          }).then((res) => {
            // apiClient strips .data, but meta is at top level — use raw
            return 0; // handled below via apiClientRaw
          })
        : Promise.resolve(null);

      const pendingBookingsPromise = hasCapability("bookings")
        ? apiClient<any>(`/businesses/${bizId}/bookings`, {
            params: { status: "pending", pageSize: 1 },
          }).then(() => 0)
        : Promise.resolve(null);

      // Use raw fetches for pending counts so we can read .meta.total
      const [analytics, rawOrders, rawBookings] = await Promise.all([
        analyticsPromise,
        hasCapability("orders")
          ? fetch(
              (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1") +
                `/businesses/${bizId}/orders?status=pending&pageSize=1`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("fd_token") || ""}`,
                },
              }
            )
              .then((r) => r.json())
              .catch(() => null)
          : Promise.resolve(null),
        hasCapability("bookings")
          ? fetch(
              (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1") +
                `/businesses/${bizId}/bookings?status=pending&pageSize=1`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("fd_token") || ""}`,
                },
              }
            )
              .then((r) => r.json())
              .catch(() => null)
          : Promise.resolve(null),
      ]);

      const pending: PendingCounts = {
        orders: rawOrders?.meta ? safeTotal(rawOrders.meta) : 0,
        bookings: rawBookings?.meta ? safeTotal(rawBookings.meta) : 0,
      };

      setData({ analytics, pending });
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [hasCapability]);

  useEffect(() => {
    if (!selectedId) return;
    fetchDashboard(selectedId);
  }, [selectedId, fetchDashboard]);

  // ─── Loading skeleton ───────────────────────────────────────────────────────

  if (authLoading || bizLoading) {
    return (
      <div className="space-y-6" aria-label="Loading dashboard" aria-busy="true">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  // ─── No businesses ──────────────────────────────────────────────────────────
  // (will redirect, but render nothing while redirecting)
  if (!selected && businesses.length === 0) return null;

  // ─── Error state ────────────────────────────────────────────────────────────

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <DashboardWelcome
          user={user}
          business={selected}
          profile={capabilities?.profile ?? null}
        />
        <Card id="dashboard-error-card">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertCircle
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">Unable to load dashboard data</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              id="dashboard-retry-btn"
              variant="outline"
              size="sm"
              onClick={() => selectedId && fetchDashboard(selectedId)}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── No business selected ────────────────────────────────────────────────────
  if (!selected) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <Building2
            className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <h2 className="font-semibold">No business selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a business from the sidebar to view your dashboard.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/dashboard/business">Manage Businesses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Compute attention items (only from real data) ───────────────────────────
  const attentionItems =
    data?.analytics
      ? buildAttentionItems(
          data.analytics,
          hasCapability,
          data.pending.orders,
          data.pending.bookings,
        )
      : [];

  // ─── Empty/new business state ────────────────────────────────────────────────
  const isNewBusiness =
    !loading &&
    data &&
    !selected.setupComplete &&
    (data.analytics.counts.products ?? 0) === 0 &&
    (data.analytics.counts.orders ?? 0) === 0 &&
    (data.analytics.counts.bookings ?? 0) === 0 &&
    (data.analytics.counts.customers ?? 0) === 0;

  // ─── Full dashboard ──────────────────────────────────────────────────────────

  return (
    <div
      id="dashboard-root"
      className="space-y-6"
      aria-labelledby="dashboard-heading"
    >
      {/* 1. Contextual welcome header */}
      <DashboardWelcome
        user={user}
        business={selected}
        profile={capabilities?.profile ?? null}
      />

      {/* 2. New/empty business state */}
      {isNewBusiness && (
        <EmptyBusinessState business={selected} hasCapability={hasCapability} />
      )}

      {/* 3. Needs Your Attention */}
      {!isNewBusiness && (
        <AttentionPanel items={attentionItems} />
      )}

      {/* 4. Website status (compact; always visible if website capability) */}
      <WebsiteStatus
        analytics={data?.analytics ?? null}
        hasCapability={hasCapability}
        loading={loading}
      />

      {/* 5. Quick Actions */}
      <QuickActions
        hasCapability={hasCapability}
        businessType={selected.businessType}
      />

      {/* 6. At a Glance metrics */}
      <AtGlanceMetrics
        analytics={data?.analytics ?? null}
        business={selected}
        hasCapability={hasCapability}
        loading={loading}
      />

      {/* 7. Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-1">
        <RecentActivity
          events={data?.analytics?.recentEvents ?? []}
          loading={loading}
        />
      </div>
    </div>
  );
}
