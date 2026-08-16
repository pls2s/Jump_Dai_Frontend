import { getAuthSession } from "@/features/auth/lib/auth-session";
import { readGeneratedCourseState } from "@/features/course-generation/lib/generated-course-store";
import { loadLearningProfile } from "@/features/learner-onboarding/services/learning-profile-service";
import { loadLearningExperience } from "@/features/learner-journey/services/learning-experience-service";
import { updateLearnerJourney } from "@/features/learner-journey/lib/journey-store";
import { buildSkillPortfolio } from "@/features/skill-portfolio/lib/portfolio-builder";
import type {
  PortfolioPreviewState,
  SkillPortfolioSnapshot,
} from "@/features/skill-portfolio/types";
import { isFrontendBypassEnabled, shouldUseFrontendMocks } from "@/lib/config";

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
    certificateOffered: readGeneratedCourseState(courseId)?.course.certificateEnabled,
  });
}

export type IssueDemoCredentialResult =
  | { ok: true; portfolio: SkillPortfolioSnapshot }
  | { ok: false; message: string };

/**
 * Records an explicit local issuance action inside the existing journey store.
 * The requirement evaluator still decides eligibility; this service cannot
 * issue a credential by changing or bypassing those rules.
 */
export function issueDemoCredential(courseId: string): IssueDemoCredentialResult {
  if (!shouldUseFrontendMocks) {
    return { ok: false, message: "Credential issuance is not connected in API mode yet." };
  }
  const session = getAuthSession();
  if (!session) return { ok: false, message: "Your preview session is no longer available." };
  const current = loadSkillPortfolio(courseId);
  if (!current) return { ok: false, message: "Skill evidence could not be loaded." };
  if (!current.credential.certificateOffered) {
    return { ok: false, message: "This course does not offer a certificate." };
  }
  if (current.credential.status !== "eligible") {
    return {
      ok: false,
      message: current.credential.status === "issued"
        ? "This demo credential has already been issued."
        : "Complete every credential requirement before claiming it.",
    };
  }

  const issuedAt = new Date().toISOString();
  const journey = updateLearnerJourney(session.user.id, courseId, {
    issuedCredential: {
      id: current.credential.id,
      learnerId: session.user.id,
      courseId,
      issuedAt,
      verifiedSkillIds: current.credential.verifiedSkillIds,
    },
  });
  const profile = loadLearningProfile(session.user.id, courseId);
  return {
    ok: true,
    portfolio: buildSkillPortfolio({
      journey,
      learnerName: session.user.name,
      profile,
      certificateOffered: readGeneratedCourseState(courseId)?.course.certificateEnabled,
    }),
  };
}
