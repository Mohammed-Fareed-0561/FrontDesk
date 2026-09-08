import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("Website visual editor foundation", () => {
  test("edits, reorders, saves, and deletes a component through the editor", async ({ page, request }) => {
    const email = `website-editor-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Website Editor" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Editor Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;
    const websiteResponse = await request.get(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const website = (await websiteResponse.json()).data;
    const pageRecord = website.pages[0];
    const section = pageRecord.sections[0];
    const seed = await request.patch(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: {
        pages: [{
          id: pageRecord.id,
          title: pageRecord.title,
          slug: pageRecord.slug,
          sortOrder: pageRecord.sortOrder,
          sections: [{
            id: section.id,
            sectionType: section.sectionType,
            sortOrder: section.sortOrder,
            content: {},
            components: [
              { componentType: "text", sortOrder: 0, props: { align: "left" }, content: { text: "First" } },
              { componentType: "button", sortOrder: 1, props: { variant: "primary" }, content: { label: "Second" } },
            ],
          }],
        }],
      },
    });
    expect(seed.ok()).toBeTruthy();

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto(`/dashboard/website`);
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Website editor" })).toBeVisible();
    await expect(page.getByText("First")).toBeVisible();
    await expect(page.getByText("Second")).toBeVisible();

    await page.getByRole("button", { name: "Select text component" }).click();
    await page.getByLabel("Text or label").fill("Updated first");
    const patchRequests: string[] = [];
    page.on("request", (requestEvent) => {
      if (requestEvent.method() === "PATCH" && requestEvent.url().includes("/website")) patchRequests.push(requestEvent.url());
    });
    await page.getByRole("button", { name: "Move text down" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("region", { name: "Notifications (F8)" }).getByText("Website changes saved", { exact: true })).toBeVisible();
    expect(patchRequests).toHaveLength(1);

    await page.reload();
    await expect(page.getByText("Updated first")).toBeVisible();
    const componentButtons = page.locator('button[aria-label^="Select "][aria-label$=" component"]');
    await expect.poll(() => componentButtons.allTextContents()).toEqual(["buttonSecond", "textUpdated first"]);

    await page.getByRole("button", { name: "Select text component" }).click();
    await page.getByRole("button", { name: "Delete component" }).click();
    await expect(page.getByText("Component deleted")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Updated first")).toHaveCount(0);
    await expect(page.getByText("Second")).toBeVisible();
  });
});
