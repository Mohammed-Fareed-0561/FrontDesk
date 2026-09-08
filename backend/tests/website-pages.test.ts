import { createTestApp, cleanupDb } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;

beforeAll(async () => { app = await createTestApp(); });
afterAll(async () => { await app.close(); await prisma.$disconnect(); });
beforeEach(async () => { await cleanupDb(); });

async function signup(email: string) {
  const response = await app.inject({ method: "POST", url: "/api/v1/auth/signup", payload: { email, password: "password123", displayName: email } });
  return JSON.parse(response.body).data;
}

async function createBusiness(token: string, name: string) {
  const response = await app.inject({ method: "POST", url: "/api/v1/businesses", headers: { authorization: `Bearer ${token}` }, payload: { name } });
  return JSON.parse(response.body).data;
}

describe("Website page management", () => {
  it("lists, orders, creates, updates, persists, and safely deletes pages", async () => {
    const owner = await signup(`page-owner-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Page Business");
    const websiteResponse = await app.inject({ method: "GET", url: `/api/v1/businesses/${business.id}/website`, headers: { authorization: `Bearer ${owner.token}` } });
    const website = JSON.parse(websiteResponse.body).data;
    const home = website.pages[0];

    const first = await app.inject({ method: "POST", url: `/api/v1/businesses/${business.id}/website/pages`, headers: { authorization: `Bearer ${owner.token}` }, payload: { title: "About", slug: "about", sortOrder: 20, seoConfig: { description: "About us" } } });
    expect(first.statusCode).toBe(201);
    const about = JSON.parse(first.body).data;
    expect(about.id).toBeTruthy();
    expect(about.websiteId).toBe(website.id);
    expect(about.sortOrder).toBe(20);

    const second = await app.inject({ method: "POST", url: `/api/v1/businesses/${business.id}/website/pages`, headers: { authorization: `Bearer ${owner.token}` }, payload: { title: "Menu", slug: "menu", sortOrder: 10 } });
    expect(second.statusCode).toBe(201);
    const menu = JSON.parse(second.body).data;
    expect(menu.id).not.toBe(about.id);

    const listed = await app.inject({ method: "GET", url: `/api/v1/businesses/${business.id}/website/pages`, headers: { authorization: `Bearer ${owner.token}` } });
    expect(listed.statusCode).toBe(200);
    expect(JSON.parse(listed.body).data.map((page: any) => page.slug)).toEqual(["home", "menu", "about"]);

    const duplicate = await app.inject({ method: "POST", url: `/api/v1/businesses/${business.id}/website/pages`, headers: { authorization: `Bearer ${owner.token}` }, payload: { title: "Duplicate", slug: "about" } });
    expect(duplicate.statusCode).toBe(409);
    const malformed = await app.inject({ method: "POST", url: `/api/v1/businesses/${business.id}/website/pages`, headers: { authorization: `Bearer ${owner.token}` }, payload: { title: "Bad", slug: "bad", seoConfig: [] } });
    expect(malformed.statusCode).toBe(422);

    const updated = await app.inject({ method: "PATCH", url: `/api/v1/businesses/${business.id}/website/pages/${about.id}`, headers: { authorization: `Bearer ${owner.token}` }, payload: { title: "Our Story", slug: "our-story", sortOrder: 1 } });
    expect(updated.statusCode).toBe(200);
    expect(JSON.parse(updated.body).data.title).toBe("Our Story");

    const withSection = await app.inject({ method: "PATCH", url: `/api/v1/businesses/${business.id}/website`, headers: { authorization: `Bearer ${owner.token}` }, payload: { pages: [{ id: about.id, title: "Our Story", slug: "our-story", sortOrder: 1, sections: [{ sectionType: "story", sortOrder: 0, content: { heading: "Hello" }, components: [{ componentType: "text", sortOrder: 0, props: { align: "left" }, content: { text: "Persisted" } }] }] }] } });
    expect(withSection.statusCode).toBe(200);
    const persisted = await app.inject({ method: "GET", url: `/api/v1/businesses/${business.id}/website/pages`, headers: { authorization: `Bearer ${owner.token}` } });
    const persistedPage = JSON.parse(persisted.body).data.find((page: any) => page.id === about.id);
    expect(persistedPage.title).toBe("Our Story");
    expect(persistedPage.sections[0].components[0].content).toContain("Persisted");

    const deleted = await app.inject({ method: "DELETE", url: `/api/v1/businesses/${business.id}/website/pages/${menu.id}`, headers: { authorization: `Bearer ${owner.token}` } });
    expect(deleted.statusCode).toBe(200);
    const lastPageDelete = await app.inject({ method: "DELETE", url: `/api/v1/businesses/${business.id}/website/pages/${home.id}`, headers: { authorization: `Bearer ${owner.token}` } });
    expect(lastPageDelete.statusCode).toBe(200);
    const finalPageDelete = await app.inject({ method: "DELETE", url: `/api/v1/businesses/${business.id}/website/pages/${about.id}`, headers: { authorization: `Bearer ${owner.token}` } });
    expect(finalPageDelete.statusCode).toBe(422);
    const remaining = await app.inject({ method: "GET", url: `/api/v1/businesses/${business.id}/website/pages`, headers: { authorization: `Bearer ${owner.token}` } });
    expect(JSON.parse(remaining.body).data).toHaveLength(1);
    expect(await prisma.websiteSection.count()).toBe(1);
    expect(await prisma.websiteComponent.count()).toBe(1);
  });

  it("enforces tenant isolation for page list, update, and delete", async () => {
    const owner = await signup(`page-isolation-owner-${Date.now()}@test.com`);
    const outsider = await signup(`page-isolation-outsider-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Private Pages");
    await createBusiness(outsider.token, "Other Pages");
    const website = JSON.parse((await app.inject({ method: "GET", url: `/api/v1/businesses/${business.id}/website`, headers: { authorization: `Bearer ${owner.token}` } })).body).data;
    const page = website.pages[0];
    for (const request of [
      { method: "GET", url: `/api/v1/businesses/${business.id}/website/pages` },
      { method: "PATCH", url: `/api/v1/businesses/${business.id}/website/pages/${page.id}`, payload: { title: "Intrusion" } },
      { method: "DELETE", url: `/api/v1/businesses/${business.id}/website/pages/${page.id}` },
    ]) {
      const response = await app.inject({ ...request, headers: { authorization: `Bearer ${outsider.token}` } });
      expect([403, 404]).toContain(response.statusCode);
    }
  });
});
