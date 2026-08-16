"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, BookOpen, Clock3, LogOut, PlayCircle } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card } from "@/components/ui";
import { learnerDemoCourse } from "@/data/mock";
import { buildPersonalizedLessonSequence } from "@/data/mock/learning-experience";
import { clearAuthSession, getAuthSession } from "@/features/auth/lib/auth-session";
import { readLearnerJourney } from "@/features/learner-journey/lib/journey-store";
import { readLearningProfile } from "@/features/learner-onboarding/lib/learning-profile-store";

interface ContinueState {
  href: string;
  title: string;
  description: string;
  action: string;
}

export function LearnerHome() {
  const router = useRouter();
  const [learnerName, setLearnerName] = useState("Learner");
  const learningProfileHref = `/learner/courses/${learnerDemoCourse.id}/learning-profile`;
  const [continueState, setContinueState] = useState<ContinueState>({
    href: learningProfileHref,
    title: "No course in progress yet",
    description: "Start Digital Marketing Foundations when you’re ready.",
    action: "Choose a course",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getAuthSession();
      if (!session) return;
      setLearnerName(session.user.name.split(" ")[0] || "Learner");
      const profile = readLearningProfile(session.user.id, learnerDemoCourse.id);
      const journey = readLearnerJourney(session.user.id, learnerDemoCourse.id);
      if (journey?.skillResult) {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/result`, title: journey.skillResult.courseStatus === "completed" ? "Course completed" : "More practice recommended", description: `Skill result: ${journey.skillResult.overallCompetencyScore}%. Review your feedback and evidence.`, action: "View skill result" });
      } else if (journey?.practicalAssessment?.status === "passed") {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/result`, title: "Practical assessment passed", description: "Your knowledge and applied evidence are ready for the final skill result.", action: "View skill result" });
      } else if (journey?.practicalAssessment) {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/practical-assessment`, title: "Practical assessment in progress", description: "Continue your saved campaign plan or review its feedback.", action: "Continue practical" });
      } else if (journey?.knowledgeChecks?.["post-assessment-digital-marketing-v1"]?.result?.passed) {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/practical-assessment`, title: "Final knowledge check passed", description: "Apply what you learned in the practical campaign-plan assessment.", action: "Start practical" });
      } else if (journey?.learningProgress?.status === "completed") {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/post-assessment`, title: "Required lessons completed", description: "Take the final knowledge check to measure your improvement.", action: "Final knowledge check" });
      } else if (journey?.learningProgress && journey.learningPath) {
        const lessonCount = buildPersonalizedLessonSequence(journey.learningPath).length;
        const percent = lessonCount ? Math.round((journey.learningProgress.completedLessonIds.length / lessonCount) * 100) : 0;
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/learn/${journey.learningProgress.currentLessonId ?? ""}`, title: `Learning in progress — ${percent}%`, description: "Resume at your latest lesson in the personalized sequence.", action: "Resume learning" });
      } else if (journey?.learningPath) {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/learning-path`, title: "Your personalized path is ready", description: "Return to your recommended learning order and focus areas.", action: "View learning path" });
      } else if (journey?.result) {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/skill-gap`, title: "Your skill snapshot is ready", description: "Review your strengths and priorities, then build your learning path.", action: "View skill snapshot" });
      } else if (journey?.assessment) {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/pre-assessment`, title: "Your pre-assessment is in progress", description: "Your previous answers are saved and ready to continue.", action: "Resume assessment" });
      } else if (profile) {
        setContinueState({ href: `/learner/courses/${learnerDemoCourse.id}/pre-assessment`, title: "Your learning preferences are saved", description: "Continue to the pre-assessment when you’re ready.", action: "Continue to assessment" });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function signOut() {
    clearAuthSession();
    router.push("/sign-in?signedOut=1");
  }

  return (
    <ContentContainer className="max-w-[82rem]">
      <PageHeader title={`Welcome back, ${learnerName}`} description="Continue from your latest saved step or choose an available course." actions={<Button variant="ghost" onClick={signOut}><LogOut className="size-4" aria-hidden="true" />Sign out</Button>} />

      <section className="mt-8" aria-labelledby="continue-learning-heading">
        <div className="flex items-end justify-between gap-4"><div><p className="type-label text-action-primary">Your learning</p><h2 id="continue-learning-heading" className="type-h3 mt-1">Continue learning</h2></div></div>
        <Card className="mt-4 flex flex-col items-start justify-between gap-5 border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:p-6">
          <div><p className="font-semibold text-blue-950">{continueState.title}</p><p className="type-body-small mt-1 text-blue-800">{continueState.description}</p></div>
          <ButtonLink href={continueState.href} variant={continueState.action === "Choose a course" ? "secondary" : "primary"}>{continueState.action}</ButtonLink>
        </Card>
      </section>

      <section className="mt-10" aria-labelledby="available-courses-heading">
        <div><p className="type-label text-action-primary">Course catalog</p><h2 id="available-courses-heading" className="type-h3 mt-1">Available courses</h2></div>
        <Card className="mt-4 overflow-hidden shadow-sm">
          <div className="grid md:grid-cols-[13rem_minmax(0,1fr)_auto]">
            <div className="flex min-h-40 items-center justify-center bg-blue-800 p-6 text-white"><div className="text-center"><BookOpen className="mx-auto size-9 text-yellow-300" aria-hidden="true" /><p className="type-caption mt-3 font-semibold tracking-wide text-blue-100 uppercase">Featured course</p></div></div>
            <div className="p-6 sm:p-7"><div className="flex flex-wrap gap-2"><Badge variant="info">{learnerDemoCourse.level}</Badge>{learnerDemoCourse.certificateAvailable && <Badge variant="accent"><Award className="size-3.5" aria-hidden="true" />Certificate available</Badge>}</div><h3 className="type-h3 mt-4">{learnerDemoCourse.title}</h3><p className="mt-2 max-w-2xl text-text-secondary">{learnerDemoCourse.description}</p><div className="type-body-small mt-5 flex flex-wrap gap-5 text-text-secondary"><span className="flex items-center gap-2"><BookOpen className="size-4" aria-hidden="true" />{learnerDemoCourse.moduleCount} modules</span><span className="flex items-center gap-2"><Clock3 className="size-4" aria-hidden="true" />{learnerDemoCourse.estimatedTime}</span></div></div>
            <div className="flex items-center border-t border-border-default p-6 md:border-t-0 md:border-l"><ButtonLink href={continueState.href} size="lg" className="w-full whitespace-nowrap"><PlayCircle className="size-4" aria-hidden="true" />{continueState.action === "Choose a course" ? "Start learning" : continueState.action}</ButtonLink></div>
          </div>
        </Card>
      </section>
    </ContentContainer>
  );
}
