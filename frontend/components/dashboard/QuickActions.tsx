"use client";

/**
 * UX-IMPLEMENTATION-02 — Quick Actions
 *
 * Contextual 3-5 actions based on the business type.
 * Only wires existing routes.
 * Never shows actions for capabilities the business doesn't have.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Calendar,
  ShoppingBag,
  Users,
  Globe,
  Upload,
  BookOpen,
  Target,
  Plus,
} from "lucide-react";
import type { Capability } from "@/config/business";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  primary?: boolean;
}

interface QuickActionsProps {
  hasCapability: (cap: Capability) => boolean;
  businessType: string | null;
}

export function QuickActions({ hasCapability, businessType }: QuickActionsProps) {
  const actions: QuickAction[] = [];

  // Primary action: most relevant "add" action by type
  if (hasCapability("menu")) {
    actions.push({
      id: "add-menu-item",
      label: "Add Menu Item",
      icon: Plus,
      href: "/dashboard/catalog",
      primary: true,
    });
  } else if (hasCapability("catalog")) {
    actions.push({
      id: "add-product",
      label: "Add Product",
      icon: Package,
      href: "/dashboard/catalog",
      primary: true,
    });
  } else if (hasCapability("services")) {
    actions.push({
      id: "add-service",
      label: "Add Service",
      icon: BookOpen,
      href: "/dashboard/catalog",
      primary: true,
    });
  }

  // Booking action
  if (hasCapability("bookings")) {
    actions.push({
      id: "view-bookings",
      label: "View Bookings",
      icon: Calendar,
      href: "/dashboard/bookings",
    });
  }

  // Orders
  if (hasCapability("orders")) {
    actions.push({
      id: "view-orders",
      label: "View Orders",
      icon: ShoppingBag,
      href: "/dashboard/orders",
    });
  }

  // Customer / lead management
  if (hasCapability("customers") || hasCapability("leads")) {
    actions.push({
      id: "add-customer",
      label: hasCapability("leads") ? "Add Lead" : "Add Customer",
      icon: hasCapability("leads") ? Target : Users,
      href: "/dashboard/customers",
    });
  }

  // Website
  if (hasCapability("website")) {
    actions.push({
      id: "edit-website",
      label: "Edit Website",
      icon: Globe,
      href: "/dashboard/website",
    });
  }

  // Import — always useful
  {
    actions.push({
      id: "import-data",
      label: "Import Data",
      icon: Upload,
      href: "/dashboard/importer",
    });
  }

  // Limit to 5
  const visibleActions = actions.slice(0, 5);

  if (visibleActions.length === 0) return null;

  return (
    <Card id="quick-actions-card">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Quick actions"
        >
          {visibleActions.map((action) => (
            <Button
              key={action.id}
              id={`quick-action-${action.id}`}
              asChild
              size="sm"
              variant={action.primary ? "default" : "outline"}
              className="gap-1.5"
            >
              <Link href={action.href}>
                <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
