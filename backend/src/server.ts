import { buildApp } from "./app/app.js";
import { loadEnv } from "./config/env.js";

const env = loadEnv();

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  console.log(`✅ FrontDesk backend listening on http://${env.HOST}:${env.PORT}`);
  console.log(`   Health: http://localhost:${env.PORT}/api/v1/health`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
