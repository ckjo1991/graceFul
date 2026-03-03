"use client";

import React from "react";
import { HandHeart, Sparkles } from "lucide-react";

import {
  getViewPrayerLabel,
  getUiCopy,
  localizeCategory,
  localizeEmotion,
  localizeSupportType,
} from "@/lib/translation";
import { formatRelativeTime } from "@/lib/utils";
import type { FeedPost, LanguageCode } from "@/types";

interface PostCardProps {
  post: FeedPost;
  onPray: (postId: string) => void;
  onViewPrayers: (postId: string) => void;
  viewerLanguage: LanguageCode;
}

const TOPIC_CARD_TINTS: Record<string, string> = {
  financial: "bg-[#fdf6e3]",
  family: "bg-[#f0f7f0]",
  health: "bg-[#eef4fb]",
  personal: "bg-[#fdf0f8]",
  work: "bg-[#f5f0fd]",
  other: "bg-[#f5f5f5]",
};

export default function PostCard({
  post,
  onPray,
  onViewPrayers,
  viewerLanguage,
}: PostCardProps) {
  const [hasHearted, setHasHearted] = React.useState(false);
  const [heartCount, setHeartCount] = React.useState(post.hearts);
  const copy = getUiCopy(viewerLanguage);
  const isGrateful = post.emotion === "grateful";
  const emotionLabel = localizeEmotion(post.emotion, viewerLanguage);
  const emotionBadgeClass = isGrateful
    ? "bg-[var(--chip-grateful-bg)] text-[var(--chip-grateful-text)]"
    : "bg-[var(--chip-struggling-bg)] text-[var(--chip-struggling-text)]";
  const railClass = isGrateful
    ? "bg-[var(--grateful-rail)]"
    : "bg-[var(--struggling-rail)]";
  const cardBg = TOPIC_CARD_TINTS[post.category?.toLowerCase()] ?? "bg-white";
  const showsPrayerButton = post.support === "prayer" || post.support === "both";
  const showsHeartButton =
    post.support === "just_sharing" ||
    post.support === "both" ||
    post.support === "encouragement";
  const showsViewPrayerButton = showsPrayerButton && post.prayers.length > 0;
  const heartLabel = heartCount === 0 ? "🤍" : `🤍 ${heartCount}`;
  const activeHeartLabel = `🩷 ${heartCount}`;
  // TODO: Translation stays parked in feed cards until the language switcher returns.
  const displayMessage = post.message;

  React.useEffect(() => {
    setHasHearted(false);
    setHeartCount(post.hearts);
  }, [post.hearts, post.id]);

  const handleHeartClick = () => {
    if (hasHearted) {
      return;
    }

    setHasHearted(true);
    setHeartCount((currentCount) => currentCount + 1);
  };

  return (
    <article
      className={`relative z-0 mx-auto w-full max-w-[50rem] overflow-hidden rounded-[1.45rem] border border-[var(--card-border)] px-4 py-4 shadow-[0_8px_24px_rgba(57,84,61,0.04)] md:px-6 md:py-5 ${cardBg}`}
    >
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
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        <p className="max-w-3xl text-[1rem] leading-[1.8] tracking-[-0.01em] text-[var(--ink)] md:text-[1.08rem]">
          {displayMessage}
        </p>

        <div className="inline-flex items-center gap-2 text-[0.94rem] italic text-[var(--support-text)]">
          <Sparkles className="h-4 w-4 text-[var(--support-accent)]" />
          <span>{localizeSupportType(post.support, viewerLanguage)}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {showsPrayerButton ? (
            <button
              type="button"
              onClick={() => onPray(post.id)}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2.5 text-[0.96rem] font-medium text-white transition-colors hover:bg-[var(--brand-dark)]"
            >
              <HandHeart className="h-4 w-4" />
              {copy.postCard.pray}
            </button>
          ) : null}

          {showsHeartButton ? (
            <button
              type="button"
              onClick={handleHeartClick}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                hasHearted
                  ? "border-[#f9a8d4] bg-[#fce7f3] text-[#be185d]"
                  : "border-[#d4e4cc] bg-white text-[#2c3a2e]"
              }`}
            >
              {hasHearted ? activeHeartLabel : heartLabel}
            </button>
          ) : null}

          {showsViewPrayerButton ? (
            <button
              type="button"
              onClick={() => onViewPrayers(post.id)}
              className="inline-flex items-center rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2.5 text-[0.96rem] font-medium text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {getViewPrayerLabel(post.prayers.length, viewerLanguage)}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
