/**
 * PostgreSQL-specific media regression test.
 *
 * This test exercises the mediaType -> media_type column mapping
 * against a real PostgreSQL database. It is designed to run ONLY
 * when DATABASE_URL points to PostgreSQL (not SQLite).
 *
 * Run with: DATABASE_URL="postgresql://..." npx vitest run tests/media-pg.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const DATABASE_URL = process.env.DATABASE_URL || "";
const isPostgres = DATABASE_URL.startsWith("postgresql") || DATABASE_URL.startsWith("postgres://");

// Skip entire suite if not PostgreSQL
const describeIfPg = isPostgres ? describe : describe.skip;

describeIfPg("PostgreSQL Media Schema Regression", () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({ log: ["error"] });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("media_assets table has media_type column (not mediaType)", async () => {
    const columns = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'media_assets' AND column_name = 'media_type'
    `;
    expect(columns.length).toBe(1);
  });

  it("media_assets table has all Increment 16 columns", async () => {
    const columns = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'media_assets'
      ORDER BY ordinal_position
    `;
    const names = columns.map((c) => c.column_name);
    expect(names).toContain("media_type");
    expect(names).toContain("original_filename");
    expect(names).toContain("duration");
    expect(names).toContain("title");
    expect(names).toContain("thumbnail_storage_key");
  });

  it("does NOT have a column literally named mediaType", async () => {
    const columns = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'media_assets' AND column_name = 'mediaType'
    `;
    expect(columns.length).toBe(0);
  });

  it("has composite index on (business_id, media_type)", async () => {
    const indexes = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'media_assets' AND indexname LIKE '%media_type%'
    `;
    expect(indexes.length).toBeGreaterThanOrEqual(1);
  });

  it("mediaType persists through Prisma ORM (VIDEO roundtrip)", async () => {
    // Create a user, workspace, and business
    const user = await prisma.user.create({
      data: {
        email: `pg-media-test-${Date.now()}@test.com`,
        passwordHash: "hash",
        displayName: "PG Media Test",
      },
    });

    const ws = await prisma.workspace.create({
      data: { name: "PG WS", slug: `pg-ws-${Date.now()}`, ownerUserId: user.id },
    });

    const biz = await prisma.business.create({
      data: {
        workspaceId: ws.id,
        name: "PG Biz",
        slug: `pg-biz-${Date.now()}`,
        phone: "+1000000000",
        email: "pg@test.com",
        timezone: "UTC",
        currency: "USD",
        locale: "en-US",
        status: "active",
        createdBy: user.id,
      },
    });

    // Create a VIDEO MediaAsset
    const asset = await prisma.mediaAsset.create({
      data: {
        businessId: biz.id,
        uploadedBy: user.id,
        fileName: "hero.mp4",
        originalFilename: "hero.mp4",
        storageKey: "test/hero.mp4",
        mimeType: "video/mp4",
        mediaType: "VIDEO",
        fileSize: 1024,
        status: "active",
        title: "Hero Video",
        duration: 30.5,
      },
    });

    // Verify the mediaType persisted correctly
    expect(asset.mediaType).toBe("VIDEO");

    // Read it back and verify
    const fetched = await prisma.mediaAsset.findUnique({ where: { id: asset.id } });
    expect(fetched).not.toBeNull();
    expect(fetched!.mediaType).toBe("VIDEO");
    expect(fetched!.fileName).toBe("hero.mp4");
    expect(fetched!.duration).toBeCloseTo(30.5);
    expect(fetched!.title).toBe("Hero Video");

    // Verify via raw SQL that the DB column is media_type with value 'VIDEO'
    const raw = await prisma.$queryRaw<{ media_type: string }[]>`
      SELECT media_type FROM media_assets WHERE id = ${asset.id}
    `;
    expect(raw.length).toBe(1);
    expect(raw[0].media_type).toBe("VIDEO");

    // Create an IMAGE MediaAsset
    const imgAsset = await prisma.mediaAsset.create({
      data: {
        businessId: biz.id,
        uploadedBy: user.id,
        fileName: "photo.jpg",
        originalFilename: "photo.jpg",
        storageKey: "test/photo.jpg",
        mimeType: "image/jpeg",
        mediaType: "IMAGE",
        fileSize: 512,
        status: "active",
      },
    });
    expect(imgAsset.mediaType).toBe("IMAGE");

    // Verify filter by mediaType works through Prisma
    const videos = await prisma.mediaAsset.findMany({
      where: { businessId: biz.id, mediaType: "VIDEO", deletedAt: null },
    });
    expect(videos.length).toBe(1);
    expect(videos[0].mediaType).toBe("VIDEO");

    const images = await prisma.mediaAsset.findMany({
      where: { businessId: biz.id, mediaType: "IMAGE", deletedAt: null },
    });
    expect(images.length).toBe(1);
    expect(images[0].mediaType).toBe("IMAGE");

    // Cleanup
    await prisma.mediaAsset.deleteMany({ where: { businessId: biz.id } });
    await prisma.business.delete({ where: { id: biz.id } });
    await prisma.workspace.delete({ where: { id: ws.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it("tenant isolation: business A cannot see business B media", async () => {
    const userA = await prisma.user.create({
      data: { email: `pg-iso-a-${Date.now()}@test.com`, passwordHash: "hash", displayName: "A" },
    });
    const wsA = await prisma.workspace.create({
      data: { name: "WS A", slug: `ws-a-${Date.now()}`, ownerUserId: userA.id },
    });
    const bizA = await prisma.business.create({
      data: {
        workspaceId: wsA.id, name: "Biz A", slug: `biz-a-${Date.now()}`,
        phone: "+1000000000", email: "a@test.com", timezone: "UTC",
        currency: "USD", locale: "en-US", status: "active", createdBy: userA.id,
      },
    });

    const userB = await prisma.user.create({
      data: { email: `pg-iso-b-${Date.now()}@test.com`, passwordHash: "hash", displayName: "B" },
    });
    const wsB = await prisma.workspace.create({
      data: { name: "WS B", slug: `ws-b-${Date.now()}`, ownerUserId: userB.id },
    });
    const bizB = await prisma.business.create({
      data: {
        workspaceId: wsB.id, name: "Biz B", slug: `biz-b-${Date.now()}`,
        phone: "+1000000000", email: "b@test.com", timezone: "UTC",
        currency: "USD", locale: "en-US", status: "active", createdBy: userB.id,
      },
    });

    // Business A creates a VIDEO asset
    const assetA = await prisma.mediaAsset.create({
      data: {
        businessId: bizA.id, uploadedBy: userA.id, fileName: "secret.mp4",
        storageKey: "a/secret.mp4", mimeType: "video/mp4", mediaType: "VIDEO",
        fileSize: 1024, status: "active",
      },
    });

    // Business B queries — must NOT find Business A's asset
    const bAssets = await prisma.mediaAsset.findMany({
      where: { businessId: bizB.id, deletedAt: null },
    });
    expect(bAssets.length).toBe(0);

    // Business A can find its own asset
    const aAssets = await prisma.mediaAsset.findMany({
      where: { businessId: bizA.id, mediaType: "VIDEO", deletedAt: null },
    });
    expect(aAssets.length).toBe(1);
    expect(aAssets[0].mediaType).toBe("VIDEO");

    // Cleanup
    await prisma.mediaAsset.deleteMany({ where: { businessId: { in: [bizA.id, bizB.id] } } });
    await prisma.business.deleteMany({ where: { id: { in: [bizA.id, bizB.id] } } });
    await prisma.workspace.deleteMany({ where: { id: { in: [wsA.id, wsB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
  });

  it("soft delete and deletedAt filtering", async () => {
    const user = await prisma.user.create({
      data: { email: `pg-del-${Date.now()}@test.com`, passwordHash: "hash", displayName: "Del" },
    });
    const ws = await prisma.workspace.create({
      data: { name: "WS Del", slug: `ws-del-${Date.now()}`, ownerUserId: user.id },
    });
    const biz = await prisma.business.create({
      data: {
        workspaceId: ws.id, name: "Biz Del", slug: `biz-del-${Date.now()}`,
        phone: "+1000000000", email: "del@test.com", timezone: "UTC",
        currency: "USD", locale: "en-US", status: "active", createdBy: user.id,
      },
    });

    const asset = await prisma.mediaAsset.create({
      data: {
        businessId: biz.id, uploadedBy: user.id, fileName: "temp.png",
        storageKey: "del/temp.png", mimeType: "image/png", mediaType: "IMAGE",
        fileSize: 100, status: "active",
      },
    });

    // Soft delete
    await prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { deletedAt: new Date(), status: "deleted" },
    });

    // Should not appear in active queries
    const active = await prisma.mediaAsset.findMany({
      where: { businessId: biz.id, deletedAt: null },
    });
    expect(active.length).toBe(0);

    // Raw column should still exist
    const raw = await prisma.$queryRaw<{ media_type: string }[]>`
      SELECT media_type FROM media_assets WHERE id = ${asset.id}
    `;
    expect(raw.length).toBe(1);

    // Cleanup
    await prisma.mediaAsset.deleteMany({ where: { businessId: biz.id } });
    await prisma.business.delete({ where: { id: biz.id } });
    await prisma.workspace.delete({ where: { id: ws.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
