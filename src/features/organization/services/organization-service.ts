import { loadCreatorAnalytics } from "@/features/creator-analytics/services/creator-analytics-service";
import type { AnalyticsTimeRange } from "@/features/creator-analytics/types";
import { buildOrganizationSnapshot } from "@/features/organization/lib/organization-engine";
import type { OrganizationPreviewState } from "@/features/organization/types";
import { shouldUseFrontendMocks } from "@/lib/config";

export class OrganizationWorkspaceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationWorkspaceError";
  }
}

export async function loadOrganizationWorkspace({
  timeRange = "30d",
  selectedCourseId = null,
  previewState = "default",
}: {
  timeRange?: AnalyticsTimeRange;
  selectedCourseId?: string | null;
  previewState?: OrganizationPreviewState;
} = {}) {
  if (!shouldUseFrontendMocks) {
    throw new OrganizationWorkspaceError(
      "Organization learning data isn’t connected for this account yet. No organization data was changed.",
    );
  }
  if (previewState === "error") {
    throw new OrganizationWorkspaceError(
      "Organization learning data couldn’t be loaded. Your course and learner data are safe.",
    );
  }
  const analytics = await loadCreatorAnalytics({
    timeRange,
    selectedCourseId,
    previewState: previewState === "empty" ? "empty" : "default",
  });
  return buildOrganizationSnapshot(analytics, { empty: previewState === "empty" });
}
