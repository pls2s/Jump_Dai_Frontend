"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, ClipboardCheck, FileCheck2, Lightbulb, TrendingUp } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Progress, Spinner } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { loadLearningExperience, saveSkillResult } from "@/features/learner-journey/services/learning-experience-service";
import type { LearnerJourneyState, LearnerSkillResult } from "@/features/learner-journey/types";
import { courseCompletionChecks, createLearnerSkillResult } from "@/features/skill-result/lib/skill-result-engine";

export function SkillResultWorkspace({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);
  const [result, setResult] = useState<LearnerSkillResult | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      const loaded = loadLearningExperience(session.user.id, courseId, "result-ready");
      const calculated = loaded.journey.skillResult ?? createLearnerSkillResult(loaded.journey);
      const nextJourney = calculated && !loaded.journey.skillResult ? saveSkillResult(session.user.id, courseId, calculated) : loaded.journey;
      setJourney(nextJourney);
      setResult(calculated);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, router]);

  if (!journey) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Preparing your skill result…</div></ContentContainer>;

  if (!result) {
    const checks = courseCompletionChecks(journey);
    return <ContentContainer className="max-w-4xl"><PageHeader eyebrow={courseTitle} title="Your skill result isn’t ready yet" description="Required learning, the final knowledge check, and practical evidence must be complete before SkillSync can summarize the outcome." /><Card className="mt-7 p-5 sm:p-6"><div className="grid gap-3">{Object.entries(checks).map(([key, passed]) => <div key={key} className="flex items-center gap-2 text-sm">{passed ? <CheckCircle2 className="size-5 text-status-success" aria-hidden="true" /> : <span className="size-5 rounded-full border border-border-strong" aria-hidden="true" />}<span>{key.replaceAll(/([A-Z])/g, " $1").toLowerCase()}</span></div>)}</div><ButtonLink href={`/learner/courses/${courseId}/learn`} className="mt-6">Continue learning<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
  }

  const verified = result.verificationStatus === "verified";
  return (
    <ContentContainer className="max-w-6xl">
      <PageHeader eyebrow={courseTitle} title="Your skill result" description={verified ? "You completed the required learning and demonstrated both knowledge and applied evidence." : "You completed the result flow, with focused practice recommended before verification."} actions={<Badge variant={verified ? "success" : "warning"}>{verified ? "Verified" : "More practice recommended"}</Badge>} />

      <div className="mt-8 grid gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="flex flex-col items-center justify-center p-6 text-center sm:p-8"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-800"><Award className="size-6" aria-hidden="true" /></span><p className="type-caption mt-5 text-text-tertiary">Overall competency score</p><p className="mt-1 text-5xl font-semibold">{result.overallCompetencyScore}%</p><Badge variant={verified ? "success" : "warning"} className="mt-4">{result.courseStatus === "completed" ? "Course completed" : "More practice recommended"}</Badge></Card>
        <Card className="p-5 sm:p-7"><div className="flex items-center gap-2"><TrendingUp className="size-5 text-blue-800" aria-hidden="true" /><h2 className="type-title-large">Before and after learning</h2></div><div className="mt-6 grid grid-cols-3 gap-3 text-center"><Stat label="Before" value={`${result.preAssessmentScore}%`} /><Stat label="After" value={`${result.postAssessmentScore}%`} /><Stat label="Improvement" value={`${result.improvement >= 0 ? "+" : ""}${result.improvement}`} /></div><p className="type-body-small mt-5 text-text-secondary">Knowledge contributes 60% and applied practical evidence contributes 40% to the overall competency score.</p></Card>
      </div>

      <Card className="mt-6 overflow-hidden"><div className="border-b border-border-default p-5 sm:px-6"><h2 className="type-title-large">Skill breakdown</h2><p className="type-body-small mt-1 text-text-secondary">Pre-assessment compared with the final knowledge check.</p></div><div className="divide-y divide-border-default">{result.skillComparisons.map((skill) => <div key={skill.skillId} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center sm:px-6"><div><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{skill.name}</h3><span className="text-sm font-semibold sm:hidden">{skill.before}% → {skill.after}%</span></div><Progress className="mt-2" value={skill.after} label={`${skill.name} after-learning score`} size="sm" /></div><div className="hidden text-right sm:block"><p className="font-semibold">{skill.before}% → {skill.after}%</p><p className="type-caption mt-1 text-status-success">{skill.improvement >= 0 ? `+${skill.improvement}` : skill.improvement} points</p></div></div>)}</div></Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6"><div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><div className="flex-1"><h2 className="type-title-large">Practical assessment</h2><div className="mt-3 flex flex-wrap gap-2"><Badge variant={result.practicalScore >= 70 ? "success" : "warning"}>{result.practicalScore}%</Badge><Badge variant={result.practicalScore >= 70 ? "success" : "warning"}>{result.practicalScore >= 70 ? "Passed" : "Needs more practice"}</Badge></div><p className="type-body-small mt-4 text-text-secondary"><strong className="text-text-primary">Key evidence:</strong> {result.evidenceSummary}</p></div></div></Card>
        <Card className="p-5 sm:p-6"><div className="flex items-center gap-2"><Lightbulb className="size-5 text-blue-800" aria-hidden="true" /><h2 className="type-title-large">Feedback</h2></div><FeedbackList title="What you do well" items={result.strengths} /><FeedbackList title="What improved" items={result.improvements} /><FeedbackList title="What to work on next" items={result.nextSteps} /></Card>
      </div>

      <Card className="mt-7 flex flex-col items-start justify-between gap-5 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:p-6"><div className="flex items-start gap-3"><ClipboardCheck className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-blue-950">Your evidence record is ready</h2>{verified && <Badge variant="success">Credential earned</Badge>}</div><p className="type-body-small mt-1 text-blue-900">Review the assessments and applied work behind each skill, then check credential eligibility.</p></div></div><ButtonLink href={`/learner/courses/${courseId}/skill-evidence`}>View skill evidence<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>
      <div className="mt-6"><ButtonLink href={`/learner/courses/${courseId}/practical-assessment`} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Practical assessment</ButtonLink></div>
    </ContentContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-md bg-neutral-50 p-3"><p className="type-caption text-text-tertiary">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function FeedbackList({ title, items }: { title: string; items: string[] }) { return <div className="mt-5"><h3 className="type-label text-text-tertiary">{title}</h3>{items.length ? <ul className="mt-2 grid gap-2">{items.map((item) => <li key={item} className="type-body-small flex gap-2 text-text-secondary"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-success" aria-hidden="true" />{item}</li>)}</ul> : <p className="type-body-small mt-2 text-text-secondary">Complete more evidence to populate this feedback.</p>}</div>; }
