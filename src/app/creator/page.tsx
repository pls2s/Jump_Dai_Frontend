import type { Metadata } from "next";
import { CreatorHome } from "@/features/creator/components/creator-home";

export const metadata: Metadata = { title: "Creator workspace" };
export default async function CreatorPage({ searchParams }: { searchParams: Promise<{ courseSaved?: string }> }) {
  const query = await searchParams;
  return <CreatorHome courseSaved={query.courseSaved === "1"} />;
}
