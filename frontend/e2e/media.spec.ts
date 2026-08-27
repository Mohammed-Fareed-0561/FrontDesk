import { test, expect } from "@playwright/test";

const API = "http://localhost:4000/api/v1";

async function signup(request: any, email: string) {
  const r = await request.post(`${API}/auth/signup`, { data: { email, password: "password123" } });
  return (await r.json()).data;
}

test.describe("Media — storage adapter", () => {
  test("public storefront still shows product images (media public)", async ({ page }) => {
    await page.goto("/b/royal-bakes");
    await expect(page.getByText("Royal Bakes").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Chocolate Truffle Cake").first()).toBeVisible();
  });

  test("authenticated media list accessible, unauthenticated denied", async ({ request }) => {
    const email = `media${Date.now()}@test.com`;
    const { token } = await signup(request, email);
    const bizRes = await request.post(`${API}/businesses`, { headers: { Authorization: `Bearer ${token}` }, data: { name: `MediaBiz${Date.now()}` } });
    const biz = (await bizRes.json()).data;
    const list = await request.get(`${API}/businesses/${biz.id}/media`, { headers: { Authorization: `Bearer ${token}` } });
    expect(list.ok()).toBeTruthy();
    const unauth = await request.get(`${API}/businesses/${biz.id}/media`);
    expect(unauth.status()).toBe(401);
  });
});
