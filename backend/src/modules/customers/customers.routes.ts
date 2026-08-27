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

const customerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  phone: z.string().optional(),
  status: z.string().optional(),
  metadata: z.any().optional(),
});

export async function customersRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/customers", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const { page, pageSize, skip, take } = parsePagination(req.query as any);
    const q = req.query as any;
    const where: any = { businessId, deletedAt: null };
    if (q.search) where.OR = [{ name: { contains: q.search } }, { phone: { contains: q.search } }, { email: { contains: q.search } }];
    const [items, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where })
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.post("/api/v1/businesses/:businessId/customers", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = customerSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid customer", details: parsed.error.flatten() });
    const c = await prisma.customer.create({ data: { businessId, name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : undefined } });
    return reply.code(201).send({ success: true, data: c });
  });

  app.get("/api/v1/businesses/:businessId/customers/:customerId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, customerId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const c = await prisma.customer.findFirst({ where: { id: customerId, businessId }, include: { consents: true } });
    if (!c) throw Errors.notFound("Customer");
    return reply.send({ success: true, data: c });
  });

  app.patch("/api/v1/businesses/:businessId/customers/:customerId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, customerId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = customerSchema.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const updated = await prisma.customer.update({ where: { id: customerId }, data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, status: parsed.data.status, metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : undefined } as any });
    return reply.send({ success: true, data: updated });
  });

  app.delete("/api/v1/businesses/:businessId/customers/:customerId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, customerId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    await prisma.customer.update({ where: { id: customerId }, data: { deletedAt: new Date() } });
    return reply.code(204).send();
  });
}
