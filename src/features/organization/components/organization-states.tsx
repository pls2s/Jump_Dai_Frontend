import { Building2, RefreshCw } from "lucide-react";

import { Button, ButtonLink, Card, Spinner } from "@/components/ui";

export function OrganizationLoading({ label = "Loading organization data" }: { label?: string }) {
  return <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite"><Spinner className="size-7" /><h2 className="type-title-large mt-5">{label}</h2><p className="type-body-small mt-2 text-text-secondary">Preparing courses, learner progress, and skill outcomes…</p></Card>;
}

export function OrganizationError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center" role="alert"><span className="flex size-12 items-center justify-center rounded-full bg-status-error-subtle text-status-error"><Building2 className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-5">Unable to load organization data</h2><p className="type-body-small mt-2 max-w-lg text-text-secondary">{message}</p><Button className="mt-5" onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button></Card>;
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
  return <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Building2 className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-5">{title}</h2><p className="type-body-small mt-2 max-w-lg text-text-secondary">{description}</p>{action && <ButtonLink href={action.href} className="mt-5">{action.label}</ButtonLink>}</Card>;
}
