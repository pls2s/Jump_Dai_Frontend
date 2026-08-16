"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, CircleX, ClipboardCheck, Clock3, RefreshCw, Sparkles } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, FieldError, Progress, Spinner } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import {
  createKnowledgeCheckAttempt,
  loadKnowledgeCheckExperience,
  markKnowledgeCheckEvaluating,
  markKnowledgeCheckSubmitting,
  saveKnowledgeCheckAttempt,
  saveKnowledgeCheckResponse,
  submitKnowledgeCheck,
} from "@/features/learner-journey/services/learning-experience-service";
import type { KnowledgeCheckDefinition, LearnerJourneyState } from "@/features/learner-journey/types";
import { cn } from "@/lib/cn";

type CheckView = "intro" | "question" | "submitting" | "analyzing" | "result";

const analysisSteps = [
  "Reviewing your answers",
  "Measuring skill improvement",
  "Checking the passing criteria",
  "Preparing your feedback",
];

export function KnowledgeCheckWorkspace({ courseId, courseTitle, definition, previewView, previewResult }: { courseId: string; courseTitle: string; definition: KnowledgeCheckDefinition; previewView?: string; previewResult?: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);
  const [view, setView] = useState<CheckView>(previewView === "question" || previewView === "submitting" || previewView === "analyzing" || previewView === "result" ? previewView : "intro");
  const [error, setError] = useState("");
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      const loaded = loadKnowledgeCheckExperience(session.user.id, courseId, definition, previewView === "result" || previewView === "submitting" || previewView === "analyzing" ? (previewResult === "needs-practice" ? "needs-practice" : "passed") : undefined);
      setJourney(loaded.journey);
      const existing = loaded.journey.knowledgeChecks?.[definition.id];
      if (!previewView && existing?.result) setView("result");
      else if (!previewView && existing?.status === "submitting") setView("submitting");
      else if (!previewView && existing?.status === "evaluating") setView("analyzing");
      else if (!previewView && existing?.status === "in-progress") setView("question");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, definition, previewResult, previewView, router]);

  const attempt = journey?.knowledgeChecks?.[definition.id];
  const currentIndex = Math.min(attempt?.currentQuestionIndex ?? 0, definition.questions.length - 1);
  const question = definition.questions[currentIndex];
  const response = attempt?.responses.find((item) => item.questionId === question.id);

  const finishSubmission = useCallback(() => {
    if (!journey || !attempt) return;
    const session = getAuthSession();
    if (!session) return;
    setJourney(submitKnowledgeCheck(session.user.id, courseId, journey, attempt, definition));
    setView("result");
  }, [attempt, courseId, definition, journey]);

  useEffect(() => {
    if (view !== "submitting" || !attempt || !journey) return;
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) return;
      setJourney(markKnowledgeCheckEvaluating(session.user.id, courseId, journey, attempt));
      setAnalysisStep(0);
      setView("analyzing");
    }, 420);
    return () => window.clearTimeout(timer);
  }, [attempt, courseId, journey, view]);

  useEffect(() => {
    if (view !== "analyzing" || !attempt) return;
    if (analysisStep >= analysisSteps.length) {
      const timer = window.setTimeout(finishSubmission, 420);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setAnalysisStep((current) => current + 1), 480);
    return () => window.clearTimeout(timer);
  }, [analysisStep, attempt, finishSubmission, view]);

  function start() {
    if (!journey) return;
    const session = getAuthSession();
    if (!session) return;
    const nextAttempt = createKnowledgeCheckAttempt(definition);
    setJourney(saveKnowledgeCheckAttempt(session.user.id, courseId, journey, nextAttempt));
    setView("question");
    setError("");
  }

  function updateAnswer(optionId: string, checked: boolean) {
    if (!journey || !attempt) return;
    const selected = question.type === "multiple-choice" ? [optionId] : checked ? Array.from(new Set([...(response?.selectedOptionIds ?? []), optionId])) : (response?.selectedOptionIds ?? []).filter((id) => id !== optionId);
    const session = getAuthSession();
    if (!session) return;
    setJourney(saveKnowledgeCheckResponse(session.user.id, courseId, journey, attempt, { questionId: question.id, selectedOptionIds: selected }, currentIndex));
    if (selected.length) setError("");
  }

  function move(index: number) {
    if (!journey || !attempt) return;
    const session = getAuthSession();
    if (!session) return;
    setJourney(saveKnowledgeCheckAttempt(session.user.id, courseId, journey, { ...attempt, currentQuestionIndex: index }));
    setError("");
  }

  function next() {
    if (!response?.selectedOptionIds.length) {
      setError("Select an answer to continue.");
      return;
    }
    if (currentIndex < definition.questions.length - 1) move(currentIndex + 1);
    else submit();
  }

  function submit() {
    if (!journey || !attempt) return;
    const session = getAuthSession();
    if (!session) return;
    if (definition.kind === "post-assessment") {
      setJourney(markKnowledgeCheckSubmitting(session.user.id, courseId, journey, attempt));
      setView("submitting");
      return;
    }
    finishSubmission();
  }

  if (!journey) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading knowledge check…</div></ContentContainer>;

  const learningComplete = journey.learningProgress?.status === "completed";
  const sourceLessonComplete = definition.sourceLessonId ? journey.learningProgress?.completedLessonIds.includes(definition.sourceLessonId) : true;
  if (definition.kind === "post-assessment" && !learningComplete) return <DependencyState title="Complete your learning path first" description="The final knowledge check becomes available after every required lesson in your personalized path is complete." href={`/learner/courses/${courseId}/learn`} action="Continue learning" />;
  if (!sourceLessonComplete) return <DependencyState title="Complete the lesson first" description="Finish the related lesson before taking this quick knowledge check." href={`/learner/courses/${courseId}/learn/${definition.sourceLessonId}`} action="Back to lesson" />;

  if (view === "submitting") {
    return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><Card className="w-full max-w-xl p-6 text-center sm:p-8"><Spinner className="mx-auto size-7" /><h1 className="type-h2 mt-5">Submitting your final knowledge check</h1><p className="type-body-small mt-3 text-text-secondary">Your answers are saved. Next, SkillSync will compare your results and prepare feedback.</p></Card></ContentContainer>;
  }

  if (view === "analyzing") {
    return (
      <ContentContainer className="max-w-4xl">
        <div className="py-8 sm:py-14">
          <Badge variant="info"><Sparkles className="size-3.5" aria-hidden="true" />Assessment submitted</Badge>
          <h1 className="type-h1 mt-5">Analyzing your final knowledge check</h1>
          <p className="type-body-large mt-3 max-w-2xl text-text-secondary">We’re comparing your current understanding with your pre-assessment and preparing clear feedback.</p>
          <Card className="mt-8 p-5 sm:p-7">
            <Progress value={Math.min(analysisStep, analysisSteps.length)} max={analysisSteps.length} label="Post-assessment analysis progress" showValue />
            <ol className="mt-7 grid gap-2" aria-live="polite">
              {analysisSteps.map((step, index) => {
                const complete = index < analysisStep;
                const active = index === analysisStep;
                return <li key={step} className={cn("flex min-h-12 items-center gap-3 rounded-md px-3 py-2", active && "bg-blue-50 text-blue-900")}>{complete ? <CheckCircle2 className="size-5 shrink-0 text-status-success" aria-hidden="true" /> : active ? <Spinner className="size-5 shrink-0" /> : <Circle className="size-5 shrink-0 text-neutral-300" aria-hidden="true" />}<span className={cn("type-body-small", active && "font-semibold")}>{step}</span><span className="sr-only">{complete ? "Complete" : active ? "In progress" : "Waiting"}</span></li>;
              })}
            </ol>
          </Card>
        </div>
      </ContentContainer>
    );
  }

  if (view === "result" && attempt?.result) {
    const result = attempt.result;
    const preResult = journey.result;
    const correctCount = result.questionScores.filter((item) => item.isCorrect).length;
    return (
      <ContentContainer className="max-w-5xl">
        <PageHeader eyebrow={`${courseTitle} · ${definition.kind === "post-assessment" ? "Post-assessment" : "Learning quiz"}`} title={result.passed ? "Knowledge check complete" : "A little more practice will help"} description={result.passed ? "You met the passing criteria for this check." : "Review the feedback, revisit the related lesson, and try again when you’re ready."} actions={<Badge variant={result.passed ? "success" : "warning"}>{result.passed ? "Passed" : "Needs more practice"}</Badge>} />
        <div className="mt-7 grid gap-5 md:grid-cols-[16rem_minmax(0,1fr)]">
          <Card className="flex flex-col items-center justify-center p-6 text-center"><p className="type-caption text-text-tertiary">Score</p><p className="mt-2 text-5xl font-semibold">{result.score}%</p><p className="type-body-small mt-3 text-text-secondary">{correctCount} of {definition.questions.length} exactly correct</p><p className="type-caption mt-1 text-text-tertiary">Passing score: {definition.passingScore}%</p></Card>
          {definition.kind === "post-assessment" && preResult ? <Card className="p-5 sm:p-6"><h2 className="type-title-large">Before and after</h2><div className="mt-5 grid grid-cols-3 gap-3 text-center"><ResultStat label="Before" value={`${preResult.overallScore}%`} /><ResultStat label="After" value={`${result.score}%`} /><ResultStat label="Change" value={`${result.score - preResult.overallScore >= 0 ? "+" : ""}${result.score - preResult.overallScore}`} /></div><div className="mt-5 grid gap-3">{result.skillScores.map((after) => { const before = preResult.skillScores.find((item) => item.skillId === after.skillId)?.score ?? 0; return <div key={after.skillId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm"><span>{after.name}</span><span className="font-semibold">{before}% → {after.score}%</span></div>; })}</div></Card> : <Card className="p-5 sm:p-6"><h2 className="type-title-large">Answer feedback</h2><div className="mt-4 grid gap-4">{definition.questions.map((item) => { const score = result.questionScores.find((questionScore) => questionScore.questionId === item.id); return <div key={item.id} className="flex gap-3">{score?.isCorrect ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-success" aria-hidden="true" /> : <CircleX className="mt-0.5 size-5 shrink-0 text-status-error" aria-hidden="true" />}<div><p className="font-semibold">{score?.isCorrect ? "Correct" : "Not quite"}</p><p className="type-body-small mt-1 text-text-secondary">{item.explanation}</p></div></div>; })}</div></Card>}
        </div>
        <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <ButtonLink href={definition.sourceLessonId ? `/learner/courses/${courseId}/learn/${definition.sourceLessonId}` : `/learner/courses/${courseId}/learn`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Review learning</ButtonLink>
          {result.passed ? <ButtonLink href={definition.kind === "post-assessment" ? `/learner/courses/${courseId}/practical-assessment` : `/learner/courses/${courseId}/learn`}>{definition.kind === "post-assessment" ? "Continue to practical assessment" : "Continue learning"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink> : <Button onClick={start}><RefreshCw className="size-4" aria-hidden="true" />Try again</Button>}
        </div>
      </ContentContainer>
    );
  }

  if (view === "question" && attempt) {
    const selectedIds = response?.selectedOptionIds ?? [];
    return (
      <ContentContainer className="max-w-4xl">
        <Card className="overflow-hidden shadow-sm">
          <div className="border-b border-border-default bg-neutral-25 p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><p className="type-label text-action-primary">Question {currentIndex + 1} of {definition.questions.length}</p><span className="type-caption text-text-tertiary">{question.type === "multiple-select" ? "Select all that apply" : "Choose one"}</span></div><Progress className="mt-3" value={currentIndex + 1} max={definition.questions.length} size="sm" /></div>
          <fieldset className="p-5 sm:p-8" aria-describedby={error ? "check-answer-error" : undefined}><legend className="type-title-large max-w-3xl text-xl leading-8 sm:text-2xl">{question.prompt}</legend>{question.context && <p className="type-body-small mt-2 text-text-secondary">{question.context}</p>}<div className="mt-6 grid gap-3">{question.options.map((option) => { const checked = selectedIds.includes(option.id); return <label key={option.id} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/50 focus-within:ring-3 focus-within:ring-border-focus/30", checked ? "border-action-primary bg-blue-50" : "border-border-default")}><input type={question.type === "multiple-choice" ? "radio" : "checkbox"} name={question.id} value={option.id} checked={checked} onChange={(event) => updateAnswer(option.id, event.target.checked)} className="sr-only" /><span className={cn("flex size-6 shrink-0 items-center justify-center border", question.type === "multiple-choice" ? "rounded-full" : "rounded-[6px]", checked ? "border-action-primary bg-action-primary text-white" : "border-border-strong bg-white")}>{checked && <Check className="size-4" aria-hidden="true" />}</span><span className="text-sm font-medium leading-6 sm:text-base">{option.text}</span></label>; })}</div>{error && <FieldError id="check-answer-error" className="mt-4">{error}</FieldError>}</fieldset>
          <div className="flex flex-col-reverse justify-between gap-3 border-t border-border-default bg-neutral-25 p-4 sm:flex-row sm:p-5"><Button variant="secondary" onClick={() => currentIndex === 0 ? setView("intro") : move(currentIndex - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Back</Button><Button onClick={next}>{currentIndex === definition.questions.length - 1 ? "Submit" : "Next"}{currentIndex === definition.questions.length - 1 ? <ClipboardCheck className="size-4" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}</Button></div>
        </Card>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer className="max-w-4xl">
      <PageHeader eyebrow={courseTitle} title={definition.title} description={definition.description} />
      <Card className="mt-7 p-6 sm:p-8"><div className="flex flex-wrap gap-2"><Badge variant="info">{definition.questions.length} {definition.questions.length === 1 ? "question" : "questions"}</Badge><Badge variant="neutral"><Clock3 className="size-3.5" aria-hidden="true" />{definition.estimatedMinutes}</Badge><Badge variant="neutral">Pass at {definition.passingScore}%</Badge></div><p className="mt-6 max-w-2xl text-text-secondary">Questions appear one at a time. Your answers save locally while the check is in progress.</p><div className="mt-7 flex flex-wrap gap-3"><Button onClick={start}>{attempt?.status === "in-progress" ? "Resume quiz" : "Start quiz"}<ArrowRight className="size-4" aria-hidden="true" /></Button><ButtonLink href={definition.sourceLessonId ? `/learner/courses/${courseId}/learn/${definition.sourceLessonId}` : `/learner/courses/${courseId}/learn`} variant="ghost">Back to learning</ButtonLink></div></Card>
    </ContentContainer>
  );
}

function DependencyState({ title, description, href, action }: { title: string; description: string; href: string; action: string }) { return <ContentContainer className="max-w-4xl"><Card className="mt-8 p-6 sm:p-8"><h1 className="type-h1">{title}</h1><p className="type-body-large mt-3 text-text-secondary">{description}</p><ButtonLink href={href} className="mt-6">{action}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>; }
function ResultStat({ label, value }: { label: string; value: string }) { return <div className="rounded-md bg-neutral-50 p-3"><p className="type-caption text-text-tertiary">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
