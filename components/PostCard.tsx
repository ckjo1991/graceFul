"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Heart, MoreHorizontal } from "lucide-react";

import { GuardedWriteError, insertReport, updateHearts } from "@/lib/db";
import { REPORT_REASONS } from "@/lib/reporting";
import { formatRelativeTime } from "@/lib/utils";
import type { FeedPost, LanguageCode } from "@/types";

interface PostCardProps {
  post: FeedPost;
  onPray: (postId: string) => void;
  onViewPrayers: (postId: string) => void;
  viewerLanguage: LanguageCode;
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

function unmarkPostHearted(postId: string): void {
  try {
    const existing = getHeartedPostIds();
    existing.delete(postId);
    window.localStorage.setItem(
      "graceful_hearted_posts",
      JSON.stringify(Array.from(existing)),
    );
  } catch {
    // localStorage unavailable — silent fail, optimistic state still works
  }
}

export default function PostCard(props: PostCardProps) {
  const { post, onViewPrayers } = props;
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
  const deviceId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("graceful_device_id")
      : null;
  const isOwnPost = post.deviceId === deviceId;
  const normalizedSupport =
    post.support === "encouragement" ? "just_sharing" : post.support;
  const truncatedCategory =
    post.category.length > 40 ? `${post.category.slice(0, 40)}…` : post.category;
  const truncatedPostLabel =
    post.message.length > 40 ? `${post.message.slice(0, 40)}…` : post.message;
  const needLabel = {
    prayer: "Open to prayer",
    just_sharing: "Just sharing",
    both: "Open to both",
  }[normalizedSupport] ?? "Open to both";
  const cardClass = post.emotion === "grateful"
    ? "bg-card-grateful border-card-grateful-border dark:bg-card-grateful-dark dark:border-card-grateful-border-dark"
    : "bg-card-struggling border-card-struggling-border dark:bg-card-struggling-dark dark:border-card-struggling-border-dark";
  const ownedClass = isOwnPost
    ? "bg-card-owned border-card-owned-border dark:bg-card-owned-dark dark:border-card-owned-border-dark"
    : cardClass;
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
  }, [post.id, post.hearts]);

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
    markPostHearted(post.id);
    void (async () => {
      try {
        await updateHearts(post.id, previousCount + 1);
      } catch {
        unmarkPostHearted(post.id);
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
        className={`w-full rounded-2xl border p-3 flex flex-col ${ownedClass}`}
      >
        <div className="relative flex h-full flex-col">
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

          <div className="flex flex-col gap-2 h-full">
            <div className="flex flex-wrap gap-1 mb-2 pr-8">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  post.emotion === "grateful"
                    ? "bg-[#C5E3D0] text-[#1A5E38] dark:bg-[#2A4632] dark:text-[#7EC8A0]"
                    : "bg-[#F5C5B5] text-[#7A2E1A] dark:bg-[#46281E] dark:text-[#F0A090]"
                }`}
              >
                {post.emotion === "grateful" ? "Grateful" : "Struggling"}
              </span>
              <span className="rounded-full bg-black/[0.07] px-2 py-0.5 text-[10px] text-[#5A5A55] dark:bg-white/[0.08] dark:text-[#A0A09A]">
                {post.category}
              </span>
              {isOwnPost ? (
                <span className="rounded-full bg-[#F0DFA0] px-2 py-0.5 text-[10px] font-medium text-[#6A4E00] dark:bg-[#463C16] dark:text-[#D4B060]">
                  Your post
                </span>
              ) : null}
            </div>

            <span className="text-xs text-[#9ca3af] dark:text-gray-500">
              {formatRelativeTime(post.createdAt)}
            </span>

            <div className="relative mb-2 max-h-24 overflow-hidden">
              <p className="text-[13px] leading-relaxed text-gray-900 dark:text-gray-100">
                {displayMessage}
              </p>
              <div
                className={`pointer-events-none absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t to-transparent ${
                  isOwnPost
                    ? "from-[#FEFAEC] dark:from-[#26200E]"
                    : post.emotion === "grateful"
                      ? "from-[#EAF5EE] dark:from-[#182A20]"
                      : "from-[#FEF0EB] dark:from-[#2A1810]"
                }`}
              />
            </div>

            <p className="mb-2 text-[11px] italic text-gray-400 dark:text-gray-500">
              {needLabel}
            </p>

            <div className="mt-auto flex items-center gap-2 border-t border-black/[0.08] pt-2 dark:border-white/[0.08]">
              {normalizedSupport === "just_sharing" && !isOwnPost ? (
                <button
                  type="button"
                  aria-label={`Encourage — ${heartCount} people encouraged this`}
                  onClick={handleHeartClick}
                  disabled={isHeartPending || hasHearted}
                  className={`min-h-[44px] flex items-center gap-1 text-[12px] transition-colors ${
                    hasHearted
                      ? "text-red-500"
                      : "text-gray-400 hover:text-red-500 dark:text-gray-500"
                  }`}
                >
                  <Heart
                    size={14}
                    aria-hidden="true"
                    className={hasHearted ? "fill-current" : undefined}
                  />
                  <span>{heartCount}</span>
                </button>
              ) : null}

              {normalizedSupport === "prayer" && !isOwnPost ? (
                <button
                  type="button"
                  aria-label={`${post.prayers.length} prayers — tap to view and add yours`}
                  onClick={() => onViewPrayers(post.id)}
                  className="min-h-[44px] rounded-full bg-[#1C5C3A] px-3 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-[#2A4632] dark:text-[#7EC8A0]"
                >
                  {post.prayers.length} {post.prayers.length === 1 ? "prayer" : "prayers"}
                </button>
              ) : null}

              {normalizedSupport === "both" && !isOwnPost ? (
                <>
                  <button
                    type="button"
                    aria-label={`Encourage — ${heartCount} people encouraged this`}
                    onClick={handleHeartClick}
                    disabled={isHeartPending || hasHearted}
                    className={`min-h-[44px] flex items-center gap-1 text-[12px] transition-colors ${
                      hasHearted
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500 dark:text-gray-500"
                    }`}
                  >
                    <Heart
                      size={14}
                      aria-hidden="true"
                      className={hasHearted ? "fill-current" : undefined}
                    />
                    <span>{heartCount}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${post.prayers.length} prayers — tap to view and add yours`}
                    onClick={() => onViewPrayers(post.id)}
                    className="min-h-[44px] rounded-full bg-[#1C5C3A] px-3 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-85 dark:bg-[#2A4632] dark:text-[#7EC8A0]"
                  >
                    {post.prayers.length} {post.prayers.length === 1 ? "prayer" : "prayers"}
                  </button>
                </>
              ) : null}

              {isOwnPost ? (
                <>
                  <span className="flex select-none items-center gap-1 text-[12px] text-gray-300 opacity-40 dark:text-gray-600">
                    <Heart size={14} aria-hidden="true" />
                    {heartCount}
                  </span>
                  <div className="relative ml-auto group">
                    <button
                      type="button"
                      disabled
                      aria-label="You cannot pray for your own post"
                      className="min-h-[44px] rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium text-gray-400 cursor-not-allowed dark:bg-white/[0.06] dark:text-gray-600"
                    >
                      {post.prayers.length} {post.prayers.length === 1 ? "prayer" : "prayers"}
                    </button>
                    <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                      Can&apos;t pray for your own post
                    </span>
                  </div>
                </>
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
                <p className="mt-3 text-[0.96rem] leading-7 text-[var(--text-body)]">
                  This will flag it for review.
                  <br />
                  The post stays visible until reviewed.
                </p>
                <div className="mt-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 text-left">
                  <p className="text-sm font-medium text-[var(--brand-dark)]">
                    {truncatedCategory}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--text-body)]">
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
