import type { Metadata } from "next";
import { RolePlaceholder } from "@/features/auth/components/role-placeholder";

export const metadata: Metadata = { title: "Learner onboarding" };
export default function LearnerOnboardingPage() {
  return <RolePlaceholder role="Learner" title="Learner onboarding is coming next" description="Learning goals, preferences, and pre-assessment will begin here once the learner journey is implemented." />;
}
