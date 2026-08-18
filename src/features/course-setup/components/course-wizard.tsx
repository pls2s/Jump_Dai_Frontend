"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2 } from "lucide-react";

import { ContentContainer } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Field, FieldDescription, FieldError, FieldLabel, Input, Radio, Stepper, Textarea, Toggle } from "@/components/ui";
import { createConfiguredCourse } from "@/features/courses/services/course-service";
import { cn } from "@/lib/cn";
import type { CourseLevel } from "@/types/product";
import { useCourseSetup } from "./course-setup-provider";

export const wizardSteps = ["basics", "audience", "objectives", "certificate", "review"] as const;
export type WizardStep = (typeof wizardSteps)[number];

const stepLabels: Record<WizardStep, string> = {
  basics: "Course basics",
  audience: "Audience & level",
  objectives: "Learning objectives",
  certificate: "Certificate",
  review: "Review",
};

const stepDescriptions: Record<WizardStep, string> = {
  basics: "Give your course a clear focus.",
  audience: "Define who this course is for.",
  objectives: "Describe what learners will be able to do.",
  certificate: "Choose how completion is recognized.",
  review: "Check the setup before adding sources.",
};

export function CourseWizard({ step }: { step: WizardStep }) {
  const router = useRouter();
  const { course, updateCourse } = useCourseSetup();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const currentIndex = wizardSteps.indexOf(step);
  const nextStep = wizardSteps[currentIndex + 1];
  const previousStep = wizardSteps[currentIndex - 1];
  const steps = wizardSteps.map((item, index) => ({ label: stepLabels[item], status: index < currentIndex ? "complete" as const : index === currentIndex ? "current" as const : "upcoming" as const }));
  const validBasics = course.name.trim().length >= 3 && course.description.trim().length >= 20 && course.description.length <= 400;
  const validAudience = course.targetLearner.trim().length >= 20 && Boolean(course.level);
  const validObjectives = course.objectives.length > 0 && course.objectives.every((objective) => objective.trim().length >= 8);
  const validCertificate = !course.certificateEnabled || Boolean(course.completionCriteria);
  const allValid = validBasics && validAudience && validObjectives && validCertificate;
  const stepIsValid = step === "basics" ? validBasics : step === "audience" ? validAudience : step === "objectives" ? validObjectives : step === "certificate" ? validCertificate : allValid;
  const disabledGuidance = step === "basics"
    ? "Add a course name and a description of at least 20 characters."
    : step === "audience"
      ? "Describe the target learner in at least 20 characters."
      : step === "objectives"
        ? "Complete every objective using at least 8 characters."
        : step === "certificate"
          ? "Choose completion criteria or turn the certificate off."
          : "Complete the required information in every section before adding sources.";

  async function continueForward() {
    if (step !== "review") {
      router.push(`/creator/courses/new/${nextStep}`);
      return;
    }

    setSubmitting(true);
    setApiError("");
    try {
      const created = await createConfiguredCourse({
        title: course.name.trim(),
        description: course.description.trim(),
        targetLearner: course.targetLearner.trim(),
        difficultyLevel: ({
          Beginner: "BEGINNER",
          Intermediate: "INTERMEDIATE",
          Advanced: "ADVANCED",
        } as const)[course.level],
        learningObjective: course.objectives.map((objective) => objective.trim()).join("\n"),
      });
      router.push(`/creator/courses/${created.id}/sources`);
    } catch (caught) {
      setApiError(caught instanceof Error ? caught.message : "We couldn’t create this course. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function addObjective() { updateCourse({ objectives: [...course.objectives, ""] }); }
  function updateObjective(index: number, value: string) { updateCourse({ objectives: course.objectives.map((objective, itemIndex) => itemIndex === index ? value : objective) }); }
  function removeObjective(index: number) { if (course.objectives.length > 1) updateCourse({ objectives: course.objectives.filter((_, itemIndex) => itemIndex !== index) }); }

  return (
    <ContentContainer className="max-w-[82rem]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="type-label text-action-primary">Course setup</p><h1 className="type-h1 mt-2">{stepLabels[step]}</h1><p className="mt-2 text-text-secondary">{stepDescriptions[step]}</p></div>
        <Button variant="ghost" onClick={() => router.push("/creator?courseSaved=1")}>Save & exit</Button>
      </div>

      <Card className="mt-8 p-5 sm:p-6"><Stepper steps={steps} label="Course setup progress" /></Card>

      <div className="mx-auto mt-8 max-w-3xl">
        <Card className="p-5 shadow-sm sm:p-8">
          {step === "basics" && (
            <div className="grid gap-6">
              <Field><FieldLabel htmlFor="course-name">Course name</FieldLabel><Input id="course-name" value={course.name} onChange={(event) => updateCourse({ name: event.target.value })} placeholder="Digital Marketing Foundations" validation={course.name.trim().length < 3 ? "error" : "default"} aria-describedby="course-name-guidance" maxLength={100} /><FieldDescription id="course-name-guidance">Use at least 3 characters and a name learners understand at a glance.</FieldDescription></Field>
              <Field><FieldLabel htmlFor="course-description">Description</FieldLabel><Textarea id="course-description" value={course.description} onChange={(event) => updateCourse({ description: event.target.value })} rows={5} maxLength={400} validation={course.description.trim().length < 20 ? "error" : "default"} aria-describedby="course-description-guidance" /><FieldDescription id="course-description-guidance">{course.description.length}/400 characters · minimum 20</FieldDescription></Field>
            </div>
          )}

          {step === "audience" && (
            <div className="grid gap-8">
              <Field><FieldLabel htmlFor="target-learner">Target learner</FieldLabel><Textarea id="target-learner" value={course.targetLearner} onChange={(event) => updateCourse({ targetLearner: event.target.value })} rows={4} validation={course.targetLearner.trim().length < 20 ? "error" : "default"} aria-describedby="target-learner-guidance" /><FieldDescription id="target-learner-guidance">Describe their role, experience, and goal in at least 20 characters.</FieldDescription></Field>
              <fieldset><legend className="type-label">Difficulty</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{(["Beginner", "Intermediate", "Advanced"] as CourseLevel[]).map((level) => <Radio key={level} name="level" label={level} description={level === "Beginner" ? "No prior knowledge" : level === "Intermediate" ? "Some practical experience" : "Strong existing knowledge"} checked={course.level === level} onChange={() => updateCourse({ level })} className={cn("rounded-lg border p-4", course.level === level ? "border-action-primary bg-blue-50" : "border-border-default")} />)}</div></fieldset>
            </div>
          )}

          {step === "objectives" && (
            <div>
              <div className="rounded-md bg-blue-50 p-4"><p className="type-body-small text-blue-800">Start with a clear action verb and describe what learners should be able to do.</p></div>
              <div className="mt-6 grid gap-4">{course.objectives.map((objective, index) => <div key={index} className="flex items-start gap-2"><Field className="flex-1"><FieldLabel htmlFor={`objective-${index}`}>Objective {index + 1}</FieldLabel><Input id={`objective-${index}`} value={objective} onChange={(event) => updateObjective(index, event.target.value)} validation={objective.trim().length < 8 ? "error" : "default"} aria-describedby={`objective-${index}-guidance`} /><FieldDescription id={`objective-${index}-guidance`}>Use a clear action verb and at least 8 characters.</FieldDescription></Field><Button variant="ghost" size="icon" className="mt-7 shrink-0" onClick={() => removeObjective(index)} disabled={course.objectives.length === 1} aria-label={`Remove objective ${index + 1}`}><Trash2 className="size-4" aria-hidden="true" /></Button></div>)}</div>
              <Button variant="secondary" className="mt-5" onClick={addObjective}><Plus className="size-4" aria-hidden="true" />Add objective</Button>
            </div>
          )}

          {step === "certificate" && (
            <div className="grid gap-6">
              <Toggle label="Issue a certificate when learners complete this course" description="Learners can download a completion certificate." checked={course.certificateEnabled} onCheckedChange={(certificateEnabled) => updateCourse({ certificateEnabled })} className="rounded-lg border border-border-default p-5" />
              {course.certificateEnabled && <fieldset className="rounded-lg bg-neutral-25 p-5"><legend className="type-label px-1">Completion criteria</legend><div className="mt-2 grid gap-2"><Radio name="criteria" label="Complete all lessons" description="Certificate is issued after every lesson is marked complete." checked={course.completionCriteria === "all-lessons"} onChange={() => updateCourse({ completionCriteria: "all-lessons" })} /><Radio name="criteria" label="Pass a final assessment" description="A score threshold can be configured during course generation." checked={course.completionCriteria === "final-assessment"} onChange={() => updateCourse({ completionCriteria: "final-assessment" })} /></div></fieldset>}
            </div>
          )}

          {step === "review" && <ReviewCourse course={course} />}
        </Card>

        <div className="mt-6 flex items-center justify-between gap-3">
          {previousStep ? <ButtonLink href={`/creator/courses/new/${previousStep}`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back</ButtonLink> : <ButtonLink href="/creator" variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back</ButtonLink>}
          <div className="flex max-w-lg flex-col items-end gap-2"><div className="flex items-center gap-3"><span className="type-caption hidden text-text-tertiary sm:block">Changes are saved as you continue</span><Button size="lg" onClick={continueForward} disabled={!stepIsValid} isLoading={submitting} loadingLabel="Creating course…" aria-describedby={!stepIsValid ? "wizard-disabled-reason" : apiError ? "course-api-error" : undefined}>{step === "review" ? "Create course & add sources" : "Continue"}<ArrowRight className="size-4" aria-hidden="true" /></Button></div>{!stepIsValid && <FieldError id="wizard-disabled-reason" className="justify-end text-right">{disabledGuidance}</FieldError>}{apiError && <FieldError id="course-api-error" className="justify-end text-right">{apiError}</FieldError>}</div>
        </div>
      </div>
    </ContentContainer>
  );
}

function ReviewCourse({ course }: { course: ReturnType<typeof useCourseSetup>["course"] }) {
  const sections = [
    { label: "Course basics", href: "/creator/courses/new/basics", content: <><p className="font-semibold">{course.name}</p><p className="type-body-small mt-1 text-text-secondary">{course.description}</p></> },
    { label: "Audience & level", href: "/creator/courses/new/audience", content: <><Badge variant="info">{course.level}</Badge><p className="type-body-small mt-3 text-text-secondary">{course.targetLearner}</p></> },
    { label: "Learning objectives", href: "/creator/courses/new/objectives", content: <ul className="grid gap-2">{course.objectives.filter(Boolean).map((objective) => <li key={objective} className="type-body-small flex gap-2 text-text-secondary"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-success" aria-hidden="true" />{objective}</li>)}</ul> },
    { label: "Certificate", href: "/creator/courses/new/certificate", content: <p className="type-body-small text-text-secondary">{course.certificateEnabled ? `Enabled · ${course.completionCriteria === "all-lessons" ? "Complete all lessons" : "Pass final assessment"}` : "Not issued"}</p> },
  ];
  return <div className="divide-y divide-border-default">{sections.map((section) => <section key={section.label} className="py-5 first:pt-0 last:pb-0"><div className="mb-3 flex items-center justify-between gap-4"><h2 className="type-label">{section.label}</h2><Link href={section.href} className="type-body-small rounded-sm font-semibold text-text-link hover:underline">Edit</Link></div>{section.content}</section>)}</div>;
}
