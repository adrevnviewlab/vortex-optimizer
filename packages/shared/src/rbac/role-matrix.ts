/** Organization member roles (P0 product matrix) */
export const OrgRoleSchema = [
  "owner",
  "admin",
  "consultant",
  "analyst",
  "client_viewer",
] as const;

export type OrgRole = (typeof OrgRoleSchema)[number];

export type Permission =
  | "org.billing"
  | "org.delete"
  | "org.settings"
  | "org.users"
  | "org.integrations"
  | "clients.read"
  | "clients.write"
  | "audits.read"
  | "audits.write"
  | "audits.analyze"
  | "recommendations.read"
  | "recommendations.approve"
  | "reports.read"
  | "reports.generate"
  | "dashboard.read"
  | "renewals.read"
  | "advisory.read"
  | "advisory.write"
  | "client_portal.read";

const ALL_PERMISSIONS: Permission[] = [
  "org.billing",
  "org.delete",
  "org.settings",
  "org.users",
  "org.integrations",
  "clients.read",
  "clients.write",
  "audits.read",
  "audits.write",
  "audits.analyze",
  "recommendations.read",
  "recommendations.approve",
  "reports.read",
  "reports.generate",
  "dashboard.read",
  "renewals.read",
  "advisory.read",
  "advisory.write",
  "client_portal.read",
];

/** Role → permission matrix */
export const ROLE_PERMISSIONS: Record<OrgRole, readonly Permission[]> = {
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS.filter(
    (p) => p !== "org.billing" && p !== "org.delete",
  ),
  consultant: [
    "clients.read",
    "clients.write",
    "audits.read",
    "audits.write",
    "audits.analyze",
    "recommendations.read",
    "recommendations.approve",
    "reports.read",
    "reports.generate",
    "dashboard.read",
    "renewals.read",
    "advisory.read",
    "advisory.write",
  ],
  analyst: [
    "clients.read",
    "audits.read",
    "audits.write",
    "audits.analyze",
    "recommendations.read",
    "reports.read",
    "reports.generate",
    "dashboard.read",
    "advisory.read",
    "advisory.write",
  ],
  client_viewer: [
    "client_portal.read",
    "audits.read",
    "recommendations.read",
    "reports.read",
    "renewals.read",
    "advisory.read",
  ],
};

/** Nav visibility by role (from product plan §4) */
export const ROLE_NAV_ACCESS: Record<
  OrgRole,
  Record<string, "full" | "read" | "none">
> = {
  owner: {
    dashboard: "full",
    clients: "full",
    audits: "full",
    renewals: "full",
    advisory: "full",
    billing: "full",
    settings: "full",
  },
  admin: {
    dashboard: "full",
    clients: "full",
    audits: "full",
    renewals: "full",
    advisory: "full",
    billing: "full",
    settings: "full",
  },
  consultant: {
    dashboard: "full",
    clients: "full",
    audits: "full",
    renewals: "full",
    advisory: "full",
    billing: "none",
    settings: "read",
  },
  analyst: {
    dashboard: "full",
    clients: "full",
    audits: "full",
    renewals: "read",
    advisory: "full",
    billing: "none",
    settings: "none",
  },
  client_viewer: {
    dashboard: "none",
    clients: "none",
    audits: "read",
    renewals: "read",
    advisory: "read",
    billing: "none",
    settings: "none",
  },
};

export function hasPermission(role: OrgRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessNav(
  role: OrgRole,
  navItem: string,
  required: "full" | "read" = "read",
): boolean {
  const access = ROLE_NAV_ACCESS[role][navItem] ?? "none";
  if (access === "none") return false;
  if (required === "read") return access === "read" || access === "full";
  return access === "full";
}
