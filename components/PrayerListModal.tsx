"use client";

import React from "react";
import { HandHeart, X } from "lucide-react";

import {
  getPrayerCountLabel,
  getTranslatedMessage,
  getUiCopy,
} from "@/lib/translation";
import type { FeedPost, LanguageCode } from "@/types";

interface PrayerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: FeedPost | null;
  language: LanguageCode;
}

export default function PrayerListModal({
  isOpen,
  onClose,
  post,
  language,
}: PrayerListModalProps) {
  if (!isOpen || !post) {
    return null;
  }

  const copy = getUiCopy(language);
  const postMessage =
    language !== "en"
      ? getTranslatedMessage(post.message, post.translations, language)
      : post.message;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/40 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-bg-warm p-4">
          <div className="flex items-center gap-2 font-bold text-primary">
            <HandHeart className="h-5 w-5" />
            <span>{getPrayerCountLabel(post.prayerCount, language)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-bg-warm"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="border-b border-bg-warm/80 bg-bg-warm/50 p-5">
          <p className="line-clamp-4 text-sm italic leading-relaxed text-text-light">
            &ldquo;{postMessage}&rdquo;
          </p>
          {language !== "en" && postMessage !== post.message ? (
            <p className="mt-2 text-xs leading-relaxed text-muted">
              <span className="font-medium">{copy.prayerList.original}:</span>{" "}
              {post.message}
            </p>
          ) : null}
        </div>

        <div className="max-h-[28rem] space-y-3 overflow-y-auto p-5">
          {post.prayers.length > 0 ? (
            post.prayers.map((prayer) => (
              <article
                key={prayer.id}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-primary">
                    {prayer.authorLabel ?? copy.postCard.communityPrayer}
                  </span>
                  <span className="text-xs text-muted">{prayer.createdAt}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-text">
                  {prayer.message}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card-bg)] p-6 text-center text-sm text-muted">
              {copy.prayerList.empty}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
