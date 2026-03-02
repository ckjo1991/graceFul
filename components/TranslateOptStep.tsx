"use client";

import React from "react";
import { ChevronLeft, Globe2 } from "lucide-react";

import ShareStepShell from "@/components/ShareStepShell";
import { getUiCopy } from "@/lib/translation";
import type { LanguageCode } from "@/types";

interface TranslateOptStepProps {
  onClose: () => void;
  onSelect: (allow: boolean) => void;
  onBack: () => void;
  allowTranslation: boolean | null;
  language: LanguageCode;
}

export default function TranslateOptStep({
  onClose,
  onSelect,
  onBack,
  allowTranslation,
  language,
}: TranslateOptStepProps) {
  const copy = getUiCopy(language);
  return (
    <ShareStepShell
      onClose={onClose}
      step={5}
      title={copy.translateStep.title}
      description={copy.translateStep.description}
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-soft)]">
        <Globe2 className="h-6 w-6 text-[var(--brand)]" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSelect(true)}
          className={`w-full rounded-[0.9rem] border px-4 py-4 text-left transition-all ${
            allowTranslation === true
              ? "border-[var(--brand)] bg-white"
              : "border-[var(--chip-border)] bg-[var(--chip-bg)] hover:border-[var(--brand)]"
          }`}
        >
          <span className="block text-[1rem] font-semibold text-[var(--ink)]">
            {copy.translateStep.yesTitle}
          </span>
          <span className="mt-1 block text-[0.86rem] leading-6 text-[var(--muted-ink)]">
            {copy.translateStep.yesBody}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect(false)}
          className={`w-full rounded-[0.9rem] border px-4 py-4 text-left transition-all ${
            allowTranslation === false
              ? "border-[var(--brand)] bg-white"
              : "border-[var(--chip-border)] bg-[var(--chip-bg)] hover:border-[var(--brand)]"
          }`}
        >
          <span className="block text-[1rem] font-semibold text-[var(--ink)]">
            {copy.translateStep.noTitle}
          </span>
          <span className="mt-1 block text-[0.86rem] leading-6 text-[var(--muted-ink)]">
            {copy.translateStep.noBody}
          </span>
        </button>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-[0.55rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2 text-[0.92rem] text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ChevronLeft className="h-4 w-4" />
          {copy.translateStep.back}
        </button>
      </div>
    </ShareStepShell>
  );
}
