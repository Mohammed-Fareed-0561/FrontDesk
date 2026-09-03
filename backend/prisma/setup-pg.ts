#!/usr/bin/env node
/**
 * FrontDesk PostgreSQL setup script.
 *
 * Runs after `prisma db push --schema=prisma/schema.pg.prisma` to apply
 * PostgreSQL-specific raw SQL objects that Prisma's db push cannot manage:
 *
 *   1. pgvector extension + vector columns + HNSW indexes (001)
 *   2. Notification broadcast dedup partial unique index (002)
 *
 * Usage:
 *   DATABASE_URL=postgresql://... npx tsx backend/prisma/setup-pg.ts
 *
 * Idempotency: all SQL files use IF NOT EXISTS / CREATE ... IF NOT EXISTS.
 * Safe to run multiple times.
 */
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "pg-migrations");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL is not set. Set it to your PostgreSQL connection string.");
  process.exit(1);
}

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  console.error("ERROR: DATABASE_URL must start with 'postgresql://' or 'postgres://' for this script.");
  process.exit(1);
}

const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("No PostgreSQL migration files found in pg-migrations/.");
  process.exit(0);
}

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();
  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`Applying: ${file}`);
    await client.query(sql);
    console.log(`Done: ${file}\n`);
  }
  console.log("All PostgreSQL migrations applied successfully.");
} finally {
  await client.end();
}
