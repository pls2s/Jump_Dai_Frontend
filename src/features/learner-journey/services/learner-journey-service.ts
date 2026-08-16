import {
  demoAssessmentResponses,
  digitalMarketingPreAssessment,
} from "@/data/mock/pre-assessment";
import { isFrontendBypassEnabled } from "@/lib/config";
import { calculateAssessmentResult } from "@/features/learner-assessment/lib/assessment-engine";
import {
  createEmptyLearnerJourney,
  readLearnerJourney,
  updateLearnerJourney,
  writeLearnerJourney,
} from "@/features/learner-journey/lib/journey-store";
import type {
  AssessmentResponse,
  LearnerJourneyState,
  PreAssessmentAttempt,
  PersonalizedLearningPath,
} from "@/features/learner-journey/types";

export type JourneyPreviewFixture = "none" | "in-progress" | "completed";

export function createAssessmentAttempt(learnerId: number, courseId: string): PreAssessmentAttempt {
  return {
    id: `attempt-${courseId}-${Date.now()}`,
    assessmentId: digitalMarketingPreAssessment.id,
    learnerId,
    courseId,
    status: "in-progress",
    currentQuestionIndex: 0,
    responses: [],
    startedAt: new Date().toISOString(),
  };
}

function createCompletedFixture(learnerId: number, courseId: string): LearnerJourneyState {
  const assessment: PreAssessmentAttempt = {
    ...createAssessmentAttempt(learnerId, courseId),
    id: `preview-assessment-${courseId}`,
    status: "completed",
    currentQuestionIndex: digitalMarketingPreAssessment.questions.length - 1,
    responses: demoAssessmentResponses,
    submittedAt: new Date().toISOString(),
  };
  return {
    ...createEmptyLearnerJourney(learnerId, courseId),
    assessment,
    result: calculateAssessmentResult(digitalMarketingPreAssessment, assessment),
  };
}

/** Supplies route fixtures only in bypass mode; normal mode preserves product dependencies. */
export function loadLearnerJourney(
  learnerId: number,
  courseId: string,
  previewFixture: JourneyPreviewFixture = "none",
) {
  const stored = readLearnerJourney(learnerId, courseId);
  if (stored && !(isFrontendBypassEnabled && previewFixture === "completed" && !stored.result)) return stored;
  if (!isFrontendBypassEnabled || previewFixture === "none") {
    return createEmptyLearnerJourney(learnerId, courseId);
  }
  const fixture = previewFixture === "completed"
    ? createCompletedFixture(learnerId, courseId)
    : {
        ...createEmptyLearnerJourney(learnerId, courseId),
        assessment: createAssessmentAttempt(learnerId, courseId),
      };
  return writeLearnerJourney(fixture);
}

export function startNewAssessment(learnerId: number, courseId: string) {
  const assessment = createAssessmentAttempt(learnerId, courseId);
  return updateLearnerJourney(learnerId, courseId, {
    assessment,
    clearResult: true,
    clearLearningPath: true,
  });
}

export function saveAssessmentResponse(
  learnerId: number,
  courseId: string,
  assessment: PreAssessmentAttempt,
  response: AssessmentResponse,
  currentQuestionIndex: number,
) {
  const responses = assessment.responses.filter((item) => item.questionId !== response.questionId);
  responses.push(response);
  const nextAssessment = { ...assessment, responses, currentQuestionIndex };
  return updateLearnerJourney(learnerId, courseId, { assessment: nextAssessment });
}

export function saveAssessmentIndex(
  learnerId: number,
  courseId: string,
  assessment: PreAssessmentAttempt,
  currentQuestionIndex: number,
) {
  return updateLearnerJourney(learnerId, courseId, {
    assessment: { ...assessment, currentQuestionIndex },
  });
}

export function evaluateAssessment(
  learnerId: number,
  courseId: string,
  assessment: PreAssessmentAttempt,
) {
  const completed: PreAssessmentAttempt = {
    ...assessment,
    status: "completed",
    submittedAt: new Date().toISOString(),
  };
  const result = calculateAssessmentResult(digitalMarketingPreAssessment, completed);
  return updateLearnerJourney(learnerId, courseId, {
    assessment: completed,
    result,
    clearLearningPath: true,
  });
}

export function markAssessmentEvaluating(
  learnerId: number,
  courseId: string,
  assessment: PreAssessmentAttempt,
) {
  return updateLearnerJourney(learnerId, courseId, {
    assessment: { ...assessment, status: "evaluating" },
  });
}

export function savePersonalizedPath(
  learnerId: number,
  courseId: string,
  learningPath: PersonalizedLearningPath,
) {
  return updateLearnerJourney(learnerId, courseId, { learningPath });
}
