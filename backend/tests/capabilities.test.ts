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

describe("Business Types", () => {
  it("GET /api/v1/business-types returns all business types", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/business-types" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(16);
    const restaurant = body.data.find((t: any) => t.value === "restaurant");
    expect(restaurant).toBeTruthy();
    expect(restaurant.label).toBe("Restaurant");
    expect(restaurant.profile.recommended).toContain("menu");
    expect(restaurant.profile.recommended).toContain("orders");
  });

  it("GET /api/v1/business-types includes profile for each type", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/business-types" });
    const body = JSON.parse(res.body);
    for (const t of body.data) {
      expect(t.profile).toBeTruthy();
      expect(t.profile.recommended).toBeInstanceOf(Array);
      expect(t.profile.optional).toBeInstanceOf(Array);
      expect(t.profile.templateCategory).toBeTruthy();
    }
  });
});

describe("Capabilities", () => {
  async function createBusinessWithType(email: string, businessType: string) {
    const { token } = await signupLogin(app, email);
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: `${businessType} Biz`, businessType },
    });
    const biz = JSON.parse(bizRes.body).data;
    return { token, biz };
  }

  it("GET /api/v1/businesses/:id/capabilities returns defaults for restaurant", async () => {
    const { token, biz } = await createBusinessWithType("rest@test.com", "restaurant");
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.businessType).toBe("restaurant");
    expect(body.data.enabledModules).toContain("menu");
    expect(body.data.enabledModules).toContain("orders");
    expect(body.data.enabledModules).toContain("bookings");
    expect(body.data.enabledModules).toContain("website");
    expect(body.data.profile.label).toBe("Restaurant");
  });

  it("GET /api/v1/businesses/:id/capabilities returns defaults for salon", async () => {
    const { token, biz } = await createBusinessWithType("salon@test.com", "salon");
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.businessType).toBe("salon");
    expect(body.data.enabledModules).toContain("services");
    expect(body.data.enabledModules).toContain("bookings");
    expect(body.data.enabledModules).not.toContain("orders");
  });

  it("GET /api/v1/businesses/:id/capabilities returns defaults for freelancer", async () => {
    const { token, biz } = await createBusinessWithType("free@test.com", "freelancer");
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.businessType).toBe("freelancer");
    expect(body.data.enabledModules).toContain("services");
    expect(body.data.enabledModules).toContain("leads");
    expect(body.data.enabledModules).not.toContain("orders");
    expect(body.data.enabledModules).not.toContain("bookings");
  });

  it("GET /api/v1/businesses/:id/capabilities returns defaults for retail", async () => {
    const { token, biz } = await createBusinessWithType("retail@test.com", "retail");
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.businessType).toBe("retail");
    expect(body.data.enabledModules).toContain("catalog");
    expect(body.data.enabledModules).toContain("orders");
    expect(body.data.enabledModules).not.toContain("bookings");
  });

  it("PATCH /api/v1/businesses/:id/capabilities updates enabled modules", async () => {
    const { token, biz } = await createBusinessWithType("upd@test.com", "bakery");
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
      payload: { enabledModules: ["website", "catalog", "orders", "payments"] },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.enabledModules).toContain("website");
    expect(body.data.enabledModules).toContain("catalog");
    expect(body.data.enabledModules).toContain("orders");
    expect(body.data.enabledModules).toContain("payments");
  });

  it("PATCH /api/v1/businesses/:id/capabilities filters invalid capabilities", async () => {
    const { token, biz } = await createBusinessWithType("filt@test.com", "bakery");
    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
      payload: { enabledModules: ["website", "invalid_cap", "also_fake"] },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data.enabledModules).toContain("website");
    expect(body.data.enabledModules).not.toContain("invalid_cap");
    expect(body.data.enabledModules).not.toContain("also_fake");
  });

  it("PATCH persists capabilities to database", async () => {
    const { token, biz } = await createBusinessWithType("pers@test.com", "bakery");
    await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
      payload: { enabledModules: ["website", "catalog", "orders"] },
    });
    const dbBiz = await prisma.business.findUnique({ where: { id: biz.id } });
    expect(dbBiz?.enabledModules).toBeTruthy();
    const parsed = JSON.parse(dbBiz!.enabledModules!);
    expect(parsed).toContain("website");
    expect(parsed).toContain("catalog");
    expect(parsed).toContain("orders");
  });

  it("Legacy business type maps correctly", async () => {
    const { token } = await signupLogin(app, "legacy@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Legacy Biz", businessType: "food" },
    });
    const biz = JSON.parse(bizRes.body).data;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.businessType).toBe("restaurant");
    expect(body.data.originalBusinessType).toBe("food");
    expect(body.data.enabledModules).toContain("menu");
  });

  it("Unknown business type defaults to other", async () => {
    const { token } = await signupLogin(app, "unk@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Unknown Biz", businessType: "xyz_custom_123" },
    });
    const biz = JSON.parse(bizRes.body).data;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.businessType).toBe("other");
    expect(body.data.enabledModules).toContain("website");
    expect(body.data.enabledModules).toContain("customers");
  });
});

