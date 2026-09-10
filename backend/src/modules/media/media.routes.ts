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

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const SVG_MIME = "image/svg+xml";
const DOC_MIME = new Set(["application/pdf", "text/csv"]);

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov"]);
const DOC_EXT = new Set(["pdf", "csv"]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
const MAX_DOC_SIZE = 10 * 1024 * 1024;    // 10MB

function sanitizeSvg(buffer: Buffer): Buffer {
  const content = buffer.toString("utf-8");
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=/gi, "data-blocked=")
    .replace(/javascript:/gi, "data-blocked:");
  return Buffer.from(sanitized, "utf-8");
}

function getMediaType(mimeType: string, ext: string): string {
  if (IMAGE_MIME.has(mimeType) || IMAGE_EXT.has(ext)) return "IMAGE";
  if (VIDEO_MIME.has(mimeType) || VIDEO_EXT.has(ext)) return "VIDEO";
  if (DOC_MIME.has(mimeType) || DOC_EXT.has(ext)) return "DOCUMENT";
  if (mimeType === SVG_MIME || ext === "svg") return "IMAGE";
  return "DOCUMENT";
}

function getMaxSize(mediaType: string): number {
  if (mediaType === "VIDEO") return MAX_VIDEO_SIZE;
  if (mediaType === "DOCUMENT") return MAX_DOC_SIZE;
  return MAX_IMAGE_SIZE;
}

function validateFile(filename: string, mimeType: string, size: number) {
  if (!filename || filename.length > 255) throw new AppError({ statusCode: 400, code: "INVALID_FILENAME", message: "Invalid filename" });
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) throw new AppError({ statusCode: 400, code: "INVALID_FILENAME", message: "Invalid filename" });
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const allExt = new Set([...IMAGE_EXT, ...VIDEO_EXT, ...DOC_EXT, "svg"]);
  if (ext && !allExt.has(ext)) throw new AppError({ statusCode: 400, code: "INVALID_FILE_TYPE", message: `Extension .${ext} not allowed` });
  const allMime = new Set([...IMAGE_MIME, ...VIDEO_MIME, ...DOC_MIME, SVG_MIME]);
  if (mimeType && !allMime.has(mimeType)) {
    throw new AppError({ statusCode: 400, code: "INVALID_FILE_TYPE", message: `MIME ${mimeType} not allowed` });
  }
  const mediaType = getMediaType(mimeType, ext);
  const maxSize = getMaxSize(mediaType);
  if (size > maxSize) throw new AppError({ statusCode: 400, code: "FILE_TOO_LARGE", message: `Max ${maxSize / 1024 / 1024}MB for ${mediaType.toLowerCase()}` });
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
    const ext = sanitized.split(".").pop()?.toLowerCase() || "";
    const mediaType = getMediaType(data.mimetype, ext);
    let finalBuffer = buffer;
    if (ext === "svg" && data.mimetype === SVG_MIME) {
      finalBuffer = sanitizeSvg(buffer);
    }
    const mediaId = randomUUID();
    const storageKey = buildStorageKey(businessId, mediaId, sanitized);
    try {
      await storage.upload(storageKey, finalBuffer, data.mimetype);
    } catch (e: any) {
      throw new AppError({ statusCode: 500, code: "STORAGE_ERROR", message: "Failed to store file" });
    }
    const asset = await prisma.mediaAsset.create({
      data: {
        id: mediaId,
        businessId,
        uploadedBy: userId,
        fileName: sanitized,
        originalFilename: data.filename,
        storageKey,
        mimeType: data.mimetype,
        mediaType,
        fileSize: finalBuffer.length,
        status: "active",
        metadata: JSON.stringify({ originalName: data.filename, storageKey }),
      },
    });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEDIA_UPLOADED", entityType: "media", entityId: asset.id, afterData: JSON.stringify({ fileName: sanitized, mimeType: data.mimetype, mediaType, size: finalBuffer.length }) } });
    const signedUrl = await storage.getSignedUrl(storageKey, 300);
    return reply.code(201).send({ success: true, data: { ...asset, signedUrl, publicUrl: storage.getPublicUrl(storageKey) } });
  });

  app.get("/api/v1/businesses/:businessId/media", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const { mediaType, search } = req.query as any;
    const where: any = { businessId, deletedAt: null };
    if (mediaType) where.mediaType = mediaType;
    if (search) where.OR = [{ fileName: { contains: search } }, { title: { contains: search } }, { altText: { contains: search } }];
    const assets = await prisma.mediaAsset.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
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

  app.patch("/api/v1/businesses/:businessId/media/:mediaId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, mediaId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const asset = await prisma.mediaAsset.findFirst({ where: { id: mediaId, businessId, deletedAt: null } });
    if (!asset) throw Errors.notFound("Media");
    const body = req.body as any;
    const updateData: any = {};
    if (body.altText !== undefined) updateData.altText = body.altText;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.width !== undefined) updateData.width = body.width;
    if (body.height !== undefined) updateData.height = body.height;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.thumbnailStorageKey !== undefined) updateData.thumbnailStorageKey = body.thumbnailStorageKey;
    if (body.metadata !== undefined) updateData.metadata = typeof body.metadata === "string" ? body.metadata : JSON.stringify(body.metadata);
    const updated = await prisma.mediaAsset.update({ where: { id: mediaId }, data: updateData });
    return reply.send({ success: true, data: updated });
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
    if (asset.thumbnailStorageKey) {
      await storage.delete(asset.thumbnailStorageKey).catch(() => {});
    }
    await prisma.mediaAsset.update({ where: { id: mediaId }, data: { deletedAt: new Date(), status: "deleted" } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "MEDIA_DELETED", entityType: "media", entityId: mediaId, beforeData: JSON.stringify(asset) } });
    await prisma.domainEvent.create({ data: { businessId, eventType: "MEDIA_DELETED", aggregateType: "media", aggregateId: mediaId, payload: JSON.stringify({ mediaId }) } });
    return reply.send({ success: true, data: { deleted: true } });
  });
}
