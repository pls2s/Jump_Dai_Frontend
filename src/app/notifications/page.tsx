import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { LoadingState } from "@/components/ui";
import { NotificationWorkspace } from "@/features/notifications/components/notification-workspace";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return <Suspense fallback={<ContentContainer><LoadingState title="Loading notifications" description="Preparing updates for your current workspace…" /></ContentContainer>}><NotificationWorkspace /></Suspense>;
}
