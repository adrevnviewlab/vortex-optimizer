export const ORG_ROLES = [
  "owner",
  "admin",
  "analyst",
  "viewer",
  "client_readonly",
] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

export const ORG_TIERS = ["consultancy", "client"] as const;
export type OrgTier = (typeof ORG_TIERS)[number];

export const ORG_REGIONS = ["US", "EU", "UK", "APAC"] as const;
export type OrgRegion = (typeof ORG_REGIONS)[number];

export const AUDIT_STATUSES = [
  "draft",
  "in_progress",
  "review",
  "completed",
  "archived",
] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export const AUDIT_SOURCES = ["manual", "csv", "seed"] as const;
export type AuditSource = (typeof AUDIT_SOURCES)[number];

export const FINDING_CATEGORIES = [
  "license",
  "usage",
  "compliance",
  "overlap",
] as const;
export type FindingCategory = (typeof FINDING_CATEGORIES)[number];

export const FINDING_SEVERITIES = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export const RECOMMENDATION_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "deferred",
] as const;
export type ApiRecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

export const IMPLEMENTATION_STATUSES = [
  "pending",
  "accepted",
  "deferred",
  "implemented",
] as const;
export type ApiImplementationStatus = (typeof IMPLEMENTATION_STATUSES)[number];

export const REPORT_STATUSES = [
  "pending",
  "generating",
  "complete",
  "failed",
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_TYPES = ["audit_summary", "executive_brief"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const CLIENT_STATUSES = ["prospect", "active", "inactive"] as const;
export type ApiClientStatus = (typeof CLIENT_STATUSES)[number];

export const READINESS_LEVELS = ["live", "stub", "blocked"] as const;
export type ReadinessLevel = (typeof READINESS_LEVELS)[number];

export const INTEGRATION_KEYS = [
  "database",
  "auth",
  "storage",
  "email",
  "graph",
  "stripe",
  "pdf",
] as const;
export type IntegrationKey = (typeof INTEGRATION_KEYS)[number];

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_TIMEZONE = "America/New_York";

export const GRAPH_CONNECTION_STATUSES = [
  "pending",
  "active",
  "disconnected",
  "error",
] as const;
export type GraphConnectionStatus = (typeof GRAPH_CONNECTION_STATUSES)[number];

export const GRAPH_SYNC_SCOPES = [
  "offline_access",
  "Organization.Read.All",
  "User.Read.All",
  "Directory.Read.All",
  "SubscribedSku.Read.All",
] as const;

export * from "./ms-skus.js";
