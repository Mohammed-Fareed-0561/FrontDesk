-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "business_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "service_id" TEXT,
    "staff_id" TEXT,
    "location_id" TEXT,
    "booking_number" TEXT NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT DEFAULT 'MANUAL',
    "customer_notes" TEXT,
    "internal_notes" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "cancelled_at" DATETIME,
    "completed_at" DATETIME,
    CONSTRAINT "bookings_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "bookings_business_id_status_idx" ON "bookings"("business_id", "status");

-- CreateIndex
CREATE INDEX "bookings_business_id_start_time_idx" ON "bookings"("business_id", "start_time");

-- CreateIndex
CREATE INDEX "bookings_customer_id_idx" ON "bookings"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_business_id_booking_number_key" ON "bookings"("business_id", "booking_number");
