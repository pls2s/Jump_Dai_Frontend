import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { PortfolioWorkspace } from "@/features/skill-portfolio/components/portfolio-workspace";
import { normalizePortfolioPreviewState } from "@/features/skill-portfolio/services/skill-portfolio-service";
import type { PortfolioTab } from "@/features/skill-portfolio/types";

const portfolioTabs = new Set<PortfolioTab>(["overview", "skills", "evidence", "credentials"]);

export default async function SkillEvidencePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ tab?: string; state?: string }>;
}) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  if (!getLearnerDemoCourse(courseId)) notFound();
  const tab = query.tab && portfolioTabs.has(query.tab as PortfolioTab)
    ? query.tab as PortfolioTab
    : "overview";
  return <PortfolioWorkspace courseId={courseId} initialTab={tab} previewState={normalizePortfolioPreviewState(query.state)} />;
}
