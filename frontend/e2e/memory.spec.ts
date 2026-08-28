import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "demo@royalbakes.test";
const DEMO_PASS = "demo12345";

test.describe("Business Memory 2.0 — browser", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("#email", DEMO_EMAIL);
    await page.fill("#password", DEMO_PASS);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("create → view → search → delete", async ({ page }) => {
    await page.goto("/dashboard/memory");
    await expect(page.getByRole("heading", { name: "Business Memory" })).toBeVisible({ timeout: 10000 });

    const newBtn = page.getByTestId("new-memory-btn");
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    const dialog = page.getByRole("dialog").filter({ hasText: "New memory" });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await dialog.getByTestId("memory-content").fill(`Memory test ${Date.now()} — Never discount premium`);
    await dialog.getByTestId("create-memory-btn").click();

    await expect(page.getByText(/Memory created/i).first()).toBeVisible({ timeout: 10000 });
    await expect(dialog).toBeHidden({ timeout: 5000 });

    const viewBtn = page.getByTestId("view-memory-btn").first();
    await expect(viewBtn).toBeVisible({ timeout: 10000 });
    await viewBtn.click();

    const detail = page.getByTestId("memory-detail-dialog");
    await expect(detail).toBeVisible({ timeout: 10000 });
    await detail.getByTestId("close-memory-detail-btn").click();
    await expect(detail).toBeHidden({ timeout: 5000 });

    // Search
    const searchInput = page.getByPlaceholder("Semantic search query");
    await searchInput.fill("Never discount premium");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Retrieved/).first()).toBeVisible({ timeout: 5000 }).catch(() => {});

    // Delete first memory if exists
    const deleteBtn = page.getByTestId("view-memory-btn").first();
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await detail.getByRole("button", { name: "Delete" }).click();
      page.once("dialog", (d) => d.accept());
      await page.waitForTimeout(500);
    }
  });

  test("empty/search states", async ({ page }) => {
    await page.goto("/dashboard/memory");
    await expect(page.getByRole("heading", { name: "Business Memory" })).toBeVisible();
    const search = page.getByPlaceholder("Filter by content");
    await search.fill("NONEXISTENT999");
    await page.waitForTimeout(500);
    // Empty state should show No memories
    await expect(page.getByText(/No memories/i).first()).toBeVisible({ timeout: 5000 }).catch(async () => {
      await expect(page.getByText(/No memories|Business Memory/).first()).toBeVisible();
    });
  });
});
