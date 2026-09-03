import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { cleanupDb, createTestApp } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;

beforeAll(async () => { app = await createTestApp(); });
afterAll(async () => { await app.close(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanupDb(); });

async function setupBusiness(email: string) {
  const signup = await app.inject({ method: "POST", url: "/api/v1/auth/signup", payload: { email, password: "password123" } });
  const { token } = JSON.parse(signup.body).data;
  const business = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name: `Product business ${email}` } });
  return { token, business: JSON.parse(business.body).data };
}

describe("Products — stock quantity validation", () => {
  it("rejects product creation with negative stockQuantity", async () => {
    const { token, business } = await setupBusiness("stock-neg@test.com");
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${business.id}/products`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Bad Stock", price: 100, stockQuantity: -5 },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects product update with negative stockQuantity", async () => {
    const { token, business } = await setupBusiness("stock-neg-upd@test.com");
    const create = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${business.id}/products`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Good Stock", price: 100, stockQuantity: 10 },
    });
    expect(create.statusCode).toBe(201);
    const product = JSON.parse(create.body).data;

    const upd = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/products/${product.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { stockQuantity: -10 },
    });
    expect(upd.statusCode).toBe(422);
  });

  it("accepts product creation with stockQuantity = 0", async () => {
    const { token, business } = await setupBusiness("stock-zero@test.com");
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${business.id}/products`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Zero Stock Product", price: 100, stockQuantity: 0 },
    });
    expect(res.statusCode).toBe(201);
    const product = JSON.parse(res.body).data;
    expect(product.stockQuantity).toBe(0);
  });

  it("accepts product creation with positive stockQuantity", async () => {
    const { token, business } = await setupBusiness("stock-pos@test.com");
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${business.id}/products`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Stocked Product", price: 100, stockQuantity: 50 },
    });
    expect(res.statusCode).toBe(201);
    const product = JSON.parse(res.body).data;
    expect(product.stockQuantity).toBe(50);
  });

  it("accepts product creation with stockQuantity omitted (null)", async () => {
    const { token, business } = await setupBusiness("stock-null@test.com");
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${business.id}/products`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "No Stock Tracked", price: 100 },
    });
    expect(res.statusCode).toBe(201);
    const product = JSON.parse(res.body).data;
    expect(product.stockQuantity).toBeNull();
  });

  it("allows update with valid non-negative stockQuantity", async () => {
    const { token, business } = await setupBusiness("stock-valid-update@test.com");
    const create = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${business.id}/products`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Stocked Item", price: 100, stockQuantity: 10 },
    });
    expect(create.statusCode).toBe(201);
    const product = JSON.parse(create.body).data;

    const upd = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/products/${product.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { stockQuantity: 25 },
    });
    expect(upd.statusCode).toBe(200);
    expect(JSON.parse(upd.body).data.stockQuantity).toBe(25);
  });
});

describe("Products — tenant-scoped deletion", () => {
  it("does not soft-delete another business's product", async () => {
    const a = await setupBusiness(`product-a-${Date.now()}@test.com`);
    const b = await setupBusiness(`product-b-${Date.now()}@test.com`);
    const create = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${a.business.id}/products`,
      headers: { authorization: `Bearer ${a.token}` },
      payload: { name: "Business A product", price: 100, status: "active", availability: "available" },
    });
    expect(create.statusCode).toBe(201);
    const product = JSON.parse(create.body).data;

    const removeAsB = await app.inject({
      method: "DELETE",
      url: `/api/v1/businesses/${b.business.id}/products/${product.id}`,
      headers: { authorization: `Bearer ${b.token}` },
    });
    expect(removeAsB.statusCode).toBe(404);

    const getAsA = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${a.business.id}/products/${product.id}`,
      headers: { authorization: `Bearer ${a.token}` },
    });
    expect(getAsA.statusCode).toBe(200);
    expect(JSON.parse(getAsA.body).data.deletedAt).toBeNull();
  });
});
