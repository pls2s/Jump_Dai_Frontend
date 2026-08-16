"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clipboard,
  FileCheck2,
  Printer,
  ShieldCheck,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Button, ButtonLink, Card, Spinner } from "@/components/ui";
import {
  appendPreviewState,
  CredentialStatusBadge,
  formatPortfolioDate,
} from "@/features/skill-portfolio/components/portfolio-shared";
import { loadSkillPortfolio } from "@/features/skill-portfolio/services/skill-portfolio-service";
import type {
  PortfolioPreviewState,
  SkillPortfolioSnapshot,
} from "@/features/skill-portfolio/types";

export function CredentialWorkspace({ courseId, credentialId, previewState }: { courseId: string; credentialId: string; previewState: PortfolioPreviewState }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<SkillPortfolioSnapshot | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaded = loadSkillPortfolio(courseId, previewState);
      if (!loaded) return router.replace("/sign-in");
      setPortfolio(loaded);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [courseId, previewState, router]);

  if (!portfolio) return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Preparing credential preview…</div></ContentContainer>;
  const credential = portfolio.credential;
  const root = `/learner/courses/${courseId}/skill-evidence`;
  if (credential.id !== credentialId || credential.status === "not-eligible" || !credential.certificateOffered) return <ContentContainer className="max-w-3xl"><PageHeader title="This credential isn’t available" description="The course has not met its credential requirements, or the preview identifier is not valid." /><ButtonLink href={appendPreviewState(`${root}/requirements`, previewState)} className="mt-7">View requirements</ButtonLink></ContentContainer>;

  async function copyCredentialLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyFeedback("Frontend credential preview link copied.");
    } catch {
      setCopyFeedback("Copy was unavailable. Use the current browser address instead.");
    }
  }

  const verifiedSkills = portfolio.skills.filter((skill) => credential.verifiedSkillIds.includes(skill.id));
  return <ContentContainer className="max-w-6xl print:max-w-none"><PageHeader eyebrow="Credential preview" title={credential.title} description="A professional record of the course, verified skills, and supporting assessment evidence." breadcrumb={[{ label: "Portfolio", href: appendPreviewState(root, previewState) }, { label: "Credentials", href: appendPreviewState(`${root}?tab=credentials`, previewState) }, { label: credential.courseTitle }]} actions={<div className="flex flex-wrap gap-2 print:hidden"><Button variant="secondary" onClick={() => void copyCredentialLink()}><Clipboard className="size-4" aria-hidden="true" />Copy credential link</Button><Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" aria-hidden="true" />Print / Save as PDF</Button></div>} />
    {copyFeedback && <p role="status" className="type-body-small mt-4 rounded-md bg-blue-50 p-3 text-blue-900 print:hidden">{copyFeedback}</p>}
    <Card className="mt-8 overflow-hidden border-blue-200 shadow-sm"><div className="bg-blue-800 p-6 text-white sm:p-9"><div className="flex items-start justify-between gap-5"><span className="flex size-12 items-center justify-center rounded-lg bg-white/10 text-yellow-300"><Award className="size-6" aria-hidden="true" /></span><CredentialStatusBadge status={credential.status} /></div><p className="type-caption mt-8 font-semibold tracking-[0.16em] text-blue-200 uppercase">SkillSync AI</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{credential.courseTitle}</h2><p className="mt-3 max-w-2xl text-blue-100">This record recognizes the learning and evidence completed by <strong className="text-white">{credential.learnerName}</strong>.</p></div><div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_18rem]"><div><h3 className="type-title-large">Verified skills</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{verifiedSkills.map((skill) => <div key={skill.id} className="flex gap-3 rounded-lg bg-neutral-50 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-success" aria-hidden="true" /><div><p className="font-semibold">{skill.name}</p><p className="type-body-small mt-1 text-text-secondary">{skill.competencyScore}% competency · {skill.evidence.length} evidence items</p></div></div>)}</div><h3 className="type-title-large mt-8">Assessment summary</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><Summary label="Final knowledge assessment" value={credential.assessmentScore === undefined ? "Not available" : `${credential.assessmentScore}%`} /><Summary label="Practical assessment" value={credential.practicalScore === undefined ? "Not available" : `${credential.practicalScore}%`} /></div>{credential.evidenceSummary && <div className="mt-5 flex gap-3 rounded-lg border border-border-default p-4"><FileCheck2 className="mt-0.5 size-5 shrink-0 text-blue-800" aria-hidden="true" /><div><p className="font-semibold">Practical evidence</p><p className="type-body-small mt-1 text-text-secondary">{credential.evidenceSummary}</p></div></div>}</div><dl className="grid content-start gap-5 rounded-lg bg-neutral-50 p-5"><CredentialMeta label="Status"><CredentialStatusBadge status={credential.status} /></CredentialMeta><CredentialMeta label="Learner">{credential.learnerName}</CredentialMeta><CredentialMeta label="Issued">{credential.status === "issued" ? formatPortfolioDate(credential.issueDate) : "Ready for simulated issuance"}</CredentialMeta><CredentialMeta label="Credential ID"><span className="font-mono text-sm">{credential.id}</span></CredentialMeta></dl></div></Card>
    <Card className="mt-5 flex gap-3 border-yellow-300 bg-yellow-50 p-4"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-warning" aria-hidden="true" /><div><p className="font-semibold">Frontend prototype credential</p><p className="type-body-small mt-1 text-text-secondary">This preview is derived from local demo evidence. Its link is not a public verification URL, and Print / Save as PDF uses the browser print dialog.</p></div></Card>
    <div className="mt-7 flex flex-wrap gap-3 print:hidden"><ButtonLink href={appendPreviewState(`${root}?tab=evidence`, previewState)} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />View evidence</ButtonLink><ButtonLink href={appendPreviewState(`${root}/requirements`, previewState)} variant="ghost">Credential requirements</ButtonLink></div>
  </ContentContainer>;
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border-default p-4"><p className="type-caption text-text-tertiary">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>; }
function CredentialMeta({ label, children }: { label: string; children: React.ReactNode }) { return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-medium">{children}</dd></div>; }
