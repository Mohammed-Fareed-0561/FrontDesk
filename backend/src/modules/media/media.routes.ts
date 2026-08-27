import { FastifyInstance } from "fastify";
import { prisma } from "../../infrastructure/database/client.js";
import { Errors } from "../../shared/errors/AppError.js";
import { randomUUID } from "crypto";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

export async function mediaRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/media", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const data = await req.file();
    if (!data) throw Errors.notFound("File");
    // Validate file
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf", "text/csv"];
    if (data.mimetype && !allowed.includes(data.mimetype) && !data.mimetype.startsWith("image/")) {
      return reply.code(400).send({ success: false, error: { code: "INVALID_FILE_TYPE", message: `File type ${data.mimetype} not allowed` } });
    }
    const buffer = await data.toBuffer();
    if (buffer.length > 10 * 1024 * 1024) {
      return reply.code(400).send({ success: false, error: { code: "FILE_TOO_LARGE", message: "Max 10MB" } });
    }
    const storageKey = `${businessId}/${randomUUID()}-${data.filename}`;
    // For v0.1, we store metadata only and keep buffer in memory stub. In production upload to object storage.
    // We persist a record; actual file storage would be S3/local FS. Here we just record.
    const asset = await prisma.mediaAsset.create({
      data: {
        businessId,
        uploadedBy: userId,
        fileName: data.filename,
        storageKey,
        mimeType: data.mimetype,
        fileSize: buffer.length,
        status: "active",
        metadata: JSON.stringify({ originalName: data.filename }),
      }
    });
    return reply.code(201).send({ success: true, data: asset });
  });

  app.get("/api/v1/businesses/:businessId/media", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const assets = await prisma.mediaAsset.findMany({ where: { businessId, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 50 });
    return reply.send({ success: true, data: assets });
  });
}
