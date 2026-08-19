"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Clipboard,
  ExternalLink,
  FileCheck2,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import { Badge, Button, ButtonLink, Card, Progress, Spinner, useToast } from "@/components/ui";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import type { PortfolioTab } from "@/features/skill-portfolio/types";
import { cn } from "@/lib/cn";
import {
  createApiPortfolioShare,
  getApiSkillPortfolio,
  verifyApiCredential,
  type ApiCredential,
  type ApiSkillEvidence,
  type ApiSkillPortfolio,
  type ApiVerifiedSkill,
} from "../api/skill-portfolio-api";

const tabs: Array<{ id: PortfolioTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "evidence", label: "Evidence" },
  { id: "credentials", label: "Credentials" },
];

function getAccessToken() {
  const session = getAuthSession();
  return session?.mode === "api" ? session.accessToken : null;
}

export function ApiPortfolioWorkspace({ courseId, initialTab }: { courseId: string; initialTab: PortfolioTab }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [portfolio, setPortfolio] = useState<ApiSkillPortfolio | null>(null);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/sign-in");
      return;
    }
    let active = true;
    void getApiSkillPortfolio(token)
      .then((data) => {
        if (active) setPortfolio(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "We couldn’t load your skill portfolio.");
      });
    return () => {
      active = false;
    };
  }, [router]);

  const root = `/learner/courses/${courseId}/skill-evidence`;
  const tabHref = (tab: PortfolioTab) => tab === "overview" ? root : `${root}?tab=${tab}`;

  async function copyPortfolioLink() {
    const token = getAccessToken();
    if (!token) return router.replace("/sign-in");
    setSharing(true);
    try {
      const share = await createApiPortfolioShare(token);
      await navigator.clipboard.writeText(share.share_url);
      showToast({ tone: "success", title: "Portfolio API link copied" });
    } catch (requestError) {
      showToast({ tone: "error", title: "Portfolio link wasn’t copied", description: requestError instanceof Error ? requestError.message : "Try again." });
    } finally {
      setSharing(false);
    }
  }

  if (!portfolio && !error) return <LoadingState label="Preparing your skill portfolio…" />;
  if (!portfolio) return <ErrorState title="Your portfolio can’t be loaded" description={error} />;

  const evidence = portfolio.skills.flatMap((skill) => skill.evidence);
  if (!portfolio.skills.length && !portfolio.credentials.length) {
    return <ContentContainer className="max-w-5xl"><PageHeader eyebrow="Skill portfolio" title="My Skill Portfolio" description="Verified skill evidence and credentials issued by the backend appear here." /><Card className="mt-8 px-6 py-12 text-center sm:px-10 sm:py-16"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-blue-100 text-blue-800"><FolderOpen className="size-7" aria-hidden="true" /></span><h2 className="type-h3 mt-5">No verified evidence yet</h2><p className="mx-auto mt-2 max-w-xl text-text-secondary">The API portfolio remains empty until passing practical evidence is submitted. It does not use the browser demo portfolio as a fallback.</p></Card></ContentContainer>;
  }

  return (
    <ContentContainer className="max-w-[82rem]">
      <PageHeader eyebrow="Skill portfolio" title="My Skill Portfolio" description="Verified practical evidence and issued credentials from your backend learner profile." breadcrumb={[{ label: "Learner home", href: "/learner" }, { label: "Skill portfolio" }]} actions={<Button variant="secondary" onClick={() => void copyPortfolioLink()} isLoading={sharing} loadingLabel="Creating link…"><Clipboard className="size-4" aria-hidden="true" />Copy public API link</Button>} />
      <Card className="mt-7 border-blue-200 bg-blue-50/60 p-5 sm:p-6"><div className="flex items-center gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-800 font-semibold text-white">{portfolio.learner_name.slice(0, 1).toUpperCase()}</span><div><h2 className="font-semibold text-blue-950">{portfolio.learner_name}</h2><p className="type-body-small mt-1 text-blue-900">{portfolio.skills.length} verified skills · {portfolio.credentials.length} issued credentials</p></div></div></Card>
      <nav aria-label="Portfolio sections" className="mt-7 border-b border-border-default"><ul className="flex gap-1 overflow-x-auto">{tabs.map((tab) => <li key={tab.id}><Link href={tabHref(tab.id)} aria-current={initialTab === tab.id ? "page" : undefined} className={cn("flex min-h-11 items-center border-b-2 px-4 text-sm font-semibold whitespace-nowrap focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30", initialTab === tab.id ? "border-action-primary text-action-primary" : "border-transparent text-text-secondary hover:text-text-primary")}>{tab.label}</Link></li>)}</ul></nav>
      {initialTab === "overview" && <ApiOverview portfolio={portfolio} root={root} />}
      {initialTab === "skills" && <ApiSkills portfolio={portfolio} root={root} />}
      {initialTab === "evidence" && <ApiEvidence evidence={evidence} />}
      {initialTab === "credentials" && <ApiCredentials credentials={portfolio.credentials} root={root} />}
    </ContentContainer>
  );
}

