import { notFound } from "next/navigation";

import { isKnownCourseRouteId } from "@/data/mock/product";
import { ReviewWorkspace } from "@/features/course-review/components/review-workspace";

export default async function CreatorReviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  return <ReviewWorkspace courseId={courseId} />;
}
