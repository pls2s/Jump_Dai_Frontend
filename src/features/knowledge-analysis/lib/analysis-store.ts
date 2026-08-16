const analysisStoragePrefix = "skillsync-analysis-complete:";

export function markAnalysisComplete(courseId: string) {
  localStorage.setItem(`${analysisStoragePrefix}${courseId}`, new Date().toISOString());
}

export function hasCompletedAnalysis(courseId: string) {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(`${analysisStoragePrefix}${courseId}`));
}
