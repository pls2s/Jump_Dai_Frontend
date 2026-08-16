import { ArrowLeft, FolderCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { getLearnerDemoCourse } from "@/data/mock";

export default async function SkillEvidencePlaceholderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getLearnerDemoCourse(courseId);
  if (!course) notFound();
  return <ContentContainer className="max-w-4xl"><PageHeader eyebrow={course.title} title="Your skill evidence is ready for the next step" description="SkillSync will organize eligible assessment results and practical evidence into your portfolio in Function 16." /><Card className="mt-8 p-6 sm:p-8"><span className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-800"><FolderCheck className="size-6" aria-hidden="true" /></span><Badge variant="accent" className="mt-5"><Sparkles className="size-3.5" aria-hidden="true" />Next product function</Badge><h2 className="type-title-large mt-4">Skill Evidence / Portfolio / Credential</h2><p className="mt-2 max-w-2xl text-text-secondary">This destination does not issue a badge or certificate. Function 16 must apply its own evidence and eligibility rules before presenting a credential.</p><div className="mt-7 flex flex-wrap gap-3"><ButtonLink href={`/learner/courses/${courseId}/result`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to skill result</ButtonLink><ButtonLink href="/learner">Learner home</ButtonLink></div></Card></ContentContainer>;
}
