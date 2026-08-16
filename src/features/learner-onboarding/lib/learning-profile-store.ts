import type { LearnerLearningProfile } from "@/features/learner-onboarding/types";

const storagePrefix = "skillsync-learner-learning-profile:";

export function learningProfileStorageKey(learnerId: number, courseId: string) {
  return `${storagePrefix}${learnerId}:${courseId}`;
}

export function createEmptyLearningProfile(learnerId: number, courseId: string): LearnerLearningProfile {
  return {
    version: 1,
    learnerId,
    courseId,
    goal: "",
    otherGoal: "",
    goalDetail: "",
    familiarity: "",
    learningPreferences: [],
    pace: "",
    sessionLength: "",
    updatedAt: new Date(0).toISOString(),
  };
}

export function readLearningProfile(learnerId: number, courseId: string) {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(learningProfileStorageKey(learnerId, courseId));
  if (!saved) return null;
  try {
    const profile = JSON.parse(saved) as LearnerLearningProfile;
    return profile.version === 1 && profile.learnerId === learnerId && profile.courseId === courseId ? profile : null;
  } catch {
    localStorage.removeItem(learningProfileStorageKey(learnerId, courseId));
    return null;
  }
}

export function writeLearningProfile(profile: LearnerLearningProfile) {
  const next = { ...profile, updatedAt: new Date().toISOString() };
  localStorage.setItem(learningProfileStorageKey(profile.learnerId, profile.courseId), JSON.stringify(next));
  return next;
}
