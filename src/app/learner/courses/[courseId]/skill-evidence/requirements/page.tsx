import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { CredentialRequirementsWorkspace } from "@/features/skill-portfolio/components/credential-requirements-workspace";
import { normalizePortfolioPreviewState } from "@/features/skill-portfolio/services/skill-portfolio-service";

export default async function CredentialRequirementsPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ state?: string }> }) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  if (!getLearnerDemoCourse(courseId)) notFound();
  return <CredentialRequirementsWorkspace courseId={courseId} previewState={normalizePortfolioPreviewState(query.state)} />;
}
