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

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "service";
}

export async function servicesRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/services", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      price: z.coerce.number().min(0).optional(),
      durationMinutes: z.coerce.number().int().positive().optional(),
      status: z.enum(["active", "draft", "archived"]).optional().default("active"),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const slugBase = slugify(parsed.data.name);
    let slug = slugBase;
    let i = 1;
    while (await prisma.service.findUnique({ where: { businessId_slug: { businessId, slug } } as any })) {
      slug = `${slugBase}-${i++}`;
    }
    const svc = await prisma.service.create({
      data: {
        businessId,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        price: parsed.data.price,
        durationMinutes: parsed.data.durationMinutes,
        status: parsed.data.status || "active",
      },
    });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "SERVICE_CREATED", entityType: "service", entityId: svc.id, afterData: JSON.stringify(svc) } });
    return reply.code(201).send({ success: true, data: svc });
  });

  app.get("/api/v1/businesses/:businessId/services", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const { skip, take, page, pageSize } = parsePagination(req.query as any);
    const q = req.query as any;
    const where: any = { businessId, deletedAt: null };
    if (q.search) where.name = { contains: q.search };
    if (q.status) where.status = q.status;
    const [items, total] = await Promise.all([
      prisma.service.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.service.count({ where }),
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.get("/api/v1/businesses/:businessId/services/:serviceId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, serviceId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const svc = await prisma.service.findFirst({ where: { id: serviceId, businessId } });
    if (!svc) throw Errors.notFound("Service");
    return reply.send({ success: true, data: svc });
  });
}
