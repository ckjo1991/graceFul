"use client";

import React from "react";
import { createPortal } from "react-dom";
import { HandHeart, MoreHorizontal, Sparkles } from "lucide-react";

import { GuardedWriteError, insertReport, updateHearts } from "@/lib/db";
import { REPORT_REASONS } from "@/lib/reporting";
import {
  getViewPrayerLabel,
  getUiCopy,
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
  work: "bg-[#f5f0fd]",
  personal: "bg-[#fdf0f8]",
};

function getPostLabel(emotion: string, category: string): string {
  const categoryLabel: Record<string, string> = {
    financial: "Financial",
    family: "Family",
    health: "Health",
    work: "Work",
    personal: "something personal",
  };
  const cat = categoryLabel[category.toLowerCase()] ?? category;

  if (emotion === "grateful") return `Grateful for ${cat}`;
  if (emotion === "struggling") return `Struggling with ${cat}`;
  return cat;
}

function getHeartedPostIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem("graceful_hearted_posts");
    const parsed = JSON.parse(raw ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function markPostHearted(postId: string): void {
  try {
    const existing = getHeartedPostIds();
    existing.add(postId);
    window.localStorage.setItem(
      "graceful_hearted_posts",
      JSON.stringify(Array.from(existing)),
    );
  } catch {
    // localStorage unavailable — silent fail, optimistic state still works
  }
}

export default function PostCard({
  post,
  onPray,
  onViewPrayers,
  viewerLanguage,
}: PostCardProps) {
  const [isReported, setIsReported] = React.useState(false);
  const [hasHearted, setHasHearted] = React.useState(false);
  const [heartCount, setHeartCount] = React.useState(post.hearts);
  const [isHeartPending, setIsHeartPending] = React.useState(false);
  const [isReportMenuOpen, setIsReportMenuOpen] = React.useState(false);
  const [reportState, setReportState] = React.useState<"idle" | "confirming" | "submitting">("idle");
  const [reportError, setReportError] = React.useState<string | null>(null);
  const [selectedReportReason, setSelectedReportReason] = React.useState<
    (typeof REPORT_REASONS)[number]
  >(REPORT_REASONS[0]);
  const reportMenuRef = React.useRef<HTMLDivElement | null>(null);
  const copy = getUiCopy(viewerLanguage);
  const isGrateful = post.emotion === "grateful";
  const postLabel = getPostLabel(post.emotion, post.category);
  const truncatedPostLabel =
    postLabel.length > 40 ? `${postLabel.slice(0, 40)}…` : postLabel;
  const postLabelClass = isGrateful ? "text-[#4a7c59]" : "text-[#4a6fa5]";
  const railClass = isGrateful
    ? "bg-[var(--grateful-rail)]"
    : "bg-[var(--struggling-rail)]";
  const cardBg = TOPIC_CARD_TINTS[post.category?.toLowerCase()] ?? "bg-white";
  const deviceId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("graceful_device_id")
      : null;
  const isOwnPost = post.deviceId === deviceId;
  const normalizedSupport =
    post.support === "encouragement" ? "just_sharing" : post.support;
  const showsPrayerButton =
    !isOwnPost &&
    (normalizedSupport === "prayer" || normalizedSupport === "both");
  const showsHeartButton =
    normalizedSupport === "just_sharing" || normalizedSupport === "both";
  const showsViewPrayerButton = post.prayers.length > 0;
  const heartLabel = heartCount === 0 ? "🤍" : `🤍 ${heartCount}`;
  const activeHeartLabel = `🩷 ${heartCount}`;
  // TODO: Translation stays parked in feed cards until the language switcher returns.
  const displayMessage = post.message;
  const showReportModal =
    reportState === "confirming" || reportState === "submitting";

  React.useEffect(() => {
    setIsReported(false);
    setIsReportMenuOpen(false);
    setReportState("idle");
    setReportError(null);
    setSelectedReportReason(REPORT_REASONS[0]);
  }, [post.id]);

  React.useEffect(() => {
    const hearted = typeof window !== "undefined"
      ? getHeartedPostIds().has(post.id)
      : false;
    setHasHearted(hearted);
    setHeartCount(post.hearts);
    setIsHeartPending(false);
  }, [post.id]);

  React.useEffect(() => {
    if (!isReportMenuOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        reportMenuRef.current &&
        !reportMenuRef.current.contains(event.target as Node)
      ) {
        setIsReportMenuOpen(false);
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [isReportMenuOpen]);

  React.useEffect(() => {
    if (!showReportModal || typeof document === "undefined") {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showReportModal]);

  const handleHeartClick = () => {
    if (hasHearted || isHeartPending) {
      return;
    }

    const previousCount = heartCount;
    const previousHearted = hasHearted;

    setHasHearted(true);
    setHeartCount((currentCount) => currentCount + 1);
    setIsHeartPending(true);
    void (async () => {
      try {
        await updateHearts(post.id, previousCount + 1);
        markPostHearted(post.id);
      } catch {
        setHasHearted(previousHearted);
        setHeartCount(previousCount);
      } finally {
        setIsHeartPending(false);
      }
    })();
  };

  const handleCancel = () => {
    setReportState("idle");
    setReportError(null);
    setSelectedReportReason(REPORT_REASONS[0]);
  };

  const handleReport = async () => {
    if (reportState === "submitting" || isReported) {
      return;
    }

    setIsReportMenuOpen(false);
    setReportState("submitting");
    setReportError(null);

    try {
      await insertReport(post.id, selectedReportReason, deviceId ?? undefined);
      setIsReported(true);
      setReportState("idle");
    } catch (error) {
      if (error instanceof GuardedWriteError && error.reason === "rate_limited") {
        setReportError("Too many reports from this device. Please try again later.");
      } else {
        setReportError("Could not submit this report. Please try again.");
      }
      setReportState("confirming");
    }
  };

  return (
    <>
      <article
        className={`mx-auto w-full max-w-[50rem] overflow-hidden rounded-[1.45rem] border border-[var(--card-border)] shadow-[0_8px_24px_rgba(57,84,61,0.04)] ${cardBg}`}
      >
        <div className="relative px-4 py-4 md:px-6 md:py-5">
          <span className={`absolute inset-y-0 left-0 w-[7px] ${railClass}`} />

          {!isOwnPost ? (
            <div ref={reportMenuRef} className="absolute right-3 top-3 z-10">
              {isReported ? (
                <span className="text-xs italic text-[#9ca3af]">✓ Reported</span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsReportMenuOpen((current) => !current)}
                    className="cursor-pointer rounded-full p-1 transition-colors hover:bg-[#f0f0ee]"
                    aria-label="Open post actions"
                  >
                    <MoreHorizontal className="h-4 w-4 text-[#9ca3af]" />
                  </button>

                  {isReportMenuOpen ? (
                    <div className="absolute right-0 top-7 min-w-[120px] rounded-xl border border-[#d4e4cc] bg-white py-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReportMenuOpen(false);
                          setReportError(null);
                          setSelectedReportReason(REPORT_REASONS[0]);
                          setReportState("confirming");
                        }}
                        className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-[#6b7c6d] transition-colors hover:bg-[#f0f7f0]"
                      >
                        🚩 Report
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className={`text-sm font-medium ${postLabelClass}`}>
                {postLabel}
                {isOwnPost ? (
                  <span className="ml-2 text-xs font-normal text-[#9ca3af]">
                    · Your post
                  </span>
                ) : null}
              </span>
              <span className="text-xs text-[#9ca3af]">
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
              {showsHeartButton ? (
                <button
                  type="button"
                  onClick={handleHeartClick}
                  disabled={isHeartPending || hasHearted}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    hasHearted
                      ? "border-[#f9a8d4] bg-[#fce7f3] text-[#be185d]"
                      : "border-[#d4e4cc] bg-white text-[#2c3a2e]"
                  }`}
                >
                  {hasHearted ? activeHeartLabel : heartLabel}
                </button>
              ) : null}

              {showsPrayerButton || showsViewPrayerButton ? (
                <div className="mt-3 flex flex-row flex-wrap gap-2">
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
              ) : null}
            </div>
          </div>
        </div>
      </article>

      {showReportModal && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center px-4"
              onClick={handleCancel}
            >
              <div
                className="relative z-50 bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--brand-dark)]">
                  Report &quot;<span className="italic">{truncatedPostLabel}</span>
                  &quot;?
                </h2>
                <p className="mt-3 text-[0.96rem] leading-7 text-[var(--muted-ink)]">
                  This will flag it for review.
                  <br />
                  The post stays visible until reviewed.
                </p>
                <div className="mt-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 text-left">
                  <p className="text-sm font-medium text-[var(--brand-dark)]">
                    {postLabel}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted-ink)]">
                    {displayMessage}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedReportReason(reason)}
                      disabled={reportState === "submitting"}
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-default disabled:opacity-70 ${
                        selectedReportReason === reason
                          ? "border-[var(--brand)] bg-[#edf5ea] text-[var(--brand-dark)]"
                          : "border-[var(--chip-border)] bg-white text-[var(--muted-ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      }`}
                      aria-pressed={selectedReportReason === reason}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                {reportError ? (
                  <p className="mt-3 text-sm text-[#dc2626]">{reportError}</p>
                ) : null}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={reportState === "submitting"}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--chip-border)] bg-[var(--card-bg)] px-5 py-3 text-[0.95rem] font-medium text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-default disabled:opacity-70"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReport()}
                    disabled={reportState === "submitting"}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-[var(--brand-dark)] disabled:cursor-default disabled:opacity-70"
                  >
                    Submit report
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
