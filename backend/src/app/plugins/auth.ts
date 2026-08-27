import { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string };
    user: { sub: string; email: string };
  }
}

export default fp(async function authPlugin(app: FastifyInstance) {
  app.decorate("authenticate", async function (request: FastifyRequest) {
    try {
      const decoded = await request.jwtVerify<{ sub: string; email: string }>();
      (request as any).userId = decoded.sub;
    } catch (err) {
      throw app.httpErrors.unauthorized("Authentication required");
    }
  });
});

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: any) => Promise<void>;
  }
}
