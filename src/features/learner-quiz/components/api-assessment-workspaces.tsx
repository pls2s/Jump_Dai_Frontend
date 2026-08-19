"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, ListChecks, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, Field, FieldError, FieldLabel, Input, LoadingState, Textarea } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { enrollInApiCourse, getApiLearnerCoursePath, type ApiLearnerCoursePath } from "@/features/learning-experience/api/learner-course-api";
import { evaluatePracticalDraft, practicalDraftErrors } from "@/features/practical-assessment/lib/practical-evaluator";
import type { PracticalDraft } from "@/features/learner-journey/types";
import {
  getApiMyAssessmentAttempts,
  listApiCourseAssessments,
  submitApiAssessment,
  type ApiAssessmentAttempt,
  type ApiCourseAssessment,
} from "../api/assessment-api";

interface AssessmentContext {
  path: ApiLearnerCoursePath;
  assessments: ApiCourseAssessment[];
}

const emptyPracticalDraft: PracticalDraft = {
  objective: "",
  targetAudience: "",
  channelSelection: "",
  coreMessage: "",
  measurementMetrics: "",
};

const practicalFields: Array<{ key: keyof PracticalDraft; label: string; prompt: string; placeholder: string }> = [
  { key: "objective", label: "Campaign objective", prompt: "What should the campaign achieve?", placeholder: "Generate qualified consultation bookings during a six-week campaign." },
  { key: "targetAudience", label: "Target audience", prompt: "Who is the campaign for and what do they need?", placeholder: "Small-business owners who need a practical campaign planning process." },
  { key: "channelSelection", label: "Channel selection", prompt: "Which channels will you use, and why?", placeholder: "Use search for active demand and educational social content for consideration." },
  { key: "coreMessage", label: "Core message", prompt: "What is the main message learners should communicate?", placeholder: "Turn your next campaign into a clear plan you can measure and improve." },
  { key: "measurementMetrics", label: "Measurement metrics", prompt: "How will you know whether the campaign worked?", placeholder: "Track conversion rate, cost per booking, and landing-page completion." },
];

function apiCourseId(courseId: string) {
  return /^\d+$/.test(courseId) && Number(courseId) > 0 ? Number(courseId) : null;
}

function accessToken() {
  const session = getAuthSession();
  return session?.mode === "api" ? session.accessToken : null;
}

function latestAttempt(attempts: ApiAssessmentAttempt[]) {
  return attempts.at(-1) ?? null;
}

async function loadAssessmentContext(courseId: number, token: string): Promise<AssessmentContext> {
  await enrollInApiCourse(courseId, token);
  const [path, assessments] = await Promise.all([
    getApiLearnerCoursePath(courseId, token),
    listApiCourseAssessments(courseId, token),
  ]);
  return { path, assessments };
}

