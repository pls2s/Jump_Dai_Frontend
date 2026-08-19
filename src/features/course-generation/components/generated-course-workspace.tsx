"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Spinner } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { getCourse, type ApiCourse } from "@/features/courses/api/course-api";
import {
  getGeneratedLearningPath,
  type ApiGeneratedLearningPath,
} from "@/features/course-generation/api/course-generation-api";
import { CourseStructurePanel } from "@/features/course-generation/components/course-structure-panel";
import { GeneratedContentDetail } from "@/features/course-generation/components/generated-content-detail";
import { findReviewableItem } from "@/features/course-generation/lib/generated-course-store";
import { loadGeneratedCourse } from "@/features/course-generation/services/course-generation-service";
import { SourceReferencesDrawer } from "@/features/source-grounding/components/source-references-drawer";
import { ApiError } from "@/lib/api/api-client";
import type { GeneratedCourseState, SourceReference } from "@/types/product";

function backendIdFor(courseId: string) {
  return /^\d+$/.test(courseId) ? Number(courseId) : null;
}

export function GeneratedCourseWorkspace({ courseId }: { courseId: string }) {
  const backendCourseId = backendIdFor(courseId);
  if (backendCourseId !== null) return <ApiGeneratedCourseWorkspace courseId={courseId} backendCourseId={backendCourseId} />;
  return <StoredGeneratedCourseWorkspace courseId={courseId} />;
}

function ApiGeneratedCourseWorkspace({ courseId, backendCourseId }: { courseId: string; backendCourseId: number }) {
  const [draft, setDraft] = useState<{ course: ApiCourse; learningPath: ApiGeneratedLearningPath } | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.mode !== "api") {
      const timer = window.setTimeout(() => {
        setError("Sign in with the backend before viewing this generated course.");
        setDraft(null);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    void Promise.all([
      getCourse(backendCourseId, session.accessToken),
      getGeneratedLearningPath(backendCourseId, session.accessToken),
    ]).then(([course, learningPath]) => {
      if (!cancelled) setDraft({ course, learningPath });
    }).catch((caught) => {
      if (cancelled) return;
      setError(caught instanceof ApiError ? caught.message : "We couldn’t load the generated learning path.");
      setDraft(null);
    });
    return () => { cancelled = true; };
  }, [backendCourseId]);

  if (draft === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading Typhoon’s generated course…</div></ContentContainer>;
  if (!draft) return <MissingGeneratedCourse courseId={courseId} message={error ?? undefined} />;

  return (
    <ContentContainer className="max-w-5xl">
      <PageHeader eyebrow={draft.course.title} title="Typhoon-generated learning path" description="This source-grounded draft was returned by the Backend and is ready for Creator review." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: draft.course.title }, { label: "Generated course" }]} actions={<Badge variant="accent"><Sparkles className="size-3.5" aria-hidden="true" />Typhoon API</Badge>} />
      <Card className="mt-7 border-yellow-200 bg-yellow-50 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-neutral-800" aria-hidden="true" /><div><p className="font-semibold">Review required before publishing</p><p className="type-body-small mt-1 text-neutral-700">The source-grounded overview, modules, lessons, and citations below are the exact generated learning-path response. Creator Review editing is the next API connection.</p></div></div></Card>
      <Card className="mt-7 p-6 shadow-sm sm:p-8"><Badge variant="accent">Course overview</Badge><h2 className="type-h2 mt-4">{draft.learningPath.title}</h2><p className="mt-3 max-w-3xl leading-7 text-text-secondary">{draft.learningPath.overview}</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><ApiInfo label="Target learner" value={draft.course.target_learner} /><ApiInfo label="Difficulty" value={draft.course.difficulty_level.toLowerCase()} /></div></Card>
      <section className="mt-7 grid gap-5" aria-label="Generated modules">
        {draft.learningPath.modules.map((module, moduleIndex) => (
          <Card key={`${moduleIndex}-${module.title}`} className="p-6 shadow-sm sm:p-8">
            <Badge variant="info">Module {moduleIndex + 1}</Badge><h2 className="type-h2 mt-4">{module.title}</h2><p className="mt-3 leading-7 text-text-secondary">{module.description}</p>
            <div className="mt-6 rounded-lg bg-blue-50 p-5"><p className="type-caption font-semibold tracking-wide text-blue-800 uppercase">Learning objectives</p><ul className="mt-3 grid gap-2">{module.learning_objectives.map((objective) => <li key={objective} className="flex gap-3 text-blue-950"><BookOpenCheck className="mt-0.5 size-4 shrink-0 text-action-primary" aria-hidden="true" />{objective}</li>)}</ul></div>
            <div className="mt-7 grid gap-4">{module.lessons.map((lesson, lessonIndex) => <article key={`${lessonIndex}-${lesson.title}`} className="rounded-lg border border-border-default p-5"><div className="flex flex-wrap items-center gap-2"><Badge variant="neutral">Lesson {lessonIndex + 1}</Badge><Badge variant="success"><FileCheck2 className="size-3.5" aria-hidden="true" />Source grounded</Badge></div><h3 className="type-title-large mt-3">{lesson.title}</h3><p className="mt-3 leading-7 text-text-secondary">{lesson.summary}</p><div className="mt-5 border-t border-border-default pt-4"><p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">Source chunks cited</p><div className="mt-3 flex flex-wrap gap-2">{lesson.source_references.map((reference) => <Badge key={reference} variant="success">{reference}</Badge>)}</div></div></article>)}</div>
          </Card>
        ))}
      </section>
      <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/generate`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to generation</ButtonLink><div className="flex flex-col gap-2 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/sources`} variant="secondary">Review knowledge sources</ButtonLink><ButtonLink href={`/creator/courses/${courseId}/review`} size="lg">Review & verify<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div></div>
    </ContentContainer>
  );
}

function ApiInfo({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border-default p-4"><p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">{label}</p><p className="mt-2 text-text-secondary">{value}</p></div>;
}

function StoredGeneratedCourseWorkspace({ courseId }: { courseId: string }) {
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

function MissingGeneratedCourse({ courseId, message }: { courseId: string; message?: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center sm:p-10"><FileCheck2 className="mx-auto size-10 text-action-primary" aria-hidden="true" /><h1 className="type-h1 mt-5">Generate the course first</h1><p className="mt-3 text-text-secondary">{message ?? "No generated course draft is stored for this course yet."}</p><ButtonLink href={`/creator/courses/${courseId}/generate`} className="mt-7">Open AI Course Generator<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
