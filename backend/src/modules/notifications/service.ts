import { prisma } from "../../infrastructure/database/client.js";

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

/**
 * Create an in-app notification.
 * Idempotent for same business+recipient+sourceType+sourceId (business-scoped, recipient-aware).
 * The same source event can notify different recipients; duplicate for same business+recipient+source is prevented.
 * Broadcast (recipientId=null) is still deduplicated via app check; DB unique covers non-null recipient cases.
 * Race-safe: catches P2002 unique violation and returns existing.
 */
export async function createNotification(input: CreateNotificationInput) {
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
    if (existing) return existing;
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
    return notification;
  } catch (e: any) {
    // Handle race: two concurrent creates with same business+recipient+source hit unique constraint P2002
    // Do not expose internal error; return existing idempotently. No secrets in message.
    const isUniqueViolation =
      e?.code === "P2002" ||
      String(e?.message || "").includes("Unique constraint") ||
      String(e?.message || "").includes("notif_idempotency");
    if (isUniqueViolation && input.sourceType && input.sourceId) {
      const where: any = {
        businessId: input.businessId,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        recipientId: input.recipientId ? input.recipientId : null,
      };
      const existing = await prisma.notification.findFirst({ where });
      if (existing) return existing;
    }
    throw e;
  }
}

export interface ListNotificationsOptions {
  businessId: string;
  recipientId?: string;
  status?: string;
  type?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
}

/**
 * List notifications for a business with filtering and pagination.
 */
export async function listNotifications(options: ListNotificationsOptions) {
  const { businessId, recipientId, status, type, severity, page = 1, pageSize = 50 } = options;
  const skip = (page - 1) * pageSize;

  const where: any = { businessId };
  if (recipientId) where.recipientId = recipientId;
  if (status) where.status = status;
  if (type) where.type = type;
  if (severity) where.severity = severity;

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
 */
export async function getUnreadCount(businessId: string, recipientId?: string): Promise<number> {
  const where: any = { businessId, status: "unread" };
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
