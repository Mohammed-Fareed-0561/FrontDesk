-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_business_memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "business_id" TEXT NOT NULL,
    "key" TEXT,
    "content" TEXT NOT NULL,
    "memory_type" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'BUSINESS',
    "scope_entity_id" TEXT,
    "priority" TEXT DEFAULT 'MEDIUM',
    "importance" INTEGER,
    "confidence" REAL,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by" TEXT,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "expires_at" DATETIME,
    "embedding" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    CONSTRAINT "business_memories_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_business_memories" ("business_id", "confidence", "content", "created_at", "deleted_at", "id", "importance", "key", "memory_type", "source", "status", "updated_at") SELECT "business_id", "confidence", "content", "created_at", "deleted_at", "id", "importance", "key", "memory_type", "source", "status", "updated_at" FROM "business_memories";
DROP TABLE "business_memories";
ALTER TABLE "new_business_memories" RENAME TO "business_memories";
CREATE INDEX "business_memories_business_id_idx" ON "business_memories"("business_id");
CREATE INDEX "business_memories_business_id_status_idx" ON "business_memories"("business_id", "status");
CREATE INDEX "business_memories_business_id_scope_idx" ON "business_memories"("business_id", "scope");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
