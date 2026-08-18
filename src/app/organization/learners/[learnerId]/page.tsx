import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { OrganizationLearnerDetail } from "@/features/organization/components/organization-learners";
import { OrganizationLoading } from "@/features/organization/components/organization-states";

export const metadata: Metadata = { title: "Organization learner outcomes" };

export default async function OrganizationLearnerDetailPage({ params }: { params: Promise<{ learnerId: string }> }) {
  const { learnerId } = await params;
  return <Suspense fallback={<ContentContainer><OrganizationLoading label="Loading learner outcomes" /></ContentContainer>}><OrganizationLearnerDetail learnerId={learnerId} /></Suspense>;
}