describe("Tenant Isolation - Capabilities", () => {
  it("user cannot read another business capabilities", async () => {
    const { token: tokenA } = await signupLogin(app, "ownerA_cap@test.com");
    const bizARes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "Biz A Cap" },
    });
    const bizA = JSON.parse(bizARes.body).data;

    const { token: tokenB } = await signupLogin(app, "ownerB_cap@test.com");

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${bizA.id}/capabilities`,
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect([403, 404]).toContain(res.statusCode);
  });

  it("user cannot modify another business capabilities", async () => {
    const { token: tokenA } = await signupLogin(app, "ownerA_cap2@test.com");
    const bizARes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${tokenA}` },
      payload: { name: "Biz A Cap2" },
    });
    const bizA = JSON.parse(bizARes.body).data;

    const { token: tokenB } = await signupLogin(app, "ownerB_cap2@test.com");

    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${bizA.id}/capabilities`,
      headers: { authorization: `Bearer ${tokenB}` },
      payload: { enabledModules: ["website"] },
    });
    expect([403, 404]).toContain(res.statusCode);
  });

  it("unauthenticated user cannot access capabilities", async () => {
    const { token } = await signupLogin(app, "ownerUnauth@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Unauth Biz" },
    });
    const biz = JSON.parse(bizRes.body).data;

    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("invalid capabilities input is rejected", async () => {
    const { token, biz } = await signupLogin(app, "invalid@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Invalid Biz" },
    });
    const b = JSON.parse(bizRes.body).data;

    const res = await app.inject({
      method: "PATCH",
      url: `/api/v1/businesses/${b.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
      payload: { enabledModules: "not_an_array" },
    });
    expect(res.statusCode).toBe(422);
  });
});

describe("Navigation Generation", () => {
  it("restaurant gets menu + orders in navigation", async () => {
    const { token } = await signupLogin(app, "nav_rest@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Nav Restaurant", businessType: "restaurant" },
    });
    const biz = JSON.parse(bizRes.body).data;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.enabledModules).toContain("menu");
    expect(body.data.enabledModules).toContain("orders");
    expect(body.data.enabledModules).toContain("bookings");
  });

  it("freelancer gets services + leads, no orders", async () => {
    const { token } = await signupLogin(app, "nav_free@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "Nav Freelancer", businessType: "freelancer" },
    });
    const biz = JSON.parse(bizRes.body).data;
    const res = await app.inject({
      method: "GET",
      url: `/api/v1/businesses/${biz.id}/capabilities`,
      headers: { authorization: `Bearer ${token}` },
    });
    const body = JSON.parse(res.body);
    expect(body.data.enabledModules).toContain("services");
    expect(body.data.enabledModules).toContain("leads");
    expect(body.data.enabledModules).not.toContain("orders");
    expect(body.data.enabledModules).not.toContain("bookings");
  });
});

describe("Capability Configuration Consistency", () => {
  it("all business types have recommended and optional arrays", async () => {
    const res = await app.inject({ method: "GET", url: "/api/v1/business-types" });
    const body = JSON.parse(res.body);
    for (const t of body.data) {
      expect(t.profile.recommended.length).toBeGreaterThan(0);
      expect(t.profile.recommended.length).toBeLessThanOrEqual(10);
    }
  });

  it("new business gets enabledModules in database", async () => {
    const { token } = await signupLogin(app, "newbiz@test.com");
    const bizRes = await app.inject({
      method: "POST",
      url: "/api/v1/businesses",
      headers: { authorization: `Bearer ${token}` },
      payload: { name: "New Biz", businessType: "cafe" },
    });
    const biz = JSON.parse(bizRes.body).data;
    const dbBiz = await prisma.business.findUnique({ where: { id: biz.id } });
    expect(dbBiz?.enabledModules).toBeTruthy();
    const parsed = JSON.parse(dbBiz!.enabledModules!);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed).toContain("website");
    expect(parsed).toContain("menu");
  });
});
