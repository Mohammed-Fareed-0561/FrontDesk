import { test, expect } from "@playwright/test";

const API = "http://localhost:4000/api/v1";

async function signup(request: any, email: string) {
  const res = await request.post(`${API}/auth/signup`, { data: { email, password: "password123", displayName: email.split("@")[0] } });
  if (!res.ok()) {
    const login = await request.post(`${API}/auth/login`, { data: { email, password: "password123" } });
    return (await login.json()).data;
  }
  return (await res.json()).data;
}

test.describe("Orders — E2E API via Frontend", () => {
  test("order lifecycle: create → confirm → complete with payment independence", async ({ request }) => {
    const email = `ord-e2e-${Date.now()}@test.com`;
    const { token } = await signup(request, email);
    const bizRes = await request.post(`${API}/businesses`, { headers: { Authorization: `Bearer ${token}` }, data: { name: `E2EBiz${Date.now()}` } });
    expect(bizRes.ok()).toBeTruthy();
    const biz = (await bizRes.json()).data;
    const pRes = await request.post(`${API}/businesses/${biz.id}/products`, { headers: { Authorization: `Bearer ${token}` }, data: { name: `E2EProd${Date.now()}`, price: 500, status: "active" } });
    const prod = (await pRes.json()).data;

    const oRes = await request.post(`${API}/businesses/${biz.id}/orders`, { headers: { Authorization: `Bearer ${token}` }, data: { items: [{ productId: prod.id, quantity: 2 }] } });
    expect(oRes.ok()).toBeTruthy();
    const order = (await oRes.json()).data;
    expect(order.subtotal).toBe(1000);
    expect(order.status).toBe("pending");
    expect(order.paymentStatus).toBe("unpaid");

    const pay = await request.post(`${API}/businesses/${biz.id}/orders/${order.id}/payment`, { headers: { Authorization: `Bearer ${token}` }, data: { paymentStatus: "paid" } });
    expect(pay.ok()).toBeTruthy();
    expect((await pay.json()).data.paymentStatus).toBe("paid");

    const confirm = await request.post(`${API}/businesses/${biz.id}/orders/${order.id}/confirm`, { headers: { Authorization: `Bearer ${token}` } });
    expect(confirm.ok()).toBeTruthy();
    expect((await confirm.json()).data.status).toBe("confirmed");

    const complete = await request.post(`${API}/businesses/${biz.id}/orders/${order.id}/complete`, { headers: { Authorization: `Bearer ${token}` } });
    expect(complete.ok()).toBeTruthy();
    expect((await complete.json()).data.status).toBe("completed");
  });

  test("order cross-tenant isolation", async ({ request }) => {
    const a = await signup(request, `ordA${Date.now()}@test.com`);
    const b = await signup(request, `ordB${Date.now()}@test.com`);
    const bizA = (await (await request.post(`${API}/businesses`, { headers: { Authorization: `Bearer ${a.token}` }, data: { name: `BizA${Date.now()}` } })).json()).data;
    const prodA = (await (await request.post(`${API}/businesses/${bizA.id}/products`, { headers: { Authorization: `Bearer ${a.token}` }, data: { name: `ProdA${Date.now()}`, price: 100, status: "active" } })).json()).data;
    const order = (await (await request.post(`${API}/businesses/${bizA.id}/orders`, { headers: { Authorization: `Bearer ${a.token}` }, data: { items: [{ productId: prodA.id, quantity: 1 }] } })).json()).data;
    const listAsB = await request.get(`${API}/businesses/${bizA.id}/orders`, { headers: { Authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(listAsB.status())).toBeTruthy();
    const getAsB = await request.get(`${API}/businesses/${bizA.id}/orders/${order.id}`, { headers: { Authorization: `Bearer ${b.token}` } });
    expect([403, 404].includes(getAsB.status())).toBeTruthy();
  });

  test("server-side totals ignore client unitPrice", async ({ request }) => {
    const { token } = await signup(request, `ordPrice${Date.now()}@test.com`);
    const biz = (await (await request.post(`${API}/businesses`, { headers: { Authorization: `Bearer ${token}` }, data: { name: `BizP${Date.now()}` } })).json()).data;
    const prod = (await (await request.post(`${API}/businesses/${biz.id}/products`, { headers: { Authorization: `Bearer ${token}` }, data: { name: `ProdP${Date.now()}`, price: 200, status: "active" } })).json()).data;
    const o = await request.post(`${API}/businesses/${biz.id}/orders`, { headers: { Authorization: `Bearer ${token}` }, data: { items: [{ productId: prod.id, quantity: 3, unitPrice: 1 }] } });
    expect(o.ok()).toBeTruthy();
    expect((await o.json()).data.subtotal).toBe(600);
  });
});
