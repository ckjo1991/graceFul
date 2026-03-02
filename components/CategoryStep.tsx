"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

import ShareStepShell from "@/components/ShareStepShell";
import { CATEGORIES } from "@/lib/constants";
import { getUiCopy, localizeCategory } from "@/lib/translation";
import type { Category, Emotion, LanguageCode } from "@/types";

interface CategoryStepProps {
  onClose: () => void;
  onSelect: (category: Category) => void;
  onBack: () => void;
  selectedEmotion: Emotion;
  language: LanguageCode;
}

export default function CategoryStep({
  onClose,
  onSelect,
  onBack,
  selectedEmotion,
  language,
}: CategoryStepProps) {
  const copy = getUiCopy(language);
  const hoverAccent =
    selectedEmotion === "struggling"
      ? "hover:border-[var(--struggling-rail)]"
      : "hover:border-[var(--brand)]";

  return (
    <ShareStepShell
      onClose={onClose}
      step={2}
      title={copy.categoryStep.title}
      description={copy.categoryStep.description}
    >
      <div className="space-y-3">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`w-full rounded-[0.9rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-4 text-left text-[1rem] text-[var(--ink)] transition-all hover:bg-white ${hoverAccent}`}
          >
            {localizeCategory(category, language)}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-[0.7rem] border border-[var(--shell-border)] bg-[var(--brand-soft)]/35 px-3 py-2.5 text-[0.78rem] italic leading-6 text-[var(--muted-ink)]">
        {copy.categoryStep.note}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-[0.55rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2 text-[0.92rem] text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ChevronLeft className="h-4 w-4" />
          {copy.categoryStep.back}
        </button>
      </div>
    </ShareStepShell>
  );
}
