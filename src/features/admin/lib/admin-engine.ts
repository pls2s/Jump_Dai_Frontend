import { adminActivity, adminUsers } from "@/data/mock/admin";
import { DEMO_ORGANIZATION, organizationCourseOwners } from "@/data/mock/organization";
import type { CreatorAnalyticsSnapshot } from "@/features/creator-analytics/types";
import type { AdminSnapshot, AdminUserFilter, AdminUserRecord } from "@/features/admin/types";

export function adminCategoryFor(user: AdminUserRecord): Exclude<AdminUserFilter, "all"> {
  if (user.roles.includes("admin")) return "admin";
  if (user.workspaceType === "organization") return "organization";
  if (user.roles.includes("creator")) return "creator";
  return "learner";
}

export function filterAdminUsers(users: AdminUserRecord[], filter: AdminUserFilter, query: string) {
  const normalized = query.trim().toLowerCase();
  return users.filter((user) => {
    const matchesCategory = filter === "all" || adminCategoryFor(user) === filter;
    const matchesQuery = !normalized || `${user.name} ${user.email}`.toLowerCase().includes(normalized);
    return matchesCategory && matchesQuery;
  });
}

export function buildAdminSnapshot(
  analytics: CreatorAnalyticsSnapshot,
  options: { empty?: boolean } = {},
): AdminSnapshot {
  const users = options.empty ? [] : adminUsers;
  const courses = (options.empty ? [] : analytics.courses).map((course) => ({
    ...course,
    ownerName: organizationCourseOwners[course.id] ?? "Creator Demo",
    organizationName: ["digital-marketing-foundations", "ai-productivity-basics"].includes(course.id)
      ? DEMO_ORGANIZATION.name
      : null,
  }));
  return {
    totals: {
      totalUsers: users.length,
      learners: users.filter((user) => adminCategoryFor(user) === "learner").length,
      creators: users.filter((user) => adminCategoryFor(user) === "creator").length,
      organizations: users.filter((user) => adminCategoryFor(user) === "organization").length,
      admins: users.filter((user) => adminCategoryFor(user) === "admin").length,
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.status === "published").length,
    },
    users,
    courses,
    courseAnalytics: options.empty ? [] : analytics.visibleCourses,
    activity: options.empty ? [] : adminActivity,
  };
}
