"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, CirclePlus, Clock3, FileText } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Progress } from "@/components/ui";
import { mockCourses } from "@/data/mock/product";
import { getReviewProgress, readGeneratedCourseState } from "@/features/course-generation/lib/generated-course-store";
import type { GeneratedCourseState } from "@/types/product";

export function CreatorHome({ courseSaved = false }: { courseSaved?: boolean }) {
  const [currentCourse, ...otherCourses] = mockCourses;
  const [generatedState, setGeneratedState] = useState<GeneratedCourseState | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setGeneratedState(readGeneratedCourseState(currentCourse.id)), 0);
    return () => window.clearTimeout(timer);
  }, [currentCourse.id]);

  const reviewProgress = generatedState ? getReviewProgress(generatedState) : null;
  const lifecycle = generatedState?.lifecycle ?? "draft";
  const lifecycleLabel = lifecycle === "draft" ? "Draft" : lifecycle === "review" ? "Review" : lifecycle === "published" ? "Published" : "Unpublished";
  const currentStep = lifecycle === "draft" ? currentCourse.currentStep : lifecycle === "review" ? "Human Verification" : lifecycle === "published" ? "Published course" : "Ready to republish";
  const progress = lifecycle === "draft" ? currentCourse.progress : lifecycle === "review" ? Math.max(70, reviewProgress?.percentage ?? 0) : 100;
  const destination = lifecycle === "draft" ? `/creator/courses/${currentCourse.id}/sources` : lifecycle === "review" ? `/creator/courses/${currentCourse.id}/review` : lifecycle === "published" ? `/creator/courses/${currentCourse.id}/published` : `/creator/courses/${currentCourse.id}/preview`;
  const actionLabel = lifecycle === "draft" ? "Continue setup" : lifecycle === "review" ? "Continue review" : lifecycle === "published" ? "View / Manage" : "Preview and publish again";

  return (
    <ContentContainer>
      <PageHeader
        eyebrow="Creator workspace"
        title="Welcome back"
        description="Pick up where you left off or start shaping a new learning experience."
        actions={<ButtonLink href="/creator/courses/new/basics" size="lg"><CirclePlus className="size-5" aria-hidden="true" />Create a new course</ButtonLink>}
      />
      {courseSaved && <p role="status" className="type-body-small mt-6 flex items-center gap-2 rounded-md bg-status-success-subtle p-3 text-status-success"><CheckCircle2 className="size-4" aria-hidden="true" />Your course setup was saved on this device.</p>}

      <section className="mt-10" aria-labelledby="continue-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="continue-heading" className="type-title-large">Continue working</h2>
          <span className="type-caption text-text-tertiary">{lifecycle === "draft" ? "1 active draft" : `Course status: ${lifecycleLabel}`}</span>
        </div>
        <Card className="overflow-hidden border-blue-200 shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2"><Badge variant={lifecycle === "published" ? "success" : lifecycle === "review" ? "warning" : lifecycle === "unpublished" ? "info" : "accent"} dot>{lifecycleLabel}</Badge><span className="type-caption flex items-center gap-1.5 text-text-tertiary"><Clock3 className="size-3.5" aria-hidden="true" />{generatedState ? "Saved on this device" : currentCourse.updatedAt}</span></div>
              <h3 className="type-h3 mt-4">{generatedState?.course.title ?? currentCourse.name}</h3>
              <p className="mt-2 text-text-secondary">{lifecycle === "draft" ? "You’re adding trusted material before SkillSync structures the course." : lifecycle === "review" ? "AI-generated content is waiting for your review and verification." : lifecycle === "published" ? "Your verified course is available in the frontend publishing prototype." : "The course is preserved and ready for another preview and publish."}</p>
              <div className="mt-6 max-w-xl"><Progress value={progress} label={`Current step: ${currentStep}`} showValue /></div>
              <ButtonLink href={destination} className="mt-6">{actionLabel}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
            </div>
            <div className="relative hidden min-h-64 overflow-hidden bg-blue-800 p-7 text-white lg:flex lg:flex-col lg:justify-between">
              <div className="absolute -right-12 -bottom-12 size-40 rounded-full border border-white/15" />
              <div className="absolute top-8 right-8 size-24 rounded-full bg-yellow-300/15 blur-2xl" />
              <FileText className="relative size-8 text-yellow-300" aria-hidden="true" />
              <div className="relative"><p className="text-sm text-blue-100">{lifecycle === "published" ? "Course status" : "Next milestone"}</p><p className="mt-1 text-xl font-semibold">{lifecycle === "draft" ? "Analyze your knowledge" : lifecycle === "review" ? "Complete Human Verification" : lifecycle === "published" ? "Published" : "Publish again"}</p></div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10" aria-labelledby="courses-heading">
        <div className="mb-4 flex items-center justify-between gap-4"><h2 id="courses-heading" className="type-title-large">Your courses</h2><ButtonLink href="/creator/courses" variant="ghost" size="sm">View all<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {otherCourses.map((course) => (
            <Card key={course.id} className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex size-10 items-center justify-center rounded-md bg-blue-50 text-blue-700"><BookOpen className="size-5" aria-hidden="true" /></span>
              <div className="mt-5 flex items-start justify-between gap-3"><h3 className="font-semibold text-text-primary">{course.name}</h3><Badge variant="neutral">{course.status}</Badge></div>
              <p className="type-body-small mt-2 text-text-secondary">Current step: {course.currentStep}</p>
              <Progress value={course.progress} size="sm" className="mt-5" />
              <ButtonLink href="/creator/courses/new/basics" variant="secondary" size="sm" className="mt-5">Continue setup</ButtonLink>
            </Card>
          ))}
          <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-neutral-25 p-6 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-yellow-100 text-neutral-800"><CirclePlus className="size-5" aria-hidden="true" /></span>
            <p className="mt-4 font-semibold">Create another course</p>
            <p className="type-body-small mt-1 max-w-xs text-text-secondary">Start with a focused idea. You can refine it as you go.</p>
            <ButtonLink href="/creator/courses/new/basics" variant="secondary" size="sm" className="mt-5">Create course</ButtonLink>
          </div>
        </div>
      </section>
    </ContentContainer>
  );
}
