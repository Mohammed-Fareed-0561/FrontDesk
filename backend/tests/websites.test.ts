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

describe("Website Builder Core", () => {
  it("persists an ordered, tenant-isolated website document tree", async () => {
    const owner = await signup(`website-owner-${Date.now()}@test.com`);
    const outsider = await signup(`website-outsider-${Date.now()}@test.com`);
    const business = await createBusiness(owner.token, "Website Owner Business");
    const outsiderBusiness = await createBusiness(outsider.token, "Other Business");

    const initial = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    expect(initial.statusCode).toBe(200);
    const websiteId = JSON.parse(initial.body).data.id;

    const saved = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: {
        name: "Owner Website",
        pages: [
          {
            title: "About",
            slug: "about",
            sortOrder: 20,
            sections: [{
              sectionType: "story",
              sortOrder: 10,
              content: { heading: "Our story" },
              components: [{
                componentType: "text",
                sortOrder: 10,
                props: { align: "left" },
                content: { text: "Stored as data <script>blocked()</script>" },
                sourceType: "template",
                sourceId: "template-story",
                sourceVersion: "1",
              }],
            }],
          },
          {
            title: "Home",
            slug: "home",
            sortOrder: 10,
            sections: [{
              sectionType: "hero-custom",
              sortOrder: 20,
              content: { heading: "Welcome" },
              components: [{
                componentType: "hero.heading",
                sortOrder: 20,
                props: { tone: "dark" },
                content: { text: "Hello" },
                assetRefs: ["media-1"],
              }],
            }],
          },
        ],
      },
    });
    expect(saved.statusCode).toBe(200);

    const own = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
    });
    expect(own.statusCode).toBe(200);
    const document = JSON.parse(own.body).data;
    expect(document.id).toBe(websiteId);
    expect(document.pages.map((page: any) => page.slug)).toEqual(["home", "about"]);
    const homeSection = document.pages[0].sections.find((section: any) => section.sectionType === "hero-custom");
    const aboutSection = document.pages[1].sections.find((section: any) => section.sectionType === "story");
    expect(homeSection.components[0].componentType).toBe("hero.heading");
    expect(homeSection.components[0].id).toBeTruthy();
    expect(JSON.parse(homeSection.components[0].props)).toEqual({ tone: "dark" });
    expect(JSON.parse(homeSection.components[0].assetRefs)).toEqual(["media-1"]);
    expect(JSON.parse(aboutSection.components[0].content).text).toContain("<script>");

    const outsiderRead = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${outsider.token}` },
    });
    expect([403, 404].includes(outsiderRead.statusCode)).toBe(true);

    const outsiderWrite = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${outsider.token}` },
      payload: { pages: [{ title: "Intrusion", slug: "intrusion", sortOrder: 1 }] },
    });
    expect([403, 404].includes(outsiderWrite.statusCode)).toBe(true);

    const otherWebsite = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${outsiderBusiness.id}/website`,
      headers: { authorization: `Bearer ${outsider.token}` },
    });
    expect(JSON.parse(otherWebsite.body).data.id).not.toBe(websiteId);

    const malformed = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${owner.token}` },
      payload: { pages: [{ title: "Bad", slug: "bad", sections: [{ sectionType: "x", content: {}, components: [{ componentType: "x", props: [] }] }] }] },
    });
    expect(malformed.statusCode).toBe(422);
  });
});
