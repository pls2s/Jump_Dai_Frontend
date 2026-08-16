import {
  buildPersonalizedLessonSequence,
  demoPostAssessmentResponses,
  demoPracticalDraft,
  emptyPracticalDraft,
  postAssessmentDefinition,
} from "@/data/mock/learning-experience";
import { calculateKnowledgeCheckResult } from "@/features/learner-assessment/lib/knowledge-check-engine";
import { loadLearningProfile } from "@/features/learner-onboarding/services/learning-profile-service";
import { updateLearnerJourney } from "@/features/learner-journey/lib/journey-store";
import { loadLearnerJourney, savePersonalizedPath } from "@/features/learner-journey/services/learner-journey-service";
import type {
  AssessmentResponse,
  KnowledgeCheckAttempt,
  KnowledgeCheckDefinition,
  LearnerJourneyState,
  LearnerLesson,
  LearnerSkillResult,
  LearningProgress,
  PracticalAssessmentState,
} from "@/features/learner-journey/types";
import { createPersonalizedLearningPath } from "@/features/personalized-learning/lib/path-generator";
import { evaluatePracticalDraft, newPracticalAssessment } from "@/features/practical-assessment/lib/practical-evaluator";
import { createLearnerSkillResult } from "@/features/skill-result/lib/skill-result-engine";
import { isFrontendBypassEnabled } from "@/lib/config";

export type LearningPreviewStage = "path-ready" | "learning-progress" | "learning-complete" | "post-complete" | "practical-complete" | "result-ready";

function stageRank(stage: LearningPreviewStage) {
  return ["path-ready", "learning-progress", "learning-complete", "post-complete", "practical-complete", "result-ready"].indexOf(stage);
}

function createProgress(lessons: LearnerLesson[], completed = false): LearningProgress {
  return {
    status: completed ? "completed" : "not-started",
    currentLessonId: lessons[0]?.id,
    completedLessonIds: completed ? lessons.map((lesson) => lesson.id) : [],
    startedAt: completed ? new Date().toISOString() : undefined,
    completedAt: completed ? new Date().toISOString() : undefined,
  };
}

function createSubmittedPostAttempt(learnerId: number) {
  const attempt: KnowledgeCheckAttempt = {
    id: `preview-post-${learnerId}`,
    definitionId: postAssessmentDefinition.id,
    kind: "post-assessment",
    status: "submitted",
    currentQuestionIndex: postAssessmentDefinition.questions.length - 1,
    responses: demoPostAssessmentResponses,
    startedAt: new Date().toISOString(),
  };
  return { ...attempt, result: calculateKnowledgeCheckResult(postAssessmentDefinition, attempt) };
}

/** Hydrates only bypass previews; normal product routes retain every dependency gate. */
export function loadLearningExperience(
  learnerId: number,
  courseId: string,
  minimumStage: LearningPreviewStage = "path-ready",
) {
  const profile = loadLearningProfile(learnerId, courseId);
  let journey = loadLearnerJourney(learnerId, courseId, isFrontendBypassEnabled ? "completed" : "none");
  if (!journey.learningPath && isFrontendBypassEnabled && profile && journey.result) {
    journey = savePersonalizedPath(learnerId, courseId, createPersonalizedLearningPath(profile, journey.result));
  }
  const lessons = journey.learningPath ? buildPersonalizedLessonSequence(journey.learningPath) : [];
  if (!isFrontendBypassEnabled) return { journey, lessons };

  if (!journey.learningProgress) {
    journey = updateLearnerJourney(learnerId, courseId, { learningProgress: createProgress(lessons, stageRank(minimumStage) >= 2) });
  } else if (stageRank(minimumStage) >= 2 && journey.learningProgress.status !== "completed") {
    journey = updateLearnerJourney(learnerId, courseId, { learningProgress: createProgress(lessons, true) });
  }

  if (stageRank(minimumStage) >= 3 && !journey.knowledgeChecks?.[postAssessmentDefinition.id]?.result?.passed) {
    const post = createSubmittedPostAttempt(learnerId);
    journey = updateLearnerJourney(learnerId, courseId, { knowledgeChecks: { ...(journey.knowledgeChecks ?? {}), [postAssessmentDefinition.id]: post } });
  }

  if (stageRank(minimumStage) >= 4 && journey.practicalAssessment?.status !== "passed") {
    const practical = evaluatePracticalDraft({ ...newPracticalAssessment(demoPracticalDraft), status: "evaluating", submittedAt: new Date().toISOString() });
    journey = updateLearnerJourney(learnerId, courseId, { practicalAssessment: practical });
  }

  if (stageRank(minimumStage) >= 5 && !journey.skillResult) {
    const skillResult = createLearnerSkillResult(journey);
    if (skillResult) journey = updateLearnerJourney(learnerId, courseId, { skillResult });
  }

  return { journey, lessons };
}

export function beginLessonProgress(learnerId: number, courseId: string, journey: LearnerJourneyState, lessonId: string) {
  const progress: LearningProgress = journey.learningProgress
    ? { ...journey.learningProgress, status: journey.learningProgress.status === "completed" ? "completed" : "in-progress", currentLessonId: lessonId, startedAt: journey.learningProgress.startedAt ?? new Date().toISOString() }
    : { status: "in-progress", currentLessonId: lessonId, completedLessonIds: [], startedAt: new Date().toISOString() };
  return updateLearnerJourney(learnerId, courseId, { learningProgress: progress });
}

