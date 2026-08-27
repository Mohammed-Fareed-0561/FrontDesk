# FrontDesk — MEMORY.md

**Purpose:** Developer handoff / AI project memory (not Business Memory). Updated 2026-08-27 17:30 UTC

## Implementation Status — ✅ STABLE v0.1 MVP + E2E FOUNDATION (2026-08-27)

### Current Increment: E2E & Tenant-Isolation Tests — VERIFIED
- **Backend Vitest** `backend/vitest.config.ts:1` + `backend/tests/api.test.ts:1` + `backend/tests/helpers.ts:1` — 7 tests: health, auth/signup-login-me, tenant-isolation (cross-business 403), catalog public projection, critical journey (import→website→enquiry). Uses `DATABASE_URL=file:/home/user/project/backend/prisma/test.db` isolated from dev.db, `JWT_SECRET=test_jwt_secret_32chars_min_for_vitest`. **Verified**: `npm run test` → 7 passed.
- **Frontend Playwright** `frontend/playwright.config.ts:1` + `frontend/e2e/critical-journey.spec.ts:1` — 6 tests: backend health, redirect /→/login, demo login→dashboard, public /b/royal-bakes, tenant isolation via API, catalog flow. BaseURL http://localhost:3000, **Verified**: `npx playwright test` → 6 passed (chromium, prod build).
- **Builds**: `npx tsc --noEmit` both PASS, `npm run build` both PASS (backend tsc, frontend 16 routes).
- **Runtime**: backend 3193 (0.0.0.0:4000, dotenv fixed via `set -a; source .env`), frontend prod 5849 (0.0.0.0:3000, `npm run start`). Health 200, demo login 200, public storefront 200.

## Implementation Status — ✅ STABLE v0.1 MVP (previous)
- **Backend** `backend/src/server.ts:1` — Fastify 5 + Prisma 5 SQLite(dev)/PostgreSQL(prod) **verified**: `npx tsc --noEmit` OK, `npm run build` → `dist/server.js`, health `GET /api/v1/health` 200, login `demo@royalbakes.test/demo12345` OK, 13 modules: auth, businesses, catalog, importer, websites, enquiries/conversations, customers, memory, knowledge, ai, qr, analytics, media. All boundaries per `documentation/SYSTEM-ARCHITECTURE.md:7`.
- **Frontend** `frontend/app/layout.tsx:1` — Next.js 14.2.6, Tailwind 3 `frontend/tailwind.config.js:1`, shadcn/ui `frontend/components/ui/*`, TanStack Query `frontend/providers/QueryProvider.tsx:1`. **Verified**: `npx tsc --noEmit` OK, `npm run build` → 16 static routes (8.16kB dashboard, 7.58kB catalog, 7.41kB importer, 7.04kB website, 7.14kB inbox, 4.29kB customers, 6.46kB activity, 7.9kB copilot, 714B public `/b/[slug]`), public page `GET /b/royal-bakes` 200 contains "Royal Bakes".
- **Database** `backend/prisma/schema.prisma:1` — 32 models, migrated `20260827_init`, seeded Royal Bakes (1 workspace, 1 business, 4 products, 2 categories, 1 website, 1 enquiry, 1 conversation, 2 memories). `DATABASE_URL=file:./dev.db` for ₹0 local dev.
- **UX** `documentation/DESIGN-SYSTEM.md:7` + `documentation/UI-UX-SPECIFICATION.md:1` — business-owner language, tokens not hardcoded, consistent spacing/typography, mobile-first (320/375/768/1024/1440), touch targets, keyboard focus, empty/loading/error/success states, skeletons, badges, toasts.

## Architecture Decisions (locked)
- Modular monolith strict boundaries: Route → Controller → Service → Repository → DB per `documentation/FOLDER-STRUCTURE.md:33`. AI never hits DB directly → Action Registry `backend/src/modules/ai/ai.routes.ts:1`.
- JWT via `@fastify/jwt`, tenant isolation per business/workspace, Zod validation both layers.
- API ` /api/v1` versioned envelope `{success,data,meta}` / `{success:false,error:{code,message,request_id}}` per `documentation/API.md:1`.
- SQLite dev fallback because Docker daemon not running on Windows host; `docker-compose.yml:1` ready for Postgres prod.
- Public projection hides `costPrice`, private data never exposed `backend/src/modules/catalog/catalog.routes.ts:80`.

