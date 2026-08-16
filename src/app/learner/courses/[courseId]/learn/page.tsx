import { ArrowLeft, BookOpenCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { getLearnerDemoCourse } from "@/data/mock";

export default async function LearningExperiencePlaceholderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return (
    <ContentContainer className="max-w-4xl">
      <PageHeader eyebrow={course.title} title="Your learning experience is next" description="Your personalized path is ready. Lessons, progress, prerequisites, and saved learning position will be implemented in Function 12." />
      <Card className="mt-8 p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-800"><BookOpenCheck className="size-6" aria-hidden="true" /></span>
        <Badge variant="accent" className="mt-5"><Sparkles className="size-3.5" aria-hidden="true" />Next product function</Badge>
        <h2 className="type-title-large mt-4">Learning Experience</h2>
        <p className="mt-2 max-w-2xl text-text-secondary">This intentional destination confirms the Function 11 handoff without pretending lesson delivery or progress tracking is available yet.</p>
        <div className="mt-7 flex flex-wrap gap-3"><ButtonLink href={`/learner/courses/${courseId}/learning-path`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to learning path</ButtonLink><ButtonLink href="/learner">Learner home</ButtonLink></div>
      </Card>
    </ContentContainer>
  );
}
