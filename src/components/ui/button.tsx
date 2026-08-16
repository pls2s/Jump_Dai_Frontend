import Link, { type LinkProps } from "next/link";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-action-primary text-text-inverse shadow-sm hover:bg-action-primary-hover active:bg-action-primary-pressed",
  accent:
    "bg-action-accent text-neutral-950 shadow-sm hover:bg-action-accent-hover active:bg-yellow-600",
  secondary:
    "border border-border-strong bg-surface-default text-text-primary shadow-sm hover:bg-neutral-50 active:bg-neutral-100",
  ghost:
    "bg-transparent text-text-secondary hover:bg-neutral-100 hover:text-text-primary active:bg-neutral-200",
  danger:
    "bg-status-error text-text-inverse shadow-sm hover:bg-red-800 active:bg-red-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-10 gap-2 rounded-sm px-3.5 text-sm",
  md: "min-h-11 gap-2 rounded-md px-4 text-sm",
  lg: "min-h-12 gap-2.5 rounded-md px-5 text-base",
  icon: "size-11 rounded-md",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-border-focus/30 disabled:pointer-events-none disabled:bg-action-disabled disabled:text-text-tertiary disabled:shadow-none",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingLabel = "Loading",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      )}
      {isLoading ? <span>{loadingLabel}</span> : children}
    </button>
  ),
);

Button.displayName = "Button";

export interface ButtonLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
