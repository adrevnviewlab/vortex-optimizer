import { z } from "zod";

/** Analytics event names from COMPLETION-PLAN Part 1 §9 */

// Identity & funnel
export const SignupCompletedEventSchema = z.object({
  name: z.literal("signup.completed"),
  org_id: z.string().uuid(),
  role: z.string(),
});

export const ClientCreatedEventSchema = z.object({
  name: z.literal("client.created"),
  client_id: z.string().uuid(),
  employee_count: z.number().int().positive(),
  agreement_type: z.string(),
});

export const IntakeCompletedEventSchema = z.object({
  name: z.literal("intake.completed"),
  audit_id: z.string().uuid(),
  target_savings_pct: z.number().optional(),
});

// Data & analysis
export const UploadCompletedEventSchema = z.object({
  name: z.literal("upload.completed"),
  audit_id: z.string().uuid(),
  file_type: z.enum(["csv", "xlsx"]),
  row_count: z.number().int().nonnegative(),
  error_count: z.number().int().nonnegative(),
});

export const AnalysisStartedEventSchema = z.object({
  name: z.literal("analysis.started"),
  audit_id: z.string().uuid(),
  rule_count: z.number().int().positive(),
});

export const AnalysisCompletedEventSchema = z.object({
  name: z.literal("analysis.completed"),
  audit_id: z.string().uuid(),
  findings_count: z.number().int().nonnegative(),
  savings_usd: z.number().nonnegative(),
  duration_ms: z.number().int().nonnegative(),
});

export const RecommendationApprovedEventSchema = z.object({
  name: z.literal("recommendation.approved"),
  rec_id: z.string().uuid(),
  rule_id: z.string(),
  savings_usd: z.number().nonnegative(),
});

// Delivery
export const ReportGeneratedEventSchema = z.object({
  name: z.literal("report.generated"),
  audit_id: z.string().uuid(),
  version: z.number().int().positive(),
  section_count: z.number().int().nonnegative(),
});

export const ReportDownloadedEventSchema = z.object({
  name: z.literal("report.downloaded"),
  audit_id: z.string().uuid(),
  actor_role: z.string(),
});

export const PresentationExportedEventSchema = z.object({
  name: z.literal("presentation.exported"),
  audit_id: z.string().uuid(),
  format: z.enum(["pptx", "pdf"]),
});

// Implementation & outcomes
export const RecommendationAcceptedEventSchema = z.object({
  name: z.literal("recommendation.accepted"),
  rec_id: z.string().uuid(),
  client_id: z.string().uuid(),
});

export const RecommendationImplementedEventSchema = z.object({
  name: z.literal("recommendation.implemented"),
  rec_id: z.string().uuid(),
  realized_savings_usd: z.number().nonnegative(),
});

export const RenewalAlertSentEventSchema = z.object({
  name: z.literal("renewal.alert_sent"),
  client_id: z.string().uuid(),
  days_until_renewal: z.number().int(),
});

// Revenue & satisfaction
export const PaymentCompletedEventSchema = z.object({
  name: z.literal("payment.completed"),
  engagement_id: z.string().uuid(),
  sku: z.string(),
  amount_usd: z.number().nonnegative(),
});

export const NpsSubmittedEventSchema = z.object({
  name: z.literal("nps.submitted"),
  client_id: z.string().uuid(),
  score: z.number().int().min(0).max(10),
  audit_id: z.string().uuid().optional(),
});

export const ReferralCapturedEventSchema = z.object({
  name: z.literal("referral.captured"),
  source_client_id: z.string().uuid(),
});

export const AuditStatusChangedEventSchema = z.object({
  name: z.literal("audit.status_changed"),
  audit_id: z.string().uuid(),
  from_status: z.string(),
  to_status: z.string(),
});

export const ClientActivatedEventSchema = z.object({
  name: z.literal("client.activated"),
  client_id: z.string().uuid(),
});

export const AnalyticsEventSchema = z.discriminatedUnion("name", [
  SignupCompletedEventSchema,
  ClientCreatedEventSchema,
  ClientActivatedEventSchema,
  IntakeCompletedEventSchema,
  UploadCompletedEventSchema,
  AnalysisStartedEventSchema,
  AnalysisCompletedEventSchema,
  RecommendationApprovedEventSchema,
  ReportGeneratedEventSchema,
  ReportDownloadedEventSchema,
  PresentationExportedEventSchema,
  RecommendationAcceptedEventSchema,
  RecommendationImplementedEventSchema,
  RenewalAlertSentEventSchema,
  PaymentCompletedEventSchema,
  NpsSubmittedEventSchema,
  ReferralCapturedEventSchema,
  AuditStatusChangedEventSchema,
]);

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type AnalyticsEventName = AnalyticsEvent["name"];

/** All supported event names for instrumentation validation */
export const ANALYTICS_EVENT_NAMES = [
  "signup.completed",
  "client.created",
  "client.activated",
  "intake.completed",
  "upload.completed",
  "analysis.started",
  "analysis.completed",
  "recommendation.approved",
  "report.generated",
  "report.downloaded",
  "presentation.exported",
  "recommendation.accepted",
  "recommendation.implemented",
  "renewal.alert_sent",
  "payment.completed",
  "nps.submitted",
  "referral.captured",
  "audit.status_changed",
] as const satisfies readonly AnalyticsEventName[];

export function parseAnalyticsEvent(payload: unknown): AnalyticsEvent {
  return AnalyticsEventSchema.parse(payload);
}

export function createAnalyticsEvent<T extends AnalyticsEvent>(
  event: T,
): T & { timestamp: string } {
  return {
    ...event,
    timestamp: new Date().toISOString(),
  };
}
