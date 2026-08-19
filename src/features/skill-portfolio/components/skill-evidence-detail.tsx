"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clipboard,
  FileCheck2,
  TrendingUp,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress, Spinner, useToast } from "@/components/ui";
import {
  appendPreviewState,
  formatPortfolioDate,
  SkillStatusBadge,
} from "@/features/skill-portfolio/components/portfolio-shared";
import { loadSkillPortfolio } from "@/features/skill-portfolio/services/skill-portfolio-service";
import { ApiSkillEvidenceDetail } from "@/features/skill-portfolio/components/api-portfolio-workspaces";
import { useApiLearningMode } from "@/features/personalized-learning/lib/use-api-learning-mode";
import type {
  PortfolioPreviewState,
  SkillPortfolioSnapshot,
} from "@/features/skill-portfolio/types";

export function SkillEvidenceDetail({ courseId, skillId, previewState }: { courseId: string; skillId: string; previewState: PortfolioPreviewState }) {
  const mode = useApiLearningMode();
  if (mode === "loading") return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading skill evidence…</div></ContentContainer>;
  if (mode === "api") return <ApiSkillEvidenceDetail courseId={courseId} skillId={skillId} />;
  return <DemoSkillEvidenceDetail courseId={courseId} skillId={skillId} previewState={previewState} />;
}

function DemoSkillEvidenceDetail({ courseId, skillId, previewState }: { courseId: string; skillId: string; previewState: PortfolioPreviewState }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [portfolio, setPortfolio] = useState<SkillPortfolioSnapshot | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadSkillPortfolio(courseId, previewState);
      if (!loaded) {
        router.replace("/sign-in");
        return;
      }
      setPortfolio(loaded);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, previewState, router]);

  if (!portfolio) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Loading skill evidence…</div></ContentContainer>;
  const skill = portfolio.skills.find((item) => item.id === skillId);
  const root = `/learner/courses/${courseId}/skill-evidence`;
  if (!skill) return <ContentContainer className="max-w-3xl"><PageHeader title="This skill isn’t available" description="Return to your portfolio to choose an available skill record." /><ButtonLink href={appendPreviewState(root, previewState)} className="mt-7"><ArrowLeft className="size-4" aria-hidden="true" />Back to portfolio</ButtonLink></ContentContainer>;

  async function copySkillLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast({ tone: "success", title: "Skill evidence link copied" });
    } catch {
      showToast({ tone: "error", title: "Skill evidence link wasn’t copied", description: "Use the current browser address instead." });
    }
  }

  const practical = skill.evidence.find((item) => item.type === "practical-assessment");
  return (
    <ContentContainer className="max-w-6xl">
      <PageHeader
        eyebrow="Skill evidence"
        title={skill.name}
        description="See the learning and assessment evidence behind this competency record."
        breadcrumb={[{ label: "Portfolio", href: appendPreviewState(root, previewState) }, { label: "Skills", href: appendPreviewState(`${root}?tab=skills`, previewState) }, { label: skill.name }]}
        actions={<div className="flex flex-wrap gap-2"><SkillStatusBadge status={skill.status} /><Button variant="secondary" onClick={() => void copySkillLink()}><Clipboard className="size-4" aria-hidden="true" />Share evidence</Button></div>}
      />
      <div className="mt-7 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="p-5 sm:p-6"><p className="type-caption text-text-tertiary">Competency</p><p className="mt-1 text-4xl font-semibold">{skill.competencyScore}%</p><Progress className="mt-4" value={skill.competencyScore} label={`${skill.name} competency score`} /><div className="mt-6 grid grid-cols-3 gap-2 text-center"><Score label="Before" value={`${skill.beforeScore}%`} /><Score label="After" value={`${skill.competencyScore}%`} /><Score label="Gain" value={`${skill.improvement >= 0 ? "+" : ""}${skill.improvement}`} /></div><p className="type-body-small mt-5 text-text-secondary">From {skill.courseTitle}</p>{skill.verifiedAt && <p className="type-caption mt-2 text-text-tertiary">Verified {formatPortfolioDate(skill.verifiedAt)}</p>}</Card>
        <Card className="p-5 sm:p-6"><div className="flex items-center gap-2"><TrendingUp className="size-5 text-blue-800" aria-hidden="true" /><h2 className="type-title-large">What supports this skill</h2></div><p className="type-body-small mt-2 text-text-secondary">{skill.statusReason}</p><div className="mt-5 grid gap-3">{skill.evidence.map((item, index) => <div key={item.id} className="grid gap-4 rounded-lg border border-border-default p-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-start"><span className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-800">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3>{item.score !== undefined && <Badge variant={item.status === "passed" ? "success" : "neutral"}>{item.score}%</Badge>}</div><p className="type-body-small mt-1 text-text-secondary">{item.description}</p><p className="type-caption mt-2 text-text-tertiary">{formatPortfolioDate(item.createdAt)}</p></div><ButtonLink href={item.resultHref} variant="ghost" size="sm">View result<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>)}</div></Card>
      </div>

      {practical?.rubric && <Card className="mt-6 overflow-hidden"><div className="border-b border-border-default p-5 sm:px-6"><div className="flex items-center gap-2"><FileCheck2 className="size-5 text-blue-800" aria-hidden="true" /><h2 className="type-title-large">Practical assessment evidence</h2></div><p className="type-body-small mt-2 text-text-secondary">Digital Campaign Plan · rubric evidence</p></div><div className="divide-y divide-border-default">{practical.rubric.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"><span className="text-sm font-medium">{item.label}</span><span className="text-sm font-semibold">{item.earned} / {item.possible}</span></div>)}</div><div className="border-t border-border-default bg-neutral-25 p-5 sm:px-6"><ButtonLink href={practical.resultHref} variant="secondary">View assessment result<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div></Card>}

      {skill.status !== "verified" && <Card className="mt-6 border-yellow-300 bg-yellow-50 p-5 sm:p-6"><h2 className="font-semibold">Almost there</h2><p className="type-body-small mt-2 text-text-secondary">{skill.statusReason}</p>{skill.nextActionHref && <ButtonLink href={skill.nextActionHref} className="mt-5">{skill.nextActionLabel}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>}</Card>}
      <div className="mt-6"><ButtonLink href={appendPreviewState(`${root}?tab=skills`, previewState)} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Back to skills</ButtonLink></div>
    </ContentContainer>
  );
}

function Score({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-neutral-50 p-2"><p className="type-caption text-text-tertiary">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}
