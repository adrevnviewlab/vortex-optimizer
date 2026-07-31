# Wiring Audit Matrix

Generated: 2026-07-31T15:02:24.638Z

| Metric | Count |
|--------|-------|
| Live | 24 |
| Stub | 0 |
| Blocked | 4 |
| **Live %** | **86%** |

| Page / Component | API Endpoint | Readiness | Notes |
|------------------|--------------|-----------|-------|
| /welcome | — (static SSR) | **live** |  |
| /pricing | — (static + PartnerDisclaimer) | **live** |  |
| /login | Auth.js credentials + POST /api/auth/register | **live** |  |
| /dashboard KPI cards | GET /v1/orgs/:orgId/dashboard/summary | **live** |  |
| /dashboard recent audits | GET /v1/orgs/:orgId/audits?limit=&offset= | **live** |  |
| /clients list | GET /v1/orgs/:orgId/clients?limit=&offset= | **live** |  |
| /clients/[id] | GET /v1/orgs/:orgId/clients/:id | **live** |  |
| /audits list | GET /v1/orgs/:orgId/audits?limit=&offset= | **live** |  |
| /audits/[id] detail | GET /v1/orgs/:orgId/audits/:id | **live** |  |
| /audits/[id] analyze | POST /v1/orgs/:orgId/audits/:id/analyze | **live** |  |
| /audits/[id] import CSV | POST /v1/orgs/:orgId/audits/:id/import | **live** |  |
| /recommendations | GET /v1/orgs/:orgId/audits/:id/recommendations | **live** |  |
| /recommendations PATCH | PATCH /v1/orgs/:orgId/recommendations/:id | **live** |  |
| /reports | GET /v1/orgs/:orgId/reports | **live** |  |
| /reports generate | POST /v1/orgs/:orgId/audits/:id/reports | **live** |  |
| /settings/profile | GET /v1/me + GET /v1/orgs/:orgId | **live** |  |
| /settings PATCH | PATCH /v1/orgs/:orgId/settings | **live** |  |
| /admin/users | GET /v1/orgs/:orgId/members | **live** |  |
| /admin invite | POST /v1/orgs/:orgId/invites | **live** |  |
| /readiness checklist | GET /v1/orgs/:orgId/readiness | **live** |  |
| /renewals | GET /v1/orgs/:orgId/renewals | **live** |  |
| Session bridge (web) | POST /api/session-bridge → POST /v1/auth/session-bridge | **live** |  |
| Health | GET /health | **live** |  |
| Readiness | GET /ready | **live** |  |
| /settings/integrations | GET /v1/orgs/:orgId/integrations/microsoft | **blocked** | Graph OAuth — P2 gated (FEATURE_GRAPH_SYNC) |
| /pricing checkout | POST /v1/billing/checkout | **blocked** | STRIPE_CONNECTED gate |
| Graph sync | POST /v1/orgs/:orgId/integrations/microsoft/sync | **blocked** | Requires Graph connection |
| PDF download | GET /v1/orgs/:orgId/reports/:id/download | **blocked** | R2 + FEATURE_PDF_REPORTS |

## Gate status

- **P0:** ≥2 live wires — **PASS**
- **P1:** Core audit flows live — **PASS**
- **P2:** Graph + PDF + Stripe gated/blocked — **IN PROGRESS** (backend APIs live; integrations gated)