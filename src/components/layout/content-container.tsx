import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function ContentContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[75rem] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12",
        className,
      )}
      {...props}
    />
  );
}
