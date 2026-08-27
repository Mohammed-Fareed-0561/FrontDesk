# FrontDesk — MEMORY.md

**Purpose:** Developer handoff / AI project memory (not Business Memory). Updated 2026-08-27 14:25 UTC

## Implementation Status — ✅ STABLE v0.1 MVP
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
- Clean: backend 21028 running, frontend prod stopped after verify. No Docker needed for dev. All UI now real CRUD, not placeholders.

## Next Recommended (if extending)
1. Orders/Bookings/Payments modules (schema ready, routes TODO per `documentation/ORDERS-AND-ORDER-MANAGEMENT.md`)
2. Media object-storage adapter (currently metadata only, file buffered in memory per `backend/src/modules/media/media.routes.ts:1`)
3. Playwright e2e + Vitest integration tests per `documentation/TESTING-STRATEGY.md`
4. Switch to Postgres: start Docker, `docker compose up -d`, update `DATABASE_URL`, change prisma provider to postgresql, re-migrate.

## Files Changed (v0.1)
- backend: app, 13 modules, prisma, seed, config, package.json (Fastify 5)
- frontend: app/*, components/ui/*, layout/*, hooks/useBusiness, lib/api, providers, types, tailwind, globals, b/[slug] public page, catalog/importer/website/inbox/copilot/activity/settings/customers/business
- root: .gitignore, docker-compose.yml, README.md, MEMORY.md
