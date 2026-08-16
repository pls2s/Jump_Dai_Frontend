import { notFound } from "next/navigation";

import { getLearnerDemoCourse } from "@/data/mock";
import { CredentialWorkspace } from "@/features/skill-portfolio/components/credential-workspace";
import { normalizePortfolioPreviewState } from "@/features/skill-portfolio/services/skill-portfolio-service";

export default async function CredentialPage({ params, searchParams }: { params: Promise<{ courseId: string; credentialId: string }>; searchParams: Promise<{ state?: string }> }) {
  const [{ courseId, credentialId }, query] = await Promise.all([params, searchParams]);
  if (!getLearnerDemoCourse(courseId)) notFound();
  return <CredentialWorkspace courseId={courseId} credentialId={credentialId} previewState={normalizePortfolioPreviewState(query.state)} />;
}
