import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { SkillGapWorkspace } from "@/features/skill-gap/components/skill-gap-workspace";

export default async function SkillGapPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <SkillGapWorkspace courseId={courseId} courseTitle={course.title} />;
}
