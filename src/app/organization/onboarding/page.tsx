import type { Metadata } from "next";
import { RolePlaceholder } from "@/features/auth/components/role-placeholder";

export const metadata: Metadata = { title: "Organization onboarding" };
export default function OrganizationOnboardingPage() {
  return <RolePlaceholder role="Organization" title="Organization workspace is planned" description="Organization profiles, member invitations, roles, assignments, and permission-aware progress will live here in a future release." />;
}
