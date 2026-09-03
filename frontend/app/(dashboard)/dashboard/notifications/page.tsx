"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { formatRelativeTime } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Circle,
  Settings,
  ChevronDown,
  ChevronRight,
  Clock,
  Search,
  Archive,
  ArchiveRestore,
  Eye,
  X,
  Keyboard,
} from "lucide-react";
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
  recipientId: string | null;
  metadata: string | null;
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
};

type NotificationGroup = {
  key: string;
  notifications: Notification[];
  latest: Notification;
  unreadCount: number;
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
  insight: "Insight",
  booking: "Booking",
  order: "Order",
  payment: "Payment",
};

function groupNotifications(notifications: Notification[]): (NotificationGroup | Notification)[] {
  const groups = new Map<string, Notification[]>();
  const ungrouped: (NotificationGroup | Notification)[] = [];
  for (const n of notifications) {
    if (n.sourceType && n.sourceId) {
      const key = `${n.sourceType}:${n.sourceId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(n);
    } else {
      ungrouped.push(n);
    }
  }
  const result: (NotificationGroup | Notification)[] = ungrouped;
  for (const [key, items] of groups) {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const unreadCount = items.filter((n) => n.status === "unread").length;
    result.push({ key, notifications: items, latest: items[0], unreadCount });
  }
  result.sort((a, b) => {
    const aDate = "latest" in a ? a.latest.createdAt : a.createdAt;
    const bDate = "latest" in b ? b.latest.createdAt : b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
  return result;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Detail view
  const [detailNotification, setDetailNotification] = useState<Notification | null>(null);

  // Keyboard nav
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Flatten grouped items for keyboard nav
  const flatItems = useMemo(() => {
    const grouped = groupNotifications(notifications);
    const flat: (NotificationGroup | Notification)[] = [];
    for (const item of grouped) {
      flat.push(item);
      if ("key" in item && expandedGroups.has(item.key)) {
        for (const n of item.notifications) flat.push(n);
      }
    }
    return flat;
  }, [notifications, expandedGroups]);

  const fetchNotifications = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { pageSize: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;
      if (severityFilter !== "all") params.severity = severityFilter;
      if (search.trim()) params.search = search.trim();
      if (showArchived) params.archived = "true";
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
  }, [businessId, statusFilter, typeFilter, severityFilter, search, showArchived]);

  const fetchUnreadCount = useCallback(async () => {
    if (!businessId) return;
    try {
      const data = await apiClient<{ count: number }>(
        `/businesses/${businessId}/notifications/unread-count`
      );
      setUnreadCount(data.count);
    } catch { /* Silent */ }
  }, [businessId]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handleMarkRead = async (id: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, status: "read", readAt: new Date().toISOString() } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e: any) {
      toast({ title: "Could not mark as read", description: e.message });
    }
  };

  const handleMarkAllRead = async () => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/notifications/read-all`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read", readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast({ title: "All notifications marked as read" });
    } catch (e: any) {
      toast({ title: "Could not mark all as read", description: e.message });
    }
  };

  const handleBatchMarkRead = async () => {
    if (!businessId || selectedIds.size === 0) return;
    try {
      const ids = Array.from(selectedIds);
      await apiClient(`/businesses/${businessId}/notifications/batch-read`, {
        method: "POST",
        body: { ids },
      });
      setNotifications((prev) =>
        prev.map((n) => selectedIds.has(n.id)
          ? { ...n, status: "read", readAt: new Date().toISOString() }
          : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
      setSelectedIds(new Set());
      toast({ title: `${ids.length} notifications marked as read` });
    } catch (e: any) {
      toast({ title: "Could not mark as read", description: e.message });
    }
  };

  const handleBatchArchive = async () => {
    if (!businessId || selectedIds.size === 0) return;
    try {
      const ids = Array.from(selectedIds);
      await apiClient(`/businesses/${businessId}/notifications/batch-archive`, {
        method: "POST",
        body: { ids },
      });
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      toast({ title: `${ids.length} notifications archived` });
    } catch (e: any) {
      toast({ title: "Could not archive", description: e.message });
    }
  };

  const handleArchive = async (id: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/notifications/${id}/archive`, { method: "POST" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({ title: "Notification archived" });
    } catch (e: any) {
      toast({ title: "Could not archive", description: e.message });
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/notifications/${id}/unarchive`, { method: "POST" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({ title: "Notification restored" });
    } catch (e: any) {
      toast({ title: "Could not restore", description: e.message });
    }
  };

  const handleFetchDetail = async (id: string) => {
    if (!businessId) return;
    try {
      const data = await apiClient<Notification>(
        `/businesses/${businessId}/notifications/${id}`
      );
      setDetailNotification(data);
    } catch (e: any) {
      toast({ title: "Could not load notification", description: e.message });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (detailNotification && e.key === "Escape") {
        setDetailNotification(null);
        return;
      }
      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && focusedIndex >= 0 && focusedIndex < flatItems.length) {
        e.preventDefault();
        const item = flatItems[focusedIndex];
        if ("id" in item) {
          handleFetchDetail(item.id);
        } else if ("key" in item) {
          toggleGroup(item.key);
        }
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < flatItems.length) {
          const item = flatItems[focusedIndex];
          if ("id" in item && item.status === "unread") {
            handleMarkRead(item.id);
          }
        }
      } else if (e.key === "R" && e.shiftKey) {
        e.preventDefault();
        if (selectedIds.size > 0) {
          handleBatchMarkRead();
        } else {
          handleMarkAllRead();
        }
      } else if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowShortcutHelp((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flatItems, focusedIndex, selectedIds, detailNotification]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0) {
      const el = listRef.current?.querySelector(`[data-index="${focusedIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Card><CardContent className="py-12 text-center">Select a business to view notifications</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifications
          </h1>
          <p className="text-muted-foreground">
            Stay informed about your business activity.
            {unreadCount > 0 && <Badge variant="secondary" className="ml-2">{unreadCount} unread</Badge>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/notifications/preferences">
            <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-1" />Preferences</Button>
          </Link>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-1" />Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowShortcutHelp((p) => !p)} title="Keyboard shortcuts (?)">
            <Keyboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard shortcut help */}
      {showShortcutHelp && (
        <Card className="border-dashed">
          <CardContent className="py-3 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">J</kbd> Next</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">K</kbd> Previous</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> Open/Expand</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">R</kbd> Mark read</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Shift+R</kbd> Mark all read</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">?</kbd> Toggle shortcuts</span>
            <span><kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Close detail</span>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2 py-1.5 text-sm border rounded-md bg-background"
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          {Object.entries(typeLabels).filter(([k]) => k === k.toUpperCase()).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-2 py-1.5 text-sm border rounded-md bg-background"
          aria-label="Filter by severity"
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1.5 text-sm border rounded-md bg-background"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived((p) => !p)}
        >
          <Archive className="h-4 w-4 mr-1" />
          {showArchived ? "Archived" : "Archive"}
        </Button>
      </div>

      {/* Batch actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">{selectedIds.size} selected</span>
          <Button variant="outline" size="sm" onClick={handleBatchMarkRead}>
            <CheckCheck className="h-3 w-3 mr-1" />Mark read
          </Button>
          <Button variant="outline" size="sm" onClick={handleBatchArchive}>
            <Archive className="h-3 w-3 mr-1" />Archive
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            <X className="h-3 w-3 mr-1" />Clear
          </Button>
        </div>
      )}

      {/* Notification list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}><CardContent className="py-4"><div className="animate-pulse h-4 w-1/3 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {showArchived ? "No archived notifications"
                : search ? "No notifications match your search"
                : statusFilter === "unread" ? "No unread notifications"
                : statusFilter === "read" ? "No read notifications"
                : "No notifications yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2" role="list" aria-label="Notifications" ref={listRef}>
          {(() => {
            const grouped = groupNotifications(notifications);
            let globalIdx = 0;
            return grouped.map((item, idx) => {
              if ("key" in item) {
                const group = item as NotificationGroup;
                const isExpanded = expandedGroups.has(group.key);
                const myIdx = globalIdx;
                globalIdx++;
                const isFocused = focusedIndex === myIdx;
                const latestTime = formatRelativeTime(group.latest.createdAt);
                const readTime = group.latest.readAt ? formatRelativeTime(group.latest.readAt) : null;
                const Icon = severityIcons[group.latest.severity] || Info;
                const groupLabel = typeLabels[group.latest.sourceType || ""] || group.latest.sourceType || "Source";

                return (
                  <Card
                    key={`group-${group.key}-${idx}`}
                    data-index={myIdx}
                    className={`transition-colors ${
                      isFocused ? "ring-2 ring-ring" :
                      group.unreadCount > 0 ? "border-l-4 border-l-primary bg-muted/30" : "opacity-70"
                    }`}
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0"
                          checked={group.notifications.every((n) => selectedIds.has(n.id))}
                          onChange={toggleSelectAll}
                          aria-label="Select group"
                        />
                        <div className="flex-1 cursor-pointer" onClick={() => toggleGroup(group.key)}>
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium truncate">{group.latest.title}</span>
                                <Badge variant="secondary" className="text-[10px]">{groupLabel}</Badge>
                                {group.notifications.length > 1 && <Badge variant="outline" className="text-[10px]">{group.notifications.length} notifications</Badge>}
                                {group.unreadCount > 0 && <Badge variant="default" className="text-[10px]">{group.unreadCount} new</Badge>}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{latestTime.relative}</span>
                                {readTime && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Read {readTime.relative}</span>}
                              </div>
                            </div>
                            {group.unreadCount > 0 && (
                              <Button variant="ghost" size="sm" className="shrink-0"
                                onClick={(e) => { e.stopPropagation(); for (const n of group.notifications) if (n.status === "unread") handleMarkRead(n.id); }}
                                aria-label="Mark all in group as read">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 ml-7 space-y-2 border-t pt-2">
                          {group.notifications.map((n) => {
                            const childIdx = globalIdx;
                            globalIdx++;
                            return (
                              <NotificationItem
                                key={n.id}
                                notification={n}
                                index={childIdx}
                                focusedIndex={focusedIndex}
                                onMarkRead={handleMarkRead}
                                onSelect={toggleSelect}
                                selected={selectedIds.has(n.id)}
                                isArchived={showArchived}
                                onArchive={handleArchive}
                                onUnarchive={handleUnarchive}
                                onDetail={handleFetchDetail}
                              />
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              }

              const n = item as Notification;
              const myIdx = globalIdx;
              globalIdx++;
              return (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  index={myIdx}
                  focusedIndex={focusedIndex}
                  onMarkRead={handleMarkRead}
                  onSelect={toggleSelect}
                  selected={selectedIds.has(n.id)}
                  isArchived={showArchived}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onDetail={handleFetchDetail}
                />
              );
            });
          })()}
        </div>
      )}

      {/* Detail modal */}
      {detailNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailNotification(null)}>
          <Card className="w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold">{detailNotification.title}</h2>
                <Button variant="ghost" size="sm" onClick={() => setDetailNotification(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={(severityColors[detailNotification.severity] as any) || "outline"}>
                    {detailNotification.severity}
                  </Badge>
                  <Badge variant="secondary">{typeLabels[detailNotification.type] || detailNotification.type}</Badge>
                  {detailNotification.sourceType && (
                    <Badge variant="outline">{typeLabels[detailNotification.sourceType] || detailNotification.sourceType}</Badge>
                  )}
                  {detailNotification.status === "unread" && <Badge variant="default">Unread</Badge>}
                  {detailNotification.archivedAt && <Badge variant="destructive">Archived</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{detailNotification.message}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Created: {formatRelativeTime(detailNotification.createdAt).absolute || new Date(detailNotification.createdAt).toLocaleString("en-IN")}</div>
                  {detailNotification.readAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Read: {formatRelativeTime(detailNotification.readAt).absolute || new Date(detailNotification.readAt).toLocaleString("en-IN")}
                    </div>
                  )}
                  {detailNotification.archivedAt && (
                    <div>Archived: {formatRelativeTime(detailNotification.archivedAt).absolute || new Date(detailNotification.archivedAt).toLocaleString("en-IN")}</div>
                  )}
                  {detailNotification.sourceType && <div>Source: {detailNotification.sourceType}{detailNotification.sourceId ? ` (${detailNotification.sourceId})` : ""}</div>}
                </div>
                {detailNotification.metadata && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Metadata</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">
                      {(() => { try { return JSON.stringify(JSON.parse(detailNotification.metadata), null, 2); } catch { return detailNotification.metadata; } })()}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification: n, index, focusedIndex, onMarkRead, onSelect, selected, isArchived, onArchive, onUnarchive, onDetail,
}: {
  notification: Notification;
  index: number;
  focusedIndex: number;
  onMarkRead: (id: string) => void;
  onSelect: (id: string) => void;
  selected: boolean;
  isArchived: boolean;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDetail: (id: string) => void;
}) {
  const Icon = severityIcons[n.severity] || Info;
  const createdTime = formatRelativeTime(n.createdAt);
  const readTime = n.readAt ? formatRelativeTime(n.readAt) : null;
  const sourceLabel = typeLabels[n.sourceType || ""] || n.sourceType;
  const isFocused = focusedIndex === index;

  return (
    <Card
      data-index={index}
      className={`cursor-pointer transition-colors ${
        isFocused ? "ring-2 ring-ring" :
        n.status === "unread" ? "border-l-4 border-l-primary bg-muted/30" : "opacity-70"
      }`}
      onClick={() => onDetail(n.id)}
      role="listitem"
      aria-label={`${n.title}: ${n.status === "unread" ? "unread" : "read"}. ${n.message}`}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 mt-0.5 shrink-0"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onSelect(n.id); }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select notification: ${n.title}`}
          />
          <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{n.title}</span>
              <Badge variant={(severityColors[n.severity] as any) || "outline"} className="text-[10px]">{n.severity}</Badge>
              {sourceLabel && <Badge variant="secondary" className="text-[10px]">{sourceLabel}</Badge>}
              {n.status === "unread" && <Badge variant="default" className="text-[10px]">New</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
            <div className="flex items-center gap-3 mt-1">
              <time className="text-xs text-muted-foreground" dateTime={n.createdAt} title={createdTime.absolute}>
                {createdTime.relative || new Date(n.createdAt).toLocaleString("en-IN")}
              </time>
              {readTime && (
                <time className="text-xs text-muted-foreground flex items-center gap-1" dateTime={n.readAt!} title={readTime.absolute} aria-label={`Read ${readTime.relative}`}>
                  <Clock className="h-3 w-3" />Read {readTime.relative}
                </time>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {n.status === "unread" && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                aria-label="Mark as read">
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            {isArchived ? (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={(e) => { e.stopPropagation(); onUnarchive(n.id); }}
                aria-label="Restore from archive">
                <ArchiveRestore className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                onClick={(e) => { e.stopPropagation(); onArchive(n.id); }}
                aria-label="Archive notification">
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); onDetail(n.id); }}
              aria-label="View detail">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
