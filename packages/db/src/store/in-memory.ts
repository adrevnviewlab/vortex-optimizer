import type { Audit, Finding, Recommendation } from "@vorzop/shared";
import { createSeedData } from "../seed/data.js";
import type { DomainStore, Organization, SeedData } from "../types.js";
import { SEED_IDS } from "../types.js";

export function createInMemoryStore(initial?: SeedData): DomainStore {
  const seed = initial ?? createSeedData();

  let organization = seed.organization;
  const clients = [...seed.clients];
  const audits = new Map(seed.audits.map((a) => [a.id, { ...a }]));
  const licenseRecords = new Map<string, typeof seed.licenseRecords>();
  const usageRecords = new Map<string, typeof seed.usageRecords>();
  const findings = new Map<string, Finding[]>();
  const recommendations = new Map<string, Recommendation[]>();

  const contosoAuditId = SEED_IDS.contosoAudit;

  licenseRecords.set(contosoAuditId, [...seed.licenseRecords]);
  usageRecords.set(contosoAuditId, [...seed.usageRecords]);
  findings.set(contosoAuditId, [...seed.findings]);
  recommendations.set(contosoAuditId, [...seed.recommendations]);

  return {
    getOrg(orgId: string): Organization | undefined {
      return organization.id === orgId ? organization : undefined;
    },

    getClients(orgId: string) {
      return clients.filter((c) => c.consultancy_id === orgId);
    },

    getAudit(orgId: string, auditId: string): Audit | undefined {
      const audit = audits.get(auditId);
      if (!audit || audit.org_id !== orgId) return undefined;
      return { ...audit };
    },

    getAudits(orgId: string) {
      return [...audits.values()].filter((a) => a.org_id === orgId);
    },

    getLicenseRecords(auditId: string) {
      return [...(licenseRecords.get(auditId) ?? [])];
    },

    getUsageRecords(auditId: string) {
      return [...(usageRecords.get(auditId) ?? [])];
    },

    getFindings(_orgId: string, auditId: string) {
      return [...(findings.get(auditId) ?? [])];
    },

    getRecommendations(orgId: string, auditId?: string) {
      if (auditId) {
        return (recommendations.get(auditId) ?? []).filter((r) => r.org_id === orgId);
      }
      return [...recommendations.values()]
        .flat()
        .filter((r) => r.org_id === orgId);
    },

    getRecommendation(orgId: string, recId: string) {
      for (const recs of recommendations.values()) {
        const found = recs.find((r) => r.id === recId && r.org_id === orgId);
        if (found) return { ...found };
      }
      return undefined;
    },

    updateAudit(audit: Audit) {
      audits.set(audit.id, { ...audit, updated_at: new Date().toISOString() });
    },

    setFindings(auditId: string, items: Finding[]) {
      findings.set(auditId, items);
    },

    setRecommendations(auditId: string, recs: Recommendation[]) {
      recommendations.set(auditId, recs);
    },

    updateRecommendation(rec: Recommendation) {
      const recs = recommendations.get(rec.audit_id);
      if (!recs) return;
      const idx = recs.findIndex((r) => r.id === rec.id);
      if (idx >= 0) {
        recs[idx] = { ...rec, updated_at: new Date().toISOString() };
      }
    },

    getDashboard(orgId: string) {
      if (orgId !== organization.id) {
        return {
          active_clients: 0,
          active_audits: 0,
          total_identified_savings_usd: 0,
          critical_findings: 0,
          total_annual_spend_usd: 0,
        };
      }
      return { ...seed.dashboard };
    },
  };
}

export { createSeedData } from "../seed/data.js";
export { SEED_IDS } from "../types.js";
