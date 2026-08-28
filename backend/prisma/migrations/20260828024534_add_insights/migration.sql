-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "business_id" TEXT NOT NULL,
    "insight_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT,
    "detected_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "insights_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "insights_business_id_status_idx" ON "insights"("business_id", "status");

-- CreateIndex
CREATE INDEX "insights_business_id_insight_type_idx" ON "insights"("business_id", "insight_type");

-- CreateIndex
CREATE UNIQUE INDEX "insights_business_id_insight_type_key" ON "insights"("business_id", "insight_type");
