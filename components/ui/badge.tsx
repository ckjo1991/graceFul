import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}

