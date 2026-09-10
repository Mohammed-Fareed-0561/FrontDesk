import { FastifyInstance } from "fastify";
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

const templateInclude: any = {
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

const packInclude: any = {
  sections: {
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: {
      components: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  },
};

export async function templateRoutes(app: FastifyInstance) {
  app.get("/api/v1/templates", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const templates = await prisma.websiteTemplate.findMany({
      where: { status: "published", visibility: "public" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        thumbnail: true,
        isBuiltIn: true,
        createdAt: true,
        pages: { select: { id: true } },
      },
    });
    const result = templates.map((t: any) => ({ ...t, pageCount: t.pages.length, pages: undefined }));
    return reply.send({ success: true, data: result });
  });

  app.get("/api/v1/templates/:templateId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { templateId } = req.params as any;
    const template = await prisma.websiteTemplate.findUnique({
      where: { id: templateId },
      include: templateInclude,
    }) as any;
    if (!template) throw Errors.notFound("WebsiteTemplate");
    if (template.visibility === "private" && template.ownerId !== userId) {
      throw Errors.forbidden();
    }
    return reply.send({ success: true, data: template });
  });

  app.post("/api/v1/templates/:templateId/import", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { templateId } = req.params as any;
    const { businessId } = (req.body as any) || {};

    if (!businessId) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "businessId is required" });

    await assertBusinessAccess(userId, businessId);

    const template = await prisma.websiteTemplate.findUnique({
      where: { id: templateId },
      include: templateInclude,
    }) as any;
    if (!template) throw Errors.notFound("WebsiteTemplate");
    if (template.visibility === "private" && template.ownerId !== userId) {
      throw Errors.forbidden();
    }
    if (template.status !== "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Template must be published to import" });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw Errors.notFound("Business");

    let website = await prisma.website.findFirst({ where: { businessId } });
    if (!website) {
      website = await prisma.website.create({ data: { businessId, name: template.name, status: "draft" } });
    } else {
      await prisma.website.update({ where: { id: website.id }, data: { name: template.name, themeConfig: template.themeConfig } });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // Delete existing pages and their children
      const existingPages = await tx.websitePage.findMany({ where: { websiteId: website.id }, select: { id: true } });
      for (const p of existingPages) {
        const sections = await tx.websiteSection.findMany({ where: { pageId: p.id }, select: { id: true } });
        for (const s of sections) {
          await tx.websiteComponent.deleteMany({ where: { sectionId: s.id } });
        }
        await tx.websiteSection.deleteMany({ where: { pageId: p.id } });
      }
      await tx.websitePage.deleteMany({ where: { websiteId: website.id } });

      // Create pages from template
      for (const templatePage of template.pages) {
        const page = await tx.websitePage.create({
          data: {
            websiteId: website.id,
            title: templatePage.title,
            slug: templatePage.slug,
            pageType: templatePage.pageType,
            sortOrder: templatePage.sortOrder,
            seoConfig: templatePage.seoConfig,
          },
        });

        for (const templateSection of templatePage.sections) {
          const section = await tx.websiteSection.create({
            data: {
              pageId: page.id,
              sectionType: templateSection.sectionType,
              sortOrder: templateSection.sortOrder,
              content: templateSection.content,
              styleConfig: templateSection.styleConfig,
              visibilityConfig: templateSection.visibilityConfig,
            },
          });

          for (const templateComponent of templateSection.components) {
            await tx.websiteComponent.create({
              data: {
                sectionId: section.id,
                componentType: templateComponent.componentType,
                sortOrder: templateComponent.sortOrder,
                props: templateComponent.props,
                content: templateComponent.content,
                styleConfig: templateComponent.styleConfig,
                assetRefs: templateComponent.assetRefs,
                sourceType: "template",
                sourceId: template.id,
                sourceVersion: String(template.version),
              },
            });
          }
        }
      }

      return { pageIds: [], sectionCount: 0, componentCount: 0 };
    });

    const updatedWebsite = await prisma.website.findFirst({
      where: { id: website.id },
      include: {
        pages: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          include: {
            sections: {
              orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
              include: { components: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
            },
          },
        },
      },
    }) as any;

    await prisma.auditLog.create({
      data: {
        businessId,
        actorType: "user",
        actorId: userId,
        action: "TEMPLATE_IMPORTED",
        entityType: "website_template",
        entityId: template.id,
      },
    });

    return reply.send({ success: true, data: updatedWebsite });
  });
}

