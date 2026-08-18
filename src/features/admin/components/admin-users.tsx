"use client";

import { Search, ShieldCheck, UserRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Field, FieldLabel, Input, Select } from "@/components/ui";
import { AdminEmpty, AdminError, AdminLoading } from "@/features/admin/components/admin-states";
import { adminPreviewState, useAdminSnapshot } from "@/features/admin/hooks/use-admin-snapshot";
import { adminCategoryFor, filterAdminUsers } from "@/features/admin/lib/admin-engine";
import type { AdminUserFilter, AdminUserRecord } from "@/features/admin/types";

const filters: AdminUserFilter[] = ["all", "learner", "creator", "organization", "admin"];
const labels: Record<Exclude<AdminUserFilter, "all">, string> = { learner: "Learner", creator: "Creator", organization: "Organization", admin: "Admin" };

export function AdminUsers() {
  const searchParams = useSearchParams();
  const { snapshot, loading, error, retry } = useAdminSnapshot(adminPreviewState(searchParams.get("state")));
  const [filter, setFilter] = useState<AdminUserFilter>("all");
  const [query, setQuery] = useState("");
  const users = snapshot ? filterAdminUsers(snapshot.users, filter, query) : [];

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Platform administration" title="Users" description="Inspect account workspace and role context. Passwords, secrets, and unrelated personal data are never shown." breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Users" }]} />
      {loading ? <AdminLoading label="Loading platform users" /> : error || !snapshot ? <AdminError message={error} onRetry={retry} /> : snapshot.users.length === 0 ? <AdminEmpty title="No users found" description="Platform account records will appear here when users join SkillSync." /> : (
        <>
          <Card className="mt-7 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:max-w-3xl">
            <Field><FieldLabel htmlFor="admin-user-search">Search users</FieldLabel><div className="relative"><Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" /><Input id="admin-user-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" className="pl-10" /></div></Field>
            <Field><FieldLabel htmlFor="admin-user-filter">Account type</FieldLabel><Select id="admin-user-filter" value={filter} onChange={(event) => setFilter(event.target.value as AdminUserFilter)}>{filters.map((item) => <option key={item} value={item}>{item === "all" ? "All account types" : labels[item]}</option>)}</Select></Field>
          </Card>
          <div className="mt-8 flex items-end justify-between gap-4"><div><h2 className="type-title-large">Account overview</h2><p className="type-caption mt-1 text-text-tertiary">{users.length} matching {users.length === 1 ? "account" : "accounts"}</p></div></div>
          {users.length === 0 ? <AdminEmpty title="No users match this filter" description="Change the account type or search text to inspect another platform account." /> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{users.map((user) => <UserCard key={user.id} user={user} />)}</div>}
        </>
      )}
    </ContentContainer>
  );
}

function UserCard({ user }: { user: AdminUserRecord }) {
  const category = adminCategoryFor(user);
  return <Card className="p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">{category === "admin" ? <ShieldCheck className="size-5" aria-hidden="true" /> : <UserRound className="size-5" aria-hidden="true" />}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text-primary">{user.name}</h2><Badge variant={category === "admin" ? "warning" : "info"}>{labels[category]}</Badge></div><p className="type-caption mt-1 break-all text-text-tertiary">{user.email}</p></div></div><dl className="mt-5 grid gap-3 border-y border-border-default py-4"><Summary label="Workspace" value={user.workspaceType ? labels[user.workspaceType] : "Platform role"} /><Summary label="Roles" value={user.roles.map((role) => labels[role]).join(", ")} /></dl><p className="type-body-small mt-4 text-text-secondary">{user.activitySummary}</p><ButtonLink href={`/admin/users/${user.id}`} variant="secondary" size="sm" className="mt-5">View account</ButtonLink></Card>;
}

export function AdminUserDetail({ userId }: { userId: string }) {
  const searchParams = useSearchParams();
  const { snapshot, loading, error, retry } = useAdminSnapshot(adminPreviewState(searchParams.get("state")));
  const user = snapshot?.users.find((item) => item.id === userId);
  const category = user ? adminCategoryFor(user) : null;
  return <ContentContainer className="max-w-[80rem]"><PageHeader eyebrow="User oversight" title={user?.name ?? "User detail"} description="Read-only role, workspace, and SkillSync activity context." breadcrumb={[{ label: "Users", href: "/admin/users" }, { label: user?.name ?? "User" }]} />{loading ? <AdminLoading label="Loading user account" /> : error || !snapshot ? <AdminError message={error} onRetry={retry} /> : !user || !category ? <AdminEmpty title="User record not found" description="This account is not available in the current platform view." action={{ href: "/admin/users", label: "Back to users" }} /> : <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="type-title-large">Account identity</h2><p className="type-body-small mt-1 text-text-secondary">Fields exposed by the current frontend account model.</p></div><Badge variant={category === "admin" ? "warning" : "info"}>{labels[category]}</Badge></div><dl className="mt-6 grid gap-5 sm:grid-cols-2"><Detail label="Name" value={user.name} /><Detail label="Email" value={user.email} /><Detail label="Workspace" value={user.workspaceType ? labels[user.workspaceType] : "No selectable workspace"} /><Detail label="Roles" value={user.roles.map((role) => labels[role]).join(", ")} /></dl><div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4"><h3 className="font-semibold text-blue-950">Role and workspace are separate</h3><p className="type-body-small mt-1 text-blue-900">Organization Demo correctly uses the Organization workspace with the Creator role. Admin remains a system-assigned role and is not a signup workspace.</p></div></Card><aside className="grid h-fit gap-4"><Card className="p-5"><h2 className="font-semibold">SkillSync activity</h2><p className="type-body-small mt-2 text-text-secondary">{user.activitySummary}</p></Card><Card className="p-5"><h2 className="font-semibold">Account timing</h2><p className="type-body-small mt-2 text-text-secondary">{user.joinedLabel}</p></Card></aside></div>}</ContentContainer>;
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4"><dt className="type-caption text-text-tertiary">{label}</dt><dd className="text-sm font-semibold text-text-primary">{value}</dd></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold text-text-primary">{value}</dd></div>; }
