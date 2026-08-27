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

async function createBusinessWithProducts(token: string) {
  const bRes = await app.inject({
    method: "POST",
    url: "/api/v1/businesses",
    headers: { authorization: `Bearer ${token}` },
    payload: { name: `Biz${Date.now()}${Math.random().toString(36).slice(2, 4)}` },
  });
  const biz = JSON.parse(bRes.body).data;
  const p1 = await app.inject({
    method: "POST",
    url: `/api/v1/businesses/${biz.id}/products`,
    headers: { authorization: `Bearer ${token}` },
    payload: { name: `Cake${Date.now()}`, price: 650, status: "active", availability: "available" },
  });
  const prod1 = JSON.parse(p1.body).data;
  const p2 = await app.inject({
    method: "POST",
    url: `/api/v1/businesses/${biz.id}/products`,
    headers: { authorization: `Bearer ${token}` },
    payload: { name: `Puff${Date.now()}`, price: 35, status: "active", availability: "available" },
  });
  const prod2 = JSON.parse(p2.body).data;
  return { biz, prod1, prod2 };
}

async function signup(email: string) {
  const r = await app.inject({ method: "POST", url: "/api/v1/auth/signup", payload: { email, password: "password123" } });
  return JSON.parse(r.body).data;
}

describe("Orders — creation", () => {
  it("creates order with single item, server-side totals", async () => {
    const { token } = await signup(`o1${Date.now()}@test.com`);
    const { biz, prod1 } = await createBusinessWithProducts(token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 2 }] },
    });
    expect(res.statusCode).toBe(201);
    const order = JSON.parse(res.body).data;
    expect(order.status).toBe("pending");
    expect(order.paymentStatus).toBe("unpaid");
    expect(order.subtotal).toBe(1300);
    expect(order.totalAmount).toBe(1300);
    expect(order.items.length).toBe(1);
    expect(order.items[0].unitPrice).toBe(650);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].nameSnapshot).toBe(prod1.name);
  });

  it("creates order with multiple items, calculates totals correctly and ignores client unitPrice", async () => {
    const { token } = await signup(`o2${Date.now()}@test.com`);
    const { biz, prod1, prod2 } = await createBusinessWithProducts(token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        items: [
          { productId: prod1.id, quantity: 2, unitPrice: 1 },
          { productId: prod2.id, quantity: 3, unitPrice: 9999 },
        ],
      },
    });
    expect(res.statusCode).toBe(201);
    const order = JSON.parse(res.body).data;
    expect(order.subtotal).toBe(650 * 2 + 35 * 3);
    expect(order.items[0].unitPrice).toBe(650);
    expect(order.items[1].unitPrice).toBe(35);
  });

  it("validates quantity >0", async () => {
    const { token } = await signup(`o3${Date.now()}@test.com`);
    const { biz, prod1 } = await createBusinessWithProducts(token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 0 }] },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects invalid product", async () => {
    const { token } = await signup(`o4${Date.now()}@test.com`);
    const { biz } = await createBusinessWithProducts(token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: "nonexistent", quantity: 1 }] },
    });
    expect(res.statusCode).toBe(422);
  });

  it("prevents cross-business product injection", async () => {
    const a = await signup(`a${Date.now()}@test.com`);
    const b = await signup(`b${Date.now()}@test.com`);
    const { biz: bizA, prod1: prodA } = await createBusinessWithProducts(a.token);
    const { biz: bizB } = await createBusinessWithProducts(b.token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${bizB.id}/orders`,
      headers: { authorization: `Bearer ${b.token}` },
      payload: { items: [{ productId: prodA.id, quantity: 1 }] },
    });
    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.body);
    const msg = body.message || body.error?.message || JSON.stringify(body);
    expect(msg.toLowerCase()).toMatch(/not found|business/i);
  });

  it("enforces tenant isolation on list/get", async () => {
    const a = await signup(`isoA${Date.now()}@test.com`);
    const b = await signup(`isoB${Date.now()}@test.com`);
    const { biz: bizA, prod1 } = await createBusinessWithProducts(a.token);
    const orderRes = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${bizA.id}/orders`,
      headers: { authorization: `Bearer ${a.token}` },
      payload: { items: [{ productId: prod1.id, quantity: 1 }] },
    });
    const order = JSON.parse(orderRes.body).data;
    const listAsB = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${bizA.id}/orders`,
      headers: { authorization: `Bearer ${b.token}` },
    });
    expect([403, 404].includes(listAsB.statusCode)).toBe(true);
    const getAsB = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${bizA.id}/orders/${order.id}`,
      headers: { authorization: `Bearer ${b.token}` },
    });
    expect([403, 404].includes(getAsB.statusCode)).toBe(true);
  });
});

