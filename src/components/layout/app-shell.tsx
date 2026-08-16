"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { NavigationItem } from "@/types/navigation";

export interface AppShellProps {
  children: ReactNode;
  navigation: readonly NavigationItem[];
  brandHref?: string;
  pageContext?: string;
  showCreatorProfile?: boolean;
}

export function AppShell({
  children,
  navigation,
  brandHref = "/creator",
  pageContext = "Creator workspace",
  showCreatorProfile = true,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-background-page lg:flex">
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-md bg-action-primary px-4 py-2 font-semibold text-text-inverse shadow-md transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <Sidebar
        navigation={navigation}
        brandHref={brandHref}
        showCreatorProfile={showCreatorProfile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <Topbar
          pageContext={pageContext}
          showCreatorProfile={showCreatorProfile}
          onMenuClick={() => setMobileOpen(true)}
          mobileNavigationOpen={mobileOpen}
        />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
