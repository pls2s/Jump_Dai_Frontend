import { ShieldAlert, ShieldCheck } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui";

export function AdminLoading({ label = "Loading Admin data" }: { label?: string }) {
  return <LoadingState title={label} description="Preparing platform users, courses, and activity…" />;
}

export function AdminError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <ErrorState title="Unable to load Admin data" description={message} onRetry={onRetry} icon={<ShieldAlert className="size-6" aria-hidden="true" />} />;
}

export function AdminEmpty({ title, description, action }: { title: string; description: string; action?: { href: string; label: string } }) {
  return <EmptyState title={title} description={description} action={action} icon={<ShieldCheck className="size-6" aria-hidden="true" />} />;
}
