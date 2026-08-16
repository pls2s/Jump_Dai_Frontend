import type {
  FamiliarityLevel,
  LearningGoal,
  LearningOption,
  LearningPace,
  LearningPreference,
  SessionLength,
} from "@/features/learner-onboarding/types";
import type { LearnerLearningProfile } from "@/features/learner-onboarding/types";

export const learnerDemoCourse = {
  id: "digital-marketing-foundations",
  title: "Digital Marketing Foundations",
  description: "Build practical skills for planning, choosing channels, and measuring digital campaigns.",
  level: "Beginner",
  moduleCount: 4,
  certificateAvailable: true,
  estimatedTime: "3–4 hours",
} as const;

export const learningGoalOptions: LearningOption<LearningGoal>[] = [
  { id: "new-skill", label: "Build a new skill", description: "Start from the foundations and build practical confidence." },
  { id: "current-role", label: "Improve skills for my current role", description: "Apply this topic more effectively in your current work." },
  { id: "new-role", label: "Prepare for a new role", description: "Build knowledge for a role or responsibility you want next." },
  { id: "refresh", label: "Refresh existing knowledge", description: "Revisit key ideas and update what you already know." },
  { id: "required-course", label: "Complete a required course", description: "Meet a learning or workplace requirement." },
  { id: "explore", label: "Explore this topic", description: "Learn enough to understand whether this topic interests you." },
  { id: "other", label: "Other", description: "Describe a different primary goal." },
];

export const familiarityOptions: LearningOption<FamiliarityLevel>[] = [
  { id: "new", label: "I’m new to this" },
  { id: "basics", label: "I know the basics" },
  { id: "some-experience", label: "I have some experience" },
  { id: "confident", label: "I’m already confident" },
];

export const learningPreferenceOptions: LearningOption<LearningPreference>[] = [
  { id: "short-explanations", label: "Short explanations" },
  { id: "step-by-step", label: "Step-by-step examples" },
  { id: "hands-on", label: "Hands-on practice" },
  { id: "visual-summaries", label: "Visual summaries" },
  { id: "quick-quizzes", label: "Quick quizzes" },
  { id: "real-world-scenarios", label: "Real-world scenarios" },
];

export const learningPaceOptions: LearningOption<LearningPace>[] = [
  { id: "quick", label: "Quick and focused", description: "Keep explanations concise while covering required content." },
  { id: "balanced", label: "Balanced", description: "Mix explanation, examples, and practice." },
  { id: "in-depth", label: "In-depth", description: "Spend more time on context, examples, and practice." },
];

export const sessionLengthOptions: LearningOption<SessionLength>[] = [
  { id: "10-15", label: "10–15 min" },
  { id: "20-30", label: "20–30 min" },
  { id: "30-45", label: "30–45 min" },
  { id: "flexible", label: "Flexible" },
];

export function getLearnerDemoCourse(courseId: string) {
  return courseId === learnerDemoCourse.id ? learnerDemoCourse : undefined;
}

/** Development fixture used only when a bypass route is opened out of sequence. */
export function createDemoLearnerProfile(
  learnerId: number,
  courseId: string,
): LearnerLearningProfile {
  return {
    version: 1,
    learnerId,
    courseId,
    goal: "current-role",
    otherGoal: "",
    goalDetail: "I want to plan practical digital campaigns with more confidence.",
    familiarity: "basics",
    learningPreferences: ["hands-on", "quick-quizzes", "real-world-scenarios"],
    pace: "balanced",
    sessionLength: "20-30",
    updatedAt: new Date().toISOString(),
  };
}
