import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { aiService } from "../../infrastructure/ai/AIService.js";
import { retrieveKnowledge } from "../knowledge/retrieval.js";
import { buildBusinessContext } from "./context.js";
import { detectSignals } from "./signals.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

/**
 * Upsert insight: update existing active/new/seen insight, or recreate if dismissed.
 * The Insight model has @@unique([businessId, insightType]), so only one insight per type per business.
 */
async function upsertInsight(businessId: string, signal: any) {
  const existing = await prisma.insight.findFirst({ where: { businessId, insightType: signal.insightType } });

  if (existing) {
    if (existing.status === "dismissed") {
      // Owner dismissed this — delete the old one and create fresh
      await prisma.insight.delete({ where: { id: existing.id } });
    } else {
      // Active/new/seen — update evidence and severity, refresh detectedAt
      const updated = await prisma.insight.update({
        where: { id: existing.id },
        data: {
          severity: signal.severity,
          title: signal.title,
          description: signal.description,
          evidence: signal.evidence,
          detectedAt: new Date(),
        },
      });
      await prisma.auditLog.create({
        data: { businessId, actorType: "system", action: "INSIGHT_UPDATED", entityType: "insight", entityId: updated.id, afterData: JSON.stringify(updated) },
      });
      return updated;
    }
  }

  // Create new insight
  const insight = await prisma.insight.create({
    data: {
      businessId,
      insightType: signal.insightType,
      severity: signal.severity,
      title: signal.title,
      description: signal.description,
      evidence: signal.evidence,
      status: "new",
      source: signal.source,
      detectedAt: new Date(),
    },
  });
  await prisma.auditLog.create({
    data: { businessId, actorType: "system", action: "INSIGHT_CREATED", entityType: "insight", entityId: insight.id, afterData: JSON.stringify(insight) },
  });
  await prisma.domainEvent.create({
    data: { businessId, eventType: "INSIGHT_CREATED", aggregateType: "insight", aggregateId: insight.id, payload: JSON.stringify({ insightId: insight.id, type: signal.insightType }) },
  });
  return insight;
}

export async function insightsRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/insights", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const q = req.query as any;
    const where: any = { businessId };
    if (q.status) where.status = q.status;
    if (q.severity) where.severity = q.severity;
    if (q.insightType) where.insightType = q.insightType;
    const items = await prisma.insight.findMany({ where, orderBy: { detectedAt: "desc" }, take: 50 });
    return reply.send({ success: true, data: items });
  });

  app.get("/api/v1/businesses/:businessId/insights/:insightId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, insightId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const insight = await prisma.insight.findFirst({ where: { id: insightId, businessId } });
    if (!insight) throw Errors.notFound("Insight");
    return reply.send({ success: true, data: insight });
  });

  app.post("/api/v1/businesses/:businessId/insights/refresh", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const ctx = await buildBusinessContext(businessId);
    const signals = detectSignals(ctx);
    const created: any[] = [];

    for (const signal of signals) {
      const insight = await upsertInsight(businessId, signal);
      created.push(insight);
    }

    // AI explanation for new/updated signals (bounded, mock)
    const withExplanation = await Promise.all(
      created.map(async (insight) => {
        try {
          const knowledge = await retrieveKnowledge(businessId, insight.title, 3).catch(() => []);
          const memory = await prisma.businessMemory.findMany({ where: { businessId, deletedAt: null, status: "active" }, take: 3 });
          const contextParts = [
            `STRUCTURED BUSINESS FACTS: ${insight.evidence}`,
            knowledge.length ? `BUSINESS KNOWLEDGE: ${knowledge.map((k: any) => k.content.slice(0, 200)).join(" | ")}` : "",
            memory.length ? `BUSINESS MEMORY: ${memory.map((m: any) => m.content.slice(0, 100)).join(" | ")}` : "",
          ].filter(Boolean).join("\n");
          const prompt = `SYSTEM INSTRUCTIONS: You are FrontDesk AI. Explain why this business insight matters and recommend a safe next step. Distinguish FACT (evidence), INFERENCE (why), RECOMMENDATION (next step). Do not invent numbers. Use only provided facts.\n\n${contextParts}\n\nINSIGHT: ${insight.title} - ${insight.description}\n\nUSER REQUEST: Explain this insight and recommend a safe next step.`;
          const aiRes = await aiService.generate({
            message: prompt,
            context: { businessId, userId, businessName: business.name, productCount: ctx.products.total, enquiryNew: ctx.enquiries.open, avgPrice: 0 },
            rateLimitKey: `insights:${businessId}:${userId}`,
          });
          const explanation = aiRes.message.slice(0, 500);
          const updated = await prisma.insight.update({ where: { id: insight.id }, data: { description: `${insight.description}\n\nAI: ${explanation}` } });
          return updated;
        } catch {
          return insight;
        }
      })
    );

    return reply.send({
      success: true,
      data: {
        context: { orders: ctx.orders, enquiries: ctx.enquiries, bookings: ctx.bookings, products: ctx.products, customers: ctx.customers, offers: ctx.offers, timeWindow: ctx.timeWindow },
        signals: withExplanation.length ? withExplanation : created,
        total: withExplanation.length || created.length,
      },
    });
  });

  app.post("/api/v1/businesses/:businessId/insights/:insightId/seen", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, insightId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const insight = await prisma.insight.findFirst({ where: { id: insightId, businessId } });
    if (!insight) throw Errors.notFound("Insight");
    const updated = await prisma.insight.update({ where: { id: insightId }, data: { status: "seen" } });
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/insights/:insightId/dismiss", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, insightId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const insight = await prisma.insight.findFirst({ where: { id: insightId, businessId } });
    if (!insight) throw Errors.notFound("Insight");
    const updated = await prisma.insight.update({ where: { id: insightId }, data: { status: "dismissed" } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "INSIGHT_DISMISSED", entityType: "insight", entityId: insightId } });
    return reply.send({ success: true, data: updated });
  });

  app.get("/api/v1/businesses/:businessId/context", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const ctx = await buildBusinessContext(businessId);
    const knowledge = await retrieveKnowledge(businessId, "business overview", 3).catch(() => []);
    const memory = await prisma.businessMemory.findMany({ where: { businessId, deletedAt: null, status: "active" }, take: 5 });
    return reply.send({
      success: true,
      data: {
        context: ctx,
        knowledge: knowledge.map((k) => ({ content: k.content, provenance: k.provenance })),
        memory: memory.map((m) => ({ content: m.content, scope: m.scope })),
        provenance: { knowledge: knowledge.length, memory: memory.length },
      },
    });
  });
}
