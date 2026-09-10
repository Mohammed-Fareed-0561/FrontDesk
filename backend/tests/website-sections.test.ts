import { createTestApp, cleanupDb } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;

beforeAll(async () => { app = await createTestApp(); });
afterAll(async () => { await app.close(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanupDb(); });

async function signup(email: string) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/auth/signup",
    payload: { email, password: "password123", displayName: email.split("@")[0] },
  });
  return JSON.parse(response.body).data;
}

async function createBusiness(token: string, name: string) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/businesses",
    headers: { authorization: `Bearer ${token}` },
    payload: { name },
  });
  return JSON.parse(response.body).data;
}

async function getWebsite(token: string, businessId: string) {
  const response = await app.inject({
    method: "GET",
    url: `/api/v1/businesses/${businessId}/website`,
    headers: { authorization: `Bearer ${token}` },
  });
  return JSON.parse(response.body).data;
}

describe("Website Section Operations", () => {
  it("adds a section via PATCH and persists after reload", async () => {
    const user = await signup(`section-add-${Date.now()}@test.com`);
    const business = await createBusiness(user.token, "Section Add Business");
    const website = await getWebsite(user.token, business.id);
    const homePage = website.pages[0];

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${user.token}` },
      payload: {
        pages: [{
          id: homePage.id,
          title: homePage.title,
          slug: homePage.slug,
          sortOrder: homePage.sortOrder,
          sections: [{
            sectionType: "features",
            sortOrder: 0,
            content: { heading: "Our Features" },
            components: [
              { componentType: "text", sortOrder: 0, props: {}, content: { text: "Feature 1" } },
              { componentType: "text", sortOrder: 1, props: {}, content: { text: "Feature 2" } },
            ],
          }],
        }],
      },
    });
    expect(patched.statusCode).toBe(200);

    const reloaded = await getWebsite(user.token, business.id);
    const reloadedPage = reloaded.pages[0];
    expect(reloadedPage.sections.length).toBeGreaterThanOrEqual(1);
    const featuresSection = reloadedPage.sections.find((s: any) => s.sectionType === "features");
    expect(featuresSection).toBeTruthy();
    expect(JSON.parse(featuresSection.content).heading).toBe("Our Features");
    expect(featuresSection.components).toHaveLength(2);
    expect(JSON.parse(featuresSection.components[0].content).text).toBe("Feature 1");
    expect(JSON.parse(featuresSection.components[1].content).text).toBe("Feature 2");
  });

  it("deletes a section via DELETE endpoint", async () => {
    const user = await signup(`section-delete-${Date.now()}@test.com`);
    const business = await createBusiness(user.token, "Section Delete Business");

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${user.token}` },
      payload: {
        pages: [{
          title: "Home",
          slug: "home",
          sections: [
            { sectionType: "hero", sortOrder: 0, content: { heading: "Hero" }, components: [] },
            { sectionType: "about", sortOrder: 1, content: { heading: "About" }, components: [] },
          ],
        }],
      },
    });
    expect(patched.statusCode).toBe(200);

    const website = await getWebsite(user.token, business.id);
    const homePage = website.pages[0];
    const heroSection = homePage.sections.find((s: any) => s.sectionType === "hero");
    expect(heroSection).toBeTruthy();

    const deleted = await app.inject({
      method: "DELETE",
      url: `/api/v1/businesses/${business.id}/website/sections/${heroSection.id}`,
      headers: { authorization: `Bearer ${user.token}` },
    });
    expect(deleted.statusCode).toBe(200);

    const reloaded = await getWebsite(user.token, business.id);
    const reloadedPage = reloaded.pages[0];
    expect(reloadedPage.sections.find((s: any) => s.sectionType === "hero")).toBeUndefined();
    expect(reloadedPage.sections.find((s: any) => s.sectionType === "about")).toBeTruthy();
  });

  it("prevents deleting the last section on a page", async () => {
    const user = await signup(`section-last-${Date.now()}@test.com`);
    const business = await createBusiness(user.token, "Section Last Business");

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${user.token}` },
      payload: {
        pages: [{
          title: "Home",
          slug: "home",
          sections: [
            { sectionType: "hero", sortOrder: 0, content: { heading: "Hero" }, components: [] },
          ],
        }],
      },
    });
    expect(patched.statusCode).toBe(200);

    const website = await getWebsite(user.token, business.id);
    const homePage = website.pages[0];
    const heroSection = homePage.sections[0];

    const deleted = await app.inject({
      method: "DELETE",
      url: `/api/v1/businesses/${business.id}/website/sections/${heroSection.id}`,
      headers: { authorization: `Bearer ${user.token}` },
    });
    expect(deleted.statusCode).toBe(422);
  });

  it("enforces tenant isolation for section delete", async () => {
    const owner = await signup(`section-owner-${Date.now()}@test.com`);
    const outsider = await signup(`section-outsider-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Section Tenant Business");

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: {
        pages: [{
          title: "Home",
          slug: "home",
          sections: [
            { sectionType: "hero", sortOrder: 0, content: { heading: "Hero" }, components: [] },
            { sectionType: "about", sortOrder: 1, content: { heading: "About" }, components: [] },
          ],
        }],
      },
    });
    expect(patched.statusCode).toBe(200);

    const website = await getWebsite(owner.token, business.id);
    const heroSection = website.pages[0].sections.find((s: any) => s.sectionType === "hero");

    const outsiderDelete = await app.inject({
      method: "DELETE",
      url: `/api/v1/businesses/${business.id}/website/sections/${heroSection.id}`,
      headers: { authorization: `Bearer ${outsider.token}` },
    });
    expect([403, 404].includes(outsiderDelete.statusCode)).toBe(true);

    const reloaded = await getWebsite(owner.token, business.id);
    expect(reloaded.pages[0].sections.find((s: any) => s.sectionType === "hero")).toBeTruthy();
  });

  it("preserves deterministic ordering after add, move, and delete", async () => {
    const user = await signup(`section-order-${Date.now()}@test.com`);
    const business = await createBusiness(user.token, "Section Order Business");

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${user.token}` },
      payload: {
        pages: [{
          title: "Home",
          slug: "home",
          sections: [
            { sectionType: "hero", sortOrder: 0, content: { heading: "Hero" }, components: [] },
            { sectionType: "about", sortOrder: 1, content: { heading: "About" }, components: [] },
            { sectionType: "contact", sortOrder: 2, content: { heading: "Contact" }, components: [] },
          ],
        }],
      },
    });
    expect(patched.statusCode).toBe(200);

    const website = await getWebsite(user.token, business.id);
    const homePage = website.pages[0];
    const sectionTypes = homePage.sections.map((s: any) => s.sectionType);
    expect(sectionTypes).toEqual(["hero", "about", "contact"]);

    const sortOrders = homePage.sections.map((s: any) => s.sortOrder);
    expect(sortOrders).toEqual([0, 1, 2]);
  });

  it("section content and components persist through save and reload", async () => {
    const user = await signup(`section-persist-${Date.now()}@test.com`);
    const business = await createBusiness(user.token, "Section Persist Business");

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${user.token}` },
      payload: {
        pages: [{
          title: "Home",
          slug: "home",
          sections: [{
            sectionType: "cta",
            sortOrder: 0,
            content: { heading: "Get Started Today", subheading: "Join us now", cta: "Sign Up" },
            styleConfig: { backgroundColor: "#f0f0f0", padding: "3rem" },
            components: [
              { componentType: "text", sortOrder: 0, props: { align: "center" }, content: { text: "Welcome message" } },
              { componentType: "button", sortOrder: 1, props: { variant: "primary" }, content: { text: "Click me", href: "/signup" } },
            ],
          }],
        }],
      },
    });
    expect(patched.statusCode).toBe(200);

    const reloaded = await getWebsite(user.token, business.id);
    const section = reloaded.pages[0].sections[0];
    expect(section.sectionType).toBe("cta");
    expect(JSON.parse(section.content)).toEqual({ heading: "Get Started Today", subheading: "Join us now", cta: "Sign Up" });
    expect(JSON.parse(section.styleConfig)).toEqual({ backgroundColor: "#f0f0f0", padding: "3rem" });
    expect(section.components).toHaveLength(2);
    expect(JSON.parse(section.components[0].props)).toEqual({ align: "center" });
    expect(JSON.parse(section.components[0].content).text).toBe("Welcome message");
    expect(JSON.parse(section.components[1].content).text).toBe("Click me");
    expect(JSON.parse(section.components[1].content).href).toBe("/signup");
  });

  it("rejects invalid section data safely", async () => {
    const user = await signup(`section-invalid-${Date.now()}@test.com`);
    const business = await createBusiness(user.token, "Section Invalid Business");

    const response = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${user.token}` },
      payload: {
        pages: [{
          title: "Home",
          slug: "home",
          sections: [{
            sectionType: "hero",
            sortOrder: 0,
            content: {},
            components: [{
              componentType: "text",
              sortOrder: 0,
              props: "not-an-object",
              content: { text: "test" },
            }],
          }],
        }],
      },
    });
    expect(response.statusCode).toBe(422);
  });
});
