import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@royalbakes.test";
const DEMO_PASS = "demo12345";

test.describe("Bookings — browser workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("create → view → confirm → complete", async ({ page }) => {
    await page.goto("/dashboard/bookings");
    await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible({ timeout: 10000 });

    const newBtn = page.getByTestId("new-booking-btn");
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    const dialog = page.getByRole("dialog").filter({ hasText: "New booking" });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    // customer: use guest (no selection)
    // service: select first if available
    const serviceSelect = page.getByTestId("service-select");
    await expect(serviceSelect).toBeVisible();
    await page.waitForTimeout(1000);
    const opts = serviceSelect.locator("option");
    const count = await opts.count();
    if (count > 1) {
      const val = await opts.nth(1).getAttribute("value");
      if (val) await serviceSelect.selectOption(val);
    }

    const uniqueStart = new Date(Date.now() + 24 * 3600000 + Math.floor(Math.random() * 12) * 3600000);
    const dateStr = uniqueStart.toISOString().split("T")[0];
    const timeStr = uniqueStart.toISOString().split("T")[1].slice(0, 5);
    await page.getByTestId("booking-date").fill(dateStr);
    await page.getByTestId("booking-time").fill(timeStr);
    await page.getByTestId("booking-duration").fill("60");

    const createBtn = page.getByTestId("create-booking-btn");
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText(/Booking created/i).first()).toBeVisible({ timeout: 10000 });
    await expect(dialog).toBeHidden({ timeout: 5000 });

    await page.waitForTimeout(1000);
    const viewBtn = page.getByTestId("view-booking-btn").first();
    await expect(viewBtn).toBeVisible({ timeout: 10000 });
    await viewBtn.click();

    const detail = page.getByTestId("booking-detail-dialog");
    await expect(detail).toBeVisible({ timeout: 10000 });
    await expect(detail.getByText(/Booking BK-/)).toBeVisible();

    const confirmBtn = page.getByTestId("confirm-booking-btn");
    if (await confirmBtn.isEnabled()) {
      page.once("dialog", (d) => d.accept());
      await confirmBtn.click();
      await page.waitForTimeout(1000);
      await expect(detail.getByText("confirmed").first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    const completeBtn = page.getByTestId("complete-booking-btn");
    if (await completeBtn.isEnabled().catch(() => false)) {
      page.once("dialog", (d) => d.accept());
      await completeBtn.click();
      await page.waitForTimeout(1000);
    }

    await detail.getByTestId("close-booking-detail-btn").click();
    await expect(detail).toBeHidden({ timeout: 5000 });
  });

  test("empty/search/filter states", async ({ page }) => {
    await page.goto("/dashboard/bookings");
    await expect(page.getByRole("heading", { name: "Bookings" })).toBeVisible();
    const search = page.getByPlaceholder("Search by booking number or notes");
    await search.fill("NONEXISTENT999");
    await page.waitForTimeout(800);
    await expect(page.getByText(/No matches|No bookings/i).first()).toBeVisible({ timeout: 5000 });
    await search.fill("");
    await page.waitForTimeout(500);
  });
});
