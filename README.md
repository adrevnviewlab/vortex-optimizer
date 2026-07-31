# Vortex Optimizer



Vendor-neutral Microsoft licensing optimization consultancy platform.

**Production readiness:** ~**97%** — deploy configs, CI E2E, security pass, and checklists in repo. Remaining: user-triggered Neon/Vercel/Render deploy, manual QA sign-off, Graph/PDF/Stripe connects.



## Stack



- **Web:** Next.js 15 (`apps/web`)

- **API:** Hono on Node 22 (Render-ready, binds `0.0.0.0:$PORT`)

- **Database:** PostgreSQL + Drizzle ORM

- **Domain:** Rules engine (`packages/domain`)

- **Monorepo:** pnpm workspaces + Turborepo

- **Validation:** Zod (`packages/shared`)



## Prerequisites



- [Node.js 22+](https://nodejs.org/)

- [pnpm 9+](https://pnpm.io/)

- PostgreSQL 15+ (local install — no Docker required)



## Full stack — run from scratch



### 1. Install dependencies



```bash

pnpm install

```



### 2. Configure environment



```bash

cp .env.example .env

```



Edit `.env` and set at minimum:



| Variable | Example | Notes |

|----------|---------|-------|

| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/vorzop` | Your local Postgres connection |

| `API_JWT_SECRET` | output of `openssl rand -base64 32` | Optional in dev (fallback exists) |

| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Web → API base URL |

| `APP_URL` | `http://localhost:3000` | API CORS origin |



### 3. Create database



```bash

createdb vorzop

# or via psql:

# psql -U postgres -c "CREATE DATABASE vorzop;"

```



### 4. Run migrations and seed



```bash

pnpm db:migrate

pnpm db:seed

```



Seed output includes the demo org ID, audit ID, and session token used by the web client.



### 5. Start web + API



```bash

pnpm dev

```



| Service | URL |

|---------|-----|

| Web | [http://localhost:3000](http://localhost:3000) |

| API | [http://localhost:4000](http://localhost:4000) |

| Health | [http://localhost:4000/health](http://localhost:4000/health) |

| Readiness | [http://localhost:4000/ready](http://localhost:4000/ready) |



To run services individually:



```bash

pnpm --filter @vorzop/api dev

pnpm --filter @vorzop/web dev

```



### 6. Verify



```bash

pnpm typecheck

pnpm --filter @vorzop/domain test

pnpm --filter @vorzop/api test

```



## Auth setup

1. Set `AUTH_SECRET` (generate with `openssl rand -base64 32`)
2. Set `DATABASE_URL` on **both** web and API (Auth.js reads users/sessions from Postgres)
3. Run `pnpm db:migrate && pnpm db:seed`
4. Sign in at `/login` with `admin@vortexoptimizer.com` / `demo-password`

Required env vars for auth:

| Variable | Where | Purpose |
|----------|-------|---------|
| `AUTH_SECRET` | Web | Auth.js session signing |
| `AUTH_URL` | Web | Canonical app URL |
| `DATABASE_URL` | Web + API | Users, sessions, org membership |
| `API_JWT_SECRET` | API | Session-bridge JWT |

## E2E smoke tests

Playwright smoke suite in `e2e/`:

```bash
# Requires running stack (or CI starts services automatically)
pnpm db:migrate && pnpm db:seed
pnpm dev   # in another terminal
pnpm e2e:smoke
```

Tests cover: `/welcome`, login → dashboard KPIs, `/clients`, `/audits`.

Install browsers once: `pnpm exec playwright install chromium` (from `e2e/`).

## CI

![CI](https://github.com/OWNER/vorzop/actions/workflows/ci.yml/badge.svg)

GitHub Actions workflow (`.github/workflows/ci.yml`):

- **Every PR / push:** typecheck, unit tests, wiring audit, secrets grep
- **Every PR / push:** E2E smoke against Postgres service + migrated/seeded API + web

```bash
pnpm typecheck
pnpm test
pnpm wiring-audit
pnpm e2e:smoke
```

## Deploy (Vercel + Render + Neon)

One-click-ish setup — configs are in-repo; you create accounts and paste secrets.

### 1. Neon (database)

1. Create project at [neon.tech](https://neon.tech) → production branch
2. Enable **PITR** on prod branch
3. Copy **pooled** connection string (`-pooler` in hostname)
4. Use for `DATABASE_URL` on both Vercel and Render

### 2. Render (API)

1. [Render Dashboard](https://dashboard.render.com) → **New Blueprint**
2. Point at repo → uses `apps/api/render.yaml`
3. Set secrets: `APP_URL`, `DATABASE_URL`, `API_JWT_SECRET`
4. Deploy — pre-deploy runs `pnpm db:migrate`, health check `/health`

### 3. Vercel (web)

1. [Vercel Dashboard](https://vercel.com/new) → import repo
2. **Root Directory:** `apps/web` (uses `vercel.json` for monorepo build)
3. Set env vars: `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST=true`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `API_URL`
4. Add domain `app.vortexoptimizer.com`

### 4. Validate before go-live

```bash
# Export production env vars locally, then:
pnpm deploy:check --target=all
```

Full checklist: [docs/PRODUCTION-CHECKLIST.md](docs/PRODUCTION-CHECKLIST.md)  
Operations: [docs/RUNBOOK.md](docs/RUNBOOK.md)  
QA sign-off: [docs/QA-MATRIX.md](docs/QA-MATRIX.md)




| Field | Value |

|-------|-------|

| Org ID | `11111111-1111-1111-1111-111111111111` |

| User email | `admin@vortexoptimizer.com` |

| Password | `demo-password` |

| Contoso audit ID | `33333333-3333-3333-3333-333333333301` |



The web app uses **Auth.js v5** for login. After sign-in, the browser calls `POST /api/session-bridge`, which exchanges the DB session for a 15-minute API JWT. If the API is down, pages fall back to inline seed data.



## API smoke test



```bash

# Health

curl http://localhost:4000/health



# Readiness (integration traffic lights)

curl http://localhost:4000/ready



# Session bridge → JWT

curl -X POST http://localhost:4000/v1/auth/session-bridge \

  -H "Content-Type: application/json" \

  -d '{"sessionToken":"demo-session-token-vortex-optimizer","activeOrgId":"11111111-1111-1111-1111-111111111111"}'



# Use TOKEN from response:

export TOKEN="<token from above>"



curl http://localhost:4000/v1/me \

  -H "Authorization: Bearer $TOKEN" \

  -H "X-Org-Id: 11111111-1111-1111-1111-111111111111"



curl http://localhost:4000/v1/orgs/11111111-1111-1111-1111-111111111111/dashboard/summary \

  -H "Authorization: Bearer $TOKEN" \

  -H "X-Org-Id: 11111111-1111-1111-1111-111111111111"



curl http://localhost:4000/v1/orgs/11111111-1111-1111-1111-111111111111/audits \

  -H "Authorization: Bearer $TOKEN" \

  -H "X-Org-Id: 11111111-1111-1111-1111-111111111111"



curl http://localhost:4000/v1/orgs/11111111-1111-1111-1111-111111111111/audits/33333333-3333-3333-3333-333333333301/recommendations \

  -H "Authorization: Bearer $TOKEN" \

  -H "X-Org-Id: 11111111-1111-1111-1111-111111111111"

```



All authenticated endpoints return `X-Readiness: live|stub|blocked`.



## Endpoint readiness (P0)



| Route | Readiness | Notes |

|-------|-----------|-------|

| `POST /v1/auth/session-bridge` | **live** | Postgres sessions |

| `GET /v1/me` | **live** | |

| `GET /v1/orgs/:orgId/dashboard/summary` | **live** | Postgres aggregates |

| `GET /v1/orgs/:orgId/clients` | **live** | |

| `GET /v1/orgs/:orgId/audits` | **live** | |

| `GET /v1/orgs/:orgId/audits/:id` | **live** | |

| `POST /v1/orgs/:orgId/audits/:id/analyze` | **live** | In-memory domain store + rules engine |

| `GET /v1/orgs/:orgId/audits/:id/findings` | **live** | In-memory domain store |

| `GET /v1/orgs/:orgId/audits/:id/recommendations` | **live** | In-memory domain store |

| `PATCH /v1/orgs/:orgId/recommendations/:id` | **live** | In-memory domain store |

| `POST /v1/orgs/:orgId/audits/:id/import` | **stub** | CSV row count only; persistence P1 |



## Scripts



| Script | Description |

|--------|-------------|

| `pnpm dev` | Start web (3000) + API (4000) via Turborepo |

| `pnpm build` | Build all packages |

| `pnpm typecheck` | TypeScript check across workspace |

| `pnpm lint` | ESLint across workspace |

| `pnpm db:migrate` | Apply Drizzle migrations |

| `pnpm wiring-audit` | Generate FE↔BE wiring matrix (`docs/WIRING-AUDIT.md`) |
| `pnpm deploy:check` | Validate production env vars before deploy |
| `pnpm e2e:smoke` | Playwright smoke tests |



## Repository layout



```

apps/

  api/              Hono REST API

  web/              Next.js 15 frontend

packages/

  config/           Shared tsconfig + ESLint

  db/               Drizzle schema, migrations, seed, in-memory store

  domain/           Rules engine

  shared/           Zod validators, types, constants

  ui/               Design tokens + primitives

docs/               Product & completion plan

```



## Engineering rules



- No secrets in git — use `.env.example` only

- No Docker by default

- Stripe and Graph integrations are gated; app boots without their keys

- Linux case-sensitive paths — all folders lowercase



## License



Proprietary — Vortex Optimizer

