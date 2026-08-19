"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Checkbox, EmptyState, ErrorState, Field, FieldLabel, Input, LoadingState, Toggle, useToast } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import type { UserRole, WorkspaceType } from "@/data/mock";
import {
  getApiAdminUsers,
  updateApiAdminUserRoles,
  updateApiAdminUserStatus,
  type ApiAdminUser,
} from "../api/admin-users-api";

type UserFilter = "all" | WorkspaceType | "admin";

const filters: UserFilter[] = ["all", "learner", "creator", "organization", "admin"];
const categoryLabels: Record<Exclude<UserFilter, "all">, string> = {
  learner: "Learner",
  creator: "Creator",
  organization: "Organization",
  admin: "Admin",
};
const roleLabels: Record<UserRole, string> = {
  learner: "Learner",
  creator: "Creator",
  admin: "Admin",
};
const availableRoles: UserRole[] = ["learner", "creator", "admin"];

function accessToken() {
  const session = getAuthSession();
  return session?.mode === "api" ? session.accessToken : null;
}

function categoryFor(user: ApiAdminUser): Exclude<UserFilter, "all"> {
  if (user.roles.includes("admin")) return "admin";
  if (user.workspaceType === "organization") return "organization";
  if (user.roles.includes("creator")) return "creator";
  return "learner";
}

function updateUser(users: ApiAdminUser[], nextUser: ApiAdminUser) {
  return users.map((user) => user.id === nextUser.id ? nextUser : user);
}

