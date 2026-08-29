import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
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

async function signup(email: string) {
  const r = await app.inject({
    method: "POST",
    url: "/api/v1/auth/signup",
    payload: { email, password: "password123" },
  });
  return JSON.parse(r.body).data;
}

async function createBusiness(token: string) {
  const r = await app.inject({
    method: "POST",
    url: "/api/v1/businesses",
    headers: { authorization: `Bearer ${token}` },
    payload: { name: `Biz${Date.now()}` },
  });
  return JSON.parse(r.body).data;
}

describe("Notifications — P0", () => {
  it("creates a notification", async () => {
    const { token } = await signup(`notif1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: "INSIGHT",
        title: "Test Insight",
        message: "A new insight was detected",
        severity: "high",
      },
    });
    expect(res.statusCode).toBe(201);
    const n = JSON.parse(res.body).data;
    expect(n.title).toBe("Test Insight");
    expect(n.status).toBe("unread");
    expect(n.severity).toBe("high");
  });

  it("lists notifications", async () => {
    const { token } = await signup(`notif2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N1", message: "msg1" },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N2", message: "msg2" },
    });
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.length).toBe(2);
  });

  it("filters by unread status", async () => {
    const { token } = await signup(`notif3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N1", message: "msg1" },
    });
    const n1Id = JSON.parse(cr.body).data.id;
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N2", message: "msg2" },
    });
    // Mark first as read
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications/${n1Id}/read`,
      headers: { authorization: `Bearer ${token}` },
    });
    const unread = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications?status=unread`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(JSON.parse(unread.body).data.length).toBe(1);
    expect(JSON.parse(unread.body).data[0].title).toBe("N2");
  });

  it("marks a notification as read", async () => {
    const { token } = await signup(`notif4${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "Read Me", message: "msg" },
    });
    const nId = JSON.parse(cr.body).data.id;
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    // Verify it's read
    const list = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications?status=unread`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(JSON.parse(list.body).data.length).toBe(0);
  });

  it("marks all notifications as read", async () => {
    const { token } = await signup(`notif5${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N1", message: "msg1" },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N2", message: "msg2" },
    });
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications/read-all`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.marked).toBe(2);
    // Verify all read
    const unread = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications/unread-count`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(JSON.parse(unread.body).data.count).toBe(0);
  });

  it("gets unread count", async () => {
    const { token } = await signup(`notif6${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N1", message: "msg1" },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "N2", message: "msg2" },
    });
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications/unread-count`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(JSON.parse(res.body).data.count).toBe(2);
  });

  it("tenant isolation: B cannot list A's notifications", async () => {
    const a = await signup(`notifA${Date.now()}@test.com`);
    const b = await signup(`notifB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${bizA.id}/notifications`,
      headers: { authorization: `Bearer ${a.token}` },
      payload: { type: "SYSTEM", title: "Private", message: "secret" },
    });
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${bizA.id}/notifications`,
      headers: { authorization: `Bearer ${b.token}` },
    });
    expect([403, 404].includes(res.statusCode)).toBe(true);
  });

  it("INSIGHT_CREATED event creates notification via handler", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifInsH${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const result = await handleNotificationEvent(
      biz.id,
      "INSIGHT_CREATED",
      { insightId: "test-insight-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "test-insight-1"
    );
    expect(result).toBe(true);
    const notif = await prisma.notification.findFirst({
      where: { businessId: biz.id, sourceType: "insight" },
    });
    expect(notif).toBeTruthy();
    expect(notif!.type).toBe("INSIGHT");
    expect(notif!.severity).toBe("high");
  });

  it("idempotency: duplicate event does not create duplicate notification", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifIdemH${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // First event
    await handleNotificationEvent(
      biz.id, "INSIGHT_CREATED",
      { insightId: "idem-insight", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "idem-insight"
    );
    // Duplicate event with same sourceId
    await handleNotificationEvent(
      biz.id, "INSIGHT_CREATED",
      { insightId: "idem-insight", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "idem-insight"
    );
    // Should have only 1 notification
    const count = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "insight", sourceId: "idem-insight" },
    });
    expect(count).toBe(1);
  });

  it("requires authentication", async () => {
    const { token } = await signup(`notifAuth${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("CREATE_NOTIFICATION action is registered in Action Registry", async () => {
    const def = await prisma.actionDefinition.findUnique({
      where: { actionKey: "CREATE_NOTIFICATION" },
    });
    expect(def).toBeTruthy();
    expect(def!.approvalRequired).toBe(false);
  });

  it("malicious metadata is safely handled", async () => {
    const { token } = await signup(`notifSec${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        type: "SYSTEM",
        title: "Safe",
        message: "test",
        metadata: { exec: "rm -rf /", eval: "bad" },
      },
    });
    expect(res.statusCode).toBe(201);
    // Metadata is stored as JSON string — no code execution
    const n = JSON.parse(res.body).data;
    expect(n.metadata).toContain("exec");
  });

  it("notification page returns empty state for new business", async () => {
    const { token } = await signup(`notifEmpty${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.length).toBe(0);
  });

  // ── Recipient-aware idempotency tests ──

  it("recipient-aware idempotency: same source+recipient does not duplicate", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifIdemR${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // First event for recipient A
    await handleNotificationEvent(
      biz.id, "ORDER_COMPLETED",
      { orderId: "order-1", orderNumber: "ORD-001", recipientId: "user-A" },
      "order-1"
    );
    // Duplicate event for same recipient
    await handleNotificationEvent(
      biz.id, "ORDER_COMPLETED",
      { orderId: "order-1", orderNumber: "ORD-001", recipientId: "user-A" },
      "order-1"
    );
    const count = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "order", sourceId: "order-1", recipientId: "user-A" },
    });
    expect(count).toBe(1);
  });

  it("same source event notifies two different recipients", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifMultiR${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // Event for recipient A
    await handleNotificationEvent(
      biz.id, "BOOKING_CREATED",
      { bookingId: "booking-1", bookingNumber: "BK-001", recipientId: "user-A" },
      "booking-1"
    );
    // Same event for recipient B
    await handleNotificationEvent(
      biz.id, "BOOKING_CREATED",
      { bookingId: "booking-1", bookingNumber: "BK-001", recipientId: "user-B" },
      "booking-1"
    );
    const countA = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "booking", sourceId: "booking-1", recipientId: "user-A" },
    });
    const countB = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "booking", sourceId: "booking-1", recipientId: "user-B" },
    });
    expect(countA).toBe(1);
    expect(countB).toBe(1);
    // Total should be 2
    const total = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "booking", sourceId: "booking-1" },
    });
    expect(total).toBe(2);
  });

  it("business-scoped idempotency: same sourceId in different businesses creates separate notifications", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const a = await signup(`notifBizScopeA${Date.now()}@test.com`);
    const b = await signup(`notifBizScopeB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    await handleNotificationEvent(bizA.id, "ORDER_COMPLETED", { orderId: "shared-1", orderNumber: "ORD-1" }, "shared-1");
    await handleNotificationEvent(bizB.id, "ORDER_COMPLETED", { orderId: "shared-1", orderNumber: "ORD-1" }, "shared-1");
    const countA = await prisma.notification.count({ where: { businessId: bizA.id, sourceId: "shared-1" } });
    const countB = await prisma.notification.count({ where: { businessId: bizB.id, sourceId: "shared-1" } });
    expect(countA).toBe(1);
    expect(countB).toBe(1);
  });

  // ── Notification handler failure is observable ──

  it("handler failure creates audit log with safe error message (observable, no secrets, does not throw)", async () => {
    const { token } = await signup(`notifFail${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const svc = await import("../src/modules/notifications/service.js");
    const spy = vi.spyOn(svc, "createNotification").mockImplementation(async () => {
      throw new Error("DB failed sk-abcdefghijklmnopqrst leaked");
    });
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const result = await handleNotificationEvent(
      biz.id, "PAYMENT_PAID",
      { paymentId: "pay-fail-obs-1", amount: 500 },
      "pay-fail-obs-1"
    );
    // Handler must return false, not throw, so originating operation is not corrupted
    expect(result).toBe(false);
    // Failure must be observable via audit log
    const failureAudits = await prisma.auditLog.findMany({
      where: { businessId: biz.id, action: "NOTIFICATION_HANDLER_FAILED" },
    });
    expect(failureAudits.length).toBe(1);
    expect(failureAudits[0].businessId).toBe(biz.id);
    const meta = JSON.parse(failureAudits[0].metadata || "{}");
    expect(meta.eventType).toBe("PAYMENT_PAID");
    // Safe error: must not expose raw secret, must be truncated and redacted
    expect(meta.error).not.toContain("sk-abcdefghijklmnopqrst");
    expect(meta.error).toContain("[REDACTED]");
    expect(meta.error.length).toBeLessThanOrEqual(200);
    // No stack trace leaked
    expect(meta.error).not.toContain("at ");
    spy.mockRestore();
    // Verify subsequent valid event still works (existing behavior intact, not corrupted)
    const okResult = await handleNotificationEvent(
      biz.id, "PAYMENT_PAID",
      { paymentId: "pay-ok-after-fail", amount: 500 },
      "pay-ok-after-fail"
    );
    expect(okResult).toBe(true);
    const notif = await prisma.notification.findFirst({
      where: { businessId: biz.id, sourceId: "pay-ok-after-fail" },
    });
    expect(notif).toBeTruthy();
  });

  it("notification failure does not corrupt originating business operation", async () => {
    const { token } = await signup(`notifNoCorrupt${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const svc = await import("../src/modules/notifications/service.js");
    const spy = vi.spyOn(svc, "createNotification").mockImplementation(async () => {
      throw new Error("simulated notification failure");
    });
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    // Even if notification fails, business operation (e.g., creating a domain event) should succeed
    const event = await prisma.domainEvent.create({
      data: {
        businessId: biz.id,
        eventType: "PAYMENT_PAID",
        aggregateType: "payment",
        aggregateId: "pay-no-corrupt",
        payload: JSON.stringify({ paymentId: "pay-no-corrupt", amount: 100 }),
      },
    });
    expect(event.id).toBeTruthy();
    const result = await handleNotificationEvent(
      biz.id, "PAYMENT_PAID",
      { paymentId: "pay-no-corrupt", amount: 100 },
      "pay-no-corrupt"
    );
    expect(result).toBe(false);
    // Business data still exists, not rolled back
    const found = await prisma.domainEvent.findUnique({ where: { id: event.id } });
    expect(found).toBeTruthy();
    // Audit recorded observably
    const audit = await prisma.auditLog.findFirst({
      where: { businessId: biz.id, action: "NOTIFICATION_HANDLER_FAILED" },
    });
    expect(audit).toBeTruthy();
    spy.mockRestore();
  });

  // ── Audit records for mutations ──

  it("audit log created on notification creation", async () => {
    const { token } = await signup(`notifAudit1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "Audit Test", message: "msg" },
    });
    const nId = JSON.parse(res.body).data.id;
    const audit = await prisma.auditLog.findFirst({
      where: { businessId: biz.id, entityType: "notification", entityId: nId, action: "NOTIFICATION_CREATED" },
    });
    expect(audit).toBeTruthy();
    expect(audit!.actorType).toBe("user");
  });

  it("audit log created on mark read", async () => {
    const { token } = await signup(`notifAudit2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "Read Audit", message: "msg" },
    });
    const nId = JSON.parse(cr.body).data.id;
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
      headers: { authorization: `Bearer ${token}` },
    });
    const audit = await prisma.auditLog.findFirst({
      where: { businessId: biz.id, entityType: "notification", entityId: nId, action: "NOTIFICATION_READ" },
    });
    expect(audit).toBeTruthy();
  });

  it("audit log created on mark all read", async () => {
    const { token } = await signup(`notifAudit3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications`,
      headers: { authorization: `Bearer ${token}` },
      payload: { type: "SYSTEM", title: "Bulk Audit", message: "msg" },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/notifications/read-all`,
      headers: { authorization: `Bearer ${token}` },
    });
    const audit = await prisma.auditLog.findFirst({
      where: { businessId: biz.id, entityType: "notification", action: "NOTIFICATION_READ_ALL" },
    });
    expect(audit).toBeTruthy();
    const after = JSON.parse(audit!.afterData || "{}");
    expect(after.marked).toBe(1);
  });

  // ── Existing event/automation behavior intact ──

  it("existing INSIGHT_CREATED handler still works", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifExisting${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const result = await handleNotificationEvent(
      biz.id, "INSIGHT_CREATED",
      { insightId: "ins-exist-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "ins-exist-1"
    );
    expect(result).toBe(true);
    const notif = await prisma.notification.findFirst({
      where: { businessId: biz.id, sourceType: "insight" },
    });
    expect(notif).toBeTruthy();
    expect(notif!.type).toBe("INSIGHT");
  });

  it("unknown event type returns false without error", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifUnknown${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const result = await handleNotificationEvent(
      biz.id, "UNKNOWN_EVENT_TYPE",
      { some: "data" },
      "unknown-1"
    );
    expect(result).toBe(false);
    // No notification created
    const count = await prisma.notification.count({ where: { businessId: biz.id } });
    expect(count).toBe(0);
  });
});
