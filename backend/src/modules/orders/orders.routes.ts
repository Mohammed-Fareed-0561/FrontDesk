import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { emitAndDispatch } from "../automations/hook.js";
import { parsePagination } from "../../shared/utils/pagination.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

const ORDER_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"] as const;
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rnd}`;
}

const createOrderSchema = z.object({
  customerId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        variantId: z.string().optional(),
        quantity: z.coerce.number().positive(),
        name: z.string().optional(),
        unitPrice: z.coerce.number().min(0).optional(),
      })
    )
    .min(1),
  notes: z.string().max(2000).optional(),
  source: z.string().optional().default("MANUAL"),
  currency: z.string().optional(),
  discountAmount: z.coerce.number().min(0).optional().default(0),
  taxAmount: z.coerce.number().min(0).optional().default(0),
  deliveryAmount: z.coerce.number().min(0).optional().default(0),
});

export async function ordersRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/orders", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid order", details: parsed.error.flatten() });

    const { customerId, items, notes, source, currency, discountAmount = 0, taxAmount = 0, deliveryAmount = 0 } = parsed.data;

    if (customerId) {
      const cust = await prisma.customer.findFirst({ where: { id: customerId, businessId } });
      if (!cust) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Customer does not belong to this business" });
    }

    const businessCurrency = currency || business.currency || "INR";
    let orderNumber: string;
    let attempts = 0;
    do {
      orderNumber = generateOrderNumber();
      attempts++;
      if (attempts > 5) throw new AppError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to generate order number" });
    } while (await prisma.order.findUnique({ where: { businessId_orderNumber: { businessId, orderNumber } } } as any));

    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: any[] = [];

      for (const it of items) {
        let unitPrice: number | null = null;
        let nameSnapshot = it.name || "";
        let productId: string | null = it.productId || null;
        let variantId: string | null = it.variantId || null;

        if (productId) {
          const product = await tx.product.findFirst({ where: { id: productId, businessId } });
          if (!product) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Product ${productId} not found in this business` });
          if (product.deletedAt) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Product ${product.name} is deleted` });
          if (product.status !== "active" && product.availability === "unavailable") {
            throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Product ${product.name} is not available` });
          }
          unitPrice = product.price ?? 0;
          nameSnapshot = product.name;
          if (variantId) {
            const variant = await tx.productVariant.findFirst({ where: { id: variantId, productId } });
            if (!variant) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Variant ${variantId} not found` });
            unitPrice = variant.price ?? unitPrice;
            nameSnapshot = `${product.name} - ${variant.name}`;
          }
        } else {
          if (it.unitPrice === undefined || it.unitPrice === null) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "unitPrice required for custom items" });
          if (!nameSnapshot) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "name required for custom items" });
          unitPrice = it.unitPrice;
        }

        const qty = Number(it.quantity);
        if (!Number.isFinite(qty) || qty <= 0) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Quantity must be > 0" });
        const total = unitPrice! * qty;
        subtotal += total;
        orderItemsData.push({
          productId,
          variantId,
          nameSnapshot,
          unitPrice,
          quantity: qty,
          totalAmount: total,
        });
      }

      const totalAmount = subtotal - (discountAmount || 0) + (taxAmount || 0) + (deliveryAmount || 0);

      const order = await tx.order.create({
        data: {
          businessId,
          customerId: customerId || null,
          orderNumber,
          status: "pending",
          paymentStatus: "unpaid",
          currency: businessCurrency,
          subtotal,
          discountAmount: discountAmount || 0,
          taxAmount: taxAmount || 0,
          deliveryAmount: deliveryAmount || 0,
          totalAmount,
          notes: notes || null,
          source: source || "MANUAL",
        },
      });

      for (const oi of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: oi.productId,
            variantId: oi.variantId,
            nameSnapshot: oi.nameSnapshot,
            unitPrice: oi.unitPrice,
            quantity: oi.quantity,
            totalAmount: oi.totalAmount,
          },
        });
      }

      const full = await tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
      return full!;
    });

    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "ORDER_CREATED", entityType: "order", entityId: result.id, afterData: JSON.stringify(result) } });
    await emitAndDispatch({ businessId, eventType: "ORDER_CREATED", aggregateType: "order", aggregateId: result.id, payload: JSON.stringify({ orderId: result.id, orderNumber: result.orderNumber }) });

    return reply.code(201).send({ success: true, data: result });
  });

  app.get("/api/v1/businesses/:businessId/orders", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const { page, pageSize, skip, take } = parsePagination(request.query as any);
    const q = request.query as any;
    const where: any = { businessId };
    if (q.status) where.status = q.status;
    if (q.paymentStatus) where.paymentStatus = q.paymentStatus;
    if (q.search) where.orderNumber = { contains: q.search };
    const [items, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { items: true } }),
      prisma.order.count({ where }),
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.get("/api/v1/businesses/:businessId/orders/:orderId", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const order = await prisma.order.findFirst({ where: { id: orderId, businessId }, include: { items: true } });
    if (!order) throw Errors.notFound("Order");
    return reply.send({ success: true, data: order });
  });

  app.patch("/api/v1/businesses/:businessId/orders/:orderId", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      notes: z.string().max(2000).optional(),
      customerId: z.string().optional(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const order = await prisma.order.findFirst({ where: { id: orderId, businessId } });
    if (!order) throw Errors.notFound("Order");
    if (order.status === "completed" || order.status === "cancelled") throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Cannot update ${order.status} order` });
    if (parsed.data.customerId) {
      const cust = await prisma.customer.findFirst({ where: { id: parsed.data.customerId, businessId } });
      if (!cust) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Customer does not belong to this business" });
    }
    const before = { ...order };
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { notes: parsed.data.notes, customerId: parsed.data.customerId } as any,
      include: { items: true },
    });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "ORDER_UPDATED", entityType: "order", entityId: orderId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    return reply.send({ success: true, data: updated });
  });

  async function transitionOrder(businessId: string, orderId: string, userId: string, target: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, businessId } });
    if (!order) throw Errors.notFound("Order");
    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(target)) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Cannot transition ${order.status} -> ${target}` });
    const data: any = { status: target, updatedAt: new Date() };
    if (target === "cancelled") data.cancelledAt = new Date();
    if (target === "completed") data.completedAt = new Date();
    const before = { ...order };
    const updated = await prisma.order.update({ where: { id: orderId }, data, include: { items: true } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: `ORDER_${target.toUpperCase()}`, entityType: "order", entityId: orderId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: `ORDER_${target.toUpperCase()}`, aggregateType: "order", aggregateId: orderId, payload: JSON.stringify({ orderId, target }) } });
    return updated;
  }

  app.post("/api/v1/businesses/:businessId/orders/:orderId/confirm", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const updated = await transitionOrder(businessId, orderId, userId, "confirmed");
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/orders/:orderId/cancel", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const updated = await transitionOrder(businessId, orderId, userId, "cancelled");
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/orders/:orderId/complete", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const updated = await transitionOrder(businessId, orderId, userId, "completed");
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/orders/:orderId/payment", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, orderId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded", "partially_refunded"]),
      paymentMethod: z.enum(["CASH", "UPI", "CARD", "BANK_TRANSFER", "ONLINE", "OTHER"]).optional(),
      transactionReference: z.string().max(200).optional(),
      idempotencyKey: z.string().max(100).optional(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid paymentStatus", details: parsed.error.flatten() });
    const order = await prisma.order.findFirst({ where: { id: orderId, businessId } });
    if (!order) throw Errors.notFound("Order");
    const headerKey = (request.headers["idempotency-key"] as string) || (request.headers["x-idempotency-key"] as string);
    const idempotencyKey = parsed.data.idempotencyKey || headerKey || undefined;
    if (idempotencyKey) {
      const existing = await prisma.payment.findFirst({ where: { businessId, idempotencyKey } });
      if (existing) {
        const updatedOrder = await prisma.order.findFirst({ where: { id: orderId, businessId }, include: { items: true } });
        return reply.code(200).send({ success: true, data: updatedOrder, meta: { idempotent: true } });
      }
    }
    if (order.paymentStatus === parsed.data.paymentStatus) {
      const existing = await prisma.payment.findFirst({ where: { orderId, status: parsed.data.paymentStatus } });
      if (existing && idempotencyKey) {
        return reply.code(200).send({ success: true, data: await prisma.order.findFirst({ where: { id: orderId }, include: { items: true } }), meta: { idempotent: true } });
      }
    }
    const before = { ...order };
    const updated = await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: parsed.data.paymentStatus }, include: { items: true } });

    if (parsed.data.paymentStatus === "paid" || parsed.data.paymentStatus === "pending") {
      const amount = order.totalAmount ?? order.subtotal ?? 0;
      const business = await prisma.business.findUnique({ where: { id: businessId } });
      const currency = business?.currency || order.currency || "INR";
      let paymentNumber: string;
      let attempts = 0;
      do {
        const ts = Date.now().toString(36).toUpperCase();
        const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
        paymentNumber = `PAY-${ts}-${rnd}`;
        attempts++;
        if (attempts > 5) break;
      } while (await prisma.payment.findUnique({ where: { businessId_paymentNumber: { businessId, paymentNumber } } } as any));
      await prisma.payment.create({
        data: {
          businessId,
          orderId,
          customerId: order.customerId,
          paymentNumber,
          amount,
          currency,
          status: parsed.data.paymentStatus,
          paymentMethod: parsed.data.paymentMethod || "OTHER",
          transactionReference: parsed.data.transactionReference,
          paidAt: parsed.data.paymentStatus === "paid" ? new Date() : null,
          createdBy: userId,
          idempotencyKey: idempotencyKey || null,
        },
      }).catch(() => {});
    }

    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "ORDER_PAYMENT_UPDATED", entityType: "order", entityId: orderId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "ORDER_PAYMENT_UPDATED", aggregateType: "order", aggregateId: orderId, payload: JSON.stringify({ orderId, paymentStatus: parsed.data.paymentStatus }) } });
    return reply.send({ success: true, data: updated });
  });
}
