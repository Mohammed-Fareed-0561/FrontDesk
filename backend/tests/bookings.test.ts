import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
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

async function waitFor<T>(read: () => Promise<T>, predicate: (value: T) => boolean, attempts = 100): Promise<T> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await read();
    if (predicate(value)) return value;
    await new Promise<void>((resolve) => setImmediate(resolve));
  }
  throw new Error(`Condition was not met after ${attempts} event-loop polls`);
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

  it("preserves the start-before-end invariant when rescheduling", async () => {
    const { token } = await signup(`bkDate${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const original = futureISOWithDuration(24, 60);
    const created = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings`,
      headers: { authorization: `Bearer ${token}` },
      payload: { startTime: original.start, endTime: original.end },
    });
    expect(created.statusCode).toBe(201);
    const booking = JSON.parse(created.body).data;

    const validStart = new Date(new Date(original.start).getTime() + 2 * 3600000);
    const validEnd = new Date(validStart.getTime() + 60 * 60000);
    const validPatch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { startTime: validStart.toISOString(), endTime: validEnd.toISOString() },
    });
    expect(validPatch.statusCode).toBe(200);
    expect(JSON.parse(validPatch.body).data.startTime).toBe(validStart.toISOString());
    expect(JSON.parse(validPatch.body).data.endTime).toBe(validEnd.toISOString());

    const invalidPatch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { startTime: validEnd.toISOString(), endTime: validStart.toISOString() },
    });
    expect(invalidPatch.statusCode).toBe(422);

    const persisted = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(persisted.startTime.toISOString()).toBe(validStart.toISOString());
    expect(persisted.endTime.toISOString()).toBe(validEnd.toISOString());
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

  it("rejects cross-tenant customer on PATCH reassignment", async () => {
    const a = await signup(`bk6PA${Date.now()}@test.com`);
    const b = await signup(`bk6PB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    const custB = await createCustomer(bizB.id, b.token);
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/bookings`, headers: { authorization: `Bearer ${a.token}` }, payload: { startTime: start, endTime: end } });
    expect(cr.statusCode).toBe(201);
    const id = JSON.parse(cr.body).data.id;
    const patch = await app.inject({ method: "PATCH", url: `/api/v1/businesses/${bizA.id}/bookings/${id}`, headers: { authorization: `Bearer ${a.token}` }, payload: { customerId: custB.id } });
    expect(patch.statusCode).toBe(422);
  });

  it("rejects soft-deleted customer on create", async () => {
    const { token } = await signup(`bkSD1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cust = await createCustomer(biz.id, token);
    const del = await app.inject({ method: "DELETE", url: `/api/v1/businesses/${biz.id}/customers/${cust.id}`, headers: { authorization: `Bearer ${token}` } });
    expect(del.statusCode).toBe(204);
    const { start, end } = futureISOWithDuration(24, 60);
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: cust.id, startTime: start, endTime: end } });
    expect(res.statusCode).toBe(422);
  });

  it("rejects soft-deleted customer on PATCH reassignment", async () => {
    const { token } = await signup(`bkSD2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const active = await createCustomer(biz.id, token);
    const deleted = await createCustomer(biz.id, token);
    await app.inject({ method: "DELETE", url: `/api/v1/businesses/${biz.id}/customers/${deleted.id}`, headers: { authorization: `Bearer ${token}` } });
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: active.id, startTime: start, endTime: end } });
    expect(cr.statusCode).toBe(201);
    const id = JSON.parse(cr.body).data.id;
    const patch = await app.inject({ method: "PATCH", url: `/api/v1/businesses/${biz.id}/bookings/${id}`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: deleted.id } });
    expect(patch.statusCode).toBe(422);
  });

  it("allows same-business active customer on PATCH reassignment", async () => {
    const { token } = await signup(`bkSD3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const custA = await createCustomer(biz.id, token);
    const custB = await createCustomer(biz.id, token);
    const { start, end } = futureISOWithDuration(24, 60);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: custA.id, startTime: start, endTime: end } });
    expect(cr.statusCode).toBe(201);
    const id = JSON.parse(cr.body).data.id;
    const patch = await app.inject({ method: "PATCH", url: `/api/v1/businesses/${biz.id}/bookings/${id}`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: custB.id } });
    expect(patch.statusCode).toBe(200);
    expect(JSON.parse(patch.body).data.customerId).toBe(custB.id);
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

  it("creates exactly one booking when identical requests race", async () => {
    const { token } = await signup(`bk16${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const start = new Date(Date.now() + 72 * 3600000);
    const end = new Date(start.getTime() + 60 * 60000);
    const payload = { startTime: start.toISOString(), endTime: end.toISOString() };
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload })
      )
    );
    expect(results.filter((r: any) => r.statusCode === 201).length).toBe(1);
    expect(results.filter((r: any) => r.statusCode === 409).length).toBe(4);
    const rows = await prisma.booking.findMany({ where: { businessId: biz.id } });
    expect(rows.length).toBe(1);
  });

  it("keeps concurrent slot claims isolated per business", async () => {
    const a = await signup(`bk17A${Date.now()}@test.com`);
    const b = await signup(`bk17B${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    const start = new Date(Date.now() + 96 * 3600000);
    const end = new Date(start.getTime() + 60 * 60000);
    const payload = { startTime: start.toISOString(), endTime: end.toISOString() };
    const [ra, rb] = await Promise.all([
      app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/bookings`, headers: { authorization: `Bearer ${a.token}` }, payload }),
      app.inject({ method: "POST", url: `/api/v1/businesses/${bizB.id}/bookings`, headers: { authorization: `Bearer ${b.token}` }, payload }),
    ]);
    expect(ra.statusCode).toBe(201);
    expect(rb.statusCode).toBe(201);
    expect((await prisma.booking.findMany({ where: { businessId: bizA.id } })).length).toBe(1);
    expect((await prisma.booking.findMany({ where: { businessId: bizB.id } })).length).toBe(1);
  });

  it("does not allow concurrent reschedules into the same slot", async () => {
    const { token } = await signup(`bk18${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const base = new Date(Date.now() + 120 * 3600000);
    const created = await Promise.all([0, 2, 4].map((offsetHours) => {
      const s = new Date(base.getTime() + offsetHours * 3600000);
      const e = new Date(s.getTime() + 60 * 60000);
      return app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/bookings`, headers: { authorization: `Bearer ${token}` }, payload: { startTime: s.toISOString(), endTime: e.toISOString() } });
    }));
    const ids = created.map((r: any) => JSON.parse(r.body).data.id);
    const target = new Date(base.getTime() + 10 * 3600000);
    const targetEnd = new Date(target.getTime() + 60 * 60000);
    const patch = { startTime: target.toISOString(), endTime: targetEnd.toISOString() };
    const results = await Promise.all(
      ids.map((id: string) =>
        app.inject({ method: "PATCH", url: `/api/v1/businesses/${biz.id}/bookings/${id}`, headers: { authorization: `Bearer ${token}` }, payload: patch })
      )
    );
    expect(results.filter((r: any) => r.statusCode === 200).length).toBe(1);
    expect(results.filter((r: any) => r.statusCode === 409).length).toBe(2);
    const inTargetSlot = await prisma.booking.findMany({ where: { businessId: biz.id, startTime: target } });
    expect(inTargetSlot.length).toBe(1);
  });
});

