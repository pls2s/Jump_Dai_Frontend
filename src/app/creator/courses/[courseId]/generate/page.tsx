import { ArrowLeft, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { ContentContainer } from "@/components/layout";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { isKnownCourseRouteId } from "@/data/mock/product";

export default async function GenerateCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-12"><span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-blue-800 text-yellow-300"><Sparkles className="size-7" aria-hidden="true" /></span><Badge variant="success" className="mt-6">Knowledge analysis complete</Badge><h1 className="type-h1 mt-4">Ready to generate your course</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">Next feature: AI Course Generator will turn the approved knowledge structure into an outline, modules, lessons, exercises, quizzes, and assessments.</p><p className="type-body-small mx-auto mt-5 max-w-xl rounded-md bg-yellow-50 p-4 text-neutral-700">Generation is not implemented yet. Publishing will remain unavailable until generated content has passed Creator Review / Human Verification.</p><ButtonLink href={`/creator/courses/${courseId}/analysis`} variant="secondary" className="mt-8"><ArrowLeft className="size-4" aria-hidden="true" />Back to knowledge analysis</ButtonLink></Card></ContentContainer>;
}
