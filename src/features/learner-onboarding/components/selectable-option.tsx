import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export function SelectableOption({
  type,
  name,
  value,
  label,
  description,
  checked,
  onChange,
  compact = false,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  compact?: boolean;
}) {
  return (
    <label className={cn(
      "relative flex cursor-pointer items-start gap-3 rounded-md border bg-surface-default text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus-within:ring-3 focus-within:ring-border-focus/30",
      compact ? "min-h-12 px-3 py-2.5" : "min-h-20 p-4",
      checked ? "border-action-primary bg-blue-50" : "border-border-default",
    )}>
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center border", type === "radio" ? "rounded-full" : "rounded-[6px]", checked ? "border-action-primary bg-action-primary text-white" : "border-border-strong bg-surface-default")}>
        {checked && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
      </span>
      <span className="min-w-0"><span className="type-body-small block font-semibold text-text-primary">{label}</span>{description && <span className="type-caption mt-1 block leading-5 text-text-secondary">{description}</span>}</span>
    </label>
  );
}
