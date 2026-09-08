import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("Website page management", () => {
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
    await page.goto(`/dashboard/website`);
    await expect(page.getByRole("heading", { name: "Website editor" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Select Home page" })).toBeVisible();

    await page.getByRole("button", { name: "Create page" }).click();
    await page.getByLabel("Page title").fill("Contact");
    await page.getByLabel("Page slug").fill("contact");
    await page.getByRole("button", { name: "Submit create page" }).click();
    await expect(page.getByRole("button", { name: "Select Contact page" })).toBeVisible();
    await page.getByRole("button", { name: "Select Contact page" }).click();
    await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();

    await page.getByRole("button", { name: "Edit Contact page" }).click();
    await page.getByLabel("Page title").fill("Contact us");
    await page.getByLabel("Page slug").fill("contact-us");
    await page.getByRole("button", { name: "Save page" }).click();
    await expect(page.getByRole("button", { name: "Select Contact us page" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Select Contact us page" })).toBeVisible();
    await page.getByRole("button", { name: "Select Home page" }).click();
    await page.getByRole("button", { name: "Select text component" }).click();
    await page.getByLabel("Text or label").fill("Updated home component");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("region", { name: "Notifications (F8)" }).getByText("Website changes saved", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Delete Contact us page" }).click();
    await expect(page.getByRole("button", { name: "Select Contact us page" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete Home page" })).toBeDisabled();
  });
});
