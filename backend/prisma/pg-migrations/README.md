# PostgreSQL Migrations

These are raw SQL migrations for PostgreSQL-specific features not handled by Prisma's migration system.

## Apply order

1. `prisma db push --schema=prisma/schema.pg.prisma` — creates base schema (tables, columns, indexes)
2. Run pg-migrations SQL files in numeric order (001, 002, ...)

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

After running `prisma migrate deploy` (SQLite only) or `prisma db push --schema=prisma/schema.pg.prisma` (PostgreSQL), run this SQL migration to add vector support.

## Notification dedup (002_add_notification_dedup.sql)

Creates the `notif_broadcast_dedup` partial unique index on the `notifications` table.

### Apply manually against PostgreSQL:

```bash
psql $DATABASE_URL -f backend/prisma/pg-migrations/002_add_notification_dedup.sql
```

### What it does:

1. `CREATE UNIQUE INDEX IF NOT EXISTS "notif_broadcast_dedup"` on `notifications(business_id, source_type, source_id)` with `WHERE recipient_id IS NULL AND source_type IS NOT NULL`

### Why:

Prisma schema DSL cannot express partial unique indexes. This index prevents concurrent duplicate broadcast notifications (where `recipient_id IS NULL`) for the same `business_id + source_type + source_id`. The companion `notif_idempotency` unique constraint (managed by Prisma) covers recipient-specific notifications (non-null `recipient_id`).

### When to apply:

After running `prisma db push --schema=prisma/schema.pg.prisma` to create the base schema, run this SQL migration to add the partial unique index.
