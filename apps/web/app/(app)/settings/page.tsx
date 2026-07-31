"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  PageHeader,
  TextInput,
  Toggle,
  useToast,
} from "@vorzop/ui";
import {
  createBillingPortal,
  disconnectMicrosoft,
  fetchBillingStatus,
  fetchMicrosoftAuthUrl,
  fetchMicrosoftIntegration,
  fetchProfile,
  syncMicrosoft,
  type MicrosoftIntegrationStatus,
} from "@/lib/api-client";

const NOTIFICATION_KEYS = [
  { key: "auditComplete", label: "Audit complete", description: "When an audit finishes processing" },
  { key: "reportReady", label: "Report ready", description: "When a PDF report is generated" },
  { key: "recommendations", label: "New recommendations", description: "When high-confidence savings are found" },
] as const;

function integrationBadgeVariant(
  status: MicrosoftIntegrationStatus["status"],
): "success" | "warning" | "danger" {
  switch (status) {
    case "live":
      return "success";
    case "stub":
      return "warning";
    default:
      return "danger";
  }
}

function integrationBadgeLabel(integration: MicrosoftIntegrationStatus): string {
  if (!integration.featureEnabled || !integration.configured) return "Blocked";
  if (integration.connected) return "Connected";
  return "Not connected";
}

function formatSyncTime(iso: string | null | undefined): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString();
}

