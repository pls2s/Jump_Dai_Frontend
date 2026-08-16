"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { creatorNavigationFor } from "@/data/navigation";
import { getAuthSession, routeForWorkspace } from "@/features/auth/lib/auth-session";
import { CourseSetupProvider } from "@/features/course-setup/components/course-setup-provider";

function pageContextFor(pathname: string) {
  if (pathname.includes("/courses/new")) return "Course setup";
  if (pathname.includes("/sources")) return "Knowledge sources";
  if (pathname.includes("/analysis")) return "Knowledge analysis";
  if (pathname.includes("/generate")) return "AI course generation";
  if (pathname.includes("/analytics")) return "Analytics";
  if (pathname.includes("/account")) return "Profile & account";
  if (pathname === "/creator/courses") return "My courses";
  return "Creator workspace";
}

export function CreatorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    if (session.mode === "demo" && session.user.workspaceType !== "creator") {
      router.replace(routeForWorkspace(session.user.workspaceType));
    }
  }, [router]);

  return (
    <CourseSetupProvider>
      <AppShell navigation={creatorNavigationFor(pathname)} pageContext={pageContextFor(pathname)}>
        {children}
      </AppShell>
    </CourseSetupProvider>
  );
}
