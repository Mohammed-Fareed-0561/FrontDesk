# FrontDesk — Business-to-Digital Platform

**Version:** v0.1 (MVP)  
**Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui + Fastify + Prisma + SQLite(dev)/PostgreSQL(prod)  
**Architecture:** Modular Monolith + Separate Frontend (see `documentation/SYSTEM-ARCHITECTURE.md`)

> Import your business → Make it digital → Connect with customers.

## What it does (v0.1)
- Create workspace + business
- Import from website / PDF / CSV / images (structured + review flow)
- Manage catalog/products, website builder, preview + publish + versioning
- Public business site (mobile-first) + QR + WhatsApp enquiry
- Inbox, basic activity, business memory/knowledge, AI copilot stubs with Action Registry guardrails

## Quick start (zero-cost local dev)

**Prereqs:** Node 18+, npm, Git. Optional: Docker Desktop for Postgres.

```bash
# 1. Clone
git clone <repo> && cd FrontDesk

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed   # Royal Bakes demo data
npm run dev    # http://localhost:4000  (health: /api/v1/health)

# 3. Frontend (new terminal)
cd ../frontend
cp .env.example .env.local
npm install
npm run dev    # http://localhost:3000
```

**With Postgres (when Docker available):**
```bash
docker compose up -d          # starts postgres:5432
# then set DATABASE_URL=postgresql://frontdesk:frontdesk@localhost:5432/frontdesk?schema=public
# and change prisma provider to postgresql, re-migrate
```

## Project structure
```
FrontDesk/
├── frontend/        # Next.js App Router
├── backend/         # Fastify + modules/* + prisma
├── documentation/   # 59 spec docs (PRD, architecture, etc.)
└── docker-compose.yml
```

## Docs
- `documentation/PRD.md` — product requirements
- `documentation/SYSTEM-ARCHITECTURE.md` — full architecture
- `documentation/TECH-STACK.md` — approved stack
- `documentation/DATABASE-SCHEMA.md` — schema
- `documentation/API.md` — API contract (/api/v1)
- `MEMORY.md` — dev handoff

## Scripts
- `backend: npm run dev | build | test | lint`
- `frontend: npm run dev | build | lint | test`

## Security
- JWT auth, tenant isolation per business/workspace, Zod validation, rate limiting, no secrets in repo (.env.example only).
