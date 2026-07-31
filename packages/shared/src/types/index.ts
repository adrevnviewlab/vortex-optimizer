import type {
  ApiClientStatus,
  ApiRecommendationStatus,
  AuditSource,
  AuditStatus,
  FindingCategory,
  FindingSeverity,
  IntegrationKey,
  OrgRegion,
  OrgRole,
  OrgTier,
  ReadinessLevel,
  ReportStatus,
  ReportType,
  ApiImplementationStatus,
} from "../constants/index.js";

export type ApiMeta = {
  readiness: ReadinessLevel;
};

export type ApiResponse<T> = {
  data: T;
  meta: ApiMeta;
};

export type UserDto = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
};

export type OrgMembershipDto = {
  orgId: string;
  role: OrgRole;
  joinedAt: string | null;
};

export type MeDto = {
  user: UserDto;
  memberships: OrgMembershipDto[];
  activeOrgId: string | null;
};

export type OrganizationDto = {
  id: string;
  name: string;
  slug: string;
  region: OrgRegion;
  tier: OrgTier;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummaryDto = {
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

export type ClientDto = {
  id: string;
  orgId: string;
  name: string;
  industry: string | null;
  employeeCount: number | null;
  renewalDate: string | null;
  region: OrgRegion;
  status: ApiClientStatus;
  createdAt: string;
  updatedAt: string;
};

export type AuditDto = {
  id: string;
  orgId: string;
  clientId: string | null;
  title: string;
  status: AuditStatus;
  source: AuditSource;
  spendTotal: number | null;
  savingsEstimate: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditDetailDto = AuditDto & {
  findingsCount: number;
  licenseSnapshotCount: number;
  findings: AuditFindingDto[];
  licenseSnapshots: LicenseSnapshotDto[];
};

export type AuditFindingDto = {
  id: string;
  auditId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string | null;
  affectedCount: number | null;
  savingsEstimate: number | null;
  sku: string | null;
};

export type LicenseSnapshotDto = {
  id: string;
  auditId: string;
  sku: string;
  quantity: number;
  assigned: number;
  costMonthly: number;
  capturedAt: string;
};

export type RecommendationDto = {
  id: string;
  auditId: string;
  findingId: string | null;
  priority: number;
  action: string;
  status: ApiRecommendationStatus;
  implementationStatus: ApiImplementationStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type LicenseMixDto = {
  segments: Array<{
    sku: string;
    quantity: number;
    costMonthly: number;
    percent: number;
  }>;
  totalMonthly: number;
};

export type OrgMemberDto = {
  userId: string;
  email: string;
  name: string | null;
  role: OrgRole;
  joinedAt: string | null;
  invitedAt: string | null;
};

export type OrgInviteDto = {
  id: string;
  email: string;
  role: OrgRole;
  expiresAt: string;
  token: string;
};

export type RenewalPlanDto = {
  id: string;
  orgId: string;
  clientId: string;
  renewalDate: string | null;
  scenarios: Array<Record<string, unknown>>;
  notes: string | null;
  alertDays: number[];
  createdAt: string;
  updatedAt: string;
};

export type ReportDto = {
  id: string;
  orgId: string;
  auditId: string;
  type: ReportType;
  status: ReportStatus;
  downloadUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditEventDto = {
  id: string;
  orgId: string;
  actorId: string | null;
  action: string;
  resource: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DemoSessionDto = {
  token: string;
  expiresAt: string;
};

export type BillingStatusDto = {
  connected: boolean;
  featureEnabled: boolean;
  message: string;
  plan?: string | null;
  portalAvailable?: boolean;
};

export type BillingCheckoutDto = {
  checkoutUrl: string;
  sessionId: string;
};

export type BillingPortalDto = {
  portalUrl: string;
};

export type MicrosoftIntegrationDto = {
  featureEnabled: boolean;
  configured: boolean;
  connected: boolean;
  status: ReadinessLevel;
  tenantId?: string;
  lastSyncAt?: string | null;
  lastError?: string | null;
  consentedAt?: string | null;
  syncedUsers?: number;
  syncedLicenses?: number;
  message?: string;
};

export type SessionBridgeResponseDto = {
  token: string;
  expiresAt: string;
  userId: string;
};

export type ReadinessCheckDto = {
  status: ReadinessLevel;
  integrations: Record<
    IntegrationKey,
    { status: ReadinessLevel; message?: string }
  >;
};

export type CreateClientInput = {
  name: string;
  industry?: string;
  employeeCount?: number;
  renewalDate?: string;
  region?: OrgRegion;
  status?: ApiClientStatus;
};
