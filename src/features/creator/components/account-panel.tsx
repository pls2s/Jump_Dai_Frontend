"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, UserRound } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Button, Card, Field, FieldError, FieldLabel, Input, Spinner } from "@/components/ui";
import type { AuthUser } from "@/features/auth/api/auth-api";
import { clearAuthSession, getAuthSession } from "@/features/auth/lib/auth-session";
import { loadCurrentAccount } from "@/features/auth/services/auth-service";

export function AccountPanel() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionMode, setSessionMode] = useState<"api" | "demo" | "bypass">("api");

  const loadProfile = useCallback(async () => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    setSessionMode(session.mode);
    setLoading(true);
    setError("");
    try {
      setUser(await loadCurrentAccount());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn’t load your account.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  function signOut() {
    clearAuthSession();
    router.push("/sign-in?signedOut=1");
  }

  return (
    <ContentContainer>
      <PageHeader title="Profile & account" description="Review the identity for your current SkillSync session." />
      <Card className="mt-8 max-w-2xl p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-800"><UserRound className="size-6" aria-hidden="true" /></span>
          <div><h2 className="type-title-large">Account details</h2><p className="type-caption mt-1 text-text-tertiary">{sessionMode === "bypass" ? "Frontend preview identity" : sessionMode === "demo" ? "Frontend Demo Mode session" : "Loaded from GET /api/auth/me"}</p></div>
        </div>

        {loading ? (
          <div role="status" className="mt-8 flex items-center gap-3 text-text-secondary"><Spinner />Loading account…</div>
        ) : error ? (
          <div className="mt-8">
            <FieldError>{error}</FieldError>
            <Button variant="secondary" className="mt-4" onClick={loadProfile}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button>
          </div>
        ) : user ? (
          <div className="mt-7 grid gap-5">
            <Field><FieldLabel htmlFor="profile-name">Display name</FieldLabel><Input id="profile-name" value={user.name} readOnly /></Field>
            <Field><FieldLabel htmlFor="profile-email">Email</FieldLabel><Input id="profile-email" type="email" value={user.email} readOnly /></Field>
            <p className="type-body-small rounded-md bg-blue-50 p-3 text-blue-800">{sessionMode === "bypass" ? "This temporary identity exists only while Frontend Bypass Mode is enabled." : sessionMode === "demo" ? "This identity is stored locally for frontend testing only." : "Profile editing and role information are not part of the current documented API contract."}</p>
          </div>
        ) : null}

        <div className="mt-7 border-t border-border-default pt-6">
          <Button type="button" variant="secondary" onClick={signOut}><LogOut className="size-4" aria-hidden="true" />Sign out</Button>
          <p className="type-caption mt-2 text-text-tertiary">{sessionMode === "bypass" ? "The preview identity will be synthesized again on protected routes while bypass remains enabled." : sessionMode === "demo" ? "This clears the local frontend demo session." : "No logout endpoint is documented; this clears the frontend Bearer-token session."}</p>
        </div>
      </Card>
    </ContentContainer>
  );
}
