import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { LearningPathWorkspace } from "@/features/personalized-learning/components/learning-path-workspace";

export default async function LearningPathPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ view?: string; state?: string }> }) {
  const { courseId } = await params;
  const { view, state } = await searchParams;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <LearningPathWorkspace courseId={courseId} courseTitle={course.title} previewView={view} previewState={state} />;
}
