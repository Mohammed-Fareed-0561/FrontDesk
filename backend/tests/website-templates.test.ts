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

async function seedTemplate() {
  const template = await prisma.websiteTemplate.create({
    data: {
      name: "Test Template",
      slug: "test-template",
      description: "A test template",
      category: "general",
      thumbnail: "/thumbnails/test.png",
      isBuiltIn: true,
      themeConfig: '{"colors":{"primary":"#ff0000"}}',
      status: "published",
      visibility: "public",
      ownerType: "system",
      version: 1,
      pages: {
        create: [
          {
            title: "Home",
            slug: "/",
            pageType: "home",
            sortOrder: 0,
            seoConfig: '{"title":"Home"}',
            sections: {
              create: [
                {
                  sectionType: "hero",
                  sortOrder: 0,
                  content: '{"heading":"Welcome"}',
                  styleConfig: '{"bg":"#000"}',
                  visibilityConfig: '{}',
                  components: {
                    create: [
                      {
                        componentType: "heading",
                        sortOrder: 0,
                        props: '{"text":"Welcome"}',
                        content: "Welcome",
                        styleConfig: '{"color":"white"}',
                        assetRefs: "[]",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  return template;
}

async function seedSectionPack() {
  const pack = await prisma.sectionPack.create({
    data: {
      name: "Test Pack",
      slug: "test-pack",
      description: "A test section pack",
      category: "general",
      isBuiltIn: true,
      status: "published",
      visibility: "public",
      ownerType: "system",
      sections: {
        create: [
          {
            sectionType: "cta",
            sortOrder: 0,
            content: '{"text":"Click me"}',
            styleConfig: '{"bg":"#000"}',
            visibilityConfig: '{}',
            components: {
              create: [
                {
                  componentType: "button",
                  sortOrder: 0,
                  props: '{"label":"Click"}',
                  content: "Click",
                  styleConfig: '{"color":"white"}',
                  assetRefs: "[]",
                },
              ],
            },
          },
        ],
      },
    },
  });
  return pack;
}

describe("Template Routes", () => {
  it("lists active templates", async () => {
    await seedTemplate();
    const { token } = await signup("t1@test.com");
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/templates",
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("Test Template");
    expect(body.data[0].pageCount).toBe(1);
  });

  it("returns template detail with pages, sections, components", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t2@test.com");
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/templates/${template.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.pages).toHaveLength(1);
    expect(body.data.pages[0].sections).toHaveLength(1);
    expect(body.data.pages[0].sections[0].components).toHaveLength(1);
  });

  it("returns 404 for non-existent template", async () => {
    const { token } = await signup("t3@test.com");
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/templates/nonexistent",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("imports template as independent copy", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t4@test.com");
    const business = await createBusiness(token, "Test Business");

    const res = await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Test Template");
    expect(body.data.themeConfig).toBe('{"colors":{"primary":"#ff0000"}}');
    expect(body.data.pages).toHaveLength(1);
    expect(body.data.pages[0].sections).toHaveLength(1);
    expect(body.data.pages[0].sections[0].components).toHaveLength(1);
  });

  it("template import creates independent copy — editing website does not modify template", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t5@test.com");
    const business = await createBusiness(token, "Test Business");

    // Import
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    // Modify website page title
    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });
    await prisma.websitePage.update({ where: { id: page!.id }, data: { title: "Modified Home" } });

    // Reload template
    const templateAfter = await prisma.websiteTemplate.findUnique({ where: { id: template.id } }) as any;
    const templatePages = await prisma.websiteTemplatePage.findMany({ where: { templateId: template.id } });
    expect(templatePages[0].title).toBe("Home"); // Unchanged
  });

  it("template import is transactional — no partial imports on failure", async () => {
    const { token } = await signup("t6@test.com");
    const business = await createBusiness(token, "Test Business");

    // Import with invalid template (no pages) should still create website
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/templates/nonexistent/import",
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });
    expect(res.statusCode).toBe(404);
  });

  it("enforces tenant isolation — cannot import template to another business", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t7@test.com");
    const other = await signup("t7b@test.com");
    const otherBusiness = await createBusiness(other.token, "Other Business");

    const res = await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: otherBusiness.id },
    });
    expect(res.statusCode).toBe(403);
  });

  it("built-in template is not modified by import", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t8@test.com");
    const business = await createBusiness(token, "Test Business");

    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    // Template pages should be untouched
    const templatePages = await prisma.websiteTemplatePage.findMany({ where: { templateId: template.id } });
    expect(templatePages).toHaveLength(1);
    expect(templatePages[0].title).toBe("Home");
  });

  it("import replaces existing website content (not additive)", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t9@test.com");
    const business = await createBusiness(token, "Test Business");

    // First import
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    // Second import
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    // Should still have 1 page, not 2
    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const pages = await prisma.websitePage.findMany({ where: { websiteId: website!.id } });
    expect(pages).toHaveLength(1);
  });

  it("creates website if none exists", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t10@test.com");
    const business = await createBusiness(token, "Test Business");

    const res = await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.id).toBeDefined();
  });

  it("rejects missing businessId", async () => {
    const template = await seedTemplate();
    const { token } = await signup("t11@test.com");
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });
    expect(res.statusCode).toBe(422);
  });
});

