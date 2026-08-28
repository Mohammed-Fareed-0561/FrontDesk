import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { aiService } from "../../infrastructure/ai/AIService.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

export async function aiRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/ai/chat", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      message: z.string().min(1).max(2000),
      taskType: z.string().optional(),
      provider: z.string().optional(),
      model: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });

    const [products, enquiries, imports] = await Promise.all([
      prisma.product.findMany({ where: { businessId, deletedAt: null } }),
      prisma.enquiry.findMany({ where: { businessId } }),
      prisma.importJob.findMany({ where: { businessId } }),
    ]);
    const avgPrice = products.length ? Math.round(products.filter(p => p.price).reduce((s, p) => s + (p.price || 0), 0) / Math.max(1, products.filter(p => p.price).length)) : 0;
    const context = {
      businessId,
      userId,
      businessName: business.name,
      productCount: products.filter(p => p.status === "active").length,
      productDraft: products.filter(p => p.status === "draft").length,
      enquiryNew: enquiries.filter(e => e.status === "new").length,
      avgPrice,
      importCount: imports.length,
    };

    const aiReq = await prisma.aiRequest.create({
      data: { businessId, userId, requestType: parsed.data.taskType || "CHAT", modelProvider: parsed.data.provider || aiService.getProviderName(), modelName: parsed.data.model || aiService.getProvider(parsed.data.provider, parsed.data.model).model, status: "processing" },
    });

    let response: any;
    const start = Date.now();
    try {
      response = await aiService.generate({
        message: parsed.data.message,
        taskType: parsed.data.taskType,
        context,
        requestedProvider: parsed.data.provider,
        requestedModel: parsed.data.model,
        rateLimitKey: `ai:${businessId}:${userId}`,
      });
    } catch (e: any) {
      await prisma.aiRequest.update({ where: { id: aiReq.id }, data: { status: "failed", completedAt: new Date(), latencyMs: Date.now() - start, inputTokens: parsed.data.message.length } });
      await prisma.aiOutput.create({ data: { aiRequestId: aiReq.id, outputType: "error", content: JSON.stringify({ error: e.message }), confidence: 0 } });
      throw new AppError({ statusCode: e.message.includes("Rate limit") ? 429 : e.message.includes("Invalid provider") || e.message.includes("Invalid model") ? 422 : 502, code: e.message.includes("Rate limit") ? "RATE_LIMITED" : "AI_PROVIDER_ERROR", message: e.message });
    }

    const actions: any[] = [];
    for (const act of response.actions || []) {
      let payload = act.payload;
      let targetId: string | undefined = act.targetId;
      if (act.type === "UPDATE_PRODUCT" && payload?.targetName) {
        const product = products.find(p => p.name.toLowerCase().includes(payload.targetName.toLowerCase()));
        if (product) {
          targetId = product.id;
          payload = { price: payload.price };
        } else {
          continue;
        }
      }
      actions.push({ type: act.type, payload, targetId, approvalRequired: act.approvalRequired });
    }

    for (const act of actions) {
      const def = await prisma.actionDefinition.findUnique({ where: { actionKey: act.type } });
      const needsApproval = def?.approvalRequired || act.approvalRequired;
      const exec = await prisma.actionExecution.create({
        data: { businessId, actionDefinitionId: def?.id || (await ensureActionDef(act.type)).id, requestedByType: "ai", requestedById: aiReq.id, status: needsApproval ? "pending" : "completed", inputPayload: JSON.stringify(act), resultPayload: needsApproval ? undefined : JSON.stringify({ queued: true }) },
      });
      if (needsApproval) {
        await prisma.approvalRequest.create({ data: { businessId, actionExecutionId: exec.id, requestedByType: "ai", requestedById: aiReq.id, status: "pending", reason: act.type, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
      } else if (act.type === "CREATE_PRODUCT") {
        const slug = act.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
        let finalSlug = slug;
        let i = 1;
        while (await prisma.product.findFirst({ where: { businessId, slug: finalSlug } })) finalSlug = `${slug}-${i++}`;
        await prisma.product.create({ data: { businessId, name: act.payload.name, slug: finalSlug, price: act.payload.price, currency: "INR", status: "active" } });
      }
    }

    await prisma.aiRequest.update({ where: { id: aiReq.id }, data: { status: "completed", completedAt: new Date(), latencyMs: Date.now() - start, inputTokens: parsed.data.message.length, outputTokens: response.message.length } });
    await prisma.aiOutput.create({ data: { aiRequestId: aiReq.id, outputType: "chat", content: JSON.stringify({ ...response, actions }), confidence: 0.9 } });

    return reply.send({ success: true, data: { message: response.message, actions, businessContext: { productCount: context.productCount }, provider: response.provider, model: response.model, usage: response.usage } });
  });

  app.get("/api/v1/businesses/:businessId/approvals", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const items = await prisma.approvalRequest.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
    return reply.send({ success: true, data: items });
  });

  app.post("/api/v1/businesses/:businessId/approvals/:approvalId/approve", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, approvalId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const approval = await prisma.approvalRequest.findFirst({ where: { id: approvalId, businessId } });
    if (!approval) throw Errors.notFound("Approval");
    if (approval.status !== "pending") throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Already decided" });
    await prisma.approvalRequest.update({ where: { id: approvalId }, data: { status: "approved", reviewedBy: userId, reviewedAt: new Date() } });
    if (approval.actionExecutionId) {
      await prisma.actionExecution.update({ where: { id: approval.actionExecutionId }, data: { status: "completed", completedAt: new Date() } });
      const exec = await prisma.actionExecution.findUnique({ where: { id: approval.actionExecutionId } });
      if (exec?.inputPayload) {
        const action = JSON.parse(exec.inputPayload);
        if (action.type === "UPDATE_PRODUCT" && action.targetId && action.payload?.price !== undefined) {
          await prisma.product.update({ where: { id: action.targetId }, data: { price: action.payload.price } });
          await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "PRODUCT_UPDATED_VIA_APPROVAL", entityType: "product", entityId: action.targetId } });
        }
      }
    }
    return reply.send({ success: true, data: { status: "approved" } });
  });

  app.post("/api/v1/businesses/:businessId/approvals/:approvalId/reject", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, approvalId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const approval = await prisma.approvalRequest.findFirst({ where: { id: approvalId, businessId } });
    if (!approval) throw Errors.notFound("Approval");
    await prisma.approvalRequest.update({ where: { id: approvalId }, data: { status: "rejected", reviewedBy: userId, reviewedAt: new Date() } });
    if (approval.actionExecutionId) await prisma.actionExecution.update({ where: { id: approval.actionExecutionId }, data: { status: "cancelled" } });
    return reply.send({ success: true, data: { status: "rejected" } });
  });

  app.post("/api/v1/businesses/:businessId/copilot/query", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const schema = z.object({ message: z.string().min(1), provider: z.string().optional(), model: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });

    const aiReq = await prisma.aiRequest.create({ data: { businessId, userId, requestType: "COPILOT_ANALYSIS", modelProvider: parsed.data.provider || aiService.getProviderName(), modelName: parsed.data.model || aiService.getProvider(parsed.data.provider, parsed.data.model).model, status: "processing" } });
    let copilotResponse: any;
    try {
      const ctx = { businessId, userId, businessName: business.name, productCount: 0, enquiryNew: 0, avgPrice: 0 };
      copilotResponse = await aiService.generate({ message: parsed.data.message, context: ctx as any, requestedProvider: parsed.data.provider, requestedModel: parsed.data.model, rateLimitKey: `copilot:${businessId}:${userId}` });
    } catch (e: any) {
      await prisma.aiRequest.update({ where: { id: aiReq.id }, data: { status: "failed", completedAt: new Date() } });
      throw new AppError({ statusCode: 502, code: "AI_PROVIDER_ERROR", message: e.message });
    }
    const products = await prisma.product.findMany({ where: { businessId } });
    const enquiries = await prisma.enquiry.count({ where: { businessId, status: "new" } });
    const recommendations: any[] = [];
    if (enquiries > 0) recommendations.push({ type: "ENQUIRY_FOLLOWUP", priority: "high", message: `You have ${enquiries} new enquiries needing reply.`, actionAvailable: true });
    if (products.filter(p => p.status === "draft").length > 0) recommendations.push({ type: "REVIEW_PRODUCTS", priority: "medium", message: "Some imported products need review before publishing.", actionAvailable: true });
    if (copilotResponse.message) recommendations.push({ type: "AI_RESPONSE", priority: "medium", message: copilotResponse.message, actionAvailable: false });
    await prisma.aiRequest.update({ where: { id: aiReq.id }, data: { status: "completed", completedAt: new Date() } });
    await prisma.aiOutput.create({ data: { aiRequestId: aiReq.id, content: JSON.stringify({ recommendations, provider: copilotResponse.provider, model: copilotResponse.model }), outputType: "copilot" } });
    return reply.send({ success: true, data: { message: parsed.data.message ? `Analyzed: ${parsed.data.message}` : "Here's what needs attention today.", recommendations, business: { name: business.name }, provider: copilotResponse.provider, model: copilotResponse.model } });
  });

  app.get("/api/v1/businesses/:businessId/ai/history", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const items = await prisma.aiRequest.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 20, include: { outputs: true } });
    return reply.send({ success: true, data: items });
  });
}

async function ensureActionDef(key: string) {
  let def = await prisma.actionDefinition.findUnique({ where: { actionKey: key } });
  if (!def) def = await prisma.actionDefinition.create({ data: { actionKey: key, name: key, approvalRequired: key === "UPDATE_PRODUCT" || key === "DELETE_PRODUCT" } });
  return def;
}
