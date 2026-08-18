import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

export function Topbar({
  pageContext,
  showCreatorProfile,
  onMenuClick,
  mobileNavigationOpen,
}: {
  pageContext: string;
  showCreatorProfile: boolean;
  onMenuClick: () => void;
  mobileNavigationOpen: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-border-default bg-surface-default/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
        aria-controls="mobile-navigation"
        aria-expanded={mobileNavigationOpen}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <p className="type-label truncate text-text-secondary">{pageContext}</p>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        {showCreatorProfile && (
        <Link
          href="/creator/account"
          className="flex min-h-11 items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30"
          aria-label="Open creator account"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
            SS
          </span>
          <span className="type-body-small hidden font-medium text-text-primary sm:block">
            Alex Lee
          </span>
        </Link>
        )}
      </div>
    </header>
  );
}
