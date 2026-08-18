import type {
  AnalyticsInsight,
  AnalyticsTimeRange,
  AssessmentAnalytics,
  ContentAnalytics,
  CourseAnalytics,
  CreatorAnalyticsSnapshot,
  CreatorAnalyticsTotals,
  CreatorCourseAnalyticsSummary,
  LearnerFunnelMetric,
  SkillAnalytics,
} from "@/features/creator-analytics/types";
import type { CourseLifecycleStatus } from "@/types/product";

const rangeFactors: Record<AnalyticsTimeRange, number> = {
  "7d": 0.18,
  "30d": 0.48,
  "90d": 0.78,
  all: 1,
};

const rangeScoreOffsets: Record<AnalyticsTimeRange, number> = {
  "7d": 1,
  "30d": 0,
  "90d": -1,
  all: 0,
};

function scaleCount(value: number, range: AnalyticsTimeRange) {
  if (value === 0) return 0;
  return Math.max(1, Math.round(value * rangeFactors[range]));
}

export function scaleAnalyticsCount(value: number, range: AnalyticsTimeRange) {
  return scaleCount(value, range);
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function scaleCourseAnalytics(
  course: CourseAnalytics,
  timeRange: AnalyticsTimeRange,
): CourseAnalytics {
  if (timeRange === "all" || course.courseStarts === 0) return structuredClone(course);
  const funnel = course.funnel.map((item) => ({
    ...item,
    value: scaleCount(item.value, timeRange),
  }));
  const courseStarts = funnel[0]?.value ?? scaleCount(course.courseStarts, timeRange);
  const completions = funnel.at(-1)?.value ?? scaleCount(course.completions, timeRange);
  const offset = rangeScoreOffsets[timeRange];
  return {
    ...structuredClone(course),
    learnerCount: courseStarts,
    activeLearners: scaleCount(course.activeLearners, timeRange),
    courseStarts,
    completions,
    completionRate: courseStarts ? Math.round((completions / courseStarts) * 100) : 0,
    averageAssessmentScore: clampPercent(course.averageAssessmentScore + offset),
    practicalPassRate: clampPercent(course.practicalPassRate + offset),
    verifiedSkills: scaleCount(course.verifiedSkills, timeRange),
    funnel,
    assessment: {
      preAssessmentAverage: clampPercent(course.assessment.preAssessmentAverage - offset),
      postAssessmentAverage: clampPercent(course.assessment.postAssessmentAverage + offset),
      averageImprovement: Math.max(0, course.assessment.averageImprovement + offset * 2),
      practicalPassRate: clampPercent(course.assessment.practicalPassRate + offset),
    },
    skills: course.skills.map((skill) => ({
      ...skill,
      postScore: clampPercent(skill.postScore + offset),
      improvement: Math.max(0, skill.improvement + offset),
    })),
    content: course.content.map((content) => ({
      ...content,
      completionRate: clampPercent(content.completionRate + offset),
      quizScore: content.quizScore === undefined ? undefined : clampPercent(content.quizScore + offset),
    })),
  };
}

function sumFunnel(courses: CourseAnalytics[]): LearnerFunnelMetric[] {
  const labels = courses[0]?.funnel ?? [];
  return labels.map((metric) => ({
    ...metric,
    value: courses.reduce(
      (total, course) => total + (course.funnel.find((item) => item.id === metric.id)?.value ?? 0),
      0,
    ),
  }));
}

function weightedAverage(
  courses: CourseAnalytics[],
  getter: (course: CourseAnalytics) => number,
) {
  const weighted = courses.reduce(
    (total, course) => total + getter(course) * course.courseStarts,
    0,
  );
  const weight = courses.reduce((total, course) => total + course.courseStarts, 0);
  return weight ? Math.round(weighted / weight) : 0;
}

function aggregateAssessment(courses: CourseAnalytics[]): AssessmentAnalytics | null {
  if (!courses.some((course) => course.courseStarts > 0)) return null;
  return {
    preAssessmentAverage: weightedAverage(courses, (course) => course.assessment.preAssessmentAverage),
    postAssessmentAverage: weightedAverage(courses, (course) => course.assessment.postAssessmentAverage),
    averageImprovement: weightedAverage(courses, (course) => course.assessment.averageImprovement),
    practicalPassRate: weightedAverage(courses, (course) => course.assessment.practicalPassRate),
  };
}

function aggregateSkills(courses: CourseAnalytics[]): SkillAnalytics[] {
  const groups = new Map<string, SkillAnalytics[]>();
  courses.flatMap((course) => course.skills).forEach((skill) => {
    groups.set(skill.skillId, [...(groups.get(skill.skillId) ?? []), skill]);
  });
  return Array.from(groups.values()).map((skills) => {
    const first = skills[0];
    const average = (getter: (skill: SkillAnalytics) => number) =>
      Math.round(skills.reduce((total, skill) => total + getter(skill), 0) / skills.length);
    return {
      ...first,
      preScore: average((skill) => skill.preScore),
      postScore: average((skill) => skill.postScore),
      improvement: average((skill) => skill.improvement),
      practicalPassRate: average((skill) => skill.practicalPassRate),
      retryRate: average((skill) => skill.retryRate),
    };
  }).sort((a, b) => b.improvement - a.improvement);
}

function aggregateContent(courses: CourseAnalytics[]): ContentAnalytics[] {
  return courses.flatMap((course) => course.content).sort((a, b) => a.completionRate - b.completionRate);
}

export function findLargestDropOff(funnel: LearnerFunnelMetric[]) {
  if (funnel.length < 2) return null;
  return funnel.slice(0, -1).map((metric, index) => ({
    from: metric.label,
    to: funnel[index + 1].label,
    count: Math.max(0, metric.value - funnel[index + 1].value),
  })).sort((a, b) => b.count - a.count)[0] ?? null;
}

export function skillsNeedingAttention(skills: SkillAnalytics[]) {
  return skills.filter((skill) =>
    skill.postScore < 70 || skill.practicalPassRate < 60 || skill.retryRate >= 20,
  ).sort((a, b) => a.practicalPassRate - b.practicalPassRate);
}

function deriveInsights(
  courses: CourseAnalytics[],
  funnel: LearnerFunnelMetric[],
  skills: SkillAnalytics[],
  content: ContentAnalytics[],
): AnalyticsInsight[] {
  if (!courses.some((course) => course.courseStarts > 0)) return [];
  const largestDropOff = findLargestDropOff(funnel);
  const largestImprovement = [...skills].sort((a, b) => b.improvement - a.improvement)[0];
  const lowestPractical = [...skills].sort((a, b) => a.practicalPassRate - b.practicalPassRate)[0];
  const lowestContent = content[0];
  return [
    largestDropOff && {
      id: "drop-off",
      title: "Largest learner drop-off",
      description: `${largestDropOff.from} → ${largestDropOff.to}: ${largestDropOff.count} learners did not continue. Consider reviewing this transition or its workload.`,
    },
    largestImprovement && {
      id: "improvement",
      title: `${largestImprovement.name} shows the largest improvement`,
      description: `Average competency increased by ${largestImprovement.improvement} points after learning.`,
    },
    lowestPractical && {
      id: "practical",
      title: `${lowestPractical.name} needs applied practice`,
      description: `Its ${lowestPractical.practicalPassRate}% practical pass rate is the lowest across measured skills.`,
    },
    lowestContent && {
      id: "content",
      title: `Review “${lowestContent.title}”`,
      description: `It has the lowest completion rate (${lowestContent.completionRate}%) in the current view.`,
    },
  ].filter((insight): insight is AnalyticsInsight => Boolean(insight));
}

function statusCounts(courses: CreatorCourseAnalyticsSummary[]) {
  const statuses: CourseLifecycleStatus[] = ["draft", "review", "published", "unpublished"];
  return statuses.map((status) => ({
    status,
    count: courses.filter((course) => course.status === status).length,
  }));
}

export function buildCreatorAnalyticsSnapshot({
  catalog,
  analytics,
  timeRange,
  selectedCourseId,
}: {
  catalog: CreatorCourseAnalyticsSummary[];
  analytics: CourseAnalytics[];
  timeRange: AnalyticsTimeRange;
  selectedCourseId: string | null;
}): CreatorAnalyticsSnapshot {
  const publishedIds = new Set(catalog.filter((course) => course.status === "published").map((course) => course.id));
  const scaled = analytics
    .filter((course) => publishedIds.has(course.courseId))
    .map((course) => scaleCourseAnalytics(course, timeRange));
  const visibleCourses = selectedCourseId
    ? scaled.filter((course) => course.courseId === selectedCourseId)
    : scaled;
  const funnel = sumFunnel(visibleCourses);
  const skills = aggregateSkills(visibleCourses);
  const content = aggregateContent(visibleCourses);
  const courseStarts = visibleCourses.reduce((total, course) => total + course.courseStarts, 0);
  const courseCompletions = visibleCourses.reduce((total, course) => total + course.completions, 0);
  const filteredCatalog = selectedCourseId
    ? catalog.filter((course) => course.id === selectedCourseId)
    : catalog;
  const totals: CreatorAnalyticsTotals = {
    totalCourses: filteredCatalog.length,
    publishedCourses: filteredCatalog.filter((course) => course.status === "published").length,
    activeLearners: visibleCourses.reduce((total, course) => total + course.activeLearners, 0),
    courseStarts,
    courseCompletions,
    completionRate: courseStarts ? Math.round((courseCompletions / courseStarts) * 100) : 0,
    averagePostAssessmentScore: weightedAverage(visibleCourses, (course) => course.averageAssessmentScore),
    verifiedSkills: visibleCourses.reduce((total, course) => total + course.verifiedSkills, 0),
  };
  return {
    timeRange,
    selectedCourseId,
    totals,
    statusCounts: statusCounts(catalog),
    courses: catalog.map((course) => ({
      ...course,
      analytics: scaled.find((item) => item.courseId === course.id),
    })),
    visibleCourses,
    funnel,
    assessment: aggregateAssessment(visibleCourses),
    skills,
    content,
    insights: deriveInsights(visibleCourses, funnel, skills, content),
    largestDropOff: findLargestDropOff(funnel),
  };
}
