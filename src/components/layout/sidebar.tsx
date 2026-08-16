import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CirclePlus,
  Database,
  GraduationCap,
  Home,
  Settings,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { NavigationIcon, NavigationItem } from "@/types/navigation";

const iconMap: Record<NavigationIcon, LucideIcon> = {
  home: Home,
  courses: BookOpen,
  create: CirclePlus,
  sources: Database,
  analytics: BarChart3,
  account: UserRound,
  learning: GraduationCap,
  evidence: BriefcaseBusiness,
  settings: Settings,
  components: Boxes,
};

interface SidebarContentProps {
  navigation: readonly NavigationItem[];
  brandHref: string;
  showCreatorProfile: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

function SidebarContent({
  navigation,
  brandHref,
  showCreatorProfile,
  onNavigate,
  onClose,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-18 items-center justify-between px-5">
        <Link
          href={brandHref}
          className="rounded-md"
          aria-label="SkillSync AI home"
          onClick={onNavigate}
        >
          <BrandMark />
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
            autoFocus
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4" aria-label="Primary navigation">
        <ul className="grid gap-1">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "type-body-small flex min-h-11 items-center gap-3 rounded-md px-3 font-medium transition-colors",
                    item.current
                      ? "bg-blue-100 text-blue-800"
                      : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary",
                  )}
                  aria-current={item.current ? "page" : undefined}
                  onClick={onNavigate}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {showCreatorProfile && (
        <div className="border-t border-border-default p-3">
          <Link
            href="/creator/account"
            className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-neutral-100"
            onClick={onNavigate}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
              AL
            </span>
            <span className="min-w-0">
              <span className="type-label block truncate text-text-primary">Alex Lee</span>
              <span className="type-caption block text-text-secondary">Creator account</span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

export interface SidebarProps {
  navigation: readonly NavigationItem[];
  brandHref: string;
  showCreatorProfile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  navigation,
  brandHref,
  showCreatorProfile,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      <aside className="hidden h-dvh w-60 shrink-0 border-r border-border-default bg-surface-default lg:sticky lg:top-0 lg:flex">
        <SidebarContent navigation={navigation} brandHref={brandHref} showCreatorProfile={showCreatorProfile} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px]"
            onClick={onMobileClose}
            aria-label="Close navigation"
          />
          <aside
            id="mobile-navigation"
            className="relative h-dvh w-[min(18rem,calc(100vw-3rem))] border-r border-border-default bg-surface-default shadow-lg"
            aria-label="Mobile navigation"
            aria-modal="true"
            role="dialog"
          >
            <SidebarContent
              navigation={navigation}
              brandHref={brandHref}
              showCreatorProfile={showCreatorProfile}
              onNavigate={onMobileClose}
              onClose={onMobileClose}
            />
          </aside>
        </div>
      )}
    </>
  );
}
