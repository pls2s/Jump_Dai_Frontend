import type { ReactNode } from "react";

import { NotificationShell } from "@/features/notifications/components/notification-shell";

export default function NotificationsLayout({ children }: { children: ReactNode }) {
  return <NotificationShell>{children}</NotificationShell>;
}
