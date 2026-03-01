"use client";

import React, { useState } from "react";
import { ChevronLeft, Info } from "lucide-react";

import { MAX_CHARS, MIN_CHARS } from "@/lib/constants";

interface MessageStepProps {
  onNext: (message: string) => void;
  onBack: () => void;
  selectedEmotion: "grateful" | "struggling";
  category: string;
  initialMessage?: string;
}

export default function MessageStep({
  onNext,
  onBack,
  selectedEmotion,
  category,
  initialMessage = "",
}: MessageStepProps) {
  const [message, setMessage] = useState(initialMessage);

  const trimmedLength = message.trim().length;
  const isTooShort = trimmedLength > 0 && trimmedLength < MIN_CHARS;
  const canContinue = trimmedLength >= MIN_CHARS;

  return (
    <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col items-start">
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-sm text-muted transition-colors hover:text-primary"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <h2 className="text-2xl font-serif font-bold text-primary-dark">
          Share what&apos;s on your heart
        </h2>
        <p className="mt-1 text-sm text-text-light">
          Write freely. Your identity will never be shown.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent bg-[#f0f7f0] p-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          {selectedEmotion === "grateful" ? "🙏 Gratitude" : "💙 Struggle"}
        </span>
        <span className="text-muted">•</span>
        <span className="text-xs font-semibold text-text">{category}</span>
      </div>

      <div className="relative">
        <textarea
          autoFocus
          className="min-h-[200px] w-full resize-none rounded-xl border-2 border-border p-4 font-sans text-text transition-all placeholder:text-border focus:border-primary focus:ring-0"
          maxLength={MAX_CHARS}
          placeholder={
            selectedEmotion === "grateful"
              ? "Tell us more about what you're grateful for..."
              : "Tell us more about what you're going through..."
          }
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <div className={`mt-2 text-right text-xs ${isTooShort ? "text-crisis" : "text-muted"}`}>
          {message.length} / {MAX_CHARS}
        </div>
      </div>

      {isTooShort ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-crisis animate-in fade-in">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Please share a bit more (at least {MIN_CHARS} characters) so others can pray
            for you meaningfully.
          </span>
        </div>
      ) : null}

      <button
        className={`mt-6 w-full rounded-xl py-4 font-bold transition-all ${
          canContinue
            ? "bg-primary text-white shadow-md hover:bg-primary-dark active:scale-[0.98]"
            : "cursor-not-allowed bg-border text-muted"
        }`}
        disabled={!canContinue}
        onClick={() => onNext(message.trim())}
      >
        Continue →
      </button>
    </div>
  );
}
