import { FastifyInstance } from "fastify";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { randomUUID } from "crypto";
import { storage, buildStorageKey } from "../../infrastructure/storage/LocalStorageAdapter.js";
import { sanitizeFilename } from "../../infrastructure/storage/StorageAdapter.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "application/pdf", "text/csv"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "pdf", "csv"]);
const MAX_SIZE = 5 * 1024 * 1024;

function validateFile(filename: string, mimeType: string, size: number) {
  if (!filename || filename.length > 255) throw new AppError({ statusCode: 400, code: "INVALID_FILENAME", message: "Invalid filename" });
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) throw new AppError({ statusCode: 400, code: "INVALID_FILENAME", message: "Invalid filename" });
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext && !ALLOWED_EXT.has(ext)) throw new AppError({ statusCode: 400, code: "INVALID_FILE_TYPE", message: `Extension .${ext} not allowed` });
  if (mimeType && !ALLOWED_MIME.has(mimeType) && !mimeType.startsWith("image/")) {
    throw new AppError({ statusCode: 400, code: "INVALID_FILE_TYPE", message: `MIME ${mimeType} not allowed` });
  }
  if (size > MAX_SIZE) throw new AppError({ statusCode: 400, code: "FILE_TOO_LARGE", message: `Max ${MAX_SIZE / 1024 / 1024}MB` });
  if (size === 0) throw new AppError({ statusCode: 400, code: "INVALID_FILE", message: "Empty file" });
}

