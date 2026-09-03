"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { Bell, Settings, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

type NotificationPreference = {
  id: string;
  type: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

const typeLabels: Record<string, string> = {
  INSIGHT: "Insights",
  BOOKING: "Bookings",
  ORDER: "Orders",
  PAYMENT: "Payments",
  SYSTEM: "System",
  AUTOMATION: "Automations",
};

const typeDescriptions: Record<string, string> = {
  INSIGHT: "AI-detected business insights and recommendations",
  BOOKING: "New bookings and booking cancellations",
  ORDER: "Order completions and updates",
  PAYMENT: "Payment received notifications",
  SYSTEM: "System-level alerts and updates",
  AUTOMATION: "Automation-triggered notifications",
};

export default function NotificationPreferencesPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await apiClient<NotificationPreference[]>(
        `/businesses/${businessId}/notification-preferences`
      );
      setPreferences(Array.isArray(data) ? data : []);
    } catch {
      setPreferences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [businessId]);

  const handleToggle = async (type: string, currentEnabled: boolean) => {
    if (!businessId) return;
    setUpdating(type);
    try {
      const updated = await apiClient<NotificationPreference>(
        `/businesses/${businessId}/notification-preferences/${type}`,
        {
          method: "PATCH",
          body: { enabled: !currentEnabled },
        }
      );
      setPreferences((prev) =>
        prev.map((p) => (p.type === type ? { ...p, enabled: updated.enabled } : p))
      );
      toast({
        title: `${typeLabels[type] || type} notifications ${updated.enabled ? "enabled" : "disabled"}`,
      });
    } catch (e: any) {
      toast({
        title: "Could not update preference",
        description: e.message,
      });
    } finally {
      setUpdating(null);
    }
  };

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <Card>
          <CardContent className="py-12 text-center">
            Select a business to manage notification preferences
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/notifications">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" /> Notification Preferences
        </h1>
        <p className="text-muted-foreground">
          Choose which notification types you want to receive.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n}>
              <CardContent className="py-4">
                <div className="animate-pulse h-4 w-1/3 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : preferences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No preferences available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {preferences.map((pref) => (
            <Card key={pref.type}>
              <CardContent className="py-4 px-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {typeLabels[pref.type] || pref.type}
                      </span>
                      <Badge variant={pref.enabled ? "default" : "secondary"} className="text-[10px]">
                        {pref.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {typeDescriptions[pref.type] || "Notification type"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(pref.type, pref.enabled)}
                    disabled={updating === pref.type}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      pref.enabled ? "bg-primary" : "bg-input"
                    } ${updating === pref.type ? "opacity-50 cursor-not-allowed" : ""}`}
                    role="switch"
                    aria-checked={pref.enabled}
                    aria-label={`Toggle ${typeLabels[pref.type] || pref.type} notifications`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                        pref.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                    {updating === pref.type && (
                      <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