export function ApiSkillEvidenceDetail({ courseId, skillId }: { courseId: string; skillId: string }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<ApiSkillPortfolio | null>(null);
  const [error, setError] = useState("");
  const targetSkill = decodeSkillId(skillId);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return router.replace("/sign-in");
    let active = true;
    void getApiSkillPortfolio(token).then((data) => {
      if (active) setPortfolio(data);
    }).catch((requestError: unknown) => {
      if (active) setError(requestError instanceof Error ? requestError.message : "We couldn’t load your skill evidence.");
    });
    return () => { active = false; };
  }, [router]);

  if (!portfolio && !error) return <LoadingState label="Loading skill evidence…" />;
  if (!portfolio) return <ErrorState title="Skill evidence can’t be loaded" description={error} />;
  const skill = portfolio.skills.find((item) => item.skill === targetSkill);
  const root = `/learner/courses/${courseId}/skill-evidence`;
  if (!skill) return <ContentContainer className="max-w-3xl"><PageHeader title="This skill isn’t available" description="Return to your portfolio to select a skill currently verified by the backend." /><ButtonLink href={`${root}?tab=skills`} className="mt-7"><ArrowLeft className="size-4" aria-hidden="true" />Back to skills</ButtonLink></ContentContainer>;

  return <ContentContainer className="max-w-6xl"><PageHeader eyebrow="Skill evidence" title={skill.skill} description="Passing practical evidence stored by the backend supports this verified skill." breadcrumb={[{ label: "Portfolio", href: root }, { label: "Skills", href: `${root}?tab=skills` }, { label: skill.skill }]} actions={<Badge variant="success"><ShieldCheck className="size-3.5" aria-hidden="true" />Verified</Badge>} /><div className="mt-7 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]"><Card className="p-5 sm:p-6"><p className="type-caption text-text-tertiary">Competency</p><p className="mt-1 text-4xl font-semibold">{skill.competency_score}%</p><Progress className="mt-4" value={skill.competency_score} label={`${skill.skill} competency score`} /><p className="type-body-small mt-5 text-text-secondary">Backend level: {formatEnum(skill.competency_level)}</p><p className="type-caption mt-3 text-text-tertiary">{skill.evidence.length} verified evidence item{skill.evidence.length === 1 ? "" : "s"}</p></Card><Card className="p-5 sm:p-6"><div className="flex items-center gap-2"><FileCheck2 className="size-5 text-blue-800" aria-hidden="true" /><h2 className="type-title-large">Supporting evidence</h2></div><div className="mt-5 grid gap-3">{skill.evidence.map((item, index) => <EvidenceCard key={item.id} index={index} evidence={item} />)}</div></Card></div><div className="mt-6"><ButtonLink href={`${root}?tab=skills`} variant="ghost"><ArrowLeft className="size-4" aria-hidden="true" />Back to skills</ButtonLink></div></ContentContainer>;
}

