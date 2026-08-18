import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentContainer } from "@/components/layout";
import { AdminCourseDetail } from "@/features/admin/components/admin-courses";
import { AdminLoading } from "@/features/admin/components/admin-states";

export const metadata: Metadata = { title: "Admin course oversight" };

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <Suspense fallback={<ContentContainer><AdminLoading label="Loading course oversight" /></ContentContainer>}><AdminCourseDetail courseId={courseId} /></Suspense>;
}
