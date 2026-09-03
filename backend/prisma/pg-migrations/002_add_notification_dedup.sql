-- FrontDesk PostgreSQL notification broadcast deduplication index
-- Creates the partial unique index `notif_broadcast_dedup` that prevents
-- concurrent duplicate broadcast notifications (recipient_id IS NULL)
-- from being created for the same business + source_type + source_id.
--
-- This index cannot be expressed in Prisma schema DSL (Prisma does not
-- support partial unique indexes), so it is applied as raw SQL after
-- `prisma db push --schema=prisma/schema.pg.prisma`.
--
-- Idempotent: all statements use IF NOT EXISTS.
-- Safe to run multiple times.
-- Run against PostgreSQL only.

-- Prevent duplicate broadcast notifications at the database level.
-- Predicate: recipient_id IS NULL (broadcast) AND source_type IS NOT NULL.
-- This complements the notif_idempotency unique constraint which covers
-- recipient-specific notifications (non-null recipient_id).
CREATE UNIQUE INDEX IF NOT EXISTS "notif_broadcast_dedup"
  ON "notifications" ("business_id", "source_type", "source_id")
  WHERE "recipient_id" IS NULL AND "source_type" IS NOT NULL;
