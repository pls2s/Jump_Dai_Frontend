"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Edit3, Eye, Flag, Save, ShieldCheck } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, ConfirmationDialog, Field, FieldError, FieldLabel, Input, Progress, Spinner, Textarea } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import {
  getCourseGenerationStatus,
  getGeneratedLearningPath,
  updateGeneratedLearningPath,
  verifyGeneratedLearningPath,
  type ApiGeneratedLearningPath,
  type ApiGeneratedModule,
} from "@/features/course-generation/api/course-generation-api";
import { CourseStructurePanel } from "@/features/course-generation/components/course-structure-panel";
import { GeneratedContentDetail } from "@/features/course-generation/components/generated-content-detail";
import { findReviewableItem, getReviewProgress, writeGeneratedCourseState } from "@/features/course-generation/lib/generated-course-store";
import { loadGeneratedCourse, saveGeneratedCourseState } from "@/features/course-generation/services/course-generation-service";
import { SourceReferencesDrawer } from "@/features/source-grounding/components/source-references-drawer";
import { ApiError } from "@/lib/api/api-client";
import type { GeneratedCourseState, ReviewStatus, SourceReference } from "@/types/product";
import { applyReviewDraft, createReviewDraft, ReviewEditor, validateReviewDraft, type ReviewDraft } from "./review-editor";

const statusLabels: Record<ReviewStatus, string> = { "not-reviewed": "Not reviewed", "in-review": "In review", verified: "Verified", "needs-changes": "Needs changes" };
const statusVariants: Record<ReviewStatus, "neutral" | "info" | "success" | "error"> = { "not-reviewed": "neutral", "in-review": "info", verified: "success", "needs-changes": "error" };

function backendIdFor(courseId: string) {
  return /^\d+$/.test(courseId) ? Number(courseId) : null;
}

export function ReviewWorkspace({ courseId }: { courseId: string }) {
  const backendCourseId = backendIdFor(courseId);
  if (backendCourseId !== null) return <ApiReviewWorkspace courseId={courseId} backendCourseId={backendCourseId} />;
  return <StoredReviewWorkspace courseId={courseId} />;
}

