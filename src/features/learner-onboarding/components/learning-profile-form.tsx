"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenCheck, Clock3, Gauge, Heart, Target } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Field, FieldDescription, FieldError, FieldLabel, Input, Progress, Spinner, Textarea } from "@/components/ui";
import { familiarityOptions, learningGoalOptions, learningPaceOptions, learningPreferenceOptions, sessionLengthOptions } from "@/data/mock";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { createEmptyLearningProfile, readLearningProfile } from "@/features/learner-onboarding/lib/learning-profile-store";
import { saveLearningProfile } from "@/features/learner-onboarding/services/learning-profile-service";
import type { FamiliarityLevel, LearnerLearningProfile, LearningGoal, LearningPace, LearningPreference, SessionLength } from "@/features/learner-onboarding/types";
import { SelectableOption } from "./selectable-option";

type ProfileErrors = Partial<Record<"goal" | "familiarity" | "preferences" | "pace" | "form", string>>;

export function LearningProfileForm({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<LearnerLearningProfile>(() => createEmptyLearningProfile(0, courseId));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) {
        router.replace("/sign-in");
        return;
      }
      setProfile(readLearningProfile(session.user.id, courseId) ?? createEmptyLearningProfile(session.user.id, courseId));
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, router]);

  function update(updates: Partial<LearnerLearningProfile>) {
    setProfile((current) => ({ ...current, ...updates }));
  }

  function choosePreference(preference: LearningPreference, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...profile.learningPreferences, preference]))
      : profile.learningPreferences.filter((item) => item !== preference);
    update({ learningPreferences: next });
    if (next.length > 0) setErrors((current) => ({ ...current, preferences: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ProfileErrors = {};
    if (!profile.goal) nextErrors.goal = "Choose one primary learning goal.";
    if (!profile.familiarity) nextErrors.familiarity = "Choose your current familiarity.";
    if (profile.learningPreferences.length === 0) nextErrors.preferences = "Choose at least one content preference.";
    if (!profile.pace) nextErrors.pace = "Choose a preferred learning pace.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await saveLearningProfile(profile);
      router.push(`/learner/courses/${courseId}/pre-assessment`);
    } catch {
      setErrors({ form: "We couldn’t save your learning preferences. Your selections are still on this page; try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading your learning preferences…</div></ContentContainer>;
  }

  return (
    <ContentContainer className="max-w-5xl">
      <PageHeader eyebrow={courseTitle} title="Personalize your learning" description="Tell us what you want to achieve so SkillSync can shape the learning experience around you." />

      <Card className="mt-7 border-blue-200 bg-blue-50 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4"><div><p className="type-label text-blue-900">Step 1 of 2</p><p className="type-body-small mt-1 text-blue-800">Learning preferences</p></div><Badge variant="info">Next: Pre-assessment</Badge></div>
        <Progress value={50} size="sm" className="mt-4" />
      </Card>

      <form onSubmit={submit} className="mt-7" noValidate>
        <Card className="overflow-hidden shadow-sm">
          {errors.form && <div className="border-b border-border-default p-5 sm:px-7"><FieldError>{errors.form}</FieldError></div>}

          <section className="p-5 sm:p-7" aria-labelledby="learning-goal-heading">
            <SectionHeading icon={Target} id="learning-goal-heading" title="What would you like to achieve?" description="Choose one primary goal for this course." />
            <fieldset className="mt-5" aria-describedby={errors.goal ? "learning-goal-error" : undefined}>
              <legend className="sr-only">Primary learning goal</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {learningGoalOptions.map((option) => <SelectableOption key={option.id} type="radio" name="learning-goal" value={option.id} label={option.label} description={option.description} checked={profile.goal === option.id} onChange={() => { update({ goal: option.id as LearningGoal }); setErrors((current) => ({ ...current, goal: undefined })); }} />)}
              </div>
              {errors.goal && <FieldError id="learning-goal-error" className="mt-3">{errors.goal}</FieldError>}
            </fieldset>
            {profile.goal === "other" && <Field className="mt-4"><FieldLabel htmlFor="other-learning-goal">Tell us more <span className="font-normal text-text-tertiary">(optional)</span></FieldLabel><Input id="other-learning-goal" value={profile.otherGoal} onChange={(event) => update({ otherGoal: event.target.value })} placeholder="Describe your primary goal" maxLength={120} /></Field>}
          </section>

          <section className="border-t border-border-default p-5 sm:p-7" aria-labelledby="goal-detail-heading">
            <SectionHeading icon={Heart} id="goal-detail-heading" title="What are you hoping to do with this skill?" description="Optional context helps make future recommendations more relevant." />
            <Field className="mt-5"><FieldLabel htmlFor="goal-detail" className="sr-only">Learning goal detail</FieldLabel><Textarea id="goal-detail" value={profile.goalDetail} onChange={(event) => update({ goalDetail: event.target.value })} placeholder="I want to understand digital marketing well enough to plan campaigns for my small business." maxLength={500} rows={4} /><FieldDescription className="text-right">{profile.goalDetail.length} / 500</FieldDescription></Field>
          </section>

          <section className="border-t border-border-default p-5 sm:p-7" aria-labelledby="familiarity-heading">
            <SectionHeading icon={Gauge} id="familiarity-heading" title="How familiar are you with this topic?" description="This helps us interpret your pre-assessment results. It does not replace the assessment." />
            <fieldset className="mt-5" aria-describedby={errors.familiarity ? "familiarity-error" : undefined}>
              <legend className="sr-only">Current familiarity</legend>
              <div className="grid gap-3 sm:grid-cols-2">{familiarityOptions.map((option) => <SelectableOption key={option.id} type="radio" name="familiarity" value={option.id} label={option.label} checked={profile.familiarity === option.id} onChange={() => { update({ familiarity: option.id as FamiliarityLevel }); setErrors((current) => ({ ...current, familiarity: undefined })); }} compact />)}</div>
              {errors.familiarity && <FieldError id="familiarity-error" className="mt-3">{errors.familiarity}</FieldError>}
            </fieldset>
          </section>

          <section className="border-t border-border-default p-5 sm:p-7" aria-labelledby="preferences-heading">
            <SectionHeading icon={BookOpenCheck} id="preferences-heading" title="How do you prefer to learn?" description="Choose one or more content preferences. These are flexible preferences, not fixed learning styles." />
            <fieldset className="mt-5" aria-describedby={errors.preferences ? "preferences-error" : undefined}>
              <legend className="sr-only">Learning content preferences</legend>
              <div className="grid gap-3 sm:grid-cols-2">{learningPreferenceOptions.map((option) => <SelectableOption key={option.id} type="checkbox" name="learning-preferences" value={option.id} label={option.label} checked={profile.learningPreferences.includes(option.id)} onChange={(checked) => choosePreference(option.id as LearningPreference, checked)} compact />)}</div>
              {errors.preferences && <FieldError id="preferences-error" className="mt-3">{errors.preferences}</FieldError>}
            </fieldset>
          </section>

          <section className="border-t border-border-default p-5 sm:p-7" aria-labelledby="pace-heading">
            <SectionHeading icon={Gauge} id="pace-heading" title="What pace works best for you?" description="Pace changes presentation, not required competency content." />
            <fieldset className="mt-5" aria-describedby={errors.pace ? "pace-error" : undefined}>
              <legend className="sr-only">Learning pace</legend>
              <div className="grid gap-3 md:grid-cols-3">{learningPaceOptions.map((option) => <SelectableOption key={option.id} type="radio" name="learning-pace" value={option.id} label={option.label} description={option.description} checked={profile.pace === option.id} onChange={() => { update({ pace: option.id as LearningPace }); setErrors((current) => ({ ...current, pace: undefined })); }} />)}</div>
              {errors.pace && <FieldError id="pace-error" className="mt-3">{errors.pace}</FieldError>}
            </fieldset>
          </section>

          <section className="border-t border-border-default p-5 sm:p-7" aria-labelledby="session-length-heading">
            <SectionHeading icon={Clock3} id="session-length-heading" title="How much time would you usually like to spend?" description="Optional · choose a typical learning session length." />
            <fieldset className="mt-5"><legend className="sr-only">Preferred session length</legend><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{sessionLengthOptions.map((option) => <SelectableOption key={option.id} type="radio" name="session-length" value={option.id} label={option.label} checked={profile.sessionLength === option.id} onChange={() => update({ sessionLength: option.id as SessionLength })} compact />)}</div></fieldset>
          </section>
        </Card>

        <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/learner" variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back</ButtonLink>
          <div className="flex flex-col items-stretch gap-2 sm:items-end"><p className="type-caption text-text-tertiary">Required: goal, familiarity, preference, and pace.</p><Button type="submit" size="lg" isLoading={saving} loadingLabel="Saving preferences…">Continue to pre-assessment<ArrowRight className="size-4" aria-hidden="true" /></Button></div>
        </div>
      </form>
    </ContentContainer>
  );
}

function SectionHeading({ icon: Icon, id, title, description }: { icon: typeof Target; id: string; title: string; description: string }) {
  return <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-800"><Icon className="size-4.5" aria-hidden="true" /></span><div><h2 id={id} className="type-title-large">{title}</h2><p className="type-body-small mt-1 max-w-2xl text-text-secondary">{description}</p></div></div>;
}
