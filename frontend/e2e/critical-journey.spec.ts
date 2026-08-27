import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@royalbakes.test";
const DEMO_PASS = "demo12345";
const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("FrontDesk Critical Journey v0.1", () => {
  test("health: backend /api/v1/health", async ({ request }) => {
    const res = await request.get("http://localhost:4000/api/v1/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("public redirect / -> /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("FrontDesk")).toBeVisible();
  });

  test("login with demo credentials -> dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/Royal Bakes|Business|Dashboard/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("public storefront /b/royal-bakes", async ({ page }) => {
    await page.goto("/b/royal-bakes");
    await expect(page.getByText("Royal Bakes").first()).toBeVisible({ timeout: 10000 });
  });

  test("tenant isolation via API", async ({ request }) => {
    const emailA = `a${Date.now()}@test.com`;
    const emailB = `b${Date.now()}@test.com`;
    const signupA = await request.post(`${API}/auth/signup`, {
      data: { email: emailA, password: "password123", displayName: "A" },
    });
    expect(signupA.ok()).toBeTruthy();
    const tokenA = (await signupA.json()).data.token;
    const bizA = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${tokenA}` },
      data: { name: `BizA${Date.now()}` },
    });
    expect(bizA.ok()).toBeTruthy();
    const bizId = (await bizA.json()).data.id;

    const signupB = await request.post(`${API}/auth/signup`, {
      data: { email: emailB, password: "password123", displayName: "B" },
    });
    const tokenB = (await signupB.json()).data.token;
    const getAsB = await request.get(`${API}/businesses/${bizId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404].includes(getAsB.status())).toBeTruthy();
  });

  test("catalog flow: create product isolated", async ({ request }) => {
    const email = `cat${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123" },
    });
    const token = (await signup.json()).data.token;
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `CatBiz${Date.now()}` },
    });
    const biz = await bizRes.json();
    const bizId = biz.data.id;
    const prod = await request.post(`${API}/businesses/${bizId}/products`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: "E2E Cake", price: 999, status: "active" },
    });
    expect(prod.ok()).toBeTruthy();
    const prods = await request.get(`${API}/businesses/${bizId}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(prods.ok()).toBeTruthy();
  });
});
