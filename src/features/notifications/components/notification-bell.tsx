"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import { useNotifications } from "@/features/notifications/hooks/use-notifications";

export function NotificationBell() {
  const { feed } = useNotifications();
  const unread = feed?.unreadCount ?? 0;
  return (
    <Link href="/notifications" className="relative flex size-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-neutral-100 hover:text-text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
      <Bell className="size-5" aria-hidden="true" />
      {unread > 0 && <span className="absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] leading-4 font-semibold text-white" aria-hidden="true">{unread > 9 ? "9+" : unread}</span>}
    </Link>
  );
}
