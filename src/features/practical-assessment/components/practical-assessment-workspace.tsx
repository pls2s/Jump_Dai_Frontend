"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ClipboardCheck, Clock3, FileCheck2, RefreshCw, Save, Target } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, ConfirmationDialog, Field, FieldDescription, FieldError, FieldLabel, Progress, Spinner, Textarea } from "@/components/ui";
import { practicalAssessmentDefinition } from "@/data/mock";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { ensurePracticalDraft, loadPracticalExperience, savePracticalAssessment } from "@/features/learner-journey/services/learning-experience-service";
import type { LearnerJourneyState, PracticalAssessmentState, PracticalDraft } from "@/features/learner-journey/types";
import { evaluatePracticalDraft, practicalDraftErrors } from "@/features/practical-assessment/lib/practical-evaluator";
import { cn } from "@/lib/cn";

const evaluationSteps = ["Checking submission completeness", "Evaluating against the rubric", "Measuring applied competency", "Preparing feedback"];
type DraftErrors = Partial<Record<keyof PracticalDraft, string>>;

const fields: Array<{ key: keyof PracticalDraft; label: string; prompt: string; placeholder: string }> = [
  { key: "objective", label: "Campaign objective", prompt: "What should the campaign achieve?", placeholder: "Generate 40 qualified consultation bookings during a six-week campaign." },
  { key: "targetAudience", label: "Target audience", prompt: "Who is the campaign for and what do they need?", placeholder: "Small-business owners who need a practical campaign planning process." },
  { key: "channelSelection", label: "Channel selection", prompt: "Which channels will you use, and why?", placeholder: "Use targeted search for active demand and educational social content for consideration." },
  { key: "coreMessage", label: "Core message", prompt: "What is the main message learners should communicate?", placeholder: "Turn your next campaign into a clear plan you can measure and improve." },
  { key: "measurementMetrics", label: "Measurement metrics", prompt: "How will you know whether the campaign worked?", placeholder: "Track conversion rate, cost per qualified booking, and landing-page completion." },
];

