import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Organization onboarding" };
export default function OrganizationOnboardingPage() {
  redirect("/organization");
}