export function ApiAdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<ApiAdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<UserFilter>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const token = accessToken();
    if (!token) {
      router.replace("/sign-in");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setUsers(await getApiAdminUsers(token));
    } catch (requestError) {
      setUsers(null);
      setError(requestError instanceof Error ? requestError.message : "Users couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const matchingUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (users ?? []).filter((user) => {
      const matchesCategory = filter === "all" || categoryFor(user) === filter;
      const matchesQuery = !normalized || `${user.name} ${user.email}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [filter, query, users]);

  return (
    <ContentContainer className="max-w-[96rem]">
      <PageHeader eyebrow="Platform administration" title="Users" description="Manage account roles and activation status from the protected Admin users API. Passwords, secrets, and unrelated personal data are never shown." breadcrumb={[{ label: "Admin", href: "/admin" }, { label: "Users" }]} />
      {loading ? <LoadingState title="Loading platform users" description="Requesting the Admin account directory…" /> : error ? <ErrorState title="Users unavailable" description={error} onRetry={() => void load()} icon={<ShieldCheck className="size-6" aria-hidden="true" />} /> : users?.length === 0 ? <EmptyState title="No users found" description="Platform account records will appear here when users join SkillSync." icon={<ShieldCheck className="size-6" aria-hidden="true" />} /> : (
        <>
          <Card className="mt-7 grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:max-w-3xl">
            <Field><FieldLabel htmlFor="api-admin-user-search">Search users</FieldLabel><div className="relative"><Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" /><Input id="api-admin-user-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" className="pl-10" /></div></Field>
            <Field><FieldLabel htmlFor="api-admin-user-filter">Account type</FieldLabel><select id="api-admin-user-filter" value={filter} onChange={(event) => setFilter(event.target.value as UserFilter)} className="min-h-11 rounded-md border border-border-default bg-surface-default px-3 text-sm text-text-primary"><option value="all">All account types</option>{filters.filter((item) => item !== "all").map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}</select></Field>
          </Card>
          <div className="mt-8"><h2 className="type-title-large">Account overview</h2><p className="type-caption mt-1 text-text-tertiary">{matchingUsers.length} matching {matchingUsers.length === 1 ? "account" : "accounts"}</p></div>
          {matchingUsers.length === 0 ? <EmptyState title="No users match this filter" description="Change the account type or search text to inspect another account." icon={<UserRound className="size-6" aria-hidden="true" />} /> : <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{matchingUsers.map((user) => <ApiUserCard key={user.id} user={user} />)}</div>}
        </>
      )}
    </ContentContainer>
  );
}

function ApiUserCard({ user }: { user: ApiAdminUser }) {
  const category = categoryFor(user);
  return <Card className="p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">{category === "admin" ? <ShieldCheck className="size-5" aria-hidden="true" /> : <UserRound className="size-5" aria-hidden="true" />}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-text-primary">{user.name}</h2><Badge variant={category === "admin" ? "warning" : "info"}>{categoryLabels[category]}</Badge>{!user.isActive && <Badge variant="neutral">Suspended</Badge>}</div><p className="type-caption mt-1 break-all text-text-tertiary">{user.email}</p></div></div><dl className="mt-5 grid gap-3 border-y border-border-default py-4"><Summary label="Workspace" value={user.workspaceType ? categoryLabels[user.workspaceType] : "Not selected"} /><Summary label="Roles" value={user.roles.map((role) => roleLabels[role]).join(", ") || "None"} /><Summary label="Email" value={user.emailVerified ? "Verified" : "Unverified"} /></dl><ButtonLink href={`/admin/users/${user.id}`} variant="secondary" size="sm" className="mt-5">Manage account</ButtonLink></Card>;
}

export function ApiAdminUserDetail({ userId }: { userId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<ApiAdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftRoles, setDraftRoles] = useState<UserRole[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const user = users?.find((item) => item.id === Number(userId));
  const currentUserId = getAuthSession()?.user.id;
  const isCurrentAdmin = user?.id === currentUserId;

  const load = useCallback(async () => {
    const token = accessToken();
    if (!token) {
      router.replace("/sign-in");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const nextUsers = await getApiAdminUsers(token);
      setUsers(nextUsers);
      const nextUser = nextUsers.find((item) => item.id === Number(userId));
      setDraftRoles(nextUser?.roles ?? []);
    } catch (requestError) {
      setUsers(null);
      setError(requestError instanceof Error ? requestError.message : "User details couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [router, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function toggleRole(role: UserRole, checked: boolean) {
    setDraftRoles((current) => checked ? [...current, role] : current.filter((item) => item !== role));
  }

  async function saveRoles() {
    if (!user || draftRoles.length === 0) return;
    const token = accessToken();
    if (!token) return router.replace("/sign-in");
    setSavingRoles(true);
    try {
      const updated = await updateApiAdminUserRoles(user.id, draftRoles, token);
      setUsers((current) => current ? updateUser(current, updated) : current);
      setDraftRoles(updated.roles);
      showToast({ tone: "success", title: "Roles updated" });
    } catch (requestError) {
      showToast({ tone: "error", title: "Roles weren’t updated", description: requestError instanceof Error ? requestError.message : "Try again." });
    } finally {
      setSavingRoles(false);
    }
  }

  async function changeStatus(isActive: boolean) {
    if (!user || isCurrentAdmin) return;
    const token = accessToken();
    if (!token) return router.replace("/sign-in");
    setSavingStatus(true);
    try {
      const updated = await updateApiAdminUserStatus(user.id, isActive, token);
      setUsers((current) => current ? updateUser(current, updated) : current);
      showToast({ tone: "success", title: isActive ? "Account reactivated" : "Account suspended" });
    } catch (requestError) {
      showToast({ tone: "error", title: "Account status wasn’t updated", description: requestError instanceof Error ? requestError.message : "Try again." });
    } finally {
      setSavingStatus(false);
    }
  }

  const category = user ? categoryFor(user) : null;
  const roleChanged = user ? draftRoles.length !== user.roles.length || draftRoles.some((role) => !user.roles.includes(role)) : false;

  return <ContentContainer className="max-w-[80rem]"><PageHeader eyebrow="User management" title={user?.name ?? "User detail"} description="Account identity, roles, and activation status supplied by the Admin users API." breadcrumb={[{ label: "Users", href: "/admin/users" }, { label: user?.name ?? "User" }]} />{loading ? <LoadingState title="Loading user account" description="Requesting the protected Admin user list…" /> : error ? <ErrorState title="User unavailable" description={error} onRetry={() => void load()} icon={<ShieldCheck className="size-6" aria-hidden="true" />} /> : !user || !category ? <EmptyState title="User record not found" description="This account is not available in the current platform view." action={{ href: "/admin/users", label: "Back to users" }} icon={<UserRound className="size-6" aria-hidden="true" />} /> : <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><div className="grid gap-6"><Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="type-title-large">Account identity</h2><p className="type-body-small mt-1 text-text-secondary">Only safe fields returned by the backend are displayed.</p></div><Badge variant={category === "admin" ? "warning" : "info"}>{categoryLabels[category]}</Badge></div><dl className="mt-6 grid gap-5 sm:grid-cols-2"><Detail label="Name" value={user.name} /><Detail label="Email" value={user.email} /><Detail label="Workspace" value={user.workspaceType ? categoryLabels[user.workspaceType] : "No selectable workspace"} /><Detail label="Email verification" value={user.emailVerified ? "Verified" : "Unverified"} /><Detail label="Onboarding" value={user.onboardingCompleted ? "Completed" : "Not completed"} /><Detail label="Current roles" value={user.roles.map((role) => roleLabels[role]).join(", ") || "None"} /></dl></Card><Card className="p-6"><h2 className="type-title-large">Role assignments</h2><p className="type-body-small mt-1 text-text-secondary">At least one role is required. Changes replace this account’s backend role list.</p><div className="mt-5 grid gap-1">{availableRoles.map((role) => <Checkbox key={role} label={roleLabels[role]} checked={draftRoles.includes(role)} disabled={savingRoles || (isCurrentAdmin && role === "admin")} onChange={(event) => toggleRole(role, event.target.checked)} />)}</div>{isCurrentAdmin && <p className="type-caption mt-3 text-text-secondary">The current Admin role is protected here to avoid removing this session’s own access.</p>}<Button className="mt-5" onClick={() => void saveRoles()} disabled={!roleChanged || draftRoles.length === 0 || savingRoles} isLoading={savingRoles} loadingLabel="Saving roles…">Save roles</Button></Card></div><aside className="grid h-fit gap-4"><Card className="p-5"><h2 className="font-semibold">Account status</h2><Toggle className="mt-3 rounded-md border border-border-default p-4" label={user.isActive ? "Account is active" : "Account is suspended"} description={isCurrentAdmin ? "Your own Admin account cannot be suspended from this session." : user.isActive ? "Suspending invalidates the account’s current backend tokens." : "Reactivating allows the account to sign in again."} checked={user.isActive} disabled={savingStatus || isCurrentAdmin} onCheckedChange={(isActive) => void changeStatus(isActive)} /></Card><Card className="p-5"><h2 className="font-semibold">API scope</h2><p className="type-body-small mt-2 text-text-secondary">The current Admin API does not provide joining dates, activity history, passwords, or personal data beyond these account fields.</p></Card></aside></div>}</ContentContainer>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><dt className="type-caption text-text-tertiary">{label}</dt><dd className="text-right text-sm font-semibold text-text-primary">{value}</dd></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold text-text-primary">{value}</dd></div>;
}
