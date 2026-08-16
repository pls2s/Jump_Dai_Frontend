import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { LearningWorkspace } from "@/features/learning-experience/components/learning-workspace";

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <LearningWorkspace courseId={courseId} courseTitle={course.title} requestedLessonId={lessonId} />;
}
