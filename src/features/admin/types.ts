import type { UserRole, WorkspaceType } from "@/data/mock/auth-users";
import type { CourseAnalytics, CreatorCourseAnalyticsSummary } from "@/features/creator-analytics/types";

export type AdminPreviewState = "default" | "empty" | "loading" | "error";
export type AdminUserFilter = "all" | "learner" | "creator" | "organization" | "admin";
export type AdminActivityType = "course" | "account" | "organization";

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  workspaceType: WorkspaceType | null;
  roles: UserRole[];
  activitySummary: string;
  joinedLabel: string;
}

export interface AdminCourseRecord extends CreatorCourseAnalyticsSummary {
  ownerName: string;
  organizationName: string | null;
}

export interface AdminActivityRecord {
  id: string;
  type: AdminActivityType;
  title: string;
  description: string;
  occurredAt: string;
}

export interface AdminTotals {
  totalUsers: number;
  learners: number;
  creators: number;
  organizations: number;
  admins: number;
  totalCourses: number;
  publishedCourses: number;
}

export interface AdminSnapshot {
  totals: AdminTotals;
  users: AdminUserRecord[];
  courses: AdminCourseRecord[];
  courseAnalytics: CourseAnalytics[];
  activity: AdminActivityRecord[];
}
