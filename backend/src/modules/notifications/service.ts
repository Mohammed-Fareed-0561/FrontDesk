import { prisma } from "../../infrastructure/database/client.js";
import { isNotificationEnabled } from "./preferences.service.js";

export interface CreateNotificationInput {
  businessId: string;
  recipientId?: string;
  type: string;
  title: string;
  message: string;
  severity?: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}

export interface CreateNotificationResult {
  notification: any; // Prisma Notification type
  created: boolean;  // true if a new notification was inserted; false if returned from idempotency
}

/**
 * Create an in-app notification.
 * Idempotent for same business+recipient+sourceType+sourceId (business-scoped, recipient-aware).
 * The same source event can notify different recipients; duplicate for same business+recipient+source is prevented.
 * Broadcast (recipientId=null) is deduplicated via both app check AND partial DB index (notif_broadcast_dedup).
 * Non-null recipient cases are covered by the notif_idempotency DB unique constraint.
 * Race-safe: catches P2002 unique violation and returns existing.
 */
export async function createNotification(input: CreateNotificationInput): Promise<CreateNotificationResult> {
  // Preference check: suppress notification if the recipient has disabled this type.
  // Broadcast notifications (no recipientId) are always allowed.
  const recipientId = input.recipientId || undefined;
  if (recipientId) {
    const enabled = await isNotificationEnabled(input.businessId, recipientId, input.type);
    if (!enabled) {
      // Notification suppressed by user preference — return a synthetic "not created" result.
      // No notification row is inserted; caller sees created=false.
      return { notification: null as any, created: false };
    }
  }

  // Idempotency: skip if notification for same business+recipient+source already exists
  if (input.sourceType && input.sourceId) {
    const where: any = {
      businessId: input.businessId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
    };
    // Recipient-aware: if recipientId is provided, match it; if null/undefined, match null (broadcast)
    if (input.recipientId !== undefined && input.recipientId !== null && String(input.recipientId).length > 0) {
      where.recipientId = input.recipientId;
    } else {
      where.recipientId = null;
    }
    const existing = await prisma.notification.findFirst({ where });
    if (existing) return { notification: existing, created: false };
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        businessId: input.businessId,
        recipientId: input.recipientId || null,
        type: input.type,
        title: input.title,
        message: input.message,
        severity: input.severity || "info",
        sourceType: input.sourceType || null,
        sourceId: input.sourceId || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
    return { notification, created: true };
  } catch (e: any) {
    // Handle race: two concurrent creates with same business+recipient+source hit unique constraint P2002
    // Also handles broadcast race via notif_broadcast_dedup partial index.
    // Do not expose internal error; return existing idempotently. No secrets in message.
    const isUniqueViolation =
      e?.code === "P2002" ||
      String(e?.message || "").includes("Unique constraint") ||
      String(e?.message || "").includes("notif_idempotency") ||
      String(e?.message || "").includes("notif_broadcast_dedup");
    if (isUniqueViolation && input.sourceType && input.sourceId) {
      const where: any = {
        businessId: input.businessId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        recipientId: input.recipientId ? input.recipientId : null,
      };
      const existing = await prisma.notification.findFirst({ where });
      if (existing) return { notification: existing, created: false };
    }
    throw e;
  }
}

export interface GetNotificationOptions {
  notificationId: string;
  businessId: string;
}

/**
 * Get a single notification by ID with tenant validation.
 * Returns null if not found or cross-tenant.
 */
export async function getNotification(options: GetNotificationOptions) {
  const { notificationId, businessId } = options;
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, businessId },
  });
  return notification || null;
}

export interface ListNotificationsOptions {
  businessId: string;
  recipientId?: string;
  status?: string;
  type?: string;
  severity?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  archived?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * List notifications for a business with filtering, search, and pagination.
 * By default excludes archived notifications unless archived=true is specified.
 */
export async function listNotifications(options: ListNotificationsOptions) {
  const {
    businessId, recipientId, status, type, severity,
    search, dateFrom, dateTo, archived,
    page = 1, pageSize = 50,
  } = options;
  const skip = (page - 1) * pageSize;

  const where: any = { businessId };
  if (recipientId) where.recipientId = recipientId;
  if (status) where.status = status;
  if (type) where.type = type;
  if (severity) where.severity = severity;

  // Archive filtering: by default exclude archived
  if (archived === true) {
    where.archivedAt = { not: null };
  } else if (archived === false) {
    where.archivedAt = null;
  } else {
    // Default: exclude archived
    where.archivedAt = null;
  }

  // Search by title or message (SQLite LIKE, case-insensitive via lower())
  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { title: { contains: term } },
      { message: { contains: term } },
    ];
  }

  // Date range filtering
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

