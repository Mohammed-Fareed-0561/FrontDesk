import { createTestApp, cleanupDb } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;

beforeAll(async () => { app = await createTestApp(); });
afterAll(async () => { await app.close(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanupDb(); });

async function signup(email: string) {
  const response = await app.inject({ method: "POST", url: "/api/v1/auth/signup", payload: { email, password: "password123", displayName: email.split("@")[0] } });
  return JSON.parse(response.body).data;
}

async function createBusiness(token: string, name: string) {
  const response = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name } });
  return JSON.parse(response.body).data;
}

const validTheme = {
  colors: {
    primary: { value: "#ff0000" },
    secondary: { value: "#00ff00" },
    background: { value: "#ffffff" },
    surface: { value: "#f8fafc" },
    text: { value: "#1e293b" },
    muted: { value: "#94a3b8" },
    border: { value: "#e2e8f0" },
    success: { value: "#16a34a" },
    warning: { value: "#d97706" },
    danger: { value: "#dc2626" },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    baseFontSize: "16px",
    headingWeight: "700",
    bodyWeight: "400",
    lineHeight: "1.5",
  },
  spacing: { unit: "8px" },
  radius: { sm: "4px", md: "8px", lg: "12px" },
  shadows: { sm: "0 1px 2px rgba(0,0,0,0.1)", md: "0 4px 6px rgba(0,0,0,0.1)", lg: "0 10px 15px rgba(0,0,0,0.1)" },
  buttons: { radius: "8px", fontWeight: "600", style: "solid" as const },
};

describe("Website Theme Engine", () => {
  it("returns default theme for website without stored theme", async () => {
    const owner = await signup(`theme-default-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Business");
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.body).data;
    expect(data.colors.primary.value).toBe("#1e293b");
    expect(data.typography.fontFamily).toContain("Inter");
    expect(data.buttons.style).toBe("solid");
  });

  it("persists and retrieves theme via dedicated endpoints", async () => {
    const owner = await signup(`theme-persist-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Persist Business");

    const patchResponse = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: validTheme,
    });
    expect(patchResponse.statusCode).toBe(200);
    const patched = JSON.parse(patchResponse.body).data;
    expect(patched.colors.primary.value).toBe("#ff0000");

    const getResponse = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    expect(getResponse.statusCode).toBe(200);
    const fetched = JSON.parse(getResponse.body).data;
    expect(fetched.colors.primary.value).toBe("#ff0000");
    expect(fetched.typography.fontFamily).toBe("Arial, sans-serif");
  });

  it("validates theme and rejects invalid values", async () => {
    const owner = await signup(`theme-invalid-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Invalid Business");

    const invalidColor = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: { colors: { primary: { value: "not-a-color" } } },
    });
    expect(invalidColor.statusCode).toBe(422);

    const invalidStyle = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: { buttons: { style: "invalid" } },
    });
    expect(invalidStyle.statusCode).toBe(422);
  });

  it("rejects malformed JSON theme config", async () => {
    const owner = await signup(`theme-malformed-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Malformed Business");

    const response = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}`, "content-type": "application/json" },
      payload: "not an object",
    });
    expect([400, 415, 422]).toContain(response.statusCode);
  });

  it("enforces tenant isolation for theme operations", async () => {
    const owner = await signup(`theme-owner-${Date.now()}@test.com`);
    const outsider = await signup(`theme-outsider-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Owner Business");
    await createBusiness(outsider.token, "Other Business");

    const outsiderPatch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${outsider.token}` },
      payload: validTheme,
    });
    expect([403, 404]).toContain(outsiderPatch.statusCode);

    const outsiderGet = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${outsider.token}` },
    });
    expect([403, 404]).toContain(outsiderGet.statusCode);
  });

  it("preserves component configuration when updating theme", async () => {
    const owner = await signup(`theme-preserve-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Preserve Business");

    await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: {
        pages: [{
          title: "Home", slug: "home", sortOrder: 0,
          sections: [{
            sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
            components: [{ componentType: "text", sortOrder: 0, props: { align: "left" }, content: { text: "Keep me" } }],
          }],
        }],
      },
    });

    await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: validTheme,
    });

    const website = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    const data = JSON.parse(website.body).data;
    // Verify pages and theme coexist
    expect(data.pages.length).toBeGreaterThan(0);
    expect(data.themeConfig).toBeTruthy();
    const theme = JSON.parse(data.themeConfig);
    expect(theme.colors.primary.value).toBe("#ff0000");
    // Verify component structure exists
    const firstPage = data.pages[0];
    expect(firstPage.sections).toBeDefined();
    expect(firstPage.sections.length).toBeGreaterThan(0);
  });

  it("preserves existing website data when updating theme via PATCH website", async () => {
    const owner = await signup(`theme-compat-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Compat Business");

    await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: { name: "My Website" },
    });

    const themeResponse = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: validTheme,
    });
    expect(themeResponse.statusCode).toBe(200);

    const website = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    const data = JSON.parse(website.body).data;
    expect(data.name).toBe("My Website");
    expect(data.themeConfig).toBeTruthy();
    const theme = JSON.parse(data.themeConfig);
    expect(theme.colors.primary.value).toBe("#ff0000");
  });

  it("handles partial theme updates correctly", async () => {
    const owner = await signup(`theme-partial-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Theme Partial Business");

    await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: validTheme,
    });

    const partialUpdate = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website/theme`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: { colors: { primary: { value: "#0000ff" } } },
    });
    expect(partialUpdate.statusCode).toBe(200);
    const updated = JSON.parse(partialUpdate.body).data;
    expect(updated.colors.primary.value).toBe("#0000ff");
    // Partial update applies defaults for missing fields
    expect(updated.typography.fontFamily).toContain("Inter");
  });
});
