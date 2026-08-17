"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, RefreshCw, Save, UserRound, X } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  ConfirmationDialog,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
  useToast,
} from "@/components/ui";
import type { WorkspaceType } from "@/data/mock";
import type { AuthUser } from "@/features/auth/api/auth-api";
import { clearAuthSession, getAuthSession } from "@/features/auth/lib/auth-session";
import { loadCurrentAccount, updateCurrentAccount } from "@/features/auth/services/auth-service";

type ProfileErrors = Partial<Record<"name" | "email" | "form", string>>;

export function AccountPanel() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [sessionMode, setSessionMode] = useState<"api" | "demo" | "bypass">("api");
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType | undefined>();
  const [roles, setRoles] = useState<string[]>([]);

  const loadProfile = useCallback(async () => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    setSessionMode(session.mode);
    setWorkspaceType(session.user.workspaceType);
    setRoles(session.user.roles ?? []);
    setLoading(true);
    setErrors({});
    try {
      const loaded = await loadCurrentAccount();
      setUser(loaded);
      setDraft({ name: loaded.name, email: loaded.email });
      setEditing(false);
    } catch (caught) {
      setErrors({ form: caught instanceof Error ? caught.message : "We couldn’t load your account." });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  function startEditing() {
    if (!user) return;
    setDraft({ name: user.name, email: user.email });
    setErrors({});
    setEditing(true);
  }

  function cancelEditing() {
    if (user) setDraft({ name: user.name, email: user.email });
    setErrors({});
    setEditing(false);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.name.trim();
    const email = draft.email.trim();
    const nextErrors: ProfileErrors = {};
    if (name.length < 2) nextErrors.name = "Enter a display name with at least 2 characters.";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await updateCurrentAccount({ name, email });
      setUser(updated);
      setDraft({ name: updated.name, email: updated.email });
      setEditing(false);
      showToast({ tone: "success", title: "Profile updated", description: "Your frontend profile changes were saved to this browser." });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "We couldn’t save your profile.";
      setErrors({ form: message });
      showToast({ tone: "error", title: "Profile wasn’t updated", description: message });
    } finally {
      setSaving(false);
    }
  }

  function signOut() {
    clearAuthSession();
    router.push("/sign-in?signedOut=1");
  }

  const canEdit = sessionMode === "demo" || sessionMode === "bypass";

  return (
    <ContentContainer>
      <PageHeader title="Profile & account" description="Manage the identity used for your current SkillSync session." />
      <Card className="mt-8 max-w-2xl p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-800"><UserRound className="size-6" aria-hidden="true" /></span>
            <div><h2 className="type-title-large">Account details</h2><p className="type-caption mt-1 text-text-tertiary">{sessionMode === "bypass" ? "Frontend preview identity" : sessionMode === "demo" ? "Frontend Demo Mode session" : "Loaded from GET /api/auth/me"}</p></div>
          </div>
          {!loading && user && canEdit && !editing && <Button variant="secondary" onClick={startEditing}><Pencil className="size-4" aria-hidden="true" />Edit profile</Button>}
        </div>

        {loading ? (
          <div role="status" className="mt-8 flex items-center gap-3 text-text-secondary"><Spinner />Loading account…</div>
        ) : errors.form && !user ? (
          <div className="mt-8">
            <FieldError>{errors.form}</FieldError>
            <Button variant="secondary" className="mt-4" onClick={loadProfile}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button>
          </div>
        ) : user && editing ? (
          <form className="mt-7 grid gap-5" onSubmit={saveProfile} noValidate>
            {errors.form && <FieldError>{errors.form}</FieldError>}
            <Field><FieldLabel htmlFor="profile-name">Display name</FieldLabel><Input id="profile-name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} validation={errors.name ? "error" : "default"} aria-describedby={errors.name ? "profile-name-error" : undefined} maxLength={80} />{errors.name && <FieldError id="profile-name-error">{errors.name}</FieldError>}</Field>
            <Field><FieldLabel htmlFor="profile-email">Email</FieldLabel><Input id="profile-email" type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} validation={errors.email ? "error" : "default"} aria-describedby={errors.email ? "profile-email-error" : undefined} maxLength={160} />{errors.email && <FieldError id="profile-email-error">{errors.email}</FieldError>}</Field>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" onClick={cancelEditing} disabled={saving}><X className="size-4" aria-hidden="true" />Cancel</Button><Button type="submit" isLoading={saving} loadingLabel="Saving profile…"><Save className="size-4" aria-hidden="true" />Save changes</Button></div>
          </form>
        ) : user ? (
          <div className="mt-7">
            <dl className="grid gap-5 sm:grid-cols-2">
              <AccountValue label="Display name">{user.name}</AccountValue>
              <AccountValue label="Email">{user.email}</AccountValue>
              <AccountValue label="Workspace"><span className="capitalize">{workspaceType ?? "Not supplied by API"}</span></AccountValue>
              <AccountValue label="Role">{roles.length ? <span className="flex flex-wrap gap-2">{roles.map((role) => <Badge key={role} variant="info" className="capitalize">{role}</Badge>)}</span> : "Not supplied by API"}</AccountValue>
            </dl>
            <p className="type-body-small mt-6 rounded-md bg-blue-50 p-3 text-blue-800">{sessionMode === "bypass" ? "Profile edits are saved only to this browser’s temporary frontend preview session." : sessionMode === "demo" ? "Profile edits are saved locally for frontend testing only." : "API_doc.md documents profile reading through GET /api/auth/me, but no profile-update endpoint. API mode remains safely read-only."}</p>
          </div>
        ) : null}

        <div className="mt-7 border-t border-border-default pt-6">
          <Button type="button" variant="secondary" onClick={() => setConfirmingSignOut(true)}><LogOut className="size-4" aria-hidden="true" />Sign out</Button>
          <p className="type-caption mt-2 text-text-tertiary">{sessionMode === "bypass" ? "The preview identity will be synthesized again on protected routes while bypass remains enabled." : sessionMode === "demo" ? "This clears the local frontend demo session." : "No logout endpoint is documented; this clears the frontend Bearer-token session."}</p>
        </div>
      </Card>
      <ConfirmationDialog open={confirmingSignOut} title="Sign out of SkillSync?" description="Your saved course and learner prototype data will remain in this browser, but the current authentication session will be cleared." confirmLabel="Sign out" confirmVariant="danger" onConfirm={signOut} onCancel={() => setConfirmingSignOut(false)} />
    </ContentContainer>
  );
}

function AccountValue({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">{label}</dt><dd className="mt-1.5 break-words font-medium text-text-primary">{children}</dd></div>;
}
