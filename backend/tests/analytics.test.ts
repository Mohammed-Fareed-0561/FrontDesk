import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { cleanupDb, createTestApp } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;

beforeAll(async () => { app = await createTestApp(); });
afterAll(async () => { await app.close(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanupDb(); });

async function signup(email: string) {
  const response = await app.inject({ method: "POST", url: "/api/v1/auth/signup", payload: { email, password: "password123" } });
  return JSON.parse(response.body).data;
}

async function createBusiness(token: string) {
  const response = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name: `Analytics ${Date.now()}` } });
  return JSON.parse(response.body).data;
}

describe("Analytics overview", () => {
  it("reports only successfully paid payment amounts as revenue", async () => {
    const { token } = await signup(`analytics-${Date.now()}@test.com`);
    const business = await createBusiness(token);
    await prisma.product.create({ data: { businessId: business.id, name: "Service", slug: `service-${Date.now()}`, price: 250, status: "active" } });
    const order = await prisma.order.create({ data: { businessId: business.id, orderNumber: `ORD-${Date.now()}`, currency: "INR", subtotal: 500, totalAmount: 500 } });
    await prisma.payment.createMany({ data: [
      { businessId: business.id, orderId: order.id, paymentNumber: `PAY-PAID-${Date.now()}`, amount: 500, status: "paid" },
      { businessId: business.id, orderId: order.id, paymentNumber: `PAY-PENDING-${Date.now()}`, amount: 250, status: "pending" },
    ] });
    const other = await signup(`analytics-other-${Date.now()}@test.com`);
    const otherBusiness = await createBusiness(other.token);
    const otherOrder = await prisma.order.create({ data: { businessId: otherBusiness.id, orderNumber: `ORD-OTHER-${Date.now()}`, currency: "INR", subtotal: 900, totalAmount: 900 } });
    await prisma.payment.create({ data: { businessId: otherBusiness.id, orderId: otherOrder.id, paymentNumber: `PAY-OTHER-${Date.now()}`, amount: 900, status: "paid" } });

    const response = await app.inject({ method: "GET", url: `/api/v1/businesses/${business.id}/analytics/overview`, headers: { authorization: `Bearer ${token}` } });

    expect(response.statusCode).toBe(200);
    const overview = JSON.parse(response.body).data;
    expect(overview.counts.products).toBe(1);
    expect(overview.financials.paidRevenue).toBe(500);
  });
});