/**
 * Get unread notification count for a business.
 * Excludes archived notifications.
 */
export async function getUnreadCount(businessId: string, recipientId?: string): Promise<number> {
  const where: any = { businessId, status: "unread", archivedAt: null };
  if (recipientId) where.recipientId = recipientId;
  return prisma.notification.count({ where });
}

/**
 * Mark a single notification as read.
 * Validates tenant ownership.
 */
export async function markAsRead(notificationId: string, businessId: string): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, businessId },
  });
  if (!notification) return false;
  if (notification.status === "read") return true;

  await prisma.notification.update({
    where: { id: notificationId },
    data: { status: "read", readAt: new Date() },
  });
  return true;
}

/**
 * Mark all notifications as read for a business.
 */
export async function markAllAsRead(businessId: string, recipientId?: string): Promise<number> {
  const where: any = { businessId, status: "unread" };
  if (recipientId) where.recipientId = recipientId;

  const result = await prisma.notification.updateMany({
    where,
    data: { status: "read", readAt: new Date() },
  });
  return result.count;
}

// ── Batch Operations ──

/**
 * Validate that all notification IDs belong to the given business.
 * Returns the validated IDs.
 */
async function validateOwnership(notificationIds: string[], businessId: string): Promise<string[]> {
  if (notificationIds.length === 0) return [];
  const owned = await prisma.notification.findMany({
    where: { id: { in: notificationIds }, businessId },
    select: { id: true },
  });
  return owned.map((n) => n.id);
}

/**
 * Batch mark notifications as read.
 * Only marks unread notifications; already-read ones retain their readAt.
 * Returns the count of notifications that were newly marked as read.
 */
export async function batchMarkRead(notificationIds: string[], businessId: string): Promise<number> {
  const validIds = await validateOwnership(notificationIds, businessId);
  if (validIds.length === 0) return 0;

  const result = await prisma.notification.updateMany({
    where: { id: { in: validIds }, status: "unread" },
    data: { status: "read", readAt: new Date() },
  });
  return result.count;
}

/**
 * Batch mark notifications as unread.
 * Clears readAt and sets status to unread.
 * Returns the count of notifications changed.
 */
export async function batchMarkUnread(notificationIds: string[], businessId: string): Promise<number> {
  const validIds = await validateOwnership(notificationIds, businessId);
  if (validIds.length === 0) return 0;

  const result = await prisma.notification.updateMany({
    where: { id: { in: validIds }, status: "read" },
    data: { status: "unread", readAt: null },
  });
  return result.count;
}

// ── Archive Operations ──

/**
 * Archive a single notification (soft archive).
 */
export async function archiveNotification(notificationId: string, businessId: string): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, businessId },
  });
  if (!notification) return false;
  if (notification.archivedAt) return true; // Already archived

  await prisma.notification.update({
    where: { id: notificationId },
    data: { archivedAt: new Date() },
  });
  return true;
}

/**
 * Unarchive a single notification.
 */
export async function unarchiveNotification(notificationId: string, businessId: string): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, businessId },
  });
  if (!notification) return false;
  if (!notification.archivedAt) return true; // Already not archived

  await prisma.notification.update({
    where: { id: notificationId },
    data: { archivedAt: null },
  });
  return true;
}

/**
 * Batch archive notifications.
 */
export async function batchArchive(notificationIds: string[], businessId: string): Promise<number> {
  const validIds = await validateOwnership(notificationIds, businessId);
  if (validIds.length === 0) return 0;

  const result = await prisma.notification.updateMany({
    where: { id: { in: validIds }, archivedAt: null },
    data: { archivedAt: new Date() },
  });
  return result.count;
}

/**
 * Batch unarchive notifications.
 */
export async function batchUnarchive(notificationIds: string[], businessId: string): Promise<number> {
  const validIds = await validateOwnership(notificationIds, businessId);
  if (validIds.length === 0) return 0;

  const result = await prisma.notification.updateMany({
    where: { id: { in: validIds }, archivedAt: { not: null } },
    data: { archivedAt: null },
  });
  return result.count;
}
