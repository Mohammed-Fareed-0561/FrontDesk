import { FastifyInstance } from "fastify";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../../infrastructure/database/client.js";
import { AppError, Errors } from "../../shared/errors/AppError.js";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/v1/auth/signup", async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() });
    const { email, password, displayName } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw Errors.conflict("Email already registered");
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash: hash, displayName: displayName ?? email.split("@")[0] },
    });
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    // also create a personal workspace for new user if none? create on business creation instead
    return reply.code(201).send({ success: true, data: { user: { id: user.id, email: user.email, displayName: user.displayName }, token } });
  });

  app.post("/api/v1/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) throw new AppError({ statusCode: 422, code: "VALIDATION_ERROR", message: "Validation failed", details: parsed.error.flatten() });
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Errors.unauthorized("Invalid email or password");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Errors.unauthorized("Invalid email or password");
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = app.jwt.sign({ sub: user.id, email: user.email });
    return reply.send({ success: true, data: { user: { id: user.id, email: user.email, displayName: user.displayName }, token } });
  });

  app.get("/api/v1/auth/me", { preHandler: [(app as any).authenticate] }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, displayName: true, avatarUrl: true, createdAt: true } });
    if (!user) throw Errors.notFound("User");
    return reply.send({ success: true, data: user });
  });
}
