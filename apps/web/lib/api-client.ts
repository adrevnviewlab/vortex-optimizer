/**
 * Browser-side API client with session-bridge auth for demo org.
 * Falls back to seed data when the API is unreachable.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:4000";

export const DEMO_ORG_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_CONTOSO_AUDIT_ID = "33333333-3333-3333-3333-333333333301";

type PaginatedParams = { limit?: number; offset?: number };

function withPagination(path: string, params?: PaginatedParams): string {
  if (!params?.limit && !params?.offset) return path;
  const search = new URLSearchParams();
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

type ApiMeta = { readiness: string; [key: string]: unknown };
type ApiResponse<T> = { data: T; meta: ApiMeta };

type DashboardSummaryDto = {
  licenseSpendMonthly: number;
  savingsOpportunity: number;
  utilizationPercent: number;
  activeClients: number;
  auditsInProgress: number;
  topRecommendations: Array<{
    id: string;
    title: string;
    savingsEstimate: number;
    priority: number;
  }>;
  spendTrend: Array<{ month: string; spend: number }>;
};

type AuditDto = {
  id: string;
  orgId: string;
  clientId: string | null;
  title: string;
  status: string;
  spendTotal: number | null;
  savingsEstimate: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuditDetailDto = AuditDto & {
  findingsCount: number;
  licenseSnapshotCount: number;
};

type ClientDto = {
  id: string;
  orgId: string;
  name: string;
  industry: string | null;
  employeeCount: number | null;
  renewalDate: string | null;
  region: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type AuditDetailFullDto = AuditDetailDto & {
  findings?: AuditFindingDto[];
  licenseSnapshots?: LicenseSnapshotDto[];
};

type AuditFindingDto = {
  id: string;
  auditId: string;
  category: string;
  severity: string;
  title: string;
  description: string | null;
  affectedCount: number | null;
  savingsEstimate: number | null;
  sku: string | null;
};

type LicenseSnapshotDto = {
  id: string;
  sku: string;
  quantity: number;
  costMonthly: number;
};

type DomainFinding = {
  id: string;
  audit_id: string;
  rule_id: string;
  title: string;
  description: string;
  affected_count: number;
  savings_usd: number;
  severity: string;
  skus: string[];
};

type MeDto = {
  user: { id: string; email: string; name: string | null };
  memberships: Array<{ orgId: string; role: string }>;
  activeOrgId: string | null;
};

type OrganizationDto = {
  id: string;
  name: string;
  tier: string;
  region: string;
  settings: Record<string, unknown>;
};

type MemberDto = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  lastActiveAt: string | null;
};

type ReportDto = {
  id: string;
  auditId: string;
  clientId: string | null;
  type: string;
  status: string;
  createdAt: string;
  downloadUrl?: string | null;
};

type RenewalDto = {
  id: string;
  clientId: string;
  clientName: string;
  renewalDate: string;
  licenses: number;
  monthlySpend: number;
  scenario: string;
};

type LicenseMixDto = Array<{ sku: string; quantity: number; costMonthly: number }>;

type ReadinessDto = {
  status: string;
  modules: Array<{ key: string; label: string; status: string; message?: string }>;
  integrations: Record<string, { status: string; message?: string }>;
};

type MicrosoftIntegrationDto = {
  featureEnabled: boolean;
  configured: boolean;
  connected: boolean;
  status: "live" | "stub" | "blocked";
  tenantId?: string;
  lastSyncAt?: string | null;
  lastError?: string | null;
  consentedAt?: string | null;
  syncedUsers?: number;
  syncedLicenses?: number;
  message?: string;
};

type IntegrationsDto = {
  microsoft: MicrosoftIntegrationDto;
  message?: string;
};

type DomainRecommendation = {
  id: string;
  audit_id: string;
  org_id: string;
  rule_id: string;
  title: string;
  description: string;
  affected_count: number;
  estimated_savings_annual: number;
  confidence: "high" | "medium" | "low";
  status: "draft" | "approved" | "rejected";
  implementation_status: string;
};

export interface DashboardSummary {
  totalClients: number;
  clientsDelta: string;
  activeAudits: number;
  identifiedSavings: number;
  savingsDelta: string;
  avgCompliance: number;
  spendTrend: { month: string; actual: number; optimized: number }[];
  licenseDistribution: { name: string; value: number; color: string }[];
  recentAudits: RecentAudit[];
  readiness?: string;
}

export interface RecentAudit {
  id: string;
  client: string;
  clientInitials: string;
  auditDate: string;
  skus: number;
  issues: number;
  savings: number;
  status: "Complete" | "Running" | "Draft" | "Failed";
  complianceScore: number;
  savingsPercent: number;
}

export interface AuditListItem {
  id: string;
  client: string;
  date: string;
  skus: number;
  issues: number;
  savings: number;
  status: "Complete" | "Running" | "Draft" | "Failed";
  compliance: number;
  savingsPct: number;
}

export interface ClientListItem {
  id: string;
  name: string;
  tenantId: string;
  licenses: number;
  lastAudit: string;
  spend: number;
  status: string;
  compliance: number;
  savingsPct: number;
  region: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  savings: number;
  confidence: number;
  skus: string;
  compliance: number;
  savingsPct: number;
  status: "draft" | "approved" | "rejected";
  description?: string;
}

export interface ClientDetail {
  id: string;
  name: string;
  tenantId: string;
  industry: string | null;
  employeeCount: number | null;
  renewalDate: string | null;
  region: string;
  status: string;
  totalLicenses: number;
  monthlySpend: number;
  potentialSavings: number;
  complianceScore: number;
  licenseDistribution: { name: string; value: number; color: string }[];
  audits: AuditListItem[];
  reports: ReportListItem[];
  recommendations: RecommendationItem[];
}

export interface FindingItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  affectedCount: number;
  savings: number;
  sku: string;
}

export interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

export interface ReportListItem {
  id: string;
  client: string;
  clientId: string;
  auditId: string;
  date: string;
  type: string;
  status: string;
  downloadUrl?: string;
}

export interface RenewalItem {
  id: string;
  clientId: string;
  client: string;
  renewalDate: string;
  daysUntil: number;
  licenses: number;
  spend: number;
  scenario: string;
}

export interface ReadinessModule {
  key: string;
  label: string;
  status: "live" | "stub" | "blocked";
  message?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  orgName: string;
  billingEmail: string;
  tier: string;
}

export interface MicrosoftIntegrationStatus {
  featureEnabled: boolean;
  configured: boolean;
  connected: boolean;
  status: "live" | "stub" | "blocked";
  tenantId?: string;
  lastSyncAt?: string | null;
  lastError?: string | null;
  syncedUsers?: number;
  syncedLicenses?: number;
  message?: string;
}

const LICENSE_COLORS = ["#0067B8", "#3aa0fa", "#107c10", "#f7630c", "#8764b8", "#242424"];

const SEED_CLIENTS: ClientListItem[] = [
  { id: "22222222-2222-2222-2222-222222222201", name: "Contoso Ltd", tenantId: "contoso.onmicrosoft.com", licenses: 800, lastAudit: "2026-07-28", spend: 96800, status: "Active", compliance: 72, savingsPct: 18, region: "US" },
  { id: "22222222-2222-2222-2222-222222222202", name: "Fabrikam Inc", tenantId: "fabrikam.onmicrosoft.com", licenses: 450, lastAudit: "2026-07-25", spend: 54200, status: "Active", compliance: 91, savingsPct: 8, region: "US" },
  { id: "3", name: "Northwind Traders", tenantId: "northwind.onmicrosoft.com", licenses: 620, lastAudit: "2026-07-22", spend: 71500, status: "Active", compliance: 85, savingsPct: 14, region: "US" },
  { id: "4", name: "Adventure Works", tenantId: "adventure.onmicrosoft.com", licenses: 280, lastAudit: "2026-07-18", spend: 32100, status: "Active", compliance: 94, savingsPct: 5, region: "US" },
  { id: "5", name: "Tailspin Toys", tenantId: "tailspin.onmicrosoft.com", licenses: 390, lastAudit: "2026-07-15", spend: 48900, status: "Renewal", compliance: 65, savingsPct: 24, region: "US" },
];

const SEED_FINDINGS: FindingItem[] = [
  { id: "f1", title: "45 inactive E5 licenses", description: "Users with no activity in 90+ days", severity: "critical", category: "usage", affectedCount: 45, savings: 32400, sku: "Microsoft 365 E5" },
  { id: "f2", title: "Duplicate Power BI Pro", description: "Users assigned Power BI in multiple bundles", severity: "high", category: "overlap", affectedCount: 12, savings: 8400, sku: "Power BI Pro" },
  { id: "f3", title: "Unused Teams Phone", description: "Phone licenses with no call activity", severity: "medium", category: "usage", affectedCount: 12, savings: 4800, sku: "Teams Phone" },
  { id: "f4", title: "Azure AD P2 over-provisioned", description: "Non-privileged users on P2 tier", severity: "high", category: "license", affectedCount: 28, savings: 15200, sku: "Azure AD P2" },
  { id: "f5", title: "Audio conferencing unused", description: "Service accounts with conferencing SKUs", severity: "low", category: "usage", affectedCount: 2, savings: 1200, sku: "Audio Conferencing" },
];

const SEED_MEMBERS: MemberItem[] = [
  { id: "m1", name: "Alex Consultant", email: "alex@vortex.example", role: "Admin", lastActive: "Today" },
  { id: "m2", name: "Jordan Analyst", email: "jordan@vortex.example", role: "Consultant", lastActive: "Yesterday" },
  { id: "m3", name: "Sam Viewer", email: "sam@vortex.example", role: "Viewer", lastActive: "3 days ago" },
];

const SEED_REPORTS: ReportListItem[] = [
  { id: "r1", client: "Contoso Ltd", clientId: "22222222-2222-2222-2222-222222222201", auditId: DEMO_CONTOSO_AUDIT_ID, date: "2026-07-28", type: "Executive Summary", status: "complete" },
  { id: "r2", client: "Fabrikam Inc", clientId: "22222222-2222-2222-2222-222222222202", auditId: "33333333-3333-3333-3333-333333333302", date: "2026-07-25", type: "Full Optimization Report", status: "complete" },
  { id: "r3", client: "Northwind Traders", clientId: "3", auditId: "audit-3", date: "2026-07-22", type: "Executive Summary", status: "generating" },
];

const SEED_RENEWALS: RenewalItem[] = [
  { id: "rn1", clientId: "22222222-2222-2222-2222-222222222201", client: "Contoso Ltd", renewalDate: "2026-09-15", daysUntil: 46, licenses: 800, spend: 96800, scenario: "EA renewal — optimize E5→E3" },
  { id: "rn2", clientId: "22222222-2222-2222-2222-222222222202", client: "Fabrikam Inc", renewalDate: "2026-11-01", daysUntil: 93, licenses: 450, spend: 54200, scenario: "CSP renewal — consolidate SKUs" },
  { id: "rn3", clientId: "5", client: "Tailspin Toys", renewalDate: "2026-08-20", daysUntil: 20, licenses: 390, spend: 48900, scenario: "Urgent — 180-day window" },
];

function tenantFromName(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);
  return `${slug}.onmicrosoft.com`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "prospect":
      return "Prospect";
    case "inactive":
      return "Inactive";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function severityToCategory(ruleId: string): string {
  if (ruleId.includes("overlap")) return "overlap";
  if (ruleId.includes("usage") || ruleId.includes("inactive")) return "usage";
  if (ruleId.includes("compliance")) return "compliance";
  return "license";
}

function buildLicenseDistribution(
  snapshots: LicenseSnapshotDto[] | undefined,
): { name: string; value: number; color: string }[] {
  if (!snapshots || snapshots.length === 0) return SEED_DASHBOARD.licenseDistribution;
  const bySku = new Map<string, number>();
  for (const s of snapshots) {
    bySku.set(s.sku, (bySku.get(s.sku) ?? 0) + s.quantity);
  }
  return Array.from(bySku.entries()).map(([name, value], i) => ({
    name,
    value,
    color: LICENSE_COLORS[i % LICENSE_COLORS.length]!,
  }));
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export const SEED_DASHBOARD: DashboardSummary = {
  totalClients: 24,
  clientsDelta: "+2 this month",
  activeAudits: 3,
  identifiedSavings: 142500,
  savingsDelta: "+12% vs last quarter",
  avgCompliance: 87,
  spendTrend: [
    { month: "Aug", actual: 82000, optimized: 78000 },
    { month: "Sep", actual: 83500, optimized: 79000 },
    { month: "Oct", actual: 84200, optimized: 78500 },
    { month: "Nov", actual: 85800, optimized: 79200 },
    { month: "Dec", actual: 87100, optimized: 80000 },
    { month: "Jan", actual: 88900, optimized: 80500 },
    { month: "Feb", actual: 90200, optimized: 81000 },
    { month: "Mar", actual: 91500, optimized: 81500 },
    { month: "Apr", actual: 92800, optimized: 82000 },
    { month: "May", actual: 94100, optimized: 82500 },
    { month: "Jun", actual: 95200, optimized: 83000 },
    { month: "Jul", actual: 96800, optimized: 83500 },
  ],
  licenseDistribution: [
    { name: "M365 E3", value: 420, color: "#0067B8" },
    { name: "M365 E5", value: 180, color: "#0891B2" },
    { name: "M365 F3", value: 95, color: "#334155" },
    { name: "Power BI Pro", value: 62, color: "#94A3B8" },
    { name: "Other", value: 43, color: "#CBD5E1" },
  ],
  recentAudits: [
    {
      id: "audit-1",
      client: "Contoso Ltd",
      clientInitials: "CL",
      auditDate: "2026-07-28",
      skus: 48,
      issues: 12,
      savings: 42500,
      status: "Complete",
      complianceScore: 72,
      savingsPercent: 18,
    },
    {
      id: "audit-2",
      client: "Fabrikam Inc",
      clientInitials: "FI",
      auditDate: "2026-07-25",
      skus: 36,
      issues: 4,
      savings: 18200,
      status: "Complete",
      complianceScore: 91,
      savingsPercent: 8,
    },
    {
      id: "audit-3",
      client: "Northwind Traders",
      clientInitials: "NT",
      auditDate: "2026-07-22",
      skus: 52,
      issues: 8,
      savings: 31800,
      status: "Running",
      complianceScore: 85,
      savingsPercent: 14,
    },
    {
      id: "audit-4",
      client: "Adventure Works",
      clientInitials: "AW",
      auditDate: "2026-07-18",
      skus: 29,
      issues: 2,
      savings: 9400,
      status: "Complete",
      complianceScore: 94,
      savingsPercent: 5,
    },
    {
      id: "audit-5",
      client: "Tailspin Toys",
      clientInitials: "TT",
      auditDate: "2026-07-15",
      skus: 41,
      issues: 15,
      savings: 52100,
      status: "Complete",
      complianceScore: 65,
      savingsPercent: 24,
    },
  ],
};

const SEED_AUDITS: AuditListItem[] = [
  { id: "audit-1", client: "Contoso Ltd", date: "2026-07-28", skus: 48, issues: 12, savings: 42500, status: "Complete", compliance: 72, savingsPct: 18 },
  { id: "audit-2", client: "Fabrikam Inc", date: "2026-07-25", skus: 36, issues: 4, savings: 18200, status: "Complete", compliance: 91, savingsPct: 8 },
  { id: "audit-3", client: "Northwind Traders", date: "2026-07-22", skus: 52, issues: 8, savings: 31800, status: "Running", compliance: 85, savingsPct: 14 },
  { id: "audit-4", client: "Adventure Works", date: "2026-07-18", skus: 29, issues: 2, savings: 9400, status: "Complete", compliance: 94, savingsPct: 5 },
  { id: "audit-5", client: "Tailspin Toys", date: "2026-07-15", skus: 41, issues: 15, savings: 52100, status: "Draft", compliance: 65, savingsPct: 24 },
];

const SEED_RECOMMENDATIONS: RecommendationItem[] = [
  { id: "1", title: "Downgrade 45 inactive E5 to E3", savings: 22500, confidence: 92, skus: "Microsoft 365 E5", compliance: 72, savingsPct: 18, status: "draft" },
  { id: "2", title: "Remove duplicate Power BI Pro licenses", savings: 8400, confidence: 88, skus: "Power BI Pro", compliance: 85, savingsPct: 12, status: "draft" },
  { id: "3", title: "Reclaim 12 unused Teams Phone licenses", savings: 4800, confidence: 95, skus: "Teams Phone", compliance: 91, savingsPct: 6, status: "draft" },
  { id: "4", title: "Consolidate Azure AD P2 to P1 for non-privileged users", savings: 15200, confidence: 78, skus: "Azure AD P2", compliance: 65, savingsPct: 22, status: "draft" },
];

async function getAccessToken(orgId: string = DEMO_ORG_ID): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch("/api/session-bridge", {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as ApiResponse<{
      token: string;
      expiresAt: string;
    }>;

    cachedToken = {
      token: json.data.token,
      expiresAt: new Date(json.data.expiresAt).getTime(),
    };
    return cachedToken.token;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  orgId: string = DEMO_ORG_ID,
): Promise<{ data: T | null; readiness: string | null }> {
  const token = await getAccessToken(orgId);
  if (!token) return { data: null, readiness: null };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Org-Id": orgId,
        ...(options.headers as Record<string, string> | undefined),
      },
    });

    const readiness = res.headers.get("X-Readiness");
    if (!res.ok) return { data: null, readiness };

    const json = (await res.json()) as ApiResponse<T>;
    return { data: json.data, readiness: readiness ?? json.meta?.readiness ?? null };
  } catch {
    return { data: null, readiness: null };
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mapAuditStatus(status: string): RecentAudit["status"] {
  switch (status) {
    case "completed":
      return "Complete";
    case "in_progress":
    case "review":
      return "Running";
    case "archived":
      return "Complete";
    case "draft":
      return "Draft";
    default:
      return "Draft";
  }
}

function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split("-");
  if (!year || !month) return isoMonth;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("en-US", { month: "short" });
}

function confidencePercent(confidence: DomainRecommendation["confidence"]): number {
  switch (confidence) {
    case "high":
      return 92;
    case "medium":
      return 78;
    case "low":
      return 55;
    default:
      return 70;
  }
}

function mapDashboardDto(
  dto: DashboardSummaryDto,
  audits: RecentAudit[],
  readiness: string | null,
  licenseDistribution?: { name: string; value: number; color: string }[],
): DashboardSummary {
  const spendTotal = dto.spendTrend.reduce((s, p) => s + p.spend, 0);
  const savingsDelta =
    dto.savingsOpportunity > 0 && spendTotal > 0
      ? `+${Math.round((dto.savingsOpportunity / (spendTotal * 12)) * 100)}% vs annual spend`
      : SEED_DASHBOARD.savingsDelta;

  return {
    totalClients: dto.activeClients,
    clientsDelta: dto.activeClients > 0 ? `${dto.activeClients} active` : SEED_DASHBOARD.clientsDelta,
    activeAudits: dto.auditsInProgress,
    identifiedSavings: dto.savingsOpportunity,
    savingsDelta,
    avgCompliance: dto.utilizationPercent,
    spendTrend: dto.spendTrend.map((p) => ({
      month: formatMonth(p.month),
      actual: p.spend,
      optimized: Math.round(p.spend * 0.92),
    })),
    licenseDistribution: licenseDistribution ?? SEED_DASHBOARD.licenseDistribution,
    recentAudits: audits.length > 0 ? audits : SEED_DASHBOARD.recentAudits,
    readiness: readiness ?? undefined,
  };
}

async function buildRecentAudits(
  orgId: string,
  utilizationPercent: number,
): Promise<RecentAudit[]> {
  const [auditsRes, clientsRes] = await Promise.all([
    apiFetch<AuditDto[]>(`/v1/orgs/${orgId}/audits`, {}, orgId),
    apiFetch<ClientDto[]>(`/v1/orgs/${orgId}/clients`, {}, orgId),
  ]);

  if (!auditsRes.data) return [];

  const clientNames = new Map(
    (clientsRes.data ?? []).map((c) => [c.id, c.name]),
  );

  const details = await Promise.all(
    auditsRes.data.map((audit) =>
      apiFetch<AuditDetailDto>(`/v1/orgs/${orgId}/audits/${audit.id}`, {}, orgId),
    ),
  );

  return auditsRes.data.map((audit, index) => {
    const detail = details[index]?.data;
    const clientName =
      (audit.clientId && clientNames.get(audit.clientId)) ||
      audit.title.split("—").pop()?.trim() ||
      audit.title;
    const spend = audit.spendTotal ?? 0;
    const savings = audit.savingsEstimate ?? 0;
    const savingsPercent = spend > 0 ? Math.round((savings / spend) * 100) : 0;

    return {
      id: audit.id,
      client: clientName,
      clientInitials: initials(clientName),
      auditDate: (audit.startedAt ?? audit.createdAt).slice(0, 10),
      skus: detail?.licenseSnapshotCount ?? 0,
      issues: detail?.findingsCount ?? 0,
      savings,
      status: mapAuditStatus(audit.status),
      complianceScore: utilizationPercent,
      savingsPercent,
    };
  });
}

export async function fetchDashboardSummary(
  orgId: string = DEMO_ORG_ID,
): Promise<DashboardSummary> {
  const [summaryRes, licenseMixRes] = await Promise.all([
    apiFetch<DashboardSummaryDto>(`/v1/orgs/${orgId}/dashboard/summary`, {}, orgId),
    apiFetch<LicenseMixDto>(`/v1/orgs/${orgId}/dashboard/license-mix`, {}, orgId),
  ]);

  const { data, readiness } = summaryRes;

  let licenseDistribution: { name: string; value: number; color: string }[] | undefined;
  if (licenseMixRes.data && licenseMixRes.data.length > 0) {
    licenseDistribution = licenseMixRes.data.map((item, i) => ({
      name: item.sku,
      value: item.quantity,
      color: LICENSE_COLORS[i % LICENSE_COLORS.length]!,
    }));
  }

  if (!data) return { ...SEED_DASHBOARD, licenseDistribution: licenseDistribution ?? SEED_DASHBOARD.licenseDistribution, readiness: readiness ?? "stub" };

  const recentAudits = await buildRecentAudits(orgId, data.utilizationPercent);
  return mapDashboardDto(data, recentAudits, readiness, licenseDistribution);
}

export async function fetchAudits(
  orgId: string = DEMO_ORG_ID,
  pagination?: PaginatedParams,
): Promise<{ audits: AuditListItem[]; readiness: string | null }> {
  const [auditsRes, clientsRes, dashboardRes] = await Promise.all([
    apiFetch<AuditDto[]>(withPagination(`/v1/orgs/${orgId}/audits`, pagination), {}, orgId),
    apiFetch<ClientDto[]>(withPagination(`/v1/orgs/${orgId}/clients`, pagination), {}, orgId),
    apiFetch<DashboardSummaryDto>(`/v1/orgs/${orgId}/dashboard/summary`, {}, orgId),
  ]);

  if (!auditsRes.data) {
    return { audits: SEED_AUDITS, readiness: auditsRes.readiness ?? "stub" };
  }

  const clientNames = new Map(
    (clientsRes.data ?? []).map((c) => [c.id, c.name]),
  );
  const utilization = dashboardRes.data?.utilizationPercent ?? 85;

  const details = await Promise.all(
    auditsRes.data.map((audit) =>
      apiFetch<AuditDetailDto>(`/v1/orgs/${orgId}/audits/${audit.id}`, {}, orgId),
    ),
  );

  const audits: AuditListItem[] = auditsRes.data.map((audit, index) => {
    const detail = details[index]?.data;
    const clientName =
      (audit.clientId && clientNames.get(audit.clientId)) ||
      audit.title.split("—").pop()?.trim() ||
      audit.title;
    const spend = audit.spendTotal ?? 0;
    const savings = audit.savingsEstimate ?? 0;

    return {
      id: audit.id,
      client: clientName,
      date: (audit.startedAt ?? audit.createdAt).slice(0, 10),
      skus: detail?.licenseSnapshotCount ?? 0,
      issues: detail?.findingsCount ?? 0,
      savings,
      status: mapAuditStatus(audit.status),
      compliance: utilization,
      savingsPct: spend > 0 ? Math.round((savings / spend) * 100) : 0,
    };
  });

  return { audits, readiness: auditsRes.readiness };
}

export async function fetchRecommendations(
  orgId: string = DEMO_ORG_ID,
  auditId: string = DEMO_CONTOSO_AUDIT_ID,
): Promise<{ recommendations: RecommendationItem[]; readiness: string | null }> {
  const { data, readiness } = await apiFetch<DomainRecommendation[]>(
    `/v1/orgs/${orgId}/audits/${auditId}/recommendations`,
    {},
    orgId,
  );

  if (!data || data.length === 0) {
    return { recommendations: SEED_RECOMMENDATIONS, readiness: readiness ?? "stub" };
  }

  const recommendations: RecommendationItem[] = data.map((rec) => ({
    id: rec.id,
    title: rec.title,
    savings: rec.estimated_savings_annual,
    confidence: confidencePercent(rec.confidence),
    skus: rec.rule_id.replace(/_/g, " "),
    compliance: 85,
    savingsPct: 12,
    status: rec.status,
    description: rec.description,
  }));

  return { recommendations, readiness };
}

export async function patchRecommendation(
  recId: string,
  body: { status?: "approved" | "rejected"; title?: string; description?: string },
  orgId: string = DEMO_ORG_ID,
): Promise<{ ok: boolean; readiness: string | null }> {
  const { data, readiness } = await apiFetch<DomainRecommendation>(
    `/v1/orgs/${orgId}/recommendations/${recId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    orgId,
  );

  return { ok: data !== null, readiness };
}

export async function analyzeAudit(
  auditId: string = DEMO_CONTOSO_AUDIT_ID,
  orgId: string = DEMO_ORG_ID,
): Promise<{ ok: boolean; readiness: string | null }> {
  const { data, readiness } = await apiFetch<{ status: string }>(
    `/v1/orgs/${orgId}/audits/${auditId}/analyze`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preserve_manual_edits: true }),
    },
    orgId,
  );

  return { ok: data !== null, readiness };
}

export async function importAuditCsv(
  auditId: string,
  csv: string,
  orgId: string = DEMO_ORG_ID,
): Promise<{ ok: boolean; readiness: string | null; rowCount?: number }> {
  const { data, readiness } = await apiFetch<{ parsed_row_count: number }>(
    `/v1/orgs/${orgId}/audits/${auditId}/import`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, file_type: "licenses" }),
    },
    orgId,
  );

  return {
    ok: data !== null,
    readiness,
    rowCount: data?.parsed_row_count,
  };
}

export async function fetchClients(
  orgId: string = DEMO_ORG_ID,
  pagination?: PaginatedParams,
): Promise<{ clients: ClientListItem[]; readiness: string | null }> {
  const [clientsRes, auditsRes, dashboardRes] = await Promise.all([
    apiFetch<ClientDto[]>(withPagination(`/v1/orgs/${orgId}/clients`, pagination), {}, orgId),
    apiFetch<AuditDto[]>(withPagination(`/v1/orgs/${orgId}/audits`, pagination), {}, orgId),
    apiFetch<DashboardSummaryDto>(`/v1/orgs/${orgId}/dashboard/summary`, {}, orgId),
  ]);

  if (!clientsRes.data) {
    return { clients: SEED_CLIENTS, readiness: clientsRes.readiness ?? "stub" };
  }

  const utilization = dashboardRes.data?.utilizationPercent ?? 85;
  const auditDetails = await Promise.all(
    (auditsRes.data ?? []).map((a) =>
      apiFetch<AuditDetailDto>(`/v1/orgs/${orgId}/audits/${a.id}`, {}, orgId),
    ),
  );

  const clients: ClientListItem[] = clientsRes.data.map((client) => {
    const clientAudits = (auditsRes.data ?? []).filter((a) => a.clientId === client.id);
    const latestAudit = clientAudits[0];
    const detail = latestAudit
      ? auditDetails.find((d) => d.data?.id === latestAudit.id)?.data
      : undefined;
    const spend = latestAudit?.spendTotal ?? 0;
    const savings = latestAudit?.savingsEstimate ?? 0;

    return {
      id: client.id,
      name: client.name,
      tenantId: tenantFromName(client.name),
      licenses: detail?.licenseSnapshotCount ?? client.employeeCount ?? 0,
      lastAudit: latestAudit
        ? (latestAudit.startedAt ?? latestAudit.createdAt).slice(0, 10)
        : "—",
      spend: spend || Math.round((client.employeeCount ?? 100) * 120),
      status: statusLabel(client.status),
      compliance: utilization,
      savingsPct: spend > 0 ? Math.round((savings / spend) * 100) : 0,
      region: client.region ?? "US",
    };
  });

  return { clients, readiness: clientsRes.readiness };
}

export async function createClient(
  input: { name: string; industry?: string; employeeCount?: number; region?: string },
  orgId: string = DEMO_ORG_ID,
): Promise<{ client: ClientListItem | null; readiness: string | null }> {
  const { data, readiness } = await apiFetch<ClientDto>(
    `/v1/orgs/${orgId}/clients`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        industry: input.industry,
        employeeCount: input.employeeCount,
        region: input.region ?? "US",
        status: "prospect",
      }),
    },
    orgId,
  );

  if (!data) return { client: null, readiness };

  return {
    client: {
      id: data.id,
      name: data.name,
      tenantId: tenantFromName(data.name),
      licenses: data.employeeCount ?? 0,
      lastAudit: "—",
      spend: 0,
      status: statusLabel(data.status),
      compliance: 85,
      savingsPct: 0,
      region: data.region ?? "US",
    },
    readiness,
  };
}

export async function fetchClientDetail(
  clientId: string,
  orgId: string = DEMO_ORG_ID,
): Promise<{ client: ClientDetail | null; readiness: string | null }> {
  const [clientsRes, auditsRes, recsRes] = await Promise.all([
    apiFetch<ClientDto[]>(`/v1/orgs/${orgId}/clients`, {}, orgId),
    apiFetch<AuditDto[]>(`/v1/orgs/${orgId}/audits`, {}, orgId),
    fetchRecommendations(orgId, DEMO_CONTOSO_AUDIT_ID),
  ]);

  const dto = clientsRes.data?.find((c) => c.id === clientId);
  if (!dto && !clientsRes.data) {
    const seed = SEED_CLIENTS.find((c) => c.id === clientId);
    if (!seed) return { client: null, readiness: "stub" };
    return {
      client: {
        ...seed,
        industry: "Technology",
        employeeCount: seed.licenses,
        renewalDate: "2026-09-15",
        region: "US",
        totalLicenses: seed.licenses,
        monthlySpend: seed.spend,
        potentialSavings: Math.round(seed.spend * (seed.savingsPct / 100)),
        complianceScore: seed.compliance,
        licenseDistribution: SEED_DASHBOARD.licenseDistribution,
        audits: SEED_AUDITS.filter((a) => a.client === seed.name),
        reports: SEED_REPORTS.filter((r) => r.client === seed.name),
        recommendations: recsRes.recommendations,
      },
      readiness: "stub",
    };
  }

  if (!dto) return { client: null, readiness: clientsRes.readiness };

  const clientAudits = (auditsRes.data ?? []).filter((a) => a.clientId === clientId);
  const latestAudit = clientAudits[0];
  let detail: AuditDetailFullDto | null = null;
  if (latestAudit) {
    const res = await apiFetch<AuditDetailFullDto>(
      `/v1/orgs/${orgId}/audits/${latestAudit.id}`,
      {},
      orgId,
    );
    detail = res.data;
  }

  const spend = latestAudit?.spendTotal ?? 0;
  const savings = latestAudit?.savingsEstimate ?? 0;
  const compliance = 85;

  const audits: AuditListItem[] = clientAudits.map((audit) => ({
    id: audit.id,
    client: dto.name,
    date: (audit.startedAt ?? audit.createdAt).slice(0, 10),
    skus: detail?.licenseSnapshotCount ?? 0,
    issues: detail?.findingsCount ?? 0,
    savings: audit.savingsEstimate ?? 0,
    status: mapAuditStatus(audit.status),
    compliance,
    savingsPct: spend > 0 ? Math.round((savings / spend) * 100) : 0,
  }));

  return {
    client: {
      id: dto.id,
      name: dto.name,
      tenantId: tenantFromName(dto.name),
      industry: dto.industry,
      employeeCount: dto.employeeCount,
      renewalDate: dto.renewalDate?.slice(0, 10) ?? null,
      region: dto.region,
      status: statusLabel(dto.status),
      totalLicenses: detail?.licenseSnapshotCount ?? dto.employeeCount ?? 0,
      monthlySpend: spend || Math.round((dto.employeeCount ?? 100) * 120),
      potentialSavings: savings,
      complianceScore: compliance,
      licenseDistribution: buildLicenseDistribution(detail?.licenseSnapshots),
      audits,
      reports: SEED_REPORTS.filter((r) => r.clientId === clientId || r.client === dto.name),
      recommendations: recsRes.recommendations,
    },
    readiness: clientsRes.readiness,
  };
}

export async function fetchAuditDetail(
  auditId: string,
  orgId: string = DEMO_ORG_ID,
): Promise<{ audit: AuditDetailFullDto | null; clientName: string; readiness: string | null }> {
  const [detailRes, clientsRes] = await Promise.all([
    apiFetch<AuditDetailFullDto>(`/v1/orgs/${orgId}/audits/${auditId}`, {}, orgId),
    apiFetch<ClientDto[]>(`/v1/orgs/${orgId}/clients`, {}, orgId),
  ]);

  if (!detailRes.data) {
    const seed = SEED_AUDITS.find((a) => a.id === auditId);
    return {
      audit: null,
      clientName: seed?.client ?? "Unknown",
      readiness: detailRes.readiness ?? "stub",
    };
  }

  const audit = detailRes.data;
  const clientName =
    (audit.clientId && clientsRes.data?.find((c) => c.id === audit.clientId)?.name) ||
    audit.title.split("—").pop()?.trim() ||
    audit.title;

  return { audit, clientName, readiness: detailRes.readiness };
}

export async function fetchFindings(
  auditId: string = DEMO_CONTOSO_AUDIT_ID,
  orgId: string = DEMO_ORG_ID,
): Promise<{ findings: FindingItem[]; readiness: string | null }> {
  const { data, readiness } = await apiFetch<DomainFinding[]>(
    `/v1/orgs/${orgId}/audits/${auditId}/findings`,
    {},
    orgId,
  );

  if (!data || data.length === 0) {
    const detailRes = await apiFetch<AuditDetailFullDto>(
      `/v1/orgs/${orgId}/audits/${auditId}`,
      {},
      orgId,
    );
    if (detailRes.data?.findings && detailRes.data.findings.length > 0) {
      const findings: FindingItem[] = detailRes.data.findings.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description ?? "",
        severity: f.severity,
        category: f.category,
        affectedCount: f.affectedCount ?? 0,
        savings: f.savingsEstimate ?? 0,
        sku: f.sku ?? "—",
      }));
      return { findings, readiness: detailRes.readiness };
    }
    return { findings: SEED_FINDINGS, readiness: readiness ?? "stub" };
  }

  const findings: FindingItem[] = data.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    severity: f.severity,
    category: severityToCategory(f.rule_id),
    affectedCount: f.affected_count,
    savings: f.savings_usd,
    sku: f.skus[0] ?? "—",
  }));

  return { findings, readiness };
}

export async function fetchMembers(
  orgId: string = DEMO_ORG_ID,
): Promise<{ members: MemberItem[]; readiness: string | null }> {
  const { data, readiness } = await apiFetch<MemberDto[]>(
    `/v1/orgs/${orgId}/members`,
    {},
    orgId,
  );

  if (!data) {
    return { members: SEED_MEMBERS, readiness: readiness ?? "stub" };
  }

  const members: MemberItem[] = data.map((m) => ({
    id: m.id,
    name: m.name ?? m.email.split("@")[0] ?? "User",
    email: m.email,
    role: m.role.charAt(0).toUpperCase() + m.role.slice(1),
    lastActive: m.lastActiveAt
      ? new Date(m.lastActiveAt).toLocaleDateString()
      : "—",
  }));

  return { members, readiness };
}

export async function inviteMember(
  email: string,
  role: string,
  orgId: string = DEMO_ORG_ID,
): Promise<{ ok: boolean; readiness: string | null }> {
  const { data, readiness } = await apiFetch<MemberDto>(
    `/v1/orgs/${orgId}/members`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role: role.toLowerCase() }),
    },
    orgId,
  );

  return { ok: data !== null, readiness };
}

export async function fetchProfile(
  orgId: string = DEMO_ORG_ID,
): Promise<{ profile: UserProfile; readiness: string | null }> {
  const [meRes, orgRes] = await Promise.all([
    apiFetch<MeDto>("/v1/me", {}, orgId),
    apiFetch<OrganizationDto>(`/v1/orgs/${orgId}`, {}, orgId),
  ]);

  const defaultProfile: UserProfile = {
    name: "Alex Consultant",
    email: "alex@vortex.example",
    orgName: "Vortex Advisory",
    billingEmail: "billing@vortex.example",
    tier: "Professional",
  };

  if (!meRes.data) {
    return { profile: defaultProfile, readiness: meRes.readiness ?? "stub" };
  }

  return {
    profile: {
      name: meRes.data.user.name ?? defaultProfile.name,
      email: meRes.data.user.email,
      orgName: orgRes.data?.name ?? defaultProfile.orgName,
      billingEmail: (orgRes.data?.settings?.billingEmail as string) ?? defaultProfile.billingEmail,
      tier: orgRes.data?.tier === "consultancy" ? "Professional" : defaultProfile.tier,
    },
    readiness: meRes.readiness,
  };
}

export async function fetchReports(
  orgId: string = DEMO_ORG_ID,
): Promise<{ reports: ReportListItem[]; readiness: string | null }> {
  const [reportsRes, clientsRes] = await Promise.all([
    apiFetch<ReportDto[]>(`/v1/orgs/${orgId}/reports`, {}, orgId),
    apiFetch<ClientDto[]>(`/v1/orgs/${orgId}/clients`, {}, orgId),
  ]);

  if (!reportsRes.data) {
    return { reports: SEED_REPORTS, readiness: reportsRes.readiness ?? "stub" };
  }

  const clientNames = new Map((clientsRes.data ?? []).map((c) => [c.id, c.name]));

  const reports: ReportListItem[] = reportsRes.data.map((r) => ({
    id: r.id,
    client: (r.clientId && clientNames.get(r.clientId)) ?? "Unknown",
    clientId: r.clientId ?? "",
    auditId: r.auditId,
    date: r.createdAt.slice(0, 10),
    type: r.type.replace(/_/g, " "),
    status: r.status,
    downloadUrl: r.downloadUrl ?? undefined,
  }));

  return { reports, readiness: reportsRes.readiness };
}

export async function generateReport(
  auditId: string,
  type: string = "executive_brief",
  orgId: string = DEMO_ORG_ID,
): Promise<{ reportId: string | null; readiness: string | null }> {
  const { data, readiness } = await apiFetch<{ id: string }>(
    `/v1/orgs/${orgId}/audits/${auditId}/reports`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    },
    orgId,
  );

  return { reportId: data?.id ?? null, readiness };
}

export async function pollReportStatus(
  reportId: string,
  orgId: string = DEMO_ORG_ID,
): Promise<{ status: string; downloadUrl: string | null; readiness: string | null }> {
  const { data, readiness } = await apiFetch<ReportDto>(
    `/v1/orgs/${orgId}/reports/${reportId}`,
    {},
    orgId,
  );

  if (!data) {
    return { status: "complete", downloadUrl: null, readiness: readiness ?? "stub" };
  }

  return {
    status: data.status,
    downloadUrl: data.downloadUrl ?? null,
    readiness,
  };
}

export async function fetchReportDownloadUrl(
  reportId: string,
  orgId: string = DEMO_ORG_ID,
): Promise<{ url: string | null; readiness: string | null }> {
  const { data, readiness } = await apiFetch<{ url: string }>(
    `/v1/orgs/${orgId}/reports/${reportId}/download`,
    {},
    orgId,
  );

  return { url: data?.url ?? null, readiness };
}

export type BillingStatus = {
  connected: boolean;
  featureEnabled: boolean;
  message: string;
  plan?: string | null;
  portalAvailable?: boolean;
};

export async function fetchBillingStatus(
  orgId: string = DEMO_ORG_ID,
): Promise<{ status: BillingStatus | null; readiness: string | null }> {
  const token = await getAccessToken(orgId);

  try {
    const res = await fetch(`${API_URL}/v1/billing/status`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
              "X-Org-Id": orgId,
            }
          : {}),
      },
    });

    const readiness = res.headers.get("X-Readiness");
    if (!res.ok) {
      return {
        status: {
          connected: false,
          featureEnabled: false,
          message: "Stripe not connected",
        },
        readiness,
      };
    }

    const json = (await res.json()) as ApiResponse<BillingStatus>;
    return { status: json.data, readiness: readiness ?? json.meta?.readiness ?? null };
  } catch {
    return {
      status: {
        connected: false,
        featureEnabled: false,
        message: "Stripe not connected",
      },
      readiness: null,
    };
  }
}

export async function createBillingCheckout(
  plan: "audit" | "retainer" | "quarterly" | "enterprise",
  orgId: string = DEMO_ORG_ID,
): Promise<{ checkoutUrl: string | null; error?: string; readiness: string | null }> {
  const token = await getAccessToken(orgId);
  if (!token) {
    return { checkoutUrl: null, error: "Sign in required for checkout", readiness: "blocked" };
  }

  try {
    const res = await fetch(`${API_URL}/v1/billing/checkout`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Org-Id": orgId,
      },
      body: JSON.stringify({ plan, orgId }),
    });

    const readiness = res.headers.get("X-Readiness");
    const json = (await res.json()) as ApiResponse<{ checkoutUrl: string }> & { error?: string };

    if (!res.ok) {
      return { checkoutUrl: null, error: json.error ?? "Checkout unavailable", readiness };
    }

    return { checkoutUrl: json.data.checkoutUrl, readiness };
  } catch {
    return { checkoutUrl: null, error: "API unreachable", readiness: null };
  }
}

export async function createBillingPortal(
  orgId: string = DEMO_ORG_ID,
): Promise<{ portalUrl: string | null; error?: string; readiness: string | null }> {
  const token = await getAccessToken(orgId);
  if (!token) {
    return { portalUrl: null, error: "Sign in required", readiness: "blocked" };
  }

  try {
    const res = await fetch(`${API_URL}/v1/billing/portal`, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Org-Id": orgId,
      },
    });

    const readiness = res.headers.get("X-Readiness");
    const json = (await res.json()) as ApiResponse<{ portalUrl: string }> & { error?: string };

    if (!res.ok) {
      return { portalUrl: null, error: json.error ?? "Portal unavailable", readiness };
    }

    return { portalUrl: json.data.portalUrl, readiness };
  } catch {
    return { portalUrl: null, error: "API unreachable", readiness: null };
  }
}

export async function fetchRenewals(
  orgId: string = DEMO_ORG_ID,
): Promise<{ renewals: RenewalItem[]; readiness: string | null }> {
  const { data, readiness } = await apiFetch<RenewalDto[]>(
    `/v1/orgs/${orgId}/renewals`,
    {},
    orgId,
  );

  if (!data) {
    return { renewals: SEED_RENEWALS, readiness: readiness ?? "stub" };
  }

  const now = Date.now();
  const renewals: RenewalItem[] = data.map((r) => {
    const renewalMs = new Date(r.renewalDate).getTime();
    const daysUntil = Math.max(0, Math.ceil((renewalMs - now) / 86400000));
    return {
      id: r.id,
      clientId: r.clientId,
      client: r.clientName,
      renewalDate: r.renewalDate.slice(0, 10),
      daysUntil,
      licenses: r.licenses,
      spend: r.monthlySpend,
      scenario: r.scenario,
    };
  });

  return { renewals, readiness };
}

export async function fetchReadiness(
  orgId: string = DEMO_ORG_ID,
): Promise<{ modules: ReadinessModule[]; readiness: string | null }> {
  const { data, readiness } = await apiFetch<ReadinessDto>(
    `/v1/orgs/${orgId}/readiness`,
    {},
    orgId,
  );

  if (!data) {
    const fallback: ReadinessModule[] = [
      { key: "clients", label: "Client management", status: "live" },
      { key: "audits", label: "Audit ingestion", status: "live" },
      { key: "analysis", label: "Rules engine", status: "live" },
      { key: "reports", label: "PDF reports", status: "stub", message: "Pipeline not connected" },
      { key: "graph", label: "Microsoft Graph", status: "blocked", message: "Not enabled" },
      { key: "stripe", label: "Stripe billing", status: "blocked", message: "Stripe not connected" },
    ];
    return { modules: fallback, readiness: readiness ?? "stub" };
  }

  const modules: ReadinessModule[] =
    data.modules?.map((m) => ({
      key: m.key,
      label: m.label,
      status: m.status as ReadinessModule["status"],
      message: m.message,
    })) ??
    Object.entries(data.integrations ?? {}).map(([key, val]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      status: val.status as ReadinessModule["status"],
      message: val.message,
    }));

  return { modules, readiness: data.status ?? readiness };
}

export async function fetchMicrosoftIntegration(
  orgId: string = DEMO_ORG_ID,
): Promise<{ integration: MicrosoftIntegrationStatus; readiness: string | null }> {
  const { data, readiness } = await apiFetch<IntegrationsDto>(
    `/v1/orgs/${orgId}/integrations`,
    {},
    orgId,
  );

  const fallback: MicrosoftIntegrationStatus = {
    featureEnabled: false,
    configured: false,
    connected: false,
    status: "blocked",
    message:
      "Microsoft Graph sync is disabled. CSV import remains the live data path until FEATURE_GRAPH_SYNC is enabled.",
  };

  if (!data) {
    return { integration: fallback, readiness: readiness ?? "blocked" };
  }

  return { integration: data.microsoft, readiness: data.microsoft.status ?? readiness };
}

export async function fetchMicrosoftAuthUrl(
  orgId: string = DEMO_ORG_ID,
): Promise<{ authUrl: string | null; readiness: string | null; error?: string }> {
  const token = await getAccessToken(orgId);
  if (!token) {
    return { authUrl: null, readiness: "blocked", error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${API_URL}/v1/orgs/${orgId}/integrations/microsoft/auth-url`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-Org-Id": orgId,
      },
    });

    const readiness = res.headers.get("X-Readiness");
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        authUrl: null,
        readiness: readiness ?? "blocked",
        error: body?.error ?? "Graph OAuth unavailable",
      };
    }

    const json = (await res.json()) as ApiResponse<{ authUrl: string }>;
    return { authUrl: json.data.authUrl, readiness: readiness ?? json.meta?.readiness ?? null };
  } catch {
    return { authUrl: null, readiness: "blocked", error: "API unreachable" };
  }
}

export async function disconnectMicrosoft(
  orgId: string = DEMO_ORG_ID,
): Promise<{ ok: boolean; readiness: string | null }> {
  const { data, readiness } = await apiFetch<{ disconnected: boolean }>(
    `/v1/orgs/${orgId}/integrations/microsoft`,
    { method: "DELETE" },
    orgId,
  );

  return { ok: data?.disconnected === true, readiness };
}

export async function syncMicrosoft(
  orgId: string = DEMO_ORG_ID,
): Promise<{ ok: boolean; readiness: string | null; recordsProcessed?: number }> {
  const { data, readiness } = await apiFetch<{ recordsProcessed: number }>(
    `/v1/orgs/${orgId}/integrations/microsoft/sync`,
    { method: "POST" },
    orgId,
  );

  return {
    ok: data !== null,
    readiness,
    recordsProcessed: data?.recordsProcessed,
  };
}

export interface LicenseInventoryItem {
  sku: string;
  productFamily: string;
  quantity: number;
  assigned: number;
  unused: number;
  costMonthly: number;
  overlapRisk: "low" | "medium" | "high";
}

export interface UtilizationRow {
  sku: string;
  assigned: number;
  active30d: number;
  inactive: number;
  utilizationPct: number;
  lastSignInTrend: string;
}

export interface RoadmapPhase {
  id: string;
  phase: string;
  window: string;
  effort: "Low" | "Medium" | "High";
  savingsAnnual: number;
  status: "planned" | "in_progress" | "done";
  items: string[];
}

export interface AdvisoryNote {
  id: string;
  client: string;
  date: string;
  author: string;
  type: "meeting" | "email" | "note";
  summary: string;
}

export interface PortalFinding {
  id: string;
  title: string;
  severity: string;
  savings: number;
  status: "pending" | "approved" | "deferred";
}

const SEED_LICENSES: LicenseInventoryItem[] = [
  { sku: "Microsoft 365 E5", productFamily: "M365", quantity: 180, assigned: 162, unused: 18, costMonthly: 10260, overlapRisk: "high" },
  { sku: "Microsoft 365 E3", productFamily: "M365", quantity: 420, assigned: 401, unused: 19, costMonthly: 15120, overlapRisk: "medium" },
  { sku: "Microsoft 365 F3", productFamily: "M365", quantity: 95, assigned: 88, unused: 7, costMonthly: 760, overlapRisk: "low" },
  { sku: "Power BI Pro", productFamily: "Power Platform", quantity: 62, assigned: 41, unused: 21, costMonthly: 620, overlapRisk: "high" },
  { sku: "Teams Phone Standard", productFamily: "Teams", quantity: 48, assigned: 31, unused: 17, costMonthly: 384, overlapRisk: "medium" },
  { sku: "Entra ID P2", productFamily: "Entra", quantity: 120, assigned: 95, unused: 25, costMonthly: 1080, overlapRisk: "medium" },
  { sku: "Azure AD P1", productFamily: "Entra", quantity: 300, assigned: 278, unused: 22, costMonthly: 1800, overlapRisk: "low" },
];

const SEED_UTILIZATION: UtilizationRow[] = [
  { sku: "Microsoft 365 E5", assigned: 162, active30d: 118, inactive: 44, utilizationPct: 73, lastSignInTrend: "Declining" },
  { sku: "Microsoft 365 E3", assigned: 401, active30d: 372, inactive: 29, utilizationPct: 93, lastSignInTrend: "Stable" },
  { sku: "Power BI Pro", assigned: 41, active30d: 22, inactive: 19, utilizationPct: 54, lastSignInTrend: "Declining" },
  { sku: "Teams Phone Standard", assigned: 31, active30d: 18, inactive: 13, utilizationPct: 58, lastSignInTrend: "Declining" },
  { sku: "Entra ID P2", assigned: 95, active30d: 71, inactive: 24, utilizationPct: 75, lastSignInTrend: "Stable" },
];

const SEED_ROADMAP: RoadmapPhase[] = [
  {
    id: "p1",
    phase: "Quick wins",
    window: "0–30 days",
    effort: "Low",
    savingsAnnual: 28400,
    status: "in_progress",
    items: ["Reclaim inactive E5 seats", "Remove duplicate Teams Phone", "Disable orphaned Power BI Pro"],
  },
  {
    id: "p2",
    phase: "Right-sizing",
    window: "30–90 days",
    effort: "Medium",
    savingsAnnual: 41200,
    status: "planned",
    items: ["E5 → E3 for non-security roles", "Consolidate Entra P2 to P1", "Frontline F3 alignment"],
  },
  {
    id: "p3",
    phase: "Renewal alignment",
    window: "90–180 days",
    effort: "High",
    savingsAnnual: 18600,
    status: "planned",
    items: ["EA true-up scenario", "Azure hybrid benefit review", "Procurement narrative pack"],
  },
];

const SEED_ADVISORY: AdvisoryNote[] = [
  {
    id: "a1",
    client: "Contoso Ltd",
    date: "2026-07-30",
    author: "Demo Admin",
    type: "meeting",
    summary: "Kickoff: confirmed EA renewal window and prioritized inactive E5 reclamation.",
  },
  {
    id: "a2",
    client: "Contoso Ltd",
    date: "2026-08-02",
    author: "Demo Admin",
    type: "note",
    summary: "Finance requested board-ready PDF with phased roadmap before Aug procurement review.",
  },
  {
    id: "a3",
    client: "Fabrikam Inc",
    date: "2026-07-26",
    author: "Demo Admin",
    type: "email",
    summary: "Shared draft findings; client approved Power BI Pro cleanup recommendations.",
  },
];

const SEED_PORTAL: PortalFinding[] = [
  { id: "pf1", title: "Downgrade 45 inactive E5 to E3", severity: "high", savings: 22500, status: "pending" },
  { id: "pf2", title: "Remove duplicate Power BI Pro licenses", severity: "medium", savings: 8400, status: "approved" },
  { id: "pf3", title: "Reclaim unused Teams Phone licenses", severity: "medium", savings: 4800, status: "pending" },
  { id: "pf4", title: "Consolidate Entra ID P2 for non-privileged users", severity: "high", savings: 15200, status: "deferred" },
];

export async function fetchLicenseInventory(): Promise<{
  licenses: LicenseInventoryItem[];
  readiness: string | null;
}> {
  const { audit } = await fetchAuditDetail(DEMO_CONTOSO_AUDIT_ID);
  const snapshots = audit?.licenseSnapshots;
  if (snapshots && snapshots.length > 0) {
    const licenses: LicenseInventoryItem[] = snapshots.map((s) => {
      const unused = Math.max(0, Math.round(s.quantity * 0.12));
      return {
        sku: s.sku,
        productFamily: s.sku.includes("Azure") || s.sku.includes("Entra") ? "Entra" : "M365",
        quantity: s.quantity,
        assigned: s.quantity - unused,
        unused,
        costMonthly: s.costMonthly,
        overlapRisk: unused > 15 ? "high" : unused > 8 ? "medium" : "low",
      };
    });
    return { licenses, readiness: "live" };
  }
  return { licenses: SEED_LICENSES, readiness: "stub" };
}

export async function fetchUtilization(): Promise<{
  rows: UtilizationRow[];
  readiness: string | null;
}> {
  return { rows: SEED_UTILIZATION, readiness: "stub" };
}

export async function fetchSavingsRoadmap(): Promise<{
  phases: RoadmapPhase[];
  readiness: string | null;
}> {
  const { recommendations, readiness } = await fetchRecommendations();
  if (recommendations.length > 0 && readiness === "live") {
    const total = recommendations.reduce((sum, r) => sum + r.savings, 0);
    return {
      phases: [
        {
          id: "live-1",
          phase: "Approved & quick wins",
          window: "0–30 days",
          effort: "Low",
          savingsAnnual: Math.round(total * 0.35),
          status: "in_progress",
          items: recommendations.slice(0, 2).map((r) => r.title),
        },
        {
          id: "live-2",
          phase: "Right-sizing",
          window: "30–90 days",
          effort: "Medium",
          savingsAnnual: Math.round(total * 0.4),
          status: "planned",
          items: recommendations.slice(2, 4).map((r) => r.title),
        },
        ...SEED_ROADMAP.slice(2),
      ],
      readiness,
    };
  }
  return { phases: SEED_ROADMAP, readiness: readiness ?? "stub" };
}

export async function fetchAdvisoryNotes(): Promise<{
  notes: AdvisoryNote[];
  readiness: string | null;
}> {
  return { notes: SEED_ADVISORY, readiness: "stub" };
}

export async function fetchPortalFindings(): Promise<{
  findings: PortalFinding[];
  clientName: string;
  readiness: string | null;
}> {
  const { recommendations, readiness } = await fetchRecommendations();
  if (recommendations.length > 0) {
    return {
      clientName: "Contoso Ltd",
      readiness: readiness ?? "stub",
      findings: recommendations.map((r) => ({
        id: r.id,
        title: r.title,
        severity: r.confidence >= 90 ? "high" : "medium",
        savings: r.savings,
        status:
          r.status === "approved"
            ? "approved"
            : r.status === "rejected"
              ? "deferred"
              : "pending",
      })),
    };
  }
  return { findings: SEED_PORTAL, clientName: "Contoso Ltd", readiness: "stub" };
}

export async function fetchComplianceOverview(): Promise<{
  findings: FindingItem[];
  readiness: string | null;
  summary: { red: number; amber: number; green: number; savings: number };
}> {
  const { findings, readiness } = await fetchFindings(DEMO_CONTOSO_AUDIT_ID);
  const summary = {
    red: findings.filter((f) => f.severity === "critical" || f.severity === "high").length,
    amber: findings.filter((f) => f.severity === "medium").length,
    green: findings.filter((f) => f.severity === "low" || f.severity === "info").length,
    savings: findings.reduce((sum, f) => sum + f.savings, 0),
  };
  return { findings, readiness, summary };
}
