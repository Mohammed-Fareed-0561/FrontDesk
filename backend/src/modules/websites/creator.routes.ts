import { FastifyInstance } from "fastify";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";

async function getCreatorProfile(userId: string) {
  return prisma.creatorProfile.findUnique({ where: { userId } });
}

async function assertCreatorOwnership(userId: string, assetOwnerId: string | null, assetOwnerType: string) {
  if (assetOwnerType === "system") {
    throw new AppError({ statusCode: 403, code: "FORBIDDEN", message: "Cannot modify system-owned asset" });
  }
  if (!assetOwnerId || assetOwnerId !== userId) {
    throw Errors.forbidden();
  }
}

async function assertCreatorExists(userId: string) {
  const profile = await getCreatorProfile(userId);
  if (!profile) {
    throw new AppError({ statusCode: 422, code: "CREATOR_PROFILE_REQUIRED", message: "Create a creator profile first" });
  }
  return profile;
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

export async function creatorRoutes(app: FastifyInstance) {
  // ── Creator Profile ──────────────────────────────────────────

  app.get("/api/v1/creator/profile", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const profile = await getCreatorProfile(userId);
    if (!profile) {
      return reply.send({ success: true, data: null });
    }
    return reply.send({ success: true, data: profile });
  });

  app.post("/api/v1/creator/profile", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { displayName, slug, bio, avatarUrl } = (req.body as any) || {};

    if (!displayName) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "displayName is required" });
    if (!slug) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "slug is required" });

    const existing = await getCreatorProfile(userId);
    if (existing) {
      throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Creator profile already exists" });
    }

    const slugTaken = await prisma.creatorProfile.findUnique({ where: { slug } });
    if (slugTaken) {
      throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Slug is already taken" });
    }

    const profile = await prisma.creatorProfile.create({
      data: { userId, displayName, slug, bio: bio || null, avatarUrl: avatarUrl || null },
    });

    return reply.code(201).send({ success: true, data: profile });
  });

  app.patch("/api/v1/creator/profile", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const profile = await getCreatorProfile(userId);
    if (!profile) throw new AppError({ statusCode: 404, code: "CREATOR_PROFILE_NOT_FOUND", message: "Creator profile not found" });

    const { displayName, slug, bio, avatarUrl } = (req.body as any) || {};

    if (slug && slug !== profile.slug) {
      const slugTaken = await prisma.creatorProfile.findUnique({ where: { slug } });
      if (slugTaken) {
        throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Slug is already taken" });
      }
    }

    const updated = await prisma.creatorProfile.update({
      where: { userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(slug !== undefined && { slug }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Creator Templates ────────────────────────────────────────

  app.get("/api/v1/creator/templates", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const templates = await prisma.websiteTemplate.findMany({
      where: { ownerId: userId, ownerType: "creator" },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true, name: true, slug: true, description: true, category: true,
        thumbnail: true, status: true, visibility: true, version: true,
        isBuiltIn: true, ownerType: true, ownerId: true,
        createdAt: true, updatedAt: true,
        pages: { select: { id: true } },
      },
    });
    const result = templates.map((t: any) => ({ ...t, pageCount: t.pages.length, pages: undefined }));
    return reply.send({ success: true, data: result });
  });

  app.post("/api/v1/creator/templates", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const creator = await assertCreatorExists(userId);
    const { name, slug, description, category, thumbnail, themeConfig } = (req.body as any) || {};

    if (!name) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "name is required" });
    if (!slug) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "slug is required" });

    const slugTaken = await prisma.websiteTemplate.findUnique({ where: { slug } });
    if (slugTaken) {
      throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Template slug already exists" });
    }

    const template = await prisma.websiteTemplate.create({
      data: {
        name,
        slug,
        description: description || null,
        category: category || "general",
        thumbnail: thumbnail || null,
        themeConfig: themeConfig || null,
        ownerType: "creator",
        ownerId: userId,
        status: "draft",
        visibility: "private",
        isBuiltIn: false,
      },
    });

    return reply.code(201).send({ success: true, data: template });
  });

  app.get("/api/v1/creator/templates/:templateId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { templateId } = req.params as any;

    const template = await prisma.websiteTemplate.findUnique({
      where: { id: templateId },
      include: templateInclude,
    }) as any;

    if (!template) throw Errors.notFound("WebsiteTemplate");
    await assertCreatorOwnership(userId, template.ownerId, template.ownerType);
    return reply.send({ success: true, data: template });
  });

  app.patch("/api/v1/creator/templates/:templateId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { templateId } = req.params as any;
    const template = await prisma.websiteTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw Errors.notFound("WebsiteTemplate");
    await assertCreatorOwnership(userId, template.ownerId, template.ownerType);

    if (template.status === "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Cannot modify a published template. Create a new version instead." });
    }

    const { name, slug, description, category, thumbnail, themeConfig, pages } = (req.body as any) || {};

    if (slug && slug !== template.slug) {
      const slugTaken = await prisma.websiteTemplate.findUnique({ where: { slug } });
      if (slugTaken) {
        throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Template slug already exists" });
      }
    }

    const updated = await prisma.websiteTemplate.update({
      where: { id: templateId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(themeConfig !== undefined && { themeConfig }),
      },
    });

    return reply.send({ success: true, data: updated });
  });

  app.delete("/api/v1/creator/templates/:templateId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { templateId } = req.params as any;
    const template = await prisma.websiteTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw Errors.notFound("WebsiteTemplate");
    await assertCreatorOwnership(userId, template.ownerId, template.ownerType);

    if (template.status === "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Cannot delete a published template. Archive it first." });
    }

    await prisma.websiteTemplate.delete({ where: { id: templateId } });
    return reply.send({ success: true, data: { deleted: true } });
  });

  app.post("/api/v1/creator/templates/:templateId/publish", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { templateId } = req.params as any;
    const template = await prisma.websiteTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw Errors.notFound("WebsiteTemplate");
    await assertCreatorOwnership(userId, template.ownerId, template.ownerType);

    if (template.status === "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Template is already published" });
    }

    const updated = await prisma.websiteTemplate.update({
      where: { id: templateId },
      data: { status: "published", visibility: "public", version: template.version + 1 },
    });

    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/creator/templates/:templateId/archive", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { templateId } = req.params as any;
    const template = await prisma.websiteTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw Errors.notFound("WebsiteTemplate");
    await assertCreatorOwnership(userId, template.ownerId, template.ownerType);

    const updated = await prisma.websiteTemplate.update({
      where: { id: templateId },
      data: { status: "archived" },
    });

    return reply.send({ success: true, data: updated });
  });

  // ── Creator Section Packs ────────────────────────────────────

  app.get("/api/v1/creator/section-packs", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const packs = await prisma.sectionPack.findMany({
      where: { ownerId: userId, ownerType: "creator" },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        id: true, name: true, slug: true, description: true, category: true,
        status: true, visibility: true, version: true,
        isBuiltIn: true, ownerType: true, ownerId: true,
        createdAt: true, updatedAt: true,
        sections: { select: { id: true } },
      },
    });
    const result = packs.map((p: any) => ({ ...p, sectionCount: p.sections.length, sections: undefined }));
    return reply.send({ success: true, data: result });
  });

  app.post("/api/v1/creator/section-packs", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const creator = await assertCreatorExists(userId);
    const { name, slug, description, category } = (req.body as any) || {};

    if (!name) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "name is required" });
    if (!slug) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "slug is required" });

    const slugTaken = await prisma.sectionPack.findUnique({ where: { slug } });
    if (slugTaken) {
      throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Section pack slug already exists" });
    }

    const pack = await prisma.sectionPack.create({
      data: {
        name,
        slug,
        description: description || null,
        category: category || "general",
        ownerType: "creator",
        ownerId: userId,
        status: "draft",
        visibility: "private",
        isBuiltIn: false,
      },
    });

    return reply.code(201).send({ success: true, data: pack });
  });

  app.get("/api/v1/creator/section-packs/:packId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { packId } = req.params as any;
    const pack = await prisma.sectionPack.findUnique({
      where: { id: packId },
      include: packInclude,
    }) as any;
    if (!pack) throw Errors.notFound("SectionPack");
    await assertCreatorOwnership(userId, pack.ownerId, pack.ownerType);
    return reply.send({ success: true, data: pack });
  });

  app.patch("/api/v1/creator/section-packs/:packId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { packId } = req.params as any;
    const pack = await prisma.sectionPack.findUnique({ where: { id: packId } });
    if (!pack) throw Errors.notFound("SectionPack");
    await assertCreatorOwnership(userId, pack.ownerId, pack.ownerType);

    if (pack.status === "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Cannot modify a published section pack. Create a new version instead." });
    }

    const { name, slug, description, category } = (req.body as any) || {};

    if (slug && slug !== pack.slug) {
      const slugTaken = await prisma.sectionPack.findUnique({ where: { slug } });
      if (slugTaken) {
        throw new AppError({ statusCode: 409, code: "CONFLICT", message: "Section pack slug already exists" });
      }
    }

    const updated = await prisma.sectionPack.update({
      where: { id: packId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
      },
    });

    return reply.send({ success: true, data: updated });
  });

  app.delete("/api/v1/creator/section-packs/:packId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { packId } = req.params as any;
    const pack = await prisma.sectionPack.findUnique({ where: { id: packId } });
    if (!pack) throw Errors.notFound("SectionPack");
    await assertCreatorOwnership(userId, pack.ownerId, pack.ownerType);

    if (pack.status === "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Cannot delete a published section pack. Archive it first." });
    }

    await prisma.sectionPack.delete({ where: { id: packId } });
    return reply.send({ success: true, data: { deleted: true } });
  });

  app.post("/api/v1/creator/section-packs/:packId/publish", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { packId } = req.params as any;
    const pack = await prisma.sectionPack.findUnique({ where: { id: packId } });
    if (!pack) throw Errors.notFound("SectionPack");
    await assertCreatorOwnership(userId, pack.ownerId, pack.ownerType);

    if (pack.status === "published") {
      throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Section pack is already published" });
    }

    const updated = await prisma.sectionPack.update({
      where: { id: packId },
      data: { status: "published", visibility: "public", version: pack.version + 1 },
    });

    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/creator/section-packs/:packId/archive", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { packId } = req.params as any;
    const pack = await prisma.sectionPack.findUnique({ where: { id: packId } });
    if (!pack) throw Errors.notFound("SectionPack");
    await assertCreatorOwnership(userId, pack.ownerId, pack.ownerType);

    const updated = await prisma.sectionPack.update({
      where: { id: packId },
      data: { status: "archived" },
    });

    return reply.send({ success: true, data: updated });
  });
}
