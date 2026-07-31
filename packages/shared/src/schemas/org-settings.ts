import { z } from "zod";
import { RulesConfigSchema } from "../schemas/rules-config.js";
import { ORG_REGIONS } from "../constants/index.js";

export const orgModuleTogglesSchema = z.record(z.string(), z.boolean());

export const orgSettingsSchema = z.object({
  modules: orgModuleTogglesSchema.optional(),
  rules_config: RulesConfigSchema.partial().optional(),
  multi_geo_disclaimer: z.string().max(2000).optional(),
  region_label: z.string().max(100).optional(),
});

export type OrgSettings = z.infer<typeof orgSettingsSchema>;

export const patchOrgSettingsSchema = orgSettingsSchema.partial();

export const updateClientSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  industry: z.string().max(100).nullable().optional(),
  employeeCount: z.number().int().positive().nullable().optional(),
  renewalDate: z.string().nullable().optional(),
  region: z.enum(ORG_REGIONS).optional(),
  status: z.enum(["prospect", "active", "inactive"]).optional(),
});

export const createMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "analyst", "viewer", "client_readonly"]).default("viewer"),
});

export const patchMemberSchema = z.object({
  role: z.enum(["owner", "admin", "analyst", "viewer", "client_readonly"]),
});

export const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "analyst", "viewer", "client_readonly"]).default("viewer"),
});

export const renewalScenarioSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  projected_savings_annual: z.number().nonnegative().optional(),
  sku_changes: z
    .array(
      z.object({
        sku: z.string(),
        from_quantity: z.number().int().nonnegative(),
        to_quantity: z.number().int().nonnegative(),
      }),
    )
    .optional(),
});

export const patchRenewalPlanSchema = z.object({
  renewalDate: z.string().nullable().optional(),
  scenarios: z.array(renewalScenarioSchema).optional(),
  notes: z.string().nullable().optional(),
  alertDays: z.array(z.number().int().positive()).optional(),
});

export const patchRecommendationSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected", "deferred"]).optional(),
  implementation_status: z
    .enum(["pending", "accepted", "deferred", "implemented"])
    .optional(),
  owner: z.string().max(200).optional(),
  target_date: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export const createReportSchema = z.object({
  type: z.enum(["audit_summary", "executive_brief"]).default("audit_summary"),
});

export const implementationStatusSchema = z.enum([
  "pending",
  "accepted",
  "deferred",
  "implemented",
]);
