import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { AssessmentReview } from "@/features/skill-gap/components/assessment-review";

export default async function AssessmentReviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <AssessmentReview courseId={courseId} courseTitle={course.title} />;
}