function StoredReviewWorkspace({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [state, setState] = useState<GeneratedCourseState | null | undefined>(undefined);
  const [selectedId, setSelectedId] = useState("course-overview");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [initialDraft, setInitialDraft] = useState<ReviewDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [references, setReferences] = useState<SourceReference[] | null>(null);
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setState(loadGeneratedCourse(courseId)), 0);
    return () => window.clearTimeout(timer);
  }, [courseId]);
  const selected = state ? findReviewableItem(state.course, selectedId) : null;
  const dirty = Boolean(editing && draft && initialDraft && JSON.stringify(draft) !== JSON.stringify(initialDraft));

  useEffect(() => {
    if (!dirty) return;
    function warnBeforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); }
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  const updateState = useCallback((next: GeneratedCourseState) => {
    const saved = writeGeneratedCourseState(next);
    setState(saved);
    return saved;
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.reviews[selectedId] === "not-reviewed") {
      const timer = window.setTimeout(() => updateState({ ...state, reviews: { ...state.reviews, [selectedId]: "in-review" } }), 0);
      return () => window.clearTimeout(timer);
    }
  }, [selectedId, state, updateState]);

  const progress = useMemo(() => state ? getReviewProgress(state) : { verified: 0, total: 0, percentage: 0 }, [state]);

  if (state === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading review workspace…</div></ContentContainer>;
  if (!state || !selected) return <MissingReviewDependency courseId={courseId} />;
  const activeState = state;
  const activeItem = selected;
  const currentStatus = activeState.reviews[activeItem.id] ?? "not-reviewed";

  function beginEdit() {
    const nextDraft = createReviewDraft(activeItem);
    setDraft(nextDraft);
    setInitialDraft(nextDraft);
    setEditing(true);
    setEditorError("");
  }

  function cancelEdit() {
    setEditing(false);
    setDraft(null);
    setInitialDraft(null);
    setEditorError("");
  }

  async function saveChanges() {
    if (!draft) return;
    const error = validateReviewDraft(activeItem, draft);
    if (error) { setEditorError(error); return; }
    setSaving(true);
    const nextStatus: ReviewStatus = currentStatus === "verified" ? "needs-changes" : "in-review";
    const next = await saveGeneratedCourseState({ ...activeState, course: applyReviewDraft(activeState.course, activeItem, draft), reviews: { ...activeState.reviews, [activeItem.id]: nextStatus } });
    setState(next);
    cancelEdit();
    setSaving(false);
  }

  function setReviewStatus(status: ReviewStatus) {
    updateState({ ...activeState, reviews: { ...activeState.reviews, [activeItem.id]: status } });
  }

  function requestSelection(itemId: string) {
    if (itemId === selectedId) return;
    if (dirty) { setPendingSelection(itemId); return; }
    cancelEdit();
    setSelectedId(itemId);
  }

  function requestNavigation(destination: string) {
    if (dirty) { setPendingDestination(destination); return; }
    router.push(destination);
  }

  function discardAndContinue() {
    cancelEdit();
    if (pendingSelection) setSelectedId(pendingSelection);
    if (pendingDestination) router.push(pendingDestination);
    setPendingSelection(null);
    setPendingDestination(null);
  }

  const reviewComplete = progress.total > 0 && progress.verified === progress.total;
  return (
    <ContentContainer className="max-w-[94rem]">
      <PageHeader eyebrow={activeState.course.title} title="Creator Review" description="Inspect, edit, and verify every required AI-generated item before publishing." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: activeState.course.title }, { label: "Human verification" }]} actions={<Button variant="secondary" onClick={() => requestNavigation(`/creator/courses/${courseId}/preview`)}><Eye className="size-4" aria-hidden="true" />Preview course</Button>} />
      <Card className="mt-7 p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="type-label">Review progress</p><p className="type-body-small mt-1 text-text-secondary">{progress.verified} / {progress.total} required items verified</p></div><span className="text-2xl font-semibold">{progress.percentage}%</span></div><Progress value={progress.percentage} className="mt-4" /></Card>
      <div className="mt-6 grid gap-5 lg:grid-cols-[19.5rem_minmax(0,1fr)] xl:gap-7">
        <CourseStructurePanel course={activeState.course} selectedId={activeItem.id} onSelect={requestSelection} reviews={activeState.reviews} />
        <Card className="min-w-0 overflow-hidden shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-default px-5 py-4 sm:px-7"><div className="flex items-center gap-2"><Badge variant={statusVariants[currentStatus]} dot>{statusLabels[currentStatus]}</Badge>{currentStatus === "verified" && <span className="type-caption text-text-tertiary">Editing will return this item to Needs changes.</span>}</div><div className="flex flex-wrap gap-2">{editing ? <><Button variant="ghost" onClick={cancelEdit} disabled={saving}>Cancel</Button><Button onClick={() => void saveChanges()} isLoading={saving} loadingLabel="Saving…"><Save className="size-4" aria-hidden="true" />Save changes</Button></> : <Button variant="secondary" onClick={beginEdit}><Edit3 className="size-4" aria-hidden="true" />Edit</Button>}</div></div>
          <div className="p-5 sm:p-7">{editing && draft ? <ReviewEditor item={activeItem} draft={draft} error={editorError} onChange={(next) => { setDraft(next); setEditorError(""); }} /> : <GeneratedContentDetail item={activeItem} onViewSources={setReferences} />}</div>
          <div className="flex flex-col gap-3 border-t border-border-default bg-neutral-25 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><p className="type-body-small text-text-secondary">Verify only after comparing this item with its source references and course objective.</p><div className="flex flex-col gap-2 sm:flex-row"><Button variant="ghost" onClick={() => setReviewStatus("needs-changes")} disabled={editing}><Flag className="size-4" aria-hidden="true" />Needs changes</Button><Button onClick={() => setReviewStatus("verified")} disabled={editing}><ShieldCheck className="size-4" aria-hidden="true" />Mark as verified</Button></div>{editing && <span className="sr-only">Save or cancel edits before changing verification status.</span>}</div>
        </Card>
      </div>

      {reviewComplete ? <Card className="mt-7 border-green-200 bg-status-success-subtle p-6 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><CheckCircle2 className="mt-1 size-7 shrink-0 text-status-success" aria-hidden="true" /><div><h2 className="type-title-large">Course review complete</h2><p className="mt-1 text-text-secondary">All required AI-generated content has been reviewed and is ready for preview.</p></div></div><Button onClick={() => requestNavigation(`/creator/courses/${courseId}/preview`)}>Preview course<ArrowRight className="size-4" aria-hidden="true" /></Button></div></Card> : <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center"><Button variant="secondary" onClick={() => requestNavigation(`/creator/courses/${courseId}/generated`)}><ArrowLeft className="size-4" aria-hidden="true" />Back to generated course</Button><p className="type-body-small flex items-center gap-2 text-text-secondary"><AlertTriangle className="size-4 text-status-warning" aria-hidden="true" />{progress.total - progress.verified} items must be verified before publishing.</p></div>}

      {references && <SourceReferencesDrawer references={references} onClose={() => setReferences(null)} />}
      <ConfirmationDialog open={Boolean(pendingSelection || pendingDestination)} title="Discard unsaved changes?" description="Your saved course content is safe, but edits in the current form will be lost." confirmLabel="Discard changes" confirmVariant="danger" onConfirm={discardAndContinue} onCancel={() => { setPendingSelection(null); setPendingDestination(null); }} />
    </ContentContainer>
  );
}