export async function sectionPackRoutes(app: FastifyInstance) {
  app.get("/api/v1/section-packs", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const packs = await prisma.sectionPack.findMany({
      where: { status: "published", visibility: "public" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        isBuiltIn: true,
        createdAt: true,
        sections: { select: { id: true } },
      },
    });
    const result = packs.map((p: any) => ({ ...p, sectionCount: p.sections.length, sections: undefined }));
    return reply.send({ success: true, data: result });
  });

  app.get("/api/v1/section-packs/:packId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { packId } = req.params as any;
    const pack = await prisma.sectionPack.findUnique({
      where: { id: packId },
      include: packInclude,
    }) as any;
    if (!pack) throw Errors.notFound("SectionPack");
    if (pack.visibility === "private" && pack.ownerId !== userId) {
      throw Errors.forbidden();
    }
    return reply.send({ success: true, data: pack });
  });

  app.post("/api/v1/section-packs/:packId/import", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { packId } = req.params as any;
    const { businessId, pageId } = (req.body as any) || {};

    if (!businessId) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "businessId is required" });
    if (!pageId) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "pageId is required" });

    await assertBusinessAccess(userId, businessId);

    const pack = await prisma.sectionPack.findUnique({
      where: { id: packId },
      include: packInclude,
    }) as any;
    if (!pack) throw Errors.notFound("SectionPack");
    if (pack.visibility === "private" && pack.ownerId !== userId) {
      throw Errors.forbidden();
    }
    if (pack.status !== "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Section pack must be published to import" });
    }

    const page = await prisma.websitePage.findFirst({ where: { id: pageId } });
    if (!page) throw Errors.notFound("WebsitePage");

    // Verify page belongs to a website owned by this business
    const website = await prisma.website.findFirst({ where: { id: page.websiteId, businessId } });
    if (!website) throw Errors.forbidden();

    // Find max sortOrder on the page
    const lastSection = await prisma.websiteSection.findFirst({
      where: { pageId },
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
    });
    let nextSortOrder = (lastSection?.sortOrder ?? -1) + 1;

    const result = await prisma.$transaction(async (tx: any) => {
      const createdSections = [];
      for (const packSection of pack.sections) {
        const section = await tx.websiteSection.create({
          data: {
            pageId,
            sectionType: packSection.sectionType,
            sortOrder: nextSortOrder++,
            content: packSection.content,
            styleConfig: packSection.styleConfig,
            visibilityConfig: packSection.visibilityConfig,
          },
        });

        for (const packComponent of packSection.components) {
          await tx.websiteComponent.create({
            data: {
              sectionId: section.id,
              componentType: packComponent.componentType,
              sortOrder: packComponent.sortOrder,
              props: packComponent.props,
              content: packComponent.content,
              styleConfig: packComponent.styleConfig,
              assetRefs: packComponent.assetRefs,
              sourceType: "section-pack",
              sourceId: pack.id,
            },
          });
        }
        createdSections.push(section);
      }
      return createdSections;
    });

    await prisma.auditLog.create({
      data: {
        businessId,
        actorType: "user",
        actorId: userId,
        action: "SECTION_PACK_IMPORTED",
        entityType: "section_pack",
        entityId: pack.id,
      },
    });

    // Reload page with sections
    const updatedPage = await prisma.websitePage.findFirst({
      where: { id: pageId },
      include: {
        sections: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          include: { components: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
        },
      },
    }) as any;

    return reply.send({ success: true, data: updatedPage });
  });
}
