import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { SkillResultWorkspace } from "@/features/skill-result/components/skill-result-workspace";

export default async function SkillResultPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <SkillResultWorkspace courseId={courseId} courseTitle={course.title} />;
}
