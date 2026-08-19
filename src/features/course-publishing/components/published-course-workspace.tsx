"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, CheckCircle2, Clipboard, EyeOff, RefreshCw } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, ConfirmationDialog, Spinner, useToast } from "@/components/ui";
import { getPublishedCourse, type ApiPublishedCourseDetail } from "@/features/course-publishing/api/publication-api";
import { loadGeneratedCourse, unpublishGeneratedCourse } from "@/features/course-generation/services/course-generation-service";
import { ApiError, getApiUrl } from "@/lib/api/api-client";
import { CoursePreviewCanvas } from "./course-preview-canvas";
import type { GeneratedCourseState } from "@/types/product";

function backendIdFor(courseId: string) {
  return /^\d+$/.test(courseId) ? Number(courseId) : null;
}

export function PublishedCourseWorkspace({ courseId, forcePublishedPreview = false }: { courseId: string; forcePublishedPreview?: boolean }) {
  const backendCourseId = backendIdFor(courseId);
  if (backendCourseId !== null) return <ApiPublishedCourseWorkspace backendCourseId={backendCourseId} />;
  return <StoredPublishedCourseWorkspace courseId={courseId} forcePublishedPreview={forcePublishedPreview} />;
}

function StoredPublishedCourseWorkspace({ courseId, forcePublishedPreview = false }: { courseId: string; forcePublishedPreview?: boolean }) {
  const { showToast } = useToast();
  const [state, setState] = useState<GeneratedCourseState | null | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadGeneratedCourse(courseId);
      setState(loaded && forcePublishedPreview ? { ...loaded, lifecycle: "published" } : loaded);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, forcePublishedPreview]);

  if (state === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading published course…</div></ContentContainer>;
  if (!state) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-8 text-center"><h1 className="type-h1">Published course not found</h1><ButtonLink href="/creator/courses" className="mt-6">Back to My Courses</ButtonLink></Card></ContentContainer>;

  async function unpublish() {
    setUnpublishing(true);
    setState(await unpublishGeneratedCourse(state!));
    setUnpublishing(false);
    setConfirming(false);
    showToast({ tone: "info", title: "Course unpublished", description: "The course content and review state remain safe." });
  }

  async function copyLink() {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); showToast({ tone: "success", title: "Course link copied" }); }
    catch { showToast({ tone: "error", title: "Course link wasn’t copied", description: `Use this prototype URL: ${url}` }); }
  }

  if (state.lifecycle === "unpublished") {
    return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-text-secondary"><EyeOff className="size-6" aria-hidden="true" /></span><Badge variant="neutral" className="mt-5">Unpublished</Badge><h1 className="type-h1 mt-4">Course removed from learner access</h1><p className="mt-3 text-text-secondary">{state.course.title} and its verified content are still safe. Preview and publish it again whenever you’re ready.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href="/creator/courses" variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to My Courses</ButtonLink><ButtonLink href={`/creator/courses/${courseId}/preview`}><RefreshCw className="size-4" aria-hidden="true" />Preview and publish again</ButtonLink></div></Card></ContentContainer>;
  }

  if (state.lifecycle !== "published") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-8 text-center"><h1 className="type-h1">This course is not published</h1><ButtonLink href={`/creator/courses/${courseId}/preview`} className="mt-6">Open course preview</ButtonLink></Card></ContentContainer>;

  return <ContentContainer className="max-w-[92rem]"><PageHeader eyebrow="Published course" title={state.course.title} description="This is the current learner-facing prototype view." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: state.course.title }, { label: "Published" }]} actions={<div className="flex flex-wrap gap-2"><ButtonLink href={`/creator/analytics/${courseId}`} variant="secondary"><BarChart3 className="size-4" aria-hidden="true" />View analytics</ButtonLink><Button variant="secondary" onClick={() => void copyLink()}><Clipboard className="size-4" aria-hidden="true" />Copy course link</Button><Button variant="danger" onClick={() => setConfirming(true)}><EyeOff className="size-4" aria-hidden="true" />Unpublish</Button></div>} /><div className="mt-7"><CoursePreviewCanvas course={state.course} /></div><Card className="mt-7 border-green-200 bg-status-success-subtle p-5"><p className="flex items-center gap-2 font-semibold text-status-success"><CheckCircle2 className="size-5" aria-hidden="true" />Published in Frontend Demo Mode</p><p className="type-body-small mt-1 text-text-secondary">No backend publishing or public learner access was created.</p></Card><ConfirmationDialog open={confirming} title="Unpublish this course?" description="Learners would lose access, but the course, reviews, and verified content will remain available to you." confirmLabel="Unpublish course" confirmVariant="danger" pending={unpublishing} pendingLabel="Unpublishing…" onConfirm={() => void unpublish()} onCancel={() => setConfirming(false)} /></ContentContainer>;
}

