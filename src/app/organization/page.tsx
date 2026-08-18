import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { OrganizationOverview } from "@/features/organization/components/organization-overview";
import { OrganizationLoading } from "@/features/organization/components/organization-states";

export const metadata: Metadata = { title: "Organization workspace" };

export default function OrganizationPage() {
  return <Suspense fallback={<ContentContainer><OrganizationLoading /></ContentContainer>}><OrganizationOverview /></Suspense>;
}
