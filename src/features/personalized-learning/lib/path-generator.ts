import { learningGoalOptions, learningPathCatalog } from "@/data/mock";
import { WEAK_SKILL_THRESHOLD } from "@/features/learner-assessment/lib/assessment-config";
import type { LearnerLearningProfile, LearningPreference } from "@/features/learner-onboarding/types";
import type {
  LearningActivityType,
  PersonalizedLearningPath,
  PersonalizedPathItem,
  PreAssessmentResult,
} from "@/features/learner-journey/types";

const preferenceActivity: Partial<Record<LearningPreference, LearningActivityType>> = {
  "short-explanations": "Short explanation",
  "step-by-step": "Step-by-step example",
  "hands-on": "Practice",
  "visual-summaries": "Visual summary",
  "quick-quizzes": "Quick quiz",
  "real-world-scenarios": "Scenario",
};

const paceMultiplier = { quick: 0.8, balanced: 1, "in-depth": 1.25 } as const;

function uniqueActivities(items: LearningActivityType[]) {
  return Array.from(new Set(items));
}

export function createPersonalizedLearningPath(
  profile: LearnerLearningProfile,
  result: PreAssessmentResult,
  previousVersion = 0,
): PersonalizedLearningPath {
  if (!profile.pace || !profile.goal) {
    throw new Error("A complete learning profile is required to build a path.");
  }
  const pace = profile.pace;
  const preferredActivities = profile.learningPreferences
    .map((preference) => preferenceActivity[preference])
    .filter((activity): activity is LearningActivityType => Boolean(activity));
  const orderedScores = [...result.skillScores].sort((a, b) => a.score - b.score);
  const items: PersonalizedPathItem[] = orderedScores.map((skill, index) => {
    const catalog = learningPathCatalog.find((item) => item.skillId === skill.skillId);
    if (!catalog) throw new Error(`Missing learning-path catalog item for ${skill.skillId}.`);
    const weak = skill.score < WEAK_SKILL_THRESHOLD;
    const strong = skill.score >= 80;
    const emphasis = weak ? "priority" : strong ? "quick-refresher" : "recommended";
    const activities = strong
      ? uniqueActivities(["Short explanation", "Optional review"])
      : uniqueActivities([
          ...catalog.coreActivities,
          ...preferredActivities.slice(0, weak ? 3 : 2),
        ]);
    const emphasisMultiplier = weak ? 1.2 : strong ? 0.45 : 0.85;
    return {
      id: `path-${skill.skillId}`,
      sequence: index + 1,
      skillId: skill.skillId,
      topicId: skill.topicId,
      title: catalog.title,
      emphasis,
      reason: weak
        ? `This was one of your lowest pre-assessment areas (${skill.score}%), so it includes more guided practice.`
        : strong
          ? `You scored ${skill.score}% here, so required ideas are kept as a concise refresher.`
          : `Your ${skill.score}% result shows a useful foundation with room to build confidence.`,
      estimatedMinutes: Math.max(8, Math.round(catalog.baseMinutes * emphasisMultiplier * paceMultiplier[pace])),
      activities,
      skillAddressed: catalog.skillAddressed,
    };
  });
  const goal = learningGoalOptions.find((option) => option.id === profile.goal)?.label ?? "Your learning goal";
  return {
    id: `learning-path-${profile.courseId}-${Date.now()}`,
    learnerId: profile.learnerId,
    courseId: profile.courseId,
    pathVersion: previousVersion + 1,
    generatedAt: new Date().toISOString(),
    sourceAssessmentId: result.attemptId,
    status: previousVersion > 0 ? "updated" : "ready",
    pace,
    preferencesUsed: profile.learningPreferences,
    goalLabel: goal,
    focusAreaCount: result.prioritySkillIds.length,
    recommendedModuleCount: items.filter((item) => item.emphasis !== "quick-refresher").length,
    estimatedMinutes: items.reduce((total, item) => total + item.estimatedMinutes, 0),
    items,
  };
}

export function formatLearningTime(totalMinutes: number) {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
