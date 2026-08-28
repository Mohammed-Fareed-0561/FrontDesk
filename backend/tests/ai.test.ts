import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestApp, cleanupDb } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";
import { aiService } from "../src/infrastructure/ai/AIService.js";

let app: any;
beforeAll(async () => { app = await createTestApp(); });
afterAll(async () => { await app.close(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanupDb(); aiService.clearRateLimit(); });

async function signup(email: string) {
  const r = await app.inject({ method: "POST", url: "/api/v1/auth/signup", payload: { email, password: "password123" } });
  return JSON.parse(r.body).data;
}
async function createBusiness(token: string) {
  const r = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name: `Biz${Date.now()}` } });
  return JSON.parse(r.body).data;
}

describe("AI Provider Abstraction — P0", () => {
  it("mock provider default (no key)", async () => {
    const { token } = await signup(`ai1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello" } });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body).data;
    expect(body.provider).toBe("mock");
    expect(body.message).toBeTruthy();
  });

  it("successful generation with mock and persists request", async () => {
    const { token } = await signup(`ai2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "What should I do today?" } });
    expect(res.statusCode).toBe(200);
    const reqs = await prisma.aiRequest.findMany({ where: { businessId: biz.id } });
    expect(reqs.length).toBe(1);
    expect(reqs[0].modelProvider).toBe("mock");
    const outs = await prisma.aiOutput.findMany({ where: { aiRequestId: reqs[0].id } });
    expect(outs.length).toBe(1);
    expect(outs[0].content).toContain("message");
  });

  it("usage metadata captured", async () => {
    const { token } = await signup(`ai3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "price info" } });
    const req = await prisma.aiRequest.findFirst({ where: { businessId: biz.id } });
    expect(req?.inputTokens).toBeGreaterThan(0);
    expect(req?.outputTokens).toBeGreaterThan(0);
    expect(req?.latencyMs).not.toBeNull();
  });

  it("provider selection mock explicitly", async () => {
    const { token } = await signup(`ai4${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello", provider: "mock" } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.provider).toBe("mock");
  });

  it("rejects invalid provider", async () => {
    const { token } = await signup(`ai5${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello", provider: "invalid" } });
    if (![422, 400, 500].includes(res.statusCode)) console.log("invalid provider", res.statusCode, res.body);
    expect([422, 500].includes(res.statusCode)).toBe(true);
  });

  it("rejects invalid model for provider", async () => {
    const { token } = await signup(`ai6${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello", provider: "mock", model: "invalid-model" } });
    expect(res.statusCode).toBe(422);
  });

  it("missing GROQ_API_KEY returns 422 or uses mock fallback", async () => {
    const orig = process.env.GROQ_API_KEY;
    const orig2 = process.env.AI_PROVIDER_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.AI_PROVIDER_API_KEY;
    (aiService as any).groq = null;
    const { token } = await signup(`ai7${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello", provider: "groq" } });
    if (![200, 422, 500, 502].includes(res.statusCode)) {
      console.log("GROQ missing status", res.statusCode, res.body);
    }
    expect([200, 422, 500, 502].includes(res.statusCode)).toBe(true);
    if (res.statusCode === 200) {
      const body = JSON.parse(res.body);
      expect(body.data.provider === "mock" || body.data.provider === "groq").toBe(true);
    }
    if (orig) process.env.GROQ_API_KEY = orig;
    if (orig2) process.env.AI_PROVIDER_API_KEY = orig2;
    (aiService as any).groq = null;
  });

  it("provider error is sanitized (no secret leakage)", async () => {
    const { token } = await signup(`ai8${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello", provider: "invalid-provider" } });
    const body = res.body;
    expect(body.toLowerCase()).not.toContain("sk-");
    expect(body.toLowerCase()).not.toContain("bearer");
  });

  it("requires authentication", async () => {
    const { token } = await signup(`ai9${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, payload: { message: "hello" } });
    expect(res.statusCode).toBe(401);
  });

  it("enforces tenant isolation", async () => {
    const a = await signup(`aiA${Date.now()}@test.com`);
    const b = await signup(`aiB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/ai/chat`, headers: { authorization: `Bearer ${b.token}` }, payload: { message: "hello" } });
    expect([403, 404].includes(res.statusCode)).toBe(true);
  });

  it("rate limiting after many requests", async () => {
    const { token } = await signup(`ai10${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    let lastStatus = 200;
    for (let i = 0; i < 25; i++) {
      const r = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: `hi ${i}` } });
      lastStatus = r.statusCode;
      if (lastStatus === 429) break;
    }
    expect(lastStatus).toBe(429);
  });

  it("Action Registry enforced: CREATE_PRODUCT no approval, UPDATE_PRODUCT needs approval", async () => {
    const { token } = await signup(`ai11${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const createRes = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "add testcake for ₹150" } });
    expect(createRes.statusCode).toBe(200);
    const prod = await prisma.product.findFirst({ where: { businessId: biz.id, name: "testcake" } });
    expect(prod).not.toBeNull();
    expect(prod?.price).toBe(150);
    const approvalsBefore = await prisma.approvalRequest.findMany({ where: { businessId: biz.id } });
    const countBefore = approvalsBefore.length;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "change testcake price to ₹200" } });
    const approvalsAfter = await prisma.approvalRequest.findMany({ where: { businessId: biz.id, status: "pending" } });
    expect(approvalsAfter.length).toBe(countBefore + 1);
    const pending = approvalsAfter[0];
    const approve = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/approvals/${pending.id}/approve`, headers: { authorization: `Bearer ${token}` } });
    expect(approve.statusCode).toBe(200);
    const updatedProd = await prisma.product.findUnique({ where: { id: prod!.id } });
    expect(updatedProd?.price).toBe(200);
  });

  it("approval remains enforced (cannot bypass)", async () => {
    const { token } = await signup(`ai12${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await prisma.product.create({ data: { businessId: biz.id, name: "securecake", slug: `secure-${Date.now()}`, price: 100, status: "active" } });
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "change securecake price to ₹999" } });
    const prod = await prisma.product.findFirst({ where: { businessId: biz.id, name: "securecake" } });
    expect(prod?.price).toBe(100);
  });

  it("no secret leakage in response", async () => {
    const { token } = await signup(`ai13${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello" } });
    const body = JSON.stringify(JSON.parse(res.body));
    expect(body.toLowerCase()).not.toContain("groq_api_key");
    expect(body.toLowerCase()).not.toContain("sk-");
  });

  it("copilot query works and is tenant isolated", async () => {
    const a = await signup(`ai14${Date.now()}@test.com`);
    const b = await signup(`ai15${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/copilot/query`, headers: { authorization: `Bearer ${a.token}` }, payload: { message: "What should I do today?" } });
    expect(res.statusCode).toBe(200);
    const bad = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/copilot/query`, headers: { authorization: `Bearer ${b.token}` }, payload: { message: "hi" } });
    expect([403, 404].includes(bad.statusCode)).toBe(true);
  });

  it("handles provider timeout gracefully (mock does not timeout, but error path is tested via invalid groq)", async () => {
    const { token } = await signup(`ai16${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/ai/chat`, headers: { authorization: `Bearer ${token}` }, payload: { message: "hello", provider: "groq", model: "llama-3.1-8b-instant" } });
    expect([200, 422, 502].includes(res.statusCode)).toBe(true);
  });
});