describe("Orders — status transitions", () => {
  it("allows valid transitions pending->confirmed->completed", async () => {
    const { token } = await signup(`st1${Date.now()}@test.com`);
    const { biz, prod1 } = await createBusinessWithProducts(token);
    const o = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 1 }] },
    });
    const order = JSON.parse(o.body).data;
    const c1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/confirm`, headers: { authorization: `Bearer ${token}` } });
    expect(c1.statusCode).toBe(200);
    expect(JSON.parse(c1.body).data.status).toBe("confirmed");
    const c2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/complete`, headers: { authorization: `Bearer ${token}` } });
    expect(c2.statusCode).toBe(200);
    expect(JSON.parse(c2.body).data.status).toBe("completed");
    expect(JSON.parse(c2.body).data.completedAt).toBeTruthy();
  });

  it("allows cancellation from pending and confirmed", async () => {
    const { token } = await signup(`st2${Date.now()}@test.com`);
    const { biz, prod1 } = await createBusinessWithProducts(token);
    const o1 = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 1 }] },
    });
    const id1 = JSON.parse(o1.body).data.id;
    const cancel1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${id1}/cancel`, headers: { authorization: `Bearer ${token}` } });
    expect(cancel1.statusCode).toBe(200);
    expect(JSON.parse(cancel1.body).data.status).toBe("cancelled");

    const o2 = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 1 }] },
    });
    const id2 = JSON.parse(o2.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${id2}/confirm`, headers: { authorization: `Bearer ${token}` } });
    const cancel2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${id2}/cancel`, headers: { authorization: `Bearer ${token}` } });
    expect(cancel2.statusCode).toBe(200);
    expect(JSON.parse(cancel2.body).data.cancelledAt).toBeTruthy();
  });

  it("rejects invalid transitions", async () => {
    const { token } = await signup(`st3${Date.now()}@test.com`);
    const { biz, prod1 } = await createBusinessWithProducts(token);
    const o = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 1 }] },
    });
    const id = JSON.parse(o.body).data.id;
    const bad = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${id}/complete`, headers: { authorization: `Bearer ${token}` } });
    expect(bad.statusCode).toBe(422);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${id}/confirm`, headers: { authorization: `Bearer ${token}` } });
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${id}/complete`, headers: { authorization: `Bearer ${token}` } });
    const bad2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${id}/cancel`, headers: { authorization: `Bearer ${token}` } });
    expect(bad2.statusCode).toBe(422);
  });

  it("is transactional — partial orders not created on invalid item", async () => {
    const { token } = await signup(`tx${Date.now()}@test.com`);
    const { biz, prod1 } = await createBusinessWithProducts(token);
    const before = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/orders`, headers: { authorization: `Bearer ${token}` } });
    const countBefore = JSON.parse(before.body).meta.total;
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 1 }, { productId: "bad", quantity: 1 }] },
    });
    expect(res.statusCode).toBe(422);
    const after = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/orders`, headers: { authorization: `Bearer ${token}` } });
    const countAfter = JSON.parse(after.body).meta.total;
    expect(countAfter).toBe(countBefore);
  });
});

describe("Orders — paymentStatus independence", () => {
  it("paymentStatus separate from order status", async () => {
    const { token } = await signup(`pay${Date.now()}@test.com`);
    const { biz, prod1 } = await createBusinessWithProducts(token);
    const o = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { items: [{ productId: prod1.id, quantity: 1 }] },
    });
    const order = JSON.parse(o.body).data;
    expect(order.paymentStatus).toBe("unpaid");
    expect(order.status).toBe("pending");
    const pay = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payment`,
      headers: { authorization: `Bearer ${token}` },
      payload: { paymentStatus: "paid" },
    });
    expect(pay.statusCode).toBe(200);
    expect(JSON.parse(pay.body).data.paymentStatus).toBe("paid");
    expect(JSON.parse(pay.body).data.status).toBe("pending");
    const confirm = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/confirm`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(confirm.body).data.paymentStatus).toBe("paid");
    expect(JSON.parse(confirm.body).data.status).toBe("confirmed");
  });
});
