import { Building2 } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui";

export function OrganizationLoading({ label = "Loading organization data" }: { label?: string }) {
  return <LoadingState title={label} description="Preparing courses, learner progress, and skill outcomes…" />;
}

export function OrganizationError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <ErrorState title="Unable to load organization data" description={message} onRetry={onRetry} icon={<Building2 className="size-6" aria-hidden="true" />} />;
}

export function OrganizationEmpty({
  title = "No organization courses yet",
  description = "Courses associated with this workspace will appear here when they become available.",
  action,
}: {
  title?: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return <EmptyState title={title} description={description} action={action} icon={<Building2 className="size-6" aria-hidden="true" />} />;
}
