"use client";

import React from "react";
import { Globe2, HandHeart, Sparkles } from "lucide-react";

import {
  getLanguageLabel,
  getViewPrayerLabel,
  getTranslatedMessage,
  getUiCopy,
  localizeCategory,
  localizeEmotion,
  localizeSupportType,
} from "@/lib/translation";
import type { FeedPost, LanguageCode } from "@/types";

interface PostCardProps {
  post: FeedPost;
  onPray: (postId: string) => void;
  onViewPrayers: (postId: string) => void;
  viewerLanguage: LanguageCode;
}

export default function PostCard({
  post,
  onPray,
  onViewPrayers,
  viewerLanguage,
}: PostCardProps) {
  const copy = getUiCopy(viewerLanguage);
  const isGrateful = post.emotion === "grateful";
  const emotionLabel = localizeEmotion(post.emotion, viewerLanguage);
  const emotionBadgeClass = isGrateful
    ? "bg-[var(--chip-grateful-bg)] text-[var(--chip-grateful-text)]"
    : "bg-[var(--chip-struggling-bg)] text-[var(--chip-struggling-text)]";
  const railClass = isGrateful
    ? "bg-[var(--grateful-rail)]"
    : "bg-[var(--struggling-rail)]";
  const canTranslate =
    post.allowTranslation &&
    viewerLanguage !== post.sourceLanguage &&
    viewerLanguage !== "en";

  const displayMessage = canTranslate
    ? getTranslatedMessage(post.message, post.translations, viewerLanguage)
    : post.message;

  return (
    <article className="relative mx-auto w-full max-w-[50rem] overflow-hidden rounded-[1.45rem] border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-4 shadow-[0_8px_24px_rgba(57,84,61,0.04)] md:px-6 md:py-5">
      <span className={`absolute inset-y-0 left-0 w-[7px] ${railClass}`} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap gap-2.5">
            <span
              className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-[0.92rem] font-medium ${emotionBadgeClass}`}
            >
              {emotionLabel}
            </span>
            <span className="inline-flex items-center rounded-full bg-[var(--chip-neutral-bg)] px-3.5 py-1.5 text-[0.92rem] font-medium text-[var(--muted-ink)]">
              {localizeCategory(post.category, viewerLanguage)}
            </span>
          </div>

          <span className="pt-1 text-[0.92rem] text-[var(--timestamp)]">
            {post.createdAt}
          </span>
        </div>

        <p className="max-w-3xl text-[1rem] leading-[1.8] tracking-[-0.01em] text-[var(--ink)] md:text-[1.08rem]">
          {displayMessage}
        </p>

        {canTranslate ? (
          <div className="rounded-[0.9rem] border border-[var(--chip-border)] bg-[var(--brand-soft)]/30 px-4 py-3 text-[0.84rem] leading-6 text-[var(--muted-ink)]">
            <p className="font-medium text-[var(--brand)]">
              {copy.postCard.translated} {getLanguageLabel(viewerLanguage)}
            </p>
            <p className="mt-1">
              <span className="font-medium">{copy.postCard.original}:</span>{" "}
              {post.message}
            </p>
          </div>
        ) : null}

        <div className="inline-flex items-center gap-2 text-[0.94rem] italic text-[var(--support-text)]">
          <Sparkles className="h-4 w-4 text-[var(--support-accent)]" />
          <span>{localizeSupportType(post.supportType, viewerLanguage)}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onPray(post.id)}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2.5 text-[0.96rem] font-medium text-white transition-colors hover:bg-[var(--brand-dark)]"
          >
            <HandHeart className="h-4 w-4" />
            {copy.postCard.pray}
          </button>

          {post.prayerCount > 0 ? (
            <button
              type="button"
              onClick={() => onViewPrayers(post.id)}
              className="inline-flex items-center rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2.5 text-[0.96rem] font-medium text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {getViewPrayerLabel(post.prayerCount, viewerLanguage)}
            </button>
          ) : null}

          {canTranslate ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2.5 text-[0.96rem] font-medium text-[var(--muted-ink)]">
              <Globe2 className="h-4 w-4" />
              {getLanguageLabel(viewerLanguage)}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
