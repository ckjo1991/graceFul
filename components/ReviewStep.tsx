"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, LoaderCircle, ShieldCheck } from "lucide-react";

import ShareStepShell from "@/components/ShareStepShell";
import { runGuardianReview } from "@/lib/ai";
import { getUiCopy, localizeGuardianFeedback } from "@/lib/translation";
import type { LanguageCode } from "@/types";

interface ReviewStepProps {
  isPosting: boolean;
  message: string;
  onClose: () => void;
  onBack: () => void;
  onCrisisDetected: () => void;
  onPost: (finalMessage: string) => Promise<void>;
  language: LanguageCode;
}

export default function ReviewStep({
  isPosting,
  message,
  onClose,
  onBack,
  onCrisisDetected,
  onPost,
  language,
}: ReviewStepProps) {
  const copy = getUiCopy(language);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSafe, setIsSafe] = useState(true);
  const [displayMessage, setDisplayMessage] = useState("");
  const [feedback, setFeedback] = useState<string>(copy.reviewStep.initialFeedback);

  useEffect(() => {
    let isActive = true;

    const analyze = async () => {
      setIsAnalyzing(true);
      setIsSafe(true);

      try {
        const result = await runGuardianReview(message);

        if (!isActive) {
          return;
        }

        if (result.isCrisis) {
          onCrisisDetected();
          return;
        }

        setDisplayMessage(result.scrubbedMessage);
        setIsSafe(result.isSafe);
        setFeedback(localizeGuardianFeedback(result.feedback, language));
      } catch {
        if (!isActive) {
          return;
        }

        setDisplayMessage(message);
        setIsSafe(true);
        setFeedback(copy.reviewStep.fallbackFeedback);
      } finally {
        if (isActive) {
          setIsAnalyzing(false);
        }
      }
    };

    void analyze();

    return () => {
      isActive = false;
    };
  }, [copy.reviewStep.fallbackFeedback, language, message, onCrisisDetected]);

  return (
    <ShareStepShell
      onClose={onClose}
      step={6}
      title={copy.reviewStep.title}
      description={copy.reviewStep.description}
    >
      <div className="rounded-[0.75rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-3">
        {isAnalyzing ? (
          <div className="flex items-center gap-3 text-[var(--muted-ink)]">
            <LoaderCircle className="h-4 w-4 animate-spin text-[var(--brand)]" />
            <span className="text-[0.92rem]">{copy.reviewStep.reviewing}</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[0.98rem] leading-7 text-[var(--ink)]">
            {displayMessage}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[0.75rem] border border-[var(--shell-border)] bg-[var(--brand-soft)]/35 px-3 py-3 text-[0.84rem] leading-6 text-[var(--muted-ink)]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
        <span>{feedback}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-[0.55rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2.5 text-[0.92rem] text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ChevronLeft className="h-4 w-4" />
          {copy.reviewStep.back}
        </button>
        <button
          type="button"
          onClick={() => void onPost(displayMessage)}
          disabled={
            isAnalyzing || isPosting || !isSafe || !displayMessage
          }
          className="rounded-[0.55rem] bg-[var(--brand)] px-5 py-2.5 text-[0.92rem] font-medium text-white transition-colors hover:bg-[var(--brand-dark)] disabled:opacity-60"
        >
          {isPosting ? copy.reviewStep.checking : `${copy.reviewStep.share} 🌿`}
        </button>
      </div>
    </ShareStepShell>
  );
}
