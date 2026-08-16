import { forwardRef, type InputHTMLAttributes, useId } from "react";

import { cn } from "@/lib/cn";

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ id, label, description, className, disabled, ...props }, ref) => {
    const generatedId = useId();
    const controlId = id ?? generatedId;
    const descriptionId = description ? `${controlId}-description` : undefined;

    return (
      <label
        htmlFor={controlId}
        className={cn(
          "flex min-h-11 items-start gap-3 rounded-md py-2",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          className,
        )}
      >
        <input
          ref={ref}
          id={controlId}
          type="radio"
          className="mt-0.5 size-5 shrink-0 appearance-none rounded-full border-[5px] border-surface-default bg-surface-default shadow-[0_0_0_1px_var(--border-strong)] transition checked:bg-action-primary checked:shadow-[0_0_0_1px_var(--action-primary)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30 disabled:cursor-not-allowed"
          disabled={disabled}
          aria-describedby={descriptionId}
          {...props}
        />
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

Radio.displayName = "Radio";
