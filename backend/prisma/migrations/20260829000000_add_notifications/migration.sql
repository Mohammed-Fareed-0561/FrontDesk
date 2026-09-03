-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "business_id" TEXT NOT NULL,
    "recipient_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "status" TEXT NOT NULL DEFAULT 'unread',
    "source_type" TEXT,
    "source_id" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" DATETIME,
    CONSTRAINT "notifications_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "notif_idempotency" ON "notifications"("business_id", "recipient_id", "source_type", "source_id");

-- CreateIndex
CREATE INDEX "notifications_business_id_status_idx" ON "notifications"("business_id", "status");

-- CreateIndex
CREATE INDEX "notifications_business_id_recipient_id_idx" ON "notifications"("business_id", "recipient_id");

-- CreateIndex
CREATE INDEX "notifications_business_id_type_idx" ON "notifications"("business_id", "type");
