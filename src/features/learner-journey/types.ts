import type { LearningPace, LearningPreference } from "@/features/learner-onboarding/types";

export type AssessmentQuestionType = "multiple-choice" | "multiple-select";
export type AssessmentDifficulty = "beginner" | "intermediate" | "advanced";

export interface AssessmentOption {
  id: string;
  text: string;
  /** Mock scoring fixture only. Never reveal this before submission. */
  isCorrect: boolean;
}

export interface AssessmentQuestion {
  id: string;
  topicId: string;
  skillId: string;
  type: AssessmentQuestionType;
  prompt: string;
  context?: string;
  options: AssessmentOption[];
  explanation: string;
  difficulty: AssessmentDifficulty;
}

export interface PreAssessmentDefinition {
  id: string;
  courseId: string;
  title: string;
  estimatedMinutes: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentResponse {
  questionId: string;
  selectedOptionIds: string[];
}

export type AssessmentAttemptStatus = "in-progress" | "evaluating" | "completed";

export interface PreAssessmentAttempt {
  id: string;
  assessmentId: string;
  learnerId: number;
  courseId: string;
  status: AssessmentAttemptStatus;
  currentQuestionIndex: number;
  responses: AssessmentResponse[];
  startedAt: string;
  submittedAt?: string;
}

export type SkillLevelStatus = "needs-focus" | "developing" | "proficient" | "strong";

export interface AssessmentSkill {
  id: string;
  topicId: string;
  name: string;
  whyItMatters: string;
  strengthMessage: string;
}

export interface QuestionScore {
  questionId: string;
  score: number;
  isCorrect: boolean;
}

export interface SkillScore {
  skillId: string;
  topicId: string;
  name: string;
  score: number;
  status: SkillLevelStatus;
  questionCount: number;
}

export interface PreAssessmentResult {
  assessmentId: string;
  attemptId: string;
  overallScore: number;
  skillScores: SkillScore[];
  questionScores: QuestionScore[];
  prioritySkillIds: string[];
  strengthSkillIds: string[];
  completedAt: string;
}

export type LearningPathItemEmphasis = "priority" | "recommended" | "quick-refresher";
export type LearningActivityType = "Lesson" | "Short explanation" | "Step-by-step example" | "Practice" | "Scenario" | "Visual summary" | "Quick quiz" | "Optional review";

export interface PersonalizedPathItem {
  id: string;
  sequence: number;
  skillId: string;
  topicId: string;
  title: string;
  emphasis: LearningPathItemEmphasis;
  reason: string;
  estimatedMinutes: number;
  activities: LearningActivityType[];
  skillAddressed: string;
}

export type LearningPathStatus = "ready" | "updated";

export interface PersonalizedLearningPath {
  id: string;
  learnerId: number;
  courseId: string;
  pathVersion: number;
  generatedAt: string;
  sourceAssessmentId: string;
  status: LearningPathStatus;
  pace: LearningPace;
  preferencesUsed: LearningPreference[];
  goalLabel: string;
  focusAreaCount: number;
  recommendedModuleCount: number;
  estimatedMinutes: number;
  items: PersonalizedPathItem[];
}

export interface LearnerJourneyState {
  version: 1;
  learnerId: number;
  courseId: string;
  assessment?: PreAssessmentAttempt;
  result?: PreAssessmentResult;
  learningPath?: PersonalizedLearningPath;
  updatedAt: string;
}
