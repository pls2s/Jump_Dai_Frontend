"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleX, ListChecks } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Spinner } from "@/components/ui";
import { digitalMarketingPreAssessment } from "@/data/mock";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { loadLearnerJourney } from "@/features/learner-journey/services/learner-journey-service";
import type { LearnerJourneyState } from "@/features/learner-journey/types";

export function AssessmentReview({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [journey, setJourney] = useState<LearnerJourneyState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      setJourney(loadLearnerJourney(session.user.id, courseId, "completed"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, router]);

  if (!journey) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading assessment review…</div></ContentContainer>;
  if (!journey.result || !journey.assessment) return <ContentContainer className="max-w-4xl"><PageHeader title="Assessment result needed" description="Complete your pre-assessment before reviewing answers." /><ButtonLink className="mt-6" href={`/learner/courses/${courseId}/pre-assessment`}>Go to pre-assessment</ButtonLink></ContentContainer>;

  return (
    <ContentContainer className="max-w-5xl">
      <PageHeader eyebrow={courseTitle} title="Review your pre-assessment" description="See your answer, the expected answer, and a short explanation for each question." />
      <div className="mt-7 grid gap-4">
        {digitalMarketingPreAssessment.questions.map((question, index) => {
          const response = journey.assessment?.responses.find((item) => item.questionId === question.id);
          const questionScore = journey.result?.questionScores.find((item) => item.questionId === question.id);
          const selected = question.options.filter((option) => response?.selectedOptionIds.includes(option.id));
          const correct = question.options.filter((option) => option.isCorrect);
          return (
            <Card key={question.id} className="overflow-hidden">
              <div className="flex items-start gap-3 border-b border-border-default p-5 sm:px-6">
                {questionScore?.isCorrect ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-success" aria-hidden="true" /> : <CircleX className="mt-0.5 size-5 shrink-0 text-status-error" aria-hidden="true" />}
                <div className="min-w-0 flex-1"><p className="type-caption text-text-tertiary">Question {index + 1}</p><h2 className="mt-1 font-semibold leading-6">{question.prompt}</h2></div>
                <Badge variant={questionScore?.isCorrect ? "success" : "error"}>{questionScore?.isCorrect ? "Correct" : "Incorrect"}</Badge>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:px-6">
                <div><p className="type-label text-text-tertiary">Your answer</p><p className="type-body-small mt-2 text-text-primary">{selected.length ? selected.map((option) => option.text).join("; ") : "No answer"}</p></div>
                <div><p className="type-label text-text-tertiary">Correct answer</p><p className="type-body-small mt-2 text-text-primary">{correct.map((option) => option.text).join("; ")}</p></div>
              </div>
              <div className="border-t border-border-default bg-neutral-25 p-5 sm:px-6"><p className="type-label text-text-tertiary">Why</p><p className="type-body-small mt-2 text-text-secondary">{question.explanation}</p></div>
            </Card>
          );
        })}
      </div>
      <div className="mt-7 flex flex-wrap justify-between gap-3"><ButtonLink href={`/learner/courses/${courseId}/skill-gap`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to skill snapshot</ButtonLink><Badge variant="neutral"><ListChecks className="size-3.5" aria-hidden="true" />Read-only review</Badge></div>
    </ContentContainer>
  );
}
