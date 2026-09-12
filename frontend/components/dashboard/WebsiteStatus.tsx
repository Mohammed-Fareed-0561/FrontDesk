"use client";

/**
 * UX-IMPLEMENTATION-02 — Website Status Widget
 *
 * Shows the current website status (draft / needs setup / published)
 * with appropriate actions. Uses only existing website data.
 */

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Eye, Upload, Settings } from "lucide-react";
import type { AnalyticsOverview } from "@/types";
import type { Capability } from "@/config/business";

interface WebsiteStatusProps {
  analytics: AnalyticsOverview | null;
  hasCapability: (cap: Capability) => boolean;
  loading: boolean;
}

export function WebsiteStatus({ analytics, hasCapability, loading }: WebsiteStatusProps) {
  if (!hasCapability("website")) return null;

  const website = analytics?.website;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-40 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!website) {
    // No website created yet
    return (
      <Card
        id="website-status-card"
        className="border-dashed"
      >
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <Globe
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Website</p>
              <p className="text-xs text-muted-foreground">
                Not set up yet
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/website">
              <Settings className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Set up Website
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isPublished = website.status === "published";
  const statusLabel = isPublished ? "Published" : "Draft";

  return (
    <Card id="website-status-card">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isPublished ? "bg-green-100 dark:bg-green-950" : "bg-muted"
            }`}
          >
            <Globe
              className={`h-4 w-4 ${
                isPublished ? "text-green-600" : "text-muted-foreground"
              }`}
              aria-hidden="true"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Website</p>
              <Badge
                variant={isPublished ? "success" : "secondary"}
                className="text-xs"
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPublished
                ? "Your website is live and visible to customers"
                : "Your website is in draft — not yet visible to customers"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Website actions">
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/website">
              <Settings className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          {!isPublished && (
            <Button asChild size="sm">
              <Link href="/dashboard/website">
                <Upload className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Publish
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
