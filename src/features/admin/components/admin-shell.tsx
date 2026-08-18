"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppShell } from "@/components/layout";
import { Card, Spinner } from "@/components/ui";
import { adminNavigationFor } from "@/data/navigation";
import { getAuthSession, routeForWorkspace } from "@/features/auth/lib/auth-session";

function pageContextFor(pathname: string) {
  if (pathname.startsWith("/admin/users/")) return "User oversight";
  if (pathname === "/admin/users") return "Platform users";
  if (pathname.startsWith("/admin/courses/")) return "Course oversight";
  if (pathname === "/admin/courses") return "Platform courses";
  if (pathname === "/admin/activity") return "Platform activity";
  return "Admin overview";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    if (!session.user.roles?.includes("admin")) {
      router.replace(session.user.workspaceType ? routeForWorkspace(session.user.workspaceType) : "/sign-in");
      return;
    }
    const timer = window.setTimeout(() => setAuthorized(true), 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  if (!authorized) {
    return <main className="min-h-dvh bg-background-page p-5 sm:p-8"><Card className="mx-auto flex min-h-64 max-w-3xl flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite"><Spinner className="size-7" /><h1 className="type-title-large mt-5">Checking Admin access</h1><p className="type-body-small mt-2 text-text-secondary">Confirming the current session and role…</p></Card></main>;
  }

  return (
    <AppShell
      navigation={adminNavigationFor(pathname)}
      brandHref="/admin"
      pageContext={pageContextFor(pathname)}
      showCreatorProfile={false}
    >
      {children}
    </AppShell>
  );
}
