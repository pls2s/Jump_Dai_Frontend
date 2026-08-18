"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout";
import { LoadingState } from "@/components/ui";
import { adminNavigationFor, creatorNavigationFor, learnerNavigationFor, organizationNavigationFor } from "@/data/navigation";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { notificationAudienceFor } from "@/features/notifications/services/notification-service";
import type { NotificationAudience } from "@/features/notifications/types";
import type { NavigationItem } from "@/types/navigation";

interface NotificationShellConfig {
  navigation: readonly NavigationItem[];
  brandHref: string;
  showCreatorProfile: boolean;
  audience: NotificationAudience;
}

function configFor(audience: NotificationAudience): NotificationShellConfig {
  if (audience === "admin") return { navigation: adminNavigationFor("/notifications"), brandHref: "/admin", showCreatorProfile: false, audience };
  if (audience === "organization") return { navigation: organizationNavigationFor("/notifications"), brandHref: "/organization", showCreatorProfile: false, audience };
  if (audience === "learner") return { navigation: learnerNavigationFor("/notifications"), brandHref: "/learner", showCreatorProfile: false, audience };
  return { navigation: creatorNavigationFor("/notifications"), brandHref: "/creator", showCreatorProfile: true, audience };
}

export function NotificationShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [config, setConfig] = useState<NotificationShellConfig | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    const nextConfig = configFor(notificationAudienceFor(session));
    const timer = window.setTimeout(() => setConfig(nextConfig), 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  if (!config) return <main className="min-h-dvh bg-background-page p-5 sm:p-8"><LoadingState title="Opening notifications" description="Confirming your workspace and notification view…" className="mx-auto max-w-3xl" /></main>;

  return <AppShell navigation={config.navigation} brandHref={config.brandHref} pageContext="Notifications" showCreatorProfile={config.showCreatorProfile}>{children}</AppShell>;
}
