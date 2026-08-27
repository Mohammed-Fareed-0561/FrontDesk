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

const createImportSchema = z.object({
  sourceType: z.enum(["website", "pdf", "csv", "image", "manual"]),
  url: z.string().url().optional(),
  rawData: z.any().optional(), // for csv/manual payloads
  fileName: z.string().optional(),
});

function mockExtraction(sourceType: string, url?: string, rawData?: any) {
  // Simple deterministic mock extraction to keep v0.1 zero-cost and not requiring paid AI.
  // In production this would call AI Gateway.
  if (sourceType === "website" && url) {
    return {
      business: { description: `Imported from ${url}` },
      products: [
        { name: "Cappuccino", price: 120, description: "Rich coffee", category: "Beverages", confidence: 0.92 },
        { name: "Chocolate Truffle Cake", price: 650, description: "Decadent chocolate cake", category: "Desserts", confidence: 0.95 },
      ],
      categories: [{ name: "Beverages" }, { name: "Desserts" }],
    };
  }
  if (sourceType === "csv" && rawData) {
    // rawData expected as array of objects
    const arr = Array.isArray(rawData) ? rawData : [];
    return {
      products: arr.slice(0, 20).map((r: any) => ({ name: r.name || r.Name || "Unnamed", price: Number(r.price || r.Price || 0), description: r.description || "", category: r.category || "General", confidence: 0.9 })),
      categories: []
    };
  }
  if (sourceType === "manual") {
    return { products: [], categories: [] };
  }
  // pdf/image fallback mock
  return {
    products: [
      { name: "Veg Burger", price: 180, description: "Crispy veg patty", category: "Food", confidence: 0.88 },
      { name: "Chicken Shawarma", price: 150, description: "Juicy chicken wrap", category: "Food", confidence: 0.9 },
    ],
    categories: [{ name: "Food" }]
  };
}