describe("Bookings — lifecycle integrity", () => {
  async function createPendingBooking(token: string, bizId: string, hoursAhead = 24) {
    const { start, end } = futureISOWithDuration(hoursAhead, 60);
    const cr = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${bizId}/bookings`,
      headers: { authorization: `Bearer ${token}` },
      payload: { startTime: start, endTime: end },
    });
    expect(cr.statusCode).toBe(201);
    return JSON.parse(cr.body).data;
  }

  it("allows confirmed -> no_show and sets terminal state", async () => {
    const { token } = await signup(`bkLife1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const booking = await createPendingBooking(token, biz.id);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/no-show`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.status).toBe("no_show");
  });

  it("rejects invalid transitions pending->no_show and no_show->confirmed", async () => {
    const { token } = await signup(`bkLife2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const pending = await createPendingBooking(token, biz.id);
    const badPending = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${pending.id}/no-show`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(badPending.statusCode).toBe(422);

    const confirmedBooking = await createPendingBooking(token, biz.id, 25);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${confirmedBooking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${confirmedBooking.id}/no-show`,
      headers: { authorization: `Bearer ${token}` },
    });
    const badNoShow = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${confirmedBooking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(badNoShow.statusCode).toBe(422);
  });

  it("rejects transitions from terminal states completed and cancelled", async () => {
    const { token } = await signup(`bkLife3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const completedBooking = await createPendingBooking(token, biz.id);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${completedBooking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${completedBooking.id}/complete`,
      headers: { authorization: `Bearer ${token}` },
    });
    for (const action of ["confirm", "cancel", "complete", "no-show"]) {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/bookings/${completedBooking.id}/${action}`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(422);
    }

    const cancelledBooking = await createPendingBooking(token, biz.id, 26);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${cancelledBooking.id}/cancel`,
      headers: { authorization: `Bearer ${token}` },
    });
    for (const action of ["confirm", "cancel", "complete", "no-show"]) {
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/bookings/${cancelledBooking.id}/${action}`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(422);
    }
  });

  it("rejects repeated transitions on the same terminal state", async () => {
    const { token } = await signup(`bkLife4${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const booking = await createPendingBooking(token, biz.id);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/cancel`,
      headers: { authorization: `Bearer ${token}` },
    });
    const repeat = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/cancel`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(repeat.statusCode).toBe(422);
  });

  it("rejects PATCH updates on terminal states including no_show", async () => {
    const { token } = await signup(`bkLife5${Date.now()}@test.com`);
    const biz = await createBusiness(token);

    const completedBooking = await createPendingBooking(token, biz.id);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${completedBooking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${completedBooking.id}/complete`,
      headers: { authorization: `Bearer ${token}` },
    });
    const completedPatch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/bookings/${completedBooking.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { customerNotes: "should fail" },
    });
    expect(completedPatch.statusCode).toBe(422);

    const cancelledBooking = await createPendingBooking(token, biz.id, 27);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${cancelledBooking.id}/cancel`,
      headers: { authorization: `Bearer ${token}` },
    });
    const cancelledPatch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/bookings/${cancelledBooking.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { customerNotes: "should fail" },
    });
    expect(cancelledPatch.statusCode).toBe(422);

    const noShowBooking = await createPendingBooking(token, biz.id, 28);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${noShowBooking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${noShowBooking.id}/no-show`,
      headers: { authorization: `Bearer ${token}` },
    });
    const noShowPatch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/bookings/${noShowBooking.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { customerNotes: "should fail" },
    });
    expect(noShowPatch.statusCode).toBe(422);
  });

  it("writes audit, domain event, and timestamps on lifecycle transitions", async () => {
    const { token } = await signup(`bkLife6${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const booking = await createPendingBooking(token, biz.id);

    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    const cancelRes = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/cancel`,
      headers: { authorization: `Bearer ${token}` },
    });
    const cancelled = JSON.parse(cancelRes.body).data;
    expect(cancelled.cancelledAt).toBeTruthy();
    expect(cancelled.completedAt).toBeNull();

    const cancelAudit = await prisma.auditLog.findMany({
      where: { businessId: biz.id, entityId: booking.id, action: "BOOKING_CANCELLED" },
    });
    expect(cancelAudit.length).toBe(1);
    const cancelEvent = await prisma.domainEvent.findMany({
      where: { businessId: biz.id, aggregateId: booking.id, eventType: "BOOKING_CANCELLED" },
    });
    expect(cancelEvent.length).toBe(1);

    const completeBooking = await createPendingBooking(token, biz.id, 29);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${completeBooking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    const completeRes = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${completeBooking.id}/complete`,
      headers: { authorization: `Bearer ${token}` },
    });
    const completed = JSON.parse(completeRes.body).data;
    expect(completed.completedAt).toBeTruthy();

    const noShowBooking = await createPendingBooking(token, biz.id, 30);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${noShowBooking.id}/confirm`,
      headers: { authorization: `Bearer ${token}` },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${noShowBooking.id}/no-show`,
      headers: { authorization: `Bearer ${token}` },
    });
    const noShowAudit = await prisma.auditLog.findMany({
      where: { businessId: biz.id, entityId: noShowBooking.id, action: "BOOKING_NO_SHOW" },
    });
    expect(noShowAudit.length).toBe(1);
    const noShowEvent = await prisma.domainEvent.findMany({
      where: { businessId: biz.id, aggregateId: noShowBooking.id, eventType: "BOOKING_NO_SHOW" },
    });
    expect(noShowEvent.length).toBe(1);
  });

  it("enforces tenant isolation on lifecycle transitions", async () => {
    const owner = await signup(`bkLife7A${Date.now()}@test.com`);
    const outsider = await signup(`bkLife7B${Date.now()}@test.com`);
    const biz = await createBusiness(owner.token);
    const booking = await createPendingBooking(owner.token, biz.id);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/confirm`,
      headers: { authorization: `Bearer ${outsider.token}` },
    });
    expect([403, 404].includes(res.statusCode)).toBe(true);
  });

  it("allows only one concurrent transition from the same source state", async () => {
    const { token } = await signup(`bkLife8${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const booking = await createPendingBooking(token, biz.id, 31);
    const headers = { authorization: `Bearer ${token}` };
    const originalUpdateMany = prisma.booking.updateMany.bind(prisma.booking);
    let mutationAttempts = 0;
    let releaseMutation!: () => void;
    const mutationBoundary = new Promise<void>((resolve) => { releaseMutation = resolve; });
    const updateManySpy = vi.spyOn(prisma.booking, "updateMany").mockImplementation(async (args: any) => {
      if (args?.where?.id === booking.id && args?.where?.status === "pending") {
        mutationAttempts += 1;
        if (mutationAttempts === 2) releaseMutation();
        await mutationBoundary;
      }
      return originalUpdateMany(args);
    });

    let confirm: any;
    let cancel: any;
    try {
      [confirm, cancel] = await Promise.all([
        app.inject({
          method: "POST",
          url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/confirm`,
          headers,
        }),
        app.inject({
          method: "POST",
          url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/cancel`,
          headers,
        }),
      ]);
    } finally {
      updateManySpy.mockRestore();
    }

    expect([confirm.statusCode, cancel.statusCode].sort()).toEqual([200, 422]);
    expect(mutationAttempts).toBe(2);
    const finalBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    const successfulStatus = confirm.statusCode === 200 ? "confirmed" : "cancelled";
    expect(finalBooking?.status).toBe(successfulStatus);

    const lifecycleAudits = await prisma.auditLog.findMany({
      where: { businessId: biz.id, entityId: booking.id },
    });
    expect(lifecycleAudits.filter((log) => ["BOOKING_CONFIRMED", "BOOKING_CANCELLED"].includes(log.action))).toHaveLength(1);

    const lifecycleEvents = await prisma.domainEvent.findMany({
      where: { businessId: biz.id, aggregateId: booking.id },
    });
    expect(lifecycleEvents.filter((event) => ["BOOKING_CONFIRMED", "BOOKING_CANCELLED"].includes(event.eventType))).toHaveLength(1);
  });

  it("integrates booking lifecycle events with exactly-once notifications", async () => {
    const owner = await signup(`bkIntegration${Date.now()}@test.com`);
    const outsider = await signup(`bkIntegrationOther${Date.now()}@test.com`);
    const biz = await createBusiness(owner.token);
    const customer = await createCustomer(biz.id, owner.token);
    const { start, end } = futureISOWithDuration(48, 60);

    const created = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: { customerId: customer.id, startTime: start, endTime: end },
    });
    expect(created.statusCode).toBe(201);
    const booking = JSON.parse(created.body).data;
    expect(booking.customerId).toBe(customer.id);
    expect(new Date(booking.startTime).toISOString()).toBe(start);
    expect(new Date(booking.endTime).toISOString()).toBe(end);

    const confirm = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/confirm`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    expect(confirm.statusCode).toBe(200);
    expect(JSON.parse(confirm.body).data.status).toBe("confirmed");

    const confirmedNotification = await waitFor(
      () => prisma.notification.findMany({
        where: { businessId: biz.id, sourceType: "booking", sourceId: `BOOKING_CONFIRMED:${booking.id}`, title: "Booking Confirmed" },
      }),
      (notifications) => notifications.length === 1,
    );
    expect(confirmedNotification).toHaveLength(1);

    const confirmedEvent = await prisma.domainEvent.findMany({
      where: { businessId: biz.id, aggregateId: booking.id, eventType: "BOOKING_CONFIRMED" },
    });
    expect(confirmedEvent).toHaveLength(1);

    const repeatedConfirm = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/confirm`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    expect(repeatedConfirm.statusCode).toBe(422);

    const cancel = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/bookings/${booking.id}/cancel`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    expect(cancel.statusCode).toBe(200);
    expect(JSON.parse(cancel.body).data.status).toBe("cancelled");

    const cancelledNotification = await waitFor(
      () => prisma.notification.findMany({
        where: { businessId: biz.id, sourceType: "booking", sourceId: `BOOKING_CANCELLED:${booking.id}`, title: "Booking Cancelled" },
      }),
      (notifications) => notifications.length === 1,
    );
    expect(cancelledNotification).toHaveLength(1);

    const finalBooking = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
    expect(finalBooking.status).toBe("cancelled");
    expect(await prisma.domainEvent.count({ where: { businessId: biz.id, aggregateId: booking.id, eventType: "BOOKING_CONFIRMED" } })).toBe(1);
    expect(await prisma.domainEvent.count({ where: { businessId: biz.id, aggregateId: booking.id, eventType: "BOOKING_CANCELLED" } })).toBe(1);
    expect(await prisma.notification.count({ where: { businessId: biz.id, sourceType: "booking", title: { in: ["Booking Confirmed", "Booking Cancelled"] } } })).toBe(2);

    const outsiderNotifications = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${outsider.token}` },
    });
    expect([403, 404].includes(outsiderNotifications.statusCode)).toBe(true);
  });
});
