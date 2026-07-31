CREATE TYPE "public"."graph_connection_status" AS ENUM('pending', 'active', 'disconnected', 'error');--> statement-breakpoint
CREATE TYPE "public"."graph_sync_job_type" AS ENUM('full', 'delta', 'users', 'licenses');--> statement-breakpoint
CREATE TYPE "public"."graph_sync_job_status" AS ENUM('pending', 'running', 'complete', 'failed');--> statement-breakpoint
CREATE TABLE "graph_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"tenant_id" text NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text,
	"scopes" text[] DEFAULT '{}'::text[] NOT NULL,
	"consented_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"status" "graph_connection_status" DEFAULT 'pending' NOT NULL,
	"last_sync_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "graph_connections_org_id_unique" UNIQUE("org_id")
);
--> statement-breakpoint
CREATE TABLE "graph_sync_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"type" "graph_sync_job_type" DEFAULT 'full' NOT NULL,
	"status" "graph_sync_job_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"records_processed" integer DEFAULT 0 NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "synced_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"graph_id" text NOT NULL,
	"upn" text NOT NULL,
	"display_name" text,
	"assigned_licenses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_seen_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "synced_users_org_id_graph_id_unique" UNIQUE("org_id","graph_id")
);
--> statement-breakpoint
CREATE TABLE "synced_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"sku_id" text NOT NULL,
	"sku_part_number" text NOT NULL,
	"sku_name" text,
	"total" integer DEFAULT 0 NOT NULL,
	"consumed" integer DEFAULT 0 NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "synced_licenses_org_id_sku_id_unique" UNIQUE("org_id","sku_id")
);
--> statement-breakpoint
ALTER TABLE "graph_connections" ADD CONSTRAINT "graph_connections_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_sync_jobs" ADD CONSTRAINT "graph_sync_jobs_connection_id_graph_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."graph_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_sync_jobs" ADD CONSTRAINT "graph_sync_jobs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synced_users" ADD CONSTRAINT "synced_users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synced_licenses" ADD CONSTRAINT "synced_licenses_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
