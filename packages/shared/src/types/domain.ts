import { z } from "zod";

/** Microsoft agreement types for client orgs */
export const AgreementTypeSchema = z.enum(["EA", "CSP", "OV", "mixed"]);
export type AgreementType = z.infer<typeof AgreementTypeSchema>;

export const ClientStatusSchema = z.enum(["prospect", "active", "churned"]);
export type ClientStatus = z.infer<typeof ClientStatusSchema>;

export const ClientSchema = z.object({
  id: z.string().uuid(),
  consultancy_id: z.string().uuid(),
  name: z.string().min(1),
  industry: z.string().optional(),
  employee_count: z.number().int().positive(),
  agreement_type: AgreementTypeSchema,
  primary_renewal_date: z.string().date().optional(),
  annual_microsoft_spend_est: z.number().nonnegative().optional(),
  status: ClientStatusSchema.default("active"),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Client = z.infer<typeof ClientSchema>;

/** Audit lifecycle stages (P0 subset through report_delivered) */
export const AuditLifecycleSchema = z.enum([
  "consultation",
  "data_collection",
  "data_received",
  "analyzing",
  "analysis_complete",
  "report_draft",
  "report_delivered",
  "implementation",
  "closed",
]);
export type AuditLifecycle = z.infer<typeof AuditLifecycleSchema>;

/** P0 audit lifecycle transitions */
export const AUDIT_LIFECYCLE_ORDER: AuditLifecycle[] = [
  "consultation",
  "data_collection",
  "data_received",
  "analyzing",
  "analysis_complete",
  "report_draft",
  "report_delivered",
  "implementation",
  "closed",
];

export const AuditSchema = z.object({
  id: z.string().uuid(),
  org_id: z.string().uuid(),
  client_id: z.string().uuid(),
  name: z.string().min(1),
  status: AuditLifecycleSchema,
  assigned_consultant_id: z.string().uuid().optional(),
  data_period_start: z.string().date().optional(),
  data_period_end: z.string().date().optional(),
  total_license_cost_annual: z.number().nonnegative().default(0),
  total_identified_savings: z.number().nonnegative().default(0),
  savings_percent: z.number().min(0).max(100).default(0),
  rules_config: z.record(z.unknown()).optional(),
  data_quality: z.enum(["complete", "incomplete"]).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Audit = z.infer<typeof AuditSchema>;

export const LicenseRecordSchema = z.object({
  id: z.string().uuid(),
  audit_id: z.string().uuid(),
  sku: z.string().min(1),
  sku_normalized: z.string().optional(),
  quantity: z.number().int().nonnegative(),
  unit_cost_annual: z.number().nonnegative(),
  extended_cost_annual: z.number().nonnegative().optional(),
  contract_id: z.string().optional(),
  source_file_id: z.string().uuid().optional(),
});
export type LicenseRecord = z.infer<typeof LicenseRecordSchema>;

export const UsageRecordSchema = z.object({
  id: z.string().uuid(),
  audit_id: z.string().uuid(),
  user_principal: z.string().email(),
  assigned_skus: z.array(z.string()),
  last_activity_date: z.string().date().nullable(),
  account_enabled: z.boolean(),
  department: z.string().optional(),
});
export type UsageRecord = z.infer<typeof UsageRecordSchema>;

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const RecommendationStatusSchema = z.enum(["draft", "approved", "rejected"]);
export type RecommendationStatus = z.infer<typeof RecommendationStatusSchema>;

export const ImplementationStatusSchema = z.enum([
  "pending",
  "accepted",
  "deferred",
  "implemented",
]);
export type ImplementationStatus = z.infer<typeof ImplementationStatusSchema>;

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  audit_id: z.string().uuid(),
  org_id: z.string().uuid(),
  rule_id: z.string(),
  title: z.string(),
  description: z.string(),
  affected_count: z.number().int().nonnegative(),
  estimated_savings_annual: z.number().nonnegative(),
  confidence: ConfidenceSchema,
  status: RecommendationStatusSchema.default("draft"),
  implementation_status: ImplementationStatusSchema.default("pending"),
  owner: z.string().optional(),
  target_date: z.string().date().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

export const RuleFindingSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type RuleFindingSeverity = z.infer<typeof RuleFindingSeveritySchema>;

export const FindingSchema = z.object({
  id: z.string().uuid(),
  audit_id: z.string().uuid(),
  rule_id: z.string(),
  title: z.string(),
  description: z.string(),
  users: z.array(z.string()),
  skus: z.array(z.string()),
  evidence: z.array(z.string()),
  affected_count: z.number().int().nonnegative(),
  savings_usd: z.number().nonnegative(),
  confidence: ConfidenceSchema,
  severity: RuleFindingSeveritySchema,
  metadata: z.record(z.unknown()).optional(),
});
export type Finding = z.infer<typeof FindingSchema>;
