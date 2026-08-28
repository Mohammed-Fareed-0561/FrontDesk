import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { aiService } from "../../infrastructure/ai/AIService.js";
import { retrieveKnowledge } from "../knowledge/retrieval.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

async function buildBusinessContext(businessId: string) {
  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 3600000);
  const prev7 = new Date(last7.getTime() - 7 * 24 * 3600000);
  const todayStart = new Date(now.setHours(0, 0, 0, 0));

  const [ordersLast7, ordersPrev7, ordersToday, bookingsToday, enquiriesOpen, products, customers] = await Promise.all([
    prisma.order.findMany({ where: { businessId, createdAt: { gte: last7 } } }),
    prisma.order.findMany({ where: { businessId, createdAt: { gte: prev7, lt: last7 } } }),
    prisma.order.count({ where: { businessId, createdAt: { gte: todayStart } } }),
    prisma.booking.count({ where: { businessId, createdAt: { gte: todayStart } } }),
    prisma.enquiry.count({ where: { businessId, status: { in: ["new", "open", "waiting"] } } }),
    prisma.product.findMany({ where: { businessId, deletedAt: null } }),
    prisma.customer.count({ where: { businessId } }),
  ]);

  const totalLast7 = ordersLast7.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalPrev7 = ordersPrev7.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const countLast7 = ordersLast7.length;
  const countPrev7 = ordersPrev7.length;

  return {
    businessId,
    now,
    orders: { last7: countLast7, prev7: countPrev7, today: ordersToday, totalLast7, totalPrev7 },
    bookings: { today: bookingsToday },
    enquiries: { open: enquiriesOpen },
    products: { total: products.length, active: products.filter(p => p.status === "active").length },
    customers: { total: customers },
    timeWindow: { last7, prev7, todayStart },
  };
}

async function detectSignals(businessId: string) {
  const ctx = await buildBusinessContext(businessId);
  const signals: any[] = [];

  // SALES_DROP: orders last7 vs prev7 drop >30%
  if (ctx.orders.prev7 > 0) {
    const change = ((ctx.orders.last7 - ctx.orders.prev7) / ctx.orders.prev7) * 100;
    if (change <= -30) {
      signals.push({
        insightType: "SALES_DROP",
        severity: change <= -50 ? "HIGH" : "MEDIUM",
        title: `Sales dropped ${Math.abs(change).toFixed(1)}%`,
        description: `Orders decreased from ${ctx.orders.prev7} to ${ctx.orders.last7} in last 7 days vs previous 7 days.`,
        evidence: JSON.stringify({ ordersPrev7: ctx.orders.prev7, ordersLast7: ctx.orders.last7, change: change.toFixed(1), totalPrev7: ctx.orders.totalPrev7, totalLast7: ctx.orders.totalLast7, window: "7d" }),
        source: "deterministic",
      });
    }
  }

  // ENQUIRY_BACKLOG
  if (ctx.enquiries.open >= 5) {
    signals.push({
      insightType: "ENQUIRY_BACKLOG",
      severity: ctx.enquiries.open >= 10 ? "HIGH" : "MEDIUM",
      title: `${ctx.enquiries.open} enquiries need attention`,
      description: `${ctx.enquiries.open} enquiries are in new/open/waiting status.`,
      evidence: JSON.stringify({ openEnquiries: ctx.enquiries.open }),
      source: "deterministic",
    });
  }

  // BOOKING_SPIKE / CANCELLATION (today)
  const bookingsTodayCancelled = await prisma.booking.count({ where: { businessId, status: "cancelled", createdAt: { gte: ctx.timeWindow.todayStart } } });
  if (bookingsTodayCancelled >= 3) {
    signals.push({
      insightType: "BOOKING_CANCELLATION_SPIKE",
      severity: "MEDIUM",
      title: `${bookingsTodayCancelled} bookings cancelled today`,
      description: `Above normal range (3+).`,
      evidence: JSON.stringify({ cancelledToday: bookingsTodayCancelled }),
      source: "deterministic",
    });
  }

  // PRODUCT_DEMAND (low conversion: many enquiries but few orders)
  if (ctx.enquiries.open >= 5 && ctx.orders.last7 === 0) {
    signals.push({
      insightType: "LOW_CONVERSION",
      severity: "MEDIUM",
      title: "Low conversion: enquiries without orders",
      description: `${ctx.enquiries.open} open enquiries but 0 orders in last 7 days.`,
      evidence: JSON.stringify({ openEnquiries: ctx.enquiries.open, ordersLast7: ctx.orders.last7 }),
      source: "deterministic",
    });
  }

  return { ctx, signals };
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
    await assertBusinessAccess(userId, businessId);
    const { ctx, signals } = await detectSignals(businessId);
    const created: any[] = [];
    for (const s of signals) {
      const existing = await prisma.insight.findFirst({ where: { businessId, insightType: s.insightType, status: { in: ["new", "seen"] } } });
      if (existing) continue;
      const insight = await prisma.insight.create({
        data: {
          businessId,
          insightType: s.insightType,
          severity: s.severity,
          title: s.title,
          description: s.description,
          evidence: s.evidence,
          status: "new",
          source: s.source,
          detectedAt: new Date(),
        },
      });
      created.push(insight);
      await prisma.auditLog.create({ data: { businessId, actorType: "system", actorId: userId, action: "INSIGHT_CREATED", entityType: "insight", entityId: insight.id, afterData: JSON.stringify(insight) } });
      await prisma.domainEvent.create({ data: { businessId, eventType: "INSIGHT_CREATED", aggregateType: "insight", aggregateId: insight.id, payload: JSON.stringify({ insightId: insight.id, type: s.insightType }) } });
    }

    // AI explanation for new signals (bounded, mock)
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
            context: { businessId, userId, businessName: ctx.orders.today.toString(), productCount: ctx.products.total, enquiryNew: ctx.enquiries.open, avgPrice: 0 },
            rateLimitKey: `insights:${businessId}:${userId}`,
          });
          const explanation = aiRes.message.slice(0, 500);
          const updated = await prisma.insight.update({ where: { id: insight.id }, data: { description: `${insight.description}\n\nAI: ${explanation}` } });
          return updated;
        } catch (e) {
          return insight;
        }
      })
    );

    return reply.send({ success: true, data: { context: { orders: ctx.orders, enquiries: ctx.enquiries, bookings: ctx.bookings, timeWindow: ctx.timeWindow }, signals: withExplanation.length ? withExplanation : created, total: withExplanation.length || created.length } });
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
    return reply.send({ success: true, data: { context: ctx, knowledge: knowledge.map((k) => ({ content: k.content, provenance: k.provenance })), memory: memory.map((m) => ({ content: m.content, scope: m.scope })), provenance: { knowledge: knowledge.length, memory: memory.length } } });
  });
}
