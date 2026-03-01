import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-[1.25rem] border border-[var(--border)] bg-[var(--input)]/60 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

export { Textarea };
