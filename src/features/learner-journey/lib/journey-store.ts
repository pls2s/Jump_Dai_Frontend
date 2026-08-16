import type {
  LearnerJourneyState,
  LearnerIssuedCredential,
  LearnerSkillResult,
  LearningProgress,
  KnowledgeCheckAttempt,
  PracticalAssessmentState,
  PreAssessmentAttempt,
  PreAssessmentResult,
  PersonalizedLearningPath,
} from "@/features/learner-journey/types";

const storagePrefix = "skillsync-learner-journey:";

export function learnerJourneyStorageKey(learnerId: number, courseId: string) {
  return `${storagePrefix}${learnerId}:${courseId}`;
}

export function createEmptyLearnerJourney(
  learnerId: number,
  courseId: string,
): LearnerJourneyState {
  return {
    version: 1,
    learnerId,
    courseId,
    updatedAt: new Date(0).toISOString(),
  };
}

export function readLearnerJourney(learnerId: number, courseId: string) {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(learnerJourneyStorageKey(learnerId, courseId));
  if (!saved) return null;
  try {
    const journey = JSON.parse(saved) as LearnerJourneyState;
    return journey.version === 1 && journey.learnerId === learnerId && journey.courseId === courseId
      ? journey
      : null;
  } catch {
    localStorage.removeItem(learnerJourneyStorageKey(learnerId, courseId));
    return null;
  }
}

export function writeLearnerJourney(journey: LearnerJourneyState) {
  const next = { ...journey, updatedAt: new Date().toISOString() };
  localStorage.setItem(
    learnerJourneyStorageKey(journey.learnerId, journey.courseId),
    JSON.stringify(next),
  );
  return next;
}

export function updateLearnerJourney(
  learnerId: number,
  courseId: string,
  updates: {
    assessment?: PreAssessmentAttempt;
    result?: PreAssessmentResult;
    learningPath?: PersonalizedLearningPath;
    learningProgress?: LearningProgress;
    knowledgeChecks?: Record<string, KnowledgeCheckAttempt>;
    practicalAssessment?: PracticalAssessmentState;
    skillResult?: LearnerSkillResult;
    issuedCredential?: LearnerIssuedCredential;
    clearResult?: boolean;
    clearLearningPath?: boolean;
    clearLearningProgress?: boolean;
    clearKnowledgeChecks?: boolean;
    clearPracticalAssessment?: boolean;
    clearSkillResult?: boolean;
    clearIssuedCredential?: boolean;
  },
) {
  const current = readLearnerJourney(learnerId, courseId) ?? createEmptyLearnerJourney(learnerId, courseId);
  const next: LearnerJourneyState = {
    ...current,
    assessment: updates.assessment ?? current.assessment,
    result: updates.clearResult ? undefined : (updates.result ?? current.result),
    learningPath: updates.clearLearningPath ? undefined : (updates.learningPath ?? current.learningPath),
    learningProgress: updates.clearLearningProgress ? undefined : (updates.learningProgress ?? current.learningProgress),
    knowledgeChecks: updates.clearKnowledgeChecks ? undefined : (updates.knowledgeChecks ?? current.knowledgeChecks),
    practicalAssessment: updates.clearPracticalAssessment ? undefined : (updates.practicalAssessment ?? current.practicalAssessment),
    skillResult: updates.clearSkillResult ? undefined : (updates.skillResult ?? current.skillResult),
    issuedCredential: updates.clearIssuedCredential || updates.clearSkillResult
      ? undefined
      : (updates.issuedCredential ?? current.issuedCredential),
  };
  return writeLearnerJourney(next);
}
