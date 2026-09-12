"use client";

/**
 * UX-IMPLEMENTATION-02 — Empty/New Business State
 *
 * Shown when setupComplete is false or the business has just been created.
 * Uses existing setupComplete and business data.
 * Does NOT create a new onboarding system.
 */

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Globe, Package } from "lucide-react";
import type { Business } from "@/types";
import type { Capability } from "@/config/business";

interface EmptyBusinessStateProps {
  business: Business;
  hasCapability: (cap: Capability) => boolean;
}

interface StepItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  description: string;
}

export function EmptyBusinessState({ business, hasCapability }: EmptyBusinessStateProps) {
  const steps: StepItem[] = [];

  if (hasCapability("catalog") || hasCapability("menu") || hasCapability("services")) {
    steps.push({
      id: "step-catalog",
      icon: Package,
      label: hasCapability("menu")
        ? "Add your menu items"
        : hasCapability("services")
        ? "Add your services"
        : "Add your products",
      href: "/dashboard/catalog",
      description: "Let customers see what you offer",
    });
  }

  if (hasCapability("website")) {
    steps.push({
      id: "step-website",
      icon: Globe,
      label: "Set up your website",
      href: "/dashboard/website",
      description: "Go live and be discoverable online",
    });
  }

  steps.push({
    id: "step-import",
    icon: Upload,
    label: "Import your existing data",
    href: "/dashboard/importer",
    description: "Upload a menu, PDF, CSV, or photo",
  });

  return (
    <Card
      id="empty-state-card"
      className="border-dashed bg-muted/10"
    >
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles
            className="h-6 w-6 text-primary"
            aria-hidden="true"
          />
        </div>
        <h2 className="text-lg font-semibold" id="empty-state-heading">
          Welcome to FrontDesk
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Let&apos;s get <strong>{business.name}</strong> ready for customers.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {steps.slice(0, 3).map((step) => (
            <Button
              key={step.id}
              id={step.id}
              asChild
              variant="outline"
              className="w-full sm:w-auto gap-2"
            >
              <Link href={step.href}>
                <step.icon className="h-4 w-4" aria-hidden="true" />
                {step.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
