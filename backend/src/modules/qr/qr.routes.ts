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

export async function qrRoutes(app: FastifyInstance) {
  app.get("/api/v1/businesses/:businessId/qr", { preHandler: [(app as any).authenticate] }, async (req, reply) => {
    const userId = (req as any).userId as string;
    const { businessId } = req.params as any;
    const business = await assertBusinessAccess(userId, businessId);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const publicUrl = `${frontendUrl}/b/${business.slug}`;
    // QR generation is frontend-side via open-source lib; backend just provides destination
    return reply.send({ success: true, data: { businessId, slug: business.slug, publicUrl, destinations: [{ label: "Business Website", url: publicUrl }, { label: "Menu / Products", url: `${publicUrl}/menu` }, { label: "Contact", url: `${publicUrl}/contact` }] } });
  });

  app.get("/api/v1/public/businesses/:slug/qr", async (req, reply) => {
    const { slug } = req.params as any;
    const business = await prisma.business.findFirst({ where: { slug } });
    if (!business) throw Errors.notFound("Business");
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const publicUrl = `${frontendUrl}/b/${slug}`;
    return reply.send({ success: true, data: { slug, publicUrl } });
  });
}
