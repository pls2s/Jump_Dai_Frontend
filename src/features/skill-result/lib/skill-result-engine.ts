import type { LearnerJourneyState, LearnerSkillResult } from "@/features/learner-journey/types";
import { POST_ASSESSMENT_PASSING_SCORE } from "@/data/mock/learning-experience";

export interface SkillVerificationDecision {
  status: LearnerSkillResult["verificationStatus"];
  verified: boolean;
  reason: string;
}

export function hasRequiredPracticalEvidence(journey: LearnerJourneyState) {
  const practical = journey.practicalAssessment;
  return Boolean(practical?.submittedAt && practical.evidenceSummary && practical.totalScore !== undefined);
}

export function courseCompletionChecks(journey: LearnerJourneyState) {
  const post = journey.knowledgeChecks?.["post-assessment-digital-marketing-v1"]?.result;
  return {
    lessonsComplete: journey.learningProgress?.status === "completed",
    postAssessmentComplete: Boolean(post),
    postAssessmentPassed: Boolean(post?.passed),
    practicalComplete: Boolean(journey.practicalAssessment?.evaluatedAt),
    practicalPassed: journey.practicalAssessment?.status === "passed",
    evidencePresent: hasRequiredPracticalEvidence(journey),
  };
}

/**
 * Extends the Function 15 evidence rule to one skill. A passing course result
 * alone does not make every skill Verified: the skill must also meet the
 * post-assessment threshold and have the required applied evidence.
 */
export function skillVerificationFor(
  journey: LearnerJourneyState,
  skillId: string,
): SkillVerificationDecision {
  const checks = courseCompletionChecks(journey);
  const post = journey.knowledgeChecks?.["post-assessment-digital-marketing-v1"]?.result;
  const skillScore = post?.skillScores.find((score) => score.skillId === skillId)?.score;
  const courseEvidenceComplete = Object.values(checks).every(Boolean);

  if (
    courseEvidenceComplete &&
    skillScore !== undefined &&
    skillScore >= POST_ASSESSMENT_PASSING_SCORE
  ) {
    return {
      status: "verified",
      verified: true,
      reason: "Knowledge and applied practical evidence meet the verification requirements.",
    };
  }

  if (!checks.evidencePresent || !checks.practicalPassed) {
    return {
      status: skillScore !== undefined && skillScore >= 60 ? "proficient" : "developing",
      verified: false,
      reason: "Complete and pass the practical assessment to add applied evidence for this skill.",
    };
  }

  if (skillScore !== undefined && skillScore >= 60) {
    return {
      status: "proficient",
      verified: false,
      reason: `Reach ${POST_ASSESSMENT_PASSING_SCORE}% for this skill in the final knowledge check to qualify for verification.`,
    };
  }

  return {
    status: skillScore !== undefined && skillScore < 40 ? "needs-more-practice" : "developing",
    verified: false,
    reason: "Review the recommended learning and improve this skill in the final knowledge check.",
  };
}

export function createLearnerSkillResult(journey: LearnerJourneyState): LearnerSkillResult | null {
  const pre = journey.result;
  const post = journey.knowledgeChecks?.["post-assessment-digital-marketing-v1"]?.result;
  const practical = journey.practicalAssessment;
  if (!pre || !post || practical?.totalScore === undefined) return null;
  const checks = courseCompletionChecks(journey);
  const verified = Object.values(checks).every(Boolean);
  const overallCompetencyScore = Math.round(post.score * 0.6 + practical.totalScore * 0.4);
  const skillComparisons = pre.skillScores.map((before) => {
    const after = post.skillScores.find((score) => score.skillId === before.skillId)?.score ?? before.score;
    return { skillId: before.skillId, name: before.name, before: before.score, after, improvement: after - before.score };
  });
  return {
    id: `skill-result-${journey.courseId}-${Date.now()}`,
    courseId: journey.courseId,
    learnerId: journey.learnerId,
    courseStatus: verified ? "completed" : "more-practice-recommended",
    verificationStatus: verified ? "verified" : post.passed || practical.status === "passed" ? "proficient" : "needs-more-practice",
    overallCompetencyScore,
    preAssessmentScore: pre.overallScore,
    postAssessmentScore: post.score,
    improvement: post.score - pre.overallScore,
    practicalScore: practical.totalScore,
    skillComparisons,
    evidenceSummary: practical.evidenceSummary ?? "Practical evidence is incomplete.",
    strengths: skillComparisons.filter((item) => item.after >= 80).slice(0, 2).map((item) => `${item.name}: you now demonstrate confident understanding in this area.`),
    improvements: skillComparisons.filter((item) => item.improvement > 0).sort((a, b) => b.improvement - a.improvement).slice(0, 2).map((item) => `${item.name} improved by ${item.improvement} points.`),
    nextSteps: verified ? ["Apply this campaign-planning process to a real project.", "Keep measurement decisions connected to the campaign objective."] : ["Review your lowest post-assessment skill area.", "Revise and resubmit the practical campaign plan."],
    completedAt: new Date().toISOString(),
  };
}
