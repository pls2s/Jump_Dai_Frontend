import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { OrganizationCourses } from "@/features/organization/components/organization-courses";
import { OrganizationLoading } from "@/features/organization/components/organization-states";

export const metadata: Metadata = { title: "Organization courses" };

export default function OrganizationCoursesPage() {
  return <Suspense fallback={<ContentContainer><OrganizationLoading label="Loading organization courses" /></ContentContainer>}><OrganizationCourses /></Suspense>;
}
