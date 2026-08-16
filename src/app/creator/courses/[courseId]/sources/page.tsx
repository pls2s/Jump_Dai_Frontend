import { notFound } from "next/navigation";
import { SourceManager } from "@/features/knowledge-sources/components/source-manager";
import { isKnownCourseRouteId } from "@/data/mock/product";

export default async function KnowledgeSourcesPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  return <SourceManager courseId={courseId} />;
}
