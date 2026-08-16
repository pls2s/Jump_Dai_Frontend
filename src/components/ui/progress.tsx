import { cn } from "@/lib/cn";

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  className,
}: ProgressProps) {
  const safeMax = Math.max(max, 1);
  const safeValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = Math.round((safeValue / safeMax) * 100);

  return (
    <div className={cn("grid gap-2", className)}>
      {(label || showValue) && (
        <div className="type-body-small flex items-center justify-between gap-4">
          {label && <span className="font-medium text-text-primary">{label}</span>}
          {showValue && (
            <span className="ml-auto text-text-secondary">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-full bg-neutral-100",
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
        role="progressbar"
        aria-label={label ?? "Progress"}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={`${percentage}%`}
      >
        <div
          className="h-full rounded-full bg-action-accent transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
