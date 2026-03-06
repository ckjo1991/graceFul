"use client";

import { useEffect, useState } from "react";

const NUDGE_COPIES = [
  "Take a moment to pause. If something here resonated with you, consider reaching out to someone you trust today.",
  "If you're part of a church community, consider letting someone there pray with you too.",
  "GraceFul can hold a quiet moment with you. Real support can walk with you beyond it.",
];

type CommunityNudgeProps = {
  onDismiss: () => void;
};

export default function CommunityNudge({ onDismiss }: CommunityNudgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copy] = useState(
    () => NUDGE_COPIES[Math.floor(Math.random() * NUDGE_COPIES.length)]!,
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });
    const timeoutId = window.setTimeout(() => {
      onDismiss();
    }, 8000);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-1/2 z-30 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
      <div
        className={`relative flex items-start gap-3 rounded-2xl border border-[#d4e4cc] bg-white px-4 py-3 shadow-lg transition-all duration-400 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        <span className="mt-0.5 text-lg" aria-hidden="true">
          🌿
        </span>
        <p className="pr-6 text-sm leading-snug text-[#2c3a2e]">{copy}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-2 text-[#9ca3af] transition-colors hover:text-[#2c3a2e]"
          aria-label="Dismiss community nudge"
        >
          ×
        </button>
      </div>
    </div>
  );
}
