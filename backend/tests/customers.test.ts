import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestApp, cleanupDb } from "./helpers.js";
import { prisma } from "../src/infrastructure/database/client.js";

let app: any;

beforeAll(async () => {
  app = await createTestApp();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

beforeEach(async () => {
  await cleanupDb();
});

// Helper: create a workspace + business + user, return auth token
async function setupBusiness(email: string) {
  const signup = await app.inject({
    method: "POST",
    url: "/api/v1/auth/signup",
    payload: { email, password: "password123", displayName: email.split("@")[0] },
  });
  expect(signup.statusCode).toBe(201);
  const { token, user } = JSON.parse(signup.body).data;

  const createBiz = await app.inject({
    method: "POST",
    url: "/api/v1/businesses",
    headers: { authorization: `Bearer ${token}` },
    payload: {
      name: `Business ${email}`,
      slug: `biz-${email.split("@")[0]}`,
      currency: "INR",
      timezone: "Asia/Kolkata",
      locale: "en-IN",
    },
  });
  expect(createBiz.statusCode).toBe(201);
  const biz = JSON.parse(createBiz.body).data;
  return { token, user, biz };
}

describe("Customers — CRUD + tenant isolation", () => {
  it("creates a customer and lists it", async () => {
    const { token, biz } = await setupBusiness("owner1@test.com");

    const create = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Arjun", email: "arjun@test.com", phone: "+919999999999" },
    });
    expect(create.statusCode).toBe(201);
    const cust = JSON.parse(create.body).data;
    expect(cust.name).toBe("Arjun");
    expect(cust.email).toBe("arjun@test.com");
    expect(cust.businessId).toBe(biz.id);

    const list = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(list.statusCode).toBe(200);
    const body = JSON.parse(list.body);
    expect(body.success).toBe(true);
    expect(body.meta.total).toBe(1);
    expect(body.data[0].name).toBe("Arjun");
  });

  it("gets a single customer by ID", async () => {
    const { token, biz } = await setupBusiness("owner2@test.com");

    const create = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Priya", phone: "+918888888888" },
    });
    const custId = JSON.parse(create.body).data.id;

    const get = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/customers/${custId}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(get.statusCode).toBe(200);
    expect(JSON.parse(get.body).data.name).toBe("Priya");
  });

  it("updates a customer", async () => {
    const { token, biz } = await setupBusiness("owner3@test.com");

    const create = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Old Name", email: "old@test.com" },
    });
    const custId = JSON.parse(create.body).data.id;

    const patch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/customers/${custId}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "New Name", status: "inactive" },
    });
    expect(patch.statusCode).toBe(200);
    expect(JSON.parse(patch.body).data.name).toBe("New Name");
    expect(JSON.parse(patch.body).data.status).toBe("inactive");
  });

  it("soft-deletes a customer and excludes from list", async () => {
    const { token, biz } = await setupBusiness("owner4@test.com");

    const create = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Delete Me", phone: "+917777777777" },
    });
    const custId = JSON.parse(create.body).data.id;

    const del = await app.inject({
      method: "DELETE",
      url: `/api/v1/businesses/${biz.id}/customers/${custId}`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(del.statusCode).toBe(204);

    const list = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(list.statusCode).toBe(200);
    expect(JSON.parse(list.body).meta.total).toBe(0);
  });

  it("rejects invalid email", async () => {
    const { token, biz } = await setupBusiness("owner5@test.com");

    const res = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
      payload: { email: "not-an-email" },
    });
    expect(res.statusCode).toBe(422);
  });

  it("rejects cross-business customer access (GET)", async () => {
    const { token: tokenA, biz: bizA } = await setupBusiness("ownerA@test.com");
    const { token: tokenB, biz: bizB } = await setupBusiness("ownerB@test.com");

    const createA = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${bizA.id}/customers`,
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "CustA", phone: "+911111111111" },
    });
    const custId = JSON.parse(createA.body).data.id;

    const crossAccess = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${bizB.id}/customers/${custId}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect(crossAccess.statusCode).toBe(404);
  });

  it("rejects cross-business customer access (PATCH)", async () => {
    const { token: tokenA, biz: bizA } = await setupBusiness("ownerC@test.com");
    const { token: tokenB, biz: bizB } = await setupBusiness("ownerD@test.com");

    const createA = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${bizA.id}/customers`,
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "CrossTest", phone: "+912222222222" },
    });
    const custId = JSON.parse(createA.body).data.id;

    const crossPatch = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${bizB.id}/customers/${custId}`,
      headers: { authorization: `Bearer ${tokenB}` },
      payload: { name: "Hacked" },
    });
    expect(crossPatch.statusCode).toBe(404);
  });

  it("rejects cross-business customer access (DELETE)", async () => {
    const { token: tokenA, biz: bizA } = await setupBusiness("ownerE@test.com");
    const { token: tokenB, biz: bizB } = await setupBusiness("ownerF@test.com");

    const createA = await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${bizA.id}/customers`,
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "DeleteTest", phone: "+913333333333" },
    });
    const custId = JSON.parse(createA.body).data.id;

    const crossDel = await app.inject({
      method: "DELETE",
      url: `/api/v1/businesses/${bizB.id}/customers/${custId}`,
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect(crossDel.statusCode).toBe(404);

    // Verify customer still exists in business A
    const getA = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${bizA.id}/customers/${custId}`,
      headers: { authorization: `Bearer ${tokenA}` },
    });
    expect(getA.statusCode).toBe(200);
  });

  it("rejects unauthenticated access", async () => {
    const { biz } = await setupBusiness("ownerG@test.com");

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/customers`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("searches customers by name, phone, and email", async () => {
    const { token, biz } = await setupBusiness("ownerH@test.com");

    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Alice", phone: "+914444444444", email: "alice@test.com" },
    });
    await app.inject({
      method: "POST",
      url: `/api/v1/businesses/${biz.id}/customers`,
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Bob", phone: "+915555555555", email: "bob@test.com" },
    });

    const searchName = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/customers?search=Alice`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(JSON.parse(searchName.body).meta.total).toBe(1);

    const searchPhone = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/customers?search=4444`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(JSON.parse(searchPhone.body).meta.total).toBe(1);

    const searchEmail = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/customers?search=bob@test`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(JSON.parse(searchEmail.body).meta.total).toBe(1);
  });
});