export function ApiCredentialWorkspace({ courseId, credentialId }: { courseId: string; credentialId: string }) {
  const [credential, setCredential] = useState<ApiCredential | null>(null);
  const [verifiedAt, setVerifiedAt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void verifyApiCredential(credentialId).then((result) => {
      if (!active) return;
      setCredential(result.credential);
      setVerifiedAt(result.verified_at);
    }).catch((requestError: unknown) => {
      if (active) setError(requestError instanceof Error ? requestError.message : "We couldn’t verify this credential.");
    });
    return () => { active = false; };
  }, [credentialId]);

  if (!credential && !error) return <LoadingState label="Verifying credential…" />;
  if (!credential) return <ErrorState title="This credential can’t be verified" description={error} />;
  const root = `/learner/courses/${courseId}/skill-evidence`;
  return <ContentContainer className="max-w-5xl"><PageHeader eyebrow="Public credential verification" title={credential.course_title ?? formatEnum(credential.credential_type)} description="This result comes directly from the public backend verification endpoint." breadcrumb={[{ label: "Portfolio", href: root }, { label: "Credentials", href: `${root}?tab=credentials` }, { label: credential.id }]} actions={<Badge variant={credential.status === "VALID" ? "success" : "error"}>{credential.status === "VALID" ? "Valid" : "Revoked"}</Badge>} /><Card className="mt-8 overflow-hidden border-blue-200 shadow-sm"><div className="bg-blue-800 p-6 text-white sm:p-9"><Award className="size-8 text-yellow-300" aria-hidden="true" /><p className="type-caption mt-8 font-semibold tracking-[0.16em] text-blue-200 uppercase">SkillSync AI</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{formatEnum(credential.credential_type)}</h2><p className="mt-3 text-blue-100">Issued to <strong className="text-white">{credential.learner_name}</strong>{credential.course_title ? ` for ${credential.course_title}` : ""}.</p></div><dl className="grid gap-5 p-6 sm:grid-cols-2 sm:p-9"><Meta label="Credential ID" value={credential.id} /><Meta label="Status" value={formatEnum(credential.status)} /><Meta label="Issued" value={formatDate(credential.issued_at)} /><Meta label="Verified" value={formatDate(verifiedAt)} />{credential.skill && <Meta label="Skill" value={credential.skill} />}{credential.competency_score !== null && <Meta label="Competency score" value={`${credential.competency_score}%`} />}</dl></Card><div className="mt-7"><ButtonLink href={`${root}?tab=credentials`} variant="secondary"><ArrowLeft className="size-4" aria-hidden="true" />Back to credentials</ButtonLink></div></ContentContainer>;
}

export function ApiCredentialRequirementsNotice({ courseId }: { courseId: string }) {
  const root = `/learner/courses/${courseId}/skill-evidence`;
  return <ContentContainer className="max-w-4xl"><PageHeader eyebrow="Skill portfolio" title="Credential requirements" description="The current backend issues a credential automatically after passing practical evidence; it does not expose a requirement-checklist endpoint." /><Card className="mt-7 p-6 sm:p-8"><h2 className="type-title-large">Requirements are not available from the API yet</h2><p className="mt-2 text-text-secondary">This API mode does not display the browser-demo checklist as if it were backend data. View an issued credential from the Credentials tab when one exists.</p><ButtonLink href={`${root}?tab=credentials`} className="mt-6">View credentials<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card></ContentContainer>;
}

function ApiOverview({ portfolio, root }: { portfolio: ApiSkillPortfolio; root: string }) {
  return <div className="mt-7 grid gap-6"><section><h2 className="type-h3">Portfolio overview</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><Stat label="Verified skills" value={portfolio.skills.length} icon={ShieldCheck} /><Stat label="Evidence items" value={portfolio.skills.flatMap((skill) => skill.evidence).length} icon={FileCheck2} /><Stat label="Issued credentials" value={portfolio.credentials.length} icon={Award} /></div></section><section className="grid gap-6 lg:grid-cols-2"><div><p className="type-label text-action-primary">Verified skills</p><div className="mt-4 grid gap-3">{portfolio.skills.slice(0, 3).map((skill) => <SkillCard key={skill.skill} skill={skill} root={root} />)}</div></div><div><p className="type-label text-action-primary">Issued credentials</p><div className="mt-4 grid gap-3">{portfolio.credentials.slice(0, 3).map((credential) => <CredentialCard key={credential.id} credential={credential} root={root} />)}{!portfolio.credentials.length && <Card className="p-5 text-sm text-text-secondary">No credential has been issued from verified evidence yet.</Card>}</div></div></section></div>;
}

function ApiSkills({ portfolio, root }: { portfolio: ApiSkillPortfolio; root: string }) {
  return <section className="mt-7"><div><p className="type-label text-action-primary">Competency record</p><h2 className="type-h3 mt-1">Skills</h2><p className="type-body-small mt-2 text-text-secondary">Only passing practical evidence becomes a verified backend skill.</p></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{portfolio.skills.map((skill) => <SkillCard key={skill.skill} skill={skill} root={root} detailed />)}</div></section>;
}