## Folder Structure (actual)
```
FrontDesk/
├── frontend/
│   ├── app/
│   │   ├── (auth)/login,signup
│   │   ├── (dashboard)/dashboard/{business,catalog,importer,website,inbox,customers,copilot,activity,settings}
│   │   ├── b/[slug]/page.tsx  # public storefront
│   │   ├── layout.tsx + globals.css
│   ├── components/ui/{button,card,input,table,dialog,badge,toast,use-toast,...} + layout/{Sidebar,Topbar}
│   ├── hooks/useBusiness.ts, lib/api/client.ts, providers/*, types/index.ts, config/app.ts
├── backend/
│   ├── src/app/app.ts + plugins/auth.ts + config/env.ts
│   ├── src/modules/{auth,businesses,catalog,importer,websites,enquiries,customers,memory,ai,qr,analytics,media}
│   ├── prisma/schema.prisma + seed.ts + migrations/
├── documentation/ (59 specs)
├── docker-compose.yml, README.md, MEMORY.md
```

## Commands (verified 2026-08-27)
- Backend: `cd backend && npm install && npx prisma generate && npx prisma migrate dev --name init && npx tsx prisma/seed.ts && npm run dev` → http://localhost:4000/api/v1/health
- Frontend: `cd frontend && npm install && npm run dev` → http://localhost:3000 (NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1). Build: `npm run build && npm start` (prod). Demo: demo@royalbakes.test / demo12345, business royal-bakes at /b/royal-bakes
- Checks: `npx tsc --noEmit` (both), `npm run build` (both) — both OK 2026-08-27 14:25
- Verify: `node verify.mjs` — login, businesses 1, products 4, website draft, enquiries 1, public bus/products OK, analytics {products:4,...}

## Known Issues / None Blocker
- Clean: backend via `bash -c 'cd backend && set -a; source .env; set +a; ./node_modules/.bin/tsx watch src/server.ts'` (dotenv `import "dotenv/config"` alone fails when cwd is project root via `npm --prefix`). Frontend dev `next dev` has transient vendor-chunks missing for /b/[slug] after cache clear — workaround `npm run build && npm run start` works; dev needs `rm -rf .next && npm run dev` after experimental config revert. All UI now real CRUD, not placeholders.
- E2E relies on prod frontend for stability; dev vendor-chunks issue tracked.

## Next Recommended (if extending)
1. **Orders Module P0** (highest value next) — schema ready `backend/prisma/schema.prisma: Order/OrderItem`, routes TODO per `documentation/ORDERS-AND-ORDER-MANAGEMENT.md:121` (lightweight manual orders, server-side totals, status, paymentStatus separate, tenant isolation, audit). Unlocks payments, analytics revenue, CRM.
2. Media object-storage adapter (currently metadata only, file buffered in memory per `backend/src/modules/media/media.routes.ts:1`)
3. Switch to Postgres: start Docker, `docker compose up -d`, update `DATABASE_URL`, change prisma provider to postgresql, re-migrate.
4. Real AI provider abstraction + Knowledge RAG per `documentation/AI-BUSINESS-COPILOT.md`

## Files Changed (v0.1 + E2E)
- backend: app, 13 modules, prisma, seed, config, package.json (Fastify 5) + **new**: `vitest.config.ts`, `tests/helpers.ts`, `tests/api.test.ts`, `prisma/test.db`, `src/config/env.ts` (dotenv fix), package.json added `dotenv`
- frontend: app/*, components/ui/*, layout/*, hooks/useBusiness, lib/api, providers, types, tailwind, globals, b/[slug] public page, catalog/importer/website/inbox/copilot/activity/settings/customers/business + **new**: `playwright.config.ts`, `e2e/critical-journey.spec.ts`, `next.config.js` (headers for e2b.app, reverted experimental), package.json added `@playwright/test`
- root: .gitignore, docker-compose.yml, README.md, MEMORY.md, `.ideavo/config` (runStep now `bash -c 'cd backend && set -a; source .env; set +a; PORT=4000 HOST=0.0.0.0 ./node_modules/.bin/tsx watch src/server.ts'`)

## Verification (2026-08-27 17:30)
- `npm --prefix backend run lint` PASS
- `npm --prefix frontend run type-check` PASS
- `npm --prefix backend run build` PASS
- `npm --prefix frontend run build` PASS (16 routes)
- `npm --prefix backend run test` 7/7 PASS
- `bash -c 'cd frontend && npx playwright test'` 6/6 PASS (prod)
- Runtime: `curl /api/v1/health` 200, `curl /api/v1/auth/login` demo 200, `curl /b/royal-bakes` 200 Royal Bakes
