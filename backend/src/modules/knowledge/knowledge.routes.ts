import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import { mockEmbedding } from "../../infrastructure/ai/MockEmbeddingProvider.js";
import { cosineSimilarity } from "../../infrastructure/ai/EmbeddingProvider.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

function chunkText(text: string, size = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= text.length) break;
    start = end - overlap;
  }
  return chunks;
}

function detectSecrets(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("api_key") || /sk-[a-z0-9]{20,}/.test(lower) || lower.includes("password:") || lower.includes("secret_key") || lower.includes("aws_secret");
}

export async function knowledgeRoutes(app: FastifyInstance) {
  app.post("/api/v1/businesses/:businessId/knowledge", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1).max(20000),
      sourceType: z.string().optional().default("MANUAL"),
      sourceId: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });
    if (detectSecrets(parsed.data.content)) {
      throw new AppError({ statusCode: 400, code: "SECRET_DETECTED", message: "Content contains potential secrets" });
    }
    const doc = await prisma.knowledgeDocument.create({
      data: {
        businessId,
        title: parsed.data.title,
        content: parsed.data.content,
        sourceType: parsed.data.sourceType,
        sourceId: parsed.data.sourceId,
        status: "active",
      },
    });
    const chunks = chunkText(parsed.data.content);
    if (chunks.length === 0) {
      await prisma.knowledgeDocument.update({ where: { id: doc.id }, data: { status: "failed" } });
      throw new AppError({ statusCode: 400, code: "EXTRACTION_FAILED", message: "No content to index" });
    }
    const embeddings = await mockEmbedding.embedBatch(chunks);
    for (let i = 0; i < chunks.length; i++) {
      await prisma.knowledgeChunk.create({
        data: {
          documentId: doc.id,
          chunkIndex: i,
          content: chunks[i],
          embedding: JSON.stringify(embeddings[i]),
          metadata: JSON.stringify({ businessId, sourceType: parsed.data.sourceType, sourceId: doc.id, chunkIndex: i }),
        },
      });
    }
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "KNOWLEDGE_CREATED", entityType: "knowledge", entityId: doc.id, afterData: JSON.stringify({ title: doc.title, chunks: chunks.length }) } });
    const withChunks = await prisma.knowledgeDocument.findUnique({ where: { id: doc.id }, include: { chunks: true } });
    return reply.code(201).send({ success: true, data: withChunks });
  });

  app.get("/api/v1/businesses/:businessId/knowledge", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const docs = await prisma.knowledgeDocument.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, include: { chunks: true } });
    return reply.send({ success: true, data: docs });
  });

  app.get("/api/v1/businesses/:businessId/knowledge/:knowledgeId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, knowledgeId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const doc = await prisma.knowledgeDocument.findFirst({ where: { id: knowledgeId, businessId }, include: { chunks: true } });
    if (!doc) throw Errors.notFound("Knowledge");
    return reply.send({ success: true, data: doc });
  });

  app.delete("/api/v1/businesses/:businessId/knowledge/:knowledgeId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, knowledgeId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const doc = await prisma.knowledgeDocument.findFirst({ where: { id: knowledgeId, businessId } });
    if (!doc) throw Errors.notFound("Knowledge");
    await prisma.knowledgeChunk.deleteMany({ where: { documentId: knowledgeId } });
    await prisma.knowledgeDocument.delete({ where: { id: knowledgeId } });
    await prisma.auditLog.create({ data: { businessId, actorType: "user", actorId: userId, action: "KNOWLEDGE_DELETED", entityType: "knowledge", entityId: knowledgeId } });
    return reply.send({ success: true, data: { deleted: true } });
  });

  app.post("/api/v1/businesses/:businessId/knowledge/reindex/:knowledgeId", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId, knowledgeId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const doc = await prisma.knowledgeDocument.findFirst({ where: { id: knowledgeId, businessId } });
    if (!doc || !doc.content) throw Errors.notFound("Knowledge");
    await prisma.knowledgeChunk.deleteMany({ where: { documentId: knowledgeId } });
    const chunks = chunkText(doc.content);
    const embeddings = await mockEmbedding.embedBatch(chunks);
    for (let i = 0; i < chunks.length; i++) {
      await prisma.knowledgeChunk.create({
        data: { documentId: knowledgeId, chunkIndex: i, content: chunks[i], embedding: JSON.stringify(embeddings[i]), metadata: JSON.stringify({ businessId, chunkIndex: i }) },
      });
    }
    const updated = await prisma.knowledgeDocument.findUnique({ where: { id: knowledgeId }, include: { chunks: true } });
    return reply.send({ success: true, data: updated });
  });

  app.post("/api/v1/businesses/:businessId/knowledge/search", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const schema = z.object({ query: z.string().min(1).max(500), topK: z.coerce.number().int().min(1).max(10).optional().default(5) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Invalid", details: parsed.error.flatten() });

    const queryEmbedding = await mockEmbedding.embed(parsed.data.query);
    const docsForBiz = await prisma.knowledgeDocument.findMany({ where: { businessId } });
    const docIds = docsForBiz.map((d) => d.id);
    const chunks = await prisma.knowledgeChunk.findMany({
      where: { documentId: { in: docIds } },
      include: { document: true },
    });

    const scored = chunks
      .map((c) => {
        let emb: number[] = [];
        try {
          emb = JSON.parse(c.embedding || "[]");
        } catch {}
        const score = emb.length ? cosineSimilarity(queryEmbedding, emb) : 0;
        return { chunk: c, score };
      })
      .filter((s) => s.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, parsed.data.topK)
      .map((s) => ({
        content: s.chunk.content,
        score: s.score,
        provenance: { documentId: s.chunk.documentId, chunkIndex: s.chunk.chunkIndex, title: s.chunk.document.title, sourceType: s.chunk.document.sourceType },
      }));

    return reply.send({ success: true, data: scored });
  });
}
