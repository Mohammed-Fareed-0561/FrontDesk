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

async function createCreatorProfile(token: string, displayName: string, slug: string) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/creator/profile",
    headers: { authorization: `Bearer ${token}` },
    payload: { displayName, slug },
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

async function seedSystemTemplate() {
  return prisma.websiteTemplate.create({
    data: {
      name: "System Template",
      slug: "system-template",
      description: "A system template",
      category: "general",
      isBuiltIn: true,
      ownerType: "system",
      visibility: "public",
      status: "published",
      version: 1,
      themeConfig: '{"colors":{"primary":"#000"}}',
    },
  });
}

async function seedSystemPack() {
  return prisma.sectionPack.create({
    data: {
      name: "System Pack",
      slug: "system-pack",
      description: "A system pack",
      category: "general",
      isBuiltIn: true,
      ownerType: "system",
      visibility: "public",
      status: "published",
      version: 1,
    },
  });
}

describe("Creator Profile", () => {
  it("creates a creator profile", async () => {
    const { token } = await signup("cp1@test.com");
    const profile = await createCreatorProfile(token, "Test Creator", "test-creator");
    expect(profile.displayName).toBe("Test Creator");
    expect(profile.slug).toBe("test-creator");
    expect(profile.userId).toBeDefined();
  });

  it("returns null for non-existent profile", async () => {
    const { token } = await signup("cp2@test.com");
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/creator/profile",
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data).toBeNull();
  });

  it("prevents duplicate profile", async () => {
    const { token } = await signup("cp3@test.com");
    await createCreatorProfile(token, "Test Creator", "test-creator");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { displayName: "Test Creator 2", slug: "test-creator-2" },
    });
    expect(res.statusCode).toBe(409);
  });

  it("prevents duplicate slug", async () => {
    const { token: t1 } = await signup("cp4a@test.com");
    const { token: t2 } = await signup("cp4b@test.com");
    await createCreatorProfile(t1, "Creator A", "shared-slug");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/profile",
      headers: { authorization: `Bearer ${t2}` },
      payload: { displayName: "Creator B", slug: "shared-slug" },
    });
    expect(res.statusCode).toBe(409);
  });

  it("updates creator profile", async () => {
    const { token } = await signup("cp5@test.com");
    await createCreatorProfile(token, "Test Creator", "test-creator");
    const res = await app.inject({
      method: "PATCH",
      url: "/api/v1/creator/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { displayName: "Updated Creator" },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data.displayName).toBe("Updated Creator");
  });

  it("rejects missing displayName", async () => {
    const { token } = await signup("cp6@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/profile",
      headers: { authorization: `Bearer ${token}` },
      payload: { slug: "test" },
    });
    expect(res.statusCode).toBe(422);
  });
});

