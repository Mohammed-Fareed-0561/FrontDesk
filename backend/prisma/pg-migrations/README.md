# PostgreSQL Migrations

These are raw SQL migrations for PostgreSQL-specific features not handled by Prisma's migration system.

## pgvector (001_add_pgvector.sql)

Enables the `vector` extension and adds `vector(64)` columns + HNSW indexes for semantic search.

### Apply manually against PostgreSQL:

```bash
psql $DATABASE_URL -f backend/prisma/pg-migrations/001_add_pgvector.sql
```

### What it does:

1. `CREATE EXTENSION IF NOT EXISTS vector` — enables pgvector
2. Adds `embedding_vec vector(64)` to `knowledge_chunks`
3. Adds `embedding_vec vector(64)` to `business_memories`
4. Creates HNSW indexes with `vector_cosine_ops` for fast approximate nearest-neighbor search

### When to apply:

After running `prisma migrate deploy` (which creates the base schema), run this SQL migration to add vector support.
