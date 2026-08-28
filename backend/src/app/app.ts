import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { loadEnv } from "../config/env.js";
import { prisma } from "../infrastructure/database/client.js";
import authPlugin from "./plugins/auth.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { businessesRoutes } from "../modules/businesses/businesses.routes.js";
import { catalogRoutes } from "../modules/catalog/catalog.routes.js";
import { importerRoutes } from "../modules/importer/importer.routes.js";
import { websitesRoutes } from "../modules/websites/websites.routes.js";
import { enquiriesRoutes } from "../modules/enquiries/enquiries.routes.js";
import { customersRoutes } from "../modules/customers/customers.routes.js";
import { memoryRoutes } from "../modules/memory/memory.routes.js";
import { aiRoutes } from "../modules/ai/ai.routes.js";
import { qrRoutes } from "../modules/qr/qr.routes.js";
import { analyticsRoutes } from "../modules/analytics/analytics.routes.js";
import { mediaRoutes } from "../modules/media/media.routes.js";
import { ordersRoutes } from "../modules/orders/orders.routes.js";
import { paymentsRoutes } from "../modules/payments/payments.routes.js";
import { bookingsRoutes } from "../modules/bookings/bookings.routes.js";
import { servicesRoutes } from "../modules/services/services.routes.js";
import { knowledgeRoutes } from "../modules/knowledge/knowledge.routes.js";
import { insightsRoutes } from "../modules/insights/insights.routes.js";
import { AppError } from "../shared/errors/AppError.js";

export async function buildApp() {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "test" ? "silent" : "info",
    },
    trustProxy: true,
  });

  // request id
  app.addHook("onRequest", async (req, reply) => {
    const reqId = req.headers["x-request-id"] as string || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    (req as any).requestId = reqId;
    reply.header("x-request-id", reqId);
  });

  await app.register(sensible);
  await app.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map(s => s.trim()),
    credentials: true,
  });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await app.register(authPlugin);

  // health
  app.get("/health", async () => ({ status: "ok", version: "0.1.0" }));
  app.get("/api/v1/health", async () => ({ success: true, data: { status: "ok", time: new Date().toISOString() } }));

  // seed action definitions on startup lazily
  app.addHook("onReady", async () => {
    const defs = [
      { actionKey: "CREATE_PRODUCT", name: "Create Product", approvalRequired: false },
      { actionKey: "UPDATE_PRODUCT", name: "Update Product", approvalRequired: true },
      { actionKey: "DELETE_PRODUCT", name: "Delete Product", approvalRequired: true },
      { actionKey: "PUBLISH_WEBSITE", name: "Publish Website", approvalRequired: false },
      { actionKey: "CREATE_OFFER", name: "Create Offer", approvalRequired: false },
    ];
    for (const d of defs) {
      await prisma.actionDefinition.upsert({ where: { actionKey: d.actionKey }, update: {}, create: d });
    }
  });

  // routes
  await app.register(authRoutes);
  await app.register(businessesRoutes);
  await app.register(catalogRoutes);
  await app.register(importerRoutes);
  await app.register(websitesRoutes);
  await app.register(enquiriesRoutes);
  await app.register(customersRoutes);
  await app.register(memoryRoutes);
  await app.register(aiRoutes);
  await app.register(qrRoutes);
  await app.register(analyticsRoutes);
  await app.register(mediaRoutes);
  await app.register(ordersRoutes);
  await app.register(paymentsRoutes);
  await app.register(bookingsRoutes);
  await app.register(servicesRoutes);
  await app.register(knowledgeRoutes);
  await app.register(insightsRoutes);

  // 404
  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.url} not found` } });
  });

  // error handler
  app.setErrorHandler((error: any, request, reply) => {
    if (error instanceof AppError) {
      request.log.warn({ err: error, requestId: (request as any).requestId }, error.message);
      return reply.code(error.statusCode).send({ success: false, error: { code: error.code, message: error.message, details: error.details, request_id: (request as any).requestId } });
    }
    if (error.validation) {
      return reply.code(400).send({ success: false, error: { code: "VALIDATION_ERROR", message: error.message, details: error.validation, request_id: (request as any).requestId } });
    }
    if (error.statusCode) {
      const code = error.code || "ERROR";
      return reply.code(error.statusCode).send({ success: false, error: { code, message: error.message, request_id: (request as any).requestId } });
    }
    request.log.error({ err: error, requestId: (request as any).requestId }, "Unhandled error");
    return reply.code(500).send({ success: false, error: { code: "INTERNAL_ERROR", message: env.NODE_ENV === "production" ? "Internal server error" : error.message, request_id: (request as any).requestId } });
  });

  return app;
}
