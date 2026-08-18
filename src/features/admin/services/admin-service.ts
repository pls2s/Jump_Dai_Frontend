import { loadCreatorAnalytics } from "@/features/creator-analytics/services/creator-analytics-service";
import { buildAdminSnapshot } from "@/features/admin/lib/admin-engine";
import type { AdminPreviewState } from "@/features/admin/types";
import { shouldUseFrontendMocks } from "@/lib/config";
import { demoDelay } from "@/lib/mock/demo-services";

export class AdminWorkspaceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminWorkspaceError";
  }
}

export async function loadAdminWorkspace(previewState: AdminPreviewState = "default") {
  if (!shouldUseFrontendMocks) {
    throw new AdminWorkspaceError(
      "Admin oversight is waiting for a documented backend contract. No Admin request was sent.",
    );
  }
  await demoDelay(360);
  if (previewState === "error") {
    throw new AdminWorkspaceError("Admin data couldn’t be loaded. No platform data was changed.");
  }
  const analytics = await loadCreatorAnalytics({
    timeRange: "all",
    selectedCourseId: null,
    previewState: previewState === "empty" ? "empty" : "default",
  });
  return buildAdminSnapshot(analytics, { empty: previewState === "empty" });
}
