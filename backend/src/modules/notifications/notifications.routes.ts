import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import {
  createNotification,
  getNotification,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  batchMarkRead,
  batchMarkUnread,
  archiveNotification,
  unarchiveNotification,
  batchArchive,
  batchUnarchive,
} from "./service.js";
import {
  listPreferences,
  upsertPreference,
  SUPPORTED_NOTIFICATION_TYPES,
} from "./preferences.service.js";

// Audit action constants
const AUDIT = {
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
  NOTIFICATION_READ: "NOTIFICATION_READ",
  NOTIFICATION_READ_ALL: "NOTIFICATION_READ_ALL",
} as const;

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId: b.workspaceId },
  });
  const owner = await prisma.workspace.findFirst({
    where: { id: b.workspaceId, ownerUserId: userId },
  });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

export async function notificationsRoutes(app: FastifyInstance) {
  // List notifications (with search, filtering, archive support)
  app.get(
    "/api/v1/businesses/:businessId/notifications",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const q = req.query as any;
      const result = await listNotifications({
        businessId,
        status: q.status || undefined,
        type: q.type || undefined,
        severity: q.severity || undefined,
        search: q.search || undefined,
        dateFrom: q.dateFrom || undefined,
        dateTo: q.dateTo || undefined,
        archived: q.archived === "true" ? true : q.archived === "false" ? false : undefined,
        page: q.page ? Number(q.page) : 1,
        pageSize: q.pageSize ? Number(q.pageSize) : 50,
      });
      return reply.send({
        success: true,
        data: result.items,
        meta: { page: result.page, pageSize: result.pageSize, total: result.total },
      });
    }
  );

  // Get single notification by ID
  app.get(
    "/api/v1/businesses/:businessId/notifications/:notificationId",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId, notificationId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const notification = await getNotification({ notificationId, businessId });
      if (!notification) throw Errors.notFound("Notification");
      return reply.send({ success: true, data: notification });
    }
  );

  // Get unread count
  app.get(
    "/api/v1/businesses/:businessId/notifications/unread-count",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const count = await getUnreadCount(businessId);
      return reply.send({ success: true, data: { count } });
    }
  );

  // Create notification (internal/system use — authenticated)
  app.post(
    "/api/v1/businesses/:businessId/notifications",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);

      const schema = z.object({
        recipientId: z.string().optional(),
        type: z.string().min(1).max(50),
        title: z.string().min(1).max(200),
        message: z.string().min(1).max(2000),
        severity: z.enum(["info", "low", "medium", "high", "critical"]).optional(),
        sourceType: z.string().max(50).optional(),
        sourceId: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError({
          statusCode: 422,
          code: "VALIDATION_ERROR",
          message: "Invalid notification",
          details: parsed.error.flatten(),
        });
      }

      const { notification, created } = await createNotification({
        businessId,
        ...parsed.data,
      });

      // Audit notification creation (only when a new notification was actually inserted)
      if (created) {
        await prisma.auditLog.create({
          data: {
            businessId,
            actorType: "user",
            actorId: userId,
            action: AUDIT.NOTIFICATION_CREATED,
            entityType: "notification",
            entityId: notification.id,
            afterData: JSON.stringify({
              type: notification.type,
              title: notification.title,
              severity: notification.severity,
              recipientId: notification.recipientId,
            }),
          },
        });
      }

      return reply.code(201).send({ success: true, data: notification });
    }
  );

  // Mark notification as read
  app.post(
    "/api/v1/businesses/:businessId/notifications/:notificationId/read",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId, notificationId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const ok = await markAsRead(notificationId, businessId);
      if (!ok) throw Errors.notFound("Notification");

      // Audit notification read
      await prisma.auditLog.create({
        data: {
          businessId,
          actorType: "user",
          actorId: userId,
          action: AUDIT.NOTIFICATION_READ,
          entityType: "notification",
          entityId: notificationId,
        },
      });

      return reply.send({ success: true, data: { marked: true } });
    }
  );

  // Mark all notifications as read
  app.post(
    "/api/v1/businesses/:businessId/notifications/read-all",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const count = await markAllAsRead(businessId);

      // Audit bulk read
      await prisma.auditLog.create({
        data: {
          businessId,
          actorType: "user",
          actorId: userId,
          action: AUDIT.NOTIFICATION_READ_ALL,
          entityType: "notification",
          afterData: JSON.stringify({ marked: count }),
        },
      });

      return reply.send({ success: true, data: { marked: count } });
    }
  );

  // ── Batch Operations ──

  // Batch mark as read
  app.post(
    "/api/v1/businesses/:businessId/notifications/batch-read",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const schema = z.object({ ids: z.array(z.string()).min(1).max(100) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid batch payload", details: parsed.error.flatten() });
      }
      const count = await batchMarkRead(parsed.data.ids, businessId);
      await prisma.auditLog.create({
        data: {
          businessId, actorType: "user", actorId: userId,
          action: "NOTIFICATION_BATCH_READ", entityType: "notification",
          afterData: JSON.stringify({ marked: count, requested: parsed.data.ids.length }),
        },
      });
      return reply.send({ success: true, data: { marked: count } });
    }
  );

  // Batch mark as unread
  app.post(
    "/api/v1/businesses/:businessId/notifications/batch-unread",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const schema = z.object({ ids: z.array(z.string()).min(1).max(100) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid batch payload", details: parsed.error.flatten() });
      }
      const count = await batchMarkUnread(parsed.data.ids, businessId);
      await prisma.auditLog.create({
        data: {
          businessId, actorType: "user", actorId: userId,
          action: "NOTIFICATION_BATCH_UNREAD", entityType: "notification",
          afterData: JSON.stringify({ marked: count, requested: parsed.data.ids.length }),
        },
      });
      return reply.send({ success: true, data: { marked: count } });
    }
  );

  // Batch archive
  app.post(
    "/api/v1/businesses/:businessId/notifications/batch-archive",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const schema = z.object({ ids: z.array(z.string()).min(1).max(100) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid batch payload", details: parsed.error.flatten() });
      }
      const count = await batchArchive(parsed.data.ids, businessId);
      await prisma.auditLog.create({
        data: {
          businessId, actorType: "user", actorId: userId,
          action: "NOTIFICATION_BATCH_ARCHIVE", entityType: "notification",
          afterData: JSON.stringify({ archived: count, requested: parsed.data.ids.length }),
        },
      });
      return reply.send({ success: true, data: { archived: count } });
    }
  );

  // Batch unarchive
  app.post(
    "/api/v1/businesses/:businessId/notifications/batch-unarchive",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const schema = z.object({ ids: z.array(z.string()).min(1).max(100) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid batch payload", details: parsed.error.flatten() });
      }
      const count = await batchUnarchive(parsed.data.ids, businessId);
      await prisma.auditLog.create({
        data: {
          businessId, actorType: "user", actorId: userId,
          action: "NOTIFICATION_BATCH_UNARCHIVE", entityType: "notification",
          afterData: JSON.stringify({ unarchived: count, requested: parsed.data.ids.length }),
        },
      });
      return reply.send({ success: true, data: { unarchived: count } });
    }
  );

  // Single archive
  app.post(
    "/api/v1/businesses/:businessId/notifications/:notificationId/archive",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId, notificationId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const ok = await archiveNotification(notificationId, businessId);
      if (!ok) throw Errors.notFound("Notification");
      await prisma.auditLog.create({
        data: { businessId, actorType: "user", actorId: userId, action: "NOTIFICATION_ARCHIVED", entityType: "notification", entityId: notificationId },
      });
      return reply.send({ success: true, data: { archived: true } });
    }
  );

  // Single unarchive
  app.post(
    "/api/v1/businesses/:businessId/notifications/:notificationId/unarchive",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId, notificationId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const ok = await unarchiveNotification(notificationId, businessId);
      if (!ok) throw Errors.notFound("Notification");
      await prisma.auditLog.create({
        data: { businessId, actorType: "user", actorId: userId, action: "NOTIFICATION_UNARCHIVED", entityType: "notification", entityId: notificationId },
      });
      return reply.send({ success: true, data: { unarchived: true } });
    }
  );

  // ── Notification Preferences ──

  // List preferences for the authenticated user
  app.get(
    "/api/v1/businesses/:businessId/notification-preferences",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId } = req.params as any;
      await assertBusinessAccess(userId, businessId);
      const prefs = await listPreferences({ businessId, userId });
      return reply.send({ success: true, data: prefs });
    }
  );

  // Upsert a preference for the authenticated user
  app.patch(
    "/api/v1/businesses/:businessId/notification-preferences/:type",
    { preHandler: [(app as any).authenticate] },
    async (req, reply) => {
      const userId = (req as any).userId as string;
      const { businessId, type } = req.params as any;
      await assertBusinessAccess(userId, businessId);

      // Validate notification type
      if (!SUPPORTED_NOTIFICATION_TYPES.includes(type)) {
        throw new AppError({
          statusCode: 422,
          code: "VALIDATION_ERROR",
          message: `Unsupported notification type: ${type}. Supported: ${SUPPORTED_NOTIFICATION_TYPES.join(", ")}`,
        });
      }

      const schema = z.object({
        enabled: z.boolean(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError({
          statusCode: 422,
          code: "VALIDATION_ERROR",
          message: "Invalid preference payload",
          details: parsed.error.flatten(),
        });
      }

      // Fetch before-state for audit
      const beforePref = await prisma.notificationPreference.findUnique({
        where: { notif_pref_unique: { businessId, userId, type } },
      });
      const beforeEnabled = beforePref?.enabled ?? true;

      const pref = await upsertPreference({
        businessId,
        userId,
        type,
        enabled: parsed.data.enabled,
      });

      // Audit preference change
      await prisma.auditLog.create({
        data: {
          businessId,
          actorType: "user",
          actorId: userId,
          action: "NOTIFICATION_PREFERENCE_UPDATED",
          entityType: "notification_preference",
          entityId: pref.id,
          beforeData: JSON.stringify({ type, enabled: beforeEnabled }),
          afterData: JSON.stringify({ type, enabled: pref.enabled }),
        },
      });

      return reply.send({ success: true, data: pref });
    }
  );
}
