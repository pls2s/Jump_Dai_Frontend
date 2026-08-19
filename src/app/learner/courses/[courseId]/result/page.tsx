import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { SkillResultWorkspace } from "@/features/skill-result/components/skill-result-workspace";

export default async function SkillResultPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ state?: string }> }) {
  const { courseId } = await params;
  const { state } = await searchParams;
  const course = getLearnerDemoCourse(courseId);
  if (!course && !/^\d+$/.test(courseId)) notFound();
  return <SkillResultWorkspace courseId={courseId} courseTitle={course?.title ?? `Course #${courseId}`} previewState={state} />;
}
