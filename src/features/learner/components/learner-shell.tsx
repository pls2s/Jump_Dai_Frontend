"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppShell } from "@/components/layout";
import { learnerNavigationFor } from "@/data/navigation";
import { getAuthSession, routeForWorkspace } from "@/features/auth/lib/auth-session";

function pageContextFor(pathname: string) {
  if (pathname.includes("/learning-profile")) return "Learning preferences";
  if (pathname.includes("/pre-assessment")) return "Pre-assessment";
  if (pathname.includes("/skill-gap")) return "Skill snapshot";
  if (pathname.includes("/learning-path")) return "Learning path";
  if (pathname.includes("/courses/") && (pathname.endsWith("/learn") || pathname.includes("/learn/"))) return "Learning experience";
  if (pathname.includes("/quiz") || pathname.includes("/post-assessment")) return "Knowledge check";
  if (pathname.includes("/practical-assessment")) return "Practical assessment";
  if (pathname.includes("/skill-evidence")) return "Skill portfolio";
  if (pathname.includes("/result")) return "Skill result";
  return "Learner workspace";
}

export function LearnerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    if (session.mode !== "bypass" && session.user.workspaceType !== "learner") {
      router.replace(session.user.workspaceType ? routeForWorkspace(session.user.workspaceType) : "/sign-in");
    }
  }, [router]);

  return (
    <AppShell navigation={learnerNavigationFor(pathname)} brandHref="/learner" pageContext={pageContextFor(pathname)} showCreatorProfile={false}>
      {children}
    </AppShell>
  );
}
