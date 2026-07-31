# Vortex Optimizer — Production Runbook

Operational guide for deploying and maintaining Vortex Optimizer in production.

## Architecture

| Component | Host | URL (prod) |
|-----------|------|------------|
| Web (Next.js 15) | Vercel | `https://app.vortexoptimizer.com` |
| API (Hono/Node 22) | Render | `https://api.vortexoptimizer.com` |
| Database | Neon PostgreSQL | Pooled connection string — see below |

### Neon connection pooling

Use the **pooled** connection string from Neon dashboard (hostname contains `-pooler`) for both Vercel and Render. Direct (non-pooled) URLs are for local dev and one-off CLI migrations only.

```text
# Pooled (production) — many short-lived serverless/worker connections
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# Direct (local dev / drizzle-kit only)
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Enable PITR on the production branch. Use Neon branches for preview/staging environments.

## Environment variables

### Vercel (`apps/web`)

| Variable | Required | Notes |
|----------|----------|-------|
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Production web URL |
| `AUTH_TRUST_HOST` | Yes | `true` on Vercel |
| `DATABASE_URL` | Yes | Neon pooled URL (Auth.js + register) |
| `NEXT_PUBLIC_API_URL` | Yes | Render API URL |
| `API_URL` | Yes | Same as public API URL (server components) |

### Render (`apps/api`)

| Variable | Required | Notes |
|----------|----------|-------|
| `PORT` | Auto | Set by Render |
| `NODE_ENV` | Yes | `production` |
| `APP_URL` | Yes | Vercel origin (CORS) |
| `DATABASE_URL` | Yes | Neon pooled URL |
| `API_JWT_SECRET` | Yes | Min 16 chars; rotate quarterly |
| `STRIPE_CONNECTED` | No | `false` until Stripe connected |
| `FEATURE_GRAPH_SYNC` | No | `false` until Graph registered |

See `.env.example` for the full list.

## Deploy procedure

### 1. Database migrations

Run before or during API deploy (Render pre-deploy command):

```bash
pnpm db:migrate
```

For preview environments, use a Neon branch connection string.

### 2. Seed demo data (non-prod only)

```bash
SEED_DEMO_DATA=true pnpm db:seed
```

Do **not** run seed on production unless intentionally resetting a demo tenant.

### 3. Deploy API (Render)

- **Build:** `pnpm install && pnpm turbo build --filter=@vorzop/api`
- **Start:** `node apps/api/dist/index.js`
- **Pre-deploy:** `pnpm db:migrate`
- **Health check:** `/health` (200)
- **Readiness check:** `/ready` (200 when DB connected)

### 4. Deploy web (Vercel)

- **Root directory:** `apps/web`
- **Install:** from monorepo root (`cd ../.. && pnpm install`)
- **Build:** `pnpm turbo build --filter=@vorzop/web`

## Health monitoring

### Endpoints

| Endpoint | Purpose | Expected |
|----------|---------|----------|
| `GET /health` | Liveness | `{ data: { status: "ok" } }` |
| `GET /ready` | Readiness + integrations | `{ data: { status: "ready", readiness, integrations } }` |

Configure uptime monitors (Better Stack, UptimeRobot, etc.) to poll:

- `https://api.vortexoptimizer.com/health` every 60s
- `https://api.vortexoptimizer.com/ready` every 5m (alert on `degraded`)

### Vercel

Use Vercel deployment checks + `/welcome` synthetic check.

## Rollback

### API (Render)

1. Open Render dashboard → service → **Deploys**
2. Select last known-good deploy → **Rollback**
3. Verify `/health` and `/ready`

If a bad migration shipped:

1. Roll back deploy first (previous code may expect previous schema)
2. Restore Neon from PITR if schema/data is corrupted
3. Re-run migrations on fixed branch

### Web (Vercel)

1. Vercel → Project → Deployments → promote previous production deployment
2. Confirm Auth.js `AUTH_URL` matches promoted URL

### Database (Neon)

- Enable PITR on production branch
- Restore to timestamp before incident; update `DATABASE_URL` if branch restored

## Secret rotation

1. Generate new `API_JWT_SECRET` and `AUTH_SECRET`
2. Update Render + Vercel env vars
3. Redeploy API then web (order matters for JWT bridge)
4. All users must re-login (sessions invalidated)

## Auth flow (production)

1. User signs in via Auth.js credentials at `/login`
2. Web creates DB session row; Auth.js JWT stores `userId`, `activeOrgId`, `role`
3. Browser API client calls `POST /api/session-bridge` (Next.js route)
4. Next.js reads Auth.js session → calls `POST /v1/auth/session-bridge` on API
5. API returns 15-minute JWT; client attaches `Authorization: Bearer` + `X-Org-Id`

Demo credentials (seeded non-prod):

- Email: `admin@vortexoptimizer.com`
- Password: `demo-password`

## Security

- API sets security headers (`X-Content-Type-Options`, `X-Frame-Options`, HSTS in prod)
- Auth routes rate-limited: 20 req/min/IP on `/v1/auth/*`
- CORS restricted to `APP_URL`
- CSRF on API mutations (Origin/Referer vs `APP_URL`) and web `/api/*` routes
- No secrets in git — `.env.example` only; CI secrets grep

## Troubleshooting

| Symptom | Check |
|---------|-------|
| 401 on API calls | Session bridge; re-login; `API_JWT_SECRET` match |
| CORS errors | `APP_URL` on API matches Vercel URL exactly |
| Empty dashboard | `pnpm db:seed`; `DATABASE_URL` on web + API |
| `/ready` degraded | Neon connectivity; `DATABASE_URL` pooled string |
| E2E fails in CI | Postgres service + migrate + seed before tests |

## CI reference

See `.github/workflows/ci.yml` — typecheck, unit tests, wiring audit, E2E smoke on `main`.