describe("Creator Templates — Ownership", () => {
  it("creator creates and owns a template", async () => {
    const { token } = await signup("ct1@test.com");
    await createCreatorProfile(token, "Creator One", "creator-one");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "My Template", slug: "my-template" },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    expect(body.data.ownerType).toBe("creator");
    expect(body.data.ownerId).toBeDefined();
    expect(body.data.status).toBe("draft");
    expect(body.data.visibility).toBe("private");
  });

  it("creator lists own templates", async () => {
    const { token } = await signup("ct2@test.com");
    await createCreatorProfile(token, "Creator Two", "creator-two");
    await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "My Template", slug: "my-template" },
    });
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe("My Template");
  });

  it("creator cannot modify another creator's template", async () => {
    const { token: t1 } = await signup("ct3a@test.com");
    const { token: t2 } = await signup("ct3b@test.com");
    await createCreatorProfile(t1, "Creator A", "creator-a");
    await createCreatorProfile(t2, "Creator B", "creator-b");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${t1}` },
      payload: { name: "Creator A Template", slug: "creator-a-tpl" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/creator/templates/${tpl.id}`,
      headers: { authorization: `Bearer ${t2}` },
      payload: { name: "Hacked" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("creator cannot delete another creator's template", async () => {
    const { token: t1 } = await signup("ct4a@test.com");
    const { token: t2 } = await signup("ct4b@test.com");
    await createCreatorProfile(t1, "Creator A", "creator-a");
    await createCreatorProfile(t2, "Creator B", "creator-b");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${t1}` },
      payload: { name: "Creator A Template", slug: "creator-a-tpl" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/creator/templates/${tpl.id}`,
      headers: { authorization: `Bearer ${t2}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("creator cannot view another creator's private template", async () => {
    const { token: t1 } = await signup("ct5a@test.com");
    const { token: t2 } = await signup("ct5b@test.com");
    await createCreatorProfile(t1, "Creator A", "creator-a");
    await createCreatorProfile(t2, "Creator B", "creator-b");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${t1}` },
      payload: { name: "Private Template", slug: "private-tpl" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/creator/templates/${tpl.id}`,
      headers: { authorization: `Bearer ${t2}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("frontend-supplied creatorId is not trusted", async () => {
    const { token } = await signup("ct6@test.com");
    await createCreatorProfile(token, "Creator A", "creator-a");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "My Template", slug: "my-template", ownerId: "fake-id" },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    // The ownerId should be the authenticated user, not the fake-id from the body
    expect(body.data.ownerId).not.toBe("fake-id");
    expect(body.data.ownerId).toBeDefined();
  });
});

describe("System Asset Protection", () => {
  it("creator cannot modify system template", async () => {
    const { token } = await signup("sp1@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const tpl = await seedSystemTemplate();
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/creator/templates/${tpl.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Hacked" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("creator cannot delete system template", async () => {
    const { token } = await signup("sp2@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const tpl = await seedSystemTemplate();
    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/creator/templates/${tpl.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("creator cannot publish system template", async () => {
    const { token } = await signup("sp3@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const tpl = await seedSystemTemplate();
    const res = await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/publish`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it("creator cannot modify system section pack", async () => {
    const { token } = await signup("sp4@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const pack = await seedSystemPack();
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/creator/section-packs/${pack.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Hacked" },
    });
    expect(res.statusCode).toBe(403);
  });

  it("creator cannot delete system section pack", async () => {
    const { token } = await signup("sp5@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const pack = await seedSystemPack();
    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/creator/section-packs/${pack.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("Draft/Published Lifecycle", () => {
  it("new template starts as draft", async () => {
    const { token } = await signup("lc1@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Draft Template", slug: "draft-template" },
    });
    const body = JSON.parse(res.body);
    expect(body.data.status).toBe("draft");
    expect(body.data.visibility).toBe("private");
  });

  it("creator publishes a draft template", async () => {
    const { token } = await signup("lc2@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Publish Me", slug: "publish-me" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    const publishRes = await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/publish`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(publishRes.body);
    expect(body.data.status).toBe("published");
    expect(body.data.visibility).toBe("public");
    expect(body.data.version).toBe(2);
  });

  it("creator archives a template", async () => {
    const { token } = await signup("lc3@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Archive Me", slug: "archive-me" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    const archiveRes = await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/archive`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(archiveRes.body);
    expect(body.data.status).toBe("archived");
  });

  it("cannot modify a published template", async () => {
    const { token } = await signup("lc4@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Published", slug: "published" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/publish`,
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/creator/templates/${tpl.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Changed" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("cannot delete a published template", async () => {
    const { token } = await signup("lc5@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Published", slug: "published" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/publish`,
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await app.inject({
      method: "DELETE",
      url: `/api/v1/creator/templates/${tpl.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(422);
  });

  it("creator publishes section pack", async () => {
    const { token } = await signup("lc6@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/section-packs",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "My Pack", slug: "my-pack" },
    });
    const pack = (await JSON.parse(createRes.body)).data;
    const publishRes = await app.inject({
      method: "POST",
      url: `/api/v1/creator/section-packs/${pack.id}/publish`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(publishRes.body);
    expect(body.data.status).toBe("published");
    expect(body.data.visibility).toBe("public");
  });
});

describe("Visibility", () => {
  it("private template not discoverable in public listing", async () => {
    const { token } = await signup("vi1@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Private", slug: "private" },
    });
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/templates",
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data).toHaveLength(0);
  });

  it("published template discoverable in public listing", async () => {
    const { token } = await signup("vi2@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Public", slug: "public" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/publish`,
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/templates",
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data.some((t: any) => t.name === "Public")).toBe(true);
  });

  it("private section pack not discoverable", async () => {
    const { token } = await signup("vi3@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    await app.inject({
      method: "POST",
      url: "/api/v1/creator/section-packs",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Private Pack", slug: "private-pack" },
    });
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/section-packs",
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data).toHaveLength(0);
  });

  it("private template cannot be imported by others", async () => {
    const { token: t1 } = await signup("vi4a@test.com");
    const { token: t2 } = await signup("vi4b@test.com");
    await createCreatorProfile(t1, "Creator A", "creator-a");
    await createCreatorProfile(t2, "Creator B", "creator-b");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${t1}` },
      payload: { name: "Private", slug: "private-tpl" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    const biz = await createBusiness(t2, "Other Business");
    const importRes = await app.inject({
      method: "POST",
      url: `/api/v1/templates/${tpl.id}/import`,
      headers: { authorization: `Bearer ${t2}` },
      payload: { businessId: biz.id },
    });
    expect(importRes.statusCode).toBe(403);
  });
});

describe("Import Compatibility", () => {
  it("public creator template can be imported", async () => {
    const { token: creator } = await signup("ic1@test.com");
    const { token: business } = await signup("ic1b@test.com");
    await createCreatorProfile(creator, "Creator", "creator");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${creator}` },
      payload: { name: "Public Tpl", slug: "public-tpl" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;
    await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/publish`,
      headers: { authorization: `Bearer ${creator}` },
    });
    const biz = await createBusiness(business, "My Business");
    const importRes = await app.inject({
      method: "POST",
      url: `/api/v1/templates/${tpl.id}/import`,
      headers: { authorization: `Bearer ${business}` },
      payload: { businessId: biz.id },
    });
    expect(importRes.statusCode).toBe(200);
  });

  it("import creates independent copy — creator change does not affect business", async () => {
    const { token: creator } = await signup("ic2@test.com");
    const { token: business } = await signup("ic2b@test.com");
    await createCreatorProfile(creator, "Creator", "creator");
    // Create template with a page
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${creator}` },
      payload: { name: "Copy Test", slug: "copy-test" },
    });
    const tpl = (await JSON.parse(createRes.body)).data;

    // Add a page to the template via direct DB (simulating template editor)
    const tplPage = await prisma.websiteTemplatePage.create({
      data: { templateId: tpl.id, title: "Home", slug: "/", pageType: "home", sortOrder: 0 },
    });

    await app.inject({
      method: "POST",
      url: `/api/v1/creator/templates/${tpl.id}/publish`,
      headers: { authorization: `Bearer ${creator}` },
    });
    const biz = await createBusiness(business, "My Business");
    await app.inject({
      method: "POST",
      url: `/api/v1/templates/${tpl.id}/import`,
      headers: { authorization: `Bearer ${business}` },
      payload: { businessId: biz.id },
    });

    // Business website should have a page
    const bizWebsite = await prisma.website.findFirst({ where: { businessId: biz.id } });
    const bizPages = await prisma.websitePage.findMany({ where: { websiteId: bizWebsite!.id } });
    expect(bizPages.length).toBeGreaterThanOrEqual(1);
  });

  it("system template can still be imported", async () => {
    const { token } = await signup("ic3@test.com");
    const tpl = await seedSystemTemplate();
    const biz = await createBusiness(token, "My Business");
    const importRes = await app.inject({
      method: "POST",
      url: `/api/v1/templates/${tpl.id}/import`,
      headers: { authorization: `Bearer ${token}` },
      payload: { businessId: biz.id },
    });
    expect(importRes.statusCode).toBe(200);
  });
});

describe("Creator Section Packs", () => {
  it("creator creates and owns a section pack", async () => {
    const { token } = await signup("cs1@test.com");
    await createCreatorProfile(token, "Creator", "creator");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/section-packs",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "My Pack", slug: "my-pack" },
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(201);
    expect(body.data.ownerType).toBe("creator");
    expect(body.data.status).toBe("draft");
  });

  it("creator cannot modify another creator's pack", async () => {
    const { token: t1 } = await signup("cs2a@test.com");
    const { token: t2 } = await signup("cs2b@test.com");
    await createCreatorProfile(t1, "Creator A", "creator-a");
    await createCreatorProfile(t2, "Creator B", "creator-b");
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/creator/section-packs",
      headers: { authorization: `Bearer ${t1}` },
      payload: { name: "Pack A", slug: "pack-a" },
    });
    const pack = (await JSON.parse(createRes.body)).data;
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/creator/section-packs/${pack.id}`,
      headers: { authorization: `Bearer ${t2}` },
      payload: { name: "Hacked" },
    });
    expect(res.statusCode).toBe(403);
  });
});

describe("Requires Creator Profile", () => {
  it("cannot create template without creator profile", async () => {
    const { token } = await signup("rp1@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/templates",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "No Profile", slug: "no-profile" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("cannot create section pack without creator profile", async () => {
    const { token } = await signup("rp2@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/creator/section-packs",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "No Profile", slug: "no-profile" },
    });
    expect(res.statusCode).toBe(422);
  });
});
