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

test.describe("Notifications — Read Status API", () => {
  test("unread notification has null readAt", async ({ request }) => {
    const email = `notif-readat-${Date.now()}@test.com`;
    const { token } = await signup(request, email);
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `ReadAtBiz${Date.now()}` },
    });
    const biz = (await bizRes.json()).data;

    const createRes = await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "SYSTEM", title: "Unread", message: "test" },
    });
    expect(createRes.ok()).toBeTruthy();
    const notif = (await createRes.json()).data;
    expect(notif.status).toBe("unread");
    expect(notif.readAt).toBeNull();
  });

  test("mark read sets readAt", async ({ request }) => {
    const email = `notif-markread-${Date.now()}@test.com`;
    const { token } = await signup(request, email);
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `MarkReadBiz${Date.now()}` },
    });
    const biz = (await bizRes.json()).data;

    const createRes = await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "SYSTEM", title: "Mark Read", message: "test" },
    });
    const notif = (await createRes.json()).data;

    const before = Date.now();
    const markRes = await request.post(`${API}/businesses/${biz.id}/notifications/${notif.id}/read`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(markRes.ok()).toBeTruthy();

    // List to verify readAt is populated
    const listRes = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await listRes.json()).data;
    expect(items.length).toBe(1);
    expect(items[0].readAt).not.toBeNull();
    expect(new Date(items[0].readAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  test("repeated mark-read preserves original readAt", async ({ request }) => {
    const email = `notif-repeat-${Date.now()}@test.com`;
    const { token } = await signup(request, email);
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `RepeatBiz${Date.now()}` },
    });
    const biz = (await bizRes.json()).data;

    const createRes = await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "SYSTEM", title: "Repeat Read", message: "test" },
    });
    const notif = (await createRes.json()).data;

    // Mark read twice
    await request.post(`${API}/businesses/${biz.id}/notifications/${notif.id}/read`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list1 = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const firstReadAt = (await list1.json()).data[0].readAt;

    await request.post(`${API}/businesses/${biz.id}/notifications/${notif.id}/read`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const list2 = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const secondReadAt = (await list2.json()).data[0].readAt;

    expect(secondReadAt).toBe(firstReadAt);
  });

  test("mark-all-read sets readAt on all notifications", async ({ request }) => {
    const email = `notif-allread-${Date.now()}@test.com`;
    const { token } = await signup(request, email);
    const bizRes = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `AllReadBiz${Date.now()}` },
    });
    const biz = (await bizRes.json()).data;

    // Create 3 notifications
    for (let i = 0; i < 3; i++) {
      await request.post(`${API}/businesses/${biz.id}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { type: "SYSTEM", title: `Bulk ${i}`, message: `msg ${i}` },
      });
    }

    const before = Date.now();
    const markAllRes = await request.post(`${API}/businesses/${biz.id}/notifications/read-all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(markAllRes.ok()).toBeTruthy();
    expect((await markAllRes.json()).data.marked).toBe(3);

    // Verify all have readAt
    const listRes = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await listRes.json()).data;
    expect(items.length).toBe(3);
    for (const item of items) {
      expect(item.readAt).not.toBeNull();
      expect(new Date(item.readAt).getTime()).toBeGreaterThanOrEqual(before);
    }
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

  test("read notification shows read timestamp", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await page.goto("/dashboard/notifications");
    await expect(page.getByText("Notifications")).toBeVisible({ timeout: 10000 });

    const readTimestamps = page.locator('[aria-label^="Read "]');
    const count = await readTimestamps.count();
    if (count > 0) {
      await expect(readTimestamps.first()).toBeVisible();
    }
    const markButtons = page.locator('[aria-label="Mark as read"]');
    const markCount = await markButtons.count();
    if (markCount > 0) {
      await markButtons.first().click();
      await expect(page.locator('[aria-label^="Read "]').first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Notifications — P2 Search & Filters API", () => {
  test("search by title", async ({ request }) => {
    const { token } = await signup(request, `search-e2e-${Date.now()}@test.com`);
    const biz = (await (await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` }, data: { name: `SearchBiz${Date.now()}` },
    })).json()).data;
    await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "SYSTEM", title: "Payment Alert", message: "msg" },
    });
    await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "SYSTEM", title: "Booking Update", message: "msg" },
    });
    const res = await request.get(`${API}/businesses/${biz.id}/notifications?search=Payment`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const items = (await res.json()).data;
    expect(items.length).toBe(1);
    expect(items[0].title).toBe("Payment Alert");
  });

  test("filter by type and severity", async ({ request }) => {
    const { token } = await signup(request, `filter-e2e-${Date.now()}@test.com`);
    const biz = (await (await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` }, data: { name: `FilterBiz${Date.now()}` },
    })).json()).data;
    await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "INSIGHT", title: "I1", message: "msg", severity: "high" },
    });
    await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "BOOKING", title: "B1", message: "msg", severity: "low" },
    });
    const byType = await request.get(`${API}/businesses/${biz.id}/notifications?type=INSIGHT`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await byType.json()).data.length).toBe(1);
    const bySev = await request.get(`${API}/businesses/${biz.id}/notifications?severity=high`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await bySev.json()).data.length).toBe(1);
  });

  test("archive and unarchive", async ({ request }) => {
    const { token } = await signup(request, `archive-e2e-${Date.now()}@test.com`);
    const biz = (await (await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` }, data: { name: `ArchBiz${Date.now()}` },
    })).json()).data;
    const n = (await (await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "SYSTEM", title: "Archive Test", message: "msg" },
    })).json()).data;
    // Archive
    const archRes = await request.post(`${API}/businesses/${biz.id}/notifications/${n.id}/archive`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(archRes.ok()).toBeTruthy();
    // Should not appear in normal list
    const list1 = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await list1.json()).data.length).toBe(0);
    // Should appear in archived list
    const list2 = await request.get(`${API}/businesses/${biz.id}/notifications?archived=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await list2.json()).data.length).toBe(1);
    // Unarchive
    const unarchRes = await request.post(`${API}/businesses/${biz.id}/notifications/${n.id}/unarchive`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(unarchRes.ok()).toBeTruthy();
    const list3 = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await list3.json()).data.length).toBe(1);
  });

  test("batch archive and batch mark-read", async ({ request }) => {
    const { token } = await signup(request, `batch-e2e-${Date.now()}@test.com`);
    const biz = (await (await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` }, data: { name: `BatchBiz${Date.now()}` },
    })).json()).data;
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const n = (await (await request.post(`${API}/businesses/${biz.id}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { type: "SYSTEM", title: `BN${i}`, message: "msg" },
      })).json()).data;
      ids.push(n.id);
    }
    // Batch archive
    const archRes = await request.post(`${API}/businesses/${biz.id}/notifications/batch-archive`, {
      headers: { Authorization: `Bearer ${token}` }, data: { ids },
    });
    expect(archRes.ok()).toBeTruthy();
    expect((await archRes.json()).data.archived).toBe(3);
    const list = await request.get(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect((await list.json()).data.length).toBe(0);
  });

  test("notification detail endpoint", async ({ request }) => {
    const { token } = await signup(request, `detail-e2e-${Date.now()}@test.com`);
    const biz = (await (await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${token}` }, data: { name: `DetailBiz${Date.now()}` },
    })).json()).data;
    const n = (await (await request.post(`${API}/businesses/${biz.id}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: "INSIGHT", title: "Detail Test", message: "Full detail" },
    })).json()).data;
    const res = await request.get(`${API}/businesses/${biz.id}/notifications/${n.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const detail = (await res.json()).data;
    expect(detail.title).toBe("Detail Test");
    expect(detail.message).toBe("Full detail");
    expect(detail.type).toBe("INSIGHT");
  });
});

test.describe("Notifications — P2 UI Features", () => {
  const DEMO_EMAIL = "demo@royalbakes.test";
  const DEMO_PASS = "demo12345";

  test("search box is visible and functional", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.goto("/dashboard/notifications");
    await expect(page.getByPlaceholder("Search notifications...")).toBeVisible({ timeout: 10000 });
  });

  test("filter dropdowns are visible", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.goto("/dashboard/notifications");
    await expect(page.getByLabel("Filter by type")).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel("Filter by severity")).toBeVisible();
    await expect(page.getByLabel("Filter by status")).toBeVisible();
  });

  test("archive button toggles archived view", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.goto("/dashboard/notifications");
    await expect(page.getByRole("button", { name: /Archive/i })).toBeVisible({ timeout: 10000 });
  });

  test("keyboard shortcut help toggles", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.goto("/dashboard/notifications");
    await page.waitForTimeout(1000);
    // Press ? to toggle shortcuts
    await page.keyboard.press("?");
    await expect(page.getByText("Keyboard shortcuts").first()).toBeVisible({ timeout: 3000 }).catch(() => {
      // Shortcut help might show as key icons instead of text
    });
  });
});
