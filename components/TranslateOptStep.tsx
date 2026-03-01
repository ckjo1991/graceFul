"use client";

import React from "react";
import { ChevronLeft, Globe, Languages } from "lucide-react";

interface TranslateOptStepProps {
  onSelect: (allow: boolean) => void;
  onBack: () => void;
  allowTranslation: boolean | null;
}

export default function TranslateOptStep({
  onSelect,
  onBack,
  allowTranslation,
}: TranslateOptStepProps) {
  return (
    <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col items-start">
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-sm text-muted transition-colors hover:text-primary"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <div className="mb-4 rounded-full bg-accent/20 p-3">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-primary-dark">
          Would you like to allow viewers to translate your post?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-text-light">
          If someone has set their language, your post will appear in theirs
          with your original always available.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onSelect(true)}
          className={`group flex w-full items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all ${
            allowTranslation === true
              ? "border-primary bg-white shadow-md"
              : "border-border bg-white hover:border-primary"
          }`}
        >
          <div className="rounded-lg bg-bg-warm p-2">
            <Languages className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="block font-bold text-text">
              Yes, allow translation
            </span>
            <span className="mt-1 block text-xs text-text-light">
              Help your message reach more people across different languages.
            </span>
          </div>
        </button>

        <button
          onClick={() => onSelect(false)}
          className={`group flex w-full items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all ${
            allowTranslation === false
              ? "border-struggle bg-white shadow-md"
              : "border-border bg-white hover:border-struggle"
          }`}
        >
          <div className="rounded-lg bg-bg-warm p-2">
            <span className="text-lg">🌿</span>
          </div>
          <div>
            <span className="block font-bold text-text">
              No, keep my words only
            </span>
            <span className="mt-1 block text-xs text-text-light">
              Your words will stay exactly as you wrote them.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
