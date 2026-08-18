"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { loadAdminWorkspace } from "@/features/admin/services/admin-service";
import type { AdminPreviewState, AdminSnapshot } from "@/features/admin/types";

const previewStates: AdminPreviewState[] = ["default", "empty", "loading", "error"];

export function adminPreviewState(value: string | null): AdminPreviewState {
  return previewStates.includes(value as AdminPreviewState) ? value as AdminPreviewState : "default";
}

export function useAdminSnapshot(previewState: AdminPreviewState) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (previewState === "loading") {
      setLoading(true);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setSnapshot(await loadAdminWorkspace(previewState));
    } catch (caught) {
      setSnapshot(null);
      setError(caught instanceof Error ? caught.message : "Admin data couldn’t be loaded.");
    } finally {
      setLoading(false);
    }
  }, [previewState]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function retry() {
    if (previewState === "error") {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("state");
      router.replace(next.size ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
      return;
    }
    void load();
  }

  return { snapshot, loading, error, retry };
}
