import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import multipart from "@fastify/multipart";
import jwt from "@fastify/jwt";
import { mediaRoutes } from "../src/modules/media/media.routes.js";
import { prisma } from "../src/infrastructure/database/client.js";
import { cleanupDb } from "./helpers.js";
import { storage, buildStorageKey } from "../src/infrastructure/storage/LocalStorageAdapter.js";
import { randomUUID } from "crypto";

let app: any;
let token: string;
let userId: string;
let businessId: string;
let otherBusinessId: string;
let otherToken: string;

async function uploadFile(bizId: string, authToken: string, filename: string, mimeType: string, content: string) {
  const buf = Buffer.from(content);
  const boundary = "----TestBoundary" + randomUUID().slice(0, 8);
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  const payload = Buffer.concat([Buffer.from(header), buf, Buffer.from(footer)]);
  return app.inject({
    method: "POST",
    url: `/api/v1/businesses/${bizId}/media`,
    headers: {
      authorization: `Bearer ${authToken}`,
      "content-type": `multipart/form-data; boundary=${boundary}`,
      "content-length": String(payload.length),
    },
    payload,
  });
}

beforeAll(async () => {
  await cleanupDb();
  app = Fastify({ logger: false });
  await app.register(multipart, { limits: { fileSize: 60 * 1024 * 1024 } });
  await app.register(jwt, { secret: "test-secret-32-chars-minimum!!" });
  (app as any).authenticate = async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
      (req as any).userId = req.user.id;
    } catch { reply.code(401).send({ error: "Unauthorized" }); }
  };
  app.register(mediaRoutes);
  await app.ready();

  const user = await prisma.user.create({ data: { email: "media-test@test.com", passwordHash: "hash", displayName: "Media Tester" } });
  userId = user.id;
  token = app.jwt.sign({ id: userId, email: user.email });
  const ws = await prisma.workspace.create({ data: { name: "Media WS", slug: "media-ws", ownerUserId: userId } });
  const biz = await prisma.business.create({ data: { workspaceId: ws.id, name: "Media Biz", slug: "media-biz", phone: "+1234567890", email: "m@b.test", timezone: "UTC", currency: "USD", locale: "en-US", status: "active", createdBy: userId } });
  businessId = biz.id;

  const otherUser = await prisma.user.create({ data: { email: "other-media@test.com", passwordHash: "hash" } });
  otherToken = app.jwt.sign({ id: otherUser.id, email: otherUser.email });
  const otherWs = await prisma.workspace.create({ data: { name: "Other", slug: "other-media-ws", ownerUserId: otherUser.id } });
  const otherBiz = await prisma.business.create({ data: { workspaceId: otherWs.id, name: "Other", slug: "other-media-biz", phone: "+1234567890", email: "o@b.test", timezone: "UTC", currency: "USD", locale: "en-US", status: "active", createdBy: otherUser.id } });
  otherBusinessId = otherBiz.id;
});

afterAll(async () => { await app?.close(); });

describe("Media Routes", () => {
  it("uploads an image and returns metadata", async () => {
    const res = await uploadFile(businessId, token, "photo.jpg", "image/jpeg", "fake-jpeg-data");
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.mimeType).toBe("image/jpeg");
    expect(body.data.mediaType).toBe("IMAGE");
    expect(body.data.fileName).toBe("photo.jpg");
    expect(body.data.businessId).toBe(businessId);
    expect(body.data.signedUrl).toBeDefined();
  });

  it("uploads a video and detects VIDEO mediaType", async () => {
    const res = await uploadFile(businessId, token, "hero.mp4", "video/mp4", "fake-mp4-data");
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    expect(body.data.mediaType).toBe("VIDEO");
    expect(body.data.mimeType).toBe("video/mp4");
  });

  it("uploads a WebM video", async () => {
    const res = await uploadFile(businessId, token, "clip.webm", "video/webm", "fake-webm-data");
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    expect(body.data.mediaType).toBe("VIDEO");
  });

  it("uploads a PDF as DOCUMENT", async () => {
    const res = await uploadFile(businessId, token, "menu.pdf", "application/pdf", "fake-pdf-data");
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    expect(body.data.mediaType).toBe("DOCUMENT");
  });

  it("lists all media for a business", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${businessId}/media`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("filters media by type", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${businessId}/media?mediaType=VIDEO`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.every((a: any) => a.mediaType === "VIDEO")).toBe(true);
  });

  it("updates asset metadata", async () => {
    const list = await app.inject({ method: "GET", url: `/api/v1/businesses/${businessId}/media?mediaType=IMAGE`, headers: { authorization: `Bearer ${token}` } });
    const assets = JSON.parse(list.body).data;
    const img = assets[0];
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${businessId}/media/${img.id}`,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      payload: { altText: "Restaurant photo", title: "Hero Image", width: 1920, height: 1080, duration: 30.5 },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.altText).toBe("Restaurant photo");
    expect(body.data.title).toBe("Hero Image");
    expect(body.data.width).toBe(1920);
    expect(body.data.height).toBe(1080);
    expect(body.data.duration).toBe(30.5);
  });

  it("rejects exe file", async () => {
    const res = await uploadFile(businessId, token, "virus.exe", "application/x-executable", "MZ-header");
    expect(res.statusCode).toBe(400);
  });

  it("rejects path traversal in filename", async () => {
    const res = await uploadFile(businessId, token, "../../../etc/passwd", "image/jpeg", "data");
    expect(res.statusCode).toBe(400);
  });

  it("cannot access another business media", async () => {
    const upload = await uploadFile(otherBusinessId, otherToken, "secret.jpg", "image/jpeg", "secret-data");
    const uploadedId = JSON.parse(upload.body).data.id;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${businessId}/media/${uploadedId}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("cannot use another business media on own website", async () => {
    const upload = await uploadFile(otherBusinessId, otherToken, "private.png", "image/png", "private-data");
    const privateId = JSON.parse(upload.body).data.id;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${businessId}/media/${privateId}/file`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("deletes own unused asset", async () => {
    const upload = await uploadFile(businessId, token, "todelete.png", "image/png", "delete-me");
    const id = JSON.parse(upload.body).data.id;
    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/businesses/${businessId}/media/${id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.deleted).toBe(true);
  });

  it("streams file content via /file endpoint", async () => {
    const upload = await uploadFile(businessId, token, "stream-test.jpg", "image/jpeg", "stream-content");
    const id = JSON.parse(upload.body).data.id;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${businessId}/media/${id}/file`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toBe("image/jpeg");
  });
});
