"use client";

import React from "react";
import { X } from "lucide-react";

interface ShareStepShellProps {
  children: React.ReactNode;
  description: React.ReactNode;
  onClose?: () => void;
  step: number;
  title: React.ReactNode;
  totalSteps?: number;
}

export default function ShareStepShell({
  children,
  description,
  onClose,
  step,
  title,
  totalSteps = 5,
}: ShareStepShellProps) {
  return (
    <div className="mx-auto w-full max-w-[32rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[2rem] border border-[var(--shell-border)] bg-[var(--share-shell-bg)] p-4 shadow-[0_20px_50px_rgba(57,84,61,0.08)]">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const isActive = index < step;

              return (
                <span
                  key={index}
                  className={`h-[6px] rounded-full transition-all ${
                    isActive
                      ? "w-4 bg-[var(--brand)]"
                      : "w-[6px] bg-[var(--dot-muted)]"
                  }`}
                />
              );
            })}
          </div>

          {onClose ? (
            <button
              type="button"
              aria-label="Close sharing flow"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted-ink)] transition-colors hover:bg-[var(--card-bg)] hover:text-[var(--brand)]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="rounded-[1.35rem] border border-[var(--shell-border)] bg-[var(--card-bg)] p-5 md:p-6">
          <header className="mb-6">
            <h2 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--brand-dark)]">
              {title}
            </h2>
            <p className="mt-3 text-[0.96rem] leading-7 text-[var(--muted-ink)]">
              {description}
            </p>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
