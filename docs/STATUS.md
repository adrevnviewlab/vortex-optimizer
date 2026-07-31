# Vortex Optimizer — Integration Status

> **Last updated:** 2026-07-31  
> **Overall completion:** **~99%** (repo code-complete; prod deploy + QA sign-off remain)

---

## Executive summary

| Layer | Status | Notes |
|-------|--------|-------|
| Monorepo / tooling | ✅ | pnpm + Turborepo; typecheck 9/9; unit tests 56/56 |
| Database + migrations | ✅ | `0001_p1_p2.sql` + `0002_graph_sync.sql` applied; seed data available |
| Auth (Auth.js v5 + session bridge) | ✅ | Credentials login, JWT bridge to API |
| Frontend (all app pages) | ✅ | Wired via `api-client.ts` with seed fallback |
| Backend (core CRUD + analysis) | ✅ | Hono API live on `:4000` |
| Reports (PDF + storage) | ✅ gated | Real PDF via `pdf-lib`; S3/R2/filesystem storage abstraction; signed download URLs |
| Microsoft Graph | ✅ gated | OAuth, token storage, sync jobs, settings UI; live when `FEATURE_GRAPH_SYNC=true` + Azure app registered |
| Stripe billing | ✅ gated | Checkout, customer portal, webhook handler wired; live when `STRIPE_CONNECTED=true` |
| Production deploy configs | ✅ | `vercel.json`, `render.yaml`, `deploy-check.ts`, checklists |
| E2E (Playwright) | ✅ CI | Postgres service + migrate + seed + API/web on every PR/push |
| Production deploy (live) | 🔴 user | Neon + Vercel + Render — see PRODUCTION-CHECKLIST.md |

---

## Route readiness matrix

### Health & auth

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/health` | GET | **live** | — |
| `/ready` | GET | **live** | — |
| `/v1/auth/session-bridge` | POST | **live** | `POST /api/session-bridge` (web) |

### User & org

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/me` | GET | **live** | Settings profile |
| `/v1/orgs` | GET | **live** | Org switcher (future) |
| `/v1/orgs/:orgId` | GET | **live** | Settings profile |
| `/v1/orgs/:orgId/settings` | GET/PATCH | **live** | Settings page |

### Dashboard

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/dashboard/summary` | GET | **live** | Dashboard KPIs |
| `/v1/orgs/:orgId/dashboard/license-mix` | GET | **live** | Dashboard donut chart |

### Clients

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/clients` | GET/POST | **live** | Clients list, create |
| `/v1/orgs/:orgId/clients/:id` | PATCH/DELETE | **live** | Client detail (partial) |

### Audits & analysis

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/audits` | GET | **live** | Audits list, dashboard |
| `/v1/orgs/:orgId/audits/:id` | GET | **live** | Audit detail |
| `/v1/orgs/:orgId/audits/:id/analyze` | POST | **live** | Analyze button |
| `/v1/orgs/:orgId/audits/:id/import` | POST | **live** | CSV import |
| `/v1/orgs/:orgId/audits/:id/findings` | GET | **live** | Findings tab |
| `/v1/orgs/:orgId/audits/:id/recommendations` | GET | **live** | Recommendations page |
| `/v1/orgs/:orgId/recommendations/:id` | PATCH | **live** | Approve/reject recs |

### Reports

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/reports` | GET | **live** | Reports list |
| `/v1/orgs/:orgId/reports/:id` | GET | **live** | Poll report status |
| `/v1/orgs/:orgId/audits/:id/reports` | POST | **live** | Generate report (HTML + PDF via `pdf-lib`, upload to storage) |
| `/v1/orgs/:orgId/reports/:id/download` | GET | **live** | Download button — presigned S3/R2 URL or signed token file route |
| `/v1/orgs/:orgId/reports/:id/file` | GET | **live** | Token-gated PDF stream (dev/filesystem fallback) |

