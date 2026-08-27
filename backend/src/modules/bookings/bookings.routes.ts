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

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled", "no_show"] as const;
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

function generateBookingNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 4).toUpperCase();
  return `BK-${ts}-${rnd}`;
}

function parseDateTime(dateStr: string, timeStr?: string): Date {
  if (timeStr) {
    return new Date(`${dateStr}T${timeStr}:00`);
  }
  return new Date(dateStr);
}

async function checkConflict(businessId: string, start: Date, end: Date, excludeId?: string) {
  const overlapping = await prisma.booking.findFirst({
    where: {
      businessId,
      id: excludeId ? { not: excludeId } : undefined,
      status: { in: ["pending", "confirmed"] },
      OR: [
        { startTime: { lt: end }, endTime: { gt: start } },
      ],
    } as any,
  });
  return overlapping;
}

export async function bookingsRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/bookings", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    const business = await assertBusinessAccess(userId, businessId);

    const schema = z.object({
      customerId: z.string().optional(),
      serviceId: z.string().optional(),
      staffId: z.string().optional(),
      locationId: z.string().optional(),
      startTime: z.string().min(1),
      endTime: z.string().optional(),
      durationMinutes: z.coerce.number().int().positive().optional(),
      customerNotes: z.string().max(2000).optional(),
      internalNotes: z.string().max(2000).optional(),
      source: z.string().optional().default("MANUAL"),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid booking", details: parsed.error.flatten() });

    const { customerId, serviceId, staffId, locationId, startTime, endTime, durationMinutes, customerNotes, internalNotes, source } = parsed.data;

    if (customerId) {
      const cust = await prisma.customer.findFirst({ where: { id: customerId, businessId } });
      if (!cust) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Customer does not belong to this business" });
    }
    let service: any = null;
    if (serviceId) {
      service = await prisma.service.findFirst({ where: { id: serviceId, businessId } });
      if (!service) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Service does not belong to this business" });
      if (service.status !== "active") throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Service ${service.name} is not active` });
    }

    let start: Date;
    let end: Date;
    try {
      start = new Date(startTime);
      if (isNaN(start.getTime())) throw new Error();
      if (endTime) {
        end = new Date(endTime);
        if (isNaN(end.getTime())) throw new Error();
      } else if (durationMinutes) {
        end = new Date(start.getTime() + durationMinutes * 60000);
      } else if (service?.durationMinutes) {
        end = new Date(start.getTime() + service.durationMinutes * 60000);
      } else {
        end = new Date(start.getTime() + 60 * 60000);
      }
      if (end <= start) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "endTime must be after startTime" });
      if (start < new Date(Date.now() - 60000)) {
        // allow slight past for testing, but not far past
      }
    } catch (e: any) {
      if (e instanceof AppError) throw e;
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid date/time" });
    }

    const conflict = await checkConflict(businessId, start, end);
    if (conflict) throw new AppError({ statusCode: 409, code: "CONFLICT", message: `Time slot conflicts with booking ${conflict.bookingNumber}` });

    let bookingNumber: string;
    let attempts = 0;
    do {
      bookingNumber = generateBookingNumber();
      attempts++;
      if (attempts > 5) throw new AppError({ statusCode: 500, code: "INTERNAL_ERROR", message: "Failed to generate booking number" });
    } while (await prisma.booking.findUnique({ where: { businessId_bookingNumber: { businessId, bookingNumber } } } as any));

    const booking = await prisma.booking.create({
      data: {
        businessId,
        customerId: customerId || null,
        serviceId: serviceId || null,
        staffId: staffId || null,
        locationId: locationId || null,
        bookingNumber,
        startTime: start,
        endTime: end,
        status: "pending",
        source: source || "MANUAL",
        customerNotes: customerNotes || null,
        internalNotes: internalNotes || null,
        createdBy: userId,
      },
      include: { customer: true, service: true },
    });

    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "BOOKING_CREATED", entityType: "booking", entityId: booking.id, afterData: JSON.stringify(booking) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "BOOKING_CREATED", aggregateType: "booking", aggregateId: booking.id, payload: JSON.stringify({ bookingId: booking.id, bookingNumber }) } });

    return reply.code(201).send({ success: true, data: booking });
  });

  app.get("/api/v1/businesses/:businessId/bookings", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const { page, pageSize, skip, take } = parsePagination(request.query as any);
    const q = request.query as any;
    const where: any = { businessId };
    if (q.status) where.status = q.status;
    if (q.date) {
      const d = new Date(q.date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      where.startTime = { gte: start, lte: end };
    }
    if (q.search) {
      where.OR = [
        { bookingNumber: { contains: q.search } },
        { customerNotes: { contains: q.search } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.booking.findMany({ where, skip, take, orderBy: { startTime: "desc" }, include: { customer: true, service: true } }),
      prisma.booking.count({ where }),
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.get("/api/v1/businesses/:businessId/bookings/:bookingId", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, bookingId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, businessId }, include: { customer: true, service: true } });
    if (!booking) throw Errors.notFound("Booking");
    return reply.send({ success: true, data: booking });
  });

  app.patch("/api/v1/businesses/:businessId/bookings/:bookingId", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, bookingId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, businessId } });
    if (!booking) throw Errors.notFound("Booking");
    if (booking.status === "completed" || booking.status === "cancelled") throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Cannot update ${booking.status} booking` });

    const schema = z.object({
      customerId: z.string().optional().nullable(),
      serviceId: z.string().optional().nullable(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      customerNotes: z.string().max(2000).optional().nullable(),
      internalNotes: z.string().max(2000).optional().nullable(),
    });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });

    const data: any = {};
    if (parsed.data.customerId !== undefined) {
      if (parsed.data.customerId) {
        const cust = await prisma.customer.findFirst({ where: { id: parsed.data.customerId, businessId } });
        if (!cust) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Customer does not belong to this business" });
        data.customerId = parsed.data.customerId;
      } else data.customerId = null;
    }
    if (parsed.data.serviceId !== undefined) {
      if (parsed.data.serviceId) {
        const svc = await prisma.service.findFirst({ where: { id: parsed.data.serviceId, businessId } });
        if (!svc) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Service does not belong to this business" });
        data.serviceId = parsed.data.serviceId;
      } else data.serviceId = null;
    }
    let newStart = booking.startTime;
    let newEnd = booking.endTime;
    if (parsed.data.startTime) {
      newStart = new Date(parsed.data.startTime);
      if (isNaN(newStart.getTime())) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid startTime" });
      data.startTime = newStart;
    }
    if (parsed.data.endTime) {
      newEnd = new Date(parsed.data.endTime);
      if (isNaN(newEnd.getTime())) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid endTime" });
      data.endTime = newEnd;
    }
    if (newEnd <= newStart) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "endTime must be after startTime" });
    if (parsed.data.startTime || parsed.data.endTime) {
      const conflict = await checkConflict(businessId, newStart, newEnd, bookingId);
      if (conflict) throw new AppError({ statusCode: 409, code: "CONFLICT", message: `Time slot conflicts with booking ${conflict.bookingNumber}` });
    }
    if (parsed.data.customerNotes !== undefined) data.customerNotes = parsed.data.customerNotes;
    if (parsed.data.internalNotes !== undefined) data.internalNotes = parsed.data.internalNotes;

    const before = { ...booking };
    const updated = await prisma.booking.update({ where: { id: bookingId }, data, include: { customer: true, service: true } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "BOOKING_UPDATED", entityType: "booking", entityId: bookingId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    return reply.send({ success: true, data: updated });
  });

  async function transition(businessId: string, bookingId: string, userId: string, target: string) {
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, businessId } });
    if (!booking) throw Errors.notFound("Booking");
    const allowed = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(target)) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: `Cannot transition ${booking.status} -> ${target}` });
    const data: any = { status: target };
    if (target === "cancelled") data.cancelledAt = new Date();
    if (target === "completed") data.completedAt = new Date();
    const before = { ...booking };
    const updated = await prisma.booking.update({ where: { id: bookingId }, data, include: { customer: true, service: true } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: `BOOKING_${target.toUpperCase()}`, entityType: "booking", entityId: bookingId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: `BOOKING_${target.toUpperCase()}`, aggregateType: "booking", aggregateId: bookingId, payload: JSON.stringify({ bookingId, target }) } });
    return updated;
  }

  app.post("/api/v1/businesses/:businessId/bookings/:bookingId/confirm", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, bookingId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const updated = await transition(businessId, bookingId, userId, "confirmed");
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/bookings/:bookingId/cancel", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, bookingId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const updated = await transition(businessId, bookingId, userId, "cancelled");
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/bookings/:bookingId/complete", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, bookingId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const updated = await transition(businessId, bookingId, userId, "completed");
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/bookings/:bookingId/no-show", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId, bookingId } = request.params as any;
    await assertBusinessAccess(userId, businessId);
    const updated = await transition(businessId, bookingId, userId, "no_show");
    return reply.send({ success: true, data: updated });
  });
}
