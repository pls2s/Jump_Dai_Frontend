import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LoadingState } from "@/components/ui";
import { SupportingStatesPreview } from "@/features/supporting-states/components/supporting-states-preview";
import { isFrontendBypassEnabled } from "@/lib/config";

export default function SupportingStatesPreviewPage() {
  if (!isFrontendBypassEnabled) notFound();
  return <main className="min-h-dvh bg-background-page"><Suspense fallback={<div className="mx-auto max-w-4xl p-6"><LoadingState title="Loading state previews" description="Preparing Function 20 examples…" /></div>}><SupportingStatesPreview /></Suspense></main>;
}
