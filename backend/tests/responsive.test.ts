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

function responsiveStyleConfig(overrides: Record<string, any>) {
  return JSON.stringify({
    backgroundColor: "#ffffff",
    padding: "2rem",
    responsive: overrides,
  });
}

function responsiveComponentStyleConfig(responsive: Record<string, any>) {
  return JSON.stringify({ responsive });
}

describe("Responsive Configuration", () => {
  describe("validation", () => {
    it("accepts valid responsive config on component styleConfig", async () => {
      const { token } = await signup("resp1@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      const patchRes = await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { responsive: { tablet: { fontSize: 40 }, mobile: { fontSize: 28 } } },
              }],
            }],
          }],
        },
      });
      expect(patchRes.statusCode).toBe(200);
    });

    it("rejects invalid responsive config with bad fontSize", async () => {
      const { token } = await signup("resp2@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      const patchRes = await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { responsive: { tablet: { fontSize: -5 } } },
              }],
            }],
          }],
        },
      });
      expect(patchRes.statusCode).toBe(422);
    });

    it("rejects invalid alignment value", async () => {
      const { token } = await signup("resp3@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      const patchRes = await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { responsive: { mobile: { alignment: "justify" } } },
              }],
            }],
          }],
        },
      });
      expect(patchRes.statusCode).toBe(422);
    });

    it("rejects columns out of range", async () => {
      const { token } = await signup("resp4@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      const patchRes = await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { responsive: { tablet: { columns: 10 } } },
              }],
            }],
          }],
        },
      });
      expect(patchRes.statusCode).toBe(422);
    });
  });

  describe("persistence", () => {
    it("persists responsive config and returns it on GET", async () => {
      const { token } = await signup("resp5@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { responsive: { tablet: { fontSize: 40 }, mobile: { fontSize: 28, alignment: "center" } } },
              }],
            }],
          }],
        },
      });

      const reloadRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const reloaded = JSON.parse(reloadRes.body).data;
      const comp = reloaded.pages[0].sections[0].components[0];
      const styleConfig = JSON.parse(comp.styleConfig || "{}");
      expect(styleConfig.responsive).toBeDefined();
      expect(styleConfig.responsive.tablet.fontSize).toBe(40);
      expect(styleConfig.responsive.mobile.fontSize).toBe(28);
      expect(styleConfig.responsive.mobile.alignment).toBe("center");
    });

    it("persists section responsive config", async () => {
      const { token } = await signup("resp6@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              styleConfig: { responsive: { mobile: { visible: false, padding: "1rem" } } },
            }],
          }],
        },
      });

      const reloadRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const reloaded = JSON.parse(reloadRes.body).data;
      const section = reloaded.pages[0].sections[0];
      const styleConfig = JSON.parse(section.styleConfig || "{}");
      expect(styleConfig.responsive).toBeDefined();
      expect(styleConfig.responsive.mobile.visible).toBe(false);
      expect(styleConfig.responsive.mobile.padding).toBe("1rem");
    });
  });

  describe("inheritance", () => {
    it("mobile inherits tablet when no mobile override exists", async () => {
      const { token } = await signup("resp7@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { responsive: { tablet: { fontSize: 40 } } },
              }],
            }],
          }],
        },
      });

      const reloadRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const reloaded = JSON.parse(reloadRes.body).data;
      const comp = reloaded.pages[0].sections[0].components[0];
      const styleConfig = JSON.parse(comp.styleConfig || "{}");
      expect(styleConfig.responsive.tablet.fontSize).toBe(40);
      expect(styleConfig.responsive.mobile).toBeUndefined();
    });
  });

  describe("visibility", () => {
    it("persists visibility override per device", async () => {
      const { token } = await signup("resp8@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hidden on mobile" },
                styleConfig: { responsive: { mobile: { visible: false } } },
              }],
            }],
          }],
        },
      });

      const reloadRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const reloaded = JSON.parse(reloadRes.body).data;
      const comp = reloaded.pages[0].sections[0].components[0];
      const styleConfig = JSON.parse(comp.styleConfig || "{}");
      expect(styleConfig.responsive.mobile.visible).toBe(false);
    });
  });

  describe("reset override", () => {
    it("removing responsive key removes the override", async () => {
      const { token } = await signup("resp9@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      // Set responsive config
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { responsive: { tablet: { fontSize: 40 }, mobile: { fontSize: 28 } } },
              }],
            }],
          }],
        },
      });

      // Remove tablet override
      const websiteRes2 = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website2 = JSON.parse(websiteRes2.body).data;
      const comp2 = website2.pages[0].sections[0].components[0];
      const style2 = JSON.parse(comp2.styleConfig || "{}");
      delete style2.responsive.tablet;

      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                id: comp2.id, componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: style2,
              }],
            }],
          }],
        },
      });

      const reloadRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const reloaded = JSON.parse(reloadRes.body).data;
      const comp = reloaded.pages[0].sections[0].components[0];
      const styleConfig = JSON.parse(comp.styleConfig || "{}");
      expect(styleConfig.responsive.tablet).toBeUndefined();
      expect(styleConfig.responsive.mobile.fontSize).toBe(28);
    });
  });

  describe("backward compatibility", () => {
    it("existing website without responsive config renders fine", async () => {
      const { token } = await signup("resp10@test.com");
      const business = await createBusiness(token, "Test Business");
      const websiteRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const website = JSON.parse(websiteRes.body).data;
      const page = website.pages[0];

      // Save without responsive config
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page.id, title: page.title, slug: page.slug, sortOrder: page.sortOrder,
            sections: [{
              sectionType: "hero", sortOrder: 0, content: { heading: "Test" },
              components: [{
                componentType: "heading", sortOrder: 0,
                props: {}, content: { text: "Hello" },
                styleConfig: { opacity: 100 },
              }],
            }],
          }],
        },
      });

      const reloadRes = await app.inject({
        method: "GET",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}` },
      });
      const reloaded = JSON.parse(reloadRes.body).data;
      const comp = reloaded.pages[0].sections[0].components[0];
      const styleConfig = JSON.parse(comp.styleConfig || "{}");
      expect(styleConfig.responsive).toBeUndefined();
      expect(styleConfig.opacity).toBe(100);
    });
  });
});
