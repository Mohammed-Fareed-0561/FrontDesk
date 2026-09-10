import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("Website page management (new designer)", () => {
  test("creates, selects, renames, persists, edits, and deletes a page", async ({ page, request }) => {
    const email = `website-pages-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Website Pages" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Pages Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;
    const websiteResponse = await request.get(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const website = (await websiteResponse.json()).data;
    const home = website.pages[0];
    const seed = await request.patch(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: {
        pages: [{
          id: home.id,
          title: home.title,
          slug: home.slug,
          sortOrder: home.sortOrder,
          sections: [{
            sectionType: "hero",
            sortOrder: 0,
            content: { heading: "Home" },
            components: [{ componentType: "text", sortOrder: 0, props: { align: "left" }, content: { text: "Home component" } }],
          }],
        }],
      },
    });
    expect(seed.ok()).toBeTruthy();

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible({ timeout: 15000 });

    // Switch to Pages tab
    await page.getByRole("button", { name: "Pages", exact: true }).click();
    await expect(page.getByText("Manage your website pages")).toBeVisible();

    // Home page is listed
    await expect(page.locator(".truncate").filter({ hasText: "Home" }).first()).toBeVisible();

    // Create a new page via inline form
    await page.getByRole("button", { name: "Add page" }).click();
    await page.getByLabel("Page name").fill("Contact");
    await page.getByLabel("Slug").fill("contact");
    await page.getByRole("button", { name: "Create page" }).click();
    await expect(page.getByText("Page created", { exact: true })).toBeVisible();

    // Contact page is listed
    await expect(page.locator(".truncate").filter({ hasText: "Contact" }).first()).toBeVisible();

    // Switch to Contact page
    await page.locator(".truncate").filter({ hasText: "Contact" }).first().click();

    // Rename the Contact page via inline edit
    await page.getByLabel("Rename Contact").click();
    await page.getByPlaceholder("Page title").fill("Contact us");
    await page.getByPlaceholder("page-slug").fill("contact-us");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Page renamed", { exact: true })).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    const businessesRequest2 = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await businessesRequest2;
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Pages", exact: true }).click();
    await expect(page.locator(".truncate").filter({ hasText: "Contact us" }).first()).toBeVisible();

    // Switch to Home page and edit a component
    await page.locator(".truncate").filter({ hasText: "Home" }).first().click();
    await expect(page.getByText("Home component")).toBeVisible();
    await page.getByText("Home component").click();
    await page.getByRole("textbox", { name: "Text", exact: true }).fill("Updated home component");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved", { exact: true })).toBeVisible();

    // Delete Contact us page
    await page.getByRole("button", { name: "Pages", exact: true }).click();
    await page.getByLabel("Delete Contact us").click();
    await expect(page.getByText("Page deleted", { exact: true })).toBeVisible();
    await expect(page.locator(".truncate").filter({ hasText: "Contact us" })).toHaveCount(0);
  });
});
