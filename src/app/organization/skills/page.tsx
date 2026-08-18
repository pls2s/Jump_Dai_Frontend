import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { OrganizationSkills } from "@/features/organization/components/organization-skills";
import { OrganizationLoading } from "@/features/organization/components/organization-states";

export const metadata: Metadata = { title: "Organization skills and outcomes" };

export default function OrganizationSkillsPage() {
  return <Suspense fallback={<ContentContainer><OrganizationLoading label="Loading skill outcomes" /></ContentContainer>}><OrganizationSkills /></Suspense>;
}
