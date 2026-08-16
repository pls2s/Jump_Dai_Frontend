import { generatedCourseTemplate } from "@/data/mock/generated-course";
import { learningGoalOptions } from "@/data/mock/learner";
import {
  buildPersonalizedLessonSequence,
  postAssessmentDefinition,
} from "@/data/mock/learning-experience";
import type { LearnerLearningProfile } from "@/features/learner-onboarding/types";
import type {
  LearnerJourneyState,
  PracticalAssessmentState,
} from "@/features/learner-journey/types";
import {
  courseCompletionChecks,
  skillVerificationFor,
} from "@/features/skill-result/lib/skill-result-engine";
import type {
  CredentialRequirement,
  CredentialStatus,
  PortfolioTimelineItem,
  PortfolioPreviewState,
  PortfolioSkill,
  SkillEvidence,
  SkillPortfolioSnapshot,
  SkillSyncCredential,
} from "@/features/skill-portfolio/types";

function evidenceDate(...values: Array<string | undefined>) {
  return values.find(Boolean) ?? new Date(0).toISOString();
}

function learningFocus(profile: LearnerLearningProfile | null) {
  if (!profile?.goal) return "Building practical digital marketing skills";
  if (profile.goal === "other") return profile.otherGoal || "Building a new skill";
  return learningGoalOptions.find((option) => option.id === profile.goal)?.label ?? "Building a new skill";
}

function practicalEvidence(
  journey: LearnerJourneyState,
  courseTitle: string,
): Omit<SkillEvidence, "id"> | null {
  const practical = journey.practicalAssessment;
  if (!practical?.evaluatedAt || practical.totalScore === undefined) return null;
  return {
    type: "practical-assessment",
    title: "Digital Campaign Plan",
    description: practical.evidenceSummary ?? "Applied campaign-planning evidence.",
    courseTitle,
    score: practical.totalScore,
    status: practical.status === "passed" ? "passed" : "completed",
    createdAt: practical.evaluatedAt,
    verified: practical.status === "passed",
    rubric: practical.rubricScores?.map((item) => ({
      label: item.label,
      earned: item.earned,
      possible: item.possible,
    })),
    resultHref: `/learner/courses/${journey.courseId}/practical-assessment`,
  };
}

function evidenceForSkill(
  journey: LearnerJourneyState,
  skillId: string,
  skillName: string,
  courseTitle: string,
) {
  const evidence: SkillEvidence[] = [];
  const pre = journey.result?.skillScores.find((score) => score.skillId === skillId);
  const postAttempt = journey.knowledgeChecks?.[postAssessmentDefinition.id];
  const post = postAttempt?.result?.skillScores.find((score) => score.skillId === skillId);
  const lessons = journey.learningPath
    ? buildPersonalizedLessonSequence(journey.learningPath).filter((lesson) => lesson.skillId === skillId)
    : [];
  const completedLessonCount = lessons.filter((lesson) =>
    journey.learningProgress?.completedLessonIds.includes(lesson.id),
  ).length;

  if (pre && journey.result) {
    evidence.push({
      id: `${skillId}-pre-assessment`,
      type: "pre-assessment",
      title: "Pre-Assessment",
      description: `Established a ${pre.score}% starting point for ${skillName}.`,
      courseTitle,
      score: pre.score,
      status: "recorded",
      createdAt: journey.result.completedAt,
      verified: false,
      resultHref: `/learner/courses/${journey.courseId}/skill-gap/review`,
    });
  }

  if (post && postAttempt?.result) {
    evidence.push({
      id: `${skillId}-post-assessment`,
      type: "post-assessment",
      title: "Post-Assessment",
      description: `Measured ${skillName} after the personalized learning path.`,
      courseTitle,
      score: post.score,
      status: postAttempt.result.passed ? "passed" : "completed",
      createdAt: postAttempt.result.submittedAt,
      verified: postAttempt.result.passed,
      resultHref: `/learner/courses/${journey.courseId}/post-assessment?view=result`,
    });
  }

  if (completedLessonCount > 0) {
    evidence.push({
      id: `${skillId}-learning-activities`,
      type: "learning-activity",
      title: "Learning activities completed",
      description: `${completedLessonCount} lesson${completedLessonCount === 1 ? "" : "s"} completed for ${skillName}.`,
      courseTitle,
      status: "completed",
      createdAt: evidenceDate(journey.learningProgress?.completedAt, journey.learningProgress?.startedAt),
      verified: false,
      activityCount: completedLessonCount,
      resultHref: `/learner/courses/${journey.courseId}/learn`,
    });
  }

  const practical = practicalEvidence(journey, courseTitle);
  if (practical) evidence.push({ ...practical, id: `${skillId}-practical-assessment` });

  return evidence;
}

