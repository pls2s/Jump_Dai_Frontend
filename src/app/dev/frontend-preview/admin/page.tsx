import { notFound } from "next/navigation";

import { AdminPreviewRedirect } from "@/features/admin/components/admin-preview-redirect";
import { isFrontendBypassEnabled } from "@/lib/config";

const allowedDestinations = new Set([
  "/admin",
  "/admin/users",
  "/admin/users/user-3",
  "/admin/courses",
  "/admin/courses/digital-marketing-foundations",
  "/admin/activity",
  "/admin?state=empty",
  "/admin?state=loading",
  "/admin?state=error",
]);

export default async function AdminPreviewEntryPage({ searchParams }: { searchParams: Promise<{ destination?: string | string[] }> }) {
  if (!isFrontendBypassEnabled) notFound();
  const requested = (await searchParams).destination;
  const destination = typeof requested === "string" && allowedDestinations.has(requested) ? requested : "/admin";
  return <AdminPreviewRedirect destination={destination} />;
}
