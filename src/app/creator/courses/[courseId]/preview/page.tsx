import { notFound } from "next/navigation";

import { isKnownCourseRouteId } from "@/data/mock/product";
import { PreviewWorkspace } from "@/features/course-publishing/components/preview-workspace";

export default async function CoursePreviewPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ state?: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  const query = await searchParams;
  return <PreviewWorkspace courseId={courseId} simulateFailure={query.state === "failed"} />;
}