export function PracticalAssessmentWorkspace({ courseId, courseTitle, previewState }: { courseId: string; courseTitle: string; previewState?: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);
  const [practical, setPractical] = useState<PracticalAssessmentState | null>(null);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [notice, setNotice] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      const preview = previewState === "evaluating" || previewState === "passed" || previewState === "needs-practice" ? previewState : undefined;
      const loaded = loadPracticalExperience(session.user.id, courseId, preview);
      setJourney(loaded.journey);
      setPractical(ensurePracticalDraft(loaded.journey));
      if (loaded.journey.practicalAssessment?.status === "evaluating") setEvaluationStep(0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, previewState, router]);

  const finishEvaluation = useCallback(() => {
    if (!practical) return;
    const session = getAuthSession();
    if (!session) return;
    const evaluated = evaluatePracticalDraft(practical);
    setPractical(evaluated);
    setJourney(savePracticalAssessment(session.user.id, courseId, evaluated));
  }, [courseId, practical]);

  useEffect(() => {
    if (practical?.status !== "evaluating") return;
    if (evaluationStep >= evaluationSteps.length) {
      const timer = window.setTimeout(finishEvaluation, 420);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setEvaluationStep((current) => current + 1), 520);
    return () => window.clearTimeout(timer);
  }, [evaluationStep, finishEvaluation, practical?.status]);

  function updateField(key: keyof PracticalDraft, value: string) {
    setPractical((current) => current ? { ...current, status: "draft", draft: { ...current.draft, [key]: value }, rubricScores: undefined, totalScore: undefined, evaluatedAt: undefined } : current);
    setErrors((current) => ({ ...current, [key]: undefined }));
    setNotice("");
  }

  function saveDraft() {
    if (!practical) return;
    const session = getAuthSession();
    if (!session) return;
    const draftState: PracticalAssessmentState = { ...practical, status: "draft", savedAt: new Date().toISOString() };
    setPractical(draftState);
    setJourney(savePracticalAssessment(session.user.id, courseId, draftState));
    setNotice("Draft saved. You can safely continue later.");
  }

  function requestSubmit() {
    if (!practical) return;
    const nextErrors = practicalDraftErrors(practical.draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setConfirmSubmit(true);
  }

  function submit() {
    if (!practical) return;
    const session = getAuthSession();
    if (!session) return;
    const evaluating: PracticalAssessmentState = { ...practical, status: "evaluating", submittedAt: new Date().toISOString() };
    setPractical(evaluating);
    setJourney(savePracticalAssessment(session.user.id, courseId, evaluating));
    setConfirmSubmit(false);
    setEvaluationStep(0);
  }

  function retry() {
    if (!practical) return;
    const draftState: PracticalAssessmentState = { ...practical, status: "draft", rubricScores: undefined, totalScore: undefined, evaluatedAt: undefined, submittedAt: undefined };
    const session = getAuthSession();
    if (!session) return;
    setPractical(draftState);
    setJourney(savePracticalAssessment(session.user.id, courseId, draftState));
  }

  if (!journey || !practical) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading practical assessment…</div></ContentContainer>;

  const postResult = journey.knowledgeChecks?.["post-assessment-digital-marketing-v1"]?.result;
  if (!postResult?.passed) return <ContentContainer className="max-w-4xl"><PageHeader eyebrow={courseTitle} title="Pass the final knowledge check first" description="The practical assessment unlocks after the required post-assessment meets its passing criteria." /><ButtonLink href={`/learner/courses/${courseId}/post-assessment`} className="mt-7">Go to final knowledge check<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></ContentContainer>;

  if (practical.status === "evaluating") return <ContentContainer className="max-w-4xl"><div className="py-8 sm:py-14"><Badge variant="info">Practical submitted</Badge><h1 className="type-h1 mt-5">Evaluating your work</h1><p className="type-body-large mt-3 max-w-2xl text-text-secondary">Your campaign plan is being checked against the visible rubric and applied-skill criteria.</p><Card className="mt-8 p-5 sm:p-7"><Progress value={Math.min(evaluationStep, evaluationSteps.length)} max={evaluationSteps.length} label="Evaluation progress" showValue /><ol className="mt-7 grid gap-2" aria-live="polite">{evaluationSteps.map((step, index) => { const complete = index < evaluationStep; const active = index === evaluationStep; return <li key={step} className={cn("flex min-h-12 items-center gap-3 rounded-md px-3 py-2", active && "bg-blue-50 text-blue-900")}>{complete ? <CheckCircle2 className="size-5 text-status-success" aria-hidden="true" /> : active ? <Spinner className="size-5" /> : <Circle className="size-5 text-neutral-300" aria-hidden="true" />}<span className={cn("type-body-small", active && "font-semibold")}>{step}</span></li>; })}</ol></Card></div></ContentContainer>;

  if (practical.status === "passed" || practical.status === "needs-more-practice") {
    const passed = practical.status === "passed";
    return <ContentContainer className="max-w-5xl"><PageHeader eyebrow={`${courseTitle} · Practical assessment`} title={passed ? "Practical assessment passed" : "More practice will strengthen your plan"} description={passed ? "Your campaign plan demonstrates the applied skills required by this assessment." : "Your draft has a useful starting point. Strengthen the recommendations below and submit a revised version."} actions={<Badge variant={passed ? "success" : "warning"}>{passed ? "Passed" : "Needs more practice"}</Badge>} /><div className="mt-7 grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]"><Card className="flex flex-col items-center justify-center p-6 text-center"><p className="type-caption text-text-tertiary">Total score</p><p className="mt-2 text-5xl font-semibold">{practical.totalScore}%</p><p className="type-body-small mt-3 text-text-secondary">Passing score: {practicalAssessmentDefinition.passingScore}%</p></Card><Card className="overflow-hidden"><div className="border-b border-border-default p-5 sm:px-6"><h2 className="type-title-large">Rubric feedback</h2></div><div className="divide-y divide-border-default">{practical.rubricScores?.map((score) => <div key={score.criterionId} className="p-5 sm:px-6"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{score.label}</h3><Badge variant={score.earned / score.possible >= 0.7 ? "success" : "warning"}>{score.earned} / {score.possible}</Badge></div><p className="type-body-small mt-2 text-text-secondary">{score.feedback}</p></div>)}</div></Card></div><Card className="mt-6 p-5 sm:p-6"><div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><div><h2 className="font-semibold">Evidence captured</h2><p className="type-body-small mt-1 text-text-secondary">{practical.evidenceSummary}</p></div></div></Card><div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><ButtonLink href={`/learner/courses/${courseId}/learn`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Review learning</ButtonLink>{passed ? <ButtonLink href={`/learner/courses/${courseId}/result`}>View skill result<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink> : <Button onClick={retry}><RefreshCw className="size-4" aria-hidden="true" />Retry practical assessment</Button>}</div></ContentContainer>;
  }

  return (
    <ContentContainer className="max-w-6xl">
      <PageHeader eyebrow={courseTitle} title="Practical assessment" description={practicalAssessmentDefinition.brief} />
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <Card className="p-5 sm:p-7"><div className="grid gap-5 sm:grid-cols-2"><Info label="Expected outcome" value={practicalAssessmentDefinition.expectedOutcome} /><Info label="Estimated time" value={practicalAssessmentDefinition.estimatedTime} /><Info label="Submission" value="Complete all five structured campaign-plan fields." /><Info label="Passing criteria" value={`${practicalAssessmentDefinition.passingScore}% or higher across the rubric.`} /></div></Card>
          <form className="mt-6 grid gap-5" onSubmit={(event) => { event.preventDefault(); requestSubmit(); }} noValidate>{fields.map((field) => <Card key={field.key} className="p-5 sm:p-6"><Field><FieldLabel htmlFor={`practical-${field.key}`}>{field.label}</FieldLabel><FieldDescription>{field.prompt}</FieldDescription><Textarea id={`practical-${field.key}`} value={practical.draft[field.key]} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} rows={4} maxLength={600} validation={errors[field.key] ? "error" : "default"} aria-describedby={errors[field.key] ? `${field.key}-error` : undefined} />{errors[field.key] && <FieldError id={`${field.key}-error`}>{errors[field.key]}</FieldError>}</Field></Card>)}{notice && <p role="status" className="type-body-small rounded-md bg-green-50 p-3 text-status-success">{notice}</p>}<div className="flex flex-col-reverse justify-between gap-3 sm:flex-row"><Button type="button" variant="secondary" onClick={saveDraft}><Save className="size-4" aria-hidden="true" />Save draft</Button><Button type="submit">Submit assessment<ClipboardCheck className="size-4" aria-hidden="true" /></Button></div></form>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start"><Card className="p-5"><div className="flex items-center gap-2"><Target className="size-5 text-blue-800" aria-hidden="true" /><h2 className="font-semibold">Evaluation rubric</h2></div><div className="mt-5 grid gap-5">{practicalAssessmentDefinition.criteria.map((criterion) => <div key={criterion.id}><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{criterion.label}</h3><Badge variant="neutral">{criterion.weight}%</Badge></div><p className="type-caption mt-1.5 leading-5 text-text-secondary">{criterion.description}</p></div>)}</div><div className="type-body-small mt-6 flex items-center gap-2 border-t border-border-default pt-4 text-text-secondary"><Clock3 className="size-4" aria-hidden="true" />Drafts save locally for this prototype.</div></Card></aside>
      </div>
      <ConfirmationDialog open={confirmSubmit} title="Submit practical assessment?" description="You won’t be able to edit this version while it is being evaluated. Your saved course progress remains safe." confirmLabel="Submit assessment" onConfirm={submit} onCancel={() => setConfirmSubmit(false)} />
    </ContentContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="type-caption text-text-tertiary">{label}</p><p className="type-body-small mt-1 font-medium">{value}</p></div>; }