export function completeLesson(learnerId: number, courseId: string, journey: LearnerJourneyState, lessonId: string, lessons: LearnerLesson[]) {
  const completedLessonIds = Array.from(new Set([...(journey.learningProgress?.completedLessonIds ?? []), lessonId]));
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const nextLesson = lessons[currentIndex + 1];
  const completed = completedLessonIds.length >= lessons.length;
  const progress: LearningProgress = {
    status: completed ? "completed" : "in-progress",
    currentLessonId: nextLesson?.id ?? lessonId,
    completedLessonIds,
    startedAt: journey.learningProgress?.startedAt ?? new Date().toISOString(),
    completedAt: completed ? new Date().toISOString() : undefined,
  };
  return updateLearnerJourney(learnerId, courseId, { learningProgress: progress, clearSkillResult: true });
}

export function createKnowledgeCheckAttempt(definition: KnowledgeCheckDefinition): KnowledgeCheckAttempt {
  return { id: `check-${definition.id}-${Date.now()}`, definitionId: definition.id, kind: definition.kind, status: "in-progress", currentQuestionIndex: 0, responses: [], startedAt: new Date().toISOString() };
}

export function saveKnowledgeCheckAttempt(learnerId: number, courseId: string, journey: LearnerJourneyState, attempt: KnowledgeCheckAttempt) {
  return updateLearnerJourney(learnerId, courseId, { knowledgeChecks: { ...(journey.knowledgeChecks ?? {}), [attempt.definitionId]: attempt }, clearSkillResult: attempt.kind === "post-assessment" });
}

export function saveKnowledgeCheckResponse(learnerId: number, courseId: string, journey: LearnerJourneyState, attempt: KnowledgeCheckAttempt, response: AssessmentResponse, currentQuestionIndex: number) {
  const responses = attempt.responses.filter((item) => item.questionId !== response.questionId);
  responses.push(response);
  return saveKnowledgeCheckAttempt(learnerId, courseId, journey, { ...attempt, responses, currentQuestionIndex });
}

export function submitKnowledgeCheck(learnerId: number, courseId: string, journey: LearnerJourneyState, attempt: KnowledgeCheckAttempt, definition: KnowledgeCheckDefinition) {
  const submitted: KnowledgeCheckAttempt = { ...attempt, status: "submitted" };
  submitted.result = calculateKnowledgeCheckResult(definition, submitted);
  return saveKnowledgeCheckAttempt(learnerId, courseId, journey, submitted);
}

export function savePracticalAssessment(learnerId: number, courseId: string, practicalAssessment: PracticalAssessmentState) {
  return updateLearnerJourney(learnerId, courseId, { practicalAssessment, clearSkillResult: true });
}

export function ensurePracticalDraft(journey: LearnerJourneyState) {
  return journey.practicalAssessment ?? newPracticalAssessment(emptyPracticalDraft);
}

export function saveSkillResult(learnerId: number, courseId: string, skillResult: LearnerSkillResult) {
  return updateLearnerJourney(learnerId, courseId, { skillResult });
}

export function loadKnowledgeCheckExperience(
  learnerId: number,
  courseId: string,
  definition: KnowledgeCheckDefinition,
  previewResult?: "passed" | "needs-practice",
) {
  const loaded = loadLearningExperience(learnerId, courseId, "learning-complete");
  const existingResult = loaded.journey.knowledgeChecks?.[definition.id]?.result;
  if (!isFrontendBypassEnabled || !previewResult || (existingResult && existingResult.passed === (previewResult === "passed"))) return loaded;
  const responses = definition.kind === "post-assessment"
    ? (previewResult === "passed" ? demoPostAssessmentResponses : definition.questions.map((question) => ({ questionId: question.id, selectedOptionIds: [question.options.find((option) => !option.isCorrect)?.id ?? ""] })))
    : definition.questions.map((question) => ({ questionId: question.id, selectedOptionIds: [previewResult === "passed" ? question.options.find((option) => option.isCorrect)?.id ?? "" : question.options.find((option) => !option.isCorrect)?.id ?? ""] }));
  const attempt: KnowledgeCheckAttempt = { id: `preview-${definition.id}-${learnerId}`, definitionId: definition.id, kind: definition.kind, status: "submitted", currentQuestionIndex: definition.questions.length - 1, responses, startedAt: new Date().toISOString() };
  attempt.result = calculateKnowledgeCheckResult(definition, attempt);
  const journey = saveKnowledgeCheckAttempt(learnerId, courseId, loaded.journey, attempt);
  return { journey, lessons: loaded.lessons };
}

export function loadPracticalExperience(
  learnerId: number,
  courseId: string,
  previewState?: "evaluating" | "passed" | "needs-practice",
) {
  if (isFrontendBypassEnabled && previewState === "passed") return loadLearningExperience(learnerId, courseId, "practical-complete");
  const loaded = loadLearningExperience(learnerId, courseId, "post-complete");
  const existingStatus = loaded.journey.practicalAssessment?.status;
  const matchesPreview = previewState === "evaluating" ? existingStatus === "evaluating" : previewState === "passed" ? existingStatus === "passed" : existingStatus === "needs-more-practice";
  if (!isFrontendBypassEnabled || !previewState || matchesPreview) return loaded;
  const draft = previewState === "needs-practice"
    ? { objective: "Get more sales", targetAudience: "Local owners", channelSelection: "Use social media", coreMessage: "Book today", measurementMetrics: "Track clicks" }
    : demoPracticalDraft;
  const base: PracticalAssessmentState = { ...newPracticalAssessment(draft), status: "evaluating", submittedAt: new Date().toISOString() };
  const practicalAssessment = previewState === "evaluating" ? base : evaluatePracticalDraft(base);
  const journey = savePracticalAssessment(learnerId, courseId, practicalAssessment);
  return { journey, lessons: loaded.lessons };
}
