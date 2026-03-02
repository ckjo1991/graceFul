"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

import ShareStepShell from "@/components/ShareStepShell";
import { getUiCopy, localizeSupportType } from "@/lib/translation";
import type { LanguageCode, SupportType } from "@/types";

interface SupportStepProps {
  onClose: () => void;
  onSelect: (option: SupportType) => void;
  onBack: () => void;
  supportOptions: readonly SupportType[];
  language: LanguageCode;
}

export default function SupportStep({
  onClose,
  onSelect,
  onBack,
  supportOptions,
  language,
}: SupportStepProps) {
  const copy = getUiCopy(language);
  return (
    <ShareStepShell
      onClose={onClose}
      step={4}
      title={copy.supportStep.title}
      description={copy.supportStep.description}
    >
      <div className="space-y-3">
        {supportOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="w-full rounded-[0.9rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-4 text-left text-[1rem] text-[var(--ink)] transition-all hover:border-[var(--brand)] hover:bg-white"
          >
            {localizeSupportType(option, language)}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-[0.55rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2 text-[0.92rem] text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ChevronLeft className="h-4 w-4" />
          {copy.supportStep.back}
        </button>
      </div>
    </ShareStepShell>
  );
}
