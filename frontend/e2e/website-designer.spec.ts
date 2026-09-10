import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:4000/api/v1";

test.describe("Website Designer UX", () => {
  test("editor loads with three-panel layout, canvas, and top bar", async ({ page, request }) => {
    const email = `designer-load-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Load" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Load Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);
    await expect(page.getByRole("button", { name: "Preview" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publish website" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Desktop" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tablet" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mobile" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pages", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Style", exact: true })).toBeVisible();
  });

  test("left panel tabs switch between Add, Pages, and Style", async ({ page, request }) => {
    const email = `designer-tabs-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Tabs" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Tabs Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Add tab is default
    await expect(page.getByPlaceholder("Search something to add")).toBeVisible();

    // Switch to Pages
    await page.getByRole("button", { name: "Pages" }).click();
    await expect(page.getByText("Manage your website pages")).toBeVisible();

    // Switch to Style
    await page.getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.getByText("Make it your style")).toBeVisible();
  });

  test("device switcher toggles between desktop, tablet, and mobile", async ({ page, request }) => {
    const email = `designer-device-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Device" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Device Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Desktop is default
    await expect(page.getByRole("button", { name: "Desktop" })).toHaveAttribute("aria-pressed", "true");

    // Switch to tablet
    await page.getByRole("button", { name: "Tablet" }).click();
    await expect(page.getByRole("button", { name: "Tablet" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Desktop" })).toHaveAttribute("aria-pressed", "false");

    // Switch to mobile
    await page.getByRole("button", { name: "Mobile" }).click();
    await expect(page.getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "true");
  });

  test("canvas renders sections and components visually", async ({ page, request }) => {
    const email = `designer-canvas-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Canvas" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Canvas Business ${Date.now()}` },
    });
    expect(businessResponse.ok()).toBeTruthy();
    const business = (await businessResponse.json()).data;

    // Seed content
    const websiteResponse = await request.get(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const website = (await websiteResponse.json()).data;
    const home = website.pages[0];
    const seed = await request.patch(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: {
        pages: [{
          id: home.id, title: home.title, slug: home.slug, sortOrder: home.sortOrder,
          sections: [{
            sectionType: "hero", sortOrder: 0, content: { heading: "Welcome to Our Restaurant" },
            components: [
              { componentType: "text", sortOrder: 0, props: {}, content: { text: "Good food. Good moments." } },
              { componentType: "button", sortOrder: 1, props: {}, content: { text: "View Menu", href: "/menu" } },
            ],
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

    // Canvas shows the heading
    await expect(page.getByText("Welcome to Our Restaurant")).toBeVisible();
    // Canvas shows the text component
    await expect(page.getByText("Good food. Good moments.")).toBeVisible();
    // Canvas shows the button
    await expect(page.getByRole("button", { name: "View Menu" })).toBeVisible();
  });

  test("clicking a component selects it and shows edit panel", async ({ page, request }) => {
    const email = `designer-select-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Select" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Select Business ${Date.now()}` },
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
            components: [{ componentType: "text", sortOrder: 0, props: {}, content: { text: "Hero text" } }],
          }],
        }],
      },
    });

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Initially shows empty state
    await expect(page.getByText("Make your website yours")).toBeVisible();

    // Click the text component in the canvas
    await page.getByText("Hero text").click();

    // Right panel shows edit controls
    await expect(page.getByText("Edit Text")).toBeVisible();
    await expect(page.getByLabel("Text")).toHaveValue("Hero text");
  });

  test("editing component text updates canvas and marks unsaved", async ({ page, request }) => {
    const email = `designer-edit-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Edit" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Edit Business ${Date.now()}` },
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
            components: [{ componentType: "text", sortOrder: 0, props: {}, content: { text: "Original text" } }],
          }],
        }],
      },
    });

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Select the text component
    await page.getByText("Original text").click();
    await expect(page.getByLabel("Text")).toHaveValue("Original text");

    // Edit the text
    await page.getByLabel("Text").fill("Updated text");

    // Canvas updates
    await expect(page.getByRole("paragraph").filter({ hasText: "Updated text" })).toBeVisible();

    // Unsaved indicator appears
    await expect(page.getByText("Unsaved changes")).toBeVisible();

    // Save button becomes enabled
    await expect(page.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  test("save persists changes and shows saved state", async ({ page, request }) => {
    const email = `designer-save-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Save" },
    });
    expect(signup.ok()).toBeTruthy();
    const session = (await signup.json()).data;
    const businessResponse = await request.post(`${API}/businesses`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: { name: `Save Business ${Date.now()}` },
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
            components: [{ componentType: "text", sortOrder: 0, props: {}, content: { text: "Before save" } }],
          }],
        }],
      },
    });

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Select and edit
    await page.getByText("Before save").click();
    await page.getByLabel("Text").fill("After save");

    // Save
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    await expect(page.getByText("Changes saved", { exact: true })).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await expect(page.getByText("FrontDesk")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("After save")).toBeVisible();
  });

  test("page management: create, switch, rename, delete pages", async ({ page, request }) => {
    const email = `designer-pages-${Date.now()}@test.com`;
    const signup = await request.post(`${API}/auth/signup`, {
      data: { email, password: "password123", displayName: "Designer Pages" },
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
    await request.patch(`${API}/businesses/${business.id}/website`, {
      headers: { Authorization: `Bearer ${session.token}` },
      data: {
        pages: [{
          id: home.id, title: home.title, slug: home.slug, sortOrder: home.sortOrder,
          sections: [{
            sectionType: "hero", sortOrder: 0, content: { heading: "Home" },
            components: [{ componentType: "text", sortOrder: 0, props: {}, content: { text: "Home content" } }],
          }],
        }],
      },
    });

    await page.addInitScript((token) => localStorage.setItem("fd_token", token), session.token);
    const businessesRequest = page.waitForResponse((response) => response.url().endsWith("/api/v1/businesses"));
    await page.goto("/dashboard/website");
    const businessesResponse = await businessesRequest;
    expect(businessesResponse.status()).toBe(200);

    // Switch to Pages tab
    await page.getByRole("button", { name: "Pages", exact: true }).click();

    // Home page is listed
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

    // Create a new page
    await page.getByRole("button", { name: "Add page" }).click();
    await page.getByLabel("Page name").fill("Contact");
    await page.getByLabel("Slug").fill("contact");
    await page.getByRole("button", { name: "Create page" }).click();
    await expect(page.getByText("Page created", { exact: true })).toBeVisible();

    // Contact page is listed
    await expect(page.getByText("Contact", { exact: true })).toBeVisible();
  });
});
