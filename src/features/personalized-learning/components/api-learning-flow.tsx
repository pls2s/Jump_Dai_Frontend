"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  ListChecks,
  Route,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, FieldError, Progress, Spinner } from "@/components/ui";
import { digitalMarketingPreAssessment } from "@/data/mock";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import type { AssessmentQuestion } from "@/features/learner-journey/types";
import { ApiError } from "@/lib/api/api-client";
import { cn } from "@/lib/cn";
import {
  generateApiLearningPath,
  getApiCurrentLearningPath,
  getApiLearningProfile,
  getApiSkillGapAnalysis,
  submitApiPreAssessment,
  type ApiKnowledgeGap,
  type ApiPersonalizedLearningPath,
  type ApiSkillGapAnalysis,
} from "../api/personalized-learning-api";

type AssessmentScreen = "intro" | "questions" | "review";

function getAccessToken() {
  const session = getAuthSession();
  return session?.mode === "api" ? session.accessToken : null;
}

export function ApiPreAssessmentWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);
  const [screen, setScreen] = useState<AssessmentScreen>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/sign-in");
      return;
    }
    let active = true;
    void getApiLearningProfile(token)
      .then(() => {
        if (active) setProfileReady(true);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        if (!(requestError instanceof ApiError && requestError.status === 404)) {
          setError(requestError instanceof Error ? requestError.message : "We couldn’t load your learning profile.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  const question = digitalMarketingPreAssessment.questions[questionIndex];
  const answeredCount = Object.values(answers).filter((answer) => answer.length > 0).length;

  function selectAnswer(questionId: string, optionId: string, multiple: boolean, checked: boolean) {
    setAnswers((current) => {
      const selected = current[questionId] ?? [];
      return {
        ...current,
        [questionId]: multiple
          ? checked ? Array.from(new Set([...selected, optionId])) : selected.filter((id) => id !== optionId)
          : [optionId],
      };
    });
    setError("");
  }

  async function submit() {
    const token = getAccessToken();
    if (!token) return router.replace("/sign-in");
    if (answeredCount !== digitalMarketingPreAssessment.questions.length) {
      setError("Answer every question before submitting your pre-assessment.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitApiPreAssessment({
        assessment_title: digitalMarketingPreAssessment.title,
        topic_scores: calculateTopicScores(digitalMarketingPreAssessment.questions, answers),
        passing_score: 70,
      }, token);
      router.replace(`/learner/courses/${courseId}/skill-gap`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn’t submit your assessment. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading your assessment…" />;

  if (!profileReady) {
    return <PrerequisiteState courseId={courseId} courseTitle={courseTitle} title="Learning preferences needed" description="Complete your goal and learning preferences before starting the pre-assessment." href="learning-profile" action="Complete learning preferences" />;
  }

  if (screen === "intro") {
    return (
      <ContentContainer className="max-w-5xl">
        <PageHeader eyebrow={courseTitle} title="Let’s see what you already know" description="This short assessment calculates a score for each topic, then sends those topic scores to your learner profile." />
        <Card className="mt-8 p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-800"><ListChecks className="size-6" aria-hidden="true" /></span>
          <h2 className="type-title-large mt-5">A focused starting point</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">Your answers stay visible here until submission. Once submitted, the backend stores only the topic-level result used for your skill-gap analysis.</p>
          <div className="mt-6 flex flex-wrap gap-2"><Badge variant="neutral"><Clock3 className="size-3.5" aria-hidden="true" />{digitalMarketingPreAssessment.estimatedMinutes}</Badge><Badge variant="neutral">{digitalMarketingPreAssessment.questions.length} questions</Badge><Badge variant="info">Topic scores are saved on submission</Badge></div>
          {error && <FieldError className="mt-5">{error}</FieldError>}
          <div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => setScreen("questions")}>Start assessment<ArrowRight className="size-4" aria-hidden="true" /></Button><ButtonLink href={`/learner/courses/${courseId}/learning-profile`} variant="ghost">Back to learning preferences</ButtonLink></div>
        </Card>
      </ContentContainer>
    );
  }

  if (screen === "review") {
    const unanswered = digitalMarketingPreAssessment.questions.filter((item) => !(answers[item.id] ?? []).length);
    return (
      <ContentContainer className="max-w-4xl">
        <PageHeader eyebrow={courseTitle} title="Review your answers" description="Check each answer before creating your backend skill snapshot." />
        <Card className="mt-7 overflow-hidden">
          <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-7"><ReviewStat label="Questions" value={digitalMarketingPreAssessment.questions.length} /><ReviewStat label="Answered" value={answeredCount} /><ReviewStat label="Unanswered" value={unanswered.length} attention={unanswered.length > 0} /></div>
          <div className="border-t border-border-default p-5 sm:p-7"><div className="grid gap-2">{digitalMarketingPreAssessment.questions.map((item, index) => { const answered = Boolean((answers[item.id] ?? []).length); return <button key={item.id} type="button" onClick={() => { setQuestionIndex(index); setScreen("questions"); }} className="flex min-h-12 items-center gap-3 rounded-md border border-border-default px-3 py-2 text-left transition hover:bg-blue-50"><span className="flex size-5 shrink-0 items-center justify-center">{answered ? <CheckCircle2 className="size-5 text-status-success" aria-hidden="true" /> : <Circle className="size-5 text-status-warning" aria-hidden="true" />}</span><span className="min-w-0 flex-1"><span className="type-caption block text-text-tertiary">Question {index + 1}</span><span className="line-clamp-1 text-sm font-medium">{item.prompt}</span></span><span className="type-caption font-semibold text-action-primary">Review</span></button>; })}</div></div>
        </Card>
        {error && <FieldError className="mt-4">{error}</FieldError>}
        <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><Button variant="secondary" onClick={() => setScreen("questions")}><ArrowLeft className="size-4" aria-hidden="true" />Back to questions</Button><Button onClick={submit} disabled={unanswered.length > 0} isLoading={submitting} loadingLabel="Submitting assessment…">Submit assessment<ArrowRight className="size-4" aria-hidden="true" /></Button></div>
      </ContentContainer>
    );
  }

  const selected = answers[question.id] ?? [];
  return (
    <ContentContainer className="max-w-4xl">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><ButtonLink href={`/learner/courses/${courseId}/learning-profile`} variant="ghost" size="sm"><ArrowLeft className="size-4" aria-hidden="true" />Learning preferences</ButtonLink><Badge variant="neutral">Question {questionIndex + 1} of {digitalMarketingPreAssessment.questions.length}</Badge></div>
      <Card className="overflow-hidden shadow-sm">
        <div className="border-b border-border-default bg-neutral-25 p-5 sm:p-6"><p className="type-label text-action-primary">{question.topicId.replaceAll("-", " ")}</p><Progress className="mt-3" value={questionIndex + 1} max={digitalMarketingPreAssessment.questions.length} size="sm" /></div>
        <fieldset className="p-5 sm:p-8"><legend className="type-title-large max-w-3xl text-xl leading-8 sm:text-2xl">{question.prompt}</legend>{question.context && <p className="type-body-small mt-2 text-text-secondary">{question.context}</p>}<div className="mt-6 grid gap-3">{question.options.map((option) => { const checked = selected.includes(option.id); return <label key={option.id} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/50", checked ? "border-action-primary bg-blue-50" : "border-border-default")}><input type={question.type === "multiple-choice" ? "radio" : "checkbox"} name={question.id} value={option.id} checked={checked} onChange={(event) => selectAnswer(question.id, option.id, question.type === "multiple-select", event.target.checked)} className="sr-only" /><span className={cn("flex size-6 shrink-0 items-center justify-center border", question.type === "multiple-choice" ? "rounded-full" : "rounded-[6px]", checked ? "border-action-primary bg-action-primary text-white" : "border-border-strong bg-white")}>{checked && <Check className="size-4" strokeWidth={3} aria-hidden="true" />}</span><span className="text-sm font-medium leading-6 text-text-primary sm:text-base">{option.text}</span></label>; })}</div></fieldset>
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-border-default bg-neutral-25 p-4 sm:flex-row sm:p-5"><Button variant="secondary" onClick={() => questionIndex === 0 ? setScreen("intro") : setQuestionIndex((current) => current - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Back</Button><Button onClick={() => { if (!selected.length) { setError("Select an answer to continue."); return; } if (questionIndex === digitalMarketingPreAssessment.questions.length - 1) setScreen("review"); else setQuestionIndex((current) => current + 1); }}>{questionIndex === digitalMarketingPreAssessment.questions.length - 1 ? "Review answers" : "Next question"}<ArrowRight className="size-4" aria-hidden="true" /></Button></div>
      </Card>
      {error && <FieldError className="mt-4">{error}</FieldError>}
    </ContentContainer>
  );
}

export function ApiSkillGapWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ApiSkillGapAnalysis | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return router.replace("/sign-in");
    let active = true;
    void getApiSkillGapAnalysis(token).then((data) => {
      if (active) setAnalysis(data);
    }).catch((requestError: unknown) => {
      if (!active) return;
      setError(requestError instanceof Error ? requestError.message : "We couldn’t load your skill snapshot.");
    });
    return () => { active = false; };
  }, [router]);

  if (!analysis && !error) return <LoadingState label="Preparing your skill snapshot…" />;
  if (!analysis) return <PrerequisiteState courseId={courseId} courseTitle={courseTitle} title="Complete your pre-assessment first" description={error} href="pre-assessment" action="Go to pre-assessment" />;

  const strengths = analysis.assessment.topic_scores.filter((topic) => topic.score >= analysis.assessment.passing_score);
  return (
    <ContentContainer className="max-w-6xl">
      <PageHeader eyebrow={`${courseTitle} · Based on your pre-assessment`} title="Your skill snapshot" description="These are the actual topic scores and gaps calculated by the backend from your submitted assessment." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]"><Card className="flex flex-col items-center justify-center p-6 text-center sm:p-8"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-800"><BarChart3 className="size-6" aria-hidden="true" /></span><p className="type-caption mt-5 text-text-tertiary">Overall readiness</p><p className="mt-1 text-5xl font-semibold tracking-tight text-text-primary">{analysis.assessment.overall_score}%</p><p className="type-body-small mt-3 max-w-52 text-text-secondary">{formatEnum(analysis.assessment.learner_level)} level · target score {analysis.assessment.passing_score}%</p></Card><Card className="overflow-hidden"><div className="border-b border-border-default p-5 sm:px-6"><h2 className="type-title-large">Topic score summary</h2><p className="type-body-small mt-1 text-text-secondary">The backend stores and evaluates these topic-level scores.</p></div><div className="divide-y divide-border-default">{analysis.assessment.topic_scores.map((topic) => <div key={topic.topic} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center sm:px-6"><div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{topic.topic}</h3><span className="text-sm font-semibold sm:hidden">{topic.score}%</span></div><Progress className="mt-2" value={topic.score} size="sm" label={`${topic.topic} score`} /></div><div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><span className="hidden text-lg font-semibold sm:block">{topic.score}%</span><Badge variant={topic.score < analysis.assessment.passing_score ? "warning" : "success"}>{topic.score < analysis.assessment.passing_score ? "Needs focus" : "Meets target"}</Badge></div></div>)}</div></Card></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2"><GapList title="Your priority areas" description="These topics are below the target score." gaps={analysis.knowledge_gaps} /><Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-green-100 text-status-success"><Award className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">Topics meeting target</h2><p className="type-body-small mt-1 text-text-secondary">Derived directly from scores at or above the backend target.</p></div></div><div className="mt-6 grid gap-3">{strengths.map((topic) => <div key={topic.topic} className="flex items-center justify-between rounded-md bg-green-50 p-4"><span className="font-semibold">{topic.topic}</span><Badge variant="success">{topic.score}%</Badge></div>)}{strengths.length === 0 && <p className="type-body-small text-text-secondary">No topic has reached the target yet. Your path will provide guided support for every topic.</p>}</div></Card></div>
      <Card className="mt-7 flex flex-col items-start justify-between gap-5 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:p-6"><div className="flex items-start gap-3"><Target className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><div><h2 className="font-semibold text-blue-950">Ready for a focused plan</h2><p className="type-body-small mt-1 max-w-2xl text-blue-900">Generate a path that uses this assessment together with your saved goal and learning styles.</p></div></div><ButtonLink href={`/learner/courses/${courseId}/learning-path?view=generating`} className="shrink-0">Build my learning path<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>
      <div className="mt-6"><ButtonLink href={`/learner/courses/${courseId}/pre-assessment`} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Back to assessment</ButtonLink></div>
    </ContentContainer>
  );
}

export function ApiLearningPathWorkspace({ courseId, courseTitle, generate }: { courseId: string; courseTitle: string; generate: boolean }) {
  const router = useRouter();
  const [path, setPath] = useState<ApiPersonalizedLearningPath | null>(null);
  const [state, setState] = useState<"loading" | "generating" | "missing" | "error" | "ready">(generate ? "generating" : "loading");
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return router.replace("/sign-in");
    let active = true;
    const load = async () => {
      try {
        if (generate) {
          if (started.current) return;
          started.current = true;
          const generated = await generateApiLearningPath(token);
          if (!active) return;
          setPath(generated);
          setState("ready");
          router.replace(`/learner/courses/${courseId}/learning-path`);
          return;
        }
        const current = await getApiCurrentLearningPath(token);
        if (!active) return;
        setPath(current);
        setState("ready");
      } catch (requestError) {
        if (!active) return;
        if (requestError instanceof ApiError && requestError.status === 404) setState("missing");
        else { setError(requestError instanceof Error ? requestError.message : "We couldn’t load your learning path."); setState("error"); }
      }
    };
    void load();
    return () => { active = false; };
  }, [courseId, generate, router]);

  if (state === "loading" || state === "generating") return <GeneratingState />;
  if (state === "missing") return <PrerequisiteState courseId={courseId} courseTitle={courseTitle} title="Learning path not generated yet" description="Complete the pre-assessment, then generate a path from your skill snapshot." href="skill-gap" action="Go to skill snapshot" />;
  if (state === "error") return <ErrorState courseId={courseId} error={error} />;
  if (!path) return null;

  return (
    <ContentContainer className="max-w-6xl">
      <PageHeader eyebrow={`${courseTitle} · Path version ${path.version}`} title="Your personalized learning path" description="This order and its recommendations were generated by the backend from your saved learner profile and assessment results." actions={<Badge variant="success"><CheckCircle2 className="size-3.5" aria-hidden="true" />Ready</Badge>} />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Focus areas" value={String(path.weak_topics.length)} icon={Target} /><SummaryCard label="Recommended lessons" value={String(path.lessons.length)} icon={Route} /><SummaryCard label="Weekly plan" value={`${path.weekly_learning_hours} hrs`} icon={Clock3} /><SummaryCard label="Current level" value={formatEnum(path.learner_level)} icon={BarChart3} /></div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]"><section aria-labelledby="path-heading"><div><h2 id="path-heading" className="type-title-large">Recommended learning order</h2><p className="type-body-small mt-1 text-text-secondary">Lessons are ordered from lower scores to topics already meeting the target.</p></div><ol className="mt-5 grid gap-4">{path.lessons.map((lesson, index) => <li key={lesson.id} className="relative pl-11"><span className="absolute top-5 left-0 flex size-9 items-center justify-center rounded-full bg-blue-800 text-xs font-semibold text-white">{index + 1}</span><Card className="p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><Badge variant={path.weak_topics.some((topic) => topic.topic === lesson.topic) ? "warning" : "success"}>{path.weak_topics.some((topic) => topic.topic === lesson.topic) ? "Priority focus" : "Reinforcement"}</Badge><h3 className="type-title-large mt-3">{lesson.title}</h3></div><span className="type-body-small flex shrink-0 items-center gap-1.5 text-text-secondary"><Clock3 className="size-4" aria-hidden="true" />{lesson.estimated_minutes} min</span></div><p className="type-body-small mt-3 text-text-secondary"><strong className="text-text-primary">Why this is here:</strong> {lesson.reason}</p><p className="type-caption mt-4 text-text-tertiary">Study recommendations</p><ul className="mt-2 grid gap-1.5 text-sm text-text-secondary">{lesson.study_recommendations.map((recommendation) => <li key={recommendation} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-status-success" aria-hidden="true" />{recommendation}</li>)}</ul></Card></li>)}</ol></section><aside className="space-y-5 lg:sticky lg:top-24 lg:self-start"><Card className="p-5"><h2 className="font-semibold">Why this path?</h2><div className="type-body-small mt-4 space-y-3 text-text-secondary"><p><strong className="text-text-primary">Goal:</strong> {path.learning_goal}</p>{path.target_role && <p><strong className="text-text-primary">Target role:</strong> {path.target_role}</p>}<p><strong className="text-text-primary">Learning styles:</strong> {path.learning_styles.map(formatEnum).join(", ")}</p><p><strong className="text-text-primary">Assessment:</strong> {path.assessment_title}</p></div></Card><Card className="p-5"><p className="type-caption text-text-tertiary">Generated</p><p className="type-body-small mt-1 font-medium">{new Date(path.generated_at).toLocaleString()}</p><p className="type-caption mt-4 text-text-tertiary">Path status</p><p className="type-body-small mt-1 font-medium">{path.is_adaptive ? "Adapted from a newer assessment" : "Initial personalized path"}</p></Card></aside></div>
      <Card className="mt-8 flex flex-col items-start justify-between gap-5 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:p-6"><div><h2 className="font-semibold text-blue-950">Your path is ready</h2><p className="type-body-small mt-1 text-blue-900">The next learner content flow has not been connected to this API path yet, so this screen does not show demo lesson progress as if it were real.</p></div><ButtonLink href="/learner" className="shrink-0">Back to learner home<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>
      <div className="mt-6"><ButtonLink href={`/learner/courses/${courseId}/skill-gap`} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Back to skill snapshot</ButtonLink></div>
    </ContentContainer>
  );
}

function calculateTopicScores(questions: AssessmentQuestion[], answers: Record<string, string[]>) {
  const grouped = new Map<string, { total: number; correct: number }>();
  for (const question of questions) {
    const current = grouped.get(question.topicId) ?? { total: 0, correct: 0 };
    current.total += 1;
    if (isCorrect(question, answers[question.id] ?? [])) current.correct += 1;
    grouped.set(question.topicId, current);
  }
  return Array.from(grouped, ([topic, score]) => ({ topic: topic.replaceAll("-", " "), score: Math.round((score.correct / score.total) * 100) }));
}

function isCorrect(question: AssessmentQuestion, selected: string[]) {
  const expected = question.options.filter((option) => option.isCorrect).map((option) => option.id).sort();
  return selected.slice().sort().join("|") === expected.join("|");
}

function GapList({ title, description, gaps }: { title: string; description: string; gaps: ApiKnowledgeGap[] }) {
  return <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-yellow-100 text-neutral-800"><Target className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">{title}</h2><p className="type-body-small mt-1 text-text-secondary">{description}</p></div></div><ol className="mt-6 grid gap-4">{gaps.map((gap, index) => <li key={gap.topic} className="flex gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-800 text-xs font-semibold text-white">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{gap.topic}</h3><Badge variant="warning">{gap.score}%</Badge><Badge variant="error">{formatEnum(gap.severity)}</Badge></div><p className="type-body-small mt-1.5 text-text-secondary">{gap.gap_score} points below the {gap.target_score}% target.</p></div></li>)}{gaps.length === 0 && <li className="type-body-small text-text-secondary">No topic is below the current target. Your path will focus on concise reinforcement.</li>}</ol></Card>;
}

function PrerequisiteState({ courseId, courseTitle, title, description, href, action }: { courseId: string; courseTitle: string; title: string; description: string; href: string; action: string }) {
  return <ContentContainer className="max-w-4xl"><PageHeader eyebrow={courseTitle} title={title} description={description || "Complete the required learner step before continuing."} /><Card className="mt-7 p-6 sm:p-8"><ButtonLink href={`/learner/courses/${courseId}/${href}`}>{action}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}

function LoadingState({ label }: { label: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />{label}</div></ContentContainer>;
}

function GeneratingState() {
  return <ContentContainer className="max-w-4xl"><div className="py-8 sm:py-14"><Badge variant="info"><Sparkles className="size-3.5" aria-hidden="true" />Personalizing</Badge><h1 className="type-h1 mt-5">Building your learning path</h1><p className="type-body-large mt-3 max-w-2xl text-text-secondary">SkillSync is creating a path from your backend learner profile and latest pre-assessment.</p><Card className="mt-8 flex items-center gap-3 p-5 sm:p-7"><Spinner />Generating personalized recommendations…</Card></div></ContentContainer>;
}

function ErrorState({ courseId, error }: { courseId: string; error: string }) {
  return <ContentContainer className="max-w-4xl"><Card className="mt-8 p-6 sm:p-8"><TriangleAlert className="size-7 text-status-error" aria-hidden="true" /><h1 className="type-h1 mt-4">We couldn’t build your learning path</h1><p className="type-body-large mt-3 text-text-secondary">{error}</p><ButtonLink href={`/learner/courses/${courseId}/skill-gap`} className="mt-6">Back to skill snapshot</ButtonLink></Card></ContentContainer>;
}

function ReviewStat({ label, value, attention = false }: { label: string; value: number; attention?: boolean }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className={cn("mt-1 text-2xl font-semibold", attention && value > 0 ? "text-status-warning" : "text-text-primary")}>{value}</dd></div>;
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Target }) {
  return <Card className="p-4 sm:p-5"><Icon className="size-5 text-blue-800" aria-hidden="true" /><p className="type-caption mt-4 text-text-tertiary">{label}</p><p className="mt-1 font-semibold">{value}</p></Card>;
}

function formatEnum(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
