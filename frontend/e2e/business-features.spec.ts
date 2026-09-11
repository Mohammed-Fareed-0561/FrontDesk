import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@royalbakes.test";
const DEMO_PASS = "demo12345";
const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("UX-01 Business Features", () => {
  test("business types API returns all types", async ({ request }) => {
    const res = await request.get(`${API}/business-types`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(16);
    const bakery = body.data.find((t: any) => t.value === "bakery");
    expect(bakery).toBeTruthy();
    expect(bakery.profile.recommended).toContain("catalog");
  });

  test("capabilities API returns defaults for demo business", async ({ request }) => {
    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: DEMO_EMAIL, password: DEMO_PASS },
    });
    expect(loginRes.ok()).toBeTruthy();
    const token = (await loginRes.json()).data.token;

    const bizList = await request.get(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const businesses = (await bizList.json()).data;
    expect(businesses.length).toBeGreaterThan(0);
    const bizId = businesses[0].id;

    const capRes = await request.get(`${API}/businesses/${bizId}/capabilities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(capRes.ok()).toBeTruthy();
    const caps = (await capRes.json()).data;
    expect(caps.businessType).toBe("bakery");
    expect(caps.enabledModules).toContain("website");
    expect(caps.enabledModules).toContain("catalog");
  });

  test("capabilities can be updated", async ({ request }) => {
    const loginRes = await request.post(`${API}/auth/login`, {
      data: { email: DEMO_EMAIL, password: DEMO_PASS },
    });
    const token = (await loginRes.json()).data.token;

    const bizList = await request.get(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bizId = (await bizList.json()).data[0].id;

    const updateRes = await request.patch(`${API}/businesses/${bizId}/capabilities`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { enabledModules: ["website", "catalog", "orders", "bookings"] },
    });
    expect(updateRes.ok()).toBeTruthy();

    const verifyRes = await request.get(`${API}/businesses/${bizId}/capabilities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const caps = (await verifyRes.json()).data;
    expect(caps.enabledModules).toContain("website");
    expect(caps.enabledModules).toContain("orders");
    expect(caps.enabledModules).toContain("bookings");
  });

  test("tenant isolation prevents cross-business capability access", async ({ request }) => {
    const emailA = `capA${Date.now()}@test.com`;
    const emailB = `capB${Date.now()}@test.com`;

    const signupA = await request.post(`${API}/auth/signup`, {
      data: { email: emailA, password: "password123" },
    });
    const tokenA = (await signupA.json()).data.token;

    const bizARes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: { name: `CapBizA${Date.now()}` },
    });
    const bizAId = (await bizARes.json()).data.id;

    const signupB = await request.post(`${API}/auth/signup`, {
      data: { email: emailB, password: "password123" },
    });
    const tokenB = (await signupB.json()).data.token;

    const readAsB = await request.get(`${API}/businesses/${bizAId}/capabilities`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(readAsB.status()).toBeGreaterThanOrEqual(403);

    const writeAsB = await request.patch(`${API}/businesses/${bizAId}/capabilities`, {
      headers: { Authorization: `Bearer ${tokenB}` },
      data: { enabledModules: ["website"] },
    });
    expect(writeAsB.status()).toBeGreaterThanOrEqual(403);
  });

  test("settings page shows business features section", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/settings");
    await expect(page.getByRole("heading", { name: "Business Features" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("main").getByText("Website")).toBeVisible();
    await expect(page.getByRole("main").getByText("Catalog")).toBeVisible();
  });

  test("business type is displayed as label not raw value", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/business");
    await expect(page.locator("div.inline-flex").filter({ hasText: /^Bakery$/ }).first()).toBeVisible({ timeout: 15000 });
  });
});