function ApiEvidence({ evidence }: { evidence: ApiSkillEvidence[] }) {
  return <section className="mt-7"><div><p className="type-label text-action-primary">Traceable outcomes</p><h2 className="type-h3 mt-1">Evidence</h2><p className="type-body-small mt-2 text-text-secondary">Each record is submitted practical evidence returned by the backend.</p></div><Card className="mt-5 divide-y divide-border-default overflow-hidden">{evidence.map((item, index) => <EvidenceCard key={item.id} index={index} evidence={item} compact />)}</Card></section>;
}

function ApiCredentials({ credentials, root }: { credentials: ApiCredential[]; root: string }) {
  return <section className="mt-7"><div><p className="type-label text-action-primary">Verifiable records</p><h2 className="type-h3 mt-1">Credentials</h2><p className="type-body-small mt-2 text-text-secondary">Each credential links to the public backend verification result.</p></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{credentials.map((credential) => <CredentialCard key={credential.id} credential={credential} root={root} />)}{!credentials.length && <Card className="p-6 text-text-secondary">No credential has been issued yet.</Card>}</div></section>;
}

function SkillCard({ skill, root, detailed = false }: { skill: ApiVerifiedSkill; root: string; detailed?: boolean }) {
  const href = `${root}/skills/${encodeURIComponent(skill.skill)}`;
  return <Card className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{skill.skill}</h3><p className="type-caption mt-1 text-text-tertiary">{formatEnum(skill.competency_level)}</p></div><Badge variant="success"><ShieldCheck className="size-3.5" aria-hidden="true" />Verified</Badge></div><p className="mt-5 text-2xl font-semibold">{skill.competency_score}%</p><Progress className="mt-3" value={skill.competency_score} label={`${skill.skill} competency score`} size="sm" />{detailed && <p className="type-body-small mt-4 text-text-secondary">{skill.evidence.length} passing evidence item{skill.evidence.length === 1 ? "" : "s"} support this competency.</p>}<ButtonLink href={href} variant="secondary" className="mt-5 w-full">View evidence<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>;
}

function CredentialCard({ credential, root }: { credential: ApiCredential; root: string }) {
  return <Card className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="type-caption text-text-tertiary">{formatEnum(credential.credential_type)}</p><h3 className="mt-1 font-semibold">{credential.course_title ?? credential.skill ?? "SkillSync credential"}</h3></div><Badge variant={credential.status === "VALID" ? "success" : "error"}>{formatEnum(credential.status)}</Badge></div><p className="type-body-small mt-4 text-text-secondary">Issued {formatDate(credential.issued_at)}</p><ButtonLink href={`${root}/credentials/${credential.id}`} variant="secondary" className="mt-5 w-full">Verify credential<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink></Card>;
}

function EvidenceCard({ evidence, index, compact = false }: { evidence: ApiSkillEvidence; index: number; compact?: boolean }) {
  return <div className={cn("grid gap-4 p-5 sm:items-start", compact ? "sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:px-6" : "rounded-lg border border-border-default") }><span className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-800">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{evidence.evidence_title}</h3><Badge variant="success">{evidence.score}%</Badge></div><p className="type-body-small mt-1 text-text-secondary">{evidence.assessment_title} · {evidence.skill}</p><p className="type-caption mt-2 text-text-tertiary">{formatDate(evidence.submitted_at)} · {evidence.course_title}</p></div>{evidence.evidence_url && <a href={evidence.evidence_url} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center justify-center gap-1 self-center text-sm font-semibold text-action-primary hover:underline">Open evidence<ExternalLink className="size-3.5" aria-hidden="true" /></a>}</div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Award }) {
  return <Card className="p-5"><Icon className="size-5 text-blue-800" aria-hidden="true" /><p className="mt-4 text-3xl font-semibold">{value}</p><p className="type-body-small mt-1 text-text-secondary">{label}</p></Card>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><dt className="type-caption text-text-tertiary">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}

function LoadingState({ label }: { label: string }) {
  return <ContentContainer className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center"><div role="status" className="flex items-center gap-3 text-text-secondary"><Spinner />{label}</div></ContentContainer>;
}

function ErrorState({ title, description }: { title: string; description: string }) {
  return <ContentContainer className="max-w-4xl"><Card className="mt-8 p-6 sm:p-8"><h1 className="type-h1">{title}</h1><p className="type-body-large mt-3 text-text-secondary">{description}</p><ButtonLink href="/learner" className="mt-6">Back to learner home</ButtonLink></Card></ContentContainer>;
}

function decodeSkillId(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function formatEnum(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
