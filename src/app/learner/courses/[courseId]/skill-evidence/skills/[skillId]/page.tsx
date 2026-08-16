import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { SkillEvidenceDetail } from "@/features/skill-portfolio/components/skill-evidence-detail";
import { normalizePortfolioPreviewState } from "@/features/skill-portfolio/services/skill-portfolio-service";

export default async function SkillEvidenceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string; skillId: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const [{ courseId, skillId }, query] = await Promise.all([params, searchParams]);
  if (!getLearnerDemoCourse(courseId)) notFound();
  return <SkillEvidenceDetail courseId={courseId} skillId={skillId} previewState={normalizePortfolioPreviewState(query.state)} />;
}
