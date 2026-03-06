"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  fetchAbuseEvents,
  fetchPrayerReportCounts,
  fetchReportCounts,
  fetchReportedPosts,
  fetchReportedPrayers,
  type AbuseEventRecord,
  type ModerationReportedPost,
  type ModerationReportedPrayer,
} from "@/lib/db";
import {
  getReportReasonLabel,
  summarizeReportReasons,
} from "@/lib/reporting";
import { usePosts } from "@/lib/posts-context";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY;

type AdminTab = "all-posts" | "reported";

function formatAdminTimestamp(dateInput: string): string {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return dateInput;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function truncateText(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function maskDeviceId(deviceId: string): string {
  if (!deviceId || deviceId === "unknown") {
    return "unknown";
  }

  if (deviceId.length <= 10) {
    return deviceId;
  }

  return `${deviceId.slice(0, 6)}...${deviceId.slice(-4)}`;
}

function formatReasonSummary(
  reports: Array<{ reason: string | null; createdAt: string }>,
): string {
  return summarizeReportReasons(reports)
    .map((entry) =>
      entry.count > 1
        ? `${getReportReasonLabel(entry.reason)} (${entry.count})`
        : getReportReasonLabel(entry.reason),
    )
    .join(", ");
}

function getNarrativeLabel(emotion: string, category: string): string {
  if (emotion === "grateful") {
    return `Grateful for ${category}`;
  }

  if (emotion === "struggling") {
    return `Struggling with ${category}`;
  }

  return category;
}

function AdminPageContent() {
  const searchParams = useSearchParams();
  const { posts, deletePost, deletePrayer, deleteAllPosts } = usePosts();
  const [activeTab, setActiveTab] = useState<AdminTab>("all-posts");
  const [expandedPostIds, setExpandedPostIds] = useState<string[]>([]);
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  const [prayerReportCounts, setPrayerReportCounts] = useState<Record<string, number>>(
    {},
  );
  const [reportedPosts, setReportedPosts] = useState<ModerationReportedPost[]>([]);
  const [reportedPrayers, setReportedPrayers] = useState<ModerationReportedPrayer[]>([]);
  const [abuseEvents, setAbuseEvents] = useState<AbuseEventRecord[]>([]);
  const [isModerationLoading, setIsModerationLoading] = useState(false);
  const [moderationRefreshKey, setModerationRefreshKey] = useState(0);
  const key = searchParams.get("key");

  useEffect(() => {
    if (key !== ADMIN_KEY) {
      return;
    }

    let isActive = true;

    async function loadModerationData() {
      if (isActive) {
        setIsModerationLoading(true);
      }

      try {
        const postCounts = await fetchReportCounts();

        if (isActive) {
          setReportCounts(postCounts ?? {});
        }
      } catch (error) {
        console.error("reports count query failed:", error);

        if (isActive) {
          setReportCounts({});
        }
      }

      try {
        const prayerCounts = await fetchPrayerReportCounts();

        if (isActive) {
          setPrayerReportCounts(prayerCounts ?? {});
        }
      } catch (error) {
        console.error("prayer_reports count query failed:", error);

        if (isActive) {
          setPrayerReportCounts({});
        }
      }

      try {
        const flaggedPosts = await fetchReportedPosts();

        if (isActive) {
          setReportedPosts(flaggedPosts ?? []);
        }
      } catch (error) {
        console.error("reports query failed:", error);

        if (isActive) {
          setReportedPosts([]);
        }
      }

      try {
        const flaggedPrayers = await fetchReportedPrayers();

        if (isActive) {
          setReportedPrayers(flaggedPrayers ?? []);
        }
      } catch (error) {
        console.error("prayer_reports query failed:", error);

        if (isActive) {
          setReportedPrayers([]);
        }
      }

      try {
        const latestAbuseEvents = await fetchAbuseEvents(120);

        if (isActive) {
          setAbuseEvents(latestAbuseEvents ?? []);
        }
      } catch (error) {
        console.error("abuse_events query failed:", error);

        if (isActive) {
          setAbuseEvents([]);
        }
      } finally {
        if (isActive) {
          setIsModerationLoading(false);
        }
      }
    }

    void loadModerationData();

    return () => {
      isActive = false;
    };
  }, [key, posts, moderationRefreshKey]);

  useEffect(() => {
    if (key !== ADMIN_KEY) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setModerationRefreshKey((current) => current + 1);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [key]);

  const flaggedItems = useMemo(() => {
    return [...reportedPosts, ...reportedPrayers].sort((left, right) => {
      if (right.reportCount !== left.reportCount) {
        return right.reportCount - left.reportCount;
      }

      return (
        new Date(right.latestReportAt ?? right.createdAt).getTime() -
        new Date(left.latestReportAt ?? left.createdAt).getTime()
      );
    });
  }, [reportedPosts, reportedPrayers]);

  const abuseReasonSummary = useMemo(() => {
    const reasonCounts = new Map<string, number>();

    for (const event of abuseEvents) {
      reasonCounts.set(event.reason, (reasonCounts.get(event.reason) ?? 0) + 1);
    }

    return [...reasonCounts.entries()]
      .map(([reason, count]) => ({ reason, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);
  }, [abuseEvents]);

  const abuseDeviceSummary = useMemo(() => {
    const deviceCounts = new Map<string, number>();

    for (const event of abuseEvents) {
      const device = event.deviceId || "unknown";
      deviceCounts.set(device, (deviceCounts.get(device) ?? 0) + 1);
    }

    return [...deviceCounts.entries()]
      .map(([deviceId, count]) => ({ deviceId, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6);
  }, [abuseEvents]);

  const toggleExpandedPost = (postId: string) => {
    setExpandedPostIds((current) =>
      current.includes(postId)
        ? current.filter((id) => id !== postId)
        : [...current, postId],
    );
  };

  if (key !== ADMIN_KEY) {
    return <main>Access denied</main>;
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">
            GraceFul Admin - {posts.length} posts
          </h1>
          <button
            type="button"
            onClick={() => setModerationRefreshKey((current) => current + 1)}
            disabled={isModerationLoading}
          >
            {isModerationLoading ? "Refreshing..." : "Reload"}
          </button>
        </div>

        <div className="mb-4 flex gap-6 border-b border-[#d4e4cc]">
          <button
            type="button"
            onClick={() => setActiveTab("all-posts")}
            className={`pb-3 ${
              activeTab === "all-posts"
                ? "border-b-2 border-[#2c3a2e] font-semibold text-[#2c3a2e]"
                : "cursor-pointer text-[#6b7c6d] hover:text-[#2c3a2e]"
            }`}
          >
            All Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reported")}
            className={`pb-3 ${
              activeTab === "reported"
                ? "border-b-2 border-[#2c3a2e] font-semibold text-[#2c3a2e]"
                : "cursor-pointer text-[#6b7c6d] hover:text-[#2c3a2e]"
            }`}
          >
            Reported / Flagged
          </button>
        </div>

        {activeTab === "all-posts" ? (
          <>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Delete all posts?")) {
                    deleteAllPosts();
                  }
                }}
              >
                Delete all posts
              </button>
            </div>

            <div className="space-y-3">
              {posts.map((post) => {
                const isExpanded = expandedPostIds.includes(post.id);

                return (
                  <div
                    key={post.id}
                    className="rounded-xl border border-[#d4e4cc] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span>{formatAdminTimestamp(post.createdAt)}</span>
                          <span className="font-medium text-[#2c3a2e]">
                            {getNarrativeLabel(post.emotion, post.category)}
                          </span>
                          {reportCounts[post.id] ? (
                            <span className="text-xs font-medium text-[#dc2626]">
                              ⚠️ {reportCounts[post.id]} post report(s)
                            </span>
                          ) : null}
                          {prayerReportCounts[post.id] ? (
                            <span className="text-xs font-medium text-[#dc2626]">
                              ⚠️ {prayerReportCounts[post.id]} prayer report(s)
                            </span>
                          ) : null}
                        </div>
                        <p className="break-words text-sm text-[#2c3a2e]">
                          {truncateText(post.message, 80)}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        {post.prayers.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpandedPost(post.id)}
                          >
                            {isExpanded
                              ? "Hide prayers"
                              : `Expand (${post.prayers.length})`}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => deletePost(post.id)}
                          className="shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 space-y-2 border-t border-[#e5efe0] pt-4">
                        {post.prayers.map((prayer) => (
                          <div
                            key={prayer.id}
                            className="flex items-start justify-between gap-4 rounded-lg bg-[#f8faf7] p-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm text-[#2c3a2e]">
                                {truncateText(prayer.message, 80)}
                              </p>
                              <span className="text-xs text-[#6b7c6d]">
                                {formatAdminTimestamp(prayer.createdAt)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => deletePrayer(prayer.id)}
                              className="shrink-0"
                            >
                              Delete prayer
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {flaggedItems.length > 0 ? (
              flaggedItems.map((item) => (
                <div
                  key={item.type === "post" ? item.postId : item.prayerId}
                  className="flex items-start justify-between gap-4 rounded-xl border border-[#d4e4cc] bg-white p-4"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={
                          item.type === "post"
                            ? "rounded-full bg-[#fef3c7] px-2 py-0.5 text-xs font-medium text-[#92400e]"
                            : "rounded-full bg-[#ede9fe] px-2 py-0.5 text-xs font-medium text-[#5b21b6]"
                        }
                      >
                        {item.type === "post" ? "Post" : "Prayer"}
                      </span>
                      <span className="text-xs text-[#dc2626]">
                        ⚠️ {item.reportCount} report(s)
                      </span>
                      <span className="text-xs text-[#6b7c6d]">
                        Latest report:{" "}
                        {formatAdminTimestamp(item.latestReportAt ?? item.createdAt)}
                      </span>
                    </div>

                    <p className="break-words text-sm text-[#2c3a2e]">
                      {truncateText(item.message, 80)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7c6d]">
                      <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 font-medium text-[#b91c1c]">
                        Latest reason: {getReportReasonLabel(item.latestReportReason)}
                      </span>
                      {item.reportCount > 1 ? (
                        <span>All reasons: {formatReasonSummary(item.reports)}</span>
                      ) : null}
                    </div>

                    {item.type === "post" ? (
                      <p className="text-xs text-[#6b7c6d]">
                        {getNarrativeLabel(item.emotion, item.category)}
                      </p>
                    ) : (
                      <p className="text-xs text-[#6b7c6d]">
                        on: {truncateText(item.postMessage, 40)}
                      </p>
                    )}

                    <p className="text-xs text-[#94a3b8]">
                      Content created: {formatAdminTimestamp(item.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (item.type === "post") {
                        deletePost(item.postId);
                        return;
                      }

                      deletePrayer(item.prayerId);
                    }}
                    className="shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-[#d4e4cc] p-6 text-sm text-[#6b7c6d]">
                No reported or flagged items.
              </div>
            )}

            <div className="rounded-xl border border-[#d4e4cc] bg-white p-4">
              <h2 className="text-sm font-semibold text-[#2c3a2e]">
                Abuse attempts (blocked + auto-flagged)
              </h2>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-[#e5efe0] p-3">
                  <p className="text-xs font-medium text-[#6b7c6d]">Top reasons</p>
                  <div className="mt-2 space-y-1 text-sm text-[#2c3a2e]">
                    {abuseReasonSummary.length > 0 ? abuseReasonSummary.map((entry) => (
                      <p key={entry.reason}>
                        {entry.reason}: {entry.count}
                      </p>
                    )) : (
                      <p className="text-[#6b7c6d]">No abuse events found.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-[#e5efe0] p-3">
                  <p className="text-xs font-medium text-[#6b7c6d]">Top devices</p>
                  <div className="mt-2 space-y-1 text-sm text-[#2c3a2e]">
                    {abuseDeviceSummary.length > 0 ? abuseDeviceSummary.map((entry) => (
                      <p key={entry.deviceId}>
                        {maskDeviceId(entry.deviceId)}: {entry.count}
                      </p>
                    )) : (
                      <p className="text-[#6b7c6d]">No abuse events found.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {abuseEvents.slice(0, 20).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-[#e5efe0] bg-[#f8faf7] p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6b7c6d]">
                      <span className="rounded-full bg-[#edf5ea] px-2 py-0.5 text-[#2c3a2e]">
                        {event.entityType}
                      </span>
                      <span>{event.reason}</span>
                      <span>{formatAdminTimestamp(event.createdAt)}</span>
                      <span>device {maskDeviceId(event.deviceId)}</span>
                      {event.spamScore !== null ? <span>score {event.spamScore}</span> : null}
                    </div>
                    {event.preview ? (
                      <p className="mt-2 text-sm text-[#2c3a2e]">
                        {truncateText(event.preview, 120)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading...</main>}>
      <AdminPageContent />
    </Suspense>
  );
}
