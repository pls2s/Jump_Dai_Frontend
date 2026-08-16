import { forwardRef, type InputHTMLAttributes, useId } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, description, className, disabled, ...props }, ref) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const descriptionId = description ? `${controlId}-description` : undefined;

    return (
      <label
        htmlFor={controlId}
        className={cn(
          "group flex min-h-11 items-start gap-3 rounded-md py-2 text-left",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className,
        )}
      >
        <span className="relative mt-0.5 flex size-5 shrink-0">
          <input
            ref={ref}
            id={controlId}
            type="checkbox"
            className="peer size-5 appearance-none rounded-[6px] border border-border-strong bg-surface-default transition checked:border-action-primary checked:bg-action-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30 disabled:cursor-not-allowed"
            disabled={disabled}
            aria-describedby={descriptionId}
            {...props}
          />
          <Check
            className="pointer-events-none absolute inset-0 m-auto size-3.5 text-text-inverse opacity-0 peer-checked:opacity-100"
            strokeWidth={3}
            aria-hidden="true"
          />
        </span>
        <span className="grid gap-0.5">
          <span className="type-body-small font-medium text-text-primary">
            {label}
          </span>
          {description && (
            <span
              id={descriptionId}
              className="type-caption text-text-secondary"
            >
              {description}
            </span>
          )}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
