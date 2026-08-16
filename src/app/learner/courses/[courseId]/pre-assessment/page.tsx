import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { PreAssessmentWorkspace } from "@/features/learner-assessment/components/pre-assessment-workspace";

export default async function PreAssessmentPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ view?: string }> }) {
  const { courseId } = await params;
  const { view } = await searchParams;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <PreAssessmentWorkspace courseId={courseId} courseTitle={course.title} previewView={view} />;
}
