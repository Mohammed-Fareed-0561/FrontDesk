import { test, expect, request } from "@playwright/test";

const BASE_URL = "http://localhost:4000";

async function createAccount() {
  const api = await request.newContext({ baseURL: BASE_URL });
  const email = `onboard-e2e-${Date.now()}@test.com`;
  const password = "testpass12345";
  const signupRes = await api.post("/api/v1/auth/signup", {
    data: { email, password, displayName: "Onboarding Test User" },
  });
  expect(signupRes.ok()).toBeTruthy();
  const body = await signupRes.json();
  const token = body.data.token;
  return { api, token, email, password };
}

test.describe("Onboarding API Tests", () => {
  test("create business with enabledModules and complete setup", async () => {
    const { api, token } = await createAccount();

    // Create business with controlled type + capabilities
    const bizRes = await api.post("/api/v1/businesses", {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: "E2E Restaurant",
        businessType: "restaurant",
        enabledModules: ["website", "menu", "orders", "bookings", "customers", "insights"],
      },
    });
    expect(bizRes.ok()).toBeTruthy();
    const { data: biz } = await bizRes.json();
    expect(biz.name).toBe("E2E Restaurant");
    expect(biz.businessType).toBe("restaurant");
    expect(biz.setupComplete).toBe(false);

    const modules = JSON.parse(biz.enabledModules);
    expect(modules).toContain("menu");
    expect(modules).toContain("orders");
    expect(modules).toContain("bookings");

    // Complete setup
    const completeRes = await api.patch(`/api/v1/businesses/${biz.id}/complete-setup`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(completeRes.ok()).toBeTruthy();
    const { data: completed } = await completeRes.json();
    expect(completed.setupComplete).toBe(true);

    // Verify persisted
    const getRes = await api.get(`/api/v1/businesses/${biz.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(getRes.ok()).toBeTruthy();
    const { data: fetched } = await getRes.json();
    expect(fetched.setupComplete).toBe(true);
  });

  test("create salon with salon defaults", async () => {
    const { api, token } = await createAccount();

    const bizRes = await api.post("/api/v1/businesses", {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: "E2E Salon", businessType: "salon" },
    });
    expect(bizRes.ok()).toBeTruthy();
    const { data: biz } = await bizRes.json();

    const capsRes = await api.get(`/api/v1/businesses/${biz.id}/capabilities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data: caps } = await capsRes.json();
    expect(caps.enabledModules).toContain("services");
    expect(caps.enabledModules).toContain("bookings");
    expect(caps.enabledModules).not.toContain("orders");
  });

  test("tenant isolation: cannot complete setup for another user business", async () => {
    const { api, token: tokenA } = await createAccount();
    const { token: tokenB } = await createAccount();

    // User A creates business
    const bizARes = await api.post("/api/v1/businesses", {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: { name: "Tenant A Biz" },
    });
    const { data: bizA } = await bizARes.json();

    // User B tries to complete setup for User A's business
    const res = await api.patch(`/api/v1/businesses/${bizA.id}/complete-setup`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(res.status());
  });

  test("unauthenticated user cannot complete setup", async () => {
    const { api, token } = await createAccount();

    const bizRes = await api.post("/api/v1/businesses", {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: "Unauth Biz" },
    });
    const { data: biz } = await bizRes.json();

    // Try without token
    const res = await api.patch(`/api/v1/businesses/${biz.id}/complete-setup`);
    expect(res.status()).toBe(401);
  });

  test("setupComplete defaults to false", async () => {
    const { api, token } = await createAccount();

    const bizRes = await api.post("/api/v1/businesses", {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: "Default Setup Biz" },
    });
    const { data: biz } = await bizRes.json();
    expect(biz.setupComplete).toBe(false);
  });

  test("user with zero businesses gets empty array", async () => {
    const { api, token } = await createAccount();

    const res = await api.get("/api/v1/businesses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const { data: businesses } = await res.json();
    expect(Array.isArray(businesses)).toBeTruthy();
    expect(businesses.length).toBe(0);
  });
});

test.describe("Onboarding E2E - Browser", () => {
  const testEmail = `onboard-browser-${Date.now()}@test.com`;
  const testPassword = "testpass12345";

  test("signup redirects to onboarding", async ({ page }) => {
    await page.goto("http://localhost:3000/signup");

    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/onboarding", { timeout: 15000 });
    await expect(page).toHaveURL(/.*onboarding/);
  });

  test("onboarding has all 5 steps", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL("**/onboarding", { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    // Step 1: Welcome
    await expect(page.locator("text=Let's set up your business")).toBeVisible({ timeout: 10000 });

    // Navigate through steps
    await page.click("text=Get started");
    // Step 2: Business Type
    await expect(page.locator("text=What type of business do you run?")).toBeVisible();

    // Select a type
    await page.click("text=Restaurant");

    // Step 3: Business Basics
    await expect(page.locator("text=Tell us about your business")).toBeVisible();
    await page.fill('input#biz-name', "Test Restaurant");
    await page.click("text=Continue");

    // Step 4: Features
    await expect(page.locator("text=Choose the tools you need")).toBeVisible();

    // Step 5: Summary
    await page.click("text=Continue");
    await expect(page.locator("text=Your FrontDesk setup")).toBeVisible();
  });
});
