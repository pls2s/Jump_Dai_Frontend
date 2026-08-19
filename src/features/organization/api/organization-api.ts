import type {
  AnalyticsInsight,
  AnalyticsTimeRange,
  ContentAnalytics,
  CourseAnalytics,
  CreatorAnalyticsSnapshot,
  CreatorCourseAnalyticsSummary,
  LearnerFunnelMetric,
  SkillAnalytics,
} from "@/features/creator-analytics/types";
import type {
  OrganizationCourse,
  OrganizationLearner,
  OrganizationSkillOutcome,
  OrganizationSnapshot,
} from "@/features/organization/types";
import { apiRequest } from "@/lib/api/api-client";
import type { CourseLifecycleStatus } from "@/types/product";

interface ApiFunnelMetric {
  id: string;
  label: string;
  value: number;
}

interface ApiAssessmentMetric {
  pre_assessment_average: number;
  post_assessment_average: number;
  average_improvement: number;
  practical_pass_rate: number;
}

interface ApiSkillMetric {
  skill_id: string;
  name: string;
  pre_score: number;
  post_score: number;
  improvement: number;
  practical_pass_rate: number;
  retry_rate: number;
  common_challenge: string;
}

interface ApiContentMetric {
  id: string;
  title: string;
  content_type: string;
  completion_rate: number;
  quiz_score: number | null;
  retry_rate: number;
}

interface ApiCourseAnalytics {
  course_id: string;
  title: string;
  status: CourseLifecycleStatus;
  learner_count: number;
  active_learners: number;
  course_starts: number;
  completions: number;
  completion_rate: number;
  average_assessment_score: number;
  practical_pass_rate: number;
  verified_skills: number;
  funnel: ApiFunnelMetric[];
  assessment: ApiAssessmentMetric;
  skills: ApiSkillMetric[];
  content: ApiContentMetric[];
}

interface ApiOrganizationCourse {
  id: string;
  title: string;
  status: CourseLifecycleStatus;
  updated_at: string;
  owner_name: string;
  analytics: ApiCourseAnalytics | null;
}

interface ApiOrganizationSnapshot {
  organization: {
    id: string;
    name: string;
    learning_focus: string;
  };
  totals: {
    active_courses: number;
    active_learners: number;
    completion_rate: number;
    verified_skills: number;
    average_improvement: number;
  };
  courses: ApiOrganizationCourse[];
  learners: Array<{
    id: string;
    name: string;
    current_learning: Array<{
      course_id: string;
      course_title: string;
      progress: number;
      status: OrganizationLearner["currentLearning"][number]["status"];
    }>;
    completed_courses: number;
    verified_skills: string[];
    last_activity: string;
  }>;
  skills: Array<ApiSkillMetric & {
    learner_count: number;
    coverage: OrganizationSkillOutcome["coverage"];
  }>;
  recent_activity: Array<{
    id: string;
    label: string;
    detail: string;
    occurred_at: string;
  }>;
}

function mapSkill(skill: ApiSkillMetric): SkillAnalytics {
  return {
    skillId: skill.skill_id,
    name: skill.name,
    preScore: skill.pre_score,
    postScore: skill.post_score,
    improvement: skill.improvement,
    practicalPassRate: skill.practical_pass_rate,
    retryRate: skill.retry_rate,
    commonChallenge: skill.common_challenge,
  };
}

function mapContentType(value: string): ContentAnalytics["type"] {
  if (value === "Practice" || value === "Quiz") return value;
  return "Lesson";
}

function mapContent(content: ApiContentMetric): ContentAnalytics {
  return {
    id: content.id,
    title: content.title,
    type: mapContentType(content.content_type),
    completionRate: content.completion_rate,
    ...(content.quiz_score === null ? {} : { quizScore: content.quiz_score }),
    retryRate: content.retry_rate,
  };
}

function mapAnalytics(analytics: ApiCourseAnalytics): CourseAnalytics {
  return {
    courseId: analytics.course_id,
    title: analytics.title,
    status: analytics.status,
    learnerCount: analytics.learner_count,
    activeLearners: analytics.active_learners,
    courseStarts: analytics.course_starts,
    completions: analytics.completions,
    completionRate: analytics.completion_rate,
    averageAssessmentScore: analytics.average_assessment_score,
    practicalPassRate: analytics.practical_pass_rate,
    verifiedSkills: analytics.verified_skills,
    funnel: analytics.funnel,
    assessment: {
      preAssessmentAverage: analytics.assessment.pre_assessment_average,
      postAssessmentAverage: analytics.assessment.post_assessment_average,
      averageImprovement: analytics.assessment.average_improvement,
      practicalPassRate: analytics.assessment.practical_pass_rate,
    },
    skills: analytics.skills.map(mapSkill),
    content: analytics.content.map(mapContent),
  };
}

function mapCourse(course: ApiOrganizationCourse): OrganizationCourse {
  return {
    id: course.id,
    title: course.title,
    status: course.status,
    updatedAt: course.updated_at,
    ownerName: course.owner_name,
    ...(course.analytics ? { analytics: mapAnalytics(course.analytics) } : {}),
  };
}

function largestDropOff(funnel: LearnerFunnelMetric[]) {
  let largest: CreatorAnalyticsSnapshot["largestDropOff"] = null;
  for (let index = 1; index < funnel.length; index += 1) {
    const count = funnel[index - 1].value - funnel[index].value;
    if (count > 0 && (!largest || count > largest.count)) {
      largest = { from: funnel[index - 1].label, to: funnel[index].label, count };
    }
  }
  return largest;
}