function buildSkills(journey: LearnerJourneyState, courseTitle: string) {
  const comparisons = journey.skillResult?.skillComparisons ?? journey.result?.skillScores.map((before) => {
    const after = journey.knowledgeChecks?.[postAssessmentDefinition.id]?.result?.skillScores
      .find((score) => score.skillId === before.skillId)?.score ?? before.score;
    return {
      skillId: before.skillId,
      name: before.name,
      before: before.score,
      after,
      improvement: after - before.score,
    };
  }) ?? [];

  return comparisons.map<PortfolioSkill>((comparison) => {
    const verification = skillVerificationFor(journey, comparison.skillId);
    const evidence = evidenceForSkill(
      journey,
      comparison.skillId,
      comparison.name,
      courseTitle,
    );
    return {
      id: comparison.skillId,
      name: comparison.name,
      competencyScore: comparison.after,
      beforeScore: comparison.before,
      improvement: comparison.improvement,
      status: verification.status,
      statusReason: verification.reason,
      courseId: journey.courseId,
      courseTitle,
      evidence,
      verifiedAt: verification.verified ? journey.skillResult?.completedAt : undefined,
      nextActionHref: verification.verified
        ? undefined
        : `/learner/courses/${journey.courseId}/practical-assessment`,
      nextActionLabel: verification.verified ? undefined : "Continue assessment",
    };
  });
}

function buildCredential(
  journey: LearnerJourneyState,
  learnerName: string,
  courseTitle: string,
  skills: PortfolioSkill[],
  previewState: PortfolioPreviewState,
  certificateEnabled: boolean,
): SkillSyncCredential {
  const completion = courseCompletionChecks(journey);
  const certificateOffered = previewState !== "certificate-disabled" && certificateEnabled;
  const verifiedSkillIds = skills.filter((skill) => skill.status === "verified").map((skill) => skill.id);
  const requirements: CredentialRequirement[] = [
    {
      id: "lessons",
      label: "Complete required lessons",
      met: completion.lessonsComplete,
      detail: completion.lessonsComplete ? "All personalized required lessons are complete." : "Finish the required learning path lessons.",
    },
    {
      id: "knowledge",
      label: "Pass final knowledge assessment",
      met: completion.postAssessmentComplete && completion.postAssessmentPassed,
      detail: completion.postAssessmentPassed ? "The final knowledge threshold was met." : "Complete and pass the final knowledge check.",
    },
    {
      id: "practical-complete",
      label: "Complete practical assessment",
      met: completion.practicalComplete,
      detail: completion.practicalComplete ? "The practical submission was evaluated." : "Submit the practical campaign plan.",
    },
    {
      id: "practical-pass",
      label: "Meet practical passing criteria",
      met: completion.practicalPassed,
      detail: completion.practicalPassed ? "Applied evidence meets the passing threshold." : "Revise the practical work until it meets the threshold.",
    },
    {
      id: "verified-evidence",
      label: "Verified skill evidence available",
      met: verifiedSkillIds.length > 0,
      detail: verifiedSkillIds.length > 0 ? `${verifiedSkillIds.length} skill${verifiedSkillIds.length === 1 ? " has" : "s have"} sufficient evidence.` : "No skill has both passing knowledge and applied evidence yet.",
    },
  ];
  const requirementsMet = requirements.every((requirement) => requirement.met);
  const persistedIssue = journey.issuedCredential;
  const baseStatus: CredentialStatus = certificateOffered && requirementsMet
    ? persistedIssue
      ? "issued"
      : "eligible"
    : "not-eligible";
  const status = previewState === "eligible" && certificateOffered && requirementsMet
    ? "eligible"
    : previewState === "issued" && certificateOffered && requirementsMet
      ? "issued"
      : baseStatus;
  const completedAt = journey.skillResult?.completedAt;
  const year = new Date(completedAt ?? Date.now()).getFullYear();
  const id = persistedIssue?.id ?? `SS-DEMO-${year}-${String(journey.learnerId).padStart(3, "0")}`;

  return {
    id,
    title: "SkillSync Credential",
    status,
    learnerName,
    courseId: journey.courseId,
    courseTitle,
    issueDate: status === "issued" ? persistedIssue?.issuedAt ?? completedAt ?? new Date().toISOString() : undefined,
    verifiedSkillIds,
    assessmentScore: journey.knowledgeChecks?.[postAssessmentDefinition.id]?.result?.score,
    practicalScore: journey.practicalAssessment?.totalScore,
    evidenceSummary: journey.practicalAssessment?.evidenceSummary,
    requirements,
    certificateOffered,
  };
}

