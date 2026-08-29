import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:4000/api/v1";

async function signup(request: any, email: string) {
  const res = await request.post(`${API}/auth/signup`, {
    data: { email, password: "password123", displayName: email.split("@")[0] },
  });
  if (!res.ok()) {
    const login = await request.post(`${API}/auth/login`, {
      data: { email, password: "password123" },
    });
    return (await login.json()).data;
  }
  return (await res.json()).data;
}

test.describe("Automations — E2E API", () => {
  test("full lifecycle: create → enable → trigger → verify run", async ({ request }) => {
    const email = `auto-e2e-${Date.now()}@test.com`;
    const { token } = await signup(request, email);

    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `AutoBiz${Date.now()}` },
    });
    expect(bizRes.ok()).toBeTruthy();
    const biz = (await bizRes.json()).data;

    // 1. Create automation
    const createRes = await request.post(`${API}/businesses/${biz.id}/automations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: "E2E Enquiry Alert",
        triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }),
        actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]),
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const auto = (await createRes.json()).data;
    expect(auto.name).toBe("E2E Enquiry Alert");
    expect(auto.status).toBe("draft");

    // 2. Enable automation
    const enableRes = await request.post(`${API}/businesses/${biz.id}/automations/${auto.id}/enable`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(enableRes.ok()).toBeTruthy();
    expect((await enableRes.json()).data.status).toBe("active");

    // 3. Manual trigger
    const triggerRes = await request.post(`${API}/businesses/${biz.id}/automations/${auto.id}/trigger`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(triggerRes.ok()).toBeTruthy();
    const triggerResult = (await triggerRes.json()).data;
    expect(triggerResult.status).toBe("completed");

    // 4. View runs
    const runsRes = await request.get(`${API}/businesses/${biz.id}/automations/${auto.id}/runs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(runsRes.ok()).toBeTruthy();
    const runs = (await runsRes.json()).data;
    expect(runs.length).toBeGreaterThan(0);
    expect(runs[0].status).toBe("completed");

    // 5. Disable
    const disableRes = await request.post(`${API}/businesses/${biz.id}/automations/${auto.id}/disable`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(disableRes.ok()).toBeTruthy();
    expect((await disableRes.json()).data.status).toBe("inactive");
  });

  test("disabled automation does not execute on trigger", async ({ request }) => {
    const email = `auto-disabled-${Date.now()}@test.com`;
    const { token } = await signup(request, email);

    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `DisabledBiz${Date.now()}` },
    });
    const biz = (await bizRes.json()).data;

    const createRes = await request.post(`${API}/businesses/${biz.id}/automations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: "Disabled Auto",
        triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }),
        actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]),
      },
    });
    const auto = (await createRes.json()).data;

    // Try triggering while in draft (not active)
    const triggerRes = await request.post(`${API}/businesses/${biz.id}/automations/${auto.id}/trigger`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(triggerRes.status()).toBe(422);
  });

  test("event-driven: enquiry triggers matching automation", async ({ request }) => {
    const email = `auto-event-${Date.now()}@test.com`;
    const { token } = await signup(request, email);

    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `EventBiz${Date.now()}` },
    });
    const biz = (await bizRes.json()).data;

    // Create and enable automation
    const createRes = await request.post(`${API}/businesses/${biz.id}/automations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: "Enquiry Auto",
        triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }),
        actionsConfig: JSON.stringify([{ actionKey: "CREATE_PRODUCT" }]),
      },
    });
    const auto = (await createRes.json()).data;
    await request.post(`${API}/businesses/${biz.id}/automations/${auto.id}/enable`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Create a customer
    const custRes = await request.post(`${API}/businesses/${biz.id}/customers`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: "Event Customer", phone: "+919999999900" },
    });
    const cust = (await custRes.json()).data;

    // Create enquiry (triggers ENQUIRY_CREATED → dispatches to automation)
    await request.post(`${API}/businesses/${biz.id}/enquiries`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { customerId: cust.id, subject: "Test", message: "Hello" },
    });

    // Wait for async dispatch
    await new Promise((r) => setTimeout(r, 1500));

    const runsRes = await request.get(`${API}/businesses/${biz.id}/automations/${auto.id}/runs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const runs = (await runsRes.json()).data;
    expect(runs.length).toBeGreaterThan(0);
    expect(runs.some((r: any) => r.status === "completed")).toBeTruthy();
  });

  test("cross-tenant: B cannot access A's automations", async ({ request }) => {
    const a = await signup(request, `autoA-${Date.now()}@test.com`);
    const b = await signup(request, `autoB-${Date.now()}@test.com`);
    const bizA = (await (await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${a.token}` },
      data: { name: `BizA${Date.now()}` },
    })).json()).data;

    await request.post(`${API}/businesses/${bizA.id}/automations`, {
      headers: { Authorization: `Bearer ${a.token}` },
      data: { name: "A's Auto", triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED" }) },
    });

    const listAsB = await request.get(`${API}/businesses/${bizA.id}/automations`, {
      headers: { Authorization: `Bearer ${b.token}` },
    });
    expect([403, 404].includes(listAsB.status())).toBeTruthy();
  });

  test("malicious config is rejected (shell command)", async ({ request }) => {
    const email = `auto-sec-${Date.now()}@test.com`;
    const { token } = await signup(request, email);

    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `SecBiz${Date.now()}` },
    });
    const biz = (await bizRes.json()).data;

    const res = await request.post(`${API}/businesses/${biz.id}/automations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: "Shell Attack",
        triggerConfig: JSON.stringify({ eventType: "ENQUIRY_CREATED", exec: "rm -rf /" }),
      },
    });
    expect(res.status()).toBe(422);
  });
});

test.describe("Automations — UI Navigation", () => {
  const DEMO_EMAIL = "demo@royalbakes.test";
  const DEMO_PASS = "demo12345";

  test("automations page loads and shows create form", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to automations
    await page.goto("/dashboard/automations");
    await expect(page.getByText("Automations")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Create Automation")).toBeVisible({ timeout: 10000 });
  });

  test("create automation via UI form", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await page.goto("/dashboard/automations");
    await expect(page.getByText("Create Automation")).toBeVisible({ timeout: 10000 });

    // Fill form
    await page.fill('input[placeholder*="enquiry"]', "UI Test Automation");
    await page.fill('input[placeholder*="does"]', "Test automation from E2E");

    // Submit
    await page.click('button:has-text("Create Automation")');

    // Should show the new automation in the list
    await expect(page.getByText("UI Test Automation")).toBeVisible({ timeout: 10000 });
  });
});
