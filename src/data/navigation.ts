import type { NavigationItem } from "@/types/navigation";

export const foundationNavigation: readonly NavigationItem[] = [
  {
    label: "UI preview",
    href: "/ui-preview",
    icon: "components",
  },
];

export function navigationFor(currentHref: string): readonly NavigationItem[] {
  return foundationNavigation.map((item) => ({
    ...item,
    current: item.href === currentHref,
  }));
}

export const creatorNavigation: readonly NavigationItem[] = [
  { label: "Home", href: "/creator", icon: "home" },
  { label: "My Courses", href: "/creator/courses", icon: "courses" },
  { label: "Create Course", href: "/creator/courses/new/basics", icon: "create" },
  {
    label: "Knowledge Sources",
    href: "/creator/courses/digital-marketing-foundations/sources",
    icon: "sources",
  },
  { label: "Analytics", href: "/creator/analytics", icon: "analytics" },
];

export function creatorNavigationFor(pathname: string): readonly NavigationItem[] {
  return creatorNavigation.map((item) => {
    const isCourseCreation = item.icon === "create" && pathname.startsWith("/creator/courses/new");
    const isSources = item.icon === "sources" && pathname.includes("/sources");
    const isCourses =
      item.icon === "courses" &&
      pathname.startsWith("/creator/courses") &&
      !pathname.startsWith("/creator/courses/new") &&
      !pathname.includes("/sources");
    const isAnalytics = item.icon === "analytics" && pathname.startsWith("/creator/analytics");
    const isExact = item.href === pathname;

    return { ...item, current: isCourseCreation || isSources || isCourses || isAnalytics || isExact };
  });
}

export const learnerNavigation: readonly NavigationItem[] = [
  { label: "Home", href: "/learner", icon: "home" },
  { label: "Portfolio", href: "/learner/courses/digital-marketing-foundations/skill-evidence", icon: "evidence" },
];

export function learnerNavigationFor(pathname: string): readonly NavigationItem[] {
  return learnerNavigation.map((item) => ({
    ...item,
    current: item.icon === "home"
      ? pathname === item.href
      : item.href === pathname || pathname.startsWith(`${item.href}/`),
  }));
}

export const organizationNavigation: readonly NavigationItem[] = [
  { label: "Overview", href: "/organization", icon: "home" },
  { label: "Courses", href: "/organization/courses", icon: "courses" },
  { label: "Learners", href: "/organization/learners", icon: "learners" },
  { label: "Skills & Outcomes", href: "/organization/skills", icon: "skills" },
];

export function organizationNavigationFor(pathname: string): readonly NavigationItem[] {
  return organizationNavigation.map((item) => ({
    ...item,
    current: item.icon === "home"
      ? pathname === item.href
      : item.href === pathname || pathname.startsWith(`${item.href}/`),
  }));
}
