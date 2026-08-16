import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import type { ValidationState } from "@/components/ui/input";

const validationStyles: Record<ValidationState, string> = {
  default: "border-border-strong focus:border-border-focus focus:ring-blue-500/15",
  error: "border-status-error focus:border-status-error focus:ring-status-error/15",
  success:
    "border-status-success focus:border-status-success focus:ring-status-success/15",
};

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  validation?: ValidationState;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, validation = "default", "aria-invalid": invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full resize-y rounded-md border bg-surface-default px-3.5 py-3 text-base text-text-primary shadow-sm transition placeholder:text-text-tertiary focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-text-tertiary",
        validationStyles[validation],
        className,
      )}
      aria-invalid={invalid ?? (validation === "error" || undefined)}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
