"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

interface OnboardingModalProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    emoji: "🌿",
    title: "Welcome to GraceFul",
    body: "A quiet, safe space where you can share what's on your heart — anonymously. Whether you're overflowing with gratitude or carrying something heavy, you are welcome here.",
    note: null,
  },
  {
    emoji: "🙏",
    title: "Share what's on your heart",
    body: "Share moments of gratitude or struggles across areas like family, finances, work, and more. Your name is never shown. Just your heart.",
    note: "You can choose whether your post can be translated for others while keeping your original wording available.",
  },
  {
    emoji: "💛",
    title: "Pray and be prayed for",
    body: "When someone shares, you can write a real, sincere prayer for them — not just tap a button. And when you share, others can lift you up in prayer too.",
    note: "Prayers are written, personal, and visible to the community.",
  },
  {
    emoji: "🏘️",
    title: "This is not a replacement",
    body: "GraceFul is a place to share, pray, and encourage — but it is not a substitute for real, physical community. Please stay connected to a local Connect Group, Ministry, or trusted person in your life.",
    note: "Let this be a supplement to community, not a replacement for it.",
    isFinal: true,
  },
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay for mount animation
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const slide = SLIDES[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
      return;
    }
    setSlideDirection("forward");
    setCurrentSlide((prev) => prev + 1);
  };

  const handleBack = () => {
    setSlideDirection("back");
    setCurrentSlide((prev) => prev - 1);
  };

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => onComplete(), 350);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-350 ${
        isVisible && !isExiting
          ? "bg-[#2c3a2e]/50 backdrop-blur-sm"
          : "bg-transparent backdrop-blur-none"
      }`}
      style={{ backdropFilter: isVisible && !isExiting ? "blur(6px)" : "blur(0px)" }}
    >
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #4a7c59 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-3xl border border-[#d4e4cc] bg-white shadow-2xl transition-all duration-350 ${
          isVisible && !isExiting
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-6 opacity-0 scale-95"
        }`}
      >
        {/* Dot indicators */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-6 bg-[#2c3a2e]"
                  : i < currentSlide
                  ? "w-2 bg-[#4a7c59]"
                  : "w-2 bg-[#d4e4cc]"
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div
          key={currentSlide}
          className="animate-in fade-in slide-in-from-bottom-3 duration-300 px-8 pt-6 pb-8 text-center"
        >
          {/* Emoji */}
          <div className="mb-5 text-5xl">{slide?.emoji}</div>

          {/* Title */}
          <h2 className="mb-4 font-serif text-2xl font-bold text-[#2c3a2e] leading-snug">
            {slide?.title}
          </h2>

          {/* Body */}
          <p className="mb-5 text-sm leading-relaxed text-[#5a6b5c]">
            {slide?.body}
          </p>

          {/* Note callout */}
          {slide?.note && (
            <div className="mb-6 rounded-xl border border-[#d4e4cc] bg-[#f5f9f4] px-4 py-3">
              <p className="text-xs italic leading-relaxed text-[#4a7c59]">
                {slide.note}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              {!isFirst && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 rounded-xl border-2 border-[#d4e4cc] bg-white px-4 py-3 text-sm font-semibold text-[#5a6b5c] transition-all hover:border-[#4a7c59] hover:text-[#4a7c59] active:scale-[0.97]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className={`flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.97] ${
                  isLast
                    ? "bg-[#2c3a2e] hover:bg-[#1b2e1d]"
                    : "bg-[#4a7c59] hover:bg-[#3d6b4c]"
                }`}
              >
                {isLast ? "I understand — Enter GraceFul 🌿" : "Next →"}
              </button>
            </div>

            {!isLast && (
              <button
                onClick={handleComplete}
                className="block w-full text-center text-xs text-[#8fa78d] underline underline-offset-2 transition-colors hover:text-[#4a7c59]"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
