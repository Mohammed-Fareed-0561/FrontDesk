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

  // ── Broadcast idempotency (DB-level race hardening) ──

  it("broadcast idempotency: same broadcast event does not create duplicate notifications", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifBroadcastIdem${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // First broadcast event (no recipientId in payload)
    await handleNotificationEvent(
      biz.id, "INSIGHT_CREATED",
      { insightId: "broadcast-insight-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "broadcast-insight-1"
    );
    // Duplicate broadcast event with same sourceId
    await handleNotificationEvent(
      biz.id, "INSIGHT_CREATED",
      { insightId: "broadcast-insight-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "broadcast-insight-1"
    );
    // Should have only 1 notification (broadcast dedup via app + DB partial index)
    const count = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "insight", sourceId: "broadcast-insight-1" },
    });
    expect(count).toBe(1);
  });

  it("broadcast idempotency: direct insert race simulation blocked by DB partial index", async () => {
    const { token } = await signup(`notifBroadcastRace${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // Insert first broadcast notification directly
    const n1 = await prisma.notification.create({
      data: {
        businessId: biz.id,
        recipientId: null,
        type: "INSIGHT",
        title: "Broadcast Race Test",
        message: "test",
        severity: "info",
        sourceType: "insight",
        sourceId: "broadcast-race-1",
      },
    });
    expect(n1.id).toBeTruthy();
    // Attempt to insert a duplicate broadcast with same business+sourceType+sourceId and null recipientId
    // The notif_broadcast_dedup partial index should reject this
    await expect(
      prisma.notification.create({
        data: {
          businessId: biz.id,
          recipientId: null,
          type: "INSIGHT",
          title: "Broadcast Race Duplicate",
          message: "should fail",
          severity: "info",
          sourceType: "insight",
          sourceId: "broadcast-race-1",
        },
      })
    ).rejects.toThrow();
  });

  it("broadcast vs recipient-specific: same source with broadcast and different recipients creates separate notifications", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifBroadcastVsRecipient${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // Broadcast notification (no recipientId)
    await handleNotificationEvent(
      biz.id, "ORDER_COMPLETED",
      { orderId: "order-br-1", orderNumber: "ORD-BR-1" },
      "order-br-1"
    );
    // Recipient-specific notification for same source
    await handleNotificationEvent(
      biz.id, "ORDER_COMPLETED",
      { orderId: "order-br-1", orderNumber: "ORD-BR-1", recipientId: "user-A" },
      "order-br-1"
    );
    // Both should exist: 1 broadcast + 1 recipient-specific
    const total = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "order", sourceId: "order-br-1" },
    });
    expect(total).toBe(2);
    // Verify broadcast exists
    const broadcast = await prisma.notification.findFirst({
      where: { businessId: biz.id, sourceType: "order", sourceId: "order-br-1", recipientId: null },
    });
    expect(broadcast).toBeTruthy();
    // Verify recipient-specific exists
    const recipient = await prisma.notification.findFirst({
      where: { businessId: biz.id, sourceType: "order", sourceId: "order-br-1", recipientId: "user-A" },
    });
    expect(recipient).toBeTruthy();
  });

  // ── System-created notification audit consistency ──

  it("event-driven notification creation creates NOTIFICATION_CREATED audit with actorType=system", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifSysAudit${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await handleNotificationEvent(
      biz.id, "INSIGHT_CREATED",
      { insightId: "audit-sys-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "audit-sys-1"
    );
    const notif = await prisma.notification.findFirst({
      where: { businessId: biz.id, sourceType: "insight", sourceId: "audit-sys-1" },
    });
    expect(notif).toBeTruthy();
    // Audit record should exist with actorType=system
    const audit = await prisma.auditLog.findFirst({
      where: { businessId: biz.id, entityType: "notification", entityId: notif!.id, action: "NOTIFICATION_CREATED" },
    });
    expect(audit).toBeTruthy();
    expect(audit!.actorType).toBe("system");
    const after = JSON.parse(audit!.afterData || "{}");
    expect(after.type).toBe("INSIGHT");
  });

  it("idempotent duplicate event does NOT create duplicate NOTIFICATION_CREATED audit records", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifAuditIdem${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // First event — should create notification + audit
    await handleNotificationEvent(
      biz.id, "ORDER_COMPLETED",
      { orderId: "audit-idem-1", orderNumber: "ORD-AI-1" },
      "audit-idem-1"
    );
    // Duplicate event — should be idempotent, no new notification or audit
    await handleNotificationEvent(
      biz.id, "ORDER_COMPLETED",
      { orderId: "audit-idem-1", orderNumber: "ORD-AI-1" },
      "audit-idem-1"
    );
    // Only 1 notification
    const notifCount = await prisma.notification.count({
      where: { businessId: biz.id, sourceType: "order", sourceId: "audit-idem-1" },
    });
    expect(notifCount).toBe(1);
    // Only 1 NOTIFICATION_CREATED audit (no duplicates)
    const auditCount = await prisma.auditLog.count({
      where: { businessId: biz.id, action: "NOTIFICATION_CREATED" },
    });
    expect(auditCount).toBe(1);
  });

  it("different event types create separate notifications and audit records", async () => {
    const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
    const { token } = await signup(`notifDiffEvents${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await handleNotificationEvent(
      biz.id, "INSIGHT_CREATED",
      { insightId: "diff-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
      "diff-1"
    );
    await handleNotificationEvent(
      biz.id, "ORDER_COMPLETED",
      { orderId: "diff-2", orderNumber: "ORD-DIFF" },
      "diff-2"
    );
    const notifCount = await prisma.notification.count({ where: { businessId: biz.id } });
    expect(notifCount).toBe(2);
    const auditCount = await prisma.auditLog.count({
      where: { businessId: biz.id, action: "NOTIFICATION_CREATED" },
    });
    expect(auditCount).toBe(2);
  });

  // ── Notification Preferences P1 ──

  describe("Notification Preferences", () => {
    const SUPPORTED_NOTIFICATION_TYPES = ["INSIGHT", "BOOKING", "ORDER", "PAYMENT", "SYSTEM", "AUTOMATION"];

    it("default preference = enabled (no row needed)", async () => {
      const { token } = await signup(`prefDefault${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${biz.id}/notification-preferences`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(200);
      const prefs = JSON.parse(res.body).data;
      // All supported types should be present and enabled by default
      expect(prefs.length).toBe(SUPPORTED_NOTIFICATION_TYPES.length);
      for (const p of prefs) {
        expect(p.enabled).toBe(true);
      }
    });

    it("disable a notification type", async () => {
      const { token } = await signup(`prefDisable${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/INSIGHT`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      expect(res.statusCode).toBe(200);
      const pref = JSON.parse(res.body).data;
      expect(pref.type).toBe("INSIGHT");
      expect(pref.enabled).toBe(false);
    });

    it("re-enable a notification type", async () => {
      const { token } = await signup(`prefReEnable${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Disable first
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/ORDER`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      // Re-enable
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/ORDER`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: true },
      });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.enabled).toBe(true);
    });

    it("disabled preference suppresses event-driven notification for that recipient", async () => {
      const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
      const { token, user } = await signup(`prefSuppress${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Disable INSIGHT notifications for this user
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/INSIGHT`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      // Fire event with this user as recipient
      const result = await handleNotificationEvent(
        biz.id, "INSIGHT_CREATED",
        { insightId: "supp-1", type: "ENQUIRY_BACKLOG", severity: "HIGH", recipientId: user.id },
        "supp-1"
      );
      // Handler returns true (event processed) but notification should NOT be created
      expect(result).toBe(true);
      const count = await prisma.notification.count({
        where: { businessId: biz.id, sourceType: "insight", sourceId: "supp-1" },
      });
      expect(count).toBe(0);
    });

    it("re-enabled preference restores notification creation", async () => {
      const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
      const { token, user } = await signup(`prefRestore${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Disable
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/ORDER`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      // Fire event — suppressed
      await handleNotificationEvent(
        biz.id, "ORDER_COMPLETED",
        { orderId: "restore-1", orderNumber: "ORD-R1", recipientId: user.id },
        "restore-1"
      );
      let count = await prisma.notification.count({
        where: { businessId: biz.id, sourceType: "order", sourceId: "restore-1" },
      });
      expect(count).toBe(0);
      // Re-enable
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/ORDER`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: true },
      });
      // Fire event again — should create notification now
      await handleNotificationEvent(
        biz.id, "ORDER_COMPLETED",
        { orderId: "restore-2", orderNumber: "ORD-R2", recipientId: user.id },
        "restore-2"
      );
      count = await prisma.notification.count({
        where: { businessId: biz.id, sourceType: "order", sourceId: "restore-2" },
      });
      expect(count).toBe(1);
    });

    it("broadcast notifications ignore preferences (always enabled)", async () => {
      const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
      const { token } = await signup(`prefBroadcast${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Disable INSIGHT for the user
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/INSIGHT`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      // Fire broadcast event (no recipientId) — should still create notification
      const result = await handleNotificationEvent(
        biz.id, "INSIGHT_CREATED",
        { insightId: "bcast-pref-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
        "bcast-pref-1"
      );
      expect(result).toBe(true);
      const count = await prisma.notification.count({
        where: { businessId: biz.id, sourceType: "insight", sourceId: "bcast-pref-1" },
      });
      expect(count).toBe(1);
    });

    it("preference is business-scoped: different businesses have independent preferences", async () => {
      const { token } = await signup(`prefBizScope${Date.now()}@test.com`);
      const bizA = await createBusiness(token);
      const bizB = await createBusiness(token);
      // Disable INSIGHT in bizA
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${bizA.id}/notification-preferences/INSIGHT`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      // Check bizB — should still be enabled
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${bizB.id}/notification-preferences`,
        headers: { authorization: `Bearer ${token}` },
      });
      const prefs = JSON.parse(res.body).data;
      const insightPref = prefs.find((p: any) => p.type === "INSIGHT");
      expect(insightPref.enabled).toBe(true);
    });

    it("user cannot modify another user's preferences", async () => {
      const a = await signup(`prefOwner${Date.now()}@test.com`);
      const b = await signup(`prefOther${Date.now()}@test.com`);
      const bizA = await createBusiness(a.token);
      // B tries to access A's preferences — should be forbidden
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${bizA.id}/notification-preferences`,
        headers: { authorization: `Bearer ${b.token}` },
      });
      expect([403, 404].includes(res.statusCode)).toBe(true);
    });

    it("unsupported notification type is rejected", async () => {
      const { token } = await signup(`prefUnsupported${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/WHATSAPP`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: true },
      });
      expect(res.statusCode).toBe(422);
    });

    it("requires authentication", async () => {
      const { token } = await signup(`prefAuth${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const res = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${biz.id}/notification-preferences`,
      });
      expect(res.statusCode).toBe(401);
    });

    it("audit created on preference update", async () => {
      const { token } = await signup(`prefAudit${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/PAYMENT`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      const audit = await prisma.auditLog.findFirst({
        where: { businessId: biz.id, action: "NOTIFICATION_PREFERENCE_UPDATED" },
      });
      expect(audit).toBeTruthy();
      expect(audit!.actorType).toBe("user");
      const before = JSON.parse(audit!.beforeData || "{}");
      const after = JSON.parse(audit!.afterData || "{}");
      expect(before.type).toBe("PAYMENT");
      expect(before.enabled).toBe(true);
      expect(after.type).toBe("PAYMENT");
      expect(after.enabled).toBe(false);
    });

    it("existing notification idempotency still works with preferences enabled", async () => {
      const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
      const { token } = await signup(`prefIdem${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Preferences are enabled by default — idempotency should still work
      await handleNotificationEvent(
        biz.id, "INSIGHT_CREATED",
        { insightId: "pref-idem-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
        "pref-idem-1"
      );
      await handleNotificationEvent(
        biz.id, "INSIGHT_CREATED",
        { insightId: "pref-idem-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
        "pref-idem-1"
      );
      const count = await prisma.notification.count({
        where: { businessId: biz.id, sourceType: "insight", sourceId: "pref-idem-1" },
      });
      expect(count).toBe(1);
    });

    it("existing event/automation behavior remains intact", async () => {
      const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
      const { token } = await signup(`prefExisting${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // All event types should still work when preferences are default (enabled)
      const types = [
        { eventType: "INSIGHT_CREATED", payload: { insightId: "ex-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" }, sourceId: "ex-1" },
        { eventType: "BOOKING_CREATED", payload: { bookingId: "ex-2", bookingNumber: "BK-1" }, sourceId: "ex-2" },
        { eventType: "PAYMENT_PAID", payload: { paymentId: "ex-3", amount: 500 }, sourceId: "ex-3" },
        { eventType: "ORDER_COMPLETED", payload: { orderId: "ex-4", orderNumber: "ORD-1" }, sourceId: "ex-4" },
      ];
      for (const t of types) {
        const result = await handleNotificationEvent(biz.id, t.eventType, t.payload, t.sourceId);
        expect(result).toBe(true);
      }
      const count = await prisma.notification.count({ where: { businessId: biz.id } });
      expect(count).toBe(4);
    });
  });

  // ── Read Status Enhancement (P1) ──

  describe("Read Status — readAt behavior", () => {
    it("unread notification has null readAt", async () => {
      const { token } = await signup(`readAtNull${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const res = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "Unread Test", message: "test" },
      });
      expect(res.statusCode).toBe(201);
      const n = JSON.parse(res.body).data;
      expect(n.status).toBe("unread");
      expect(n.readAt).toBeNull();
    });

    it("mark one notification read sets readAt to a valid timestamp", async () => {
      const { token } = await signup(`readAtSet${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "ReadAt Set", message: "test" },
      });
      const nId = JSON.parse(cr.body).data.id;
      const before = Date.now();
      const markRes = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(markRes.statusCode).toBe(200);
      // Verify readAt is populated
      const notif = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif).toBeTruthy();
      expect(notif!.status).toBe("read");
      expect(notif!.readAt).not.toBeNull();
      const readAtTime = new Date(notif!.readAt!).getTime();
      expect(readAtTime).toBeGreaterThanOrEqual(before);
      expect(readAtTime).toBeLessThanOrEqual(Date.now());
    });

    it("repeated mark-read does not corrupt readAt (preserves original timestamp)", async () => {
      const { token } = await signup(`readAtCorrupt${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "No Corrupt", message: "test" },
      });
      const nId = JSON.parse(cr.body).data.id;
      // First mark-read
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      const notif1 = await prisma.notification.findUnique({ where: { id: nId } });
      const originalReadAt = notif1!.readAt;
      expect(originalReadAt).not.toBeNull();
      // Second mark-read should not change readAt
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      const notif2 = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif2!.readAt).toEqual(originalReadAt);
    });

    it("mark-all-read sets readAt on all newly-read notifications", async () => {
      const { token } = await signup(`readAtBulk${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Create 3 notifications
      for (let i = 0; i < 3; i++) {
        await app.inject({
          method: "POST",
          url: `/api/v1/businesses/${biz.id}/notifications`,
          headers: { authorization: `Bearer ${token}` },
          payload: { type: "SYSTEM", title: `Bulk ${i}`, message: `msg ${i}` },
        });
      }
      const before = Date.now();
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/read-all`,
        headers: { authorization: `Bearer ${token}` },
      });
      // All notifications should have readAt set
      const all = await prisma.notification.findMany({ where: { businessId: biz.id } });
      expect(all.length).toBe(3);
      for (const n of all) {
        expect(n.status).toBe("read");
        expect(n.readAt).not.toBeNull();
        expect(new Date(n.readAt!).getTime()).toBeGreaterThanOrEqual(before);
      }
    });

    it("already-read notifications retain their original readAt after mark-all-read", async () => {
      const { token } = await signup(`readAtRetain${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Create 2 notifications
      const cr1 = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "First", message: "msg1" },
      });
      const n1Id = JSON.parse(cr1.body).data.id;
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "Second", message: "msg2" },
      });
      // Mark first as read manually
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${n1Id}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      const notif1Before = await prisma.notification.findUnique({ where: { id: n1Id } });
      const originalReadAt = notif1Before!.readAt;
      expect(originalReadAt).not.toBeNull();
      // Mark all read — first should retain original readAt
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/read-all`,
        headers: { authorization: `Bearer ${token}` },
      });
      const notif1After = await prisma.notification.findUnique({ where: { id: n1Id } });
      expect(notif1After!.readAt).toEqual(originalReadAt);
    });

    it("list API exposes readAt field for each notification", async () => {
      const { token } = await signup(`readAtAPI${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "API ReadAt", message: "test" },
      });
      const nId = JSON.parse(cr.body).data.id;
      // List should include readAt (null for unread)
      const listRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
      });
      const items = JSON.parse(listRes.body).data;
      expect(items.length).toBe(1);
      expect(items[0].readAt).toBeNull();
      // Mark read
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      // List again — readAt should be populated
      const listRes2 = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
      });
      const items2 = JSON.parse(listRes2.body).data;
      expect(items2.length).toBe(1);
      expect(items2[0].readAt).not.toBeNull();
    });

    it("tenant isolation remains intact for read operations", async () => {
      const a = await signup(`readAtTenantA${Date.now()}@test.com`);
      const b = await signup(`readAtTenantB${Date.now()}@test.com`);
      const bizA = await createBusiness(a.token);
      const bizB = await createBusiness(b.token);
      // Create notification in bizA
      const cr = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${bizA.id}/notifications`,
        headers: { authorization: `Bearer ${a.token}` },
        payload: { type: "SYSTEM", title: "Tenant A private", message: "secret" },
      });
      const nId = JSON.parse(cr.body).data.id;
      // B cannot mark A's notification as read
      const markRes = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${bizA.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${b.token}` },
      });
      expect([403, 404].includes(markRes.statusCode)).toBe(true);
      // A's notification should remain unread
      const notif = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif!.status).toBe("unread");
      expect(notif!.readAt).toBeNull();
      // B cannot mark all of A's as read
      const markAllRes = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${bizA.id}/notifications/read-all`,
        headers: { authorization: `Bearer ${b.token}` },
      });
      expect([403, 404].includes(markAllRes.statusCode)).toBe(true);
      const notif2 = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif2!.status).toBe("unread");
    });

    it("notification preferences remain intact alongside read status", async () => {
      const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
      const { token, user } = await signup(`readAtPref${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Disable INSIGHT notifications
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/INSIGHT`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: false },
      });
      // Event for this user should be suppressed
      await handleNotificationEvent(
        biz.id, "INSIGHT_CREATED",
        { insightId: "rp-1", type: "ENQUIRY_BACKLOG", severity: "HIGH", recipientId: user.id },
        "rp-1"
      );
      const count = await prisma.notification.count({ where: { businessId: biz.id } });
      expect(count).toBe(0);
      // Re-enable
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${biz.id}/notification-preferences/INSIGHT`,
        headers: { authorization: `Bearer ${token}` },
        payload: { enabled: true },
      });
      // Create a notification manually
      const cr = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "INSIGHT", title: "Pref+ReadAt", message: "test" },
      });
      const nId = JSON.parse(cr.body).data.id;
      // Verify unread state
      const notif1 = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif1!.status).toBe("unread");
      expect(notif1!.readAt).toBeNull();
      // Mark read
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      const notif2 = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif2!.status).toBe("read");
      expect(notif2!.readAt).not.toBeNull();
    });

    it("idempotency remains intact for read status operations", async () => {
      const { token } = await signup(`readAtIdem${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      // Create notification
      const cr = await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "Idem Read", message: "test" },
      });
      const nId = JSON.parse(cr.body).data.id;
      // Mark read twice
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      await app.inject({
        method: "POST",
        url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`,
        headers: { authorization: `Bearer ${token}` },
      });
      // Notification should still exist, readAt should be set once
      const notif = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif).toBeTruthy();
      expect(notif!.status).toBe("read");
      expect(notif!.readAt).not.toBeNull();
      // Duplicate event idempotency still works
      const { handleNotificationEvent } = await import("../src/modules/notifications/handler.js");
      await handleNotificationEvent(
        biz.id, "INSIGHT_CREATED",
        { insightId: "idem-rs-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
        "idem-rs-1"
      );
      await handleNotificationEvent(
        biz.id, "INSIGHT_CREATED",
        { insightId: "idem-rs-1", type: "ENQUIRY_BACKLOG", severity: "HIGH" },
        "idem-rs-1"
      );
      const idemCount = await prisma.notification.count({
        where: { businessId: biz.id, sourceType: "insight", sourceId: "idem-rs-1" },
      });
      expect(idemCount).toBe(1);
    });
  });

  // ── P2: Batch Operations, Archive, Search, Detail ──

  describe("Notification Detail", () => {
    it("returns notification by ID with tenant check", async () => {
      const { token } = await signup(`detailA${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({
        method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`,
        headers: { authorization: `Bearer ${token}` },
        payload: { type: "SYSTEM", title: "Detail Test", message: "test" },
      });
      const nId = JSON.parse(cr.body).data.id;
      const res = await app.inject({
        method: "GET", url: `/api/v1/businesses/${biz.id}/notifications/${nId}`,
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.statusCode).toBe(200);
      const n = JSON.parse(res.body).data;
      expect(n.id).toBe(nId);
      expect(n.title).toBe("Detail Test");
      expect(n.archivedAt).toBeNull();
    });

    it("returns 404 for cross-tenant detail access", async () => {
      const a = await signup(`detailCrossA${Date.now()}@test.com`);
      const b = await signup(`detailCrossB${Date.now()}@test.com`);
      const bizA = await createBusiness(a.token);
      const cr = await app.inject({
        method: "POST", url: `/api/v1/businesses/${bizA.id}/notifications`,
        headers: { authorization: `Bearer ${a.token}` },
        payload: { type: "SYSTEM", title: "Private", message: "secret" },
      });
      const nId = JSON.parse(cr.body).data.id;
      const res = await app.inject({
        method: "GET", url: `/api/v1/businesses/${bizA.id}/notifications/${nId}`,
        headers: { authorization: `Bearer ${b.token}` },
      });
      expect([403, 404].includes(res.statusCode)).toBe(true);
    });
  });

  describe("Search and Filtering", () => {
    it("searches by title", async () => {
      const { token } = await signup(`searchTitle${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Payment Alert", message: "msg" } });
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Booking Update", message: "msg" } });
      const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?search=Payment`, headers: { authorization: `Bearer ${token}` } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.length).toBe(1);
      expect(JSON.parse(res.body).data[0].title).toBe("Payment Alert");
    });

    it("searches by message", async () => {
      const { token } = await signup(`searchMsg${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "N1", message: "Urgent attention needed" } });
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "N2", message: "All good" } });
      const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?search=Urgent`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(res.body).data.length).toBe(1);
    });

    it("filters by type", async () => {
      const { token } = await signup(`fillType${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "INSIGHT", title: "I1", message: "msg" } });
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "BOOKING", title: "B1", message: "msg" } });
      const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?type=INSIGHT`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(res.body).data.length).toBe(1);
      expect(JSON.parse(res.body).data[0].type).toBe("INSIGHT");
    });

    it("filters by severity", async () => {
      const { token } = await signup(`fillSev${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "High", message: "msg", severity: "high" } });
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Low", message: "msg", severity: "low" } });
      const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?severity=high`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(res.body).data.length).toBe(1);
      expect(JSON.parse(res.body).data[0].severity).toBe("high");
    });

    it("filters by status", async () => {
      const { token } = await signup(`fillStat${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Read", message: "msg" } });
      const nId = JSON.parse(cr.body).data.id;
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Unread", message: "msg" } });
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`, headers: { authorization: `Bearer ${token}` } });
      const read = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?status=read`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(read.body).data.length).toBe(1);
      expect(JSON.parse(read.body).data[0].status).toBe("read");
      const unread = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?status=unread`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(unread.body).data.length).toBe(1);
      expect(JSON.parse(unread.body).data[0].status).toBe("unread");
    });

    it("filters by date range", async () => {
      const { token } = await signup(`fillDate${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Date Test", message: "msg" } });
      const now = new Date();
      const from = new Date(now.getTime() - 60000).toISOString();
      const to = new Date(now.getTime() + 60000).toISOString();
      const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?dateFrom=${from}&dateTo=${to}`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(res.body).data.length).toBe(1);
    });

    it("pagination with filters", async () => {
      const { token } = await signup(`fillPage${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      for (let i = 0; i < 5; i++) {
        await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: `N${i}`, message: "msg" } });
      }
      const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?page=1&pageSize=2`, headers: { authorization: `Bearer ${token}` } });
      const body = JSON.parse(res.body);
      expect(body.data.length).toBe(2);
      expect(body.meta.total).toBe(5);
    });
  });

  describe("Batch Operations", () => {
    it("batch mark-read", async () => {
      const { token } = await signup(`batchRead${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: `BR${i}`, message: "msg" } });
        ids.push(JSON.parse(cr.body).data.id);
      }
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/batch-read`, headers: { authorization: `Bearer ${token}` }, payload: { ids } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.marked).toBe(3);
      const all = await prisma.notification.findMany({ where: { businessId: biz.id } });
      for (const n of all) { expect(n.status).toBe("read"); expect(n.readAt).not.toBeNull(); }
    });

    it("batch read respects readAt preservation", async () => {
      const { token } = await signup(`batchPres${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "A", message: "msg" } });
      const cr2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "B", message: "msg" } });
      const id1 = JSON.parse(cr1.body).data.id;
      const id2 = JSON.parse(cr2.body).data.id;
      // Mark first as read manually
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${id1}/read`, headers: { authorization: `Bearer ${token}` } });
      const before = await prisma.notification.findUnique({ where: { id: id1 } });
      const origReadAt = before!.readAt;
      // Batch read both
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/batch-read`, headers: { authorization: `Bearer ${token}` }, payload: { ids: [id1, id2] } });
      const after1 = await prisma.notification.findUnique({ where: { id: id1 } });
      expect(after1!.readAt).toEqual(origReadAt); // Original preserved
      const after2 = await prisma.notification.findUnique({ where: { id: id2 } });
      expect(after2!.readAt).not.toBeNull(); // New readAt set
    });

    it("batch mark-unread", async () => {
      const { token } = await signup(`batchUnread${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const ids: string[] = [];
      for (let i = 0; i < 2; i++) {
        const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: `BU${i}`, message: "msg" } });
        ids.push(JSON.parse(cr.body).data.id);
      }
      // Mark all as read first
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/read-all`, headers: { authorization: `Bearer ${token}` } });
      // Batch mark unread
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/batch-unread`, headers: { authorization: `Bearer ${token}` }, payload: { ids } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.marked).toBe(2);
      const all = await prisma.notification.findMany({ where: { businessId: biz.id } });
      for (const n of all) { expect(n.status).toBe("unread"); expect(n.readAt).toBeNull(); }
    });

    it("tenant isolation for batch: only owns notifications", async () => {
      const a = await signup(`batchTenantA${Date.now()}@test.com`);
      const b = await signup(`batchTenantB${Date.now()}@test.com`);
      const bizA = await createBusiness(a.token);
      const bizB = await createBusiness(b.token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/notifications`, headers: { authorization: `Bearer ${a.token}` }, payload: { type: "SYSTEM", title: "A's", message: "msg" } });
      const nId = JSON.parse(cr.body).data.id;
      // B tries to batch-read A's notification
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizB.id}/notifications/batch-read`, headers: { authorization: `Bearer ${b.token}` }, payload: { ids: [nId] } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.marked).toBe(0); // Nothing owned by B
      const notif = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif!.status).toBe("unread"); // Unchanged
    });
  });

  describe("Archive Operations", () => {
    it("archive a notification", async () => {
      const { token } = await signup(`archOne${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Archive Me", message: "msg" } });
      const nId = JSON.parse(cr.body).data.id;
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/archive`, headers: { authorization: `Bearer ${token}` } });
      expect(res.statusCode).toBe(200);
      const notif = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif!.archivedAt).not.toBeNull();
    });

    it("unarchive a notification", async () => {
      const { token } = await signup(`unarchOne${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Unarchive Me", message: "msg" } });
      const nId = JSON.parse(cr.body).data.id;
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/archive`, headers: { authorization: `Bearer ${token}` } });
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/unarchive`, headers: { authorization: `Bearer ${token}` } });
      expect(res.statusCode).toBe(200);
      const notif = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif!.archivedAt).toBeNull();
    });

    it("archived notifications excluded from normal list", async () => {
      const { token } = await signup(`archExclude${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Visible", message: "msg" } });
      const cr2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Archived", message: "msg" } });
      const archId = JSON.parse(cr2.body).data.id;
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${archId}/archive`, headers: { authorization: `Bearer ${token}` } });
      const normal = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(normal.body).data.length).toBe(1);
      expect(JSON.parse(normal.body).data[0].title).toBe("Visible");
    });

    it("archived notifications visible when explicitly requested", async () => {
      const { token } = await signup(`archVisible${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Archived One", message: "msg" } });
      const archId = JSON.parse(cr.body).data.id;
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${archId}/archive`, headers: { authorization: `Bearer ${token}` } });
      const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications?archived=true`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(res.body).data.length).toBe(1);
      expect(JSON.parse(res.body).data[0].title).toBe("Archived One");
    });

    it("batch archive", async () => {
      const { token } = await signup(`batchArch${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const ids: string[] = [];
      for (let i = 0; i < 3; i++) {
        const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: `BA${i}`, message: "msg" } });
        ids.push(JSON.parse(cr.body).data.id);
      }
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/batch-archive`, headers: { authorization: `Bearer ${token}` }, payload: { ids } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.archived).toBe(3);
      const visible = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(visible.body).data.length).toBe(0);
    });

    it("batch unarchive", async () => {
      const { token } = await signup(`batchUnarch${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const ids: string[] = [];
      for (let i = 0; i < 2; i++) {
        const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: `BUA${i}`, message: "msg" } });
        ids.push(JSON.parse(cr.body).data.id);
      }
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/batch-archive`, headers: { authorization: `Bearer ${token}` }, payload: { ids } });
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/batch-unarchive`, headers: { authorization: `Bearer ${token}` }, payload: { ids } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body).data.unarchived).toBe(2);
      const visible = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(visible.body).data.length).toBe(2);
    });

    it("archive preserves readAt", async () => {
      const { token } = await signup(`archPreserve${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Read+Arch", message: "msg" } });
      const nId = JSON.parse(cr.body).data.id;
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/read`, headers: { authorization: `Bearer ${token}` } });
      const before = await prisma.notification.findUnique({ where: { id: nId } });
      const origReadAt = before!.readAt;
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/archive`, headers: { authorization: `Bearer ${token}` } });
      const after = await prisma.notification.findUnique({ where: { id: nId } });
      expect(after!.readAt).toEqual(origReadAt);
      expect(after!.archivedAt).not.toBeNull();
    });

    it("archive/unarchive audit records", async () => {
      const { token } = await signup(`archAudit${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "Arch Audit", message: "msg" } });
      const nId = JSON.parse(cr.body).data.id;
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/archive`, headers: { authorization: `Bearer ${token}` } });
      const auditArch = await prisma.auditLog.findFirst({ where: { businessId: biz.id, action: "NOTIFICATION_ARCHIVED", entityId: nId } });
      expect(auditArch).toBeTruthy();
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${nId}/unarchive`, headers: { authorization: `Bearer ${token}` } });
      const auditUnarch = await prisma.auditLog.findFirst({ where: { businessId: biz.id, action: "NOTIFICATION_UNARCHIVED", entityId: nId } });
      expect(auditUnarch).toBeTruthy();
    });

    it("archive does not break unread count", async () => {
      const { token } = await signup(`archUnread${Date.now()}@test.com`);
      const biz = await createBusiness(token);
      const cr1 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "A", message: "msg" } });
      const cr2 = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications`, headers: { authorization: `Bearer ${token}` }, payload: { type: "SYSTEM", title: "B", message: "msg" } });
      const id2 = JSON.parse(cr2.body).data.id;
      const before = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications/unread-count`, headers: { authorization: `Bearer ${token}` } });
      expect(JSON.parse(before.body).data.count).toBe(2);
      // Archive one unread
      await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/notifications/${id2}/archive`, headers: { authorization: `Bearer ${token}` } });
      const after = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/notifications/unread-count`, headers: { authorization: `Bearer ${token}` } });
      // Archived unread should not appear in unread count
      expect(JSON.parse(after.body).data.count).toBe(1);
    });

    it("tenant isolation for archive", async () => {
      const a = await signup(`archTenantA${Date.now()}@test.com`);
      const b = await signup(`archTenantB${Date.now()}@test.com`);
      const bizA = await createBusiness(a.token);
      const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/notifications`, headers: { authorization: `Bearer ${a.token}` }, payload: { type: "SYSTEM", title: "A's", message: "msg" } });
      const nId = JSON.parse(cr.body).data.id;
      const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/notifications/${nId}/archive`, headers: { authorization: `Bearer ${b.token}` } });
      expect([403, 404].includes(res.statusCode)).toBe(true);
      const notif = await prisma.notification.findUnique({ where: { id: nId } });
      expect(notif!.archivedAt).toBeNull();
    });
  });
});
