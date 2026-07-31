/** Traffic light readiness states for module integration */
export type ModuleReadiness = "live" | "stub" | "blocked";

export type ModulePhase = "P0" | "P1" | "P2" | "post-GA";

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  phase: ModulePhase;
  /** Target milestone % when module should reach P0/P1/P2 target */
  targetMilestone: number;
  /** Current readiness at P0 end (from plan) */
  readinessAtP0End: ModuleReadiness;
  /** Current live readiness (updated as implementation progresses) */
  currentReadiness: ModuleReadiness;
}

/** All 30 modules from COMPLETION-PLAN Part 1 §2 (M01–M30) */
export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: "M01",
    name: "Auth & Identity",
    description: "Email/password + SSO-ready, MFA optional",
    phase: "P0",
    targetMilestone: 5,
    readinessAtP0End: "live",
    currentReadiness: "stub",
  },
  {
    id: "M02",
    name: "Organization (Consultancy)",
    description: "Vortex tenant, branding, US/USD defaults",
    phase: "P0",
    targetMilestone: 5,
    readinessAtP0End: "live",
    currentReadiness: "stub",
  },
  {
    id: "M03",
    name: "Client / Org (Customer)",
    description: "End-customer org record, industry, FTE, renewal date",
    phase: "P0",
    targetMilestone: 10,
    readinessAtP0End: "live",
    currentReadiness: "live",
  },
  {
    id: "M04",
    name: "User & RBAC",
    description: "Consultant, Analyst, Client Viewer roles",
    phase: "P0",
    targetMilestone: 10,
    readinessAtP0End: "live",
    currentReadiness: "live",
  },
  {
    id: "M05",
    name: "Consultation Intake",
    description: "Discovery questionnaire, scope, goals",
    phase: "P0",
    targetMilestone: 10,
    readinessAtP0End: "stub",
    currentReadiness: "stub",
  },
  {
    id: "M06",
    name: "Data Upload",
    description: "CSV/XLSX license + usage files, mapping wizard",
    phase: "P0",
    targetMilestone: 15,
    readinessAtP0End: "live",
    currentReadiness: "stub",
  },
  {
    id: "M07",
    name: "License Inventory",
    description: "Normalized SKU catalog, quantities, costs",
    phase: "P0",
    targetMilestone: 20,
    readinessAtP0End: "live",
    currentReadiness: "live",
  },
  {
    id: "M08",
    name: "Utilization Ingest",
    description: "Active users, last sign-in, service usage",
    phase: "P0",
    targetMilestone: 20,
    readinessAtP0End: "stub",
    currentReadiness: "stub",
  },
  {
    id: "M09",
    name: "Rules Engine",
    description: "Unused, duplicate, premium-on-inactive, overlicensed",
    phase: "P0",
    targetMilestone: 25,
    readinessAtP0End: "live",
    currentReadiness: "live",
  },
  {
    id: "M10",
    name: "Recommendations",
    description: "Ranked opportunities with $ impact",
    phase: "P0",
    targetMilestone: 30,
    readinessAtP0End: "live",
    currentReadiness: "live",
  },
  {
    id: "M11",
    name: "Report Builder",
    description: "Sectioned report, PDF export",
    phase: "P0",
    targetMilestone: 40,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M12",
    name: "Executive Summary Generator",
    description: "Narrative + headline savings",
    phase: "P0",
    targetMilestone: 35,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M13",
    name: "Cost Saving Roadmap",
    description: "Phased implementation timeline",
    phase: "P1",
    targetMilestone: 45,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M14",
    name: "Presentation Export",
    description: "PPTX/PDF slides from report",
    phase: "P1",
    targetMilestone: 45,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M15",
    name: "Implementation Tracker",
    description: "Accept/reject/defer recs, owner, status",
    phase: "P1",
    targetMilestone: 50,
    readinessAtP0End: "live",
    currentReadiness: "stub",
  },
  {
    id: "M16",
    name: "Renewal Planning",
    description: "Calendar, scenarios, deadline alerts",
    phase: "P1",
    targetMilestone: 55,
    readinessAtP0End: "live",
    currentReadiness: "blocked",
  },
  {
    id: "M17",
    name: "Advisory Workspace",
    description: "Threaded notes, meeting log, attachments",
    phase: "P1",
    targetMilestone: 60,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M18",
    name: "Savings Projection Model",
    description: "12/24/36 mo projections, assumptions",
    phase: "P1",
    targetMilestone: 40,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M19",
    name: "Allocation Matrix",
    description: "User ↔ license assignment view",
    phase: "P1",
    targetMilestone: 40,
    readinessAtP0End: "blocked",
    currentReadiness: "blocked",
  },
  {
    id: "M20",
    name: "Future Purchasing Plan",
    description: "SKU downgrade/upgrade schedule",
    phase: "P1",
    targetMilestone: 45,
    readinessAtP0End: "blocked",
    currentReadiness: "blocked",
  },
  {
    id: "M21",
    name: "Consultant Dashboard",
    description: "Pipeline, active audits, savings YTD",
    phase: "P1",
    targetMilestone: 70,
    readinessAtP0End: "stub",
    currentReadiness: "stub",
  },
  {
    id: "M22",
    name: "Client Portal",
    description: "Read-only reports + approval flows",
    phase: "P1",
    targetMilestone: 75,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M23",
    name: "Productized Packages",
    description: "Audit / Retainer SKUs (internal)",
    phase: "P1",
    targetMilestone: 65,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M24",
    name: "Stripe Billing",
    description: "Subscriptions + one-time projects",
    phase: "P2",
    targetMilestone: 90,
    readinessAtP0End: "live",
    currentReadiness: "blocked",
  },
  {
    id: "M25",
    name: "Compliance Review",
    description: "EA/true-up checklist",
    phase: "P2",
    targetMilestone: 80,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M26",
    name: "Workshop Templates",
    description: "Kickoff decks, agendas",
    phase: "P2",
    targetMilestone: 85,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M27",
    name: "Referral & NPS",
    description: "Post-project survey, referral capture",
    phase: "P2",
    targetMilestone: 95,
    readinessAtP0End: "stub",
    currentReadiness: "blocked",
  },
  {
    id: "M28",
    name: "Audit Log & Compliance",
    description: "SOC2-ready activity log",
    phase: "P2",
    targetMilestone: 95,
    readinessAtP0End: "live",
    currentReadiness: "blocked",
  },
  {
    id: "M29",
    name: "Multi-geo Disclaimer",
    description: "Partner routing for non-US",
    phase: "P2",
    targetMilestone: 95,
    readinessAtP0End: "live",
    currentReadiness: "blocked",
  },
  {
    id: "M30",
    name: "API Integrations (Microsoft)",
    description: "Graph read-only (Phase 2)",
    phase: "P2",
    targetMilestone: 100,
    readinessAtP0End: "blocked",
    currentReadiness: "blocked",
  },
];

export interface ReadinessChecklistItem {
  moduleId: string;
  name: string;
  readiness: ModuleReadiness;
  phase: ModulePhase;
  targetMilestone: number;
}

export interface ReadinessChecklist {
  generatedAt: string;
  modules: ReadinessChecklistItem[];
  summary: {
    total: number;
    live: number;
    stub: number;
    blocked: number;
  };
}

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id);
}

export function buildReadinessChecklist(): ReadinessChecklist {
  const modules: ReadinessChecklistItem[] = MODULE_REGISTRY.map((m) => ({
    moduleId: m.id,
    name: m.name,
    readiness: m.currentReadiness,
    phase: m.phase,
    targetMilestone: m.targetMilestone,
  }));

  const summary = {
    total: modules.length,
    live: modules.filter((m) => m.readiness === "live").length,
    stub: modules.filter((m) => m.readiness === "stub").length,
    blocked: modules.filter((m) => m.readiness === "blocked").length,
  };

  return {
    generatedAt: new Date().toISOString(),
    modules,
    summary,
  };
}

export function getModulesByReadiness(
  readiness: ModuleReadiness,
): ModuleDefinition[] {
  return MODULE_REGISTRY.filter((m) => m.currentReadiness === readiness);
}
