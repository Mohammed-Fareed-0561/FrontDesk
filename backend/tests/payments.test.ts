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
  const r = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name: `Biz${Date.now()}${Math.random().toString(36).slice(2,4)}` } });
  return JSON.parse(r.body).data;
}
async function createProduct(bizId: string, token: string, price = 500) {
  const r = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizId}/products`, headers: { authorization: `Bearer ${token}` }, payload: { name: `Prod${Date.now()}`, price, status: "active" } });
  return JSON.parse(r.body).data;
}
async function createOrder(bizId: string, token: string, prodId: string) {
  const r = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizId}/orders`, headers: { authorization: `Bearer ${token}` }, payload: { items: [{ productId: prodId, quantity: 2 }] } });
  return JSON.parse(r.body).data;
}

describe("Payments — hardening P0", () => {
  it("creates payment with correct server-derived amount", async () => {
    const { token } = await signup(`pay1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token, 650);
    const order = await createOrder(biz.id, token, prod.id);
    expect(order.totalAmount).toBe(1300);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { paymentMethod: "CASH", status: "paid" } });
    expect(res.statusCode).toBe(201);
    const pay = JSON.parse(res.body).data;
    expect(pay.amount).toBe(1300);
    expect(pay.currency).toBe("INR");
    expect(pay.status).toBe("paid");
    expect(pay.businessId).toBe(biz.id);
    expect(pay.orderId).toBe(order.id);
    expect(pay.paymentNumber).toMatch(/^PAY-/);
  });

  it("rejects tampered amount", async () => {
    const { token } = await signup(`pay2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token, 500);
    const order = await createOrder(biz.id, token, prod.id);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { amount: 1, paymentMethod: "CASH" } });
    expect(res.statusCode).toBe(422);
    expect(JSON.parse(res.body).message || JSON.parse(res.body).error?.message).toMatch(/must be/i);
  });

  it("enforces tenant isolation on create/list/get", async () => {
    const a = await signup(`payA${Date.now()}@test.com`);
    const b = await signup(`payB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const prodA = await createProduct(bizA.id, a.token);
    const orderA = await createOrder(bizA.id, a.token, prodA.id);
    const payA = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/orders/${orderA.id}/payments`, headers: { authorization: `Bearer ${a.token}` }, payload: { paymentMethod: "UPI" } });
    expect(payA.statusCode).toBe(201);
    const pid = JSON.parse(payA.body).data.id;

    const listAsB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/payments`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(listAsB.statusCode)).toBe(true);

    const getAsB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/payments/${pid}`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(getAsB.statusCode)).toBe(true);

    const createAsB = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/orders/${orderA.id}/payments`, headers: { authorization: `Bearer ${b.token}` }, payload: { paymentMethod: "CASH" } });
    expect([403, 404].includes(createAsB.statusCode)).toBe(true);
  });

  it("requires authentication", async () => {
    const { token } = await signup(`pay3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, payload: { paymentMethod: "CASH" } });
    expect(res.statusCode).toBe(401);
  });

  it("allows valid payment status transition unpaid->paid", async () => {
    const { token } = await signup(`pay4${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    const payRes = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { status: "unpaid", paymentMethod: "CASH" } });
    const pay = JSON.parse(payRes.body).data;
    expect(pay.status).toBe("unpaid");
    const upd = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/payments/${pay.id}/status`, headers: { authorization: `Bearer ${token}` }, payload: { status: "paid" } });
    expect(upd.statusCode).toBe(200);
    expect(JSON.parse(upd.body).data.status).toBe("paid");
  });

  it("rejects invalid payment status transition paid->unpaid", async () => {
    const { token } = await signup(`pay5${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    const payRes = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { status: "paid", paymentMethod: "CASH" } });
    const pay = JSON.parse(payRes.body).data;
    const bad = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/payments/${pay.id}/status`, headers: { authorization: `Bearer ${token}` }, payload: { status: "unpaid" } });
    expect(bad.statusCode).toBe(422);
  });

  it("is idempotent with same idempotencyKey", async () => {
    const { token } = await signup(`pay6${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    const key = `idem-${Date.now()}-${Math.random()}`;
    const r1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}`, "idempotency-key": key }, payload: { paymentMethod: "UPI", transactionReference: "UPI123" } });
    expect(r1.statusCode).toBe(201);
    const id1 = JSON.parse(r1.body).data.id;
    const r2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}`, "idempotency-key": key }, payload: { paymentMethod: "UPI", transactionReference: "UPI123" } });
    expect([200, 201].includes(r2.statusCode)).toBe(true);
    const id2 = JSON.parse(r2.body).data.id;
    expect(id2).toBe(id1);
    const list = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/payments`, headers: { authorization: `Bearer ${token}` } });
    const payments = JSON.parse(list.body).data;
    const count = payments.filter((p: any) => p.idempotencyKey === key).length;
    expect(count).toBe(1);
  });

  it("prevents duplicate financial mutation with same idempotencyKey", async () => {
    const { token } = await signup(`pay7${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token, 300);
    const order = await createOrder(biz.id, token, prod.id);
    const key = `dup-${Date.now()}`;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { idempotencyKey: key, paymentMethod: "CASH" } });
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { idempotencyKey: key, paymentMethod: "CASH" } });
    const list = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/payments`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(list.body).meta.total).toBe(1);
  });

  it("creates audit event for payment", async () => {
    const { token } = await signup(`pay8${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { paymentMethod: "CASH" } });
    const audits = await prisma.auditLog.findMany({ where: { businessId: biz.id, action: "PAYMENT_CREATED" } });
    expect(audits.length).toBe(1);
    expect(JSON.parse(audits[0].afterData!).amount).toBe(order.totalAmount);
  });

  it("maintains payment/order relationship integrity and business ownership", async () => {
    const { token } = await signup(`pay9${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    const payRes = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { paymentMethod: "CARD" } });
    const pay = JSON.parse(payRes.body).data;
    expect(pay.businessId).toBe(biz.id);
    expect(pay.orderId).toBe(order.id);
    const dbPay = await prisma.payment.findUnique({ where: { id: pay.id } });
    expect(dbPay?.businessId).toBe(biz.id);
    expect(dbPay?.orderId).toBe(order.id);
  });

  it("keeps paymentStatus independent from order status", async () => {
    const { token } = await signup(`pay10${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    expect(order.status).toBe("pending");
    const payRes = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { status: "paid", paymentMethod: "UPI" } });
    expect(payRes.statusCode).toBe(201);
    const orderAfterPay = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/orders/${order.id}`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(orderAfterPay.body).data.paymentStatus).toBe("paid");
    expect(JSON.parse(orderAfterPay.body).data.status).toBe("pending");
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/confirm`, headers: { authorization: `Bearer ${token}` } });
    const orderAfterConfirm = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/orders/${order.id}`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(orderAfterConfirm.body).data.status).toBe("confirmed");
    expect(JSON.parse(orderAfterConfirm.body).data.paymentStatus).toBe("paid");
  });

  it("rejects refund in P0 (not implemented)", async () => {
    const { token } = await signup(`pay11${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const prod = await createProduct(biz.id, token);
    const order = await createOrder(biz.id, token, prod.id);
    const pay = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/orders/${order.id}/payments`, headers: { authorization: `Bearer ${token}` }, payload: { status: "paid" } });
    const pid = JSON.parse(pay.body).data.id;
    const refund = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/payments/${pid}/refund`, headers: { authorization: `Bearer ${token}` }, payload: {} });
    expect(refund.statusCode).toBe(422);
    expect(JSON.parse(refund.body).error.code).toBe("NOT_IMPLEMENTED");
  });
});
