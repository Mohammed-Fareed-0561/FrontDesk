import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import {
  createNotification,
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "./service.js";

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
  // List notifications
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

      const notification = await createNotification({
        businessId,
        ...parsed.data,
      });

      // Audit notification creation
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
}
