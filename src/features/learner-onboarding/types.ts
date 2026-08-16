export type LearningGoal =
  | "new-skill"
  | "current-role"
  | "new-role"
  | "refresh"
  | "required-course"
  | "explore"
  | "other";

export type FamiliarityLevel = "new" | "basics" | "some-experience" | "confident";

export type LearningPreference =
  | "short-explanations"
  | "step-by-step"
  | "hands-on"
  | "visual-summaries"
  | "quick-quizzes"
  | "real-world-scenarios";

export type LearningPace = "quick" | "balanced" | "in-depth";

export type SessionLength = "10-15" | "20-30" | "30-45" | "flexible";

export interface LearnerLearningProfile {
  version: 1;
  learnerId: number;
  courseId: string;
  goal: LearningGoal | "";
  otherGoal: string;
  goalDetail: string;
  familiarity: FamiliarityLevel | "";
  learningPreferences: LearningPreference[];
  pace: LearningPace | "";
  sessionLength: SessionLength | "";
  updatedAt: string;
}

export interface LearningOption<T extends string> {
  id: T;
  label: string;
  description?: string;
}
