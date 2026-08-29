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
  const r = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name: `Biz${Date.now()}` } });
  return JSON.parse(r.body).data;
}

describe("Automation Engine — P0", () => {
  it("creates automation with valid config", async () => {
    const { token } = await signup(`auto1${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Enquiry Alert", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }), actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]) },
    });
    expect(res.statusCode).toBe(201);
    const auto = JSON.parse(res.body).data;
    expect(auto.name).toBe("Enquiry Alert");
    expect(auto.status).toBe("draft");
  });

  it("rejects automation with dangerous trigger config", async () => {
    const { token } = await signup(`auto2${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Bad", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED", exec: "rm -rf /" }) },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects automation with eval in conditions", async () => {
    const { token } = await signup(`auto3${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Bad", conditionsConfig: JSON.stringify([{ field: "x", op: "gt", value: "eval('1+1')" }]) },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects automation with unsupported trigger", async () => {
    const { token } = await signup(`auto4${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Bad", triggerConfig: JSON.stringify({ eventType: "NONEXISTENT_EVENT" }) },
    });
    expect(res.statusCode).toBe(422);
  });

  it("lists automations", async () => {
    const { token } = await signup(`auto5${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Test", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.length).toBe(1);
  });

  it("enables and disables automation", async () => {
    const { token } = await signup(`auto6${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Toggle", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const id = JSON.parse(cr.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/enable`, headers: { authorization: `Bearer ${token}` } });
    const enabled = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations/${id}`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(enabled.body).data.status).toBe("active");
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/disable`, headers: { authorization: `Bearer ${token}` } });
    const disabled = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations/${id}`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(disabled.body).data.status).toBe("inactive");
  });

  it("manual trigger creates run", async () => {
    const { token } = await signup(`auto7${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Manual", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const id = JSON.parse(cr.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/enable`, headers: { authorization: `Bearer ${token}` } });
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/trigger`, headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    const result = JSON.parse(res.body).data;
    expect(result.status).toBe("completed");
  });

  it("disabled automation does not execute on manual trigger", async () => {
    const { token } = await signup(`auto8${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Disabled", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const id = JSON.parse(cr.body).data.id;
    // Status is "draft" by default — not active
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/trigger`, headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(422);
  });

  it("tenant isolation: B cannot access A's automations", async () => {
    const a = await signup(`autoA${Date.now()}@test.com`);
    const b = await signup(`autoB${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/automations`, headers: { authorization: `Bearer ${a.token}` }, payload: { name: "A's", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const listB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizA.id}/automations`, headers: { authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(listB.statusCode)).toBe(true);
  });

  it("action requiring approval creates approval request", async () => {
    const { token } = await signup(`auto9${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Price Update", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }), actionsConfig: JSON.stringify([{ actionKey: "UPDATE_PRODUCT" }]) },
    });
    const id = JSON.parse(cr.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/enable`, headers: { authorization: `Bearer ${token}` } });
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/trigger`, headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    // Check approval was created
    const approvals = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/approvals`, headers: { authorization: `Bearer ${token}` } });
    const pending = JSON.parse(approvals.body).data.filter((a: any) => a.status === "pending");
    expect(pending.length).toBeGreaterThan(0);
  });

  it("domain event dispatches to matching automation", async () => {
    const { token } = await signup(`auto10${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // Create automation matching ENQUIRY_CREATED
    const cr = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Enquiry Auto", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }), actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]) },
    });
    const autoId = JSON.parse(cr.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${autoId}/enable`, headers: { authorization: `Bearer ${token}` } });

    // Create an enquiry (emits ENQUIRY_CREATED domain event → dispatches to automation)
    const cust = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/customers`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Test Customer", phone: "+919999999999" } });
    const custId = JSON.parse(cust.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/enquiries`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: custId, subject: "Test", message: "Hello" } });

    // Wait for async dispatch to complete
    await new Promise((r) => setTimeout(r, 1000));
    const runs = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations/${autoId}/runs`, headers: { authorization: `Bearer ${token}` } });
    const runData = JSON.parse(runs.body).data;
    expect(runData.length).toBeGreaterThan(0);
    expect(runData.some((r: any) => r.status === "completed")).toBe(true);
  });

  it("condition evaluation prevents execution when not met", async () => {
    const { token } = await signup(`auto11${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    // Create automation with condition that won't be met
    const cr = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: "Conditional",
        triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }),
        conditionsConfig: JSON.stringify([{ field: "nonexistent", op: "gt", value: 999 }]),
        actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]),
      },
    });
    const autoId = JSON.parse(cr.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${autoId}/enable`, headers: { authorization: `Bearer ${token}` } });
    const res = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${autoId}/trigger`, headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.status).toBe("skipped"); // Condition not met, run skipped
  });

  it("audit log created on automation operations", async () => {
    const { token } = await signup(`auto12${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Audit", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const autoId = JSON.parse(cr.body).data.id;
    const logs = await prisma.auditLog.findMany({ where: { businessId: biz.id, entityId: autoId } });
    expect(logs.some((l) => l.action === "AUTOMATION_CREATED")).toBe(true);
  });

  it("requires authentication", async () => {
    const { token } = await signup(`auto13${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations` });
    expect(res.statusCode).toBe(401);
  });

  it("delete automation", async () => {
    const { token } = await signup(`auto14${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "ToDelete", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const id = JSON.parse(cr.body).data.id;
    const del = await app.inject({ method: "DELETE", url: `/api/v1/businesses/${biz.id}/automations/${id}`, headers: { authorization: `Bearer ${token}` } });
    expect(del.statusCode).toBe(204);
    const list = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` } });
    expect(JSON.parse(list.body).data.length).toBe(0);
  });

  it("malicious shell command in action config is rejected", async () => {
    const { token } = await signup(`auto15${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Shell", actionsConfig: JSON.stringify([{ actionKey: "exec", params: { command: "rm -rf /" } }]) },
    });
    expect(res.statusCode).toBe(422);
  });

  it("update automation config", async () => {
    const { token } = await signup(`autoU${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Original", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const id = JSON.parse(cr.body).data.id;
    const res = await app.inject({ method: "PATCH", url: `/api/v1/businesses/${biz.id}/automations/${id}`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Updated" } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.name).toBe("Updated");
  });

  it("get automation by ID", async () => {
    const { token } = await signup(`autoG${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "FetchMe", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const id = JSON.parse(cr.body).data.id;
    const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations/${id}`, headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).data.name).toBe("FetchMe");
  });

  it("cross-tenant event does not trigger B's automation", async () => {
    const a = await signup(`autoXa${Date.now()}@test.com`);
    const b = await signup(`autoXb${Date.now()}@test.com`);
    const bizA = await createBusiness(a.token);
    const bizB = await createBusiness(b.token);
    // B creates automation
    const crB = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizB.id}/automations`, headers: { authorization: `Bearer ${b.token}` }, payload: { name: "B Auto", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }), actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]) } });
    const autoBId = JSON.parse(crB.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${bizB.id}/automations/${autoBId}/enable`, headers: { authorization: `Bearer ${b.token}` } });
    // A creates enquiry (emits event for bizA)
    const custA = await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/customers`, headers: { authorization: `Bearer ${a.token}` }, payload: { name: "CustA", phone: "+919999999998" } });
    const custAId = JSON.parse(custA.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${bizA.id}/enquiries`, headers: { authorization: `Bearer ${a.token}` }, payload: { customerId: custAId, subject: "A", message: "Hi" } });
    await new Promise((r) => setTimeout(r, 1000));
    // B's automation should NOT have runs
    const runsB = await app.inject({ method: "GET", url: `/api/v1/businesses/${bizB.id}/automations/${autoBId}/runs`, headers: { authorization: `Bearer ${b.token}` } });
    const runDataB = JSON.parse(runsB.body).data;
    expect(runDataB.length).toBe(0);
  });

  it("idempotency: same event does not create duplicate runs", async () => {
    const { token } = await signup(`autoId${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "Idempotent", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }), actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]) } });
    const autoId = JSON.parse(cr.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${autoId}/enable`, headers: { authorization: `Bearer ${token}` } });
    const cust = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/customers`, headers: { authorization: `Bearer ${token}` }, payload: { name: "IdemCust", phone: "+919999999997" } });
    const custId = JSON.parse(cust.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/enquiries`, headers: { authorization: `Bearer ${token}` }, payload: { customerId: custId, subject: "Idem", message: "Test" } });
    await new Promise((r) => setTimeout(r, 1500));
    const runs = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations/${autoId}/runs`, headers: { authorization: `Bearer ${token}` } });
    const runData = JSON.parse(runs.body).data;
    // Should have exactly 1 run, not duplicates
    expect(runData.length).toBe(1);
  });

  it("malicious JavaScript in trigger config is rejected", async () => {
    const { token } = await signup(`autoJS${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const res = await app.inject({
      method: "POST", url: `/api/v1/businesses/${biz.id}/automations`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "JS Bad", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED", code: "require('child_process').execSync('whoami')" }) },
    });
    expect(res.statusCode).toBe(422);
  });

  it("automation runs endpoint returns runs", async () => {
    const { token } = await signup(`autoR${Date.now()}@test.com`);
    const biz = await createBusiness(token);
    const cr = await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations`, headers: { authorization: `Bearer ${token}` }, payload: { name: "RunsTest", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) } });
    const id = JSON.parse(cr.body).data.id;
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/enable`, headers: { authorization: `Bearer ${token}` } });
    await app.inject({ method: "POST", url: `/api/v1/businesses/${biz.id}/automations/${id}/trigger`, headers: { authorization: `Bearer ${token}` } });
    const res = await app.inject({ method: "GET", url: `/api/v1/businesses/${biz.id}/automations/${id}/runs`, headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    const runs = JSON.parse(res.body).data;
    expect(runs.length).toBeGreaterThan(0);
    expect(runs[0].status).toBe("completed");
  });

  it("supported triggers endpoint returns list", async () => {
    const { token } = await signup(`auto16${Date.now()}@test.com`);
    const res = await app.inject({ method: "GET", url: "/api/v1/automations/triggers", headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    const triggers = JSON.parse(res.body).data;
    expect(triggers.length).toBeGreaterThan(0);
    expect(triggers.some((t: any) => t.eventType === "ENQUIRY_CREATED")).toBe(true);
  });
});
