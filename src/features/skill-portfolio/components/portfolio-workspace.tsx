"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clipboard,
  FileCheck2,
  FolderOpen,
  GraduationCap,
  History,
  ShieldCheck,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress, Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  appendPreviewState,
  CredentialStatusBadge,
  formatPortfolioDate,
  RequirementMark,
  SkillStatusBadge,
} from "@/features/skill-portfolio/components/portfolio-shared";
import { loadSkillPortfolio } from "@/features/skill-portfolio/services/skill-portfolio-service";
import type {
  PortfolioPreviewState,
  PortfolioTab,
  SkillPortfolioSnapshot,
} from "@/features/skill-portfolio/types";

const tabs: Array<{ id: PortfolioTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "evidence", label: "Evidence" },
  { id: "credentials", label: "Credentials" },
];

export function PortfolioWorkspace({
  courseId,
  initialTab,
  previewState,
}: {
  courseId: string;
  initialTab: PortfolioTab;
  previewState: PortfolioPreviewState;
}) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<SkillPortfolioSnapshot | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");

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

  async function copyPortfolioLink() {
    const url = `${window.location.origin}/learner/courses/${courseId}/skill-evidence`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback("Frontend portfolio link copied.");
    } catch {
      setCopyFeedback("Copy was unavailable. Use the current browser address instead.");
    }
  }

  if (!portfolio) {
    return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />Preparing your skill portfolio…</div></ContentContainer>;
  }

  const root = `/learner/courses/${courseId}/skill-evidence`;
  const tabHref = (tab: PortfolioTab) => {
    const params = new URLSearchParams();
    if (tab !== "overview") params.set("tab", tab);
    if (previewState !== "default") params.set("state", previewState);
    const query = params.toString();
    return query ? `${root}?${query}` : root;
  };

  if (!portfolio.skills.length) {
    return (
      <ContentContainer className="max-w-5xl">
        <PageHeader eyebrow="Skill portfolio" title="My Skill Portfolio" description="A record of the skills you’ve developed and the evidence behind them." />
        <Card className="mt-8 px-6 py-12 text-center sm:px-10 sm:py-16">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-100 text-blue-800"><FolderOpen className="size-7" aria-hidden="true" /></span>
          <h2 className="type-h3 mt-5">Your skill portfolio will grow as you learn</h2>
          <p className="mx-auto mt-2 max-w-xl text-text-secondary">Complete assessments and practical activities to build clear evidence of your skills.</p>
          <ButtonLink href="/learner" className="mt-7">Explore learning<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
        </Card>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer className="max-w-[82rem]">
      <PageHeader
        eyebrow="Skill portfolio"
        title="My Skill Portfolio"
        description="A record of the skills you’ve developed and the evidence behind them."
        breadcrumb={[{ label: "Learner home", href: "/learner" }, { label: portfolio.courseTitle }, { label: "Skill portfolio" }]}
        actions={<Button variant="secondary" onClick={() => void copyPortfolioLink()}><Clipboard className="size-4" aria-hidden="true" />Copy portfolio link</Button>}
      />
      {copyFeedback && <p role="status" className="type-body-small mt-4 rounded-md bg-blue-50 p-3 text-blue-900">{copyFeedback}</p>}

      <Card className="mt-7 overflow-hidden border-blue-200 bg-blue-50/60">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-800 font-semibold text-white">{portfolio.learnerName.slice(0, 1).toUpperCase()}</span><div><h2 className="font-semibold text-blue-950">{portfolio.learnerName}</h2><p className="type-body-small mt-1 text-blue-900">Primary learning focus: {portfolio.learningFocus}</p></div></div>
          <div className="flex flex-wrap gap-2"><Badge variant="success"><ShieldCheck className="size-3.5" aria-hidden="true" />{portfolio.summary.verifiedSkills} verified skills</Badge><Badge variant="accent"><Award className="size-3.5" aria-hidden="true" />{portfolio.summary.credentials} credential earned</Badge></div>
        </div>
      </Card>

      <nav aria-label="Portfolio sections" className="mt-7 border-b border-border-default">
        <ul className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => <li key={tab.id}><Link href={tabHref(tab.id)} aria-current={initialTab === tab.id ? "page" : undefined} className={cn("flex min-h-11 items-center border-b-2 px-4 text-sm font-semibold whitespace-nowrap focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30", initialTab === tab.id ? "border-action-primary text-action-primary" : "border-transparent text-text-secondary hover:text-text-primary")}>{tab.label}</Link></li>)}
        </ul>
      </nav>

      {initialTab === "overview" && <Overview portfolio={portfolio} root={root} previewState={previewState} />}
      {initialTab === "skills" && <Skills portfolio={portfolio} root={root} previewState={previewState} />}
      {initialTab === "evidence" && <Evidence portfolio={portfolio} />}
      {initialTab === "credentials" && <Credentials portfolio={portfolio} root={root} previewState={previewState} />}
    </ContentContainer>
  );
}

