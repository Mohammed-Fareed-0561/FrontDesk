-- FrontDesk pgvector migration
-- Enables pgvector extension and adds vector(64) columns + HNSW indexes
-- for KnowledgeChunk and BusinessMemory semantic search.
-- Run against PostgreSQL only. Idempotent (IF NOT EXISTS on all statements).

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding_vec column to knowledge_chunks (vector(64))
ALTER TABLE "knowledge_chunks"
  ADD COLUMN IF NOT EXISTS "embedding_vec" vector(64);

-- 3. Add embedding_vec column to business_memories (vector(64))
ALTER TABLE "business_memories"
  ADD COLUMN IF NOT EXISTS "embedding_vec" vector(64);

-- 4. Create HNSW index on knowledge_chunks.embedding_vec (cosine distance)
CREATE INDEX IF NOT EXISTS "idx_knowledge_chunks_embedding_vec"
  ON "knowledge_chunks" USING hnsw ("embedding_vec" vector_cosine_ops);

-- 5. Create HNSW index on business_memories.embedding_vec (cosine distance)
CREATE INDEX IF NOT EXISTS "idx_business_memories_embedding_vec"
  ON "business_memories" USING hnsw ("embedding_vec" vector_cosine_ops);