function ApiPublishedCourseWorkspace({ backendCourseId }: { backendCourseId: number }) {
  const { showToast } = useToast();
  const [course, setCourse] = useState<ApiPublishedCourseDetail | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void getPublishedCourse(backendCourseId).then((publishedCourse) => {
      if (!cancelled) setCourse(publishedCourse);
    }).catch((caught) => {
      if (cancelled) return;
      setError(caught instanceof ApiError ? caught.message : "We couldn’t load this published course.");
      setCourse(null);
    });
    return () => { cancelled = true; };
  }, [backendCourseId]);

  async function copyCatalogLink() {
    const url = `${getApiUrl().replace(/\/+$/, "")}/catalog/courses/${backendCourseId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast({ tone: "success", title: "Public catalog API link copied" });
    } catch {
      showToast({ tone: "error", title: "Course link wasn’t copied", description: url });
    }
  }

  if (course === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading published course…</div></ContentContainer>;
  if (!course) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-8 text-center"><h1 className="type-h1">Published course not found</h1><p className="mt-3 text-text-secondary">{error}</p><ButtonLink href="/creator/courses" className="mt-6">Back to My Courses</ButtonLink></Card></ContentContainer>;

  return (
    <ContentContainer className="max-w-5xl">
      <PageHeader eyebrow="Public Backend catalog" title={course.title} description="This verified course is now publicly available through the Backend catalog." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: course.title }, { label: "Published" }]} actions={<div className="flex flex-wrap gap-2"><ButtonLink href="/creator/courses" variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to My Courses</ButtonLink><Button variant="secondary" onClick={() => void copyCatalogLink()}><Clipboard className="size-4" aria-hidden="true" />Copy catalog API link</Button></div>} />
      <Card className="mt-7 border-green-200 bg-status-success-subtle p-5"><p className="flex items-center gap-2 font-semibold text-status-success"><CheckCircle2 className="size-5" aria-hidden="true" />Published in the Backend catalog</p><p className="type-body-small mt-1 text-text-secondary">Published {new Date(course.published_at).toLocaleString()} · {course.module_count} modules · {course.lesson_count} lessons</p><p className="type-caption mt-3 text-text-tertiary">Unpublish is not shown because the current Backend contract has no unpublish endpoint.</p></Card>
      <Card className="mt-7 p-6 shadow-sm sm:p-8"><Badge variant="accent">Course overview</Badge><h2 className="type-h2 mt-4">{course.learning_path.title}</h2><p className="mt-3 leading-7 text-text-secondary">{course.learning_path.overview}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><PublicationInfo label="Target learner" value={course.target_learner} /><PublicationInfo label="Difficulty" value={course.difficulty_level.toLowerCase()} /></div></Card>
      <section className="mt-7 grid gap-5" aria-label="Published modules">{course.learning_path.modules.map((module, moduleIndex) => <Card key={`${moduleIndex}-${module.title}`} className="p-6 shadow-sm"><Badge variant="info">Module {moduleIndex + 1}</Badge><h2 className="type-title-large mt-4">{module.title}</h2><p className="mt-2 text-text-secondary">{module.description}</p><ol className="mt-5 grid gap-2">{module.lessons.map((lesson, lessonIndex) => <li key={`${lessonIndex}-${lesson.title}`} className="rounded-md border border-border-default p-4"><p className="font-semibold">{lessonIndex + 1}. {lesson.title}</p><p className="type-body-small mt-2 text-text-secondary">{lesson.summary}</p></li>)}</ol></Card>)}</section>
    </ContentContainer>
  );
}

function PublicationInfo({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border-default p-4"><p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">{label}</p><p className="mt-2 text-text-secondary">{value}</p></div>;
}
