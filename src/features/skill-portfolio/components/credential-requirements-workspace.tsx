"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Award, Info } from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { ButtonLink, Card, Spinner } from "@/components/ui";
import {
  appendPreviewState,
  CredentialStatusBadge,
  RequirementMark,
} from "@/features/skill-portfolio/components/portfolio-shared";
import { loadSkillPortfolio } from "@/features/skill-portfolio/services/skill-portfolio-service";
import { ApiCredentialRequirementsNotice } from "@/features/skill-portfolio/components/api-portfolio-workspaces";
import { useApiLearningMode } from "@/features/personalized-learning/lib/use-api-learning-mode";
import type {
  PortfolioPreviewState,
  SkillPortfolioSnapshot,
} from "@/features/skill-portfolio/types";

export function CredentialRequirementsWorkspace({ courseId, previewState }: { courseId: string; previewState: PortfolioPreviewState }) {
  const mode = useApiLearningMode();
  if (mode === "loading") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Checking credential requirements…</div></ContentContainer>;
  if (mode === "api") return <ApiCredentialRequirementsNotice courseId={courseId} />;
  return <DemoCredentialRequirementsWorkspace courseId={courseId} previewState={previewState} />;
}

function DemoCredentialRequirementsWorkspace({ courseId, previewState }: { courseId: string; previewState: PortfolioPreviewState }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<SkillPortfolioSnapshot | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadSkillPortfolio(courseId, previewState);
      if (!loaded) return router.replace("/sign-in");
      setPortfolio(loaded);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, previewState, router]);

  if (!portfolio) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Checking credential requirements…</div></ContentContainer>;
  const credential = portfolio.credential;
  const root = `/learner/courses/${courseId}/skill-evidence`;
  const remaining = credential.requirements.filter((item) => !item.met).length;

  return <ContentContainer className="max-w-4xl"><PageHeader eyebrow={portfolio.courseTitle} title="Credential requirements" description="A credential is available only when required learning, knowledge, and applied evidence meet the course rules." breadcrumb={[{ label: "Portfolio", href: appendPreviewState(root, previewState) }, { label: "Credential requirements" }]} actions={<CredentialStatusBadge status={credential.status} />} />
    {!credential.certificateOffered && <Card className="mt-7 flex gap-3 border-yellow-300 bg-yellow-50 p-5"><Info className="mt-0.5 size-5 shrink-0 text-status-warning" aria-hidden="true" /><div><h2 className="font-semibold">Certificate not offered for this course</h2><p className="type-body-small mt-1 text-text-secondary">Your verified skills and assessment evidence remain available in the portfolio, but the Creator disabled certificate issuance.</p></div></Card>}
    <Card className="mt-7 overflow-hidden"><div className="border-b border-border-default p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-800"><Award className="size-5" aria-hidden="true" /></span><div><h2 className="type-title-large">{remaining === 0 ? "All requirements complete" : `${remaining} requirement${remaining === 1 ? "" : "s"} remaining`}</h2><p className="type-body-small mt-1 text-text-secondary">{credential.status === "issued" ? "This frontend demo credential has been issued." : credential.status === "eligible" ? "This course is eligible and ready for the simulated issuance step." : "Complete the outstanding items to become eligible."}</p></div></div></div><div className="divide-y divide-border-default">{credential.requirements.map((item) => <div key={item.id} className="flex gap-3 p-5 sm:px-6"><RequirementMark met={item.met} /><div><h3 className="text-sm font-semibold">{item.label}</h3><p className="type-body-small mt-1 text-text-secondary">{item.detail}</p></div></div>)}</div></Card>
    <div className="mt-7 flex flex-wrap gap-3"><ButtonLink href={appendPreviewState(`${root}?tab=credentials`, previewState)} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to credentials</ButtonLink>{(credential.status === "issued" || credential.status === "eligible") && <ButtonLink href={appendPreviewState(`${root}/credentials/${credential.id}`, previewState)}>{credential.status === "issued" ? "View credential" : "Preview credential"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>}{credential.status === "not-eligible" && credential.certificateOffered && <ButtonLink href={`/learner/courses/${courseId}/practical-assessment`}>Continue assessment<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>}</div>
  </ContentContainer>;
}
