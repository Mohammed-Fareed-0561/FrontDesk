import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { themeConfigSchema, validateThemeConfig, getThemeConfig } from "../../shared/schemas/theme.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

const websiteTreeInclude: any = {
  pages: {
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      sections: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        include: {
          components: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
        },
      },
    },
  },
};

const jsonObject = z.record(z.unknown());

const responsiveOverrideSchema = z.object({
  fontSize: z.number().min(8).max(200).optional(),
  lineHeight: z.number().min(0.5).max(5).optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  columns: z.number().int().min(1).max(6).optional(),
  direction: z.enum(["row", "column"]).optional(),
  gap: z.string().max(20).optional(),
  padding: z.string().max(30).optional(),
  margin: z.string().max(30).optional(),
  width: z.string().max(30).optional(),
  visible: z.boolean().optional(),
  objectFit: z.enum(["cover", "contain", "fill"]).optional(),
  objectPosition: z.string().max(30).optional(),
  buttonWidth: z.enum(["auto", "full"]).optional(),
  buttonSize: z.enum(["sm", "md", "lg"]).optional(),
}).strict();

const responsiveConfigSchema = z.object({
  tablet: responsiveOverrideSchema.optional(),
  mobile: responsiveOverrideSchema.optional(),
}).strict().optional();

const styleConfigSchema = z.object({
  responsive: responsiveConfigSchema,
}).passthrough().optional();

const pageCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  pageType: z.string().trim().max(50).optional(),
  sortOrder: z.number().int().min(0).optional(),
  seoConfig: jsonObject.optional(),
});

const pagePatchSchema = pageCreateSchema.partial();

const pageInclude: any = {
  sections: {
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { components: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  },
};

async function getOwnedWebsite(userId: string, businessId: string) {
  await assertBusinessAccess(userId, businessId);
  const website = await prisma.website.findFirst({ where: { businessId } });
  if (!website) throw Errors.notFound("Website");
  return website;
}

function pageData(data: z.infer<typeof pageCreateSchema>) {
  return {
    title: data.title,
    slug: data.slug,
    pageType: data.pageType,
    sortOrder: data.sortOrder,
    seoConfig: data.seoConfig === undefined ? undefined : JSON.stringify(data.seoConfig),
  };
}

const websitePatchSchema = z.object({
  name: z.string().optional(),
  themeConfig: themeConfigSchema.optional(),
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
      styleConfig: z.any().optional().refine((val) => {
        if (!val || !val.responsive) return true;
        const result = responsiveConfigSchema.safeParse(val.responsive);
        return result.success;
      }, { message: "Invalid responsive configuration in section" }),
      visibilityConfig: z.any().optional(),
      components: z.array(z.object({
        id: z.string().optional(),
        componentType: z.string().min(1).max(100),
        sortOrder: z.number().int().min(0).optional(),
        props: jsonObject,
        content: jsonObject.optional(),
        styleConfig: jsonObject.optional().refine((val) => {
          if (!val || !val.responsive) return true;
          const result = responsiveConfigSchema.safeParse(val.responsive);
          return result.success;
        }, { message: "Invalid responsive configuration" }),
        assetRefs: z.array(z.string()).optional(),
        sourceType: z.string().max(50).optional(),
        sourceId: z.string().max(200).optional(),
        sourceVersion: z.string().max(50).optional(),
      })).optional(),
    })).optional()
  })).optional()
});

function componentData(component: any) {
  return {
    componentType: component.componentType,
    sortOrder: component.sortOrder ?? 0,
    props: JSON.stringify(component.props),
    content: component.content === undefined ? undefined : JSON.stringify(component.content),
    styleConfig: component.styleConfig === undefined ? undefined : JSON.stringify(component.styleConfig),
    assetRefs: component.assetRefs === undefined ? undefined : JSON.stringify(component.assetRefs),
    sourceType: component.sourceType,
    sourceId: component.sourceId,
    sourceVersion: component.sourceVersion,
  };
}

async function persistComponents(sectionId: string, components: any[]) {
  for (const component of components) {
    const data = componentData(component);
    if (component.id) {
      const existing = await prisma.websiteComponent.findFirst({ where: { id: component.id, sectionId } });
      if (existing) {
        await prisma.websiteComponent.update({ where: { id: existing.id }, data });
        continue;
      }
    }
    await prisma.websiteComponent.create({ data: { sectionId, ...data } });
  }
}

