import { notFound } from "next/navigation";
import { AnalysisWorkspace } from "@/features/knowledge-analysis/components/analysis-workspace";
import { isKnownCourseRouteId } from "@/data/mock/product";

export default async function KnowledgeAnalysisPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ state?: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  const query = await searchParams;
  return <AnalysisWorkspace courseId={courseId} simulateFailure={query.state === "failed"} />;
}
