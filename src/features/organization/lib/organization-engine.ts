import {
  DEMO_ORGANIZATION,
  organizationCourseOwners,
  organizationLearners,
  organizationRecentActivity,
  organizationSkillLearnerCounts,
} from "@/data/mock/organization";
import { scaleAnalyticsCount, skillsNeedingAttention } from "@/features/creator-analytics/lib/analytics-engine";
import type { CreatorAnalyticsSnapshot } from "@/features/creator-analytics/types";
import type {
  OrganizationLearner,
  OrganizationLearnerStatus,
  OrganizationSkillCoverage,
  OrganizationSnapshot,
} from "@/features/organization/types";

function coverageFor(
  skill: CreatorAnalyticsSnapshot["skills"][number],
  attentionSkillIds: Set<string>,
): OrganizationSkillCoverage {
  if (attentionSkillIds.has(skill.skillId)) return "needs-attention";
  if (skill.postScore >= 80 && skill.practicalPassRate >= 70) return "strong";
  return "developing";
}

export function buildOrganizationSnapshot(
  analytics: CreatorAnalyticsSnapshot,
  options: { empty?: boolean } = {},
): OrganizationSnapshot {
  const learners = options.empty ? [] : organizationLearners;
  const attentionSkillIds = new Set(skillsNeedingAttention(analytics.skills).map((skill) => skill.skillId));
  const skills = analytics.skills.map((skill) => ({
    ...skill,
    learnerCount: scaleAnalyticsCount(organizationSkillLearnerCounts[skill.skillId] ?? 0, analytics.timeRange),
    coverage: coverageFor(skill, attentionSkillIds),
  }));
  const averageImprovement = skills.length
    ? Math.round(skills.reduce((total, skill) => total + skill.improvement, 0) / skills.length)
    : 0;

  return {
    organization: DEMO_ORGANIZATION,
    timeRange: analytics.timeRange,
    selectedCourseId: analytics.selectedCourseId,
    totals: {
      activeCourses: analytics.courses.filter((course) => course.status === "published").length,
      activeLearners: analytics.totals.activeLearners,
      completionRate: analytics.totals.completionRate,
      verifiedSkills: analytics.totals.verifiedSkills,
      averageImprovement,
    },
    courses: (options.empty ? [] : analytics.courses).map((course) => ({
      ...course,
      ownerName: organizationCourseOwners[course.id] ?? "Organization learning team",
    })),
    learners,
    skills,
    recentActivity: options.empty ? [] : organizationRecentActivity,
    analytics,
  };
}

export function filterOrganizationLearners(
  learners: OrganizationLearner[],
  filters: { courseId?: string | null; status?: OrganizationLearnerStatus | "all" },
) {
  return learners.filter((learner) => {
    const courseRecords = filters.courseId
      ? learner.currentLearning.filter((course) => course.courseId === filters.courseId)
      : learner.currentLearning;
    if (filters.courseId && courseRecords.length === 0) return false;
    if (filters.status && filters.status !== "all") {
      return courseRecords.some((course) => course.status === filters.status);
    }
    return true;
  });
}
