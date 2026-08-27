import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

const memorySchema = z.object({
  content: z.string().min(1),
  key: z.string().optional(),
  memoryType: z.string().optional(),
  importance: z.number().min(1).max(5).optional(),
  confidence: z.number().min(0).max(1).optional(),
  source: z.string().optional(),
});

export async function memoryRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/memory", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const items = await prisma.businessMemory.findMany({ where: { businessId, deletedAt: null }, orderBy: { updatedAt: "desc" } });
    return reply.send({ success: true, data: items });
  });

  app.post("/api/v1/businesses/:businessId/memory", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = memorySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid memory", details: parsed.error.flatten() });
    const m = await prisma.businessMemory.create({ data: { businessId, content: parsed.data.content, key: parsed.data.key, memoryType: parsed.data.memoryType, importance: parsed.data.importance, confidence: parsed.data.confidence, source: parsed.data.source || "owner", status: "active" } });
    await prisma.memoryEvent.create({ data: { memoryId: m.id, eventType: "created", newValue: JSON.stringify(m), actorType: "user", actorId: userId } });
    return reply.code(201).send({ success: true, data: m });
  });

  app.patch("/api/v1/businesses/:businessId/memory/:memoryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, memoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const existing = await prisma.businessMemory.findFirst({ where: { id: memoryId, businessId } });
    if (!existing) throw Errors.notFound("BusinessMemory");
    const parsed = memorySchema.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const before = { ...existing };
    const updated = await prisma.businessMemory.update({ where: { id: memoryId }, data: parsed.data as any });
    await prisma.memoryEvent.create({ data: { memoryId, eventType: "updated", oldValue: JSON.stringify(before), newValue: JSON.stringify(updated), actorType: "user", actorId: userId } });
    return reply.send({ success: true, data: updated });
  });

  app.delete("/api/v1/businesses/:businessId/memory/:memoryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, memoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    await prisma.businessMemory.update({ where: { id: memoryId }, data: { deletedAt: new Date(), status: "archived" } });
    await prisma.memoryEvent.create({ data: { memoryId, eventType: "archived", actorType: "user", actorId: userId } });
    return reply.code(204).send();
  });
}
