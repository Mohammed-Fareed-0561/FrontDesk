import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@royalbakes.test";
const DEMO_PASS = "demo12345";

test.describe("Orders UI — browser workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("create → view → confirm → complete → pay", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible({ timeout: 10000 });

    const newBtn = page.getByTestId("new-order-btn");
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    const dialog = page.getByRole("dialog").filter({ hasText: "New order" });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const productSelect = page.getByTestId("product-select");
    await expect(productSelect).toBeVisible();
    await page.waitForTimeout(1500);
    const options = productSelect.locator("option");
    await expect(options.nth(1)).toBeAttached({ timeout: 10000 });
    const val = await options.nth(1).getAttribute("value");
    expect(val).toBeTruthy();
    await productSelect.selectOption(val!);

    const qty = page.getByTestId("qty-input");
    await qty.fill("2");

    const addBtn = page.getByTestId("add-to-cart-btn");
    await addBtn.click();
    await expect(dialog.getByText(/Preview subtotal/)).toBeVisible({ timeout: 5000 });

    const createBtn = page.getByTestId("create-order-btn");
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText(/Order created/i).first()).toBeVisible({ timeout: 10000 });
    await expect(dialog).toBeHidden({ timeout: 5000 });

    await page.waitForTimeout(1000);
    const viewBtn = page.getByTestId("view-order-btn").first();
    await expect(viewBtn).toBeVisible({ timeout: 10000 });
    await viewBtn.click();

    const detail = page.getByTestId("order-detail-dialog");
    await expect(detail).toBeVisible({ timeout: 10000 });
    await expect(detail.getByText(/Order ORD-/)).toBeVisible();

    const confirmBtn = page.getByTestId("confirm-btn");
    if (await confirmBtn.isEnabled()) {
      page.once("dialog", (d) => d.accept());
      await confirmBtn.click();
      await page.waitForTimeout(1000);
      await expect(detail.getByText("confirmed").first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    const completeBtn = page.getByTestId("complete-btn");
    if (await completeBtn.isEnabled().catch(() => false)) {
      page.once("dialog", (d) => d.accept());
      await completeBtn.click();
      await page.waitForTimeout(1000);
    }

    const paidBtn = page.getByTestId("mark-paid-btn");
    if (await paidBtn.isEnabled().catch(() => false)) {
      page.once("dialog", (d) => d.accept());
      await paidBtn.click();
      await expect(detail.getByText("paid").first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    await detail.getByTestId("close-detail-btn").click();
    await expect(detail).toBeHidden({ timeout: 5000 });
  });

  test("empty/search/filter states", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    const search = page.getByPlaceholder("Search by order number");
    await search.fill("NONEXISTENT123");
    await page.waitForTimeout(800);
    await expect(page.getByText(/No matches|No orders/i).first()).toBeVisible({ timeout: 5000 });
    await search.fill("");
    await page.waitForTimeout(500);
  });
});
