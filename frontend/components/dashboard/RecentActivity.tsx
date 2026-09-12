"use client";

/**
 * UX-IMPLEMENTATION-02 — Recent Activity
 *
 * Translates raw domain events into business-readable sentences.
 * Never exposes raw event identifiers to the user.
 * Shows a clear empty state when no events exist.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { humanizeEvent } from "@/lib/dashboard/events";
import {
  Activity,
  ShoppingBag,
  Calendar,
  CalendarCheck,
  CalendarX,
  Globe,
  Package,
  MessageSquare,
  UserPlus,
  CreditCard,
  Banknote,
  XCircle,
  CheckCircle2,
  UserX,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  Calendar,
  CalendarCheck,
  CalendarX,
  CalendarCheck2: CalendarCheck,
  Globe,
  Package,
  PackageOpen: Package,
  MessageSquare,
  MessageSquareCheck: MessageSquare,
  UserPlus,
  UserX,
  CreditCard,
  Banknote,
  XCircle,
  CheckCircle2,
  Activity,
};

interface RecentEvent {
  type: string;
  at: string;
}

interface RecentActivityProps {
  events: RecentEvent[];
  loading: boolean;
}

function getRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function RecentActivity({ events, loading }: RecentActivityProps) {
  return (
    <Card id="recent-activity-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Recent Activity
        </CardTitle>
        <CardDescription>What happened recently at your business</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-7 w-7 flex-shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div
            id="activity-empty"
            className="py-8 text-center text-sm text-muted-foreground"
          >
            <Activity className="mx-auto mb-2 h-6 w-6 opacity-30" />
            <p>No activity yet.</p>
            <p className="mt-1 text-xs">
              Events will appear here as your business grows.
            </p>
          </div>
        ) : (
          <ul
            className="divide-y divide-border"
            aria-label="Recent business activity"
          >
            {events.slice(0, 8).map((ev, i) => {
              const humanized = humanizeEvent(ev.type);
              const IconComp = ICON_MAP[humanized.icon] || Activity;
              const relTime = getRelativeTime(ev.at);

              return (
                <li
                  key={i}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted ${humanized.colour}`}
                    aria-hidden="true"
                  >
                    <IconComp className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">
                      {humanized.label}
                    </span>
                  </span>
                  <time
                    dateTime={ev.at}
                    className="flex-shrink-0 text-xs text-muted-foreground"
                    title={new Date(ev.at).toLocaleString("en-IN")}
                  >
                    {relTime}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
