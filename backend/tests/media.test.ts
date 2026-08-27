import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestApp, cleanupDb } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;
beforeAll(async () => { app = await createTestApp(); });
afterAll(async () => { await app.close(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanupDb(); });

async function signup(email: string) {
  const r = await app.inject({ method: "POST", url: "/api/v1/auth/signup", payload: { email, password: "password123" } });
  return JSON.parse(r.body).data;
}
async function createBusiness(token: string) {
  const r = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name: `Biz${Date.now()}` } });
  return JSON.parse(r.body).data;
}
function makeForm(filename: string, mime: string, buffer: Buffer) {
  const FormData = (global as any).FormData;
  const Blob = (global as any).Blob;
  const fd = new FormData();
  const blob = new Blob([buffer], { type: mime });
  fd.append("file", blob, filename);
  return fd;
}

describe("Media — storage adapter hardening", () => {
  it("upload creates metadata and stores file", async () => {
    const { token } = await signup(`m1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const buf = Buffer.from("fake image content");
    const fd = makeForm("photo.jpg", "image/jpeg", buf);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/media`,
      headers: { authorization: `Bearer ${token}` },
      payload: fd,
    });
    expect(res.statusCode).toBe(201);
    const asset = JSON.parse(res.body).data;
    expect(asset.businessId).toBe(biz.id);
    expect(asset.storageKey).toMatch(new RegExp(`business/${biz.id}/media/`));
    expect(asset.mimeType).toBe("image/jpeg");
    expect(asset.fileSize).toBe(buf.length);
    expect(asset.signedUrl).toBeTruthy();
    const db = await prisma.mediaAsset.findUnique({ where: { id: asset.id } });
    expect(db).not.toBeNull();
  });

  it("tenant isolation: B cannot list/get/delete A's media", async () => {
    const a = await signup(`mA${Date.now()}@test.com`);
    const b = await signup(`mB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    const buf = Buffer.from("a file");
    const fd = makeForm("a.jpg", "image/jpeg", buf);
    const up = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/media`, headers: { authorization: `Bearer ${a.token}` }, payload: fd });
    const asset = JSON.parse(up.body).data;
    const listAsB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/media`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(listAsB.statusCode)).toBe(true);
    const getAsB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/media/${asset.id}`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(getAsB.statusCode)).toBe(true);
    const delAsB = await app.inject({ method: "DELETE", url: `/api/v1/businesses/${bizA.id}/media/${asset.id}`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(delAsB.statusCode)).toBe(true);
    const crossBiz = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizB.id}/media/${asset.id}`, headers: { authorization: `Bearer ${b.token}` } });
    expect(crossBiz.statusCode).toBe(404);
  });

  it("requires authentication", async () => {
    const { token } = await signup(`m2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/media` });
    expect(res.statusCode).toBe(401);
  });

  it("validates file size (oversized)", async () => {
    const { token } = await signup(`m3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const big = Buffer.alloc(6 * 1024 * 1024, "a");
    const fd = makeForm("big.jpg", "image/jpeg", big);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect((body.error?.code || body.code)).toBe("FILE_TOO_LARGE");
  });

  it("validates MIME type", async () => {
    const { token } = await signup(`m4${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const buf = Buffer.from("not allowed");
    const fd = makeForm("evil.exe", "application/x-msdownload", buf);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect((body.error?.code || body.code)).toBe("INVALID_FILE_TYPE");
  });

  it("protects against path traversal and dangerous filename", async () => {
    const { token } = await signup(`m5${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const buf = Buffer.from("x");
    const fd = makeForm("../../etc/passwd", "image/jpeg", buf);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    if (res.statusCode === 201) {
      const asset = JSON.parse(res.body).data;
      expect(asset.storageKey).not.toContain("..");
      expect(asset.storageKey).not.toContain("/etc/passwd");
    } else {
      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect((body.error?.code || body.code)).toMatch(/INVALID/);
    }
    const fd2 = makeForm("a/b.png", "image/png", buf);
    const res2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd2 });
    if (res2.statusCode === 201) {
      const asset2 = JSON.parse(res2.body).data;
      expect(asset2.storageKey).not.toContain("..");
    } else {
      expect(res2.statusCode).toBe(400);
    }
  });

  it("rejects empty file", async () => {
    const { token } = await signup(`m6${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const fd = makeForm("empty.jpg", "image/jpeg", Buffer.from(""));
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    expect(res.statusCode).toBe(400);
  });

  it("delete removes both DB and storage and handles orphan", async () => {
    const { token } = await signup(`m7${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const fd = makeForm("del.jpg", "image/jpeg", Buffer.from("to delete"));
    const up = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    const asset = JSON.parse(up.body).data;
    const del = await app.inject({ method: "DELETE", url: `/api/v1/businesses/${biz.id}/media/${asset.id}`, headers: { authorization: `Bearer ${token}` } });
    expect(del.statusCode).toBe(200);
    const get = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/media/${asset.id}`, headers: { authorization: `Bearer ${token}` } });
    expect(get.statusCode).toBe(404);
    const file = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/media/${asset.id}/file`, headers: { authorization: `Bearer ${token}` } });
    expect(file.statusCode).toBe(404);
    const db = await prisma.mediaAsset.findUnique({ where: { id: asset.id } });
    expect(db?.deletedAt).not.toBeNull();
  });

  it("handles missing object (metadata exists but file missing)", async () => {
    const { token } = await signup(`m8${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const fd = makeForm("orphan.jpg", "image/jpeg", Buffer.from("orphan"));
    const up = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    const asset = JSON.parse(up.body).data;
    const { storage } = await import("../src/infrastructure/storage/LocalStorageAdapter.js");
    await storage.delete(asset.storageKey);
    const file = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/media/${asset.id}/file`, headers: { authorization: `Bearer ${token}` } });
    expect(file.statusCode).toBe(404);
    expect(JSON.parse(file.body).error.code).toBe("OBJECT_MISSING");
  });

  it("private file requires auth, public via slug allowed, cross-tenant denied", async () => {
    const a = await signup(`m9${Date.now()}@test.com`);
    const b = await signup(`m10${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    const fd = makeForm("priv.jpg", "image/jpeg", Buffer.from("private"));
    const up = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/media`, headers: { authorization: `Bearer ${a.token}` }, payload: fd });
    const asset = JSON.parse(up.body).data;
    const unauth = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/media/${asset.id}/file` });
    expect(unauth.statusCode).toBe(401);
    const cross = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/media/${asset.id}/file`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(cross.statusCode)).toBe(true);
    const pub = await app.inject({ method: "GET", url: `/api/v1/public/business/${bizA.slug}/media/${asset.id}/file` });
    expect([200, 403].includes(pub.statusCode)).toBe(true);
  });

  it("signed URL access works and rejects invalid/expired", async () => {
    const { token } = await signup(`m11${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const fd = makeForm("signed.jpg", "image/jpeg", Buffer.from("signed content"));
    const up = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    const asset = JSON.parse(up.body).data;
    const signed = asset.signedUrl as string;
    expect(signed).toBeTruthy();
    const ok = await app.inject({ method: "GET", url: signed });
    expect(ok.statusCode).toBe(200);
    const bad = await app.inject({ method: "GET", url: signed.replace(/sig=[^&]+/, "sig=badbadbadbadbadb") });
    expect(bad.statusCode).toBe(401);
  });

  it("storage key is tenant-scoped and opaque, not predictable global", async () => {
    const { token } = await signup(`m12${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const fd = makeForm("logo.png", "image/png", Buffer.from("logo"));
    const up = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    const asset = JSON.parse(up.body).data;
    expect(asset.storageKey).not.toBe("logo.png");
    expect(asset.storageKey).not.toBe("/uploads/logo.png");
    expect(asset.storageKey).toMatch(new RegExp(`^business/${biz.id}/media/`));
    expect(asset.storageKey).not.toContain("..");
  });

  it("does not expose storage credentials in API responses", async () => {
    const { token } = await signup(`m13${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const fd = makeForm("cred.jpg", "image/jpeg", Buffer.from("cred"));
    const up = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/media`, headers: { authorization: `Bearer ${token}` }, payload: fd });
    const body = JSON.stringify(JSON.parse(up.body));
    expect(body.toLowerCase()).not.toContain("secret");
    expect(body.toLowerCase()).not.toContain("bucket");
    expect(body).not.toContain("STORAGE_PATH");
  });
});
