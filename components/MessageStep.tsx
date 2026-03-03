"use client";

import React, { useState } from "react";
import { ChevronLeft, PenLine } from "lucide-react";

import ShareStepShell, {
  type ShareStepShellExitConfirmation,
} from "@/components/ShareStepShell";
import { MAX_CHARS, MIN_CHARS } from "@/lib/constants";
import { getUiCopy, localizeCategory } from "@/lib/translation";
import type { Category, Emotion, LanguageCode } from "@/types";

interface MessageStepProps {
  exitConfirmation?: ShareStepShellExitConfirmation;
  onClose: () => void;
  onNext: (message: string) => void;
  onBack: () => void;
  selectedEmotion: Emotion;
  category: Category;
  initialMessage?: string;
  language: LanguageCode;
}

export default function MessageStep({
  exitConfirmation,
  onClose,
  onNext,
  onBack,
  selectedEmotion,
  category,
  initialMessage = "",
  language,
}: MessageStepProps) {
  const copy = getUiCopy(language);
  const [message, setMessage] = useState(initialMessage);

  const trimmedLength = message.trim().length;
  const canContinue = trimmedLength >= MIN_CHARS;
  const remaining = Math.max(MIN_CHARS - trimmedLength, 0);
  const isGrateful = selectedEmotion === "grateful";
  const intro = isGrateful
    ? copy.messageStep.gratefulIntro
    : copy.messageStep.strugglingIntro;

  return (
    <ShareStepShell
      exitConfirmation={exitConfirmation}
      onClose={onClose}
      step={3}
      title={copy.messageStep.title}
      description={copy.messageStep.description}
    >
      <div className="rounded-[0.75rem] border border-[var(--chip-border)] bg-[var(--brand-soft)]/45 px-4 py-3 text-[0.98rem] text-[var(--muted-ink)]">
        <span className="italic">{intro}</span>{" "}
        <span className="font-semibold text-[var(--brand)]">
          {localizeCategory(category, language)}
        </span>
        <span className="text-[var(--shell-border)]">
          {" "}
          - {copy.messageStep.previewSuffix}
        </span>
      </div>

      <div className="mt-4">
        <textarea
          autoFocus
          className="min-h-[8.75rem] w-full resize-none rounded-[0.9rem] border border-[var(--chip-border)] bg-[var(--card-bg)] p-4 text-[0.98rem] leading-7 text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--shell-border)] focus:border-[var(--brand)]"
          maxLength={MAX_CHARS}
          placeholder={
            isGrateful
              ? copy.messageStep.gratefulPlaceholder
              : copy.messageStep.strugglingPlaceholder
          }
          spellCheck={true}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <div className="mt-2 flex items-center justify-between gap-3 text-[0.78rem]">
          <span className={canContinue ? "text-[var(--support-text)]" : "text-[var(--warning-text)]"}>
            {canContinue
              ? copy.messageStep.goodLength
              : copy.messageStep.atLeast(MIN_CHARS, remaining)}
          </span>
          <span className="text-[var(--warning-text)]">
            {message.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      {trimmedLength > 0 && !canContinue ? (
        <div className="mt-4 flex items-start gap-2 rounded-[0.7rem] border border-[var(--warning-border)] bg-[var(--warning-bg)] px-3 py-3 text-[0.84rem] leading-6 text-[var(--warning-text)]">
          <PenLine className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {copy.messageStep.tooBrief}
          </span>
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-[0.55rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2.5 text-[0.92rem] text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ChevronLeft className="h-4 w-4" />
          {copy.messageStep.back}
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onNext(message.trim())}
          className={`rounded-[0.55rem] px-5 py-2.5 text-[0.92rem] font-medium transition-colors ${
            canContinue
              ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
              : "cursor-not-allowed border border-[var(--chip-border)] bg-[var(--chip-bg)] text-[var(--muted-ink)]"
          }`}
        >
          {copy.messageStep.continue} →
        </button>
      </div>
    </ShareStepShell>
  );
}
