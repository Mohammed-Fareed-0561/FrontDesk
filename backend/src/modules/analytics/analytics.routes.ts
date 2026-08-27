import { FastifyInstance } from "fastify";
import { prisma } from "../../infrastructure/database/client.js";
import { Errors } from "../../shared/errors/AppError.js";

async function assertBusinessAccess(userId: string, businessId: string) {
  const b = await prisma.business.findUnique({ where: { id: businessId } });
  if (!b) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: b.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: b.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return b;
}

export async function analyticsRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/analytics/overview", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const [productCount, enquiryCount, enquiryNew, customerCount, importCount, website, events] = await Promise.all([
      prisma.product.count({ where: { businessId, deletedAt: null } }),
      prisma.enquiry.count({ where: { businessId } }),
      prisma.enquiry.count({ where: { businessId, status: "new" } }),
      prisma.customer.count({ where: { businessId } }),
      prisma.importJob.count({ where: { businessId } }),
      prisma.website.findFirst({ where: { businessId } }),
      prisma.domainEvent.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);
    const overview = {
      counts: { products: productCount, enquiries: enquiryCount, newEnquiries: enquiryNew, customers: customerCount, imports: importCount },
      website: website ? { status: website.status, id: website.id } : null,
      recentEvents: events.map(e => ({ type: e.eventType, at: e.createdAt })),
      // No fake analytics: only events we can reliably observe. QR scans/product views require future instrumentation.
    };
    return reply.send({ success: true, data: overview });
  });

  app.get("/api/v1/businesses/:businessId/audit-logs", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    await assertBusinessAccess(userId, businessId);
    const logs = await prisma.auditLog.findMany({ where: { businessId }, orderBy: { createdAt: "desc" }, take: 100 });
    return reply.send({ success: true, data: logs });
  });
}