export async function importerRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/imports", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const parsed = createImportSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid import", details: parsed.error.flatten() });
    const { sourceType, url, rawData, fileName } = parsed.data;

    const job = await prisma.importJob.create({
      data: {
        businessId,
        createdBy: userId,
        sourceType,
        sourceReference: url || fileName || sourceType,
        status: "processing",
        progress: 10,
        metadata: JSON.stringify({ url, fileName }),
        sources: { create: [{ sourceType, sourceUrl: url, sourceMetadata: JSON.stringify({ fileName }) }] }
      }
    });

    // Simulate async extraction synchronously for v0.1 (no queue required yet)
    const extracted = mockExtraction(sourceType, url, rawData);
    const itemsToCreate: any[] = [];
    if ((extracted as any).products) {
      for (const p of (extracted as any).products) {
        itemsToCreate.push({ importJobId: job.id, entityType: "product", entityData: JSON.stringify(p), confidenceScore: p.confidence ?? 0.9, status: "pending", sourceReference: url || fileName });
      }
    }
    if ((extracted as any).categories) {
      for (const c of (extracted as any).categories) {
        itemsToCreate.push({ importJobId: job.id, entityType: "category", entityData: JSON.stringify(c), confidenceScore: 0.95, status: "pending" });
      }
    }
    if ((extracted as any).business) {
      itemsToCreate.push({ importJobId: job.id, entityType: "business", entityData: JSON.stringify((extracted as any).business), confidenceScore: 0.85, status: "pending" });
    }
    if (itemsToCreate.length) await prisma.importItem.createMany({ data: itemsToCreate });

    // detect conflicts (simple: if product name already exists)
    const existingProducts = await prisma.product.findMany({ where: { businessId, deletedAt: null }, select: { name: true, price: true, id: true } });
    const existingMap = new Map(existingProducts.map(p => [p.name.toLowerCase(), p]));
    const conflicts: any[] = [];
    for (const item of itemsToCreate.filter(i => i.entityType === "product")) {
      const data = JSON.parse(item.entityData);
      const existing = existingMap.get((data.name || "").toLowerCase());
      if (existing && existing.price !== data.price) {
        conflicts.push({ importJobId: job.id, entityType: "product", entityId: existing.id, existingValue: JSON.stringify({ price: existing.price }), importedValue: JSON.stringify({ price: data.price }) });
      }
    }
    if (conflicts.length) await prisma.importConflict.createMany({ data: conflicts });

    const updatedJob = await prisma.importJob.update({ where: { id: job.id }, data: { status: "review_required", progress: 100, completedAt: new Date() } });

    await prisma.domainEvent.create({ data: { businessId, eventType: "IMPORT_COMPLETED", aggregateType: "import", aggregateId: job.id, payload: JSON.stringify({ importId: job.id }) } });

    return reply.code(202).send({ success: true, data: updatedJob });
  });

  app.get("/api/v1/businesses/:businessId/imports", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const jobs = await prisma.importJob.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
    return reply.send({ success: true, data: jobs });
  });

  app.get("/api/v1/businesses/:businessId/imports/:importId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, importId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const job = await prisma.importJob.findFirst({ where: { id: importId, businessId }, include: { items: true, conflicts: true, sources: true } });
    if (!job) throw Errors.notFound("Import");
    return reply.send({ success: true, data: job });
  });

  app.get("/api/v1/businesses/:businessId/imports/:importId/preview", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, importId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const job = await prisma.importJob.findFirst({ where: { id: importId, businessId }, include: { items: true, conflicts: true } });
    if (!job) throw Errors.notFound("Import");
    const preview = {
      job,
      items: job.items.map(i => ({ ...i, entityData: JSON.parse(i.entityData) })),
      conflicts: job.conflicts.map(c => ({ ...c, existingValue: c.existingValue ? JSON.parse(c.existingValue) : null, importedValue: c.importedValue ? JSON.parse(c.importedValue) : null })),
    };
    return reply.send({ success: true, data: preview });
  });

  app.post("/api/v1/businesses/:businessId/imports/:importId/confirm", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, importId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      resolutions: z.array(z.object({ conflictId: z.string(), resolution: z.enum(["keep_existing", "use_imported", "manual"]), manualValue: z.any().optional() })).optional(),
      approveIds: z.array(z.string()).optional(), // importItem ids to approve
    });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid confirm payload", details: parsed.error.flatten() });

    const job = await prisma.importJob.findFirst({ where: { id: importId, businessId }, include: { items: true, conflicts: true } });
    if (!job) throw Errors.notFound("Import");

    // handle conflicts
    if (parsed.data.resolutions) {
      for (const r of parsed.data.resolutions) {
        await prisma.importConflict.update({ where: { id: r.conflictId }, data: { resolution: r.resolution, resolvedBy: userId, resolvedAt: new Date() } });
        // if use_imported, update actual product price
        if (r.resolution === "use_imported") {
          const conflict = job.conflicts.find(c => c.id === r.conflictId);
          if (conflict?.entityId && conflict.importedValue) {
            const imported = JSON.parse(conflict.importedValue);
            if (imported.price !== undefined) {
              await prisma.product.update({ where: { id: conflict.entityId }, data: { price: imported.price } });
            }
          }
        }
      }
    }

    // approve items -> create actual entities
    const itemsToApprove = parsed.data.approveIds ? job.items.filter(i => parsed.data.approveIds!.includes(i.id)) : job.items;
    let createdProducts = 0;
    let createdCategories = 0;
    const categoryNameToId = new Map<string, string>();
    const existingCats = await prisma.category.findMany({ where: { businessId } });
    for (const c of existingCats) categoryNameToId.set(c.name.toLowerCase(), c.id);

    for (const item of itemsToApprove) {
      if (item.status === "approved") continue;
      const data = JSON.parse(item.entityData);
      if (item.entityType === "category") {
        const name = data.name;
        if (!categoryNameToId.has(name.toLowerCase())) {
          const cat = await prisma.category.create({ data: { businessId, name } });
          categoryNameToId.set(name.toLowerCase(), cat.id);
          createdCategories++;
        }
        await prisma.importItem.update({ where: { id: item.id }, data: { status: "approved" } });
      } else if (item.entityType === "product") {
        // resolve category
        let categoryId: string | undefined = undefined;
        if (data.category) {
          const key = data.category.toLowerCase();
          if (!categoryNameToId.has(key)) {
            const cat = await prisma.category.create({ data: { businessId, name: data.category } });
            categoryNameToId.set(key, cat.id);
          }
          categoryId = categoryNameToId.get(key);
        }
        // check duplicate
        const slugBase = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
        let slug = slugBase;
        let i = 1;
        while (await prisma.product.findFirst({ where: { businessId, slug } })) slug = `${slugBase}-${i++}`;
        await prisma.product.create({
          data: {
            businessId,
            categoryId,
            name: data.name,
            slug,
            description: data.description,
            price: data.price,
            currency: "INR",
            status: "active",
            availability: "available",
          }
        });
        createdProducts++;
        await prisma.importItem.update({ where: { id: item.id }, data: { status: "approved" } });
      } else if (item.entityType === "business") {
        // update business description if missing
        if (data.description) {
          const b = await prisma.business.findUnique({ where: { id: businessId } });
          if (b && !b.description) await prisma.business.update({ where: { id: businessId }, data: { description: data.description } });
        }
        await prisma.importItem.update({ where: { id: item.id }, data: { status: "approved" } });
      }
    }

    await prisma.importJob.update({ where: { id: importId }, data: { status: "completed", progress: 100, completedAt: new Date() } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "IMPORT_CONFIRMED", entityType: "import", entityId: importId, afterData: JSON.stringify({ createdProducts, createdCategories }) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "IMPORT_CONFIRMED", aggregateType: "import", aggregateId: importId, payload: JSON.stringify({ importId, createdProducts }) } });

    return reply.send({ success: true, data: { createdProducts, createdCategories } });
  });
}