function Overview({ portfolio, root, previewState }: { portfolio: SkillPortfolioSnapshot; root: string; previewState: PortfolioPreviewState }) {
  const stats = [
    { label: "Verified skills", value: portfolio.summary.verifiedSkills, icon: ShieldCheck },
    { label: "Credentials", value: portfolio.summary.credentials, icon: Award },
    { label: "Completed courses", value: portfolio.summary.completedCourses, icon: GraduationCap },
    { label: "Learning in progress", value: portfolio.summary.learningInProgress, icon: BookOpenCheck },
  ];
  return <div className="mt-7 grid gap-6"><section aria-labelledby="portfolio-summary"><h2 id="portfolio-summary" className="type-h3">Portfolio overview</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon }) => <Card key={label} className="p-5"><Icon className="size-5 text-blue-800" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold">{value}</p><p className="type-body-small mt-1 text-text-secondary">{label}</p></Card>)}</div></section><section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]"><div><div className="flex items-end justify-between gap-4"><div><p className="type-label text-action-primary">Current evidence</p><h2 className="type-h3 mt-1">Skills from {portfolio.courseTitle}</h2></div><Link className="text-sm font-semibold text-action-primary hover:underline" href={`${root}?tab=skills${previewState === "default" ? "" : `&state=${previewState}`}`}>View all skills</Link></div><div className="mt-4 grid gap-3">{portfolio.skills.slice(0, 3).map((skill) => <SkillRow key={skill.id} skill={skill} href={appendPreviewState(`${root}/skills/${skill.id}`, previewState)} />)}</div></div><div><p className="type-label text-action-primary">Recent activity</p><h2 className="type-h3 mt-1">Evidence timeline</h2><Card className="mt-4 divide-y divide-border-default">{portfolio.timeline.slice(0, 4).map((item) => <Link key={item.id} href={item.href} className="flex gap-3 p-4 transition hover:bg-neutral-25 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-blue-500"><History className="mt-0.5 size-4 shrink-0 text-blue-800" aria-hidden="true" /><span><span className="block text-sm font-semibold">{item.title}</span><span className="type-caption mt-1 block text-text-tertiary">{formatPortfolioDate(item.createdAt)} · {item.description}</span></span></Link>)}</Card></div></section><CredentialSummary portfolio={portfolio} root={root} previewState={previewState} /></div>;
}

function Skills({ portfolio, root, previewState }: { portfolio: SkillPortfolioSnapshot; root: string; previewState: PortfolioPreviewState }) {
  return <section className="mt-7" aria-labelledby="skills-heading"><div><p className="type-label text-action-primary">Competency record</p><h2 id="skills-heading" className="type-h3 mt-1">Skills</h2><p className="type-body-small mt-2 text-text-secondary">Verification needs both passing knowledge and applied evidence.</p></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{portfolio.skills.map((skill) => <Card key={skill.id} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{skill.name}</h3><p className="type-caption mt-1 text-text-tertiary">From {skill.courseTitle}</p></div><SkillStatusBadge status={skill.status} /></div><div className="mt-5 flex items-end justify-between gap-3"><div><p className="type-caption text-text-tertiary">Competency</p><p className="mt-1 text-2xl font-semibold">{skill.competencyScore}%</p></div><p className="type-body-small text-text-secondary">{skill.evidence.length} evidence items</p></div><Progress className="mt-3" value={skill.competencyScore} label={`${skill.name} competency score`} size="sm" /><p className="type-body-small mt-4 text-text-secondary">{skill.statusReason}</p><ButtonLink href={appendPreviewState(`${root}/skills/${skill.id}`, previewState)} variant="secondary" className="mt-5 w-full">View evidence<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>)}</div></section>;
}

