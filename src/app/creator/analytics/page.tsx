import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsWorkspace } from "@/features/creator-analytics/components/analytics-workspace";

export const metadata: Metadata = { title: "Learning analytics" };

export default function AnalyticsPage() {
  return <Suspense fallback={<AnalyticsRouteFallback />}><AnalyticsWorkspace /></Suspense>;
}

function AnalyticsRouteFallback() {
  return <div role="status" className="px-5 py-12 text-text-secondary sm:px-8">Loading analytics…</div>;
}
