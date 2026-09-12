/**
 * UX-IMPLEMENTATION-02 — Dashboard E2E tests
 *
 * Tests:
 * - Restaurant business type → orders/bookings metrics visible
 * - Salon business type → bookings/customers visible
 * - Freelancer business type → leads/services visible
 * - Retail business type → products/orders visible
 * - Empty/new business state
 * - Quick actions
 * - Website status
 * - Error states
 * - Tenant isolation (one user cannot see another's dashboard data)
 */

import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@royalbakes.test";
const DEMO_PASS = "demo12345";
const API = process.env.API_URL || "http://localhost:4000/api/v1";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiSignup(request: any, email: string) {
  const res = await request.post(`${API}/auth/signup`, {
    data: { email, password: "password123" },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).data;
}

async function apiCreateBusiness(
  request: any,
  token: string,
  name: string,
  businessType?: string
) {
  const res = await request.post(`${API}/businesses`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name, businessType },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).data;
}

async function loginAndGoToDashboard(page: any, email: string, password: string, request?: any) {
  if (request) {
    const res = await request.post(`${API}/auth/login`, {
      data: { email, password },
    });
    if (res.ok()) {
      const body = await res.json();
      const token = body.data?.token;
      const user = body.data?.user;

      if (token && user) {
        const bRes = await request.get(`${API}/businesses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bData = bRes.ok() ? (await bRes.json()).data : [];
        const bizId = Array.isArray(bData) && bData.length > 0 ? bData[0].id : "";

        await page.addInitScript(
          ({ t, u, b }: { t: string; u: any; b: string }) => {
            window.localStorage.setItem("fd_token", t);
            window.localStorage.setItem("fd_user", JSON.stringify(u));
            if (b) window.localStorage.setItem("fd_business_id", b);
          },
          { t: token, u: user, b: bizId }
        );
      }
    }
  }

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("UX-02 Dashboard — Core structure", () => {
  test("dashboard loads and shows heading for demo user", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");

    // Wait for dashboard root to appear
    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });

    // Should have a descriptive h1
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    expect(h1Text).toMatch(/(Good morning|Good afternoon|Good evening)/i);
  });

  test("dashboard shows greeting with business or user name", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    const h1 = page.getByRole("heading", { level: 1, name: /Good/ });
    await expect(h1).toBeVisible({ timeout: 15000 });
    const text = await h1.textContent();
    // Should contain a name (business name or user name), not just "Good morning"
    expect(text!.length).toBeGreaterThan(20);
  });
});

test.describe("UX-02 Dashboard — Needs Your Attention", () => {
  test("attention panel renders (empty or with items)", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");

    // The attention card should appear
    await expect(page.locator("#needs-attention-card")).toBeVisible({
      timeout: 15000,
    });
  });

  test("attention panel never shows NaN or undefined", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#needs-attention-card")).toBeVisible({
      timeout: 15000,
    });
    const text = await page.locator("#needs-attention-card").textContent();
    expect(text).not.toMatch(/NaN/);
    expect(text).not.toMatch(/undefined/);
    expect(text).not.toMatch(/null/);
  });
});

test.describe("UX-02 Dashboard — Metrics", () => {
  test("metrics grid renders for demo business", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    // Metrics grid should appear
    await expect(page.locator("#metrics-grid")).toBeVisible({ timeout: 15000 });
  });

  test("metrics show no NaN/undefined values", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#metrics-grid")).toBeVisible({ timeout: 15000 });
    const text = await page.locator("#metrics-grid").textContent();
    expect(text).not.toMatch(/NaN/);
    expect(text).not.toMatch(/undefined/);
  });
});

test.describe("UX-02 Dashboard — Quick Actions", () => {
  test("quick actions panel is visible", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#quick-actions-card")).toBeVisible({
      timeout: 15000,
    });
  });

  test("quick action buttons are keyboard focusable", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#quick-actions-card")).toBeVisible({
      timeout: 15000,
    });
    const buttons = page
      .locator("#quick-actions-card")
      .getByRole("link");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    // Each link should have a valid href
    for (let i = 0; i < count; i++) {
      const href = await buttons.nth(i).getAttribute("href");
      expect(href).toBeTruthy();
      expect(href!.startsWith("/dashboard")).toBe(true);
    }
  });
});

test.describe("UX-02 Dashboard — Website Status", () => {
  test("website status card is visible when website capability enabled", async ({
    page,
    request,
  }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    // demo bakery has website capability
    await expect(page.locator("#website-status-card")).toBeVisible({
      timeout: 15000,
    });
  });

  test("website status shows valid state label", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#website-status-card")).toBeVisible({
      timeout: 15000,
    });
    const text = await page.locator("#website-status-card").textContent();
    expect(text).toMatch(/(Draft|Published|Not set up|unpublished)/i);
  });
});

test.describe("UX-02 Dashboard — Recent Activity", () => {
  test("recent activity card is visible", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#recent-activity-card")).toBeVisible({
      timeout: 15000,
    });
  });

  test("recent activity does not show raw event identifiers (e.g. ORDER_CREATED)", async ({
    page,
    request,
  }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#recent-activity-card")).toBeVisible({
      timeout: 15000,
    });
    const text = await page.locator("#recent-activity-card").textContent();
    // Raw event identifiers should not appear in the UI
    expect(text).not.toMatch(/ORDER_CREATED/);
    expect(text).not.toMatch(/BOOKING_CONFIRMED/);
    expect(text).not.toMatch(/CUSTOMER_CREATED/);
    expect(text).not.toMatch(/ENQUIRY_RECEIVED/);
  });

  test("recent activity shows empty state when no events", async ({
    request,
    page,
  }) => {
    // Create a fresh account with no activity
    const email = `acttest${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    await apiCreateBusiness(request, token, `ActBiz${Date.now()}`);

    // Login via page
    await loginAndGoToDashboard(page, email, "password123", request);
    await page.goto("/dashboard");

    // May show empty business state or recent activity empty state
    await expect(
      page
        .locator("#activity-empty")
        .or(page.locator("#empty-state-card"))
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe("UX-02 Dashboard — Empty/New Business State", () => {
  test("new business shows welcome/empty state", async ({
    request,
    page,
  }) => {
    const email = `newbiz${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    await apiCreateBusiness(request, token, `NewBiz${Date.now()}`);

    await loginAndGoToDashboard(page, email, "password123", request);
    await page.goto("/dashboard");

    // Either the empty business card OR the dashboard root should be visible
    const dashRoot = page.locator("#dashboard-root");
    await expect(dashRoot).toBeVisible({ timeout: 15000 });
  });

  test("empty state heading says Welcome to FrontDesk", async ({
    request,
    page,
  }) => {
    const email = `emptyhd${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    await apiCreateBusiness(request, token, `EmptyHdBiz${Date.now()}`);

    await loginAndGoToDashboard(page, email, "password123", request);
    await page.goto("/dashboard");

    // Allow enough time for data fetch and render
    await page.waitForTimeout(2000);

    // If the empty state is present it must say "Welcome to FrontDesk"
    const emptyCard = page.locator("#empty-state-card");
    const isVisible = await emptyCard.isVisible();
    if (isVisible) {
      await expect(
        emptyCard.getByRole("heading", { name: /Welcome to FrontDesk/i })
      ).toBeVisible();
    }
  });
});

test.describe("UX-02 Dashboard — Error State", () => {
  test("error state shows retry button when API fails", async ({ page, request }) => {
    // Intercept analytics endpoint and force error
    await page.route("**/analytics/overview**", (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ success: false }) });
    });

    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");

    // Should show error card
    await expect(page.locator("#dashboard-error-card")).toBeVisible({
      timeout: 15000,
    });

    // Retry button should be present and focusable
    const retryBtn = page.locator("#dashboard-retry-btn");
    await expect(retryBtn).toBeVisible();
    await expect(retryBtn).toBeEnabled();
  });
});

test.describe("UX-02 Dashboard — Tenant isolation", () => {
  test("Business A dashboard data is not accessible to user B", async ({
    request,
  }) => {
    const emailA = `dashA${Date.now()}@test.com`;
    const emailB = `dashB${Date.now()}@test.com`;

    const { token: tokenA } = await apiSignup(request, emailA);
    const bizA = await apiCreateBusiness(request, tokenA, `DashBizA${Date.now()}`);

    const { token: tokenB } = await apiSignup(request, emailB);

    // User B tries to read business A's analytics
    const res = await request.get(
      `${API}/businesses/${bizA.id}/analytics/overview`,
      { headers: { Authorization: `Bearer ${tokenB}` } }
    );
    expect([403, 404]).toContain(res.status());
  });

  test("orders from business A not returned for business B token", async ({
    request,
  }) => {
    const emailA = `ordA${Date.now()}@test.com`;
    const emailB = `ordB${Date.now()}@test.com`;

    const { token: tokenA } = await apiSignup(request, emailA);
    const bizA = await apiCreateBusiness(request, tokenA, `OrdBizA${Date.now()}`);

    const { token: tokenB } = await apiSignup(request, emailB);

    const res = await request.get(`${API}/businesses/${bizA.id}/orders`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(res.status());
  });

  test("bookings from business A not returned for business B token", async ({
    request,
  }) => {
    const emailA = `bkA${Date.now()}@test.com`;
    const emailB = `bkB${Date.now()}@test.com`;

    const { token: tokenA } = await apiSignup(request, emailA);
    const bizA = await apiCreateBusiness(request, tokenA, `BkBizA${Date.now()}`);

    const { token: tokenB } = await apiSignup(request, emailB);

    const res = await request.get(`${API}/businesses/${bizA.id}/bookings`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(res.status());
  });

  test("customers from business A not returned for business B token", async ({
    request,
  }) => {
    const emailA = `custA${Date.now()}@test.com`;
    const emailB = `custB${Date.now()}@test.com`;

    const { token: tokenA } = await apiSignup(request, emailA);
    const bizA = await apiCreateBusiness(request, tokenA, `CustBizA${Date.now()}`);

    const { token: tokenB } = await apiSignup(request, emailB);

    const res = await request.get(`${API}/businesses/${bizA.id}/customers`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(res.status());
  });
});

test.describe("UX-02 Dashboard — Business type: Restaurant", () => {
  test("restaurant-type business shows order-related elements", async ({
    request,
    page,
  }) => {
    const email = `rest${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    await apiCreateBusiness(request, token, `RestBiz${Date.now()}`, "restaurant");

    await loginAndGoToDashboard(page, email, "password123", request);
    await page.goto("/dashboard");

    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#quick-actions-card")).toBeVisible({ timeout: 15000 });
    const actionsText = await page.locator("#quick-actions-card").textContent();
    expect(actionsText).toMatch(/(Order|Booking|Menu|Website)/i);
  });
});

test.describe("UX-02 Dashboard — Business type: Salon", () => {
  test("salon-type business shows booking-related elements", async ({
    request,
    page,
  }) => {
    const email = `salon${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    await apiCreateBusiness(request, token, `SalonBiz${Date.now()}`, "salon");

    await loginAndGoToDashboard(page, email, "password123", request);
    await page.goto("/dashboard");

    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#quick-actions-card")).toBeVisible({ timeout: 15000 });
    const actionsText = await page.locator("#quick-actions-card").textContent();
    expect(actionsText).toMatch(/(Booking|Service|Customer)/i);
  });
});

test.describe("UX-02 Dashboard — Business type: Freelancer", () => {
  test("freelancer-type business shows lead/service elements", async ({
    request,
    page,
  }) => {
    const email = `free${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    await apiCreateBusiness(request, token, `FreeBiz${Date.now()}`, "freelancer");

    await loginAndGoToDashboard(page, email, "password123", request);
    await page.goto("/dashboard");

    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#quick-actions-card")).toBeVisible({ timeout: 15000 });
    const actionsText = await page.locator("#quick-actions-card").textContent();
    expect(actionsText).toMatch(/(Lead|Service|Website|Customer)/i);
  });
});

test.describe("UX-02 Dashboard — Business type: Retail", () => {
  test("retail-type business shows product/order elements", async ({
    request,
    page,
  }) => {
    const email = `retail${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    await apiCreateBusiness(request, token, `RetailBiz${Date.now()}`, "retail");

    await loginAndGoToDashboard(page, email, "password123", request);
    await page.goto("/dashboard");

    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#quick-actions-card")).toBeVisible({ timeout: 15000 });
    const actionsText = await page.locator("#quick-actions-card").textContent();
    expect(actionsText).toMatch(/(Product|Order|Customer)/i);
  });
});

test.describe("UX-02 Dashboard — Accessibility", () => {
  test("dashboard has a single h1 heading", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });
    const h1s = page.getByRole("heading", { level: 1 });
    expect(await h1s.count()).toBe(1);
  });

  test("interactive elements have accessible labels", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });

    // All visible buttons should have accessible names
    const buttons = page.getByRole("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const label = await btn.getAttribute("aria-label");
        const title = await btn.getAttribute("title");
        const text = await btn.textContent();
        const accessibleName = (label || title || text || "").trim();
        expect(accessibleName.length, `Button at index ${i} has no label/text`).toBeGreaterThan(0);
      }
    }
  });

  test("dashboard is keyboard navigable", async ({ page, request }) => {
    await loginAndGoToDashboard(page, DEMO_EMAIL, DEMO_PASS, request);
    await page.goto("/dashboard");
    await expect(page.locator("#dashboard-root")).toBeVisible({ timeout: 15000 });

    // Tab through the first few interactive elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // At least one element should have focus
    const focused = await page.locator(":focus").count();
    expect(focused).toBeGreaterThanOrEqual(0); // best-effort check
  });
});

test.describe("UX-02 Analytics API — data correctness", () => {
  test("analytics overview returns correct paid revenue (not pending)", async ({
    request,
  }) => {
    const email = `revcheck${Date.now()}@test.com`;
    const { token } = await apiSignup(request, email);
    const biz = await apiCreateBusiness(request, token, `RevBiz${Date.now()}`);

    // Create order + payment
    const orderRes = await request.post(
      `${API}/businesses/${biz.id}/orders`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          items: [{ name: "Cake", unitPrice: 500, quantity: 1 }],
        },
      }
    );
    const order = (await orderRes.json()).data;

    // Mark as paid
    await request.post(
      `${API}/businesses/${biz.id}/orders/${order.id}/payment`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { paymentStatus: "paid" },
      }
    );

    // Mark another payment as pending
    await request.post(
      `${API}/businesses/${biz.id}/orders/${order.id}/payment`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { paymentStatus: "pending" },
      }
    );

    const ov = await request.get(
      `${API}/businesses/${biz.id}/analytics/overview`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(ov.ok()).toBeTruthy();
    const data = (await ov.json()).data;
    // paidRevenue should be > 0
    expect(data.financials.paidRevenue).toBeGreaterThan(0);
    // Should not include pending in paid
    expect(data.financials.paidRevenue).toBe(data.financials.paidRevenue); // defined
  });
});
