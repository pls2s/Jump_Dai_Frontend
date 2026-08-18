import {
  creatorAnalyticsFixtures,
  creatorCourseCatalog,
} from "@/data/mock/creator-analytics";
import { readGeneratedCourseState } from "@/features/course-generation/lib/generated-course-store";
import { buildCreatorAnalyticsSnapshot } from "@/features/creator-analytics/lib/analytics-engine";
import type {
  AnalyticsPreviewState,
  AnalyticsTimeRange,
} from "@/features/creator-analytics/types";
import { shouldUseFrontendMocks } from "@/lib/config";
import { demoDelay } from "@/lib/mock/demo-services";

export class CreatorAnalyticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreatorAnalyticsError";
  }
}

function currentCatalog(previewState: AnalyticsPreviewState) {
  const catalog = creatorCourseCatalog.map((course) => {
    const stored = readGeneratedCourseState(course.id);
    return stored ? { ...course, title: stored.course.title, status: stored.lifecycle } : { ...course };
  });
  if (previewState !== "empty") return catalog;
  return catalog.map((course) => ({
    ...course,
    status: course.status === "published" ? "draft" as const : course.status,
  }));
}

export async function loadCreatorAnalytics({
  timeRange,
  selectedCourseId,
  previewState = "default",
}: {
  timeRange: AnalyticsTimeRange;
  selectedCourseId: string | null;
  previewState?: AnalyticsPreviewState;
}) {
  if (!shouldUseFrontendMocks) {
    throw new CreatorAnalyticsError(
      "Creator analytics is waiting for a documented backend endpoint. No analytics request was sent.",
    );
  }
  await demoDelay(420);
  if (previewState === "error") {
    throw new CreatorAnalyticsError(
      "Analytics couldn’t be loaded. Your course and learner prototype data are safe.",
    );
  }
  return buildCreatorAnalyticsSnapshot({
    catalog: currentCatalog(previewState),
    analytics: creatorAnalyticsFixtures,
    timeRange,
    selectedCourseId,
  });
}
