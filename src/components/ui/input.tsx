import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type ValidationState = "default" | "error" | "success";

const validationStyles: Record<ValidationState, string> = {
  default: "border-border-strong focus:border-border-focus focus:ring-blue-500/15",
  error: "border-status-error focus:border-status-error focus:ring-status-error/15",
  success:
    "border-status-success focus:border-status-success focus:ring-status-success/15",
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  validation?: ValidationState;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, validation = "default", "aria-invalid": invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-h-11 w-full rounded-md border bg-surface-default px-3.5 py-2.5 text-base text-text-primary shadow-sm transition placeholder:text-text-tertiary focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-text-tertiary",
        validationStyles[validation],
        className,
      )}
      aria-invalid={invalid ?? (validation === "error" || undefined)}
      {...props}
    />
  ),
);

Input.displayName = "Input";
