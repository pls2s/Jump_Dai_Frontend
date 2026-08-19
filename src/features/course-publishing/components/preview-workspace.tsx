"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, Check, CheckCircle2, Clipboard, Eye, RefreshCw, Rocket, X } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, ConfirmationDialog, FieldError, Spinner, useToast } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { getCourseGenerationStatus, getGeneratedLearningPath, type ApiGeneratedLearningPath } from "@/features/course-generation/api/course-generation-api";
import { getPublishReadiness } from "@/features/course-generation/lib/generated-course-store";
import { loadGeneratedCourse, publishGeneratedCourse } from "@/features/course-generation/services/course-generation-service";
import { publishCourse } from "@/features/course-publishing/api/publication-api";
import { CoursePreviewCanvas } from "@/features/course-publishing/components/course-preview-canvas";
import { ApiError } from "@/lib/api/api-client";
import { readMockSources } from "@/lib/mock/source-store";
import type { GeneratedCourseState } from "@/types/product";

function backendIdFor(courseId: string) {
  return /^\d+$/.test(courseId) ? Number(courseId) : null;
}

export function PreviewWorkspace({ courseId, simulateFailure = false }: { courseId: string; simulateFailure?: boolean }) {
  const backendCourseId = backendIdFor(courseId);
  if (backendCourseId !== null) return <ApiPreviewWorkspace courseId={courseId} backendCourseId={backendCourseId} />;
  return <StoredPreviewWorkspace courseId={courseId} simulateFailure={simulateFailure} />;
}

function StoredPreviewWorkspace({ courseId, simulateFailure = false }: { courseId: string; simulateFailure?: boolean }) {
  const { showToast } = useToast();
  const [state, setState] = useState<GeneratedCourseState | null | undefined>(undefined);
  const [hasReadySources, setHasReadySources] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [failThisPublish, setFailThisPublish] = useState(simulateFailure);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadGeneratedCourse(courseId));
      setHasReadySources(readMockSources(courseId).some((source) => source.status === "Ready"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId]);

  const checks = useMemo(() => state ? getPublishReadiness(state, hasReadySources) : [], [hasReadySources, state]);
  const ready = checks.length > 0 && checks.every((check) => check.passed);

  if (state === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Preparing course preview…</div></ContentContainer>;
  if (!state) return <MissingPreviewDependency courseId={courseId} />;
  if (state.lifecycle === "published") return <PublishedSuccess state={state} courseId={courseId} onCopy={() => void copyPrototypeLink(courseId, showToast)} />;

  async function confirmPublish() {
    if (!ready || !state) return;
    setPublishing(true);
    setPublishError("");
    if (failThisPublish) {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setFailThisPublish(false);
      setPublishing(false);
      setConfirming(false);
      setPublishError("Publishing couldn’t be completed. Your verified course is safe. Retry when you’re ready.");
      return;
    }
    const next = await publishGeneratedCourse(state);
    setState(next);
    setPublishing(false);
    setConfirming(false);
    showToast({ tone: "success", title: "Course published", description: "The local frontend lifecycle is now Published." });
  }

  const remaining = checks.filter((check) => !check.passed);
  return (
    <ContentContainer className="max-w-[92rem]">
      <PageHeader eyebrow="Preview mode" title="Learner course preview" description="Review the course as a learner will see it. Editing controls stay outside the preview canvas." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: state.course.title }, { label: "Preview" }]} actions={<div className="flex flex-wrap gap-2"><ButtonLink href={`/creator/courses/${courseId}/review`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to review</ButtonLink><Button onClick={() => setConfirming(true)} disabled={!ready} aria-describedby={!ready ? "publish-disabled-reason" : undefined}><Rocket className="size-4" aria-hidden="true" />Publish course</Button></div>} />
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <CoursePreviewCanvas course={state.course} />
        <aside className="h-fit xl:sticky xl:top-24"><Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-full ${ready ? "bg-status-success-subtle text-status-success" : "bg-yellow-100 text-neutral-800"}`}>{ready ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}</span><div><h2 className="type-title-large">{ready ? "Ready to publish" : "Not ready to publish"}</h2><p className="type-caption mt-1 text-text-tertiary">Frontend readiness check</p></div></div><ul className="mt-5 grid gap-3">{checks.map((check) => <li key={check.id} className="flex items-start gap-3"><span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${check.passed ? "bg-status-success text-white" : "border border-border-strong text-text-tertiary"}`}>{check.passed ? <Check className="size-3" aria-hidden="true" /> : <span aria-hidden="true">•</span>}</span><span className="type-body-small"><span className="font-medium text-text-primary">{check.label}</span>{check.detail && <span className="mt-0.5 block text-text-tertiary">{check.detail}</span>}</span></li>)}</ul>{!ready && <p id="publish-disabled-reason" className="type-body-small mt-5 rounded-md bg-yellow-50 p-3 text-neutral-700">Publish is disabled until {remaining.length} readiness {remaining.length === 1 ? "requirement is" : "requirements are"} complete.</p>}{publishError && <div className="mt-5"><FieldError>{publishError}</FieldError><Button className="mt-3 w-full" onClick={() => setConfirming(true)}><RefreshCw className="size-4" aria-hidden="true" />Retry publish</Button></div>}</Card></aside>
      </div>
      <ConfirmationDialog open={confirming} title="Publish this course?" description={`Once published, learners with access will be able to view ${state.course.title}. This prototype changes only local frontend state.`} confirmLabel="Publish course" pending={publishing} pendingLabel="Publishing…" onConfirm={() => void confirmPublish()} onCancel={() => setConfirming(false)} />
    </ContentContainer>
  );
}

