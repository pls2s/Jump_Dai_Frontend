import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { OrganizationLearners } from "@/features/organization/components/organization-learners";
import { OrganizationLoading } from "@/features/organization/components/organization-states";

export const metadata: Metadata = { title: "Organization learners" };

export default function OrganizationLearnersPage() {
  return <Suspense fallback={<ContentContainer><OrganizationLoading label="Loading organization learners" /></ContentContainer>}><OrganizationLearners /></Suspense>;
}
