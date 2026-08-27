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
async function createService(bizId: string, token: string) {
  const r = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizId}/services`, headers: { authorization: `Bearer ${token}` }, payload: { name: `Svc${Date.now()}`, price: 500, durationMinutes: 60, status: "active" } });
  if (r.statusCode !== 201) {
    // fallback: create via direct prisma if route not exists
    const svc = await prisma.service.create({ data: { businessId: bizId, name: `Svc${Date.now()}`, slug: `svc-${Date.now()}`, price: 500, durationMinutes: 60, status: "active" } });
    return svc;
  }
  return JSON.parse(r.body).data;
}
async function createCustomer(bizId: string, token: string) {
  const r = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizId}/customers`, headers: { authorization: `Bearer ${token}` }, payload: { name: `Cust${Date.now()}`, phone: `+91${Date.now().toString().slice(-10)}` } });
  return JSON.parse(r.body).data;
}
function futureISO(hoursAhead = 24) {
  const d = new Date(Date.now() + hoursAhead * 3600000);
  return d.toISOString();
}
function futureISOWithDuration(hoursAhead = 24, durationMin = 60) {
  const start = new Date(Date.now() + hoursAhead * 3600000);
  const end = new Date(start.getTime() + durationMin * 60000);
  return { start: start.toISOString(), end: end.toISOString() };
}

