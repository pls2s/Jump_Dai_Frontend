"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Circle,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmationDialog,
  FieldError,
  Progress,
  Spinner,
} from "@/components/ui";
import { digitalMarketingPreAssessment } from "@/data/mock";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { loadLearningProfile } from "@/features/learner-onboarding/services/learning-profile-service";
import {
  evaluateAssessment,
  loadLearnerJourney,
  markAssessmentEvaluating,
  saveAssessmentIndex,
  saveAssessmentResponse,
  startNewAssessment,
} from "@/features/learner-journey/services/learner-journey-service";
import type {
  AssessmentResponse,
  LearnerJourneyState,
} from "@/features/learner-journey/types";
import { cn } from "@/lib/cn";

type AssessmentView = "intro" | "question" | "review" | "processing";

const evaluationSteps = [
  "Reviewing your answers",
  "Measuring topic proficiency",
  "Identifying skill gaps",
  "Preparing your personalized path",
];

export function PreAssessmentWorkspace({
  courseId,
  courseTitle,
  previewView,
}: {
  courseId: string;
  courseTitle: string;
  previewView?: string;
}) {
  const router = useRouter();
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);
  const [profileReady, setProfileReady] = useState(false);
  const [view, setView] = useState<AssessmentView>(
    previewView === "question" || previewView === "review" || previewView === "processing"
      ? previewView
      : "intro",
  );
  const [error, setError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      setProfileReady(Boolean(loadLearningProfile(session.user.id, courseId)));
      const fixture = previewView === "processing"
        ? "completed"
        : previewView === "question" || previewView === "review"
          ? "in-progress"
          : "none";
      const loaded = loadLearnerJourney(session.user.id, courseId, fixture);
      setJourney(loaded);
      if (!previewView && loaded.assessment?.status === "evaluating") setView("processing");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, previewView, router]);

  const attempt = journey?.assessment;
  const currentIndex = Math.min(
    attempt?.currentQuestionIndex ?? 0,
    digitalMarketingPreAssessment.questions.length - 1,
  );
  const question = digitalMarketingPreAssessment.questions[currentIndex];
  const currentResponse = attempt?.responses.find((item) => item.questionId === question.id);

  const finishEvaluation = useCallback(() => {
    if (!journey?.assessment) return;
    const session = getAuthSession();
    if (!session) return;
    const next = evaluateAssessment(session.user.id, courseId, journey.assessment);
    setJourney(next);
    router.replace(`/learner/courses/${courseId}/skill-gap`);
  }, [courseId, journey, router]);

  useEffect(() => {
    if (view !== "processing" || !attempt) return;
    if (processingStep >= evaluationSteps.length) {
      const timer = window.setTimeout(finishEvaluation, 450);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(
      () => setProcessingStep((current) => current + 1),
      520,
    );
    return () => window.clearTimeout(timer);
  }, [attempt, finishEvaluation, processingStep, view]);

  function beginAssessment() {
    const session = getAuthSession();
    if (!session) return;
    const next = startNewAssessment(session.user.id, courseId);
    setJourney(next);
    setView("question");
    setError("");
  }

  function updateAnswer(optionId: string, checked: boolean) {
    if (!attempt) return;
    const selected = question.type === "multiple-choice"
      ? [optionId]
      : checked
        ? Array.from(new Set([...(currentResponse?.selectedOptionIds ?? []), optionId]))
        : (currentResponse?.selectedOptionIds ?? []).filter((id) => id !== optionId);
    const response: AssessmentResponse = { questionId: question.id, selectedOptionIds: selected };
    const session = getAuthSession();
    if (!session) return;
    setJourney(saveAssessmentResponse(session.user.id, courseId, attempt, response, currentIndex));
    if (selected.length > 0) setError("");
  }

  function moveTo(index: number) {
    if (!attempt) return;
    const session = getAuthSession();
    if (!session) return;
    setJourney(saveAssessmentIndex(session.user.id, courseId, attempt, index));
    setError("");
    setView("question");
  }

  function goNext() {
    if (!currentResponse?.selectedOptionIds.length) {
      setError("Select an answer to continue.");
      return;
    }
    if (currentIndex === digitalMarketingPreAssessment.questions.length - 1) {
      setView("review");
      return;
    }
    moveTo(currentIndex + 1);
  }

  function submitAssessment() {
    if (!attempt) return;
    const session = getAuthSession();
    if (!session) return;
    const next = markAssessmentEvaluating(session.user.id, courseId, attempt);
    setJourney(next);
    setConfirmSubmit(false);
    setProcessingStep(0);
    setView("processing");
  }

  if (!journey) {
    return <LoadingState label="Loading your assessment…" />;
  }

  if (!profileReady) {
    return (
      <ContentContainer className="max-w-4xl">
        <PageHeader eyebrow={courseTitle} title="Learning preferences needed" description="Complete your learning goal and preferences before starting the pre-assessment." />
        <Card className="mt-7 p-6 sm:p-8">
          <p className="text-text-secondary">Your saved preferences help SkillSync interpret the result and shape the next learning path.</p>
          <ButtonLink href={`/learner/courses/${courseId}/learning-profile`} className="mt-5">Complete learning preferences<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
        </Card>
      </ContentContainer>
    );
  }

  if (view === "processing") {
    return (
      <ContentContainer className="max-w-4xl">
        <div className="py-8 sm:py-14">
          <Badge variant="info"><Sparkles className="size-3.5" aria-hidden="true" />Assessment submitted</Badge>
          <h1 className="type-h1 mt-5">Analyzing your assessment</h1>
          <p className="type-body-large mt-3 max-w-2xl text-text-secondary">We’re turning your answers into a clear skill snapshot and focused next step.</p>
          <Card className="mt-8 overflow-hidden p-5 sm:p-7">
            <Progress value={Math.min(processingStep, evaluationSteps.length)} max={evaluationSteps.length} label="Evaluation progress" showValue />
            <ol className="mt-7 grid gap-2" aria-live="polite">
              {evaluationSteps.map((step, index) => {
                const complete = index < processingStep;
                const active = index === processingStep;
                return (
                  <li key={step} className={cn("flex min-h-12 items-center gap-3 rounded-md px-3 py-2", active && "bg-blue-50 text-blue-900")}>
                    {complete ? <CheckCircle2 className="size-5 shrink-0 text-status-success" aria-hidden="true" /> : active ? <Spinner className="size-5 shrink-0" /> : <Circle className="size-5 shrink-0 text-neutral-300" aria-hidden="true" />}
                    <span className={cn("type-body-small", active && "font-semibold")}>{step}</span>
                    <span className="sr-only">{complete ? "Complete" : active ? "In progress" : "Waiting"}</span>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      </ContentContainer>
    );
  }

  if (view === "review" && attempt) {
    const answeredCount = attempt.responses.filter((response) => response.selectedOptionIds.length > 0).length;
    const unanswered = digitalMarketingPreAssessment.questions
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !attempt.responses.some((response) => response.questionId === item.id && response.selectedOptionIds.length));
    return (
      <ContentContainer className="max-w-4xl">
        <PageHeader eyebrow={courseTitle} title="Review your answers" description="Check that every question has an answer before submitting your pre-assessment." />
        <Card className="mt-7 overflow-hidden">
          <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-7">
            <ReviewStat label="Questions" value={digitalMarketingPreAssessment.questions.length} />
            <ReviewStat label="Answered" value={answeredCount} />
            <ReviewStat label="Unanswered" value={unanswered.length} attention={unanswered.length > 0} />
          </div>
          <div className="border-t border-border-default p-5 sm:p-7">
            <h2 className="type-title-large">Question check</h2>
            <div className="mt-4 grid gap-2">
              {digitalMarketingPreAssessment.questions.map((item, index) => {
                const answered = attempt.responses.some((response) => response.questionId === item.id && response.selectedOptionIds.length);
                return (
                  <button key={item.id} type="button" onClick={() => moveTo(index)} className="flex min-h-12 items-center gap-3 rounded-md border border-border-default px-3 py-2 text-left transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30">
                    {answered ? <CheckCircle2 className="size-5 shrink-0 text-status-success" aria-hidden="true" /> : <Circle className="size-5 shrink-0 text-status-warning" aria-hidden="true" />}
                    <span className="min-w-0 flex-1"><span className="type-caption block text-text-tertiary">Question {index + 1}</span><span className="line-clamp-1 text-sm font-medium">{item.prompt}</span></span>
                    <span className="type-caption font-semibold text-action-primary">Review</span>
                  </button>
                );
              })}
            </div>
            {unanswered.length > 0 && <FieldError className="mt-4">Answer all {digitalMarketingPreAssessment.questions.length} questions before submitting.</FieldError>}
          </div>
        </Card>
        <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <Button variant="secondary" onClick={() => moveTo(digitalMarketingPreAssessment.questions.length - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Back to questions</Button>
          <Button onClick={() => setConfirmSubmit(true)} disabled={unanswered.length > 0}>Submit assessment<ClipboardCheck className="size-4" aria-hidden="true" /></Button>
        </div>
        <ConfirmationDialog open={confirmSubmit} title="Submit your pre-assessment?" description="Your answers will be evaluated to identify strengths, priority areas, and the right learning sequence." confirmLabel="Submit assessment" onConfirm={submitAssessment} onCancel={() => setConfirmSubmit(false)} />
      </ContentContainer>
    );
  }

  if (view === "question" && attempt) {
    const selectedIds = currentResponse?.selectedOptionIds ?? [];
    return (
      <ContentContainer className="max-w-4xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <ButtonLink href={`/learner/courses/${courseId}/learning-profile`} variant="ghost" size="sm"><ArrowLeft className="size-4" aria-hidden="true" />Learning preferences</ButtonLink>
          <Badge variant="neutral">Answers save automatically</Badge>
        </div>
        <Card className="overflow-hidden shadow-sm">
          <div className="border-b border-border-default bg-neutral-25 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4"><p className="type-label text-action-primary">Question {currentIndex + 1} of {digitalMarketingPreAssessment.questions.length}</p><span className="type-caption text-text-tertiary">{question.difficulty}</span></div>
            <Progress className="mt-3" value={currentIndex + 1} max={digitalMarketingPreAssessment.questions.length} size="sm" />
          </div>
          <fieldset className="p-5 sm:p-8" aria-describedby={error ? "assessment-answer-error" : undefined}>
            <legend className="type-title-large max-w-3xl text-xl leading-8 sm:text-2xl">{question.prompt}</legend>
            {question.context && <p className="type-body-small mt-2 text-text-secondary">{question.context}</p>}
            <div className="mt-6 grid gap-3">
              {question.options.map((option) => {
                const checked = selectedIds.includes(option.id);
                return (
                  <label key={option.id} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/50 focus-within:ring-3 focus-within:ring-border-focus/30", checked ? "border-action-primary bg-blue-50" : "border-border-default")}>
                    <input type={question.type === "multiple-choice" ? "radio" : "checkbox"} name={question.id} value={option.id} checked={checked} onChange={(event) => updateAnswer(option.id, event.target.checked)} className="sr-only" />
                    <span className={cn("flex size-6 shrink-0 items-center justify-center border", question.type === "multiple-choice" ? "rounded-full" : "rounded-[6px]", checked ? "border-action-primary bg-action-primary text-white" : "border-border-strong bg-white")}>
                      {checked && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="text-sm font-medium leading-6 text-text-primary sm:text-base">{option.text}</span>
                  </label>
                );
              })}
            </div>
            {error && <FieldError id="assessment-answer-error" className="mt-4">{error}</FieldError>}
          </fieldset>
          <div className="flex flex-col-reverse justify-between gap-3 border-t border-border-default bg-neutral-25 p-4 sm:flex-row sm:p-5">
            <Button variant="secondary" onClick={() => currentIndex === 0 ? setView("intro") : moveTo(currentIndex - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Back</Button>
            <Button onClick={goNext}>{currentIndex === digitalMarketingPreAssessment.questions.length - 1 ? "Review answers" : "Next question"}<ArrowRight className="size-4" aria-hidden="true" /></Button>
          </div>
        </Card>
      </ContentContainer>
    );
  }

  const canResume = Boolean(attempt && attempt.status === "in-progress" && attempt.responses.length > 0);
  const completed = journey.result && attempt?.status === "completed";
  return (
    <ContentContainer className="max-w-5xl">
      <PageHeader eyebrow={courseTitle} title="Let’s see what you already know" description="This short assessment helps SkillSync focus your learning path on the skills that need the most attention." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-800"><ListChecks className="size-6" aria-hidden="true" /></span>
          <h2 className="type-title-large mt-5">A focused starting point</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">Answer one question at a time. Your result will highlight strengths and priority areas without treating a lower score as failure.</p>
          <div className="mt-6 flex flex-wrap gap-2"><Badge variant="neutral"><Clock3 className="size-3.5" aria-hidden="true" />{digitalMarketingPreAssessment.estimatedMinutes}</Badge><Badge variant="neutral">{digitalMarketingPreAssessment.questions.length} questions</Badge><Badge variant="info">Answers save as you go</Badge></div>
          <div className="mt-7 flex flex-wrap gap-3">
            {completed ? <ButtonLink href={`/learner/courses/${courseId}/skill-gap`}>View skill snapshot<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink> : <Button onClick={canResume ? () => setView("question") : beginAssessment}>{canResume ? "Resume assessment" : "Start assessment"}<ArrowRight className="size-4" aria-hidden="true" /></Button>}
            {completed && <Button variant="secondary" onClick={beginAssessment}>Retake assessment</Button>}
            <ButtonLink href={`/learner/courses/${courseId}/learning-profile`} variant="ghost">Back to learning preferences</ButtonLink>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="type-label text-text-tertiary">Assessment context</p>
          <dl className="mt-4 grid gap-4">
            <div><dt className="type-caption text-text-tertiary">Course</dt><dd className="mt-1 font-semibold">{courseTitle}</dd></div>
            <div><dt className="type-caption text-text-tertiary">Topics</dt><dd className="mt-1 text-sm text-text-secondary">Funnel, customer journey, channel strategy, and measurement</dd></div>
            <div><dt className="type-caption text-text-tertiary">Next</dt><dd className="mt-1 text-sm text-text-secondary">A skill snapshot based on your answers</dd></div>
          </dl>
        </Card>
      </div>
    </ContentContainer>
  );
}

function LoadingState({ label }: { label: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />{label}</div></ContentContainer>;
}

function ReviewStat({ label, value, attention = false }: { label: string; value: number; attention?: boolean }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className={cn("mt-1 text-2xl font-semibold", attention && value > 0 ? "text-status-warning" : "text-text-primary")}>{value}</dd></div>;
}
