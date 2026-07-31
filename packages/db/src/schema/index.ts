import {
  ORG_REGIONS,
  ORG_ROLES,
  ORG_TIERS,
  AUDIT_STATUSES,
  AUDIT_SOURCES,
  FINDING_CATEGORIES,
  FINDING_SEVERITIES,
  RECOMMENDATION_STATUSES,
  CLIENT_STATUSES,
  IMPLEMENTATION_STATUSES,
  REPORT_STATUSES,
  REPORT_TYPES,
  GRAPH_CONNECTION_STATUSES,
} from "@vorzop/shared";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  numeric,
  primaryKey,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

export const orgRegionEnum = pgEnum("org_region", ORG_REGIONS);
export const orgTierEnum = pgEnum("org_tier", ORG_TIERS);
export const orgRoleEnum = pgEnum("org_role", ORG_ROLES);
export const auditStatusEnum = pgEnum("audit_status", AUDIT_STATUSES);
export const auditSourceEnum = pgEnum("audit_source", AUDIT_SOURCES);
export const findingCategoryEnum = pgEnum("finding_category", FINDING_CATEGORIES);
export const findingSeverityEnum = pgEnum("finding_severity", FINDING_SEVERITIES);
export const recommendationStatusEnum = pgEnum(
  "recommendation_status",
  RECOMMENDATION_STATUSES,
);
export const clientStatusEnum = pgEnum("client_status", CLIENT_STATUSES);
export const implementationStatusEnum = pgEnum(
  "implementation_status",
  IMPLEMENTATION_STATUSES,
);
export const reportStatusEnum = pgEnum("report_status", REPORT_STATUSES);
export const reportTypeEnum = pgEnum("report_type", REPORT_TYPES);
export const graphConnectionStatusEnum = pgEnum(
  "graph_connection_status",
  GRAPH_CONNECTION_STATUSES,
);
export const graphSyncJobTypeEnum = pgEnum("graph_sync_job_type", [
  "full",
  "delta",
  "users",
  "licenses",
]);
export const graphSyncJobStatusEnum = pgEnum("graph_sync_job_status", [
  "pending",
  "running",
  "complete",
  "failed",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  region: orgRegionEnum("region").notNull().default("US"),
  tier: orgTierEnum("tier").notNull().default("consultancy"),
  settings: jsonb("settings").notNull().default({}),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: orgRoleEnum("role").notNull().default("viewer"),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.orgId, table.userId] })],
);

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  industry: text("industry"),
  employeeCount: integer("employee_count"),
  renewalDate: timestamp("renewal_date", { withTimezone: true }),
  region: orgRegionEnum("region").notNull().default("US"),
  status: clientStatusEnum("status").notNull().default("prospect"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const audits = pgTable("audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  status: auditStatusEnum("status").notNull().default("draft"),
  source: auditSourceEnum("source").notNull().default("manual"),
  spendTotal: numeric("spend_total", { precision: 14, scale: 2 }),
  savingsEstimate: numeric("savings_estimate", { precision: 14, scale: 2 }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditFindings = pgTable("audit_findings", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: uuid("audit_id")
    .notNull()
    .references(() => audits.id, { onDelete: "cascade" }),
  category: findingCategoryEnum("category").notNull(),
  severity: findingSeverityEnum("severity").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  affectedCount: integer("affected_count"),
  savingsEstimate: numeric("savings_estimate", { precision: 14, scale: 2 }),
  sku: text("sku"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: uuid("audit_id")
    .notNull()
    .references(() => audits.id, { onDelete: "cascade" }),
  findingId: uuid("finding_id").references(() => auditFindings.id, {
    onDelete: "set null",
  }),
  priority: integer("priority").notNull().default(3),
  action: text("action").notNull(),
  status: recommendationStatusEnum("status").notNull().default("pending"),
  implementationStatus: implementationStatusEnum("implementation_status")
    .notNull()
    .default("pending"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organizationInvites = pgTable("organization_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: orgRoleEnum("role").notNull().default("viewer"),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const renewalPlans = pgTable("renewal_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  renewalDate: timestamp("renewal_date", { withTimezone: true }),
  scenarios: jsonb("scenarios").notNull().default([]),
  notes: text("notes"),
  alertDays: integer("alert_days").array().notNull().default([90, 180]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  auditId: uuid("audit_id")
    .notNull()
    .references(() => audits.id, { onDelete: "cascade" }),
  type: reportTypeEnum("type").notNull().default("audit_summary"),
  status: reportStatusEnum("status").notNull().default("complete"),
  storageKey: text("storage_key"),
  downloadUrl: text("download_url"),
  metadata: jsonb("metadata").notNull().default({}),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const demoSessions = pgTable("demo_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const licenseSnapshots = pgTable("license_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  auditId: uuid("audit_id")
    .notNull()
    .references(() => audits.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  quantity: integer("quantity").notNull(),
  assigned: integer("assigned").notNull().default(0),
  costMonthly: numeric("cost_monthly", { precision: 14, scale: 2 }).notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usageRecords = pgTable("usage_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
  auditId: uuid("audit_id").references(() => audits.id, { onDelete: "cascade" }),
  sku: text("sku").notNull(),
  activeUsers: integer("active_users").notNull().default(0),
  licensedUsers: integer("licensed_users").notNull().default(0),
  lastSignInDays: integer("last_sign_in_days"),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb("metadata").notNull().default({}),
});

export const graphConnections = pgTable("graph_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  tenantId: text("tenant_id").notNull(),
  accessTokenEncrypted: text("access_token_encrypted").notNull(),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  scopes: text("scopes").array().notNull().default([]),
  consentedAt: timestamp("consented_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  status: graphConnectionStatusEnum("status").notNull().default("pending"),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const graphSyncJobs = pgTable("graph_sync_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id")
    .notNull()
    .references(() => graphConnections.id, { onDelete: "cascade" }),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  type: graphSyncJobTypeEnum("type").notNull().default("full"),
  status: graphSyncJobStatusEnum("status").notNull().default("pending"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  recordsProcessed: integer("records_processed").notNull().default(0),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const syncedUsers = pgTable(
  "synced_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    graphId: text("graph_id").notNull(),
    upn: text("upn").notNull(),
    displayName: text("display_name"),
    assignedLicenses: jsonb("assigned_licenses").notNull().default([]),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("synced_users_org_id_graph_id_unique").on(table.orgId, table.graphId)],
);

export const syncedLicenses = pgTable(
  "synced_licenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    skuId: text("sku_id").notNull(),
    skuPartNumber: text("sku_part_number").notNull(),
    skuName: text("sku_name"),
    total: integer("total").notNull().default(0),
    consumed: integer("consumed").notNull().default(0),
    syncedAt: timestamp("synced_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("synced_licenses_org_id_sku_id_unique").on(table.orgId, table.skuId)],
);