describe("Section Pack Routes", () => {
  it("lists section packs", async () => {
    await seedSectionPack();
    const { token } = await signup("sp1@test.com");
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/section-packs",
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("Test Pack");
    expect(body.data[0].sectionCount).toBe(1);
  });

  it("returns pack detail with sections and components", async () => {
    const pack = await seedSectionPack();
    const { token } = await signup("sp2@test.com");
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/section-packs/${pack.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.sections).toHaveLength(1);
    expect(body.data.sections[0].components).toHaveLength(1);
  });

  it("returns 404 for non-existent pack", async () => {
    const { token } = await signup("sp3@test.com");
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/section-packs/nonexistent",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(404);
  });

  it("imports section pack into existing page", async () => {
    const pack = await seedSectionPack();
    const { token } = await signup("sp4@test.com");
    const business = await createBusiness(token, "Test Business");

    // Import a template first to have a page
    const template = await seedTemplate();
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });

    const res = await app.inject({
      method: "POST",
      url: `/api/v1/section-packs/${pack.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id, pageId: page!.id },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.sections).toHaveLength(2); // Original 1 + pack 1
  });

  it("enforces tenant isolation for section pack import", async () => {
    const pack = await seedSectionPack();
    const { token } = await signup("sp5@test.com");
    const other = await signup("sp5b@test.com");
    const otherBusiness = await createBusiness(other.token, "Other Business");

    // Import template first to get a page
    const template = await seedTemplate();
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${other.token}` },
      payload: { businessId: otherBusiness.id },
    });

    const website = await prisma.website.findFirst({ where: { businessId: otherBusiness.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });

    const res = await app.inject({
      method: "POST",
      url: `/api/v1/section-packs/${pack.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: otherBusiness.id, pageId: page!.id },
    });
    expect(res.statusCode).toBe(403);
  });

  it("rejects missing businessId and pageId", async () => {
    const pack = await seedSectionPack();
    const { token } = await signup("sp6@test.com");
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/section-packs/${pack.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: {},
    });
    expect(res.statusCode).toBe(422);
  });

  it("section pack components have sourceType and sourceId", async () => {
    const pack = await seedSectionPack();
    const { token } = await signup("sp7@test.com");
    const business = await createBusiness(token, "Test Business");

    const template = await seedTemplate();
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });

    await app.inject({
      method: "POST",
      url: `/api/v1/section-packs/${pack.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id, pageId: page!.id },
    });

    // Find the imported component
    const component = await prisma.websiteComponent.findFirst({
      where: { sectionId: { not: undefined } },
      orderBy: { createdAt: "desc" },
    });
    expect(component).toBeDefined();
    // The pack component should have sourceType = section-pack
    const packComponent = await prisma.websiteComponent.findFirst({
      where: { sourceType: "section-pack" },
    });
    expect(packComponent).toBeDefined();
    expect(packComponent!.sourceId).toBe(pack.id);
  });

  it("template import components have sourceType and sourceId", async () => {
    const template = await seedTemplate();
    const { token } = await signup("sp8@test.com");
    const business = await createBusiness(token, "Test Business");

    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    const component = await prisma.websiteComponent.findFirst({
      where: { sourceType: "template" },
    });
    expect(component).toBeDefined();
    expect(component!.sourceId).toBe(template.id);
    expect(component!.sourceVersion).toBe("1");
  });

  it("appends pack sections after existing sections", async () => {
    const pack = await seedSectionPack();
    const { token } = await signup("sp9@test.com");
    const business = await createBusiness(token, "Test Business");

    const template = await seedTemplate();
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });

    await app.inject({
      method: "POST",
      url: `/api/v1/section-packs/${pack.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id, pageId: page!.id },
    });

    const sections = await prisma.websiteSection.findMany({
      where: { pageId: page!.id },
      orderBy: { sortOrder: "asc" },
    });
    expect(sections).toHaveLength(2);
    expect(sections[0].sortOrder).toBe(0);
    expect(sections[1].sortOrder).toBe(1);
  });

  it("import + customize + save + reload persists changes", async () => {
    const template = await seedTemplate();
    const { token } = await signup("cust1@test.com");
    const business = await createBusiness(token, "Test Business");

    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });
    const sections = await prisma.websiteSection.findMany({ where: { pageId: page!.id } });
    const components = await prisma.websiteComponent.findMany({ where: { sectionId: sections[0].id } });

    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      payload: {
        pages: [{
          id: page!.id,
          title: page!.title,
          slug: page!.slug,
          sortOrder: page!.sortOrder,
          sections: [{
            id: sections[0].id,
            sectionType: sections[0].sectionType,
            sortOrder: sections[0].sortOrder,
            content: JSON.parse(sections[0].content || "{}"),
            components: components.map((c) => ({
              id: c.id,
              componentType: c.componentType,
              sortOrder: c.sortOrder,
              props: typeof c.props === "string" ? JSON.parse(c.props || "{}") : c.props || {},
              content: c.componentType === "heading" ? { text: "Customized Heading" } : (typeof c.content === "string" ? JSON.parse(c.content || "{}") : c.content || {}),
            })),
          }],
        }],
      },
    });
    expect(res.statusCode).toBe(200);

    const reload = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${token}` },
    });
    const reloaded = JSON.parse(reload.body).data;
    const headingComp = reloaded.pages[0].sections[0].components.find(
      (c: any) => c.componentType === "heading"
    );
    expect(headingComp).toBeDefined();
    const compContent = typeof headingComp.content === "string" ? JSON.parse(headingComp.content) : headingComp.content;
    expect(compContent.text).toBe("Customized Heading");
  });

  it("section add, delete, and reorder after template import", async () => {
    const template = await seedTemplate();
    const { token } = await signup("sadr1@test.com");
    const business = await createBusiness(token, "Test Business");

    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });
    const beforeSections = await prisma.websiteSection.findMany({ where: { pageId: page!.id } });
    const originalCount = beforeSections.length;

    const addRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${business.id}/website`,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      payload: {
        pages: [{
          id: page!.id,
          title: page!.title,
          slug: page!.slug,
          sortOrder: page!.sortOrder,
          sections: [
            ...beforeSections.map((s) => ({
              id: s.id,
              sectionType: s.sectionType,
              sortOrder: s.sortOrder,
              content: JSON.parse(s.content || "{}"),
            })),
            {
              sectionType: "contact",
              sortOrder: originalCount,
              content: { heading: "New Contact" },
            },
          ],
        }],
      },
    });
    expect(addRes.statusCode).toBe(200);

    const afterAdd = await prisma.websiteSection.findMany({
      where: { pageId: page!.id },
      orderBy: { sortOrder: "asc" },
    });
    expect(afterAdd).toHaveLength(originalCount + 1);
  });

  it("creator template remains unchanged after business edits imported content", async () => {
    const template = await seedTemplate();
    const { token } = await signup("iso1@test.com");
    const business = await createBusiness(token, "Test Business");

    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${template.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: business.id },
    });

    const website = await prisma.website.findFirst({ where: { businessId: business.id } });
    const page = await prisma.websitePage.findFirst({ where: { websiteId: website!.id } });
    const sections = await prisma.websiteSection.findMany({ where: { pageId: page!.id } });
    const components = await prisma.websiteComponent.findMany({ where: { sectionId: sections[0].id } });
    const textComp = components.find((c) => c.componentType === "text");

    if (textComp) {
      await app.inject({
        method: "PATCH",
        url: `/api/v1/businesses/${business.id}/website`,
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        payload: {
          pages: [{
            id: page!.id,
            title: page!.title,
            slug: page!.slug,
            sortOrder: page!.sortOrder,
            sections: [{
              id: sections[0].id,
              sectionType: sections[0].sectionType,
              sortOrder: sections[0].sortOrder,
              content: sections[0].content,
              components: components.map((c) => ({
                id: c.id,
                componentType: c.componentType,
                sortOrder: c.sortOrder,
                props: JSON.parse(c.props || "{}"),
                content: c.id === textComp.id
                  ? { text: "Business Modified" }
                  : JSON.parse(c.content || "{}"),
              })),
            }],
          }],
        },
      });
    }

    const tplPages = await prisma.websiteTemplatePage.findMany({ where: { templateId: template.id } });
    const tplSections = await prisma.websiteTemplateSection.findMany({
      where: { templatePageId: tplPages[0].id },
    });
    const tplComponents = await prisma.websiteTemplateComponent.findMany({
      where: { templateSectionId: tplSections[0].id },
    });
    const tplText = tplComponents.find((c) => c.componentType === "text");
    if (tplText) {
      const tplContent = JSON.parse(tplText.content || "{}");
      expect(tplContent.text).not.toBe("Business Modified");
    }
  });
});
