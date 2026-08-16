import { notFound } from "next/navigation";

import { getLearnerDemoCourse, postAssessmentDefinition } from "@/data/mock";
import { KnowledgeCheckWorkspace } from "@/features/learner-quiz/components/knowledge-check-workspace";

export default async function PostAssessmentPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ view?: string; result?: string }> }) {
  const { courseId } = await params;
  const { view, result } = await searchParams;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <KnowledgeCheckWorkspace courseId={courseId} courseTitle={course.title} definition={postAssessmentDefinition} previewView={view} previewResult={result} />;
}
