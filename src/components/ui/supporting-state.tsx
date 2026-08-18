import { CircleAlert, Inbox, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button, ButtonLink } from "./button";
import { Card } from "./card";
import { Spinner } from "./spinner";
import { cn } from "@/lib/cn";

interface SupportingStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

export function LoadingState({
  title = "Loading",
  description = "Preparing the latest information…",
  className,
}: Partial<SupportingStateProps>) {
  return (
    <Card className={cn("mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center", className)} role="status" aria-live="polite" aria-busy="true">
      <Spinner className="size-7" />
      <h2 className="type-title-large mt-5">{title}</h2>
      <p className="type-body-small mt-2 max-w-lg text-text-secondary">{description}</p>
    </Card>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  icon,
  className,
}: SupportingStateProps & { onRetry?: () => void }) {
  return (
    <Card className={cn("mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center", className)} role="alert">
      <span className="flex size-12 items-center justify-center rounded-full bg-status-error-subtle text-status-error">{icon ?? <CircleAlert className="size-6" aria-hidden="true" />}</span>
      <h2 className="type-title-large mt-5">{title}</h2>
      <p className="type-body-small mt-2 max-w-lg text-text-secondary">{description}</p>
      {onRetry && <Button className="mt-5" onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button>}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: SupportingStateProps & { action?: { href: string; label: string } }) {
  return (
    <Card className={cn("mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">{icon ?? <Inbox className="size-6" aria-hidden="true" />}</span>
      <h2 className="type-title-large mt-5">{title}</h2>
      <p className="type-body-small mt-2 max-w-lg text-text-secondary">{description}</p>
      {action && <ButtonLink href={action.href} className="mt-5">{action.label}</ButtonLink>}
    </Card>
  );
}

export function InvalidEntityState({
  entityName,
  backHref,
  backLabel,
}: {
  entityName: string;
  backHref: string;
  backLabel: string;
}) {
  return <EmptyState title={`${entityName} not found`} description={`The ${entityName.toLowerCase()} may have been removed, or the link is invalid.`} action={{ href: backHref, label: backLabel }} />;
}
