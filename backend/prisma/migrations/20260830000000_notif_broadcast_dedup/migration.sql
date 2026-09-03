-- Partial unique index for broadcast notifications (recipient_id IS NULL)
-- This prevents concurrent duplicate broadcast events from creating duplicate notifications.
-- SQLite and PostgreSQL both support partial indexes with WHERE clauses.
-- The existing notif_idempotency constraint covers recipient-specific notifications (non-null recipient_id).
-- This index covers the broadcast case (null recipient_id) where the existing constraint fails.
CREATE UNIQUE INDEX "notif_broadcast_dedup" ON "notifications"("business_id", "source_type", "source_id")
  WHERE "recipient_id" IS NULL AND "source_type" IS NOT NULL;
