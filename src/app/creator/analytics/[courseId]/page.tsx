import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsWorkspace } from "@/features/creator-analytics/components/analytics-workspace";

export const metadata: Metadata = { title: "Course analytics" };

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <Suspense fallback={<div role="status" className="px-5 py-12 text-text-secondary sm:px-8">Loading course analytics…</div>}><AnalyticsWorkspace fixedCourseId={courseId} /></Suspense>;
}
