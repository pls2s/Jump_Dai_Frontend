import type {
  AnalyticsTimeRange,
  CourseAnalytics,
  CreatorAnalyticsSnapshot,
  CreatorCourseAnalyticsSummary,
  SkillAnalytics,
} from "@/features/creator-analytics/types";

export type OrganizationPreviewState = "default" | "empty" | "loading" | "error";
export type OrganizationLearnerStatus = "active" | "completed" | "not-started";
export type OrganizationSkillCoverage = "strong" | "developing" | "needs-attention";

export interface OrganizationIdentity {
  id: string;
  name: string;
  learningFocus: string;
}

export interface OrganizationCourse extends CreatorCourseAnalyticsSummary {
  ownerName: string;
}

export interface OrganizationLearnerCourse {
  courseId: string;
  courseTitle: string;
  progress: number;
  status: OrganizationLearnerStatus;
}

export interface OrganizationLearner {
  id: string;
  name: string;
  currentLearning: OrganizationLearnerCourse[];
  completedCourses: number;
  verifiedSkills: string[];
  lastActivity: string;
}

export interface OrganizationSkillOutcome extends SkillAnalytics {
  learnerCount: number;
  coverage: OrganizationSkillCoverage;
}

export interface OrganizationActivity {
  id: string;
  label: string;
  detail: string;
  occurredAt: string;
}

export interface OrganizationTotals {
  activeCourses: number;
  activeLearners: number;
  completionRate: number;
  verifiedSkills: number;
  averageImprovement: number;
}

export interface OrganizationSnapshot {
  organization: OrganizationIdentity;
  timeRange: AnalyticsTimeRange;
  selectedCourseId: string | null;
  totals: OrganizationTotals;
  courses: OrganizationCourse[];
  learners: OrganizationLearner[];
  skills: OrganizationSkillOutcome[];
  recentActivity: OrganizationActivity[];
  analytics: CreatorAnalyticsSnapshot;
}

export interface OrganizationCourseDetail {
  course: OrganizationCourse;
  analytics?: CourseAnalytics;
}