function ApiPreviewWorkspace({ courseId, backendCourseId }: { courseId: string; backendCourseId: number }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [learningPath, setLearningPath] = useState<ApiGeneratedLearningPath | null | undefined>(undefined);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.mode !== "api") {
      const timer = window.setTimeout(() => {
        setError("Sign in with the backend before publishing this course.");
        setLearningPath(null);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    let cancelled = false;
    void Promise.all([
      getGeneratedLearningPath(backendCourseId, session.accessToken),
      getCourseGenerationStatus(backendCourseId, session.accessToken),
    ]).then(([path, generationStatus]) => {
      if (cancelled) return;
      setLearningPath(path);
      setStatus(generationStatus.status);
    }).catch((caught) => {
      if (cancelled) return;
      setError(caught instanceof ApiError ? caught.message : "We couldn’t load this course for publishing.");
      setLearningPath(null);
    });
    return () => { cancelled = true; };
  }, [backendCourseId]);

  async function confirmPublish() {
    const session = getAuthSession();
    if (!session || session.mode !== "api") {
      setError("Sign in with the backend before publishing this course.");
      return;
    }
    setPublishing(true);
    setError("");
    try {
      await publishCourse(backendCourseId, session.accessToken);
      setConfirming(false);
      showToast({ tone: "success", title: "Course published", description: "The course is now visible in the public Backend catalog." });
      router.push(`/creator/courses/${courseId}/published`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Publishing couldn’t be completed. Your verified course is safe.");
      setConfirming(false);
    } finally {
      setPublishing(false);
    }
  }

  if (learningPath === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Preparing publication preview…</div></ContentContainer>;
  if (!learningPath) return <MissingPreviewDependency courseId={courseId} message={error || undefined} />;
  const ready = status === "VERIFIED";
  if (status === "PUBLISHED") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-8 text-center"><CheckCircle2 className="mx-auto size-10 text-status-success" aria-hidden="true" /><Badge variant="success" className="mt-5">Published</Badge><h1 className="type-h1 mt-4">This course is already published</h1><p className="mt-3 text-text-secondary">The Backend catalog already makes {learningPath.title} publicly available.</p><ButtonLink href={`/creator/courses/${courseId}/published`} className="mt-7">View published course<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;

  return (
    <ContentContainer className="max-w-5xl">
      <PageHeader eyebrow="Backend publication preview" title={learningPath.title} description="Review the verified, source-grounded learning path before it becomes visible in the public course catalog." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: learningPath.title }, { label: "Publish" }]} actions={<div className="flex flex-wrap gap-2"><ButtonLink href={`/creator/courses/${courseId}/review`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to review</ButtonLink><Button onClick={() => setConfirming(true)} disabled={!ready}><Rocket className="size-4" aria-hidden="true" />Publish course</Button></div>} />
      {error && <FieldError className="mt-6">{error}</FieldError>}
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-5"><Card className="p-6 shadow-sm sm:p-8"><Badge variant="accent">Verified learning path</Badge><h2 className="type-h2 mt-4">{learningPath.title}</h2><p className="mt-3 leading-7 text-text-secondary">{learningPath.overview}</p></Card>{learningPath.modules.map((module, moduleIndex) => <Card key={`${moduleIndex}-${module.title}`} className="p-6 shadow-sm"><Badge variant="info">Module {moduleIndex + 1}</Badge><h2 className="type-title-large mt-4">{module.title}</h2><p className="mt-2 text-text-secondary">{module.description}</p><ol className="mt-5 grid gap-2">{module.lessons.map((lesson, lessonIndex) => <li key={`${lessonIndex}-${lesson.title}`} className="rounded-md border border-border-default p-4"><p className="font-semibold">{lessonIndex + 1}. {lesson.title}</p><p className="type-body-small mt-2 text-text-secondary">{lesson.summary}</p></li>)}</ol></Card>)}</div>
        <aside className="h-fit xl:sticky xl:top-24"><Card className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className={`flex size-10 items-center justify-center rounded-full ${ready ? "bg-status-success-subtle text-status-success" : "bg-yellow-100 text-neutral-800"}`}>{ready ? <CheckCircle2 className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}</span><div><h2 className="type-title-large">{ready ? "Ready to publish" : "Verification required"}</h2><p className="type-caption mt-1 text-text-tertiary">Backend status: {status ?? "Unknown"}</p></div></div>{ready ? <p className="type-body-small mt-5 rounded-md bg-status-success-subtle p-3 text-status-success">This course is verified and can be published to the public catalog.</p> : <div className="mt-5 rounded-md bg-yellow-50 p-3"><p className="type-body-small text-neutral-700">The Backend accepts publishing only after Creator Review is verified.</p><ButtonLink href={`/creator/courses/${courseId}/review`} variant="secondary" className="mt-3 w-full">Open Creator Review</ButtonLink></div>}</Card></aside>
      </div>
      <ConfirmationDialog open={confirming} title="Publish this course?" description={`Once published, ${learningPath.title} will be available through the public Backend catalog.`} confirmLabel="Publish course" pending={publishing} pendingLabel="Publishing…" onConfirm={() => void confirmPublish()} onCancel={() => setConfirming(false)} />
    </ContentContainer>
  );
}