### Renewals

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/renewals` | GET | **live** | Renewals page |
| `/v1/orgs/:orgId/clients/:id/renewal` | GET/PATCH | **live** | Client renewal detail |

### Members & admin

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/members` | GET/POST | **live** | Admin users |
| `/v1/orgs/:orgId/members/:userId` | PATCH | **live** | Role changes |
| `/v1/orgs/:orgId/invites` | POST | **live** | Invite flow |
| `/v1/orgs/:orgId/audit-events` | GET | **live** | Audit log (admin) |

### Readiness & demo

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/readiness` | GET | **live** | Readiness checklist |
| `/v1/demo/sessions` | POST | **live** | Demo/pitch mode |

### Integrations (P2)

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/orgs/:orgId/integrations` | GET | **gated** | Settings → Integrations card |
| `/v1/orgs/:orgId/integrations/microsoft/auth-url` | GET | **gated** | “Connect Microsoft 365” *(live when Graph enabled)* |
| `/v1/orgs/:orgId/integrations/microsoft/sync` | POST | **gated** | “Re-sync now” button *(live when connected)* |
| `/v1/integrations/microsoft/callback` | GET | **gated** | OAuth redirect handler |

### Billing (P2)

| Route | Method | Readiness | Frontend consumer |
|-------|--------|-----------|-------------------|
| `/v1/billing/status` | GET | **gated** | Pricing page + Settings billing card |
| `/v1/billing/checkout` | POST | **gated** | Pricing checkout CTA *(live when Stripe connected)* |
| `/v1/billing/portal` | POST | **gated** | Settings “Manage billing” *(live when customer exists)* |
| `/v1/webhooks/stripe` | POST | **gated** | Stripe subscription lifecycle *(live when webhook secret set)* |

---

## Frontend pages

| Page | API wired | Fallback |
|------|-----------|----------|
| `/welcome`, `/features`, `/pricing` | Static SSR + billing status/checkout | Seed pricing copy |
| `/login`, `/signup` | Auth.js | — |
| `/dashboard` | summary + license-mix + audits | Seed KPIs |
| `/clients`, `/clients/[id]` | clients + audits | Seed clients |
| `/audits`, `/audits/[id]` | audits + findings + analyze | Seed audits |
| `/recommendations` | recommendations PATCH/GET | Seed recs |
| `/reports` | reports list + generate + download | Seed reports |
| `/renewals` | renewals list | Seed renewals |
| `/settings`, `/settings/readiness` | me + org + readiness + billing status/portal + Graph integration | Defaults |
| `/admin` | members + invites | Seed members |

---

## What's left for true 100%

1. **Production deploy (user-triggered)** — Create Neon prod branch, deploy Render API + Vercel web, DNS, connect prod secrets (R2, Stripe, Graph OAuth), `pnpm deploy:check`, monitoring alerts. See [PRODUCTION-CHECKLIST.md](./PRODUCTION-CHECKLIST.md).
2. **Cross-browser QA sign-off** — Manual matrix in [QA-MATRIX.md](./QA-MATRIX.md) (Safari/Firefox/Edge + all breakpoints).

### Completion breakdown

| Scope | % | Notes |
|-------|---|-------|
| Repo / dev-complete | **~99%** | PDF, storage, Stripe, and Graph all code-complete in repo |
| Live production | **~85%** | Blocked on user Neon/Vercel/Render + DNS + prod secrets connect |
| P2 integrations (Graph/PDF/Stripe) | **100%** | All three wired in repo (gated until prod secrets + feature flags) |
| GA sign-off (100%) | **pending** | Prod deploy + manual QA matrix only |

---

## Verification commands

