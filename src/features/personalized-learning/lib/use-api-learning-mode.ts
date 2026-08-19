"use client";

import { useSyncExternalStore } from "react";

import { getAuthSession } from "@/features/auth/lib/auth-session";

/** Wait for browser storage, then choose the real learner API only for an API session. */
export function useApiLearningMode() {
  return useSyncExternalStore(
    subscribeToSessionMode,
    () => getAuthSession()?.mode === "api" ? "api" : "demo",
    () => "loading",
  );
}

function subscribeToSessionMode() {
  return () => undefined;
}
