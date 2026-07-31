import { z } from "zod";

export const RulesConfigSchema = z.object({
  unused_days_threshold: z.number().int().positive().default(90),
  overlicense_buffer_percent: z.number().min(0).max(100).default(5),
  premium_skus: z
    .array(z.string())
    .default([
      "Microsoft 365 E5",
      "Office 365 E5",
      "EMS E5",
      "Microsoft 365 Audio Conferencing",
    ]),
  duplicate_categories: z
    .record(z.array(z.string()))
    .default({
      m365_enterprise: [
        "Microsoft 365 E3",
        "Microsoft 365 E5",
        "Office 365 E3",
        "Office 365 E5",
      ],
    }),
  min_savings_floor_usd: z.number().nonnegative().default(500),
  exclude_departments: z.array(z.string()).default(["service accounts"]),
  confidence_modifiers: z
    .object({
      incomplete_usage_data: z.number().default(-1),
    })
    .default({ incomplete_usage_data: -1 }),
});

export type RulesConfig = z.infer<typeof RulesConfigSchema>;

export const DEFAULT_RULES_CONFIG: RulesConfig = RulesConfigSchema.parse({});

export function mergeRulesConfig(
  orgDefault: Partial<RulesConfig> = {},
  auditOverride: Partial<RulesConfig> = {},
): RulesConfig {
  return RulesConfigSchema.parse({
    ...DEFAULT_RULES_CONFIG,
    ...orgDefault,
    ...auditOverride,
    duplicate_categories: {
      ...DEFAULT_RULES_CONFIG.duplicate_categories,
      ...orgDefault.duplicate_categories,
      ...auditOverride.duplicate_categories,
    },
    confidence_modifiers: {
      ...DEFAULT_RULES_CONFIG.confidence_modifiers,
      ...orgDefault.confidence_modifiers,
      ...auditOverride.confidence_modifiers,
    },
  });
}
