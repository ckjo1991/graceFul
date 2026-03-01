"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

interface CategoryStepProps {
  onSelect: (category: string) => void;
  onBack: () => void;
  selectedEmotion: "grateful" | "struggling";
}

const categories = ["Financial", "Family", "Personal", "Work", "Other"];

export default function CategoryStep({
  onSelect,
  onBack,
  selectedEmotion,
}: CategoryStepProps) {
  const accentColor =
    selectedEmotion === "struggling" ? "hover:border-struggle" : "hover:border-primary";

  return (
    <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col items-start">
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-sm text-[#6b7c6d] transition-colors hover:text-[#4a7c59]"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <h2 className="text-2xl font-serif font-bold text-primary-dark">
          What area of life is this about?
        </h2>
        <p className="mt-1 text-sm text-[#6b7c6d]">
          Choose the category that fits best.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`w-full rounded-xl border-2 border-[#d4e4cc] bg-white p-4 text-left font-medium text-[#2c3a2e] transition-all hover:shadow-md active:scale-[0.98] ${accentColor}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-[#c8bea7] bg-[#f9faf7] p-4">
        <p className="text-xs italic leading-relaxed text-[#6b7c6d]">
          GraceFul is a place to share, pray, and encourage, but it is not a
          substitute for real community.
        </p>
      </div>
    </div>
  );
}