export function projectPortfolioJourney(
  journey: LearnerJourneyState,
  previewState: PortfolioPreviewState,
) {
  if (previewState === "empty") {
    return {
      version: 1,
      learnerId: journey.learnerId,
      courseId: journey.courseId,
      updatedAt: journey.updatedAt,
    } satisfies LearnerJourneyState;
  }
  if (previewState === "partial") {
    return {
      ...journey,
      practicalAssessment: undefined,
      skillResult: undefined,
    };
  }
  if (previewState === "not-eligible" && journey.practicalAssessment) {
    const practicalAssessment: PracticalAssessmentState = {
      ...journey.practicalAssessment,
      status: "needs-more-practice",
      totalScore: Math.min(journey.practicalAssessment.totalScore ?? 55, 55),
    };
    return { ...journey, practicalAssessment, skillResult: undefined };
  }
  return journey;
}

export function buildSkillPortfolio({
  journey,
  learnerName,
  profile,
  previewState = "default",
  certificateOffered = generatedCourseTemplate.certificateEnabled,
}: {
  journey: LearnerJourneyState;
  learnerName: string;
  profile: LearnerLearningProfile | null;
  previewState?: PortfolioPreviewState;
  certificateOffered?: boolean;
}): SkillPortfolioSnapshot {
  const projectedJourney = projectPortfolioJourney(journey, previewState);
  const courseTitle = generatedCourseTemplate.title;
  const skills = buildSkills(projectedJourney, courseTitle);
  const credential = buildCredential(
    projectedJourney,
    learnerName,
    courseTitle,
    skills,
    previewState,
    certificateOffered,
  );
  const evidence = skills.flatMap((skill) => skill.evidence.map((item) => ({
    ...item,
    description: `${skill.name}: ${item.description}`,
  })));
  const verifiedSkills = skills.filter((skill) => skill.status === "verified").length;
  const completedCourses = projectedJourney.skillResult?.courseStatus === "completed" ? 1 : 0;

  const timeline: PortfolioTimelineItem[] = [];
  if (projectedJourney.skillResult) {
    timeline.push({
      id: "skill-result",
      title: "Skill result completed",
      description: `${verifiedSkills} skill${verifiedSkills === 1 ? "" : "s"} supported by verified evidence.`,
      createdAt: projectedJourney.skillResult.completedAt,
      href: `/learner/courses/${journey.courseId}/result`,
    });
  }
  if (projectedJourney.practicalAssessment?.evaluatedAt) {
    timeline.push({
      id: "practical",
      title: "Completed Practical Assessment",
      description: courseTitle,
      createdAt: projectedJourney.practicalAssessment.evaluatedAt,
      href: `/learner/courses/${journey.courseId}/practical-assessment`,
    });
  }
  const postResult = projectedJourney.knowledgeChecks?.[postAssessmentDefinition.id]?.result;
  if (postResult) {
    timeline.push({
      id: "post-assessment",
      title: "Post-Assessment",
      description: `Score improved from ${projectedJourney.result?.overallScore ?? 0}% to ${postResult.score}%.`,
      createdAt: postResult.submittedAt,
      href: `/learner/courses/${journey.courseId}/post-assessment?view=result`,
    });
  }
  if (projectedJourney.learningProgress?.completedAt) {
    timeline.push({
      id: "learning-path",
      title: "Completed Personalized Learning Path",
      description: `${projectedJourney.learningProgress.completedLessonIds.length} required lessons completed.`,
      createdAt: projectedJourney.learningProgress.completedAt,
      href: `/learner/courses/${journey.courseId}/learning-path`,
    });
  }

  return {
    learnerId: journey.learnerId,
    learnerName,
    learningFocus: learningFocus(profile),
    courseId: journey.courseId,
    courseTitle,
    skills,
    evidence,
    timeline: timeline.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    credential,
    summary: {
      verifiedSkills,
      developingSkills: skills.length - verifiedSkills,
      completedCourses,
      credentials: credential.status === "issued" ? 1 : 0,
      learningInProgress: completedCourses ? 0 : skills.length > 0 ? 1 : 0,
    },
    journey: projectedJourney,
  };
}
