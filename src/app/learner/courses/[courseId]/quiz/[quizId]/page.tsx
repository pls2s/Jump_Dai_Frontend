import { notFound } from "next/navigation";

import { getLearnerDemoCourse, getQuickCheckDefinition } from "@/data/mock";
import { KnowledgeCheckWorkspace } from "@/features/learner-quiz/components/knowledge-check-workspace";

export default async function QuickQuizPage({ params, searchParams }: { params: Promise<{ courseId: string; quizId: string }>; searchParams: Promise<{ view?: string; result?: string }> }) {
  const { courseId, quizId } = await params;
  const { view, result } = await searchParams;
  const course = getLearnerDemoCourse(courseId);
  const definition = getQuickCheckDefinition(quizId);
  if (!course || !definition || definition.courseId !== courseId) notFound();
  return <KnowledgeCheckWorkspace courseId={courseId} courseTitle={course.title} definition={definition} previewView={view} previewResult={result} />;
}
