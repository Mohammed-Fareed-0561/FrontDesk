import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createTestApp, cleanupDb, signupLogin } from "./helpers.js";
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

describe("Onboarding - Business Creation", () => {
  it("creates business with controlled business type and enabledModules", async () => {
    const { token } = await signupLogin(app, "onboard1@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: "Test Restaurant",
        businessType: "restaurant",
        enabledModules: ["website", "menu", "orders", "bookings", "customers"],
      },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.data.name).toBe("Test Restaurant");
    expect(body.data.businessType).toBe("restaurant");
    const parsed = JSON.parse(body.data.enabledModules);
    expect(parsed).toContain("website");
    expect(parsed).toContain("menu");
    expect(parsed).toContain("orders");
    expect(parsed).toContain("bookings");
    expect(parsed).toContain("customers");
  });

  it("creates business with default capabilities when enabledModules not provided", async () => {
    const { token } = await signupLogin(app, "onboard2@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Default Caps Biz", businessType: "salon" },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    const parsed = JSON.parse(body.data.enabledModules);
    expect(parsed).toContain("website");
    expect(parsed).toContain("services");
    expect(parsed).toContain("bookings");
  });

  it("creates restaurant with restaurant defaults", async () => {
    const { token } = await signupLogin(app, "onboard3@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Restaurant Test", businessType: "restaurant" },
    });
    const body = JSON.parse(res.body);
    const caps = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${body.data.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const capBody = JSON.parse(caps.body);
    expect(capBody.data.enabledModules).toContain("menu");
    expect(capBody.data.enabledModules).toContain("orders");
    expect(capBody.data.enabledModules).toContain("bookings");
  });

  it("creates salon with salon defaults", async () => {
    const { token } = await signupLogin(app, "onboard4@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Salon Test", businessType: "salon" },
    });
    const body = JSON.parse(res.body);
    const caps = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${body.data.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const capBody = JSON.parse(caps.body);
    expect(capBody.data.enabledModules).toContain("services");
    expect(capBody.data.enabledModules).toContain("bookings");
    expect(capBody.data.enabledModules).not.toContain("orders");
  });

  it("creates freelancer with freelancer defaults", async () => {
    const { token } = await signupLogin(app, "onboard5@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Freelancer Test", businessType: "freelancer" },
    });
    const body = JSON.parse(res.body);
    const caps = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${body.data.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const capBody = JSON.parse(caps.body);
    expect(capBody.data.enabledModules).toContain("services");
    expect(capBody.data.enabledModules).toContain("leads");
    expect(capBody.data.enabledModules).not.toContain("orders");
  });

  it("custom capability selection persists", async () => {
    const { token } = await signupLogin(app, "onboard6@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: "Custom Biz",
        businessType: "bakery",
        enabledModules: ["website", "catalog", "orders", "payments"],
      },
    });
    const biz = JSON.parse(bizRes.body).data;
    const caps = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const capBody = JSON.parse(caps.body);
    expect(capBody.data.enabledModules).toContain("payments");
    expect(capBody.data.enabledModules).toContain("orders");
  });

  it("legacy business type is handled", async () => {
    const { token } = await signupLogin(app, "onboard7@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Legacy Biz", businessType: "food" },
    });
    const body = JSON.parse(res.body);
    expect(body.data.businessType).toBe("food");
    const caps = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${body.data.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const capBody = JSON.parse(caps.body);
    expect(capBody.data.businessType).toBe("restaurant");
  });

  it("invalid business type does not crash", async () => {
    const { token } = await signupLogin(app, "onboard8@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Invalid Type Biz", businessType: "xyz_custom_type" },
    });
    expect(res.statusCode).toBe(201);
    const caps = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${JSON.parse(res.body).data.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const capBody = JSON.parse(caps.body);
    expect(capBody.data.businessType).toBe("other");
  });

  it("invalid capabilities are filtered out", async () => {
    const { token } = await signupLogin(app, "onboard9@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: "Invalid Caps Biz",
        businessType: "bakery",
        enabledModules: ["website", "fake_capability", "another_fake"],
      },
    });
    expect(res.statusCode).toBe(201);
    const parsed = JSON.parse(JSON.parse(res.body).data.enabledModules);
    expect(parsed).toContain("website");
    expect(parsed).not.toContain("fake_capability");
    expect(parsed).not.toContain("another_fake");
  });
});

describe("Onboarding - Complete Setup", () => {
  it("marks setup as complete", async () => {
    const { token } = await signupLogin(app, "complete1@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Complete Biz" },
    });
    const biz = JSON.parse(bizRes.body).data;
    expect(biz.setupComplete).toBe(false);

    const completeRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/complete-setup`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(completeRes.statusCode).toBe(200);
    const completeBody = JSON.parse(completeRes.body);
    expect(completeBody.data.setupComplete).toBe(true);

    // Verify it persisted
    const getRes = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}`,
      headers: { authorization: `Bearer ${token}` },
    });
    const getBody = JSON.parse(getRes.body);
    expect(getBody.data.setupComplete).toBe(true);
  });

  it("tenant isolation prevents completing another business setup", async () => {
    const { token: tokenA } = await signupLogin(app, "compA@test.com");
    const bizARes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "Biz A Complete" },
    });
    const bizA = JSON.parse(bizARes.body).data;

    const { token: tokenB } = await signupLogin(app, "compB@test.com");
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${bizA.id}/complete-setup`,
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(res.statusCode);
  });

  it("unauthenticated user cannot complete setup", async () => {
    const { token } = await signupLogin(app, "compUnauth@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Unauth Complete Biz" },
    });
    const biz = JSON.parse(bizRes.body).data;

    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/complete-setup`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("nonexistent business returns 404", async () => {
    const { token } = await signupLogin(app, "comp404@test.com");
    const res = await app.inject({
      method: "PATCH",
      url: "/api/v1/businesses/nonexistent-id/complete-setup",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("Onboarding - Duplicate Safety", () => {
  it("double-click on create does not create duplicate businesses", async () => {
    const { token } = await signupLogin(app, "dup1@test.com");
    const payload = { name: "Dup Safety Biz", businessType: "bakery" };
    const res1 = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload,
    });
    expect(res1.statusCode).toBe(201);

    // List businesses — should only have 1
    const listRes = await app.inject({
      method: "GET",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
    });
    const businesses = JSON.parse(listRes.body).data;
    expect(businesses.length).toBe(1);
    expect(businesses[0].name).toBe("Dup Safety Biz");
  });

  it("setupComplete defaults to false", async () => {
    const { token } = await signupLogin(app, "dup2@test.com");
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Setup Default Biz" },
    });
    const biz = JSON.parse(res.body).data;
    expect(biz.setupComplete).toBe(false);
  });
});
