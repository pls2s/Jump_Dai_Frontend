import { Check } from "lucide-react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

export type StepStatus = "complete" | "current" | "upcoming";

export interface StepItem {
  label: string;
  description?: string;
  status: StepStatus;
}

export function Stepper({
  steps,
  label = "Progress steps",
  className,
}: {
  steps: readonly StepItem[];
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ol
        className="grid gap-4 sm:grid-cols-[repeat(var(--step-count),minmax(0,1fr))] sm:gap-0"
        style={{ "--step-count": steps.length } as CSSProperties}
      >
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="relative flex gap-3 sm:block sm:pr-4"
            aria-current={step.status === "current" ? "step" : undefined}
          >
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "absolute top-8 left-4 h-[calc(100%+0.5rem)] w-px sm:top-4 sm:left-8 sm:h-px sm:w-[calc(100%-2rem)]",
                  step.status === "complete"
                    ? "bg-action-primary"
                    : "bg-border-default",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                step.status === "complete" &&
                  "border-action-primary bg-action-primary text-text-inverse",
                step.status === "current" &&
                  "border-action-primary bg-surface-default text-action-primary ring-4 ring-blue-100",
                step.status === "upcoming" &&
                  "border-border-strong bg-surface-default text-text-tertiary",
              )}
            >
              {step.status === "complete" ? (
                <Check className="size-4" aria-label="Complete" />
              ) : (
                index + 1
              )}
            </span>
            <div className="pt-0.5 sm:mt-3 sm:pr-4">
              <p
                className={cn(
                  "type-label",
                  step.status === "upcoming"
                    ? "text-text-tertiary"
                    : "text-text-primary",
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="type-caption mt-0.5 text-text-secondary">
                  {step.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
