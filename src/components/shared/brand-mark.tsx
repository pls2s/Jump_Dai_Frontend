import { Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";

export function BrandMark({
  compact = false,
  inverse = false,
  className,
}: {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-action-primary text-text-inverse shadow-sm">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className={cn("type-title-medium tracking-[-0.02em]", inverse ? "text-white" : "text-text-primary")}>
          SkillSync <span className={inverse ? "text-yellow-300" : "text-action-primary"}>AI</span>
        </span>
      )}
    </div>
  );
}