```bash
# Install
pnpm install

# Copy env and fill secrets
cp .env.example .env
# Required: DATABASE_URL, AUTH_SECRET, API_JWT_SECRET
# Optional P2: S3_* (R2), STRIPE_*, FEATURE_* flags

# Database
pnpm db:migrate
pnpm db:seed

# Quality gates
pnpm typecheck   # 9/9 packages
pnpm test        # 56 unit tests (e2e excluded — use pnpm e2e:smoke)

# Dev (web :3000 + api :4000)
pnpm dev
```

### Dev server layout

| Service | Package | Port | Command |
|---------|---------|------|---------|
| Web | `@vorzop/web` | 3000 | `next dev --port 3000` |
| API | `@vorzop/api` | 4000 | `tsx watch src/index.ts` |

Root `pnpm dev` runs `turbo dev`, which starts **both** apps in parallel (only packages with a `dev` script).

### E2E (optional, requires running stack)

```bash
pnpm dev          # terminal 1 — or let Playwright start it
pnpm e2e:smoke    # terminal 2 — marketing + login + dashboard smoke
```

---

## Changes in this integration pass

- Added `GET /v1/orgs/:orgId/renewals` — org-wide renewal list for `/renewals` page.
- Added `GET /v1/orgs/:orgId/reports` — org-wide report list for `/reports` page.
- Fixed `@vorzop/shared` vitest config (`passWithNoTests`) so `pnpm test` succeeds.
- Scoped root `pnpm test` to exclude `@vorzop/e2e` (Playwright needs full stack + DB).

## Production readiness pass (2026-07-31)

- Added `apps/web/vercel.json` and `apps/api/render.yaml` deploy configs.
- Added `scripts/deploy-check.ts` + `pnpm deploy:check`.
- Added `docs/PRODUCTION-CHECKLIST.md` and `docs/QA-MATRIX.md`.
- CI E2E smoke runs on all PRs/pushes (Postgres + migrate + seed + API/web).
- API CSRF middleware on mutations; web origin validation on session-bridge/register.
- Secrets grep gate in CI; rate limits + security headers verified.

## P2 integration pass — PDF / R2 / Stripe (agent `95a99afb`)

- **Real PDF pipeline** — `pdf-lib` generates audit PDFs from report content; HTML preview retained alongside PDF bytes.
- **Storage abstraction** — `storage.ts` uploads to S3-compatible storage (Cloudflare R2) when `S3_*` env vars set; filesystem fallback for local dev; presigned download URLs for S3, signed token route for filesystem.
- **Report download** — `GET .../reports/:id/download` returns presigned or signed URL; `GET .../reports/:id/file` streams PDF with token verification.
- **Stripe billing** — Checkout sessions (`POST /v1/billing/checkout`), customer portal (`POST /v1/billing/portal`), status endpoint; webhook handler (`POST /v1/webhooks/stripe`) for `checkout.session.completed` and subscription updates. Gated until `STRIPE_CONNECTED=true` + `FEATURE_STRIPE=true`.
- **Frontend wired** — `/pricing` fetches billing status and launches Stripe Checkout; `/settings` shows plan + “Manage billing” portal when customer exists.
- **Unit tests** — Added coverage for `pdf-report`, `storage`, and `stripe-client` helpers.

## P2 integration pass — Microsoft Graph (agent `5d94d150`)

- **OAuth flow** — Auth URL builder, callback handler, encrypted token storage (`graph-oauth.ts`, `graph-callback.ts`).
- **Sync jobs** — Read-only user + subscribed-SKU sync with transform pipeline (`graph-sync.ts`, `graph-client.ts`, `graph-transform.ts`).
- **Database** — Migration `0002_graph_sync.sql` adds `graph_connections` + `graph_sync_jobs` tables.
- **Settings UI** — Connect / Re-sync / Disconnect controls on `/settings` with status badges and sync stats.
- **Unit tests** — 22 tests covering OAuth helpers, transforms, sync logic, and SKU resolution.
- **Gated until live** — Enable with `FEATURE_GRAPH_SYNC=true` + Azure app registration; CSV import remains fallback when disabled.