export default function SettingsPage() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    orgName: "",
    billingEmail: "",
    tier: "",
  });
  const [billing, setBilling] = useState({
    connected: false,
    plan: "",
    portalAvailable: false,
  });
  const [portalLoading, setPortalLoading] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    auditComplete: true,
    reportReady: true,
    recommendations: false,
  });
  const [integration, setIntegration] = useState<MicrosoftIntegrationStatus>({
    featureEnabled: false,
    configured: false,
    connected: false,
    status: "blocked",
    message: "Loading integration status…",
  });
  const [connectLoading, setConnectLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const loadIntegration = useCallback(async () => {
    const { integration: ms } = await fetchMicrosoftIntegration();
    setIntegration(ms);
  }, []);

  useEffect(() => {
    fetchProfile().then(({ profile: p }) => setProfile(p));
    fetchBillingStatus().then(({ status }) => {
      if (status) {
        setBilling({
          connected: status.connected,
          plan: status.plan ?? "",
          portalAvailable: status.portalAvailable ?? false,
        });
      }
    });
    void loadIntegration();
    const stored = localStorage.getItem("vorzop-notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored) as Record<string, boolean>);
      } catch {
        /* ignore */
      }
    }
  }, [loadIntegration]);

  useEffect(() => {
    const graph = searchParams.get("graph");
    const message = searchParams.get("message");
    if (graph === "connected") {
      addToast({
        title: "Microsoft 365 connected",
        description: "Initial sync started — users and licenses will appear shortly.",
        variant: "success",
      });
      void loadIntegration();
    } else if (graph === "error") {
      addToast({
        title: "Microsoft connection failed",
        description: message ?? "OAuth callback returned an error.",
        variant: "warning",
      });
    } else if (graph === "consent_pending") {
      addToast({
        title: "Admin consent recorded",
        description: "Complete sign-in if prompted by Microsoft.",
        variant: "default",
      });
    }
  }, [searchParams, loadIntegration, addToast]);

  function updateNotification(key: string, checked: boolean) {
    setNotifications((prev) => {
      const next = { ...prev, [key]: checked };
      localStorage.setItem("vorzop-notifications", JSON.stringify(next));
      return next;
    });
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    const { portalUrl, error } = await createBillingPortal();
    setPortalLoading(false);

    if (portalUrl) {
      window.location.href = portalUrl;
      return;
    }

    addToast({
      title: "Billing portal unavailable",
      description: error ?? "Complete checkout first or contact sales",
      variant: "warning",
    });
  }

  async function handleConnect() {
    setConnectLoading(true);
    const { authUrl, error } = await fetchMicrosoftAuthUrl();
    setConnectLoading(false);
    if (authUrl) {
      window.location.href = authUrl;
      return;
    }
    addToast({
      title: "Connect unavailable",
      description: error ?? "Microsoft Graph OAuth is not configured in this environment.",
      variant: "warning",
    });
  }

  async function handleDisconnect() {
    const { ok } = await disconnectMicrosoft();
    if (ok) {
      addToast({ title: "Disconnected", description: "Microsoft 365 integration removed.", variant: "success" });
      await loadIntegration();
    }
  }

  async function handleSync() {
    setSyncLoading(true);
    const { ok, recordsProcessed, readiness } = await syncMicrosoft();
    setSyncLoading(false);
    if (ok) {
      addToast({
        title: "Sync complete",
        description: `${recordsProcessed ?? 0} records processed.`,
        variant: "success",
      });
      await loadIntegration();
    } else {
      addToast({
        title: "Sync failed",
        description:
          readiness === "blocked"
            ? "Graph sync is not available — FEATURE_GRAPH_SYNC may be disabled."
            : "Check the connection and try again.",
        variant: "warning",
      });
    }
  }

  const planLabel = billing.plan || profile.tier || "Professional";
  const graphBlocked = !integration.featureEnabled || !integration.configured;

  return (
    <>
      <PageHeader title="Settings" />

      <div className="space-y-6">
        <Card header="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Full name" defaultValue={profile.name} />
            <TextInput label="Email" type="email" defaultValue={profile.email} />
          </div>
        </Card>

        <Card header="Organization">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Organization name" defaultValue={profile.orgName} />
            <TextInput label="Billing email" type="email" defaultValue={profile.billingEmail} />
          </div>
        </Card>

        <Card header="Notifications">
          <div className="divide-y divide-[var(--border-default)]">
            {NOTIFICATION_KEYS.map((n) => (
              <Toggle
                key={n.key}
                label={n.label}
                description={n.description}
                checked={notifications[n.key] ?? false}
                onChange={(checked) => updateNotification(n.key, checked)}
              />
            ))}
          </div>
        </Card>

        <Card header="Integrations">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[var(--font-body-sm)] font-medium">Microsoft Graph</p>
                <p className="text-[var(--font-caption)] text-[var(--text-secondary)]">
                  Read-only tenant sync for users and subscribed SKUs
                </p>
              </div>
              <Badge variant={integrationBadgeVariant(integration.status)}>
                {integrationBadgeLabel(integration)}
              </Badge>
            </div>

            {graphBlocked && (
              <p className="rounded-md border border-[var(--status-red-border)] bg-[var(--status-red-bg)] px-3 py-2 text-[var(--font-body-sm)] text-[var(--status-red)]">
                {integration.message ??
                  "Microsoft Graph sync is disabled (FEATURE_GRAPH_SYNC=false). CSV import remains the live data path until an admin enables Graph sync and configures OAuth credentials."}
              </p>
            )}

            {integration.connected && (
              <dl className="grid gap-2 text-[var(--font-body-sm)] sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--text-secondary)]">Tenant ID</dt>
                  <dd className="font-mono text-xs">{integration.tenantId ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-secondary)]">Last sync</dt>
                  <dd>{formatSyncTime(integration.lastSyncAt)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-secondary)]">Synced users</dt>
                  <dd>{integration.syncedUsers ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-secondary)]">Synced licenses</dt>
                  <dd>{integration.syncedLicenses ?? 0}</dd>
                </div>
              </dl>
            )}

            {integration.lastError && integration.connected && (
              <p className="text-[var(--font-body-sm)] text-[var(--status-red)]">
                Last error: {integration.lastError}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {!graphBlocked && !integration.connected && (
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={connectLoading}
                  onClick={() => void handleConnect()}
                >
                  Connect Microsoft 365
                </Button>
              )}
              {!graphBlocked && integration.connected && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={syncLoading}
                    onClick={() => void handleSync()}
                  >
                    Re-sync now
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleDisconnect()}>
                    Disconnect
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card header="Billing">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[var(--font-body-sm)] font-medium">Current plan</p>
              <p className="text-[var(--font-h3)] font-semibold capitalize">{planLabel}</p>
            </div>
            {billing.connected ? (
              <div className="flex items-center gap-3">
                <Badge variant="success">Stripe connected</Badge>
                {billing.portalAvailable && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openBillingPortal}
                    isLoading={portalLoading}
                  >
                    Manage billing
                  </Button>
                )}
              </div>
            ) : (
              <Badge variant="warning">Stripe not connected</Badge>
            )}
          </div>
          {!billing.connected && (
            <p className="mt-3 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
              Contact sales for manual invoicing, or visit{" "}
              <Link href="/pricing" className="text-[var(--brand-primary)] hover:underline">
                pricing
              </Link>{" "}
              when online checkout is enabled.
            </p>
          )}
        </Card>

        <Card header="Readiness">
          <p className="text-[var(--font-body-sm)] text-[var(--text-secondary)]">
            Module readiness checklist for your organization.
          </p>
          <Link
            href="/settings/readiness"
            className="mt-3 inline-block text-[var(--font-body-sm)] text-[var(--brand-primary)] hover:underline"
          >
            View readiness checklist →
          </Link>
        </Card>
      </div>
    </>
  );
}
