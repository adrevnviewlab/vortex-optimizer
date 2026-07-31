import type {
  Audit,
  Client,
  Finding,
  LicenseRecord,
  Recommendation,
  UsageRecord,
} from "@vorzop/shared";

/** Stable seed UUIDs for deterministic demo data */
export const SEED_IDS = {
  consultancyOrg: "11111111-1111-1111-1111-111111111111",
  contosoClient: "22222222-2222-2222-2222-222222222201",
  fabrikamClient: "22222222-2222-2222-2222-222222222202",
  contosoAudit: "33333333-3333-3333-3333-333333333301",
  fabrikamAudit: "33333333-3333-3333-3333-333333333302",
} as const;

export interface Organization {
  id: string;
  type: "consultancy";
  name: string;
  default_currency: string;
  default_locale: string;
  settings: Record<string, unknown>;
}

export interface DashboardSummary {
  active_clients: number;
  active_audits: number;
  total_identified_savings_usd: number;
  critical_findings: number;
  total_annual_spend_usd: number;
}

export interface SeedData {
  organization: Organization;
  clients: Client[];
  audits: Audit[];
  licenseRecords: LicenseRecord[];
  usageRecords: UsageRecord[];
  findings: Finding[];
  recommendations: Recommendation[];
  dashboard: DashboardSummary;
}

export interface DomainStore {
  getOrg(orgId: string): Organization | undefined;
  getClients(orgId: string): Client[];
  getAudit(orgId: string, auditId: string): Audit | undefined;
  getAudits(orgId: string): Audit[];
  getLicenseRecords(auditId: string): LicenseRecord[];
  getUsageRecords(auditId: string): UsageRecord[];
  getFindings(orgId: string, auditId: string): Finding[];
  getRecommendations(orgId: string, auditId?: string): Recommendation[];
  getRecommendation(orgId: string, recId: string): Recommendation | undefined;
  updateAudit(audit: Audit): void;
  setFindings(auditId: string, findings: Finding[]): void;
  setRecommendations(auditId: string, recs: Recommendation[]): void;
  updateRecommendation(rec: Recommendation): void;
  getDashboard(orgId: string): DashboardSummary;
}
