"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Card, Spinner } from "@/components/ui";
import { saveFrontendAdminPreviewSession } from "@/features/auth/lib/auth-session";

export function AdminPreviewRedirect({ destination }: { destination: string }) {
  const router = useRouter();
  useEffect(() => {
    saveFrontendAdminPreviewSession();
    router.replace(destination);
  }, [destination, router]);
  return <main className="min-h-dvh bg-background-page p-5 sm:p-8"><Card className="mx-auto flex min-h-64 max-w-3xl flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite"><Spinner className="size-7" /><h1 className="type-title-large mt-5">Opening Admin preview</h1><p className="type-body-small mt-2 text-text-secondary">Creating a development-only, system-role preview session…</p></Card></main>;
}
