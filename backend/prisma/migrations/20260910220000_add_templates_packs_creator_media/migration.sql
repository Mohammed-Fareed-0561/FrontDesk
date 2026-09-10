-- CreateTable: CreatorProfile
CREATE TABLE "creator_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_user_id_key" ON "creator_profiles"("user_id");
CREATE UNIQUE INDEX "creator_profiles_slug_key" ON "creator_profiles"("slug");

-- CreateTable: WebsiteTemplate
CREATE TABLE "website_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "thumbnail" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "is_built_in" BOOLEAN NOT NULL DEFAULT false,
    "owner_type" TEXT NOT NULL DEFAULT 'system',
    "owner_id" TEXT,
    "theme_config" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "website_templates_slug_key" ON "website_templates"("slug");

-- CreateTable: WebsiteTemplatePage
CREATE TABLE "website_template_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "page_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "seo_config" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "website_template_pages_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "website_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "website_template_pages_template_id_slug_key" ON "website_template_pages"("template_id", "slug");

-- CreateTable: WebsiteTemplateSection
CREATE TABLE "website_template_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_page_id" TEXT NOT NULL,
    "section_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "style_config" TEXT,
    "visibility_config" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "website_template_sections_template_page_id_fkey" FOREIGN KEY ("template_page_id") REFERENCES "website_template_pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: WebsiteTemplateComponent
CREATE TABLE "website_template_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "template_section_id" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "props" TEXT NOT NULL,
    "content" TEXT,
    "style_config" TEXT,
    "asset_refs" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "website_template_components_template_section_id_fkey" FOREIGN KEY ("template_section_id") REFERENCES "website_template_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: SectionPack
CREATE TABLE "section_packs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_built_in" BOOLEAN NOT NULL DEFAULT false,
    "owner_type" TEXT NOT NULL DEFAULT 'system',
    "owner_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "template_id" TEXT,
    CONSTRAINT "section_packs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "website_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "section_packs_slug_key" ON "section_packs"("slug");

-- CreateTable: SectionPackSection
CREATE TABLE "section_pack_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pack_id" TEXT NOT NULL,
    "section_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "style_config" TEXT,
    "visibility_config" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "section_pack_sections_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "section_packs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: SectionPackComponent
CREATE TABLE "section_pack_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pack_section_id" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "props" TEXT NOT NULL,
    "content" TEXT,
    "style_config" TEXT,
    "asset_refs" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "section_pack_components_pack_section_id_fkey" FOREIGN KEY ("pack_section_id") REFERENCES "section_pack_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable: Add new columns to media_assets
ALTER TABLE "media_assets" ADD COLUMN "original_filename" TEXT;
ALTER TABLE "media_assets" ADD COLUMN "media_type" TEXT NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "media_assets" ADD COLUMN "duration" REAL;
ALTER TABLE "media_assets" ADD COLUMN "title" TEXT;
ALTER TABLE "media_assets" ADD COLUMN "thumbnail_storage_key" TEXT;

-- CreateIndex for media_assets
CREATE INDEX "media_assets_business_id_media_type_idx" ON "media_assets"("business_id", "media_type");
CREATE INDEX "media_assets_business_id_status_idx" ON "media_assets"("business_id", "status");