export async function mediaRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/media", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const data = await req.file();
    if (!data) throw new AppError({ statusCode: 400, code: "INVALID_FILE", message: "No file" });
    const buffer = await data.toBuffer();
    validateFile(data.filename, data.mimetype, buffer.length);
    const sanitized = sanitizeFilename(data.filename);
    const mediaId = randomUUID();
    const storageKey = buildStorageKey(businessId, mediaId, sanitized);
    try {
      await storage.upload(storageKey, buffer, data.mimetype);
    } catch (e: any) {
      throw new AppError({ statusCode: 500, code: "STORAGE_ERROR", message: "Failed to store file" });
    }
    const asset = await prisma.mediaAsset.create({
      data: {
        id: mediaId,
        businessId,
        uploadedBy: userId,
        fileName: sanitized,
        storageKey,
        mimeType: data.mimetype,
        fileSize: buffer.length,
        status: "active",
        metadata: JSON.stringify({ originalName: data.filename, storageKey }),
      },
    });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEDIA_UPLOADED", entityType: "media", entityId: asset.id, afterData: JSON.stringify({ fileName: sanitized, mimeType: data.mimetype, size: buffer.length }) } });
    const signedUrl = await storage.getSignedUrl(storageKey, 300);
    return reply.code(201).send({ success: true, data: { ...asset, signedUrl, publicUrl: storage.getPublicUrl(storageKey) } });
  });

  app.get("/api/v1/businesses/:businessId/media", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const assets = await prisma.mediaAsset.findMany({ where: { businessId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 100 });
    const withUrls = await Promise.all(assets.map(async (a) => ({ ...a, signedUrl: await storage.getSignedUrl(a.storageKey, 300).catch(() => null) })));
    return reply.send({ success: true, data: withUrls });
  });

  app.get("/api/v1/businesses/:businessId/media/:mediaId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, mediaId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const asset = await prisma.mediaAsset.findFirst({ where: { id: mediaId, businessId, deletedAt: null } });
    if (!asset) throw Errors.notFound("Media");
    const exists = await storage.exists(asset.storageKey);
    const signedUrl = await storage.getSignedUrl(asset.storageKey, 300);
    return reply.send({ success: true, data: { ...asset, exists, signedUrl } });
  });

  app.get("/api/v1/businesses/:businessId/media/:mediaId/file", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, mediaId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const asset = await prisma.mediaAsset.findFirst({ where: { id: mediaId, businessId, deletedAt: null } });
    if (!asset) throw Errors.notFound("Media");
    const buffer = await storage.download(asset.storageKey);
    if (!buffer) {
      return reply.code(404).send({ success: false, error: { code: "OBJECT_MISSING", message: "File not found in storage, metadata exists" } });
    }
    reply.header("Content-Type", asset.mimeType || "application/octet-stream");
    reply.header("Content-Disposition", `inline; filename="${asset.fileName}"`);
    reply.header("Cache-Control", "private, max-age=300");
    return reply.send(buffer);
  });

  app.get("/api/v1/media/signed/:key", async (req, reply) => {
    const { key } = req.params as any;
    const { exp, sig } = req.query as any;
    const decodedKey = decodeURIComponent(key);
    if (!exp || !sig) return reply.code(401).send({ success: false, error: { code: "UNAUTHORIZED", message: "Missing signature" } });
    const { LocalStorageAdapter } = await import("../../infrastructure/storage/LocalStorageAdapter.js");
    if (!LocalStorageAdapter.verifySignedUrl(decodedKey, exp as string, sig as string)) {
      return reply.code(401).send({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired signature" } });
    }
    const buffer = await storage.download(decodedKey);
    if (!buffer) return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
    const asset = await prisma.mediaAsset.findFirst({ where: { storageKey: decodedKey } });
    reply.header("Content-Type", asset?.mimeType || "application/octet-stream");
    reply.header("Cache-Control", "private, max-age=60");
    return reply.send(buffer);
  });

  app.get("/api/v1/public/business/:slug/media/:mediaId/file", async (req, reply) => {
    const { slug, mediaId } = req.params as any;
    const business = await prisma.business.findFirst({ where: { slug, deletedAt: null, status: "active" } });
    if (!business) throw Errors.notFound("Business");
    const asset = await prisma.mediaAsset.findFirst({ where: { id: mediaId, businessId: business.id, deletedAt: null } });
    if (!asset) throw Errors.notFound("Media");
    const isPublic = asset.status === "active";
    const productImage = await prisma.productImage.findFirst({ where: { mediaId } });
    const websiteAsset = await prisma.website.findFirst({ where: { businessId: business.id, status: "published" } });
    if (!isPublic && !productImage && !websiteAsset) {
      return reply.code(403).send({ success: false, error: { code: "FORBIDDEN", message: "Private asset" } });
    }
    const buffer = await storage.download(asset.storageKey);
    if (!buffer) return reply.code(404).send({ success: false, error: { code: "OBJECT_MISSING", message: "File not found" } });
    reply.header("Content-Type", asset.mimeType || "application/octet-stream");
    reply.header("Cache-Control", "public, max-age=3600");
    return reply.send(buffer);
  });

  app.delete("/api/v1/businesses/:businessId/media/:mediaId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, mediaId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const asset = await prisma.mediaAsset.findFirst({ where: { id: mediaId, businessId, deletedAt: null } });
    if (!asset) throw Errors.notFound("Media");
    const productRef = await prisma.productImage.findFirst({ where: { mediaId } });
    const websiteRef = await prisma.website.findFirst({ where: { businessId, status: "published" } });
    if (productRef || websiteRef) {
      await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEDIA_DELETE_BLOCKED", entityType: "media", entityId: mediaId, afterData: JSON.stringify({ reason: "referenced" }) } });
    }
    const deletedFromStorage = await storage.delete(asset.storageKey);
    if (!deletedFromStorage) {
      const exists = await storage.exists(asset.storageKey);
      if (exists) {
        return reply.code(500).send({ success: false, error: { code: "STORAGE_ERROR", message: "Failed to delete from storage" } });
      }
    }
    await prisma.mediaAsset.update({ where: { id: mediaId }, data: { deletedAt: new Date(), status: "deleted" } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEDIA_DELETED", entityType: "media", entityId: mediaId, beforeData: JSON.stringify(asset) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "MEDIA_DELETED", aggregateType: "media", aggregateId: mediaId, payload: JSON.stringify({ mediaId }) } });
    return reply.send({ success: true, data: { deleted: true } });
  });
}
