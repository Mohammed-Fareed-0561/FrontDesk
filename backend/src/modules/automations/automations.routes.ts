import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { validateAutomationConfig, SUPPORTED_TRIGGERS } from "./engine.js";
import { dispatchEvent, triggerManual } from "./dispatcher.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

const createAutomationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  triggerConfig: z.string().optional(), // JSON string
  conditionsConfig: z.string().optional(), // JSON string
  actionsConfig: z.string().optional(), // JSON string
});

export async function automationsRoutes(app: FastifyInstance) {
  // List automations
  app.get("/api/v1/businesses/:businessId/automations", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const q = req.query as any;
    const where: any = { businessId };
    if (q.status) where.status = q.status;
    const items = await prisma.automation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { runs: true } } },
    });
    return reply.send({ success: true, data: items });
  });

  // Get automation
  app.get("/api/v1/businesses/:businessId/automations/:automationId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, automationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const auto = await prisma.automation.findFirst({ where: { id: automationId, businessId } });
    if (!auto) throw Errors.notFound("Automation");
    return reply.send({ success: true, data: auto });
  });

  // Create automation
  app.post("/api/v1/businesses/:businessId/automations", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = createAutomationSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid automation", details: parsed.error.flatten() });

    // Validate configuration safety
    const validation = validateAutomationConfig({
      triggerConfig: parsed.data.triggerConfig,
      conditionsConfig: parsed.data.conditionsConfig,
      actionsConfig: parsed.data.actionsConfig,
    });
    if (!validation.valid) {
      throw new AppError({ statusCode: 422, code: "INVALID_CONFIG", message: validation.error || "Invalid configuration" });
    }

    const auto = await prisma.automation.create({
      data: {
        businessId,
        name: parsed.data.name,
        description: parsed.data.description,
        status: "draft",
        triggerConfig: parsed.data.triggerConfig || null,
        conditionsConfig: parsed.data.conditionsConfig || null,
        actionsConfig: parsed.data.actionsConfig || null,
        createdBy: userId,
      },
    });

    await prisma.auditLog.create({
      data: { businessId, actorType: "user", actorId: userId, action: "AUTOMATION_CREATED", entityType: "automation", entityId: auto.id, afterData: JSON.stringify(auto) },
    });
    await prisma.domainEvent.create({
      data: { businessId, eventType: "AUTOMATION_CREATED", aggregateType: "automation", aggregateId: auto.id, payload: JSON.stringify({ automationId: auto.id, name: auto.name }) },
    });

    return reply.code(201).send({ success: true, data: auto });
  });

  // Update automation
  app.patch("/api/v1/businesses/:businessId/automations/:automationId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, automationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const existing = await prisma.automation.findFirst({ where: { id: automationId, businessId } });
    if (!existing) throw Errors.notFound("Automation");

    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional().nullable(),
      triggerConfig: z.string().optional(),
      conditionsConfig: z.string().optional(),
      actionsConfig: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });

    // Validate configuration safety if configs are being updated
    const validation = validateAutomationConfig({
      triggerConfig: parsed.data.triggerConfig ?? existing.triggerConfig,
      conditionsConfig: parsed.data.conditionsConfig ?? existing.conditionsConfig,
      actionsConfig: parsed.data.actionsConfig ?? existing.actionsConfig,
    });
    if (!validation.valid) {
      throw new AppError({ statusCode: 422, code: "INVALID_CONFIG", message: validation.error || "Invalid configuration" });
    }

    const before = { ...existing };
    const updated = await prisma.automation.update({
      where: { id: automationId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.triggerConfig !== undefined && { triggerConfig: parsed.data.triggerConfig }),
        ...(parsed.data.conditionsConfig !== undefined && { conditionsConfig: parsed.data.conditionsConfig }),
        ...(parsed.data.actionsConfig !== undefined && { actionsConfig: parsed.data.actionsConfig }),
      },
    });

    await prisma.auditLog.create({
      data: { businessId, actorType: "user", actorId: userId, action: "AUTOMATION_UPDATED", entityType: "automation", entityId: automationId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) },
    });

    return reply.send({ success: true, data: updated });
  });

  // Enable/disable automation
  app.post("/api/v1/businesses/:businessId/automations/:automationId/enable", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, automationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const auto = await prisma.automation.findFirst({ where: { id: automationId, businessId } });
    if (!auto) throw Errors.notFound("Automation");

    const updated = await prisma.automation.update({ where: { id: automationId }, data: { status: "active" } });
    await prisma.auditLog.create({
      data: { businessId, actorType: "user", actorId: userId, action: "AUTOMATION_ENABLED", entityType: "automation", entityId: automationId },
    });
    await prisma.domainEvent.create({
      data: { businessId, eventType: "AUTOMATION_ENABLED", aggregateType: "automation", aggregateId: automationId, payload: JSON.stringify({ automationId }) },
    });
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/automations/:automationId/disable", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, automationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const auto = await prisma.automation.findFirst({ where: { id: automationId, businessId } });
    if (!auto) throw Errors.notFound("Automation");

    const updated = await prisma.automation.update({ where: { id: automationId }, data: { status: "inactive" } });
    await prisma.auditLog.create({
      data: { businessId, actorType: "user", actorId: userId, action: "AUTOMATION_DISABLED", entityType: "automation", entityId: automationId },
    });
    await prisma.domainEvent.create({
      data: { businessId, eventType: "AUTOMATION_DISABLED", aggregateType: "automation", aggregateId: automationId, payload: JSON.stringify({ automationId }) },
    });
    return reply.send({ success: true, data: updated });
  });

  // Delete/archive automation
  app.delete("/api/v1/businesses/:businessId/automations/:automationId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, automationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const auto = await prisma.automation.findFirst({ where: { id: automationId, businessId } });
    if (!auto) throw Errors.notFound("Automation");

    await prisma.automation.delete({ where: { id: automationId } });
    await prisma.auditLog.create({
      data: { businessId, actorType: "user", actorId: userId, action: "AUTOMATION_DELETED", entityType: "automation", entityId: automationId, beforeData: JSON.stringify(auto) },
    });
    return reply.code(204).send();
  });

  // Manual trigger
  app.post("/api/v1/businesses/:businessId/automations/:automationId/trigger", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, automationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const result = await triggerManual(automationId, businessId);
    if (result.status === "failed") {
      throw new AppError({ statusCode: 422, code: "TRIGGER_FAILED", message: result.error || "Trigger failed" });
    }
    return reply.send({ success: true, data: result });
  });

  // Get automation runs
  app.get("/api/v1/businesses/:businessId/automations/:automationId/runs", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, automationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const auto = await prisma.automation.findFirst({ where: { id: automationId, businessId } });
    if (!auto) throw Errors.notFound("Automation");
    const runs = await prisma.automationRun.findMany({
      where: { automationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return reply.send({ success: true, data: runs });
  });

  // Get supported triggers (for UI)
  app.get("/api/v1/automations/triggers", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    return reply.send({
      success: true,
      data: [...SUPPORTED_TRIGGERS].map((t) => ({
        eventType: t,
        label: t.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    });
  });
}