function PublishedSuccess({ state, courseId, onCopy }: { state: GeneratedCourseState; courseId: string; onCopy: () => void }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-4xl items-center"><Card className="w-full overflow-hidden border-green-200 shadow-md"><div className="bg-status-success-subtle p-7 text-center sm:p-10"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-status-success text-white"><CheckCircle2 className="size-7" aria-hidden="true" /></span><Badge variant="success" className="mt-5">Published</Badge><h1 className="type-h1 mt-4">Your course is published</h1><p className="type-body-large mx-auto mt-3 max-w-xl text-text-secondary">{state.course.title} is now available in this frontend prototype.</p></div><div className="p-6 sm:p-8"><div className="flex flex-col justify-center gap-3 sm:flex-row"><ButtonLink href={`/creator/courses/${courseId}/published`}>View published course<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink><ButtonLink href={`/creator/analytics/${courseId}`} variant="secondary"><BarChart3 className="size-4" aria-hidden="true" />View analytics</ButtonLink><ButtonLink href="/creator/courses" variant="secondary">Back to My Courses</ButtonLink><Button variant="secondary" onClick={onCopy}><Clipboard className="size-4" aria-hidden="true" />Copy course link</Button></div><p className="type-caption mt-5 text-center text-text-tertiary">The copied URL is a Creator-access prototype route, not a public learner link.</p></div></Card></ContentContainer>;
}

async function copyPrototypeLink(courseId: string, showToast: ReturnType<typeof useToast>["showToast"]) {
  const url = `${window.location.origin}/creator/courses/${courseId}/published`;
  try { await navigator.clipboard.writeText(url); showToast({ tone: "success", title: "Course link copied" }); }
  catch { showToast({ tone: "error", title: "Course link wasn’t copied", description: `Use this prototype URL: ${url}` }); }
}

function MissingPreviewDependency({ courseId, message }: { courseId: string; message?: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center sm:p-10"><X className="mx-auto size-10 text-status-warning" aria-hidden="true" /><h1 className="type-h1 mt-5">Nothing to preview yet</h1><p className="mt-3 text-text-secondary">{message ?? "Generate the course before opening its learner preview."}</p><ButtonLink href={`/creator/courses/${courseId}/generate`} className="mt-7">Open AI Course Generator<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
