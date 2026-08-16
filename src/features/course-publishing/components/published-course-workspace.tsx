"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clipboard, EyeOff, RefreshCw } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, ConfirmationDialog, Spinner } from "@/components/ui";
import { loadGeneratedCourse, unpublishGeneratedCourse } from "@/features/course-generation/services/course-generation-service";
import { CoursePreviewCanvas } from "./course-preview-canvas";
import type { GeneratedCourseState } from "@/types/product";

export function PublishedCourseWorkspace({ courseId, forcePublishedPreview = false }: { courseId: string; forcePublishedPreview?: boolean }) {
  const [state, setState] = useState<GeneratedCourseState | null | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
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
  }

  async function copyLink() {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); setCopyFeedback("Prototype course link copied."); }
    catch { setCopyFeedback(`Copy unavailable. Use this prototype URL: ${url}`); }
  }

  if (state.lifecycle === "unpublished") {
    return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center shadow-sm sm:p-10"><span className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-text-secondary"><EyeOff className="size-6" aria-hidden="true" /></span><Badge variant="neutral" className="mt-5">Unpublished</Badge><h1 className="type-h1 mt-4">Course removed from learner access</h1><p className="mt-3 text-text-secondary">{state.course.title} and its verified content are still safe. Preview and publish it again whenever you’re ready.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href="/creator/courses" variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to My Courses</ButtonLink><ButtonLink href={`/creator/courses/${courseId}/preview`}><RefreshCw className="size-4" aria-hidden="true" />Preview and publish again</ButtonLink></div></Card></ContentContainer>;
  }

  if (state.lifecycle !== "published") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-8 text-center"><h1 className="type-h1">This course is not published</h1><ButtonLink href={`/creator/courses/${courseId}/preview`} className="mt-6">Open course preview</ButtonLink></Card></ContentContainer>;

  return <ContentContainer className="max-w-[92rem]"><PageHeader eyebrow="Published course" title={state.course.title} description="This is the current learner-facing prototype view." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: state.course.title }, { label: "Published" }]} actions={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => void copyLink()}><Clipboard className="size-4" aria-hidden="true" />Copy course link</Button><Button variant="danger" onClick={() => setConfirming(true)}><EyeOff className="size-4" aria-hidden="true" />Unpublish</Button></div>} />{copyFeedback && <p role="status" className="type-body-small mt-5 rounded-md bg-blue-50 p-3 text-blue-800">{copyFeedback}</p>}<div className="mt-7"><CoursePreviewCanvas course={state.course} /></div><Card className="mt-7 border-green-200 bg-status-success-subtle p-5"><p className="flex items-center gap-2 font-semibold text-status-success"><CheckCircle2 className="size-5" aria-hidden="true" />Published in Frontend Demo Mode</p><p className="type-body-small mt-1 text-text-secondary">No backend publishing or public learner access was created.</p></Card><ConfirmationDialog open={confirming} title="Unpublish this course?" description="Learners would lose access, but the course, reviews, and verified content will remain available to you." confirmLabel="Unpublish course" confirmVariant="danger" pending={unpublishing} pendingLabel="Unpublishing…" onConfirm={() => void unpublish()} onCancel={() => setConfirming(false)} /></ContentContainer>;
}
