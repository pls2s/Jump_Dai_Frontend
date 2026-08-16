import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export function Spinner({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm text-text-secondary",
        className,
      )}
      role="status"
    >
      <LoaderCircle className="size-5 animate-spin text-action-primary" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