function ApiReviewWorkspace({ courseId, backendCourseId }: { courseId: string; backendCourseId: number }) {
  const [learningPath, setLearningPath] = useState<ApiGeneratedLearningPath | null | undefined>(undefined);
  const [savedPath, setSavedPath] = useState<ApiGeneratedLearningPath | null>(null);
  const [status, setStatus] = useState<"WAITING_VERIFICATION" | "VERIFIED" | "PUBLISHED" | "FAILED" | "DRAFT" | "GENERATING" | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmingVerify, setConfirmingVerify] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.mode !== "api") {
      const timer = window.setTimeout(() => {
        setFeedback({ tone: "error", text: "Sign in with the backend before reviewing this course." });
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
      setSavedPath(path);
      setStatus(generationStatus.status);
      setVerifiedAt(generationStatus.verified_at);
    }).catch((caught) => {
      if (cancelled) return;
      setFeedback({ tone: "error", text: caught instanceof ApiError ? caught.message : "We couldn’t load the learning path for review." });
      setLearningPath(null);
    });
    return () => { cancelled = true; };
  }, [backendCourseId]);

  const dirty = Boolean(learningPath && savedPath && JSON.stringify(learningPath) !== JSON.stringify(savedPath));
  const isAwaitingVerification = status === "WAITING_VERIFICATION";

  function updateOverview(overview: string) {
    setLearningPath((current) => current ? { ...current, overview } : current);
  }

  function updateModule(moduleIndex: number, updates: Partial<ApiGeneratedModule>) {
    setLearningPath((current) => current ? {
      ...current,
      modules: current.modules.map((module, index) => index === moduleIndex ? { ...module, ...updates } : module),
    } : current);
  }

  function updateLesson(moduleIndex: number, lessonIndex: number, updates: Partial<ApiGeneratedModule["lessons"][number]>) {
    setLearningPath((current) => current ? {
      ...current,
      modules: current.modules.map((module, index) => index !== moduleIndex ? module : {
        ...module,
        lessons: module.lessons.map((lesson, index) => index === lessonIndex ? { ...lesson, ...updates } : lesson),
      }),
    } : current);
  }

  async function saveChanges() {
    if (!learningPath || !isAwaitingVerification) return;
    const validationError = validateApiLearningPath(learningPath);
    if (validationError) {
      setFeedback({ tone: "error", text: validationError });
      return;
    }
    const session = getAuthSession();
    if (!session || session.mode !== "api") {
      setFeedback({ tone: "error", text: "Sign in with the backend before saving changes." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await updateGeneratedLearningPath(backendCourseId, {
        overview: learningPath.overview,
        modules: learningPath.modules,
      }, session.accessToken);
      setLearningPath(saved);
      setSavedPath(saved);
      setFeedback({ tone: "success", text: "Your Creator edits were saved to the Backend." });
    } catch (caught) {
      setFeedback({ tone: "error", text: caught instanceof ApiError ? caught.message : "We couldn’t save your changes." });
    } finally {
      setSaving(false);
    }
  }

  async function verifyCourse() {
    if (!learningPath || dirty || !isAwaitingVerification) return;
    const session = getAuthSession();
    if (!session || session.mode !== "api") {
      setFeedback({ tone: "error", text: "Sign in with the backend before verifying this course." });
      return;
    }
    setVerifying(true);
    setFeedback(null);
    try {
      const result = await verifyGeneratedLearningPath(backendCourseId, session.accessToken);
      setStatus(result.status);
      setVerifiedAt(result.verified_at);
      setFeedback({ tone: "success", text: "Course verified. It is now ready for publishing." });
      setConfirmingVerify(false);
    } catch (caught) {
      setFeedback({ tone: "error", text: caught instanceof ApiError ? caught.message : "We couldn’t verify this course." });
    } finally {
      setVerifying(false);
    }
  }

  if (learningPath === undefined) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading Creator Review…</div></ContentContainer>;
  if (!learningPath) return <MissingReviewDependency courseId={courseId} message={feedback?.text} />;

  return (
    <ContentContainer className="max-w-5xl">
      <PageHeader eyebrow={learningPath.title} title="Creator Review" description="Review the Typhoon learning path, make edits, then verify the complete draft before publishing." breadcrumb={[{ label: "My Courses", href: "/creator/courses" }, { label: learningPath.title }, { label: "Creator Review" }]} actions={<Badge variant={isAwaitingVerification ? "accent" : "success"}><ShieldCheck className="size-3.5" aria-hidden="true" />{isAwaitingVerification ? "Awaiting verification" : status ?? "Verified"}</Badge>} />
      {feedback && <div role={feedback.tone === "error" ? "alert" : "status"} className={`type-body-small mt-6 rounded-md p-3 ${feedback.tone === "error" ? "bg-red-50 text-status-error" : "bg-status-success-subtle text-status-success"}`}>{feedback.text}</div>}
      {verifiedAt && <Card className="mt-6 border-green-200 bg-status-success-subtle p-4"><p className="type-body-small text-status-success">Verified at {new Date(verifiedAt).toLocaleString()}</p></Card>}
      <Card className="mt-7 p-6 shadow-sm sm:p-8"><Badge variant="accent">Course overview</Badge><Field className="mt-5"><FieldLabel htmlFor="api-review-overview">Learning-path overview</FieldLabel><Textarea id="api-review-overview" rows={6} value={learningPath.overview} disabled={!isAwaitingVerification || saving} onChange={(event) => updateOverview(event.target.value)} /><p className="type-caption mt-2 text-text-tertiary">This summary is saved to the source-grounded Backend learning path.</p></Field></Card>
      <section className="mt-7 grid gap-5" aria-label="Learning-path modules">
        {learningPath.modules.map((module, moduleIndex) => <Card key={`${moduleIndex}-${module.title}`} className="p-6 shadow-sm sm:p-8"><Badge variant="info">Module {moduleIndex + 1}</Badge><div className="mt-5 grid gap-5"><Field><FieldLabel htmlFor={`api-module-title-${moduleIndex}`}>Module title</FieldLabel><Input id={`api-module-title-${moduleIndex}`} value={module.title} disabled={!isAwaitingVerification || saving} onChange={(event) => updateModule(moduleIndex, { title: event.target.value })} /></Field><Field><FieldLabel htmlFor={`api-module-description-${moduleIndex}`}>Module description</FieldLabel><Textarea id={`api-module-description-${moduleIndex}`} rows={4} value={module.description} disabled={!isAwaitingVerification || saving} onChange={(event) => updateModule(moduleIndex, { description: event.target.value })} /></Field><Field><FieldLabel htmlFor={`api-module-objectives-${moduleIndex}`}>Learning objectives</FieldLabel><Textarea id={`api-module-objectives-${moduleIndex}`} rows={4} value={module.learning_objectives.join("\n")} disabled={!isAwaitingVerification || saving} onChange={(event) => updateModule(moduleIndex, { learning_objectives: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} /><p className="type-caption mt-2 text-text-tertiary">One objective per line.</p></Field></div><div className="mt-7 grid gap-4">{module.lessons.map((lesson, lessonIndex) => <article key={`${lessonIndex}-${lesson.title}`} className="rounded-lg border border-border-default p-5"><Badge variant="neutral">Lesson {lessonIndex + 1}</Badge><div className="mt-4 grid gap-5"><Field><FieldLabel htmlFor={`api-lesson-title-${moduleIndex}-${lessonIndex}`}>Lesson title</FieldLabel><Input id={`api-lesson-title-${moduleIndex}-${lessonIndex}`} value={lesson.title} disabled={!isAwaitingVerification || saving} onChange={(event) => updateLesson(moduleIndex, lessonIndex, { title: event.target.value })} /></Field><Field><FieldLabel htmlFor={`api-lesson-summary-${moduleIndex}-${lessonIndex}`}>Lesson summary</FieldLabel><Textarea id={`api-lesson-summary-${moduleIndex}-${lessonIndex}`} rows={6} value={lesson.summary} disabled={!isAwaitingVerification || saving} onChange={(event) => updateLesson(moduleIndex, lessonIndex, { summary: event.target.value })} /></Field><div><p className="type-caption font-semibold tracking-wide text-text-tertiary uppercase">Locked source chunk citations</p><div className="mt-2 flex flex-wrap gap-2">{lesson.source_references.map((reference) => <Badge key={reference} variant="success"><FileCheck2 className="size-3.5" aria-hidden="true" />{reference}</Badge>)}</div><p className="type-caption mt-2 text-text-tertiary">Citations stay unchanged so the Backend can validate grounding when you save.</p></div></div></article>)}</div></Card>)}
      </section>
      <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-border-default pt-7 sm:flex-row sm:items-center"><ButtonLink href={`/creator/courses/${courseId}/generated`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to generated course</ButtonLink><div className="flex flex-col gap-2 sm:flex-row"><Button variant="secondary" onClick={() => void saveChanges()} disabled={!dirty || !isAwaitingVerification} isLoading={saving} loadingLabel="Saving…"><Save className="size-4" aria-hidden="true" />Save changes</Button><Button onClick={() => setConfirmingVerify(true)} disabled={dirty || !isAwaitingVerification || saving} isLoading={verifying} loadingLabel="Verifying…"><ShieldCheck className="size-4" aria-hidden="true" />Verify course</Button></div></div>
      {dirty && <p className="type-caption mt-3 text-status-warning">Save your edits before verifying the course.</p>}
      {!isAwaitingVerification && <Card className="mt-7 border-green-200 bg-status-success-subtle p-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-success" aria-hidden="true" /><div><h2 className="type-title-large">Course verified</h2><p className="mt-1 text-text-secondary">The Backend has marked this learning path as verified. Publishing is the next integration.</p></div></div></Card>}
      <ConfirmationDialog open={confirmingVerify} title="Verify this learning path?" description="This confirms that you reviewed the complete source-grounded learning path. You can publish it in the next step." confirmLabel="Verify course" pending={verifying} pendingLabel="Verifying…" onConfirm={() => void verifyCourse()} onCancel={() => setConfirmingVerify(false)} />
    </ContentContainer>
  );
}

function validateApiLearningPath(learningPath: ApiGeneratedLearningPath) {
  if (learningPath.overview.trim().length < 1) return "Add a learning-path overview before saving.";
  for (const module of learningPath.modules) {
    if (module.title.trim().length < 1 || module.description.trim().length < 1) return "Every module needs a title and description.";
    if (module.learning_objectives.length === 0) return "Every module needs at least one learning objective.";
    for (const lesson of module.lessons) {
      if (lesson.title.trim().length < 1 || lesson.summary.trim().length < 1) return "Every lesson needs a title and summary.";
      if (lesson.source_references.length === 0) return "Every lesson needs at least one source chunk citation.";
    }
  }
  return "";
}

function MissingReviewDependency({ courseId, message }: { courseId: string; message?: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center sm:p-10"><AlertTriangle className="mx-auto size-10 text-status-warning" aria-hidden="true" /><h1 className="type-h1 mt-5">Generate the course before review</h1><p className="mt-3 text-text-secondary">Human Verification requires a stored AI-generated course draft.</p><ButtonLink href={`/creator/courses/${courseId}/generate`} className="mt-7">Open AI Course Generator<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
