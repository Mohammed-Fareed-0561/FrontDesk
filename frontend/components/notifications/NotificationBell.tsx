"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api/client";
import { useBusiness } from "@/hooks/useBusiness";
import { formatRelativeTime } from "@/lib/utils";
import { Bell, Check, CheckCheck, Clock } from "lucide-react";
import Link from "next/link";

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
  readAt: string | null;
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
  info: "bg-gray-400",
};

export function NotificationBell() {
  const { selectedId } = useBusiness();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!selectedId) return;
    try {
      const data = await apiClient<{ count: number }>(
        `/businesses/${selectedId}/notifications/unread-count`
      );
      setUnreadCount(data.count);
    } catch {
      // Silent fail
    }
  }, [selectedId]);

  const fetchRecent = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const data = await apiClient<Notification[]>(
        `/businesses/${selectedId}/notifications`,
        { params: { pageSize: "10" } }
      );
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchCount]);

  const handleMarkRead = async (id: string) => {
    if (!selectedId) return;
    try {
      await apiClient(`/businesses/${selectedId}/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "read", readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent fail
    }
  };

  const handleMarkAllRead = async () => {
    if (!selectedId) return;
    try {
      await apiClient(`/businesses/${selectedId}/notifications/read-all`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read", readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Silent fail
    }
  };

  const handleOpen = () => {
    fetchRecent();
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && handleOpen()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 p-0 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.slice(0, 8).map((n) => {
            const time = formatRelativeTime(n.createdAt);
            const readTime = n.readAt ? formatRelativeTime(n.readAt) : null;
            return (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start gap-1 py-2 cursor-pointer ${
                  n.status === "unread" ? "bg-muted/50" : ""
                }`}
                onClick={() => n.status === "unread" && handleMarkRead(n.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      severityColors[n.severity] || "bg-gray-400"
                    }`}
                  />
                  <span className="text-xs font-medium flex-1 truncate">
                    {n.title}
                  </span>
                  {n.status === "unread" && (
                    <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 pl-4">
                  {n.message}
                </p>
                <div className="flex items-center gap-2 pl-4">
                  <span className="text-[10px] text-muted-foreground">
                    {time.relative || new Date(n.createdAt).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {readTime && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      Read {readTime.relative}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link href="/dashboard/notifications" className="text-sm text-primary">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
