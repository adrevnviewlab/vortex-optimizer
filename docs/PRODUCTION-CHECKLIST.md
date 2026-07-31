# Production Checklist — Vortex Optimizer

> **Target:** first production deploy (Vercel + Render + Neon)  
> **Repo readiness:** ~97% — configs and gates in repo; deploy is user-triggered.

Use this checklist before promoting to production. Run `pnpm deploy:check` after setting env vars locally or in CI secrets export.

---

## 1. Neon PostgreSQL

| Step | Action | Owner |
|------|--------|-------|
| ☐ | Create Neon project + **production** branch | User |
| ☐ | Enable **PITR** (point-in-time recovery) on prod branch | User |
| ☐ | Copy **pooled** connection string (see pooling below) | User |
| ☐ | Run `pnpm db:migrate` against prod (Render pre-deploy does this) | Automated |
| ☐ | **Do not** run `pnpm db:seed` on prod unless resetting demo tenant | User |

### DATABASE_URL pooling (Neon)

Neon offers two connection modes:

| Mode | Host suffix | Use for |
|------|-------------|---------|
| **Pooled** | `-pooler` in hostname (e.g. `ep-xxx-pooler.us-east-2.aws.neon.tech`) | **Vercel serverless** + **Render API** (many short-lived connections) |
| **Direct** | no `-pooler` | Local dev, one-off migrations, `drizzle-kit` CLI |

**Production rule:** set `DATABASE_URL` on **both** Vercel and Render to the **pooled** string from Neon dashboard → Connection Details → **Pooled connection**.

Append `?sslmode=require` if not present. Example shape:

```text
postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

For preview/staging, create a Neon **branch** per environment and use that branch's pooled URL.

---

## 2. Render (API)

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Set by Render (typically `10000`) |
| `APP_URL` | Yes | `https://app.vortexoptimizer.com` (Vercel origin — **CORS**) |
| `DATABASE_URL` | Yes | Neon **pooled** URL |
| `API_JWT_SECRET` | Yes | `openssl rand -base64 32` (min 16 chars) |
| `STRIPE_CONNECTED` | No | `false` until Stripe connected |
| `FEATURE_GRAPH_SYNC` | No | `false` until Graph registered |
| `FEATURE_STRIPE` | No | `false` |
| `FEATURE_PDF_REPORTS` | No | `false` |

| Step | Action |
|------|--------|
| ☐ | Connect GitHub repo → New **Blueprint** → `apps/api/render.yaml` |
| ☐ | Set secret env vars in Render dashboard |
| ☐ | Confirm health check: `GET /health` → 200 |
| ☐ | Confirm readiness: `GET /ready` → `{ status: "ready" }` |
| ☐ | Verify pre-deploy runs `pnpm db:migrate` |

---

## 3. Vercel (Web)

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | `https://app.vortexoptimizer.com` — **must match deployed URL** |
| `AUTH_TRUST_HOST` | Yes | `true` |
| `DATABASE_URL` | Yes | Neon **pooled** URL (Auth.js + register) |
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.vortexoptimizer.com` |
| `API_URL` | Yes | Same as public API URL (server components / session bridge) |

| Step | Action |
|------|--------|
| ☐ | Import repo → set **Root Directory** to `apps/web` |
| ☐ | `vercel.json` configures monorepo install/build from root |
| ☐ | Add custom domain `app.vortexoptimizer.com` |
| ☐ | Set all env vars for Production (+ Preview if using Neon branches) |
| ☐ | Deploy and open `/welcome` — synthetic uptime check |

---

## 4. CORS & AUTH_URL alignment

Misaligned URLs are the #1 production auth failure mode.

| Check | Expected |
|-------|----------|
| Render `APP_URL` | Exact Vercel production origin (scheme + host, no trailing slash) |
| Vercel `AUTH_URL` | Same as Vercel production URL |
| Vercel `NEXT_PUBLIC_API_URL` / `API_URL` | Render API URL |
| Browser login → dashboard | No CORS console errors |
| Session bridge | `POST /api/session-bridge` → 200, API calls include Bearer JWT |

---

## 5. Secrets rotation (quarterly or on incident)

1. Generate new `API_JWT_SECRET` and `AUTH_SECRET`
2. Update Render env → redeploy API
3. Update Vercel env → redeploy web
4. All users must re-login (sessions invalidated)
5. Rotate Neon credentials if DB URL was exposed

Never commit secrets. Repo contains `.env.example` only — verified by CI grep.

---

## 6. Security gates (repo — automated)

| Control | Status |
|---------|--------|
| API auth rate limit (`/v1/auth/*`, 20/min/IP) | ✅ |
| CSRF on API mutations (Origin/Referer vs `APP_URL`) | ✅ |
| CSRF on web mutations (`/api/session-bridge`, `/api/auth/register`) | ✅ |
| Security headers (HSTS prod, X-Frame-Options, nosniff) | ✅ |
| CORS restricted to `APP_URL` | ✅ |
| No secrets in git | ✅ (grep clean) |

---

## 7. Monitoring (post-deploy — user)

| Monitor | URL | Interval |
|---------|-----|----------|
| API liveness | `https://api.vortexoptimizer.com/health` | 60s |
| API readiness | `https://api.vortexoptimizer.com/ready` | 5m |
| Web synthetic | `https://app.vortexoptimizer.com/welcome` | 5m |
| Error tracking | Sentry (optional) | — |

---

## 8. Pre-flight commands

```bash
# Local quality gates (must pass before deploy PR merges)
pnpm typecheck
pnpm test
pnpm wiring-audit

# After setting production env vars (export or .env.production.local)
pnpm deploy:check --target=all
```

---

## 9. Rollback

See [RUNBOOK.md](./RUNBOOK.md) — Render deploy rollback, Vercel promotion, Neon PITR restore.

---

## 10. Out of scope for first deploy (P2 gated)

These remain **blocked** until credentials are connected — app boots without them:

- Microsoft Graph OAuth + sync (`FEATURE_GRAPH_SYNC=true`)
- Stripe checkout + webhooks (`STRIPE_CONNECTED=true`)
- PDF pipeline + R2 download (`FEATURE_PDF_REPORTS=true`)

Readiness badges on API responses document honest `live` / `stub` / `blocked` state.
