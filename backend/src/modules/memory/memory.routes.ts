import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { mockEmbedding } from "../../infrastructure/ai/MockEmbeddingProvider.js";
import { cosineSimilarity } from "../../infrastructure/ai/EmbeddingProvider.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

function detectSecret(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("api_key") || /sk-[a-z0-9]{20,}/.test(lower) || lower.includes("password:") || lower.includes("secret_key");
}

export async function memoryRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/memory", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const q = req.query as any;
    const where: any = { businessId, deletedAt: null };
    if (q.status) where.status = q.status;
    if (q.scope) where.scope = q.scope;
    if (q.search) where.content = { contains: q.search };
    if (q.scopeEntityId) where.scopeEntityId = q.scopeEntityId;
    const items = await prisma.businessMemory.findMany({ where, orderBy: { updatedAt: "desc" }, take: 100 });
    return reply.send({ success: true, data: items });
  });

  app.get("/api/v1/businesses/:businessId/memory/:memoryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, memoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const m = await prisma.businessMemory.findFirst({ where: { id: memoryId, businessId, deletedAt: null } });
    if (!m) throw Errors.notFound("BusinessMemory");
    return reply.send({ success: true, data: m });
  });

  app.post("/api/v1/businesses/:businessId/memory", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      content: z.string().min(1).max(2000),
      key: z.string().optional(),
      memoryType: z.string().optional().default("PREFERENCE"),
      scope: z.string().optional().default("BUSINESS"),
      scopeEntityId: z.string().optional(),
      priority: z.string().optional().default("MEDIUM"),
      importance: z.number().min(1).max(5).optional(),
      confidence: z.number().min(0).max(1).optional().default(1),
      source: z.string().optional().default("OWNER"),
      expiresAt: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid memory", details: parsed.error.flatten() });
    if (detectSecret(parsed.data.content)) throw new AppError({ statusCode: 400, code: "SECRET_DETECTED", message: "Content contains potential secrets" });
    if (parsed.data.scopeEntityId && parsed.data.scope === "BUSINESS") throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "BUSINESS scope should not have scopeEntityId" });
    if (parsed.data.scope === "CUSTOMER" && parsed.data.scopeEntityId) {
      const cust = await prisma.customer.findFirst({ where: { id: parsed.data.scopeEntityId, businessId } });
      if (!cust) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Customer does not belong to this business" });
    }
    if (parsed.data.scope === "PRODUCT" && parsed.data.scopeEntityId) {
      const prod = await prisma.product.findFirst({ where: { id: parsed.data.scopeEntityId, businessId } });
      if (!prod) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Product does not belong to this business" });
    }
    if (parsed.data.scope === "SERVICE" && parsed.data.scopeEntityId) {
      const svc = await prisma.service.findFirst({ where: { id: parsed.data.scopeEntityId, businessId } });
      if (!svc) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Service does not belong to this business" });
    }
    const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    if (expiresAt && isNaN(expiresAt.getTime())) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid expiresAt" });

    const embedding = await mockEmbedding.embed(parsed.data.content);
    const data: any = {
      businessId,
      content: parsed.data.content,
      key: parsed.data.key,
      memoryType: parsed.data.memoryType,
      scope: parsed.data.scope,
      scopeEntityId: parsed.data.scopeEntityId,
      priority: parsed.data.priority,
      importance: parsed.data.importance,
      confidence: parsed.data.confidence,
      source: parsed.data.source,
      status: "active",
      createdBy: userId,
      expiresAt,
      embedding: JSON.stringify(embedding),
    };

    const m = await prisma.businessMemory.create({ data });
    await prisma.memoryEvent.create({ data: { memoryId: m.id, eventType: "created", newValue: JSON.stringify(m), actorType: "user", actorId: userId } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEMORY_CREATED", entityType: "memory", entityId: m.id, afterData: JSON.stringify(m) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "MEMORY_CREATED", aggregateType: "memory", aggregateId: m.id, payload: JSON.stringify({ memoryId: m.id, scope: m.scope }) } });
    return reply.code(201).send({ success: true, data: m });
  });

  app.patch("/api/v1/businesses/:businessId/memory/:memoryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, memoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const existing = await prisma.businessMemory.findFirst({ where: { id: memoryId, businessId, deletedAt: null } });
    if (!existing) throw Errors.notFound("BusinessMemory");
    const schema = z.object({
      content: z.string().min(1).max(2000).optional(),
      memoryType: z.string().optional(),
      priority: z.string().optional(),
      importance: z.number().min(1).max(5).optional(),
      confidence: z.number().min(0).max(1).optional(),
      status: z.string().optional(),
      expiresAt: z.string().optional().nullable(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    if (parsed.data.content && detectSecret(parsed.data.content)) throw new AppError({ statusCode: 400, code: "SECRET_DETECTED", message: "Content contains potential secrets" });
    const before = { ...existing };
    const updateData: any = { ...parsed.data };
    if (parsed.data.expiresAt !== undefined) updateData.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    if (parsed.data.content) {
      const emb = await mockEmbedding.embed(parsed.data.content);
      updateData.embedding = JSON.stringify(emb);
    }
    const updated = await prisma.businessMemory.update({ where: { id: memoryId }, data: updateData });
    await prisma.memoryEvent.create({ data: { memoryId, eventType: "updated", oldValue: JSON.stringify(before), newValue: JSON.stringify(updated), actorType: "user", actorId: userId } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEMORY_UPDATED", entityType: "memory", entityId: memoryId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    if (parsed.data.content && before.content !== parsed.data.content) {
      const superseded = await prisma.businessMemory.findMany({ where: { businessId, content: before.content, id: { not: memoryId }, status: "active" } });
      for (const s of superseded) {
        await prisma.businessMemory.update({ where: { id: s.id }, data: { status: "superseded" } });
        await prisma.memoryEvent.create({ data: { memoryId: s.id, eventType: "superseded", oldValue: JSON.stringify(s), newValue: JSON.stringify({ status: "superseded" }), actorType: "system", actorId: userId } });
      }
    }
    return reply.send({ success: true, data: updated });
  });

  app.delete("/api/v1/businesses/:businessId/memory/:memoryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, memoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const existing = await prisma.businessMemory.findFirst({ where: { id: memoryId, businessId, deletedAt: null } });
    if (!existing) throw Errors.notFound("BusinessMemory");
    await prisma.businessMemory.update({ where: { id: memoryId }, data: { deletedAt: new Date(), status: "archived" } });
    await prisma.memoryEvent.create({ data: { memoryId, eventType: "archived", actorType: "user", actorId: userId } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEMORY_DELETED", entityType: "memory", entityId: memoryId, beforeData: JSON.stringify(existing) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "MEMORY_DELETED", aggregateType: "memory", aggregateId: memoryId, payload: JSON.stringify({ memoryId }) } });
    return reply.code(204).send();
  });

  app.post("/api/v1/businesses/:businessId/memory/search", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      query: z.string().min(1).max(500),
      topK: z.coerce.number().int().min(1).max(10).optional().default(5),
      scope: z.string().optional(),
      scopeEntityId: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const isPg = (process.env.DATABASE_URL || "").startsWith("postgresql");
    if (isPg) {
      try {
        const queryEmb = await mockEmbedding.embed(parsed.data.query);
        const vectorStr = `[${queryEmb.join(",")}]`;
        let whereScope = "";
        const params: any[] = [vectorStr, businessId];
        let idx = 3;
        if (parsed.data.scope) {
          whereScope += ` AND bm."scope" = $${idx++}`;
          params.push(parsed.data.scope);
        }
        if (parsed.data.scopeEntityId) {
          whereScope += ` AND bm."scope_entity_id" = $${idx++}`;
          params.push(parsed.data.scopeEntityId);
        }
        params.push(parsed.data.topK);
        const rows: any[] = await prisma.$queryRawUnsafe(
          `SELECT bm."id", bm."content", bm."scope", bm."scope_entity_id" as "scopeEntityId", bm."priority", bm."status", bm."created_at" as "createdAt", (bm."embedding_vec" <=> $1::vector) as "distance" FROM "business_memories" bm WHERE bm."business_id" = $2 AND bm."deleted_at" IS NULL AND bm."status" = 'active' AND bm."embedding_vec" IS NOT NULL ${whereScope} ORDER BY bm."embedding_vec" <=> $1::vector LIMIT $${idx}`,
          ...params
        );
        if (rows.length > 0) {
          const result = rows.map((r) => ({ id: r.id, content: r.content, scope: r.scope, scopeEntityId: r.scopeEntityId, priority: r.priority, status: r.status, score: 1 - Number(r.distance), provenance: { memoryId: r.id, scope: r.scope, scopeEntityId: r.scopeEntityId } })).filter((s) => s.score > 0.05);
          return reply.send({ success: true, data: result });
        }
      } catch (e) {
        console.warn("pgvector memory search failed, fallback", e);
      }
    }
    const where: any = { businessId, deletedAt: null, status: "active" };
    if (parsed.data.scope) where.scope = parsed.data.scope;
    if (parsed.data.scopeEntityId) where.scopeEntityId = parsed.data.scopeEntityId;
    const all = await prisma.businessMemory.findMany({ where });
    const queryEmb = await mockEmbedding.embed(parsed.data.query);
    const scored = all
      .map((m) => {
        let emb: number[] = [];
        try {
          emb = JSON.parse((m as any).embedding || "[]");
        } catch {}
        const score = emb.length ? cosineSimilarity(queryEmb, emb) : 0;
        return { memory: m, score };
      })
      .filter((s) => s.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, parsed.data.topK)
      .map((s) => ({ id: s.memory.id, content: s.memory.content, scope: s.memory.scope, scopeEntityId: s.memory.scopeEntityId, priority: s.memory.priority, status: s.memory.status, score: s.score, provenance: { memoryId: s.memory.id, scope: s.memory.scope } }));
    return reply.send({ success: true, data: scored });
  });

  app.post("/api/v1/businesses/:businessId/memory/:memoryId/supersede", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, memoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({ content: z.string().min(1).max(2000) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const existing = await prisma.businessMemory.findFirst({ where: { id: memoryId, businessId } });
    if (!existing) throw Errors.notFound("BusinessMemory");
    await prisma.businessMemory.update({ where: { id: memoryId }, data: { status: "superseded" } });
    const emb = await mockEmbedding.embed(parsed.data.content);
    const data: any = { businessId, content: parsed.data.content, memoryType: existing.memoryType, scope: existing.scope, scopeEntityId: existing.scopeEntityId, priority: existing.priority, source: "OWNER", status: "active", createdBy: userId, embedding: JSON.stringify(emb) };
    const created = await prisma.businessMemory.create({ data });
    await prisma.memoryEvent.create({ data: { memoryId: created.id, eventType: "created", newValue: JSON.stringify(created), actorType: "user", actorId: userId } });
    await prisma.memoryEvent.create({ data: { memoryId, eventType: "superseded", oldValue: JSON.stringify(existing), newValue: JSON.stringify({ status: "superseded" }), actorType: "user", actorId: userId } });
    return reply.send({ success: true, data: created });
  });
}
