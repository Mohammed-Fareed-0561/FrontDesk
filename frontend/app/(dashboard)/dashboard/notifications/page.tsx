"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  sourceType: string | null;
  sourceId: string | null;
  createdAt: string;
};

const severityIcons: Record<string, React.ElementType> = {
  critical: AlertCircle,
  high: AlertTriangle,
  medium: Info,
  low: Circle,
  info: Info,
};

const severityColors: Record<string, string> = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
  info: "outline",
};

const typeLabels: Record<string, string> = {
  INSIGHT: "Insight",
  BOOKING: "Booking",
  ORDER: "Order",
  PAYMENT: "Payment",
  SYSTEM: "System",
  AUTOMATION: "Automation",
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { pageSize: "100" };
      if (filter === "unread") params.status = "unread";
      if (filter === "read") params.status = "read";
      const data = await apiClient<Notification[]>(
        `/businesses/${businessId}/notifications`,
        { params }
      );
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!businessId) return;
    try {
      const data = await apiClient<{ count: number }>(
        `/businesses/${businessId}/notifications/unread-count`
      );
      setUnreadCount(data.count);
    } catch {
      // Silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [businessId, filter]);

  const handleMarkRead = async (id: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "read", readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e: any) {
      toast({ title: "Could not mark as read", description: e.message });
    }
  };

  const handleMarkAllRead = async () => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/notifications/read-all`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read", readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast({ title: "All notifications marked as read" });
    } catch (e: any) {
      toast({ title: "Could not mark all as read", description: e.message });
    }
  };

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Card>
          <CardContent className="py-12 text-center">
            Select a business to view notifications
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay informed about your business activity.
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <CardContent className="py-4">
                <div className="animate-pulse h-4 w-1/3 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = severityIcons[n.severity] || Info;
            return (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors ${
                  n.status === "unread"
                    ? "border-l-4 border-l-primary bg-muted/30"
                    : "opacity-70"
                }`}
                onClick={() =>
                  n.status === "unread" && handleMarkRead(n.id)
                }
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{n.title}</span>
                        <Badge
                          variant={
                            (severityColors[n.severity] as any) || "outline"
                          }
                          className="text-[10px]"
                        >
                          {n.severity}
                        </Badge>
                        {n.sourceType && (
                          <Badge variant="secondary" className="text-[10px]">
                            {typeLabels[n.sourceType] || n.sourceType}
                          </Badge>
                        )}
                        {n.status === "unread" && (
                          <Badge variant="default" className="text-[10px]">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    {n.status === "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
