"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Edit3, Eye, Flag, Save, ShieldCheck } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, ConfirmationDialog, Progress, Spinner } from "@/components/ui";
import { CourseStructurePanel } from "@/features/course-generation/components/course-structure-panel";
import { GeneratedContentDetail } from "@/features/course-generation/components/generated-content-detail";
import { findReviewableItem, getReviewProgress, writeGeneratedCourseState } from "@/features/course-generation/lib/generated-course-store";
import { loadGeneratedCourse, saveGeneratedCourseState } from "@/features/course-generation/services/course-generation-service";
import { SourceReferencesDrawer } from "@/features/source-grounding/components/source-references-drawer";
import type { GeneratedCourseState, ReviewStatus, SourceReference } from "@/types/product";
import { applyReviewDraft, createReviewDraft, ReviewEditor, validateReviewDraft, type ReviewDraft } from "./review-editor";

const statusLabels: Record<ReviewStatus, string> = { "not-reviewed": "Not reviewed", "in-review": "In review", verified: "Verified", "needs-changes": "Needs changes" };
const statusVariants: Record<ReviewStatus, "neutral" | "info" | "success" | "error"> = { "not-reviewed": "neutral", "in-review": "info", verified: "success", "needs-changes": "error" };

export function ReviewWorkspace({ courseId }: { courseId: string }) {
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

function MissingReviewDependency({ courseId }: { courseId: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center"><Card className="w-full p-7 text-center sm:p-10"><AlertTriangle className="mx-auto size-10 text-status-warning" aria-hidden="true" /><h1 className="type-h1 mt-5">Generate the course before review</h1><p className="mt-3 text-text-secondary">Human Verification requires a stored AI-generated course draft.</p><ButtonLink href={`/creator/courses/${courseId}/generate`} className="mt-7">Open AI Course Generator<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}
