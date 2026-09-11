import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";
import {
  ALL_BUSINESS_TYPES,
  ALL_CAPABILITIES,
  getDefaultCapabilities,
  getProfileForBusinessType,
  mapLegacyBusinessType,
  validateCapabilities,
} from "../../shared/config/capabilities.js";

const updateCapabilitiesSchema = z.object({
  enabledModules: z.array(z.string()),
});

async function assertBusinessAccess(userId: string, businessId: string) {
  const business = await prisma.business.findFirst({ where: { id: businessId, deletedAt: null } });
  if (!business) throw Errors.notFound("Business");
  const member = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId: business.workspaceId } });
  const owner = await prisma.workspace.findFirst({ where: { id: business.workspaceId, ownerUserId: userId } });
  if (!member && !owner) throw Errors.forbidden();
  return business;
}

export async function capabilitiesRoutes(app: FastifyInstance) {
  app.get("/api/v1/business-types", async () => {
    return {
      success: true,
      data: ALL_BUSINESS_TYPES.map((t) => ({
        value: t,
        label: BUSINESS_TYPE_LABELS[t] || t,
        profile: getProfileForBusinessType(t),
      })),
    };
  });

  app.get("/api/v1/businesses/:businessId/capabilities", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    const business = await assertBusinessAccess(userId, businessId);

    const normalizedType = mapLegacyBusinessType(business.businessType);
    const profile = getProfileForBusinessType(normalizedType);
    const defaults = getDefaultCapabilities(normalizedType);

    let enabledModules: string[] = defaults;
    if (business.enabledModules) {
      try {
        const parsed = JSON.parse(business.enabledModules);
        if (Array.isArray(parsed) && parsed.length > 0) {
          enabledModules = validateCapabilities(parsed);
        }
      } catch {
        // ignore parse errors, use defaults
      }
    }

    return reply.send({
      success: true,
      data: {
        businessType: normalizedType,
        originalBusinessType: business.businessType,
        profile,
        enabledModules,
        allCapabilities: ALL_CAPABILITIES,
      },
    });
  });

  app.patch("/api/v1/businesses/:businessId/capabilities", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { businessId } = request.params as any;
    const business = await assertBusinessAccess(userId, businessId);

    const parsed = updateCapabilitiesSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError({
        statusCode: 422,
        code: "VALIDATION_ERROR",
        message: "Invalid capabilities data",
        details: parsed.error.flatten(),
      });
    }

    const normalizedType = mapLegacyBusinessType(business.businessType);
    const profile = getProfileForBusinessType(normalizedType);
    const allAvailable = new Set([...profile.recommended, ...profile.optional]);
    const validModules = parsed.data.enabledModules.filter((c) => allAvailable.has(c as any));

    const enabledModulesJson = JSON.stringify(validModules);

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: { enabledModules: enabledModulesJson, updatedAt: new Date() } as any,
    });

    await prisma.auditLog.create({
      data: {
        businessId,
        actorType: "user",
        actorId: userId,
        action: "CAPABILITIES_UPDATED",
        entityType: "business",
        entityId: businessId,
        beforeData: JSON.stringify({ enabledModules: business.enabledModules }),
        afterData: JSON.stringify({ enabledModules: enabledModulesJson }),
      },
    });

    await prisma.domainEvent.create({
      data: {
        businessId,
        eventType: "CAPABILITIES_UPDATED",
        aggregateType: "business",
        aggregateId: businessId,
        payload: JSON.stringify({ businessId }),
      },
    });

    return reply.send({
      success: true,
      data: {
        enabledModules: validModules,
        businessType: normalizedType,
      },
    });
  });
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant", cafe: "Cafe", bakery: "Bakery", salon: "Salon",
  barbershop: "Barbershop", clinic: "Clinic", retail: "Retail", ecommerce: "E-commerce",
  agency: "Agency", freelancer: "Freelancer", consultant: "Consultant", education: "Education",
  real_estate: "Real Estate", service_business: "Service Business", portfolio: "Portfolio", other: "Other",
};
