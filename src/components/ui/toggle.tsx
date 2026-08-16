"use client";

import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      label,
      description,
      checked,
      defaultChecked = false,
      onCheckedChange,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    function handleClick() {
      const next = !isChecked;
      if (!isControlled) setInternalChecked(next);
      onCheckedChange?.(next);
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-4 rounded-md text-left disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        <span className="grid gap-0.5">
          <span className="type-body-small font-medium text-text-primary">
            {label}
          </span>
          {description && (
            <span className="type-caption text-text-secondary">
              {description}
            </span>
          )}
        </span>
        <span
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            isChecked ? "bg-action-primary" : "bg-neutral-300",
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-5 rounded-full bg-surface-default shadow-sm transition-transform",
              isChecked && "translate-x-5",
            )}
          />
        </span>
      </button>
    );
  },
);

Toggle.displayName = "Toggle";
