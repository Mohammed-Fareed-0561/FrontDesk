"use client";

import type { Business } from "@/types";
import type { BusinessTypeProfile } from "@/config/business";
import { BUSINESS_TYPE_LABELS } from "@/config/business";

interface DashboardWelcomeProps {
  user: { displayName: string | null } | null;
  business: Business | null;
  profile: BusinessTypeProfile | null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardWelcome({ user, business, profile }: DashboardWelcomeProps) {
  const greeting = getGreeting();
  const name = business?.name || user?.displayName || "there";
  const typeLabel =
    business?.businessType
      ? BUSINESS_TYPE_LABELS[business.businessType] ?? business.businessType
      : null;

  return (
    <div>
      <h1
        id="dashboard-heading"
        className="text-2xl font-bold tracking-tight text-foreground"
      >
        {greeting}, {name} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {typeLabel
          ? `Here's what's happening at your ${typeLabel.toLowerCase()} today.`
          : "Here's what's happening with your business today."}
      </p>
    </div>
  );
}
