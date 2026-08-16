import { notFound } from "next/navigation";
import { SourceManager, type SourceAddMode } from "@/features/knowledge-sources/components/source-manager";
import { isKnownCourseRouteId } from "@/data/mock/product";

export default async function KnowledgeSourcesPage({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ view?: string }> }) {
  const { courseId } = await params;
  if (!isKnownCourseRouteId(courseId)) notFound();
  const query = await searchParams;
  const initialMode: SourceAddMode = query.view === "text" || query.view === "url" ? query.view : "file";
  return <SourceManager courseId={courseId} initialMode={initialMode} />;
}
