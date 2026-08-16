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
      !pathname.includes("/sources") &&
      !pathname.includes("/analysis") &&
      !pathname.includes("/generate");
    const isExact = item.href === pathname;

    return { ...item, current: isCourseCreation || isSources || isCourses || isExact };
  });
}
