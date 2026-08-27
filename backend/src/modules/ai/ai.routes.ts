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

// Mock AI gateway — deterministic, no external provider required for v0.1
function mockAIResponse(message: string, businessContext: any) {
  const lower = message.toLowerCase();
  if (lower.includes("price") || lower.includes("product")) {
    return {
      message: `I found ${businessContext.productCount} active products. Your top products have an average price around ₹${businessContext.avgPrice || 250}. Want me to suggest a promotion?`,
      actions: [],
      sources: []
    };
  }
  if (lower.includes("today") || lower.includes("task")) {
    return {
      message: `You have ${businessContext.enquiryNew} new enquiries and ${businessContext.productDraft} draft products needing review. Recommended: review imports and publish your website if not yet published.`,
      actions: [],
      sources: []
    };
  }
  return {
    message: `Thanks for asking: "${message}". I can help you manage catalog, website, and enquiries. For example, say "add cappuccino for ₹120" and I'll propose the change for your approval.`,
    actions: [],
    sources: []
  };
}

export async function aiRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/ai/chat", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const schema = z.object({ message: z.string().min(1), taskType: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });

    const start = Date.now();
    // Gather business context (tenant-isolated)
    const [products, enquiries, imports] = await Promise.all([
      prisma.product.findMany({ where: { businessId, deletedAt: null } }),
      prisma.enquiry.findMany({ where: { businessId } }),
      prisma.importJob.findMany({ where: { businessId } }),
    ]);
    const avgPrice = products.length ? Math.round(products.filter(p => p.price).reduce((s, p) => s + (p.price || 0), 0) / Math.max(1, products.filter(p => p.price).length)) : 0;
    const context = {
      productCount: products.filter(p => p.status === "active").length,
      productDraft: products.filter(p => p.status === "draft").length,
      enquiryNew: enquiries.filter(e => e.status === "new").length,
      avgPrice,
      importCount: imports.length,
      businessName: business.name,
    };

    // Record ai request (cost control / audit)
    const aiReq = await prisma.aiRequest.create({
      data: { businessId, userId, requestType: parsed.data.taskType || "CHAT", modelProvider: "mock", modelName: "mock-v0.1", status: "processing" }
    });

    const response = mockAIResponse(parsed.data.message, context);

    // handle structured actions: detect "add product ..." naive
    const actions: any[] = [];
    const addMatch = parsed.data.message.match(/add\s+(.+?)\s+for\s+₹?\s*(\d+)/i);
    if (addMatch) {
      const name = addMatch[1].trim();
      const price = Number(addMatch[2]);
      actions.push({ type: "CREATE_PRODUCT", payload: { name, price, currency: "INR" }, approvalRequired: false });
    }
    const priceMatch = parsed.data.message.match(/change\s+(.+?)\s+price\s+to\s+₹?\s*(\d+)/i);
    if (priceMatch) {
      const target = priceMatch[1].trim();
      const price = Number(priceMatch[2]);
      // find product
      const product = products.find(p => p.name.toLowerCase().includes(target.toLowerCase()));
      if (product) actions.push({ type: "UPDATE_PRODUCT", targetId: product.id, payload: { price }, approvalRequired: true });
    }

    // If actions need approval, create approval requests
    for (const act of actions) {
      const def = await prisma.actionDefinition.findUnique({ where: { actionKey: act.type } });
      const needsApproval = def?.approvalRequired || act.approvalRequired;
      const exec = await prisma.actionExecution.create({
        data: { businessId, actionDefinitionId: def?.id || (await ensureActionDef(act.type)).id, requestedByType: "ai", requestedById: aiReq.id, status: needsApproval ? "pending" : "completed", inputPayload: JSON.stringify(act), resultPayload: needsApproval ? undefined : JSON.stringify({ queued: true }) }
      });
      if (needsApproval) {
        await prisma.approvalRequest.create({ data: { businessId, actionExecutionId: exec.id, requestedByType: "ai", requestedById: aiReq.id, status: "pending", reason: act.type, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
      } else if (act.type === "CREATE_PRODUCT") {
        // execute immediately (low risk)
        const slug = act.payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
        let finalSlug = slug;
        let i = 1;
        while (await prisma.product.findFirst({ where: { businessId, slug: finalSlug } })) finalSlug = `${slug}-${i++}`;
        await prisma.product.create({ data: { businessId, name: act.payload.name, slug: finalSlug, price: act.payload.price, currency: "INR", status: "active" } });
      }
    }

    await prisma.aiRequest.update({ where: { id: aiReq.id }, data: { status: "completed", completedAt: new Date(), latencyMs: Date.now() - start, inputTokens: parsed.data.message.length, outputTokens: response.message.length } });
    await prisma.aiOutput.create({ data: { aiRequestId: aiReq.id, outputType: "chat", content: JSON.stringify({ ...response, actions }), confidence: 0.9 } });

    return reply.send({ success: true, data: { message: response.message, actions, businessContext: context } });
  });

  // approvals
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
      // execute pending product update if applicable
      const exec = await prisma.actionExecution.findUnique({ where: { id: approval.actionExecutionId } });
      if (exec?.inputPayload) {
        const action = JSON.parse(exec.inputPayload);
        if (action.type === "UPDATE_PRODUCT" && action.targetId && action.payload?.price !== undefined) {
          await prisma.product.update({ where: { id: action.targetId }, data: { price: action.payload.price } });
          await prisma.auditLog.create({ data: { businessId, actorType: "ai", actorId: approval.actionExecutionId, action: "PRODUCT_UPDATED_VIA_APPROVAL", entityType: "product", entityId: action.targetId } });
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

  // copilot query alias
  app.post("/api/v1/businesses/:businessId/copilot/query", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    (req as any).url = `/api/v1/businesses/${(req.params as any).businessId}/ai/chat`;
    // delegate to same logic by reusing handler — simple redirect: just call chat logic (copy)
    // For simplicity, return same as chat
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const schema = z.object({ message: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const aiReq = await prisma.aiRequest.create({ data: { businessId, userId, requestType: "COPILOT_ANALYSIS", modelProvider: "mock", modelName: "mock-v0.1", status: "completed" } });
    const products = await prisma.product.findMany({ where: { businessId } });
    const enquiries = await prisma.enquiry.count({ where: { businessId, status: "new" } });
    const recommendations = [];
    if (enquiries > 0) recommendations.push({ type: "ENQUIRY_FOLLOWUP", priority: "high", message: `You have ${enquiries} new enquiries needing reply.`, actionAvailable: true });
    if (products.filter(p => p.status === "draft").length > 0) recommendations.push({ type: "REVIEW_PRODUCTS", priority: "medium", message: "Some imported products need review before publishing.", actionAvailable: true });
    await prisma.aiOutput.create({ data: { aiRequestId: aiReq.id, content: JSON.stringify({ recommendations }), outputType: "copilot" } });
    return reply.send({ success: true, data: { message: parsed.data.message ? `Analyzed: ${parsed.data.message}` : "Here's what needs attention today.", recommendations, business: { name: business.name } } });
  });
}

async function ensureActionDef(key: string) {
  let def = await prisma.actionDefinition.findUnique({ where: { actionKey: key } });
  if (!def) def = await prisma.actionDefinition.create({ data: { actionKey: key, name: key, approvalRequired: key === "UPDATE_PRODUCT" || key === "DELETE_PRODUCT" } });
  return def;
}
