-- CreateTable
CREATE TABLE "website_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section_id" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "props" TEXT NOT NULL,
    "content" TEXT,
    "style_config" TEXT,
    "asset_refs" TEXT,
    "source_type" TEXT,
    "source_id" TEXT,
    "source_version" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "website_components_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "website_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "website_components_section_id_sort_order_idx" ON "website_components"("section_id", "sort_order");
