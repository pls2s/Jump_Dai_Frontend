"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { AnalyticsTimeRange } from "@/features/creator-analytics/types";
import { loadOrganizationWorkspace } from "@/features/organization/services/organization-service";
import type { OrganizationPreviewState, OrganizationSnapshot } from "@/features/organization/types";
import { shouldUseFrontendMocks } from "@/lib/config";

const ranges: AnalyticsTimeRange[] = ["7d", "30d", "90d", "all"];
const previewStates: OrganizationPreviewState[] = ["default", "empty", "loading", "error"];

export function organizationRange(value: string | null): AnalyticsTimeRange {
  return ranges.includes(value as AnalyticsTimeRange) ? value as AnalyticsTimeRange : "30d";
}

export function organizationPreviewState(value: string | null): OrganizationPreviewState {
  return previewStates.includes(value as OrganizationPreviewState)
    ? value as OrganizationPreviewState
    : "default";
}

export function useOrganizationSnapshot({
  timeRange,
  selectedCourseId = null,
  previewState,
}: {
  timeRange: AnalyticsTimeRange;
  selectedCourseId?: string | null;
  previewState: OrganizationPreviewState;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState<OrganizationSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (shouldUseFrontendMocks && previewState === "loading") {
      setLoading(true);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setSnapshot(await loadOrganizationWorkspace({ timeRange, selectedCourseId, previewState }));
    } catch (caught) {
      setSnapshot(null);
      setError(caught instanceof Error ? caught.message : "Organization learning data couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [previewState, selectedCourseId, timeRange]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function updateQuery(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  function retry() {
    if (previewState === "error") {
      updateQuery({ state: null });
      return;
    }
    void load();
  }

  return { snapshot, loading, error, retry, updateQuery };
}
