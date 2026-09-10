import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("Website theme engine (current designer)", () => {
  test("opens Style tab, modifies theme, saves, and persists after reload", async ({ page, request }) => {
    const email = `theme-e2e-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Theme E2E" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Theme Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Open Style tab
    await page.getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.getByText("Make it your style")).toBeVisible();

    // Modify primary color
    await page.getByLabel("primary hex value").fill("#ff0000");
    await page.getByLabel("Save theme").click();
    await expect(page.getByRole("region", { name: "Notifications (F8)" }).getByText("Style saved", { exact: true })).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await expect(page.getByText("FrontDesk")).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.getByLabel("primary hex value")).toHaveValue("#ff0000");
  });

  test("theme changes do not affect component editing", async ({ page, request }) => {
    const email = `theme-component-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Theme Component" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Theme Comp Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;

    const websiteResponse = await request.get(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const website = (await websiteResponse.json()).data;
    const home = website.pages[0];

    await request.patch(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: {
        pages: [{
          id: home.id, title: home.title, slug: home.slug, sortOrder: home.sortOrder,
          sections: [{
            sectionType: "hero", sortOrder: 0, content: { heading: "Home" },
            components: [{ componentType: "text", sortOrder: 0, props: { align: "left" }, content: { text: "Test component" } }],
          }],
        }],
      },
    });

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Select component from canvas
    await page.getByText("Test component").click();
    await expect(page.getByRole("textbox", { name: "Text", exact: true })).toHaveValue("Test component");

    // Change theme
    await page.getByRole("button", { name: "Style", exact: true }).click();
    await page.getByLabel("primary hex value").fill("#00ff00");
    await page.getByLabel("Save theme").click();
    await expect(page.getByRole("region", { name: "Notifications (F8)" }).getByText("Style saved", { exact: true })).toBeVisible();

    // Component text should be unchanged
    await expect(page.getByRole("textbox", { name: "Text", exact: true })).toHaveValue("Test component");
  });
});