export async function websitesRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/website", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    let website: any = await prisma.website.findFirst({ where: { businessId }, include: { ...websiteTreeInclude, versions: { orderBy: { versionNumber: "desc" }, take: 5 } } });
    if (!website) {
      website = await (prisma.website.create as any)({ data: { businessId, name: "Website", status: "draft" }, include: { ...websiteTreeInclude, versions: true } });
    }
    return reply.send({ success: true, data: website });
  });

  app.get("/api/v1/businesses/:businessId/website/pages", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const website = await getOwnedWebsite(userId, businessId);
    const pages = await prisma.websitePage.findMany({ where: { websiteId: website.id }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], include: pageInclude });
    return reply.send({ success: true, data: pages });
  });

  app.post("/api/v1/businesses/:businessId/website/pages", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const website = await getOwnedWebsite(userId, businessId);
    const parsed = pageCreateSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid page data", details: parsed.error.flatten() });
    const duplicate = await prisma.websitePage.findFirst({ where: { websiteId: website.id, slug: parsed.data.slug } });
    if (duplicate) throw Errors.conflict("A page with this slug already exists");
    const lastPage = await prisma.websitePage.findFirst({ where: { websiteId: website.id }, orderBy: [{ sortOrder: "desc" }, { id: "desc" }] });
    try {
      const page = await prisma.websitePage.create({ data: { websiteId: website.id, ...pageData({ ...parsed.data, sortOrder: parsed.data.sortOrder ?? (lastPage ? lastPage.sortOrder + 1 : 0) }), }, include: pageInclude });
      await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_PAGE_CREATED", entityType: "website_page", entityId: page.id } });
      return reply.code(201).send({ success: true, data: page });
    } catch (error: any) {
      if (error?.code === "P2002") throw Errors.conflict("A page with this slug already exists");
      throw error;
    }
  });

  app.patch("/api/v1/businesses/:businessId/website/pages/:pageId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, pageId } = req.params as any;
    const website = await getOwnedWebsite(userId, businessId);
    const parsed = pagePatchSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid page data", details: parsed.error.flatten() });
    const existing = await prisma.websitePage.findFirst({ where: { id: pageId, websiteId: website.id } });
    if (!existing) throw Errors.notFound("WebsitePage");
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const duplicate = await prisma.websitePage.findFirst({ where: { websiteId: website.id, slug: parsed.data.slug, id: { not: pageId } } });
      if (duplicate) throw Errors.conflict("A page with this slug already exists");
    }
    try {
      const page = await prisma.websitePage.update({ where: { id: pageId }, data: pageData({ title: parsed.data.title ?? existing.title, slug: parsed.data.slug ?? existing.slug, pageType: parsed.data.pageType, sortOrder: parsed.data.sortOrder, seoConfig: parsed.data.seoConfig }), include: pageInclude });
      await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_PAGE_UPDATED", entityType: "website_page", entityId: page.id } });
      return reply.send({ success: true, data: page });
    } catch (error: any) {
      if (error?.code === "P2002") throw Errors.conflict("A page with this slug already exists");
      throw error;
    }
  });

  app.delete("/api/v1/businesses/:businessId/website/pages/:pageId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, pageId } = req.params as any;
    const website = await getOwnedWebsite(userId, businessId);
    const page = await prisma.websitePage.findFirst({ where: { id: pageId, websiteId: website.id } });
    if (!page) throw Errors.notFound("WebsitePage");
    const pageCount = await prisma.websitePage.count({ where: { websiteId: website.id } });
    if (pageCount <= 1) throw Errors.validation("A website must keep at least one page");
    await prisma.websitePage.delete({ where: { id: page.id } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_PAGE_DELETED", entityType: "website_page", entityId: page.id } });
    return reply.send({ success: true, data: { id: page.id } });
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
            await prisma.websitePage.update({ where: { id: page.id }, data: { title: p.title, pageType: p.pageType, sortOrder: p.sortOrder, seoConfig: p.seoConfig ? JSON.stringify(p.seoConfig) : undefined } });
          } else {
            page = await prisma.websitePage.create({ data: { websiteId: website.id, title: p.title, slug: p.slug, pageType: p.pageType, sortOrder: p.sortOrder || 0, seoConfig: p.seoConfig ? JSON.stringify(p.seoConfig) : undefined } });
          }
        }
        if (p.sections && page) {
          const keptSectionIds: string[] = [];
          for (const s of p.sections) {
            if (s.id) {
              const sec = await prisma.websiteSection.findFirst({ where: { id: s.id, pageId: page.id } });
              if (sec) {
                await prisma.websiteSection.update({ where: { id: sec.id }, data: { sectionType: s.sectionType, sortOrder: s.sortOrder, content: JSON.stringify(s.content), styleConfig: s.styleConfig ? JSON.stringify(s.styleConfig) : undefined, visibilityConfig: s.visibilityConfig ? JSON.stringify(s.visibilityConfig) : undefined } });
                if (s.components) await persistComponents(sec.id, s.components);
                keptSectionIds.push(sec.id);
                continue;
              }
            }
            const section = await prisma.websiteSection.create({ data: { pageId: page.id, sectionType: s.sectionType, sortOrder: s.sortOrder || 0, content: JSON.stringify(s.content), styleConfig: s.styleConfig ? JSON.stringify(s.styleConfig) : undefined, visibilityConfig: s.visibilityConfig ? JSON.stringify(s.visibilityConfig) : undefined } });
            if (s.components) await persistComponents(section.id, s.components);
            keptSectionIds.push(section.id);
          }
          await prisma.websiteSection.deleteMany({ where: { pageId: page.id, id: { notIn: keptSectionIds } } });
        }
      }
    }
    const updated = await prisma.website.findFirst({ where: { id: website.id }, include: websiteTreeInclude });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_UPDATED", entityType: "website", entityId: website.id } });
    return reply.send({ success: true, data: updated });
  });

  app.delete("/api/v1/businesses/:businessId/website/components/:componentId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, componentId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const component = await prisma.websiteComponent.findUnique({
      where: { id: componentId },
      include: { section: { include: { page: { include: { website: true } } } } },
    });
    if (!component || component.section.page.website.businessId !== businessId) throw Errors.notFound("WebsiteComponent");
    await prisma.websiteComponent.delete({ where: { id: component.id } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_COMPONENT_DELETED", entityType: "website_component", entityId: component.id } });
    return reply.send({ success: true, data: { id: component.id } });
  });

  app.delete("/api/v1/businesses/:businessId/website/sections/:sectionId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, sectionId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const section = await prisma.websiteSection.findFirst({
      where: { id: sectionId },
      include: { page: { include: { website: true } } },
    });
    if (!section || section.page.website.businessId !== businessId) throw Errors.notFound("WebsiteSection");
    const sectionCount = await prisma.websiteSection.count({ where: { pageId: section.pageId } });
    if (sectionCount <= 1) throw Errors.validation("A page must keep at least one section");
    await prisma.websiteSection.delete({ where: { id: section.id } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_SECTION_DELETED", entityType: "website_section", entityId: section.id } });
    return reply.send({ success: true, data: { id: section.id } });
  });

  app.get("/api/v1/businesses/:businessId/website/preview", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const website = await prisma.website.findFirst({ where: { businessId }, include: websiteTreeInclude });
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
    const website = await prisma.website.findFirst({ where: { businessId }, include: websiteTreeInclude });
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

  // Theme endpoints
  app.get("/api/v1/businesses/:businessId/website/theme", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const website = await getOwnedWebsite(userId, businessId);
    const theme = getThemeConfig(website.themeConfig);
    return reply.send({ success: true, data: theme });
  });

  app.patch("/api/v1/businesses/:businessId/website/theme", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const validation = validateThemeConfig(req.body);
    if (!validation.success) {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid theme configuration", details: validation.error });
    }
    let website = await prisma.website.findFirst({ where: { businessId } });
    if (!website) {
      website = await prisma.website.create({ data: { businessId, name: "Website", status: "draft" } });
    }
    await prisma.website.update({ where: { id: website.id }, data: { themeConfig: JSON.stringify(validation.data) } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "WEBSITE_THEME_UPDATED", entityType: "website", entityId: website.id } });
    return reply.send({ success: true, data: validation.data });
  });

  // public website
  app.get("/api/v1/public/businesses/:slug/website", async (req, reply) => {
    const { slug } = req.params as any;
    const business = await prisma.business.findFirst({ where: { slug } });
    if (!business) throw Errors.notFound("Business");
    const website = await prisma.website.findFirst({ where: { businessId: business.id, status: "published" }, include: websiteTreeInclude });
    if (!website) {
      const draft = await prisma.website.findFirst({ where: { businessId: business.id }, include: websiteTreeInclude });
      if (!draft) throw Errors.notFound("Website");
      return reply.send({ success: true, data: { website: draft, business: { name: business.name, slug: business.slug, description: business.description, phone: business.phone, email: business.email } } });
    }
    // if publishedVersionId exists, load snapshot? For simplicity return published website
    return reply.send({ success: true, data: { website, business: { name: business.name, slug: business.slug, description: business.description, phone: business.phone, email: business.email } } });
  });
}
