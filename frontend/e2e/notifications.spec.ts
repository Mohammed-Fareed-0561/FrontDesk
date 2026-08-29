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

test.describe("Notifications — E2E API", () => {
  test("full lifecycle: create → list → mark read → mark all read", async ({ request }) => {
    const email = `notif-e2e-${Date.now()}@test.com`;
    const { token } = await signup(request, email);

    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `NotifBiz${Date.now()}` },
    });
    expect(bizRes.ok()).toBeTruthy();
    const biz = (await bizRes.json()).data;

    // 1. Create notifications
    const n1 = await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "INSIGHT", title: "Test Insight", message: "High priority insight", severity: "high" },
    });
    expect(n1.ok()).toBeTruthy();
    const notif1 = (await n1.json()).data;
    expect(notif1.status).toBe("unread");

    const n2 = await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "BOOKING", title: "New Booking", message: "Booking created", severity: "info" },
    });
    expect(n2.ok()).toBeTruthy();

    // 2. List notifications
    const list = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(list.ok()).toBeTruthy();
    expect((await list.json()).data.length).toBe(2);

    // 3. Get unread count
    const count = await request.get(`${API}/businesses/${biz.id}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(count.ok()).toBeTruthy();
    expect((await count.json()).data.count).toBe(2);

    // 4. Mark one as read
    const markRead = await request.post(`${API}/businesses/${biz.id}/notifications/${notif1.id}/read`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(markRead.ok()).toBeTruthy();

    // 5. Verify unread count dropped
    const count2 = await request.get(`${API}/businesses/${biz.id}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await count2.json()).data.count).toBe(1);

    // 6. Mark all as read
    const markAll = await request.post(`${API}/businesses/${biz.id}/notifications/read-all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(markAll.ok()).toBeTruthy();
    expect((await markAll.json()).data.marked).toBe(1);

    // 7. Verify all read
    const count3 = await request.get(`${API}/businesses/${biz.id}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await count3.json()).data.count).toBe(0);
  });

  test("tenant isolation: B cannot read A's notifications", async ({ request }) => {
    const a = await signup(request, `notifA-${Date.now()}@test.com`);
    const b = await signup(request, `notifB-${Date.now()}@test.com`);
    const bizA = (await (await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${a.token}` },
      data: { name: `NotifBizA${Date.now()}` },
    })).json()).data;

    await request.post(`${API}/businesses/${bizA.id}/notifications`, {
      headers: { Authorization: `Bearer ${a.token}` },
      data: { type: "SYSTEM", title: "Private", message: "secret" },
    });

    const res = await request.get(`${API}/businesses/${bizA.id}/notifications`, {
      headers: { Authorization: `Bearer ${b.token}` },
    });
    expect([403, 404].includes(res.status())).toBeTruthy();
  });
});

test.describe("Notifications — UI Navigation", () => {
  const DEMO_EMAIL = "demo@royalbakes.test";
  const DEMO_PASS = "demo12345";

  test("notification bell visible in topbar", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Bell icon should be visible
    await expect(page.locator("header button").filter({ has: page.locator("svg") }).first()).toBeVisible();
  });

  test("notifications page loads", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await page.goto("/dashboard/notifications");
    await expect(page.getByText("Notifications")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("View all notifications", { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test("notifications page shows empty state", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await page.goto("/dashboard/notifications");
    await expect(page.getByText("Notifications")).toBeVisible({ timeout: 10000 });
    // Empty state or notification list should be visible
    await expect(page.getByText(/No notifications|unread/)).toBeVisible({ timeout: 10000 });
  });
});
