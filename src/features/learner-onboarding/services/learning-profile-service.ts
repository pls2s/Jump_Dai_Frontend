import { demoDelay } from "@/lib/mock/demo-services";
import { createDemoLearnerProfile } from "@/data/mock/learner";
import { isFrontendBypassEnabled } from "@/lib/config";
import type { LearnerLearningProfile } from "../types";
import { readLearningProfile, writeLearningProfile } from "../lib/learning-profile-store";

/** Frontend-only persistence boundary; replace this implementation when Function 08 APIs exist. */
export async function saveLearningProfile(profile: LearnerLearningProfile) {
  await demoDelay(320);
  return writeLearningProfile(profile);
}

/** Normal mode returns only real saved input; bypass may hydrate a route-safe demo fixture. */
export function loadLearningProfile(learnerId: number, courseId: string) {
  const saved = readLearningProfile(learnerId, courseId);
  if (saved) return saved;
  if (!isFrontendBypassEnabled) return null;
  return writeLearningProfile(createDemoLearnerProfile(learnerId, courseId));
}
