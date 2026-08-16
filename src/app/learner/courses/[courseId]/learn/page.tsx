import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { LearningWorkspace } from "@/features/learning-experience/components/learning-workspace";

export default async function LearningPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ state?: string }> }) {
  const { courseId } = await params;
  const { state } = await searchParams;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <LearningWorkspace courseId={courseId} courseTitle={course.title} previewState={state} />;
}
