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

const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"] as const;
const PAYMENT_METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "ONLINE", "OTHER"] as const;
const ALLOWED_PAYMENT_TRANSITIONS: Record<string, string[]> = {
  unpaid: ["paid", "pending", "failed"],
  pending: ["paid", "failed"],
  paid: ["refunded", "partially_refunded"],
  failed: ["pending", "unpaid"],
  refunded: [],
  partially_refunded: ["refunded"],
};

function generatePaymentNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PAY-${ts}-${rnd}`;
}

export async function paymentsRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/orders/:orderId/payments", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const order = await prisma.order.findFirst({ where: { id: orderId, businessId } });
    if (!order) throw Errors.notFound("Order");

    const schema = z.object({
      paymentMethod: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "ONLINE", "OTHER"]).optional().default("OTHER"),
      transactionReference: z.string().max(200).optional(),
      provider: z.string().max(100).optional(),
      providerPaymentId: z.string().max(200).optional(),
      amount: z.coerce.number().min(0).optional(),
      currency: z.string().optional(),
      status: z.enum(["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"]).optional().default("paid"),
      idempotencyKey: z.string().max(100).optional(),
    });
    const parsed = schema.safeParse(request.body || {});
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid payment", details: parsed.error.flatten() });

    const headerKey = (request.headers["idempotency-key"] as string) || (request.headers["x-idempotency-key"] as string);
    const idempotencyKey = parsed.data.idempotencyKey || headerKey || undefined;

    if (idempotencyKey) {
      const existing = await prisma.payment.findFirst({ where: { businessId, idempotencyKey } });
      if (existing) {
        return reply.code(200).send({ success: true, data: existing, meta: { idempotent: true } });
      }
    }

    const authoritativeAmount = order.totalAmount ?? order.subtotal ?? 0;
    const currency = business.currency || order.currency || "INR";

    if (parsed.data.amount !== undefined && Math.abs(parsed.data.amount - authoritativeAmount) > 0.01) {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Payment amount must be ${authoritativeAmount} (server-calculated), received ${parsed.data.amount}` });
    }

    const paymentStatus = parsed.data.status || "paid";
    if (paymentStatus === "paid" && order.paymentStatus === "paid") {
      const existingPaid = await prisma.payment.findFirst({ where: { orderId, status: "paid" } });
      if (existingPaid) {
        return reply.code(200).send({ success: true, data: existingPaid, meta: { idempotent: true } });
      }
    }

    let paymentNumber: string;
    let attempts = 0;
    do {
      paymentNumber = generatePaymentNumber();
      attempts++;
      if (attempts > 5) throw new AppError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to generate payment number" });
    } while (await prisma.payment.findUnique({ where: { businessId_paymentNumber: { businessId, paymentNumber } } } as any));

    const payment = await prisma.payment.create({
      data: {
        businessId,
        orderId,
        customerId: order.customerId,
        paymentNumber,
        amount: authoritativeAmount,
        currency,
        status: paymentStatus,
        paymentMethod: parsed.data.paymentMethod,
        provider: parsed.data.provider,
        providerPaymentId: parsed.data.providerPaymentId,
        transactionReference: parsed.data.transactionReference,
        paidAt: paymentStatus === "paid" ? new Date() : null,
        createdBy: userId,
        idempotencyKey: idempotencyKey || null,
      },
    });

    if (paymentStatus === "paid" || paymentStatus === "pending" || paymentStatus === "failed") {
      await prisma.order.update({ where: { id: orderId }, data: { paymentStatus } });
    }

    await prisma.auditLog.create({
      data: {
        businessId,
        actorType: "user",
        actorId: userId,
        action: "PAYMENT_CREATED",
        entityType: "payment",
        entityId: payment.id,
        afterData: JSON.stringify({ paymentId: payment.id, orderId, amount: authoritativeAmount, status: paymentStatus, method: parsed.data.paymentMethod, idempotencyKey }),
      },
    });
    await prisma.domainEvent.create({
      data: { businessId, eventType: "PAYMENT_CREATED", aggregateType: "payment", aggregateId: payment.id, payload: JSON.stringify({ paymentId: payment.id, orderId, amount: authoritativeAmount, status: paymentStatus }) },
    });
    if (paymentStatus === "paid") {
      await prisma.domainEvent.create({
        data: { businessId, eventType: "PAYMENT_PAID", aggregateType: "payment", aggregateId: payment.id, payload: JSON.stringify({ paymentId: payment.id, orderId }) },
      });
    }

    return reply.code(201).send({ success: true, data: payment });
  });

  app.get("/api/v1/businesses/:businessId/payments", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const { page, pageSize, skip, take } = parsePagination(request.query as any);
    const q = request.query as any;
    const where: any = { businessId };
    if (q.status) where.status = q.status;
    if (q.orderId) where.orderId = q.orderId;
    if (q.search) where.paymentNumber = { contains: q.search };
    const [items, total] = await Promise.all([
      prisma.payment.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { order: true } }),
      prisma.payment.count({ where }),
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.get("/api/v1/businesses/:businessId/orders/:orderId/payments", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const order = await prisma.order.findFirst({ where: { id: orderId, businessId } });
    if (!order) throw Errors.notFound("Order");
    const payments = await prisma.payment.findMany({ where: { orderId, businessId }, orderBy: { createdAt: "desc" } });
    return reply.send({ success: true, data: payments });
  });

  app.get("/api/v1/businesses/:businessId/payments/:paymentId", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, paymentId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, businessId }, include: { order: true } });
    if (!payment) throw Errors.notFound("Payment");
    return reply.send({ success: true, data: payment });
  });

  app.post("/api/v1/businesses/:businessId/payments/:paymentId/status", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, paymentId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({ status: z.enum(["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"]) });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid status", details: parsed.error.flatten() });
    const payment = await prisma.payment.findFirst({ where: { id: paymentId, businessId } });
    if (!payment) throw Errors.notFound("Payment");
    const allowed = ALLOWED_PAYMENT_TRANSITIONS[payment.status] || [];
    if (!allowed.includes(parsed.data.status)) {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Cannot transition ${payment.status} -> ${parsed.data.status}` });
    }
    const before = { ...payment };
    const data: any = { status: parsed.data.status, updatedAt: new Date() };
    if (parsed.data.status === "paid") data.paidAt = new Date();
    if (parsed.data.status === "refunded") data.paidAt = null;
    const updated = await prisma.payment.update({ where: { id: paymentId }, data });
    await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: parsed.data.status } }).catch(() => {});
    await prisma.auditLog.create({
      data: { businessId, actorType: "user", actorId: userId, action: "PAYMENT_STATUS_UPDATED", entityType: "payment", entityId: paymentId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) },
    });
    await prisma.domainEvent.create({
      data: { businessId, eventType: "PAYMENT_STATUS_UPDATED", aggregateType: "payment", aggregateId: paymentId, payload: JSON.stringify({ paymentId, from: payment.status, to: parsed.data.status }) },
    });
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/payments/:paymentId/refund", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    return reply.code(422).send({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Refunds are not implemented in P0. Use payment status transitions when available." } });
  });
}
