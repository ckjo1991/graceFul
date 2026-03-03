"use client";

import React, { useEffect, useState } from "react";
import { Flag, HandHeart, X } from "lucide-react";

import { insertPrayerReport } from "@/lib/db";
import { REPORT_REASONS, type ReportReason } from "@/lib/reporting";
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
  const [confirmingPrayerId, setConfirmingPrayerId] = useState<string | null>(null);
  const [submittingPrayerId, setSubmittingPrayerId] = useState<string | null>(null);
  const [reportedPrayerIds, setReportedPrayerIds] = useState<Record<string, true>>({});
  const [prayerReportError, setPrayerReportError] = useState<string | null>(null);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason>(
    REPORT_REASONS[0],
  );

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
  const getPrayerReportKey = (prayerId: string) =>
    currentPost ? `${currentPost.id}:${prayerId}` : prayerId;

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setConfirmingPrayerId(null);
    setSubmittingPrayerId(null);
    setPrayerReportError(null);
    setSelectedReportReason(REPORT_REASONS[0]);
  }, [isOpen]);

  const handlePrayerReport = async (prayerId: string) => {
    if (!currentPost || submittingPrayerId) {
      return;
    }

    setSubmittingPrayerId(prayerId);
    setPrayerReportError(null);

    try {
      await insertPrayerReport(prayerId, currentPost.id, selectedReportReason);
      setReportedPrayerIds((current) => ({
        ...current,
        [getPrayerReportKey(prayerId)]: true,
      }));
      setConfirmingPrayerId(null);
      setSelectedReportReason(REPORT_REASONS[0]);
    } catch {
      setPrayerReportError("Could not submit this prayer report. Please try again.");
    } finally {
      setSubmittingPrayerId(null);
    }
  };

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
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-primary">
                    {prayer.authorLabel ?? copy.postCard.communityPrayer}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {formatRelativeTime(prayer.createdAt)}
                    </span>
                    {reportedPrayerIds[getPrayerReportKey(prayer.id)] ? (
                      <span className="text-xs text-[#9ca3af]">✓</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPrayerReportError(null);
                          setSelectedReportReason(REPORT_REASONS[0]);
                          setConfirmingPrayerId(prayer.id);
                        }}
                        className="cursor-pointer text-[#9ca3af] transition-colors hover:text-[#dc2626]"
                        aria-label="Report prayer"
                      >
                        <Flag className="h-3 w-3" />
                      </button>
                    )}
                  </div>
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

      {confirmingPrayerId || submittingPrayerId ? (
        <div className="fixed inset-0 z-[60] bg-black/30">
          <div className="mx-auto mt-[30vh] max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <h3 className="text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--brand-dark)]">
              Report this prayer?
            </h3>
            <p className="mt-3 text-[0.96rem] leading-7 text-[var(--muted-ink)]">
              This will flag it for review.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReportReason(reason)}
                  disabled={Boolean(submittingPrayerId)}
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
            {prayerReportError ? (
              <p className="mt-3 text-sm text-[#dc2626]">{prayerReportError}</p>
            ) : null}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmingPrayerId(null);
                  setPrayerReportError(null);
                  setSelectedReportReason(REPORT_REASONS[0]);
                }}
                disabled={Boolean(submittingPrayerId)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--chip-border)] bg-[var(--card-bg)] px-5 py-3 text-[0.95rem] font-medium text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-default disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmingPrayerId) {
                    void handlePrayerReport(confirmingPrayerId);
                  }
                }}
                disabled={Boolean(submittingPrayerId)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#dc2626] px-5 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-[#b91c1c] disabled:cursor-default disabled:opacity-70"
              >
                Yes, report
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
