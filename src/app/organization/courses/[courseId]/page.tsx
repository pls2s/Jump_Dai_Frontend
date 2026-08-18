import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { OrganizationCourseDetail } from "@/features/organization/components/organization-course-detail";
import { OrganizationLoading } from "@/features/organization/components/organization-states";

export const metadata: Metadata = { title: "Organization course performance" };

export default async function OrganizationCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <Suspense fallback={<ContentContainer><OrganizationLoading label="Loading course performance" /></ContentContainer>}><OrganizationCourseDetail courseId={courseId} /></Suspense>;
}
