import type { CourseLifecycleStatus } from "@/types/product";

export type AnalyticsTimeRange = "7d" | "30d" | "90d" | "all";
export type AnalyticsPreviewState = "default" | "empty" | "loading" | "error";

export interface CreatorAnalyticsTotals {
  totalCourses: number;
  publishedCourses: number;
  activeLearners: number;
  courseStarts: number;
  courseCompletions: number;
  completionRate: number;
  averagePostAssessmentScore: number;
  verifiedSkills: number;
}

export interface CourseStatusCount {
  status: CourseLifecycleStatus;
  count: number;
}

export interface LearnerFunnelMetric {
  id: string;
  label: string;
  value: number;
}

export interface AssessmentAnalytics {
  preAssessmentAverage: number;
  postAssessmentAverage: number;
  averageImprovement: number;
  practicalPassRate: number;
}

export interface SkillAnalytics {
  skillId: string;
  name: string;
  preScore: number;
  postScore: number;
  improvement: number;
  practicalPassRate: number;
  retryRate: number;
  commonChallenge: string;
}

export interface ContentAnalytics {
  id: string;
  title: string;
  type: "Lesson" | "Practice" | "Quiz";
  completionRate: number;
  quizScore?: number;
  retryRate: number;
}

export interface CourseAnalytics {
  courseId: string;
  title: string;
  status: CourseLifecycleStatus;
  learnerCount: number;
  activeLearners: number;
  courseStarts: number;
  completions: number;
  completionRate: number;
  averageAssessmentScore: number;
  practicalPassRate: number;
  verifiedSkills: number;
  funnel: LearnerFunnelMetric[];
  assessment: AssessmentAnalytics;
  skills: SkillAnalytics[];
  content: ContentAnalytics[];
}

export interface CreatorCourseAnalyticsSummary {
  id: string;
  title: string;
  status: CourseLifecycleStatus;
  updatedAt: string;
  analytics?: CourseAnalytics;
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  href?: string;
}

export interface CreatorAnalyticsSnapshot {
  timeRange: AnalyticsTimeRange;
  selectedCourseId: string | null;
  totals: CreatorAnalyticsTotals;
  statusCounts: CourseStatusCount[];
  courses: CreatorCourseAnalyticsSummary[];
  visibleCourses: CourseAnalytics[];
  funnel: LearnerFunnelMetric[];
  assessment: AssessmentAnalytics | null;
  skills: SkillAnalytics[];
  content: ContentAnalytics[];
  insights: AnalyticsInsight[];
  largestDropOff: {
    from: string;
    to: string;
    count: number;
  } | null;
}
