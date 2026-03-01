"use client";

import React from "react";
import { ChevronLeft, HandHeart, MessageSquare, Sparkles } from "lucide-react";

interface SupportStepProps {
  onSelect: (option: string) => void;
  onBack: () => void;
  supportOptions: string[];
}

export default function SupportStep({
  onSelect,
  onBack,
  supportOptions,
}: SupportStepProps) {
  const getIcon = (option: string) => {
    if (option.includes("prayer") && option.includes("encouragement")) {
      return <Sparkles className="h-6 w-6 text-primary" />;
    }

    if (option.includes("prayer")) {
      return <HandHeart className="h-6 w-6 text-primary" />;
    }

    return <MessageSquare className="h-6 w-6 text-primary" />;
  };

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
        <h2 className="text-2xl font-serif font-bold text-primary-dark">
          What kind of support would you like?
        </h2>
        <p className="mt-1 text-sm text-text-light">
          Let the community know how they can support you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {supportOptions.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className="group flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-white p-6 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
          >
            <div className="rounded-xl bg-bg-warm p-3 transition-colors group-hover:bg-accent">
              {getIcon(option)}
            </div>
            <span className="font-bold text-text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
