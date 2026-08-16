import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import type { ValidationState } from "@/components/ui/input";

const validationStyles: Record<ValidationState, string> = {
  default: "border-border-strong focus:border-border-focus focus:ring-blue-500/15",
  error: "border-status-error focus:border-status-error focus:ring-status-error/15",
  success:
    "border-status-success focus:border-status-success focus:ring-status-success/15",
};

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  validation?: ValidationState;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, validation = "default", "aria-invalid": invalid, children, ...props }, ref) => (
    <span className="relative block">
      <select
        ref={ref}
        className={cn(
          "min-h-11 w-full appearance-none rounded-md border bg-surface-default py-2.5 pr-10 pl-3.5 text-base text-text-primary shadow-sm transition focus:outline-none focus:ring-3 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-text-tertiary",
          validationStyles[validation],
          className,
        )}
        aria-invalid={invalid ?? (validation === "error" || undefined)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-text-tertiary"
        aria-hidden="true"
      />
    </span>
  ),
);

Select.displayName = "Select";
