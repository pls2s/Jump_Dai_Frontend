import type {
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
} from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { cn } from "@/lib/cn";

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

export interface FieldLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  optional?: boolean;
}

export function FieldLabel({
  className,
  children,
  optional,
  ...props
}: FieldLabelProps) {
  return (
    <label
      className={cn("type-label text-text-primary", className)}
      {...props}
    >
      {children}
      {optional && (
        <span className="ml-1 font-normal text-text-tertiary">(optional)</span>
      )}
    </label>
  );
}

export function FieldDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("type-body-small text-text-secondary", className)} {...props} />
  );
}

export function FieldError({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "type-body-small flex items-start gap-1.5 text-status-error",
        className,
      )}
      role="alert"
      {...props}
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export function FieldSuccess({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "type-body-small flex items-start gap-1.5 text-status-success",
        className,
      )}
      {...props}
    >
      <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export function FieldGroup({
  legend,
  description,
  children,
  className,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("grid gap-3", className)}>
      <legend className="type-label text-text-primary">{legend}</legend>
      {description && (
        <p className="type-body-small -mt-1 text-text-secondary">{description}</p>
      )}
      {children}
    </fieldset>
  );
}
