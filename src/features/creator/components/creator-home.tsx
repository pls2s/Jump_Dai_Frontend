import { ArrowRight, BookOpen, CheckCircle2, CirclePlus, Clock3, FileText } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, ButtonLink, Card, Progress } from "@/components/ui";
import { mockCourses } from "@/data/mock/product";

export function CreatorHome({ courseSaved = false }: { courseSaved?: boolean }) {
  const [currentCourse, ...otherCourses] = mockCourses;

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
          <span className="type-caption text-text-tertiary">1 active draft</span>
        </div>
        <Card className="overflow-hidden border-blue-200 shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2"><Badge variant="accent" dot>{currentCourse.status}</Badge><span className="type-caption flex items-center gap-1.5 text-text-tertiary"><Clock3 className="size-3.5" aria-hidden="true" />{currentCourse.updatedAt}</span></div>
              <h3 className="type-h3 mt-4">{currentCourse.name}</h3>
              <p className="mt-2 text-text-secondary">You’re adding trusted material before SkillSync structures the course.</p>
              <div className="mt-6 max-w-xl"><Progress value={currentCourse.progress} label={`Current step: ${currentCourse.currentStep}`} showValue /></div>
              <ButtonLink href={`/creator/courses/${currentCourse.id}/sources`} className="mt-6">Continue setup<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
            </div>
            <div className="relative hidden min-h-64 overflow-hidden bg-blue-800 p-7 text-white lg:flex lg:flex-col lg:justify-between">
              <div className="absolute -right-12 -bottom-12 size-40 rounded-full border border-white/15" />
              <div className="absolute top-8 right-8 size-24 rounded-full bg-yellow-300/15 blur-2xl" />
              <FileText className="relative size-8 text-yellow-300" aria-hidden="true" />
              <div className="relative"><p className="text-sm text-blue-100">Next milestone</p><p className="mt-1 text-xl font-semibold">Analyze your knowledge</p></div>
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
