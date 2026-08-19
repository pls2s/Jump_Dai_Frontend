import { ApiError, apiRequest, getApiUrl } from "@/lib/api/api-client";

export interface ApiDashboardSummary {
  course_count: number;
  learner_count: number;
  completed_learner_count: number;
  completion_rate: number;
  average_assessment_score: number;
}

export interface ApiCourseDashboardMetric {
  course_id: number;
  course_title: string;
  learner_count: number;
  completed_learner_count: number;
  completion_rate: number;
  average_assessment_score: number;
}

export interface ApiLearnerDashboardProgress {
  learner_id: number;
  learner_name: string;
  course_id: number;
  course_title: string;
  progress_percentage: number;
  assessment_score: number;
  completed: boolean;
  last_activity_at: string;
  common_errors: string[];
  skill_gaps: string[];
}

export interface ApiCommonError {
  course_id: number;
  course_title: string;
  topic: string;
  occurrence_count: number;
  affected_learner_count: number;
}

export interface ApiSkillGapOverview {
  course_id: number;
  course_title: string;
  skill: string;
  affected_learner_count: number;
}

export interface ApiCourseInsight {
  course_id: number;
  course_title: string;
  code: string;
  severity: string;
  message: string;
  recommendation: string;
}

export interface ApiCreatorDashboard {
  filters: {
    course_id: number | null;
    date_from: string | null;
    date_to: string | null;
  };
  summary: ApiDashboardSummary;
  courses: ApiCourseDashboardMetric[];
  learners: ApiLearnerDashboardProgress[];
  common_errors: ApiCommonError[];
  skill_gaps: ApiSkillGapOverview[];
  course_improvement_insights: ApiCourseInsight[];
}

export interface DashboardFilters {
  courseId?: number;
  dateFrom?: string;
  dateTo?: string;
}

function dashboardQuery(filters: DashboardFilters) {
  const params = new URLSearchParams();
  if (filters.courseId) params.set("course_id", String(filters.courseId));
  if (filters.dateFrom) params.set("date_from", filters.dateFrom);
  if (filters.dateTo) params.set("date_to", filters.dateTo);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Load the creator-scoped dashboard report for the selected course/date filters. */
export function getApiCreatorDashboard(filters: DashboardFilters, accessToken: string) {
  return apiRequest<ApiCreatorDashboard>(`/api/creator/dashboard${dashboardQuery(filters)}`, {
    method: "GET",
    token: accessToken,
  });
}

/** Download the backend-generated CSV, JSON, or PDF report using the API session token. */
export async function exportApiCreatorDashboard(
  filters: DashboardFilters,
  exportFormat: "csv" | "json" | "pdf",
  accessToken: string,
) {
  const baseUrl = getApiUrl().endsWith("/api") ? getApiUrl() : `${getApiUrl()}/api`;
  const query = new URLSearchParams(dashboardQuery(filters).replace(/^\?/, ""));
  query.set("format", exportFormat);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/creator/dashboard/export?${query.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new ApiError("We couldn’t reach SkillSync. Check that the backend is running, then try again.", undefined, "NETWORK_ERROR");
  }
  if (!response.ok) {
    throw new ApiError(`The report export failed with status ${response.status}.`, response.status, "EXPORT_FAILED");
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const filename = disposition.match(/filename="?([^";]+)"?/)?.[1] ?? `creator-dashboard-report.${exportFormat}`;
  return { blob: await response.blob(), filename };
}
