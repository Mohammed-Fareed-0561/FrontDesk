import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { parsePagination } from "../../shared/utils/pagination.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

const enquirySchema = z.object({
  subject: z.string().optional(),
  message: z.string().min(1),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  source: z.string().optional(),
});

export async function enquiriesRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/enquiries", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const { page, pageSize, skip, take } = parsePagination(req.query as any);
    const q = req.query as any;
    const where: any = { businessId };
    if (q.status) where.status = q.status;
    if (q.search) where.message = { contains: q.search };
    const [items, total] = await Promise.all([
      prisma.enquiry.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { customer: true } }),
      prisma.enquiry.count({ where })
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.post("/api/v1/businesses/:businessId/enquiries", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = enquirySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid enquiry", details: parsed.error.flatten() });
    let customerId = parsed.data.customerId;
    if (!customerId && (parsed.data.customerName || parsed.data.customerPhone || parsed.data.customerEmail)) {
      const c = await prisma.customer.create({ data: { businessId, name: parsed.data.customerName, email: parsed.data.customerEmail, phone: parsed.data.customerPhone, source: parsed.data.source || "enquiry" } });
      customerId = c.id;
    }
    // create conversation
    let conversation = await prisma.conversation.create({ data: { businessId, customerId, channel: parsed.data.source || "website", status: "open", lastMessageAt: new Date() } });
    await prisma.message.create({ data: { conversationId: conversation.id, senderType: "customer", senderId: customerId, content: parsed.data.message, messageType: "text" } });
    const enquiry = await prisma.enquiry.create({ data: { businessId, customerId, conversationId: conversation.id, subject: parsed.data.subject, message: parsed.data.message, status: "new", priority: parsed.data.priority || "medium", source: parsed.data.source || "website" } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "ENQUIRY_CREATED", aggregateType: "enquiry", aggregateId: enquiry.id, payload: JSON.stringify(enquiry) } });
    return reply.code(201).send({ success: true, data: enquiry });
  });

  // public enquiry (no auth) — customer enquiries from public site
  app.post("/api/v1/public/businesses/:slug/enquiries", async (req, reply) => {
    const { slug } = req.params as any;
    const business = await prisma.business.findFirst({ where: { slug } });
    if (!business) throw Errors.notFound("Business");
    const schema = z.object({ name: z.string().min(1), phone: z.string().optional(), email: z.string().email().optional(), message: z.string().min(1), subject: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    let customer: any = null;
    if (parsed.data.phone || parsed.data.email) {
      customer = await prisma.customer.findFirst({ where: { businessId: business.id, OR: [{ phone: parsed.data.phone }, { email: parsed.data.email }] } });
      if (!customer) customer = await prisma.customer.create({ data: { businessId: business.id, name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email, source: "public_website" } });
    } else {
      customer = await prisma.customer.create({ data: { businessId: business.id, name: parsed.data.name, source: "public_website" } });
    }
    const conv = await prisma.conversation.create({ data: { businessId: business.id, customerId: customer.id, channel: "website", status: "open", lastMessageAt: new Date() } });
    await prisma.message.create({ data: { conversationId: conv.id, senderType: "customer", senderId: customer.id, content: parsed.data.message } });
    const enquiry = await prisma.enquiry.create({ data: { businessId: business.id, customerId: customer.id, conversationId: conv.id, subject: parsed.data.subject, message: parsed.data.message, status: "new", source: "public_website" } });
    await prisma.domainEvent.create({ data: { businessId: business.id, eventType: "ENQUIRY_CREATED", aggregateType: "enquiry", aggregateId: enquiry.id, payload: JSON.stringify(enquiry) } });
    return reply.code(201).send({ success: true, data: { id: enquiry.id, message: "Enquiry received. We'll contact you soon." } });
  });

  app.get("/api/v1/businesses/:businessId/enquiries/:enquiryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, enquiryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const e = await prisma.enquiry.findFirst({ where: { id: enquiryId, businessId }, include: { customer: true, conversation: { include: { messages: { orderBy: { createdAt: "asc" } } } } } });
    if (!e) throw Errors.notFound("Enquiry");
    return reply.send({ success: true, data: e });
  });

  app.patch("/api/v1/businesses/:businessId/enquiries/:enquiryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, enquiryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({ status: z.enum(["new", "contacted", "in_progress", "waiting", "resolved", "closed"]).optional(), priority: z.string().optional(), assignedTo: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const updated = await prisma.enquiry.update({ where: { id: enquiryId }, data: parsed.data as any });
    if (parsed.data.status === "resolved" || parsed.data.status === "closed") {
      await prisma.enquiry.update({ where: { id: enquiryId }, data: { closedAt: new Date() } });
    }
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "ENQUIRY_UPDATED", entityType: "enquiry", entityId: enquiryId, afterData: JSON.stringify(parsed.data) } });
    return reply.send({ success: true, data: updated });
  });

  // conversations
  app.get("/api/v1/businesses/:businessId/conversations", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const { page, pageSize, skip, take } = parsePagination(req.query as any);
    const [items, total] = await Promise.all([
      prisma.conversation.findMany({ where: { businessId }, skip, take, orderBy: { lastMessageAt: "desc" }, include: { customer: true, messages: { take: 1, orderBy: { createdAt: "desc" } } } }),
      prisma.conversation.count({ where: { businessId } })
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.get("/api/v1/businesses/:businessId/conversations/:conversationId/messages", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, conversationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const conv = await prisma.conversation.findFirst({ where: { id: conversationId, businessId } });
    if (!conv) throw Errors.notFound("Conversation");
    const msgs = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" } });
    return reply.send({ success: true, data: msgs });
  });

  app.post("/api/v1/businesses/:businessId/conversations/:conversationId/messages", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, conversationId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({ content: z.string().min(1), messageType: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid message", details: parsed.error.flatten() });
    const conv = await prisma.conversation.findFirst({ where: { id: conversationId, businessId } });
    if (!conv) throw Errors.notFound("Conversation");
    const msg = await prisma.message.create({ data: { conversationId, senderType: "business", senderId: userId, content: parsed.data.content, messageType: parsed.data.messageType || "text" } });
    await prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } });
    return reply.code(201).send({ success: true, data: msg });
  });
}
