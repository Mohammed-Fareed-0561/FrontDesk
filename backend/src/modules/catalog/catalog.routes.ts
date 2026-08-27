import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { slugify } from "../../shared/utils/slug.js";
import { parsePagination } from "../../shared/utils/pagination.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: business.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: business.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return business;
}

const categorySchema = z.object({ name: z.string().min(1), description: z.string().optional(), parentId: z.string().optional() });
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().default("INR").optional(),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  availability: z.enum(["available", "unavailable", "out_of_stock", "coming_soon"]).optional(),
  stockQuantity: z.number().optional(),
  isFeatured: z.boolean().optional(),
});

export async function catalogRoutes(app: FastifyInstance) {
  // categories
  app.get("/api/v1/businesses/:businessId/categories", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const cats = await prisma.category.findMany({ where: { businessId, deletedAt: null }, orderBy: { sortOrder: "asc" } });
    return reply.send({ success: true, data: cats });
  });
  app.post("/api/v1/businesses/:businessId/categories", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid category", details: parsed.error.flatten() });
    const cat = await prisma.category.create({ data: { businessId, name: parsed.data.name, description: parsed.data.description, parentId: parsed.data.parentId } });
    return reply.code(201).send({ success: true, data: cat });
  });
  app.patch("/api/v1/businesses/:businessId/categories/:categoryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, categoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const cat = await prisma.category.findFirst({ where: { id: categoryId, businessId } });
    if (!cat) throw Errors.notFound("Category");
    const parsed = categorySchema.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const updated = await prisma.category.update({ where: { id: categoryId }, data: parsed.data as any });
    return reply.send({ success: true, data: updated });
  });
  app.delete("/api/v1/businesses/:businessId/categories/:categoryId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, categoryId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    await prisma.category.update({ where: { id: categoryId }, data: { deletedAt: new Date() } });
    return reply.code(204).send();
  });

  // products
  app.get("/api/v1/businesses/:businessId/products", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const { page, pageSize, skip, take } = parsePagination(req.query as any);
    const q = req.query as any;
    const where: any = { businessId, deletedAt: null };
    if (q.status) where.status = q.status;
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.search) where.name = { contains: q.search };
    if (q.available) where.availability = q.available;
    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { category: true, images: true } }),
      prisma.product.count({ where })
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.post("/api/v1/businesses/:businessId/products", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid product", details: parsed.error.flatten() });
    const slug = slugify(parsed.data.name);
    let finalSlug = slug;
    let i = 1;
    while (await prisma.product.findFirst({ where: { businessId, slug: finalSlug } })) finalSlug = `${slug}-${i++}`;
    const p = await prisma.product.create({
      data: {
        businessId,
        slug: finalSlug,
        name: parsed.data.name,
        description: parsed.data.description,
        price: parsed.data.price,
        currency: parsed.data.currency || "INR",
        categoryId: parsed.data.categoryId,
        sku: parsed.data.sku,
        status: parsed.data.status || "active",
        availability: parsed.data.availability || "available",
        stockQuantity: parsed.data.stockQuantity,
        isFeatured: parsed.data.isFeatured || false,
      }
    });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "PRODUCT_CREATED", entityType: "product", entityId: p.id, afterData: JSON.stringify(p) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "PRODUCT_CREATED", aggregateType: "product", aggregateId: p.id, payload: JSON.stringify(p) } });
    return reply.code(201).send({ success: true, data: p });
  });

  app.get("/api/v1/businesses/:businessId/products/:productId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, productId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const p = await prisma.product.findFirst({ where: { id: productId, businessId, deletedAt: null }, include: { category: true, images: true, variants: true } });
    if (!p) throw Errors.notFound("Product");
    return reply.send({ success: true, data: p });
  });

  app.patch("/api/v1/businesses/:businessId/products/:productId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, productId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const existing = await prisma.product.findFirst({ where: { id: productId, businessId } });
    if (!existing) throw Errors.notFound("Product");
    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    // approval check for high-impact: price changes should still succeed but log approval requirement? For v0.1 allow directly but create approval if needed later.
    const before = { ...existing };
    const updated = await prisma.product.update({ where: { id: productId }, data: parsed.data as any });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "PRODUCT_UPDATED", entityType: "product", entityId: productId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "PRODUCT_UPDATED", aggregateType: "product", aggregateId: productId, payload: JSON.stringify(updated) } });
    return reply.send({ success: true, data: updated });
  });

  app.delete("/api/v1/businesses/:businessId/products/:productId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, productId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    await prisma.product.update({ where: { id: productId }, data: { deletedAt: new Date(), status: "archived" } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "PRODUCT_DELETED", entityType: "product", entityId: productId } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "PRODUCT_DELETED", aggregateType: "product", aggregateId: productId, payload: JSON.stringify({ productId }) } });
    return reply.code(204).send();
  });

  // public catalog
  app.get("/api/v1/public/businesses/:slug/products", async (req, reply) => {
    const { slug } = req.params as any;
    const business = await prisma.business.findFirst({ where: { slug } });
    if (!business) throw Errors.notFound("Business");
    const q = req.query as any;
    const where: any = { businessId: business.id, deletedAt: null, status: "active" };
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.search) where.name = { contains: q.search };
    const items = await prisma.product.findMany({ where, orderBy: { sortOrder: "asc" }, include: { category: true, images: true } });
    // projection: hide costPrice
    const pub = items.map(p => ({ id: p.id, name: p.name, slug: p.slug, description: p.description, price: p.price, currency: p.currency, availability: p.availability, category: p.category, images: p.images }));
    return reply.send({ success: true, data: pub });
  });
}
