-- DropIndex
DROP INDEX "media_assets_business_id_idx";

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN "enabled_modules" TEXT;

-- RedefineIndex
DROP INDEX "notif_pref_unique";
CREATE UNIQUE INDEX "notification_preferences_business_id_user_id_type_key" ON "notification_preferences"("business_id", "user_id", "type");

-- RedefineIndex
DROP INDEX "notif_idempotency";
CREATE UNIQUE INDEX "notifications_business_id_recipient_id_source_type_source_id_key" ON "notifications"("business_id", "recipient_id", "source_type", "source_id");
