import { buildApp } from "../src/app/app.js";
import { prisma } from "../src/infrastructure/database/client.js";

export async function createTestApp() {
  const app = await buildApp();
  await app.ready();
  return app;
}

export async function cleanupDb() {
  const t = prisma;
  await t.auditLog.deleteMany();
  await t.domainEvent.deleteMany();
  await t.eventDelivery.deleteMany();
  await t.actionExecution.deleteMany();
  await t.approvalRequest.deleteMany();
  await t.aiOutput.deleteMany();
  await t.aiRequest.deleteMany();
  await (t as any).payment?.deleteMany?.();
  await (t as any).booking?.deleteMany?.();
  await t.service.deleteMany();
  await t.orderItem.deleteMany();
  await t.order.deleteMany();
  await t.message.deleteMany();
  await t.conversation.deleteMany();
  await t.enquiry.deleteMany();
  await t.customerConsent.deleteMany();
  await t.customer.deleteMany();
  await t.importConflict.deleteMany();
  await t.importItem.deleteMany();
  await t.importSource.deleteMany();
  await t.importJob.deleteMany();
  await t.mediaAsset.deleteMany();
  await t.knowledgeChunk.deleteMany();
  await t.knowledgeDocument.deleteMany();
  await t.memoryEvent.deleteMany();
  await t.businessMemory.deleteMany();
  await t.websiteSection.deleteMany();
  await t.websitePage.deleteMany();
  await t.websiteVersion.deleteMany();
  await t.websiteDomain.deleteMany();
  await t.website.deleteMany();
  await t.productImage.deleteMany();
  await t.productVariant.deleteMany();
  await t.product.deleteMany();
  await t.category.deleteMany();
  await t.offer.deleteMany();
  await t.service.deleteMany();
  await t.businessHours.deleteMany();
  await t.businessLocation.deleteMany();
  await t.businessSettings.deleteMany();
  await t.business.deleteMany();
  await t.workspaceMember.deleteMany();
  await t.invitation.deleteMany();
  await t.workspace.deleteMany();
  await t.user.deleteMany();
}

export async function signupLogin(app: any, email: string, password = "password123") {
  const signup = await app.inject({
    method: "POST",
    url: "/api/v1/auth/signup",
    payload: { email, password, displayName: email.split("@")[0] },
  });
  if (signup.statusCode === 201) return JSON.parse(signup.body).data;
  const login = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: { email, password },
  });
  return JSON.parse(login.body).data;
}

export async function authHeader(app: any, email: string) {
  const data = await signupLogin(app, email);
  return { token: data.token, user: data.user };
}