export function ApiPostAssessmentWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const backendCourseId = apiCourseId(courseId);
  const [context, setContext] = useState<AssessmentContext | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ApiAssessmentAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = accessToken();
    if (!token) return router.replace("/sign-in");
    if (!backendCourseId) {
      setError("The backend assessment flow needs a numeric backend course ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const next = await loadAssessmentContext(backendCourseId, token);
      setContext(next);
      const assessment = next.assessments.find((item) => item.assessment_type === "POST_ASSESSMENT");
      setScores(Object.fromEntries((assessment?.topics ?? []).map((topic) => [topic, 0])));
    } catch (requestError) {
      setContext(null);
      setError(requestError instanceof Error ? requestError.message : "The post-assessment couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [backendCourseId, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const assessment = context?.assessments.find((item) => item.assessment_type === "POST_ASSESSMENT");
  const invalidScore = assessment?.topics.some((topic) => !Number.isFinite(scores[topic]) || scores[topic] < 0 || scores[topic] > 100) ?? false;

  async function submit() {
    const token = accessToken();
    if (!token) return router.replace("/sign-in");
    if (!assessment || invalidScore) return;
    setSubmitting(true);
    try {
      const response = await submitApiAssessment(assessment.id, {
        topicScores: assessment.topics.map((topic) => ({ topic, score: scores[topic] })),
      }, token);
      setResult(response.result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The post-assessment wasn’t submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState title="Loading post-assessment" description="Enrolling in the published course and reading its assessment definition…" />;
  if (error && !context) return <ErrorState title="Post-assessment unavailable" description={error} onRetry={() => void load()} icon={<ListChecks className="size-6" aria-hidden="true" />} />;
  if (!context || !assessment) return <EmptyState title="Post-assessment not available" description="A Creator must generate a POST_ASSESSMENT definition for this published course first." icon={<ListChecks className="size-6" aria-hidden="true" />} />;
  if (context.path.completed_lesson_count < context.path.total_lesson_count) return <LearningNotComplete path={context.path} courseId={courseId} />;
  if (result) return <AttemptResult attempt={result} courseId={courseId} title={context.path.course_title} practicalHref={`/learner/courses/${courseId}/practical-assessment`} />;

  return <ContentContainer className="max-w-4xl"><PageHeader eyebrow={context.path.course_title || courseTitle} title={assessment.title} description="Submit one score for every backend topic. The current API provides topics and score storage, not a server-delivered question bank." breadcrumb={[{ label: "Learner home", href: "/learner" }, { label: "Post-assessment" }]} /><Card className="mt-7 border-blue-200 bg-blue-50 p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><p className="type-body-small text-blue-950">This mock API records the scores you enter for each course topic and returns competency feedback. It does not currently grade question answers on the server.</p></div></Card><Card className="mt-6 p-5 sm:p-7"><div className="flex flex-wrap gap-2"><Badge variant="info">{assessment.topics.length} topics</Badge><Badge variant="neutral">Pass at {assessment.passing_score}%</Badge></div><div className="mt-6 grid gap-5">{assessment.topics.map((topic) => <Field key={topic}><FieldLabel htmlFor={`post-score-${topic}`}>{topic}</FieldLabel><Input id={`post-score-${topic}`} type="number" min="0" max="100" step="1" value={scores[topic] ?? 0} onChange={(event) => setScores((current) => ({ ...current, [topic]: Number(event.target.value) }))} /><p className="type-caption mt-1.5 text-text-secondary">Enter a score from 0 to 100 for this backend topic.</p></Field>)}</div>{error && <FieldError className="mt-5">{error}</FieldError>}<Button className="mt-7" onClick={() => void submit()} disabled={invalidScore} isLoading={submitting} loadingLabel="Submitting assessment…">Submit post-assessment<ClipboardCheck className="size-4" aria-hidden="true" /></Button></Card></ContentContainer>;
}

export function ApiPracticalAssessmentWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const backendCourseId = apiCourseId(courseId);
  const [context, setContext] = useState<AssessmentContext | null>(null);
  const [postAttempt, setPostAttempt] = useState<ApiAssessmentAttempt | null>(null);
  const [draft, setDraft] = useState<PracticalDraft>(emptyPracticalDraft);
  const [draftErrors, setDraftErrors] = useState<Partial<Record<keyof PracticalDraft, string>>>({});
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [result, setResult] = useState<ApiAssessmentAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = accessToken();
    if (!token) return router.replace("/sign-in");
    if (!backendCourseId) {
      setError("The backend practical flow needs a numeric backend course ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const next = await loadAssessmentContext(backendCourseId, token);
      const post = next.assessments.find((item) => item.assessment_type === "POST_ASSESSMENT");
      const attempts = post ? await getApiMyAssessmentAttempts(post.id, token) : [];
      setContext(next);
      setPostAttempt(latestAttempt(attempts));
    } catch (requestError) {
      setContext(null);
      setError(requestError instanceof Error ? requestError.message : "The practical assessment couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [backendCourseId, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const assessment = context?.assessments.find((item) => item.assessment_type === "PRACTICAL");
  const evidenceText = practicalFields.map((field) => `${field.label}: ${draft[field.key].trim()}`).join("\n\n");

  async function submit() {
    const fieldErrors = practicalDraftErrors(draft);
    setDraftErrors(fieldErrors);
    if (Object.keys(fieldErrors).length || !assessment) return;
    const token = accessToken();
    if (!token) return router.replace("/sign-in");
    setSubmitting(true);
    setError("");
    try {
      const localRubric = evaluatePracticalDraft({ id: "api-practical-preview", status: "evaluating", draft });
      const score = localRubric.totalScore ?? 0;
      const response = await submitApiAssessment(assessment.id, {
        topicScores: assessment.topics.map((topic) => ({ topic, score })),
        evidenceUrl,
        evidenceText,
      }, token);
      setResult(response.result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The practical assessment wasn’t submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState title="Loading practical assessment" description="Reading your course assessment and saved post-assessment result…" />;
  if (error && !context) return <ErrorState title="Practical assessment unavailable" description={error} onRetry={() => void load()} icon={<FileCheck2 className="size-6" aria-hidden="true" />} />;
  if (!context || !assessment) return <EmptyState title="Practical assessment not available" description="A Creator must generate a PRACTICAL assessment definition for this published course first." icon={<FileCheck2 className="size-6" aria-hidden="true" />} />;
  if (!postAttempt?.passed) return <PostAssessmentRequired courseId={courseId} />;
  if (result) return <AttemptResult attempt={result} courseId={courseId} title={context.path.course_title || courseTitle} resultHref={`/learner/courses/${courseId}/result`} />;

  return <ContentContainer className="max-w-6xl"><PageHeader eyebrow={context.path.course_title || courseTitle} title={assessment.title} description="Submit your applied work as evidence after passing the backend post-assessment." breadcrumb={[{ label: "Learner home", href: "/learner" }, { label: "Practical assessment" }]} /><Card className="mt-7 border-yellow-200 bg-yellow-50 p-5"><p className="type-body-small text-neutral-800">The existing frontend rubric calculates one prototype score from this plan and sends it for every backend topic with your evidence text. The backend persists the submission and feedback, but it does not yet perform server-side AI or SME grading.</p></Card><div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"><form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); void submit(); }} noValidate>{practicalFields.map((field) => <Card key={field.key} className="p-5 sm:p-6"><Field><FieldLabel htmlFor={`api-practical-${field.key}`}>{field.label}</FieldLabel><p className="type-caption mt-1 text-text-secondary">{field.prompt}</p><Textarea id={`api-practical-${field.key}`} value={draft[field.key]} onChange={(event) => { setDraft((current) => ({ ...current, [field.key]: event.target.value })); setDraftErrors((current) => ({ ...current, [field.key]: undefined })); }} placeholder={field.placeholder} rows={4} maxLength={600} validation={draftErrors[field.key] ? "error" : "default"} />{draftErrors[field.key] && <FieldError className="mt-2">{draftErrors[field.key]}</FieldError>}</Field></Card>)}<Card className="p-5 sm:p-6"><Field><FieldLabel htmlFor="api-practical-evidence-url">Evidence URL (optional)</FieldLabel><Input id="api-practical-evidence-url" type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} placeholder="https://example.com/your-campaign-plan" /><p className="type-caption mt-1.5 text-text-secondary">The completed plan is always stored as evidence text; add a URL when you have one.</p></Field>{error && <FieldError className="mt-4">{error}</FieldError>}<Button type="submit" className="mt-6" isLoading={submitting} loadingLabel="Submitting practical work…">Submit practical assessment<ClipboardCheck className="size-4" aria-hidden="true" /></Button></Card></form><aside className="h-fit lg:sticky lg:top-24"><Card className="p-5"><h2 className="font-semibold">Backend topics</h2><p className="type-caption mt-1 text-text-secondary">One calculated prototype score is stored for each topic.</p><div className="mt-4 grid gap-2">{assessment.topics.map((topic) => <Badge key={topic} variant="neutral">{topic}</Badge>)}</div><div className="mt-6 border-t border-border-default pt-4"><p className="type-caption text-text-tertiary">Passing score</p><p className="mt-1 text-xl font-semibold">{assessment.passing_score}%</p></div></Card></aside></div></ContentContainer>;
}

export function ApiSkillResultWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const backendCourseId = apiCourseId(courseId);
  const [context, setContext] = useState<AssessmentContext | null>(null);
  const [attempts, setAttempts] = useState<Record<number, ApiAssessmentAttempt[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const token = accessToken();
    if (!token) return router.replace("/sign-in");
    if (!backendCourseId) {
      setError("The backend result flow needs a numeric backend course ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const next = await loadAssessmentContext(backendCourseId, token);
      const finalAssessments = next.assessments.filter((item) => item.assessment_type === "POST_ASSESSMENT" || item.assessment_type === "PRACTICAL");
      const responses = await Promise.all(finalAssessments.map(async (assessment) => [assessment.id, await getApiMyAssessmentAttempts(assessment.id, token)] as const));
      setContext(next);
      setAttempts(Object.fromEntries(responses));
    } catch (requestError) {
      setContext(null);
      setError(requestError instanceof Error ? requestError.message : "Your assessment results couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [backendCourseId, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (loading) return <LoadingState title="Loading assessment results" description="Reading your saved post-assessment and practical submissions…" />;
  if (error && !context) return <ErrorState title="Assessment results unavailable" description={error} onRetry={() => void load()} icon={<CheckCircle2 className="size-6" aria-hidden="true" />} />;
  if (!context) return null;
  const finalAssessments = context.assessments.filter((item) => item.assessment_type === "POST_ASSESSMENT" || item.assessment_type === "PRACTICAL");
  const finalAttempts = finalAssessments.map((assessment) => ({ assessment, attempt: latestAttempt(attempts[assessment.id] ?? []) }));
  const completedCount = finalAttempts.filter((item) => item.attempt?.passed).length;

  return <ContentContainer className="max-w-6xl"><PageHeader eyebrow={context.path.course_title || courseTitle} title="Assessment results" description="Latest submission results returned by the backend for this course." breadcrumb={[{ label: "Learner home", href: "/learner" }, { label: "Results" }]} actions={<Badge variant={completedCount === 2 ? "success" : "warning"}>{completedCount} of 2 final assessments passed</Badge>} /><Card className="mt-7 border-yellow-200 bg-yellow-50 p-5"><p className="type-body-small text-neutral-800">The backend currently has no course-level Skill Result, before/after comparison, credential, or learner portfolio-issuance endpoint. This page shows the exact latest saved attempts instead of inventing a final verified result.</p></Card><div className="mt-7 grid gap-5">{finalAttempts.map(({ assessment, attempt }) => attempt ? <ApiAttemptCard key={assessment.id} assessment={assessment} attempt={attempt} /> : <Card key={assessment.id} className="p-5 sm:p-6"><h2 className="type-title-large">{assessment.title}</h2><p className="type-body-small mt-2 text-text-secondary">No submission is saved yet.</p><ButtonLink href={assessment.assessment_type === "POST_ASSESSMENT" ? `/learner/courses/${courseId}/post-assessment` : `/learner/courses/${courseId}/practical-assessment`} className="mt-5">Open assessment<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>)}</div><div className="mt-7"><ButtonLink href={`/learner/courses/${courseId}/skill-evidence`} variant="secondary">View Skill Portfolio API<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div></ContentContainer>;
}

export function ApiAssessmentUnavailable({ courseId }: { courseId: string }) {
  return <ContentContainer className="max-w-4xl"><EmptyState title="This quiz has no matching API contract" description="The backend provides course-level QUIZ definitions but does not provide a lesson-quiz endpoint. Post-assessment and practical assessment are available for numeric backend course IDs." action={{ href: `/learner/courses/${courseId}/post-assessment`, label: "Open post-assessment" }} icon={<ListChecks className="size-6" aria-hidden="true" />} /></ContentContainer>;
}

function LearningNotComplete({ path, courseId }: { path: ApiLearnerCoursePath; courseId: string }) {
  return <ContentContainer className="max-w-4xl"><PageHeader eyebrow={path.course_title} title="Complete API learning first" description="The post-assessment stays locked until all backend lessons are completed." /><Card className="mt-7 p-6"><p className="text-3xl font-semibold">{path.completed_lesson_count} / {path.total_lesson_count}</p><p className="type-body-small mt-2 text-text-secondary">Function 12’s lesson interface is intentionally not connected yet. Complete the listed API lessons through Swagger, then refresh this existing assessment route.</p><ButtonLink href={`/learner/courses/${courseId}/result`} variant="secondary" className="mt-6">View saved assessment results</ButtonLink></Card></ContentContainer>;
}

function PostAssessmentRequired({ courseId }: { courseId: string }) {
  return <ContentContainer className="max-w-4xl"><PageHeader eyebrow="Practical assessment" title="Pass the backend post-assessment first" description="Your most recent saved post-assessment must meet its passing score before practical work can be submitted here." /><ButtonLink href={`/learner/courses/${courseId}/post-assessment`} className="mt-7">Open post-assessment<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></ContentContainer>;
}

function AttemptResult({ attempt, courseId, title, practicalHref, resultHref }: { attempt: ApiAssessmentAttempt; courseId: string; title: string; practicalHref?: string; resultHref?: string }) {
  return <ContentContainer className="max-w-5xl"><PageHeader eyebrow={title} title={attempt.passed ? "Assessment submitted" : "More practice recommended"} description={attempt.feedback} actions={<Badge variant={attempt.passed ? "success" : "warning"}>{attempt.passed ? "Passed" : "Needs more practice"}</Badge>} /><div className="mt-7 grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]"><Card className="flex flex-col items-center justify-center p-6 text-center"><p className="type-caption text-text-tertiary">Backend score</p><p className="mt-2 text-5xl font-semibold">{attempt.score}%</p><p className="type-body-small mt-3 text-text-secondary">Passing score: {attempt.passing_score}%</p></Card><Card className="p-5 sm:p-6"><h2 className="type-title-large">Topic scores</h2><div className="mt-5 grid gap-3">{attempt.topic_scores.map((item) => <div key={item.topic} className="flex items-center justify-between gap-4"><span className="text-sm">{item.topic}</span><strong>{item.score}%</strong></div>)}</div></Card></div><div className="mt-6 grid gap-5 md:grid-cols-2"><AttemptList title="Strengths" items={attempt.strengths} empty="No topic reached the backend strength threshold yet." /><AttemptList title="Improvement topics" items={attempt.improvements} empty="No improvement topic was returned." /></div><div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row"><ButtonLink href="/learner" variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to learner home</ButtonLink>{attempt.passed && practicalHref ? <ButtonLink href={practicalHref}>Continue to practical assessment<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink> : attempt.passed && resultHref ? <ButtonLink href={resultHref}>View assessment results<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink> : <ButtonLink href={`/learner/courses/${courseId}/result`}>View saved results<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>}</div></ContentContainer>;
}

function ApiAttemptCard({ assessment, attempt }: { assessment: ApiCourseAssessment; attempt: ApiAssessmentAttempt }) {
  return <Card className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="type-caption text-text-tertiary">{assessment.assessment_type === "POST_ASSESSMENT" ? "Post-assessment" : "Practical assessment"}</p><h2 className="type-title-large mt-1">{assessment.title}</h2></div><Badge variant={attempt.passed ? "success" : "warning"}>{attempt.passed ? "Passed" : "Needs more practice"}</Badge></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Metric label="Score" value={`${attempt.score}%`} /><Metric label="Target" value={`${attempt.passing_score}%`} /><Metric label="Submitted" value={new Date(attempt.submitted_at).toLocaleDateString()} /></div><p className="type-body-small mt-5 text-text-secondary">{attempt.feedback}</p>{attempt.review_reason && <p className="type-body-small mt-3 rounded-md bg-blue-50 p-3 text-blue-950">Creator review: {attempt.review_reason}</p>}</Card>;
}

function AttemptList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <Card className="p-5 sm:p-6"><h2 className="font-semibold">{title}</h2>{items.length ? <ul className="mt-3 grid gap-2">{items.map((item) => <li key={item} className="type-body-small flex gap-2 text-text-secondary"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-success" aria-hidden="true" />{item}</li>)}</ul> : <p className="type-body-small mt-3 text-text-secondary">{empty}</p>}</Card>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}
