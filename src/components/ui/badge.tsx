import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant =
  | "neutral"
  | "info"
  | "accent"
  | "success"
  | "warning"
  | "error";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  info: "bg-blue-100 text-blue-800",
  accent: "bg-yellow-100 text-neutral-800",
  success: "bg-status-success-subtle text-status-success",
  warning: "bg-status-warning-subtle text-status-warning",
  error: "bg-status-error-subtle text-status-error",
};

const dotStyles: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-500",
  info: "bg-status-info",
  accent: "bg-yellow-500",
  success: "bg-status-success",
  warning: "bg-status-warning",
  error: "bg-status-error",
};

export function Badge({
  className,
  variant = "neutral",
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        badgeStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full", dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
