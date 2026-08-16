import { notFound } from "next/navigation";

import { isKnownCourseRouteId } from "@/data/mock/product";
import { GenerationWorkspace } from "@/features/course-generation/components/generation-workspace";

export default async function GenerateCoursePage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ state?: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  const query = await searchParams;
  return <GenerationWorkspace courseId={courseId} simulateFailure={query.state === "failed"} />;
}
