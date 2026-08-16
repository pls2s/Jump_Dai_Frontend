import { notFound } from "next/navigation";

import { isKnownCourseRouteId } from "@/data/mock/product";
import { GeneratedCourseWorkspace } from "@/features/course-generation/components/generated-course-workspace";

export default async function GeneratedCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  return <GeneratedCourseWorkspace courseId={courseId} />;
}