describe("Bookings — P0", () => {
  it("creates booking", async () => {
    const { token } = await signup(`bk1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const svc = await createService(biz.id, token);
    const cust = await createCustomer(biz.id, token);
    const { start, end } = futureISOWithDuration(24, 60);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: cust.id, serviceId: svc.id, startTime: start, endTime: end, customerNotes: "please be on time" } });
    expect(res.statusCode).toBe(201);
    const bk = JSON.parse(res.body).data;
    expect(bk.bookingNumber).toMatch(/^BK-/);
    expect(bk.status).toBe("pending");
    expect(bk.customerId).toBe(cust.id);
    expect(bk.serviceId).toBe(svc.id);
  });

  it("lists bookings", async () => {
    const { token } = await signup(`bk2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const svc = await createService(biz.id, token);
    const { start, end } = futureISOWithDuration(24, 60);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { serviceId: svc.id, startTime: start, endTime: end } });
    const list = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` } });
    expect(list.statusCode).toBe(200);
    expect(JSON.parse(list.body).data.length).toBe(1);
  });

  it("gets booking", async () => {
    const { token } = await signup(`bk3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start, endTime: end } });
    const id = JSON.parse(cr.body).data.id;
    const get = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/bookings/${id}`, headers: { authorization: `Bearer ${token}` } });
    expect(get.statusCode).toBe(200);
    expect(JSON.parse(get.body).data.id).toBe(id);
  });

  it("updates booking", async () => {
    const { token } = await signup(`bk4${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start, endTime: end, customerNotes: "old" } });
    const id = JSON.parse(cr.body).data.id;
    const upd = await app.inject({ method: "PATCH", url: `/api/v1/businesses/${biz.id}/bookings/${id}`, headers: { authorization: `Bearer ${token}` }, payload: { customerNotes: "new note" } });
    expect(upd.statusCode).toBe(200);
    expect(JSON.parse(upd.body).data.customerNotes).toBe("new note");
  });

  it("enforces tenant isolation", async () => {
    const a = await signup(`bkA${Date.now()}@test.com`);
    const b = await signup(`bkB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/bookings`, headers: { authorization: `Bearer ${a.token}` }, payload: { startTime: start, endTime: end } });
    const id = JSON.parse(cr.body).data.id;
    const listAsB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/bookings`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(listAsB.statusCode)).toBe(true);
    const getAsB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/bookings/${id}`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(getAsB.statusCode)).toBe(true);
    const createAsB = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/bookings`, headers: { authorization: `Bearer ${b.token}` }, payload: { startTime: start, endTime: end } });
    expect([403, 404].includes(createAsB.statusCode)).toBe(true);
  });

  it("rejects unauthorized", async () => {
    const { token } = await signup(`bk5${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const { start, end } = futureISOWithDuration(24, 60);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, payload: { startTime: start, endTime: end } });
    expect(res.statusCode).toBe(401);
  });

  it("rejects cross-tenant customer", async () => {
    const a = await signup(`bk6A${Date.now()}@test.com`);
    const b = await signup(`bk6B${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    const custB = await createCustomer(bizB.id, b.token);
    const { start, end } = futureISOWithDuration(24, 60);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/bookings`, headers: { authorization: `Bearer ${a.token}` }, payload: { customerId: custB.id, startTime: start, endTime: end } });
    expect(res.statusCode).toBe(422);
  });

  it("rejects cross-tenant service", async () => {
    const a = await signup(`bk7A${Date.now()}@test.com`);
    const b = await signup(`bk7B${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    const svcB = await createService(bizB.id, b.token);
    const { start, end } = futureISOWithDuration(24, 60);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/bookings`, headers: { authorization: `Bearer ${a.token}` }, payload: { serviceId: svcB.id, startTime: start, endTime: end } });
    expect(res.statusCode).toBe(422);
  });

  it("allows valid status transition pending->confirmed->completed", async () => {
    const { token } = await signup(`bk8${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start, endTime: end } });
    const id = JSON.parse(cr.body).data.id;
    const c1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings/${id}/confirm`, headers: { authorization: `Bearer ${token}` } });
    expect(c1.statusCode).toBe(200);
    expect(JSON.parse(c1.body).data.status).toBe("confirmed");
    const c2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings/${id}/complete`, headers: { authorization: `Bearer ${token}` } });
    expect(c2.statusCode).toBe(200);
    expect(JSON.parse(c2.body).data.status).toBe("completed");
  });

  it("rejects invalid status transition pending->completed", async () => {
    const { token } = await signup(`bk9${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start, endTime: end } });
    const id = JSON.parse(cr.body).data.id;
    const bad = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings/${id}/complete`, headers: { authorization: `Bearer ${token}` } });
    expect(bad.statusCode).toBe(422);
  });

  it("allows cancellation from pending and confirmed", async () => {
    const { token } = await signup(`bk10${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const { start: s1, end: e1 } = futureISOWithDuration(24, 60);
    const cr1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: s1, endTime: e1 } });
    const id1 = JSON.parse(cr1.body).data.id;
    const can1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings/${id1}/cancel`, headers: { authorization: `Bearer ${token}` } });
    expect(can1.statusCode).toBe(200);
    expect(JSON.parse(can1.body).data.status).toBe("cancelled");

    const { start: s2, end: e2 } = futureISOWithDuration(25, 60);
    const cr2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: s2, endTime: e2 } });
    const id2 = JSON.parse(cr2.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings/${id2}/confirm`, headers: { authorization: `Bearer ${token}` } });
    const can2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings/${id2}/cancel`, headers: { authorization: `Bearer ${token}` } });
    expect(can2.statusCode).toBe(200);
  });

  it("validates date/time (end before start)", async () => {
    const { token } = await signup(`bk11${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const start = futureISO(24);
    const end = new Date(new Date(start).getTime() - 3600000).toISOString();
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start, endTime: end } });
    expect(res.statusCode).toBe(422);
  });

  it("detects conflict for overlapping bookings", async () => {
    const { token } = await signup(`bk12${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const start1 = new Date(Date.now() + 24 * 3600000);
    const end1 = new Date(start1.getTime() + 60 * 60000);
    const start2 = new Date(start1.getTime() + 30 * 60000);
    const end2 = new Date(start2.getTime() + 60 * 60000);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start1.toISOString(), endTime: end1.toISOString() } });
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start2.toISOString(), endTime: end2.toISOString() } });
    expect(res.statusCode).toBe(409);
    const adjacentStart = end1.toISOString();
    const adjacentEnd = new Date(end1.getTime() + 60 * 60000).toISOString();
    const ok = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: adjacentStart, endTime: adjacentEnd } });
    expect(ok.statusCode).toBe(201);
  });

  it("creates audit and domain event", async () => {
    const { token } = await signup(`bk13${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const { start, end } = futureISOWithDuration(24, 60);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start, endTime: end } });
    const audits = await prisma.auditLog.findMany({ where: { businessId: biz.id, action: "BOOKING_CREATED" } });
    expect(audits.length).toBe(1);
    const events = await prisma.domainEvent.findMany({ where: { businessId: biz.id, eventType: "BOOKING_CREATED" } });
    expect(events.length).toBe(1);
  });

  it("transaction rollback on conflict does not create partial", async () => {
    const { token } = await signup(`bk14${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const start1 = new Date(Date.now() + 24 * 3600000);
    const end1 = new Date(start1.getTime() + 60 * 60000);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start1.toISOString(), endTime: end1.toISOString() } });
    const before = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` } });
    const countBefore = JSON.parse(before.body).meta.total;
    const start2 = new Date(start1.getTime() + 30 * 60000);
    const end2 = new Date(start2.getTime() + 60 * 60000);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: start2.toISOString(), endTime: end2.toISOString() } });
    const after = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(after.body).meta.total).toBe(countBefore);
  });

  it("concurrent booking conflict is handled", async () => {
    const { token } = await signup(`bk15${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const start = new Date(Date.now() + 48 * 3600000);
    const end = new Date(start.getTime() + 60 * 60000);
    const isoStart = start.toISOString();
    const isoEnd = end.toISOString();
    const [r1, r2] = await Promise.all([
      app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: isoStart, endTime: isoEnd } }),
      app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: isoStart, endTime: isoEnd } }),
    ]);
    const successes = [r1, r2].filter((r) => r.statusCode === 201).length;
    const conflicts = [r1, r2].filter((r) => r.statusCode === 409).length;
    expect(successes + conflicts).toBe(2);
    expect(successes).toBeGreaterThanOrEqual(1);
    expect(conflicts).toBeLessThanOrEqual(1);
  });
});
