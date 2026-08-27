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

const websitePatchSchema = z.object({
  name: z.string().optional(),
  themeConfig: z.any().optional(),
  pages: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    slug: z.string(),
    pageType: z.string().optional(),
    sortOrder: z.number().optional(),
    seoConfig: z.any().optional(),
    sections: z.array(z.object({
      id: z.string().optional(),
      sectionType: z.string(),
      sortOrder: z.number().optional(),
      content: z.any(),
      styleConfig: z.any().optional(),
      visibilityConfig: z.any().optional(),
    })).optional()
  })).optional()
});

export async function websitesRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/website", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    let website: any = await prisma.website.findFirst({ where: { businessId }, include: { pages: { include: { sections: true } }, versions: { orderBy: { versionNumber: "desc" }, take: 5 } } });
    if (!website) {
      website = await (prisma.website.create as any)({ data: { businessId, name: "Website", status: "draft" }, include: { pages: { include: { sections: true } }, versions: true } });
    }
    return reply.send({ success: true, data: website });
  });

  app.patch("/api/v1/businesses/:businessId/website", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = websitePatchSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid website data", details: parsed.error.flatten() });
    let website = await prisma.website.findFirst({ where: { businessId } });
    if (!website) website = await prisma.website.create({ data: { businessId, name: parsed.data.name || "Website" } });
    if (parsed.data.name || parsed.data.themeConfig) {
      await prisma.website.update({ where: { id: website.id }, data: { name: parsed.data.name, themeConfig: parsed.data.themeConfig ? JSON.stringify(parsed.data.themeConfig) : undefined } });
    }
    if (parsed.data.pages) {
      for (const p of parsed.data.pages) {
        let page: any;
        if (p.id) {
          page = await prisma.websitePage.findFirst({ where: { id: p.id, websiteId: website.id } });
          if (page) {
            await prisma.websitePage.update({ where: { id: page.id }, data: { title: p.title, slug: p.slug, pageType: p.pageType, sortOrder: p.sortOrder, seoConfig: p.seoConfig ? JSON.stringify(p.seoConfig) : undefined } });
          } else {
            page = await prisma.websitePage.create({ data: { websiteId: website.id, title: p.title, slug: p.slug, pageType: p.pageType, sortOrder: p.sortOrder || 0, seoConfig: p.seoConfig ? JSON.stringify(p.seoConfig) : undefined } });
          }
        } else {
          // find by slug
          const existing = await prisma.websitePage.findFirst({ where: { websiteId: website.id, slug: p.slug } });
          if (existing) {
            page = existing;
            await prisma.websitePage.update({ where: { id: page.id }, data: { title: p.title, pageType: p.pageType, seoConfig: p.seoConfig ? JSON.stringify(p.seoConfig) : undefined } });
          } else {
            page = await prisma.websitePage.create({ data: { websiteId: website.id, title: p.title, slug: p.slug, pageType: p.pageType, sortOrder: p.sortOrder || 0, seoConfig: p.seoConfig ? JSON.stringify(p.seoConfig) : undefined } });
          }
        }
        if (p.sections && page) {
          for (const s of p.sections) {
            if (s.id) {
              const sec = await prisma.websiteSection.findFirst({ where: { id: s.id, pageId: page.id } });
              if (sec) {
                await prisma.websiteSection.update({ where: { id: sec.id }, data: { sectionType: s.sectionType, sortOrder: s.sortOrder, content: JSON.stringify(s.content), styleConfig: s.styleConfig ? JSON.stringify(s.styleConfig) : undefined, visibilityConfig: s.visibilityConfig ? JSON.stringify(s.visibilityConfig) : undefined } });
                continue;
              }
            }
            await prisma.websiteSection.create({ data: { pageId: page.id, sectionType: s.sectionType, sortOrder: s.sortOrder || 0, content: JSON.stringify(s.content), styleConfig: s.styleConfig ? JSON.stringify(s.styleConfig) : undefined, visibilityConfig: s.visibilityConfig ? JSON.stringify(s.visibilityConfig) : undefined } });
          }
        }
      }
    }
    const updated = await prisma.website.findFirst({ where: { id: website.id }, include: { pages: { include: { sections: true } } } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_UPDATED", entityType: "website", entityId: website.id } });
    return reply.send({ success: true, data: updated });
  });

  app.get("/api/v1/businesses/:businessId/website/preview", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const website = await prisma.website.findFirst({ where: { businessId }, include: { pages: { include: { sections: true } } } });
    if (!website) throw Errors.notFound("Website");
    // render preview would be frontend; return structured config
    return reply.send({ success: true, data: website });
  });

  app.get("/api/v1/businesses/:businessId/website/versions", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const website = await prisma.website.findFirst({ where: { businessId } });
    if (!website) throw Errors.notFound("Website");
    const versions = await prisma.websiteVersion.findMany({ where: { websiteId: website.id }, orderBy: { versionNumber: "desc" } });
    return reply.send({ success: true, data: versions });
  });

  app.post("/api/v1/businesses/:businessId/website/publish", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const website = await prisma.website.findFirst({ where: { businessId }, include: { pages: { include: { sections: true } } } });
    if (!website) throw Errors.notFound("Website");
    // basic validation: need at least one page
    if (!website.pages.length) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Website has no pages" });
    const latestVersion = await prisma.websiteVersion.findFirst({ where: { websiteId: website.id }, orderBy: { versionNumber: "desc" } });
    const nextNum = (latestVersion?.versionNumber || 0) + 1;
    const snapshot = JSON.stringify(website);
    const version = await prisma.websiteVersion.create({ data: { websiteId: website.id, versionNumber: nextNum, snapshot, createdBy: userId, publishedAt: new Date() } });
    await prisma.website.update({ where: { id: website.id }, data: { status: "published", publishedVersionId: version.id, draftVersionId: version.id } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_PUBLISHED", entityType: "website", entityId: website.id, afterData: JSON.stringify({ versionId: version.id }) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "WEBSITE_PUBLISHED", aggregateType: "website", aggregateId: website.id, payload: JSON.stringify({ versionId: version.id }) } });
    return reply.send({ success: true, data: { versionId: version.id, publishedAt: version.publishedAt } });
  });

  app.post("/api/v1/businesses/:businessId/website/versions/:versionId/restore", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, versionId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const version = await prisma.websiteVersion.findUnique({ where: { id: versionId } });
    if (!version) throw Errors.notFound("WebsiteVersion");
    // for v0.1 simple: create new version from snapshot
    const website = await prisma.website.findFirst({ where: { businessId } });
    if (!website) throw Errors.notFound("Website");
    const latest = await prisma.websiteVersion.findFirst({ where: { websiteId: website.id }, orderBy: { versionNumber: "desc" } });
    const nextNum = (latest?.versionNumber || 0) + 1;
    const restored = await prisma.websiteVersion.create({ data: { websiteId: website.id, versionNumber: nextNum, snapshot: version.snapshot, createdBy: userId } });
    await prisma.website.update({ where: { id: website.id }, data: { draftVersionId: restored.id } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_RESTORED", entityType: "website", entityId: website.id, afterData: JSON.stringify({ restoredVersionId: restored.id, fromVersionId: versionId }) } });
    return reply.send({ success: true, data: restored });
  });

  // public website
  app.get("/api/v1/public/businesses/:slug/website", async (req, reply) => {
    const { slug } = req.params as any;
    const business = await prisma.business.findFirst({ where: { slug } });
    if (!business) throw Errors.notFound("Business");
    const website = await prisma.website.findFirst({ where: { businessId: business.id, status: "published" }, include: { pages: { include: { sections: true } } } });
    if (!website) {
      const draft = await prisma.website.findFirst({ where: { businessId: business.id }, include: { pages: { include: { sections: true } } } });
      if (!draft) throw Errors.notFound("Website");
      return reply.send({ success: true, data: { website: draft, business: { name: business.name, slug: business.slug, description: business.description, phone: business.phone, email: business.email } } });
    }
    // if publishedVersionId exists, load snapshot? For simplicity return published website
    return reply.send({ success: true, data: { website, business: { name: business.name, slug: business.slug, description: business.description, phone: business.phone, email: business.email } } });
  });
}