function buildAnalyticsSnapshot(
  courses: OrganizationCourse[],
  skills: OrganizationSkillOutcome[],
  totals: ApiOrganizationSnapshot["totals"],
  timeRange: AnalyticsTimeRange,
  selectedCourseId: string | null,
): CreatorAnalyticsSnapshot {
  const analyticsCourses = courses.filter((course): course is OrganizationCourse & { analytics: CourseAnalytics } => Boolean(course.analytics));
  const selectedAnalytics = analyticsCourses.find((course) => course.id === selectedCourseId)?.analytics;
  const primaryAnalytics = selectedAnalytics ?? analyticsCourses.find((course) => course.analytics.courseStarts > 0)?.analytics ?? analyticsCourses[0]?.analytics;
  const visibleCourses = selectedCourseId
    ? selectedAnalytics ? [selectedAnalytics] : []
    : analyticsCourses.map((course) => course.analytics);
  const courseStarts = analyticsCourses.reduce((total, course) => total + course.analytics.courseStarts, 0);
  const completions = analyticsCourses.reduce((total, course) => total + course.analytics.completions, 0);
  const weightedAssessmentTotal = analyticsCourses.reduce(
    (total, course) => total + course.analytics.averageAssessmentScore * course.analytics.learnerCount,
    0,
  );
  const measuredLearners = analyticsCourses.reduce((total, course) => total + course.analytics.learnerCount, 0);
  const statusCounts = (["draft", "review", "published", "unpublished"] as CourseLifecycleStatus[]).map((status) => ({
    status,
    count: courses.filter((course) => course.status === status).length,
  }));

  const courseSummaries: CreatorCourseAnalyticsSummary[] = courses.map((course) => ({
    id: course.id,
    title: course.title,
    status: course.status,
    updatedAt: course.updatedAt,
    ...(course.analytics ? { analytics: course.analytics } : {}),
  }));
  const mappedSkills = selectedAnalytics?.skills ?? skills.map((skill) => ({
    skillId: skill.skillId,
    name: skill.name,
    preScore: skill.preScore,
    postScore: skill.postScore,
    improvement: skill.improvement,
    practicalPassRate: skill.practicalPassRate,
    retryRate: skill.retryRate,
    commonChallenge: skill.commonChallenge,
  }));
  const insights: AnalyticsInsight[] = [];

  return {
    timeRange,
    selectedCourseId,
    totals: {
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.status === "published").length,
      activeLearners: totals.active_learners,
      courseStarts,
      courseCompletions: completions,
      completionRate: totals.completion_rate,
      averagePostAssessmentScore: measuredLearners ? Math.round(weightedAssessmentTotal / measuredLearners) : 0,
      verifiedSkills: totals.verified_skills,
    },
    statusCounts,
    courses: courseSummaries,
    visibleCourses,
    funnel: primaryAnalytics?.funnel ?? [],
    assessment: primaryAnalytics?.assessment ?? null,
    skills: mappedSkills,
    content: primaryAnalytics?.content ?? [],
    insights,
    largestDropOff: largestDropOff(primaryAnalytics?.funnel ?? []),
  };
}

function mapSnapshot(
  response: ApiOrganizationSnapshot,
  timeRange: AnalyticsTimeRange,
  selectedCourseId: string | null,
): OrganizationSnapshot {
  const courses = response.courses.map(mapCourse);
  const selectedCourse = selectedCourseId ? courses.find((course) => course.id === selectedCourseId) : undefined;
  const selectedSkillIds = selectedCourseId
    ? new Set(selectedCourse?.analytics?.skills.map((skill) => skill.skillId) ?? [])
    : null;
  const visibleSkillRecords = selectedSkillIds
    ? response.skills.filter((skill) => selectedSkillIds.has(skill.skill_id))
    : selectedCourseId ? [] : response.skills;
  const skills: OrganizationSkillOutcome[] = visibleSkillRecords.map(({ learner_count, coverage, ...skill }) => ({
    ...mapSkill(skill),
    learnerCount: learner_count,
    coverage,
  }));

  return {
    organization: {
      id: response.organization.id,
      name: response.organization.name,
      learningFocus: response.organization.learning_focus,
    },
    timeRange,
    selectedCourseId,
    totals: {
      activeCourses: response.totals.active_courses,
      activeLearners: response.totals.active_learners,
      completionRate: response.totals.completion_rate,
      verifiedSkills: response.totals.verified_skills,
      averageImprovement: response.totals.average_improvement,
    },
    courses,
    learners: response.learners.map((learner) => ({
      id: learner.id,
      name: learner.name,
      currentLearning: learner.current_learning.map((course) => ({
        courseId: course.course_id,
        courseTitle: course.course_title,
        progress: course.progress,
        status: course.status,
      })),
      completedCourses: learner.completed_courses,
      verifiedSkills: learner.verified_skills,
      lastActivity: learner.last_activity,
    })),
    skills,
    recentActivity: response.recent_activity.map((activity) => ({
      id: activity.id,
      label: activity.label,
      detail: activity.detail,
      occurredAt: activity.occurred_at,
    })),
    analytics: buildAnalyticsSnapshot(courses, skills, response.totals, timeRange, selectedCourseId),
  };
}

/** Load the organization-wide, learning-only snapshot for the API session. */
export async function getApiOrganizationSnapshot(
  accessToken: string,
  options: { timeRange: AnalyticsTimeRange; selectedCourseId: string | null },
) {
  const response = await apiRequest<ApiOrganizationSnapshot>("/api/organization", {
    method: "GET",
    token: accessToken,
  });
  return mapSnapshot(response, options.timeRange, options.selectedCourseId);
}
