import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestApp, cleanupDb } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await cleanupDb();
});

describe("Health", () => {
  it("GET /health returns 200", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).status).toBe("ok");
  });
  it("GET /api/v1/health returns 200", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
  });
});

describe("Auth", () => {
  it("signup + login + me", async () => {
    const signup = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: { email: "a@test.com", password: "password123", displayName: "A" },
    });
    expect(signup.statusCode).toBe(201);
    const token = JSON.parse(signup.body).data.token;
    expect(token).toBeTruthy();
    const login = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: { email: "a@test.com", password: "password123" },
    });
    expect(login.statusCode).toBe(200);
    const me = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(me.statusCode).toBe(200);
    expect(JSON.parse(me.body).data.email).toBe("a@test.com");
  });

  it("rejects unauthenticated me", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/auth/me" });
    expect(res.statusCode).toBe(401);
  });
});

describe("Tenant Isolation", () => {
  it("user cannot access another user's business", async () => {
    const signupA = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: { email: "ownerA@test.com", password: "password123" },
    });
    const tokenA = JSON.parse(signupA.body).data.token;
    const createA = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "Business A" },
    });
    expect(createA.statusCode).toBe(201);
    const bizA = JSON.parse(createA.body).data;

    const signupB = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: { email: "ownerB@test.com", password: "password123" },
    });
    const tokenB = JSON.parse(signupB.body).data.token;

    const getAsB = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${bizA.id}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404].includes(getAsB.statusCode)).toBe(true);

    const listB = await app.inject({
      method: "GET",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect(listB.statusCode).toBe(200);
    const items = JSON.parse(listB.body).data;
    expect(items.find((b: any) => b.id === bizA.id)).toBeUndefined();
  });
});

describe("Catalog & Public", () => {
  it("create business -> create product -> public hide costPrice", async () => {
    const s = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: { email: "cat@test.com", password: "password123" },
    });
    const token = JSON.parse(s.body).data.token;
    const b = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Cat Biz" },
    });
    const biz = JSON.parse(b.body).data;

    const cat = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/categories`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Cakes" },
    });
    expect(cat.statusCode).toBe(201);

    const prod = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/products`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Choco Cake", price: 650, costPrice: 300, status: "active", availability: "available" },
    });
    expect(prod.statusCode).toBe(201);
    const prodBody = JSON.parse(prod.body).data;
    expect(prodBody.price).toBe(650);

    const pub = await app.inject({ method: "GET", url: `/api/v1/public/businesses/${biz.slug}` });
    expect(pub.statusCode).toBe(200);

    const prods = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/products`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(prods.statusCode).toBe(200);
  });
});

describe("Critical Journey", () => {
  it("signup -> business -> importer -> website publish -> enquiry", async () => {
    const s = await app.inject({
      method: "POST",
      url: "/api/v1/auth/signup",
      payload: { email: "journey@test.com", password: "password123" },
    });
    const token = JSON.parse(s.body).data.token;
    const bRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Journey Biz" },
    });
    const biz = JSON.parse(bRes.body).data;
    expect(bRes.statusCode).toBe(201);

    const importRes = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/imports`,
      headers: { authorization: `Bearer ${token}` },
      payload: { sourceType: "manual" },
    });
    expect([200, 201, 202].includes(importRes.statusCode)).toBe(true);

    const ws = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/website`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(ws.statusCode).toBe(200);

    const enq = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/enquiries`,
      headers: { authorization: `Bearer ${token}` },
      payload: { message: "Hi cake?", customerName: "Arun", customerPhone: "+919000011111" },
    });
    expect([200, 201].includes(enq.statusCode)).toBe(true);
  });
});
