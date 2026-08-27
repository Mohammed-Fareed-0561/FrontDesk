# FrontDesk — MEMORY.md

**Purpose:** Developer handoff / AI project memory (not Business Memory). Updated 2026-08-27 18:50 UTC

## Implementation Status — ✅ STABLE v0.1 MVP + E2E + ORDERS + ORDERS UI + PAYMENTS + MEDIA (2026-08-27)

### Current Increment: Media Object Storage Adapter P0 — VERIFIED
- **Storage Adapter** `backend/src/infrastructure/storage/StorageAdapter.ts:1` + `LocalStorageAdapter.ts:1` — provider-neutral interface (upload/download/delete/exists/getPublicUrl/getSignedUrl), sanitization `sanitizeFilename`, `buildStorageKey(businessId, mediaId, filename)` → `business/{bid}/media/{mid}/{safe}` (tenant-scoped opaque, no `..`/`/`). Local dev adapter stores under `STORAGE_PATH` or `cwd/storage` via `fs/promises`, `mkdir -p`, HMAC-SHA256 signed URLs `exp+sig` (JWT_SECRET, 300s default, timingSafeEqual), `verifySignedUrl`.
- **Media API Hardened** `backend/src/modules/media/media.routes.ts:1` (rewritten, 180 lines) — POST /businesses/:id/media (auth, `assertBusinessAccess`, `req.file()`, validate 5MB, allowed MIME image/* + jpeg/png/webp/gif/svg/pdf/csv, ext whitelist, filename sanitization, path traversal block, storageKey via `buildStorageKey`, `storage.upload`, audit MEDIA_UPLOADED, returns signedUrl+publicUrl), GET /businesses/:id/media (list 100, tenant isolated, adds signedUrl), GET /businesses/:id/media/:id (single + exists + signedUrl), GET /businesses/:id/media/:id/file (private, auth, tenant, 404 OBJECT_MISSING if metadata exists but file missing, Cache-Control private), GET /media/signed/:key?exp&sig (public signed, verify HMAC, 401 invalid/expired), GET /public/business/:slug/media/:id/file (public, checks business active and asset not private, Cache-Control public), DELETE /businesses/:id/media/:id (auth, tenant, checks productImage/website published refs, audit MEDIA_DELETE_BLOCKED, storage.delete then soft-delete DB, handle partial failure, audit MEDIA_DELETED + domain MEDIA_DELETED).
- **Prisma MediaAsset** `backend/prisma/schema.prisma:409` — reused (id, businessId, fileName sanitized, storageKey tenant-scoped, mimeType, fileSize, width/height, altText, status active|deleted, metadata JSON, timestamps, deletedAt soft-delete, indexed businessId). No duplicate tables, SQLite+Postgres compatible. Added `storage/` to `.gitignore`.
- **Frontend** No new UI (per spec, verify existing product/website assets); `frontend/e2e/media.spec.ts:1` added 2 tests (public storefront still shows product images, authenticated list ok / unauth 401). Existing catalog/website/inbox verified.
- **Tests** Backend 43/43 (7 api + 11 orders + 12 payments + 13 media: upload+metadata, tenant isolation list/get/delete, auth 401, oversized 400, MIME 400, path traversal sanitized, empty 400, delete DB+storage, orphan OBJECT_MISSING, private auth/cross-tenant 403, public via slug, signed valid/invalid, tenant-scoped key opaque, no credentials leaked). Frontend 13/13 (6 critical + 3 orders API + 2 orders UI + 2 media).
- **Builds**: `npx tsc --noEmit` both PASS, `npm run build` both PASS (backend tsc, frontend 17 routes 6.84kB with orders+media).
- **Runtime**: backend 0.0.0.0:4000 health 200, frontend prod 0.0.0.0:3000 /dashboard/orders 200, upload via multipart verified (storage/business/{bid}/media/{mid}/{file} exists), signed URL 200, invalid sig 401, delete removes DB+file, tenant isolation verified, public private distinction verified.

### Previous Increment: Payment Domain Hardening P0 — VERIFIED
- **Payment Model** `backend/prisma/schema.prisma:657` + `migrations/20260827174042_add_payments/migration.sql` — `Payment` (id, businessId, orderId, customerId, paymentNumber PAY-xxx unique per business, amount server-derived from order.totalAmount, currency, status unpaid|pending|paid|failed|refunded, paymentMethod CASH|UPI|CARD|BANK_TRANSFER|ONLINE|OTHER, provider, providerPaymentId, transactionReference, paidAt, createdBy, idempotencyKey unique per business, timestamps). Relations to Business/Order, SQLite+Postgres compatible. Generated client v5.22.0.
- **Payments API** `backend/src/modules/payments/payments.routes.ts:1` (new, 180 lines) + hardened `backend/src/modules/orders/orders.routes.ts:257` — POST /businesses/:id/orders/:id/payments (idempotent via Idempotency-Key header/body, amount integrity: rejects tampered amount, server derives from order, generates PAY-xxx, creates audit+domainEvent, syncs order.paymentStatus), GET /businesses/:id/payments (paginated, filtered), GET /businesses/:id/orders/:id/payments, GET /businesses/:id/payments/:id, POST /businesses/:id/payments/:id/status (explicit state machine unpaid→paid/pending/failed, pending→paid/failed, paid→refunded, invalid 422), POST /payments/:id/refund → 422 NOT_IMPLEMENTED (P0 refund not required, documented). Existing POST /orders/:id/payment hardened with idempotency and Payment record creation.
- **Payments State Machine** `payments.routes.ts:12` — ALLOWED_PAYMENT_TRANSITIONS: unpaid→paid/pending/failed, pending→paid/failed, paid→refunded; invalid transitions 422. Payment status independent from order status (order pending while payment paid verified).
- **Frontend Orders UI Hardened** `frontend/app/(dashboard)/dashboard/orders/page.tsx:329` — now distinguishes Payment vs Order status, shows payment history (paymentNumber, status, amount, method, reference), record payment form (method select, reference input, server amount display, Idempotency-Key generated per order), Mark paid now creates Payment via new API (not just order field), shows paidAt, updates order status separately.
- **Types** `frontend/types/index.ts:315` — added `Payment` (paymentNumber, amount, currency, status, method, reference, paidAt).
- **Tests** Backend 30/30 (7 api + 11 orders + 12 payments: correct amount, tampered 422, tenant isolation 403, auth 401, valid/invalid transitions, idempotent 200 same id, duplicate prevented, audit created, relationship integrity, independence, refund not implemented). Frontend 11/11 still pass (orders UI now uses hardened payments).
- **Builds**: `npx tsc --noEmit` both PASS, `npm run build` both PASS (backend tsc, frontend 17 routes 6.84kB with payments UI).
- **Runtime**: backend 0.0.0.0:4000 health 200, frontend prod 0.0.0.0:3000 /dashboard/orders 200, record payment via UI verified (UPI/CASH), idempotency verified, tenant isolation verified, amount tampering rejected, audit logs verified.

### Previous Increment: Orders Frontend UI — VERIFIED
- **Frontend Orders UI** `frontend/app/(dashboard)/dashboard/orders/page.tsx:1` (434 lines) — `/dashboard/orders` with: list (paginated 10/page, total), search by orderNumber, filters status/paymentStatus, badges for status/payment, customer/date/total, desktop table + mobile cards, empty/loading/error/skeletons, detail dialog (items with price×qty, subtotal/discount/tax/delivery/total server-calculated, customer, payment card, notes), create dialog (customer select + inline new customer name/phone, product select (active only) + qty, cart with preview subtotal, notes, server is source of truth), actions confirm/cancel/complete with confirm() dialogs, payment mark paid/unpaid. Responsive, a11y, toasts, follows catalog/inbox patterns, reuses shadcn/ui + Tailwind + apiClient + useBusiness. **Navigation** added to `frontend/config/app.ts:8` + `frontend/components/layout/Sidebar.tsx:24` (ShoppingBag icon).
- **Types** `frontend/types/index.ts:295` — added `Order`/`OrderItem` (status, paymentStatus, currency, subtotal/total, notes, source, items).
- **Backend** unchanged from previous increment (Orders P0 verified).
- **Playwright UI** `frontend/e2e/orders-ui.spec.ts:1` (2 new browser tests) — login→Orders→New order→select product→qty→add→create→verify toast & list→View→confirm→complete→pay (via data-testid, handles native confirm dialogs). Plus empty/search/filter state. Total now 11 tests (6 critical + 3 orders API + 2 orders UI).
- **Builds**: `npx tsc --noEmit` both PASS, `npm run build` both PASS (frontend 17 routes, orders 6.05kB).
- **Runtime**: backend 0.0.0.0:4000 health 200, frontend prod 0.0.0.0:3000 /dashboard/orders 200, create→confirm→complete→pay verified via UI, tenant isolation still verified.

### Previous Increment: Orders Module P0 — VERIFIED
- **Backend Orders** `backend/src/modules/orders/orders.routes.ts:1` + `backend/src/app/app.ts:20` — 6 endpoints: POST /businesses/:id/orders (transactional, server-side totals, cross-business injection blocked), GET /businesses/:id/orders (paginated, filtered), GET /businesses/:id/orders/:orderId, PATCH /orders/:id (notes), POST /orders/:id/confirm|cancel|complete (explicit state machine pending→confirmed→completed, pending/confirmed→cancelled), POST /orders/:id/payment (paymentStatus separate). OrderNumber `ORD-<ts>-<rnd>` unique per business, currency from business, audit + domain events for each transition. **Reuses existing Prisma Order/OrderItem schema** (no duplicate models), validated product ownership, quantity>0, transactional via `$transaction`.
- **Backend Vitest** `backend/vitest.config.ts:1` + `backend/tests/orders.test.ts:1` (11 new) + `backend/tests/api.test.ts:1` (7) — total 18 tests: creation, multiple items, quantity validation, server-side totals ignore client unitPrice, invalid product 422, cross-business product 422, cross-tenant list/get 403, valid transitions, invalid transitions 422, transactional partial not created, cancellation, paymentStatus independence. Uses isolated test DB, fileParallelism false. **Verified**: `npm run test` → 18/18 pass.
- **Frontend Playwright** `frontend/playwright.config.ts:1` + `frontend/e2e/orders.spec.ts:1` (3 new) + `frontend/e2e/critical-journey.spec.ts:1` (6) — total 9 tests: order lifecycle create→pay→confirm→complete, cross-tenant isolation, server-side totals. **Verified**: `npx playwright test` → 9/9 pass (chromium, prod build on 3000).
- **Builds**: `npx tsc --noEmit` both PASS, `npm run build` both PASS (backend tsc, frontend 16 routes).
- **Runtime**: backend 0.0.0.0:4000 health 200, frontend prod 0.0.0.0:3000 login 200, public storefront 200, orders CRUD verified via inject and playwright request.

### Previous Increment: E2E & Tenant-Isolation Tests — VERIFIED
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
│   │   ├── (dashboard)/dashboard/{business,catalog,orders,importer,website,inbox,customers,copilot,activity,settings}
│   │   ├── b/[slug]/page.tsx  # public storefront
│   │   ├── layout.tsx + globals.css
│   ├── components/ui/{button,card,input,table,dialog,badge,toast,use-toast,...} + layout/{Sidebar,Topbar}
│   ├── hooks/useBusiness.ts, lib/api/client.ts, providers/*, types/index.ts, config/app.ts
│   ├── e2e/{critical-journey.spec.ts,orders.spec.ts,orders-ui.spec.ts,media.spec.ts} + playwright.config.ts
├── backend/
│   ├── src/app/app.ts + plugins/auth.ts + config/env.ts
│   ├── src/infrastructure/storage/{StorageAdapter.ts,LocalStorageAdapter.ts} (tenant-scoped, signed URLs, ₹0 dev)
│   ├── src/modules/{auth,businesses,catalog,importer,websites,enquiries,customers,memory,ai,qr,analytics,media,orders,payments}
│   ├── prisma/schema.prisma (Payment, MediaAsset) + seed.ts + migrations/20260827174042_add_payments
│   ├── tests/{api.test.ts,orders.test.ts,payments.test.ts,media.test.ts,helpers.ts} + vitest.config.ts + storage/business/{bid}/media/{mid}/*
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
1. **Switch to Postgres Production Readiness**: start Docker, `docker compose up -d`, update `DATABASE_URL`, change prisma provider to postgresql, re-migrate, test fileParallelism and storage path, verify production build (per increment spec)
2. **Real AI provider abstraction + Knowledge RAG** per `documentation/AI-BUSINESS-COPILOT.md` + `documentation/BUSINESS-KNOWLEDGE-BASE.md`
3. **Bookings/Appointments** per `documentation/BOOKINGS-AND-APPOINTMENTS.md` (similar vertical slice to Orders, after payments+media)
4. **Payment Provider Mock** (Razorpay/UPI) per `documentation/PAYMENTS-AND-TRANSACTIONS.md` — only after hardening verified; keep provider abstraction behind PaymentService

## Files Changed (v0.1 + E2E + Orders + Orders UI + Payments + Media)
- backend: app, 14 modules, prisma, seed, config, package.json (Fastify 5) + `vitest.config.ts`, `tests/helpers.ts`, `tests/api.test.ts` (7), `tests/orders.test.ts` (11), `tests/payments.test.ts` (12), `tests/media.test.ts` (13), `src/modules/orders/orders.routes.ts` (hardened), `src/modules/payments/payments.routes.ts` (180 lines), `src/infrastructure/storage/StorageAdapter.ts` + `LocalStorageAdapter.ts` (tenant-scoped HMAC signed URLs, ₹0), `src/modules/media/media.routes.ts` (hardened 180 lines, 5MB, MIME, path traversal, public/private, signed, delete), `prisma/schema.prisma` (+Payment, MediaAsset storageKey), `prisma/migrations/20260827174042_add_payments/migration.sql`, `src/app/app.ts` (+paymentsRoutes), `storage/` added to .gitignore
- frontend: app/*, components/ui/*, layout/*, hooks/useBusiness, lib/api, providers, types, tailwind, globals, b/[slug] public page, catalog/importer/website/inbox/copilot/activity/settings/customers/business + `app/(dashboard)/dashboard/orders/page.tsx` (6.84kB with payments), `e2e/media.spec.ts` (2 new), `types/index.ts` (+Payment), `config/app.ts` (+Orders), `components/layout/Sidebar.tsx`
- root: .gitignore (+storage, test-results), docker-compose.yml, README.md, MEMORY.md, `.ideavo/config`

## Verification (2026-08-27 18:55)
- `npm --prefix backend run lint` PASS (tsc)
- `npm --prefix frontend run type-check` PASS
- `npm --prefix backend run build` PASS
- `npm --prefix frontend run build` PASS (17 routes, orders 6.84kB)
- `npm --prefix backend run test` 43/43 PASS (7 api + 11 orders + 12 payments + 13 media)
- `bash -c 'cd frontend && npx playwright test'` 13/13 PASS (6 critical + 3 orders API + 2 orders UI + 2 media, prod 3000)
- Runtime: `curl /api/v1/health` 200, demo login 200, /b/royal-bakes 200 (product images via public), /dashboard/orders 200, upload 201 storageKey tenant-scoped, signed URL 200, invalid sig 401, cross-tenant 403, oversized 400, MIME 400, delete DB+storage verified, public private distinction verified
