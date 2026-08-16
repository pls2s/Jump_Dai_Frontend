import { getAuthSession } from "@/features/auth/lib/auth-session";
import { loadLearningProfile } from "@/features/learner-onboarding/services/learning-profile-service";
import { loadLearningExperience } from "@/features/learner-journey/services/learning-experience-service";
import { buildSkillPortfolio } from "@/features/skill-portfolio/lib/portfolio-builder";
import type {
  PortfolioPreviewState,
  SkillPortfolioSnapshot,
} from "@/features/skill-portfolio/types";
import { isFrontendBypassEnabled } from "@/lib/config";

const previewStates = new Set<PortfolioPreviewState>([
  "default",
  "empty",
  "partial",
  "not-eligible",
  "eligible",
  "issued",
  "certificate-disabled",
]);

export function normalizePortfolioPreviewState(value?: string): PortfolioPreviewState {
  if (!isFrontendBypassEnabled || !value || !previewStates.has(value as PortfolioPreviewState)) {
    return "default";
  }
  return value as PortfolioPreviewState;
}

/**
 * Frontend portfolio boundary. Evidence and credential eligibility are derived
 * from the persisted learner journey so there is no competing storage record.
 */
export function loadSkillPortfolio(
  courseId: string,
  requestedPreviewState?: string,
): SkillPortfolioSnapshot | null {
  const session = getAuthSession();
  if (!session) return null;
  const previewState = normalizePortfolioPreviewState(requestedPreviewState);
  const profile = loadLearningProfile(session.user.id, courseId);
  const { journey } = loadLearningExperience(session.user.id, courseId, "result-ready");
  return buildSkillPortfolio({
    journey,
    learnerName: session.user.name,
    profile,
    previewState,
  });
}
