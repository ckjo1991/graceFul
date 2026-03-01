"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, HandHeart as HandsPraying, Send, X } from "lucide-react";

import { checkCrisis, checkSafety, scrubPII } from "@/lib/guardian";

interface PrayerModalProps {
  post: {
    id: string;
    message: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postId: string, prayerText: string) => void;
}

export default function PrayerModal({
  post,
  isOpen,
  onClose,
  onSubmit,
}: PrayerModalProps) {
  const [prayerText, setPrayerText] = useState("");
  const [guardianReason, setGuardianReason] = useState<"pii" | "malice" | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      setPrayerText("");
      setGuardianReason(null);
    }
  }, [isOpen, post?.id]);

  if (!isOpen || !post) return null;

  const handleSubmit = () => {
    const trimmedPrayer = prayerText.trim();

    if (trimmedPrayer.length > 5) {
      if (checkCrisis(trimmedPrayer)) {
        setGuardianReason("malice");
        return;
      }

      const safety = checkSafety(trimmedPrayer);

      if (!safety.isSafe) {
        setGuardianReason(safety.reason ?? "malice");
        return;
      }

      onSubmit(post.id, scrubPII(trimmedPrayer));
      setPrayerText("");
      setGuardianReason(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-bg-warm p-4">
          <div className="flex items-center gap-2 font-bold text-primary">
            <HandsPraying className="h-5 w-5" />
            <span>Write a Prayer</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-bg-warm"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-r-lg border-l-2 border-accent bg-bg-warm/50 p-4">
            <p className="line-clamp-3 text-xs italic leading-relaxed text-text-light">
              &ldquo;{post.message}&rdquo;
            </p>
          </div>

          <h3 className="mb-2 text-sm font-bold text-text">
            Your sincere prayer:
          </h3>
          <textarea
            autoFocus
            className="min-h-[150px] w-full resize-none rounded-xl border-2 border-border p-4 font-sans text-text transition-all placeholder:text-border focus:border-primary focus:ring-0"
            placeholder="Lord, I lift up this person and pray..."
            value={prayerText}
            onChange={(event) => {
              setPrayerText(event.target.value);
              if (guardianReason) {
                setGuardianReason(null);
              }
            }}
          />

          <p className="mt-3 text-[10px] leading-relaxed text-muted">
            Take a moment and write a sincere prayer. It will be shared with
            the community to encourage the person who posted.
          </p>

          {guardianReason ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-crisis">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">
                {guardianReason === "pii"
                  ? "Guardian found personal details in this prayer. Remove names or contact details before continuing."
                  : "Guardian blocked this prayer because it contains unsafe language. Please rephrase it before continuing."}
              </p>
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
            Submit Prayer
          </button>
        </div>
      </div>
    </div>
  );
}
