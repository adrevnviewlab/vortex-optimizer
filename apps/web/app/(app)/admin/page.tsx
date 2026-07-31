"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  ListPageSkeleton,
  PageHeader,
  SpringActionButton,
  TextInput,
  useToast,
} from "@vorzop/ui";
import { fetchMembers, inviteMember, type MemberItem } from "@/lib/api-client";

export default function AdminPage() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<MemberItem[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("analyst");
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    const { members: rows } = await fetchMembers();
    setMembers(rows);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvite() {
    if (!email.trim()) return;
    setInviting(true);
    const { ok } = await inviteMember(email.trim(), role);
    setInviting(false);
    if (ok) {
      addToast({ title: "Invitation sent", description: email, variant: "success" });
      setDialogOpen(false);
      setEmail("");
      await load();
    } else {
      addToast({
        title: "Invite queued",
        description: "Member API may be stub — invitation recorded locally",
        variant: "warning",
      });
      setMembers((prev) => [
        ...(prev ?? []),
        {
          id: crypto.randomUUID(),
          name: email.split("@")[0] ?? "New user",
          email,
          role: role.charAt(0).toUpperCase() + role.slice(1),
          lastActive: "Pending",
        },
      ]);
      setDialogOpen(false);
      setEmail("");
    }
  }

  if (!members) return <ListPageSkeleton rows={4} cols={4} />;

  return (
    <>
      <PageHeader
        title="Admin"
        actions={<SpringActionButton label="Invite User" onClick={() => setDialogOpen(true)} />}
      />

      <Card header="Users">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-strong)]">
              {["Name", "Email", "Role", "Last active"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[var(--font-caption)] font-medium uppercase tracking-[var(--tracking-wide)] text-[var(--text-secondary)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((user) => (
              <tr key={user.id} className="border-b border-[var(--border-default)]">
                <td className="px-4 py-3 text-[var(--font-body-sm)]">{user.name}</td>
                <td className="px-4 py-3 text-[var(--font-body-sm)] text-[var(--text-secondary)]">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="brand">{user.role}</Badge>
                </td>
                <td className="px-4 py-3 text-[var(--font-body-sm)] text-[var(--text-tertiary)]">
                  {user.lastActive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          title="Invite user"
          description="Send an invitation to join your organization."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!email.trim() || inviting}>
                Send invite
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
            />
            <div>
              <label className="mb-1.5 block text-[var(--font-body-sm)] font-medium text-[var(--text-secondary)]">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 w-full rounded-[var(--input-radius)] border border-[var(--border-default)] bg-[var(--surface-sunken)] px-3 text-[var(--font-body-sm)]"
              >
                <option value="admin">Admin</option>
                <option value="analyst">Consultant</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