function Evidence({ portfolio }: { portfolio: SkillPortfolioSnapshot }) {
  return <section className="mt-7" aria-labelledby="evidence-heading"><div><p className="type-label text-action-primary">Traceable outcomes</p><h2 id="evidence-heading" className="type-h3 mt-1">Evidence</h2><p className="type-body-small mt-2 text-text-secondary">Every record links back to the learning or assessment result that produced it.</p></div><Card className="mt-5 divide-y divide-border-default overflow-hidden">{portfolio.evidence.map((item) => <div key={item.id} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-800">{item.type === "practical-assessment" ? <FileCheck2 className="size-4" aria-hidden="true" /> : <CheckCircle2 className="size-4" aria-hidden="true" />}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{item.title}</h3>{item.score !== undefined && <Badge variant={item.status === "passed" ? "success" : "neutral"}>{item.score}%</Badge>}</div><p className="type-body-small mt-1 text-text-secondary">{item.description}</p><p className="type-caption mt-2 text-text-tertiary">{formatPortfolioDate(item.createdAt)} · {item.courseTitle}</p></div></div><ButtonLink href={item.resultHref} variant="ghost" size="sm">View result<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></div>)}</Card></section>;
}

function Credentials({ portfolio, root, previewState }: { portfolio: SkillPortfolioSnapshot; root: string; previewState: PortfolioPreviewState }) {
  const credential = portfolio.credential;
  if (!credential.certificateOffered) return <section className="mt-7"><Card className="p-6 sm:p-8"><Award className="size-7 text-text-tertiary" aria-hidden="true" /><CredentialStatusBadge status="not-eligible" /><h2 className="type-h3 mt-4">Certificate not offered for this course</h2><p className="mt-2 max-w-2xl text-text-secondary">Your learning and skill evidence still remain in this portfolio. This course’s certificate setting is currently disabled.</p><ButtonLink href={appendPreviewState(`${root}/requirements`, previewState)} variant="secondary" className="mt-6">View requirements</ButtonLink></Card></section>;
  return <section className="mt-7"><CredentialSummary portfolio={portfolio} root={root} previewState={previewState} /></section>;
}

function CredentialSummary({ portfolio, root, previewState }: { portfolio: SkillPortfolioSnapshot; root: string; previewState: PortfolioPreviewState }) {
  const credential = portfolio.credential;
  const remaining = credential.requirements.filter((item) => !item.met).length;
  return <Card className={cn("overflow-hidden", credential.status === "issued" && "border-blue-200")}><div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]"><div className={cn("p-6 sm:p-8", credential.status === "issued" ? "bg-blue-800 text-white" : "bg-neutral-50")}><div className="flex items-center justify-between gap-4"><span className={cn("flex size-11 items-center justify-center rounded-lg", credential.status === "issued" ? "bg-white/12 text-yellow-300" : "bg-blue-100 text-blue-800")}><BriefcaseBusiness className="size-5" aria-hidden="true" /></span><CredentialStatusBadge status={credential.status} /></div><p className={cn("type-caption mt-6 font-semibold tracking-wide uppercase", credential.status === "issued" ? "text-blue-200" : "text-text-tertiary")}>SkillSync Credential</p><h2 className="type-h3 mt-2">{credential.courseTitle}</h2><p className={cn("type-body-small mt-3", credential.status === "issued" ? "text-blue-100" : "text-text-secondary")}>{credential.status === "issued" ? `Issued to ${credential.learnerName} on ${formatPortfolioDate(credential.issueDate)}.` : remaining ? `${remaining} requirement${remaining === 1 ? " remains" : "s remain"} before this credential can be issued.` : "All requirements are complete and the credential is ready to issue."}</p></div><div className="p-6 sm:p-8"><h3 className="font-semibold">Credential requirements</h3><div className="mt-4 grid gap-3">{credential.requirements.slice(0, 3).map((item) => <div key={item.id} className="flex gap-2"><RequirementMark met={item.met} /><span className="type-body-small text-text-secondary">{item.label}</span></div>)}</div><div className="mt-6 flex flex-wrap gap-3"><ButtonLink href={appendPreviewState(`${root}/requirements`, previewState)} variant="secondary">View requirements</ButtonLink>{(credential.status === "issued" || credential.status === "eligible") && <ButtonLink href={appendPreviewState(`${root}/credentials/${credential.id}`, previewState)}>{credential.status === "issued" ? "View credential" : "Preview credential"}<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>}</div></div></div></Card>;
}

function SkillRow({ skill, href }: { skill: SkillPortfolioSnapshot["skills"][number]; href: string }) {
  return <Link href={href} className="group grid gap-4 rounded-lg border border-border-default bg-surface-default p-4 transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold group-hover:text-action-primary">{skill.name}</h3><SkillStatusBadge status={skill.status} /></div><p className="type-caption mt-1 text-text-tertiary">{skill.evidence.length} evidence items · {skill.courseTitle}</p></div><div><p className="type-caption text-text-tertiary">Competency</p><p className="mt-1 font-semibold">{skill.competencyScore}%</p></div><ArrowRight className="size-4 text-text-tertiary group-hover:text-action-primary" aria-hidden="true" /></Link>;
}
