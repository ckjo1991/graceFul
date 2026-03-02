"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, HandHeart as HandsPraying, Send, X } from "lucide-react";

import { validatePrayerSubmission } from "@/lib/prayer";
import {
  getDisplayTranslatedMessage,
  getUiCopy,
} from "@/lib/translation";
import type { FeedPost, LanguageCode } from "@/types";

interface PrayerModalProps {
  post: Pick<FeedPost, "id" | "message"> | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postId: string, prayerText: string) => void;
  language: LanguageCode;
  postTranslations?: FeedPost["translations"];
}

type GuardianWarning = "crisis" | "malice" | "profanity" | "pii" | null;

export default function PrayerModal({
  post,
  isOpen,
  onClose,
  onSubmit,
  language,
  postTranslations = {},
}: PrayerModalProps) {
  const copy = getUiCopy(language);
  const [prayerText, setPrayerText] = useState("");
  const [guardianReason, setGuardianReason] = useState<GuardianWarning>(null);

  useEffect(() => {
    if (!isOpen) {
      setPrayerText("");
      setGuardianReason(null);
    }
  }, [isOpen, post?.id]);

  if (!isOpen || !post) return null;

  const handleAttemptClose = () => {
    const hasDraft = prayerText.trim().length > 0;

    if (hasDraft) {
      const shouldClose = window.confirm(
        copy.prayerModal.confirmClose,
      );

      if (!shouldClose) {
        return;
      }
    }

    onClose();
  };

  const handleSubmit = () => {
    const result = validatePrayerSubmission(prayerText);
    if (!result.allowed) {
      if (result.reason !== "too_short") {
        setGuardianReason(result.reason);
      }
      return;
    }

    onSubmit(post.id, result.sanitizedText);
    setPrayerText("");
    setGuardianReason(null);
  };

  const getWarningMessage = (): string => {
    switch (guardianReason) {
      case "crisis":
        return copy.prayerModal.warningCrisis;
      case "profanity":
        return copy.prayerModal.warningProfanity;
      case "malice":
        return copy.prayerModal.warningMalice;
      case "pii":
        return copy.prayerModal.warningPii;
      default:
        return copy.prayerModal.warningDefault;
    }
  };

  const postMessage =
    language !== "en"
      ? getDisplayTranslatedMessage(post.message, postTranslations, language)
      : post.message;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/40 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          handleAttemptClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-bg-warm p-4">
          <div className="flex items-center gap-2 font-bold text-primary">
            <HandsPraying className="h-5 w-5" />
            <span>{copy.prayerModal.title}</span>
          </div>
          <button
            onClick={handleAttemptClose}
            className="rounded-full p-2 transition-colors hover:bg-bg-warm"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-r-lg border-l-2 border-accent bg-bg-warm/50 p-4">
            <p className="line-clamp-3 text-xs italic leading-relaxed text-text-light">
              &ldquo;{postMessage}&rdquo;
            </p>
          </div>

          <h3 className="mb-2 text-sm font-bold text-text">
            {copy.prayerModal.prompt}
          </h3>
          <textarea
            autoFocus
            className="min-h-[150px] w-full resize-none rounded-xl border-2 border-border p-4 font-sans text-text transition-all placeholder:text-border focus:border-primary focus:ring-0"
            placeholder={copy.prayerModal.placeholder}
            value={prayerText}
            onChange={(event) => {
              setPrayerText(event.target.value);
              if (guardianReason) {
                setGuardianReason(null);
              }
            }}
          />

          <p className="mt-3 text-[10px] leading-relaxed text-muted">
            {copy.prayerModal.helper}
          </p>

          {guardianReason ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-crisis">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">{getWarningMessage()}</p>
            </div>
          ) : null}

          <button
            disabled={prayerText.trim().length < 5}
            onClick={handleSubmit}
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold transition-all ${
              prayerText.trim().length >= 5
                ? "bg-primary text-white shadow-md hover:bg-primary-dark active:scale-[0.98]"
                : "cursor-not-allowed bg-border text-muted"
            }`}
          >
            <Send className="h-4 w-4" />
            {copy.prayerModal.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
