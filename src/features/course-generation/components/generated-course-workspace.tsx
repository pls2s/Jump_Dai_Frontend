"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Spinner } from "@/components/ui";
import { CourseStructurePanel } from "@/features/course-generation/components/course-structure-panel";
import { GeneratedContentDetail } from "@/features/course-generation/components/generated-content-detail";
import { findReviewableItem } from "@/features/course-generation/lib/generated-course-store";
import { loadGeneratedCourse } from "@/features/course-generation/services/course-generation-service";
import { SourceReferencesDrawer } from "@/features/source-grounding/components/source-references-drawer";
import type { GeneratedCourseState, SourceReference } from "@/types/product";

export function GeneratedCourseWorkspace({ courseId }: { courseId: string }) {
  const [state, setState] = useState<GeneratedCourseState | null | undefined>(undefined);
  const [selectedId, setSelectedId] = useState("course-overview");
  const [references, setReferences] = useState<SourceReference[] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setState(loadGeneratedCourse(courseId)), 0);
    return () => window.clearTimeout(timer);
  }, [courseId]);

  if (state === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading generated course…</div></ContentContainer>;
  if (!state) return <MissingGeneratedCourse courseId={courseId} />;
  const selected = findReviewableItem(state.course, selectedId);

  return (
    <ContentContainer className="max-w-[92rem]">
      <PageHeader eyebrow={state.course.title} title="AI-generated course" description="Inspect the generated structure before starting Creator Review and Human Verification." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: state.course.title }, { label: "Generated course" }]} actions={<Badge variant="accent"><Sparkles className="size-3.5" aria-hidden="true" />AI Generated</Badge>} />
      <Card className="mt-7 border-yellow-200 bg-yellow-50 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-neutral-800" aria-hidden="true" /><div><p className="font-semibold">Review required before publishing</p><p className="type-body-small mt-1 text-neutral-700">AI created this draft from your trusted sources. A Creator must inspect, edit where needed, and verify every required item.</p></div></div></Card>
      <div className="mt-7 grid gap-5 lg:grid-cols-[19.5rem_minmax(0,1fr)] xl:gap-7">
        <CourseStructurePanel course={state.course} selectedId={selected.id} onSelect={setSelectedId} />
        <Card className="min-w-0 p-5 shadow-sm sm:p-8"><GeneratedContentDetail item={selected} onViewSources={setReferences} /></Card>
      </div>
      <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/generate`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to generation</ButtonLink><ButtonLink href={`/creator/courses/${courseId}/review`} size="lg">Review generated course<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>
      {references && <SourceReferencesDrawer references={references} onClose={() => setReferences(null)} />}
    </ContentContainer>
  );
}

function MissingGeneratedCourse({ courseId }: { courseId: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center sm:p-10"><FileCheck2 className="mx-auto size-10 text-action-primary" aria-hidden="true" /><h1 className="type-h1 mt-5">Generate the course first</h1><p className="mt-3 text-text-secondary">No generated course draft is stored for this course yet.</p><ButtonLink href={`/creator/courses/${courseId}/generate`} className="mt-7">Open AI Course Generator<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
