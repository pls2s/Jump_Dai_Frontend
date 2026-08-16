export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CourseSetup {
  name: string;
  description: string;
  targetLearner: string;
  level: CourseLevel;
  objectives: string[];
  certificateEnabled: boolean;
  completionCriteria: "all-lessons" | "final-assessment";
}

export type SourceType = "PDF" | "Document" | "Slide" | "Text" | "URL";
export type SourceStatus = "Uploading" | "Uploaded" | "Processing" | "Ready" | "Failed";

export interface KnowledgeSource {
  id: string;
  name: string;
  type: SourceType;
  meta: string;
  status: SourceStatus;
  updatedAt: string;
  progress?: number;
}

export interface SourceReference {
  id: string;
  sourceName: string;
  location: string;
  excerpt: string;
}

export interface Concept {
  id: string;
  name: string;
  summary: string;
  sourceCount: number;
  references: SourceReference[];
}

export interface AnalysisTopic {
  id: string;
  name: string;
  conceptCount: number;
  sourceCount: number;
  concepts: Concept[];
}

export type CourseLifecycleStatus = "draft" | "review" | "published" | "unpublished";

export type ReviewStatus = "not-reviewed" | "in-review" | "verified" | "needs-changes";

export interface GeneratedExercise {
  id: string;
  prompt: string;
}

export interface GeneratedQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface GeneratedQuiz {
  id: string;
  question: string;
  options: GeneratedQuizOption[];
  explanation: string;
}

export interface GeneratedLesson {
  id: string;
  title: string;
  learningObjective: string;
  summary: string;
  references: SourceReference[];
  exercise?: GeneratedExercise;
  quiz?: GeneratedQuiz;
}

export interface GeneratedModule {
  id: string;
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

export interface GeneratedRubricCriterion {
  id: string;
  criterion: string;
  description: string;
  weight: number;
}

export interface GeneratedPracticalTask {
  id: string;
  title: string;
  instructions: string;
  deliverables: string[];
  rubric: GeneratedRubricCriterion[];
  references: SourceReference[];
}

export interface GeneratedFinalAssessment {
  id: string;
  title: string;
  instructions: string;
  passingScore: number;
  objectiveCoverage: string[];
  references: SourceReference[];
}

export interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  targetLearner: string;
  level: CourseLevel;
  learningObjectives: string[];
  certificateEnabled: boolean;
  completionCriteria: CourseSetup["completionCriteria"];
  modules: GeneratedModule[];
  practicalTask: GeneratedPracticalTask;
  finalAssessment: GeneratedFinalAssessment;
}

export interface GeneratedCourseState {
  version: 1;
  course: GeneratedCourse;
  lifecycle: CourseLifecycleStatus;
  reviews: Record<string, ReviewStatus>;
  generatedAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ReviewableItem =
  | { kind: "course"; id: string; label: string; value: GeneratedCourse }
  | { kind: "module"; id: string; label: string; value: GeneratedModule }
  | { kind: "lesson"; id: string; label: string; value: GeneratedLesson }
  | { kind: "practical-task"; id: string; label: string; value: GeneratedPracticalTask }
  | { kind: "final-assessment"; id: string; label: string; value: GeneratedFinalAssessment };

export interface PublishReadinessCheck {
  id: string;
  label: string;
  passed: boolean;
  detail?: string;
}
