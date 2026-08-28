import { prisma } from "../../infrastructure/database/client.js";
import { mockEmbedding } from "../../infrastructure/ai/MockEmbeddingProvider.js";
import { cosineSimilarity } from "../../infrastructure/ai/EmbeddingProvider.js";

export interface RetrievedMemory {
  id: string;
  content: string;
  scope: string;
  scopeEntityId: string | null;
  priority: string | null;
  score: number;
}

/**
 * Retrieve relevant business memories for a query.
 * Tenant-scoped by businessId. Returns topK results sorted by relevance.
 * Uses pgvector on PostgreSQL, in-memory cosine similarity on SQLite.
 */
export async function retrieveMemory(
  businessId: string,
  query: string,
  topK = 5,
  scope?: string,
  scopeEntityId?: string
): Promise<RetrievedMemory[]> {
  const isPg = (process.env.DATABASE_URL || "").startsWith("postgresql");

  if (isPg) {
    try {
      const queryEmb = await mockEmbedding.embed(query);
      const vectorStr = `[${queryEmb.join(",")}]`;
      let whereScope = "";
      const params: any[] = [vectorStr, businessId];
      let idx = 3;
      if (scope) {
        whereScope += ` AND bm."scope" = $${idx++}`;
        params.push(scope);
      }
      if (scopeEntityId) {
        whereScope += ` AND bm."scope_entity_id" = $${idx++}`;
        params.push(scopeEntityId);
      }
      params.push(topK);
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT bm."id", bm."content", bm."scope", bm."scope_entity_id" as "scopeEntityId", bm."priority", (bm."embedding_vec" <=> $1::vector) as "distance"
         FROM "business_memories" bm
         WHERE bm."business_id" = $2 AND bm."deleted_at" IS NULL AND bm."status" = 'active' AND bm."embedding_vec" IS NOT NULL ${whereScope}
         ORDER BY bm."embedding_vec" <=> $1::vector LIMIT $${idx}`,
        ...params
      );
      return rows
        .map((r: any) => ({
          id: r.id,
          content: r.content,
          scope: r.scope,
          scopeEntityId: r.scopeEntityId,
          priority: r.priority,
          score: 1 - Number(r.distance),
        }))
        .filter((s: RetrievedMemory) => s.score > 0.05);
    } catch {
      // pgvector unavailable — fall through to in-memory
    }
  }

  // SQLite / fallback: in-memory cosine similarity
  const where: any = { businessId, deletedAt: null, status: "active" };
  if (scope) where.scope = scope;
  if (scopeEntityId) where.scopeEntityId = scopeEntityId;
  const all = await prisma.businessMemory.findMany({ where });
  const queryEmb = await mockEmbedding.embed(query);
  return all
    .map((m) => {
      let emb: number[] = [];
      try { emb = JSON.parse((m as any).embedding || "[]"); } catch {}
      const score = emb.length ? cosineSimilarity(queryEmb, emb) : 0;
      return { id: m.id, content: m.content, scope: m.scope, scopeEntityId: m.scopeEntityId, priority: m.priority, score };
    })
    .filter((s) => s.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
