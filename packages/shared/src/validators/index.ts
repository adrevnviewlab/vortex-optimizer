import { z } from "zod";
import {
  AUDIT_SOURCES,
  AUDIT_STATUSES,
  CLIENT_STATUSES,
  FINDING_CATEGORIES,
  FINDING_SEVERITIES,
  ORG_REGIONS,
  ORG_ROLES,
  READINESS_LEVELS,
  RECOMMENDATION_STATUSES,
} from "../constants/index.js";

export const uuidSchema = z.string().uuid();

export const sessionBridgeSchema = z.object({
  sessionToken: z.string().min(1),
  activeOrgId: uuidSchema.optional(),
});

export const orgIdParamSchema = z.object({
  orgId: uuidSchema,
});

export const auditIdParamSchema = z.object({
  orgId: uuidSchema,
  id: uuidSchema,
});

export const createClientSchema = z.object({
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional(),
  employeeCount: z.number().int().positive().optional(),
  renewalDate: z.string().optional(),
  region: z.enum(ORG_REGIONS).default("US"),
  status: z.enum(CLIENT_STATUSES).default("prospect"),
});

export const orgRoleSchema = z.enum(ORG_ROLES);
export const orgRegionSchema = z.enum(ORG_REGIONS);
export const auditStatusSchema = z.enum(AUDIT_STATUSES);
export const auditSourceSchema = z.enum(AUDIT_SOURCES);
export const findingCategorySchema = z.enum(FINDING_CATEGORIES);
export const findingSeveritySchema = z.enum(FINDING_SEVERITIES);
export const recommendationStatusSchema = z.enum(RECOMMENDATION_STATUSES);
export const readinessLevelSchema = z.enum(READINESS_LEVELS);

export * from "./pagination.js";

