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

export type LearningProgressStatus = "not-started" | "in-progress" | "completed";

export interface LearnerLesson {
  id: string;
  pathItemId: string;
  moduleTitle: string;
  title: string;
  learningObjective: string;
  summary: string;
  keyConcepts: string[];
  example: string;
  practicePrompt?: string;
  sourceNames: string[];
  estimatedMinutes: number;
  skillId: string;
  emphasis: LearningPathItemEmphasis;
  personalizationReason: string;
  quickCheckId?: string;
}

export interface LearningProgress {
  status: LearningProgressStatus;
  currentLessonId?: string;
  completedLessonIds: string[];
  startedAt?: string;
  completedAt?: string;
}

export type KnowledgeCheckKind = "quick-quiz" | "post-assessment";
export type KnowledgeCheckStatus = "not-started" | "in-progress" | "submitting" | "evaluating" | "submitted";

export interface KnowledgeCheckDefinition {
  id: string;
  courseId: string;
  kind: KnowledgeCheckKind;
  title: string;
  description: string;
  estimatedMinutes: string;
  passingScore: number;
  questions: AssessmentQuestion[];
  sourceLessonId?: string;
}

export interface KnowledgeCheckResult {
  definitionId: string;
  score: number;
  passed: boolean;
  skillScores: SkillScore[];
  questionScores: QuestionScore[];
  submittedAt: string;
}

export interface KnowledgeCheckAttempt {
  id: string;
  definitionId: string;
  kind: KnowledgeCheckKind;
  status: KnowledgeCheckStatus;
  currentQuestionIndex: number;
  responses: AssessmentResponse[];
  startedAt: string;
  result?: KnowledgeCheckResult;
}

export interface PracticalDraft {
  objective: string;
  targetAudience: string;
  channelSelection: string;
  coreMessage: string;
  measurementMetrics: string;
}

export type PracticalStatus = "not-started" | "draft" | "submitted" | "evaluating" | "passed" | "needs-more-practice";

export interface PracticalRubricScore {
  criterionId: string;
  label: string;
  earned: number;
  possible: number;
  feedback: string;
}

export interface PracticalAssessmentState {
  id: string;
  status: PracticalStatus;
  draft: PracticalDraft;
  savedAt?: string;
  submittedAt?: string;
  evaluatedAt?: string;
  rubricScores?: PracticalRubricScore[];
  totalScore?: number;
  evidenceSummary?: string;
}

export type SkillVerificationStatus = "developing" | "proficient" | "verified" | "needs-more-practice";
export type CourseLearningStatus = "in-progress" | "completed" | "more-practice-recommended";

export interface SkillScoreComparison {
  skillId: string;
  name: string;
  before: number;
  after: number;
  improvement: number;
}

export interface LearnerSkillResult {
  id: string;
  courseId: string;
  learnerId: number;
  courseStatus: CourseLearningStatus;
  verificationStatus: SkillVerificationStatus;
  overallCompetencyScore: number;
  preAssessmentScore: number;
  postAssessmentScore: number;
  improvement: number;
  practicalScore: number;
  skillComparisons: SkillScoreComparison[];
  evidenceSummary: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  completedAt: string;
}

export interface LearnerJourneyState {
  version: 1;
  learnerId: number;
  courseId: string;
  assessment?: PreAssessmentAttempt;
  result?: PreAssessmentResult;
  learningPath?: PersonalizedLearningPath;
  learningProgress?: LearningProgress;
  knowledgeChecks?: Record<string, KnowledgeCheckAttempt>;
  practicalAssessment?: PracticalAssessmentState;
  skillResult?: LearnerSkillResult;
  updatedAt: string;
}
