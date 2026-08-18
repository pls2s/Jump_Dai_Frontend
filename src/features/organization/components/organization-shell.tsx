"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppShell } from "@/components/layout";
import { organizationNavigationFor } from "@/data/navigation";
import { getAuthSession, routeForWorkspace } from "@/features/auth/lib/auth-session";

function pageContextFor(pathname: string) {
  if (pathname.startsWith("/organization/courses/")) return "Course performance";
  if (pathname === "/organization/courses") return "Organization courses";
  if (pathname.startsWith("/organization/learners/")) return "Learner detail";
  if (pathname === "/organization/learners") return "Organization learners";
  if (pathname.startsWith("/organization/skills")) return "Skills & outcomes";
  return "Organization workspace";
}

export function OrganizationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    if (session.mode === "bypass") return;
    if (session.user.workspaceType !== "organization") {
      router.replace(session.user.workspaceType ? routeForWorkspace(session.user.workspaceType) : "/creator");
    }
  }, [router]);

  return (
    <AppShell
      navigation={organizationNavigationFor(pathname)}
      brandHref="/organization"
      pageContext={pageContextFor(pathname)}
      showCreatorProfile={false}
    >
      {children}
    </AppShell>
  );
}
