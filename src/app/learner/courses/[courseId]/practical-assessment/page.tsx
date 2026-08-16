import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { PracticalAssessmentWorkspace } from "@/features/practical-assessment/components/practical-assessment-workspace";

export default async function PracticalAssessmentPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ state?: string }> }) {
  const { courseId } = await params;
  const { state } = await searchParams;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <PracticalAssessmentWorkspace courseId={courseId} courseTitle={course.title} previewState={state} />;
}
