import { ShieldAlert, ShieldCheck } from "lucide-react";

import { Button, ButtonLink, Card, Spinner } from "@/components/ui";

export function AdminLoading({ label = "Loading Admin data" }: { label?: string }) {
  return <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite"><Spinner className="size-7" /><h2 className="type-title-large mt-5">{label}</h2><p className="type-body-small mt-2 text-text-secondary">Preparing platform users, courses, and activity…</p></Card>;
}

export function AdminError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center" role="alert"><span className="flex size-12 items-center justify-center rounded-full bg-status-error-subtle text-status-error"><ShieldAlert className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-5">Unable to load Admin data</h2><p className="type-body-small mt-2 max-w-lg text-text-secondary">{message}</p><Button className="mt-5" onClick={onRetry}>Retry</Button></Card>;
}

export function AdminEmpty({ title, description, action }: { title: string; description: string; action?: { href: string; label: string } }) {
  return <Card className="mt-8 flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><ShieldCheck className="size-6" aria-hidden="true" /></span><h2 className="type-title-large mt-5">{title}</h2><p className="type-body-small mt-2 max-w-lg text-text-secondary">{description}</p>{action && <ButtonLink href={action.href} className="mt-5">{action.label}</ButtonLink>}</Card>;
}
