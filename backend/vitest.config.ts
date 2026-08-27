import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    testTimeout: 60000,
    hookTimeout: 60000,
    sequence: { concurrent: false },
    fileParallelism: false,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || "file:/home/user/project/backend/prisma/test.db",
      JWT_SECRET: "test_jwt_secret_32chars_min_for_vitest",
      JWT_EXPIRES_IN: "7d",
      CORS_ORIGIN: "*",
      FRONTEND_URL: "http://localhost:3000",
      NODE_ENV: "test",
      PORT: "4001",
      HOST: "127.0.0.1",
    },
  },
});
