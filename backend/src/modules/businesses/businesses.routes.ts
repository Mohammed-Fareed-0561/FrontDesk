import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { slugify } from "../../shared/utils/slug.js";
import { parsePagination } from "../../shared/utils/pagination.js";

const createBusinessSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  businessType: z.string().optional(),
  industry: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  websiteUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  address: z.object({
    addressLine1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

async function ensureWorkspaceForUser(userId: string) {
  // Find first workspace where user is member or owner, else create personal workspace
  const membership = await prisma.workspaceMember.findFirst({ where: { userId }, include: { workspace: true } });
  if (membership) return membership.workspace;
  const owned = await prisma.workspace.findFirst({ where: { ownerUserId: userId } });
  if (owned) return owned;
  // create personal workspace
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const baseSlug = slugify(user?.displayName || user?.email.split("@")[0] || "workspace");
  let slug = baseSlug;
  let i = 1;
  while (await prisma.workspace.findUnique({ where: { slug } })) slug = `${baseSlug}-${i++}`;
  const ws = await prisma.workspace.create({
    data: {
      name: `${user?.displayName || "My"} Workspace`,
      slug,
      ownerUserId: userId,
      members: { create: { userId, role: "owner", status: "active" } }
    }
  });
  return ws;
}

export async function businessesRoutes(app: FastifyInstance) {
  // List businesses for current user
  app.get("/api/v1/businesses", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { page, pageSize, skip, take } = parsePagination(request.query as any);
    const workspaces = await prisma.workspaceMember.findMany({ where: { userId }, select: { workspaceId: true } });
    const wsIds = workspaces.map(w => w.workspaceId);
    if (wsIds.length === 0) return reply.send({ success: true, data: [], meta: { page, pageSize, total: 0 } });
    const [items, total] = await Promise.all([
      prisma.business.findMany({ where: { workspaceId: { in: wsIds }, deletedAt: null }, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.business.count({ where: { workspaceId: { in: wsIds }, deletedAt: null } })
    ]);
    return reply.send({ success: true, data: items, meta: { page, pageSize, total } });
  });

  app.post("/api/v1/businesses", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const parsed = createBusinessSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid business data", details: parsed.error.flatten() });
    const userId = (request as any).userId as string;
    const ws = await ensureWorkspaceForUser(userId);
    const data = parsed.data;
    const slug = slugify(data.name);
    // ensure unique slug within workspace
    let finalSlug = slug;
    let suffix = 1;
    while (await prisma.business.findFirst({ where: { workspaceId: ws.id, slug: finalSlug } })) finalSlug = `${slug}-${suffix++}`;
    const business = await prisma.business.create({
      data: {
        workspaceId: ws.id,
        name: data.name,
        slug: finalSlug,
        description: data.description,
        businessType: data.businessType,
        industry: data.industry,
        phone: data.phone,
        email: data.email,
        websiteUrl: data.websiteUrl,
        timezone: data.timezone || "Asia/Kolkata",
        currency: data.currency || "INR",
        createdBy: userId,
      }
    });
    // create default hours, location if provided
    if (data.address) {
      await prisma.businessLocation.create({
        data: {
          businessId: business.id,
          addressLine1: data.address.addressLine1,
          city: data.address.city,
          state: data.address.state,
          postalCode: data.address.postalCode,
          country: data.address.country || "IN",
          isPrimary: true
        }
      });
    }
    // create empty website draft
    const website = await prisma.website.create({ data: { businessId: business.id, name: `${business.name} Website`, status: "draft", themeConfig: JSON.stringify({ primary: "#0f172a", secondary: "#334155" }) } });
    const homePage = await prisma.websitePage.create({ data: { websiteId: website.id, title: "Home", slug: "home", pageType: "home", sortOrder: 0, seoConfig: JSON.stringify({ title: business.name }) } });
    await prisma.websiteSection.createMany({
      data: [
        { pageId: homePage.id, sectionType: "hero", sortOrder: 0, content: JSON.stringify({ heading: business.name, subheading: data.description || "Welcome to our business", cta: "Contact on WhatsApp" }) },
        { pageId: homePage.id, sectionType: "products", sortOrder: 1, content: JSON.stringify({ title: "Our Menu / Products", showFeatured: true }) },
        { pageId: homePage.id, sectionType: "contact", sortOrder: 2, content: JSON.stringify({ phone: data.phone, email: data.email }) },
      ]
    });

    // audit + domain event
    await prisma.auditLog.create({ data: { businessId: business.id, actorType: "user", actorId: userId, action: "BUSINESS_CREATED", entityType: "business", entityId: business.id, afterData: JSON.stringify(business) } });
    await prisma.domainEvent.create({ data: { businessId: business.id, eventType: "BUSINESS_CREATED", aggregateType: "business", aggregateId: business.id, payload: JSON.stringify({ businessId: business.id }) } });

    return reply.code(201).send({ success: true, data: business });
  });

  app.get("/api/v1/businesses/:businessId", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    const business = await prisma.business.findFirst({ where: { id: businessId, deletedAt: null }, include: { locations: true, hours: true } });
    if (!business) throw Errors.notFound("Business");
    // tenant check
    const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: business.workspaceId } });
    const owner = await prisma.workspace.findFirst({ where: { id: business.workspaceId, ownerUserId: userId } });
    if (!member && !owner) throw Errors.forbidden();
    return reply.send({ success: true, data: business });
  });

  app.patch("/api/v1/businesses/:businessId", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    const schema = createBusinessSchema.partial();
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw Errors.notFound("Business");
    const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: business.workspaceId } });
    const ws = await prisma.workspace.findFirst({ where: { id: business.workspaceId, ownerUserId: userId } });
    if (!member && !ws) throw Errors.forbidden();
    const before = { ...business };
    const updated = await prisma.business.update({ where: { id: businessId }, data: { ...parsed.data, updatedAt: new Date() } as any });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "BUSINESS_UPDATED", entityType: "business", entityId: businessId, beforeData: JSON.stringify(before), afterData: JSON.stringify(updated) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "BUSINESS_UPDATED", aggregateType: "business", aggregateId: businessId, payload: JSON.stringify({ businessId }) } });
    return reply.send({ success: true, data: updated });
  });

  // public endpoint
  app.get("/api/v1/public/businesses/:slug", async (request, reply) => {
    const { slug } = request.params as any;
    const business = await prisma.business.findFirst({ where: { slug, deletedAt: null, status: "active" }, include: { locations: true, hours: true } });
    if (!business) throw Errors.notFound("Business");
    // only public projection
    const pub = {
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description,
      phone: business.phone,
      email: business.email,
      websiteUrl: business.websiteUrl,
      businessType: business.businessType,
      locations: business.locations,
      hours: business.hours,
    };
    return reply.send({ success: true, data: pub });
  });
}
