import { notFound } from "next/navigation";

import { isKnownCourseRouteId } from "@/data/mock/product";
import { PublishedCourseWorkspace } from "@/features/course-publishing/components/published-course-workspace";
import { isFrontendBypassEnabled } from "@/lib/config";

export default async function PublishedCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  return <PublishedCourseWorkspace courseId={courseId} forcePublishedPreview={isFrontendBypassEnabled} />;
}
