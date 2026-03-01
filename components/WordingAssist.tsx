"use client";

import React, { useEffect, useState } from "react";
import { Check, RefreshCw, Sparkles } from "lucide-react";

import { type Tone, refineWording } from "@/lib/ai";

interface WordingAssistProps {
  originalMessage: string;
  onConfirm: (finalMessage: string) => void;
}

export default function WordingAssist({
  originalMessage,
  onConfirm,
}: WordingAssistProps) {
  const [currentTone, setCurrentTone] = useState<Tone>("original");
  const [displayText, setDisplayText] = useState(originalMessage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentTone("original");
    setDisplayText(originalMessage);
    setIsLoading(false);
  }, [originalMessage]);

  const handleToneChange = async (tone: Tone) => {
    setCurrentTone(tone);
    setIsLoading(true);

    const refined = await refineWording(originalMessage, tone);

    setDisplayText(refined);
    setIsLoading(false);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full rounded-3xl border-2 border-accent/30 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <Sparkles className="h-5 w-5" />
        <h3 className="text-xl font-serif font-bold">Refine your message</h3>
      </div>

      <div className="mb-6 flex rounded-xl bg-bg-warm p-1">
        {(["original", "gentle", "clear"] as Tone[]).map((tone) => (
          <button
            key={tone}
            onClick={() => handleToneChange(tone)}
            disabled={isLoading}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold capitalize transition-all ${
              currentTone === tone
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-text"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>

      <div className="relative mb-6 min-h-[150px] rounded-2xl border border-slate-100 bg-slate-50 p-4">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-50/80">
            <RefreshCw className="mb-2 h-6 w-6 animate-spin text-accent" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Polishing your words...
            </p>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
            {displayText}
          </p>
        )}
      </div>

      <button
        onClick={() => onConfirm(displayText)}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
      >
        <Check className="h-4 w-4" />
        Use this version
      </button>
    </div>
  );
}
