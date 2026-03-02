"use client";

import React, { useEffect } from "react";
import { HandHeart, X } from "lucide-react";

import {
  getDisplayTranslatedMessage,
  getPrayerCountLabel,
  getUiCopy,
} from "@/lib/translation";
import { formatRelativeTime, lockBodyScroll, unlockBodyScroll } from "@/lib/utils";
import type { FeedPost, LanguageCode } from "@/types";

interface PrayerListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModalVisibilityChange?: (isOpen: boolean) => void;
  postId: string | null;
  posts: FeedPost[];
  language: LanguageCode;
}

export default function PrayerListModal({
  isOpen,
  onClose,
  onModalVisibilityChange,
  postId,
  posts,
  language,
}: PrayerListModalProps) {
  useEffect(() => {
    if (isOpen) {
      onModalVisibilityChange?.(true);
      lockBodyScroll();
    } else {
      unlockBodyScroll();
      onModalVisibilityChange?.(false);
    }

    return () => {
      unlockBodyScroll();
      if (isOpen) {
        onModalVisibilityChange?.(false);
      }
    };
  }, [isOpen, onModalVisibilityChange]);

  const currentPost = postId ? posts.find((post) => post.id === postId) ?? null : null;

  if (!isOpen || !currentPost) {
    return null;
  }

  const copy = getUiCopy(language);
  const postMessage =
    language !== "en"
      ? getDisplayTranslatedMessage(currentPost.message, currentPost.translations, language)
      : currentPost.message;

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
            <span>{getPrayerCountLabel(currentPost.prayers.length, language)}</span>
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
          {language !== "en" && postMessage !== currentPost.message ? (
            <p className="mt-2 text-xs leading-relaxed text-muted">
              <span className="font-medium">{copy.prayerList.original}:</span>{" "}
              {currentPost.message}
            </p>
          ) : null}
        </div>

        <div className="max-h-[28rem] space-y-3 overflow-y-auto p-5">
          {currentPost.prayers.length > 0 ? (
            currentPost.prayers.map((prayer) => (
              <article
                key={prayer.id}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-primary">
                    {prayer.authorLabel ?? copy.postCard.communityPrayer}
                  </span>
                  <span className="text-xs text-muted">
                    {formatRelativeTime(prayer.createdAt)}
                  </span>
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
