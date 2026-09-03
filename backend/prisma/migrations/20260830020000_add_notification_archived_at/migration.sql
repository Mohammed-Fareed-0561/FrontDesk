-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "archived_at" DATETIME;

-- CreateIndex
CREATE INDEX "notifications_business_id_archived_at_idx" ON "notifications"("business_id", "archived_at");
