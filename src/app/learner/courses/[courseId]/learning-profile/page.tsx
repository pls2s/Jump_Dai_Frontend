import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { LearningProfileForm } from "@/features/learner-onboarding/components/learning-profile-form";

export default async function LearningProfilePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <LearningProfileForm courseId={courseId} courseTitle={course.title} />;
}
