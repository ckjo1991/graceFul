import { generateTranslations } from "@/lib/translation";
import type { FeedPost, Prayer } from "@/types";

import {
  normalizeReportReason,
  sortReportsByCreatedAtDesc,
  type ModerationReportRecord,
  type ReportReason,
} from "./reporting";
import { supabase } from "./supabase";

type PrayerRow = {
  id: string;
  message: string;
  created_at: string;
};

type JoinedPostRow = {
  id: string;
  message: string;
  emotion: FeedPost["emotion"];
  category: FeedPost["category"];
  created_at: string;
};

type ReportsWithPostRow = {
  id: string;
  post_id: string | null;
  reason?: string | null;
  created_at: string;
  posts: JoinedPostRow | JoinedPostRow[] | null;
};

type JoinedPrayerRow = {
  id: string;
  message: string;
  post_id: string;
  created_at: string;
  posts: Pick<JoinedPostRow, "message"> | Array<Pick<JoinedPostRow, "message">> | null;
};

type PrayerReportsWithPrayerRow = {
  id: string;
  prayer_id: string | null;
  reason?: string | null;
  created_at: string;
  prayers: JoinedPrayerRow | JoinedPrayerRow[] | null;
};

type ReportRow = {
  post_id: string | null;
  reason?: string | null;
  created_at?: string | null;
};

type SupabaseQueryError = {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
};

type PostRow = {
  id: string;
  emotion: FeedPost["emotion"];
  category: FeedPost["category"];
  message: string;
  support: FeedPost["support"];
  created_at: string;
  device_id: string | null;
  wants_follow_up: boolean | null;
  hearts: number | null;
  allow_translation: boolean | null;
  prayers?: PrayerRow[] | null;
};

export type ModerationReportedPost = {
  type: "post";
  postId: string;
  reportCount: number;
  latestReportAt: string | null;
  latestReportReason: string | null;
  reports: ModerationReportRecord[];
  message: string;
  emotion: FeedPost["emotion"];
  category: FeedPost["category"];
  createdAt: string;
};

export type ModerationReportedPrayer = {
  type: "prayer";
  prayerId: string;
  postId: string;
  reportCount: number;
  latestReportAt: string | null;
  latestReportReason: string | null;
  reports: ModerationReportRecord[];
  message: string;
  postMessage: string;
  createdAt: string;
};

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function isMissingReasonColumnError(error: SupabaseQueryError | null): boolean {
  if (!error) {
    return false;
  }

  const details = `${error.code ?? ""} ${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  return details.includes("reason") && details.includes("column");
}

export async function fetchPosts(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, prayers(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as PostRow[];

  return rows.map((row) => {
    const allowTranslation = row.allow_translation ?? true;

    return {
      id: row.id,
      emotion: row.emotion,
      category: row.category,
      message: row.message,
      support: row.support,
      createdAt: row.created_at,
      deviceId: row.device_id ?? undefined,
      wantsFollowUp: row.wants_follow_up ?? false,
      hearts: row.hearts ?? 0,
      allowTranslation,
      sourceLanguage: "en",
      translations: allowTranslation ? generateTranslations(row.message) : {},
      prayers: (row.prayers ?? []).map((prayer) => ({
        id: prayer.id,
        message: prayer.message,
        createdAt: prayer.created_at,
        authorLabel: "Community prayer",
      })),
    };
  });
}

export async function insertPost(post: FeedPost): Promise<void> {
  const { error } = await supabase.from("posts").insert({
    id: post.id,
    emotion: post.emotion,
    category: post.category,
    message: post.message,
    support: post.support,
    created_at: new Date().toISOString(),
    device_id: post.deviceId,
    wants_follow_up: post.wantsFollowUp,
    hearts: post.hearts ?? 0,
    allow_translation: post.allowTranslation ?? true,
  });

  if (error) {
    throw error;
  }
}

export async function insertPrayer(postId: string, prayer: Prayer): Promise<void> {
  const { error } = await supabase.from("prayers").insert({
    id: prayer.id,
    post_id: postId,
    message: prayer.message,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

export async function insertReport(
  postId: string,
  reason: ReportReason,
): Promise<void> {
  const payload = {
    id: crypto.randomUUID(),
    post_id: postId,
    reason,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("reports").insert(payload);

  if (error) {
    if (isMissingReasonColumnError(error)) {
      const { error: fallbackError } = await supabase.from("reports").insert({
        id: payload.id,
        post_id: payload.post_id,
        created_at: payload.created_at,
      });

      if (!fallbackError) {
        return;
      }

      throw fallbackError;
    }

    throw error;
  }
}

export async function insertPrayerReport(
  prayerId: string,
  postId: string,
  reason: ReportReason,
): Promise<void> {
  const payload = {
    id: crypto.randomUUID(),
    prayer_id: prayerId,
    post_id: postId,
    reason,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("prayer_reports").insert(payload);

  if (error) {
    if (isMissingReasonColumnError(error)) {
      const { error: fallbackError } = await supabase.from("prayer_reports").insert({
        id: payload.id,
        prayer_id: payload.prayer_id,
        post_id: payload.post_id,
        created_at: payload.created_at,
      });

      if (!fallbackError) {
        return;
      }

      throw fallbackError;
    }

    throw error;
  }
}

export async function fetchReportCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("reports").select("*");

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReportRow[]).reduce<Record<string, number>>((counts, row) => {
    if (!row.post_id) {
      return counts;
    }

    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
    return counts;
  }, {});
}

export async function fetchPrayerReportCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("prayer_reports").select("*");

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReportRow[]).reduce<Record<string, number>>((counts, row) => {
    if (!row.post_id) {
      return counts;
    }

    counts[row.post_id] = (counts[row.post_id] ?? 0) + 1;
    return counts;
  }, {});
}

export async function deletePostById(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deletePrayer(id: string): Promise<void> {
  const { error } = await supabase.from("prayers").delete().eq("id", id);

  if (error) {
    console.error("[GraceFul] deletePrayer failed:", error);
  }
}

export async function deleteAllPosts(): Promise<void> {
  const { error } = await supabase.from("posts").delete().neq("id", "");

  if (error) {
    throw error;
  }
}

export async function updateHearts(postId: string, hearts: number): Promise<void> {
  const { error } = await supabase.from("posts").update({ hearts }).eq("id", postId);

  if (error) {
    throw error;
  }
}

export async function fetchReportedPosts(): Promise<ModerationReportedPost[]> {
  const baseQuery = supabase
    .from("reports")
    .select("id, post_id, reason, created_at, posts!inner(id, message, emotion, category, created_at)");
  let { data, error } = await baseQuery;

  if (error && isMissingReasonColumnError(error)) {
    const fallbackResult = await supabase
      .from("reports")
      .select("id, post_id, created_at, posts!inner(id, message, emotion, category, created_at)");

    data =
      fallbackResult.data?.map((row) => ({
        ...row,
        reason: null,
      })) ?? null;
    error = fallbackResult.error;
  }

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ReportsWithPostRow[];
  const grouped = new Map<string, ModerationReportedPost>();

  for (const row of rows) {
    const post = getSingleRelation(row.posts);

    if (!row.post_id || !post) {
      continue;
    }

    const existing = grouped.get(row.post_id);
    const reportRecord: ModerationReportRecord = {
      id: row.id,
      reason: normalizeReportReason(row.reason),
      createdAt: row.created_at,
    };

    if (existing) {
      existing.reportCount += 1;
      existing.reports = sortReportsByCreatedAtDesc([
        ...existing.reports,
        reportRecord,
      ]);
      existing.latestReportAt = existing.reports[0]?.createdAt ?? null;
      existing.latestReportReason = existing.reports[0]?.reason ?? null;
      continue;
    }

    grouped.set(row.post_id, {
      type: "post",
      postId: row.post_id,
      reportCount: 1,
      latestReportAt: reportRecord.createdAt,
      latestReportReason: reportRecord.reason,
      reports: [reportRecord],
      message: post.message,
      emotion: post.emotion,
      category: post.category,
      createdAt: post.created_at,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => {
    if (right.reportCount !== left.reportCount) {
      return right.reportCount - left.reportCount;
    }

    return (
      new Date(right.latestReportAt ?? 0).getTime() -
      new Date(left.latestReportAt ?? 0).getTime()
    );
  });
}

export async function fetchReportedPrayers(): Promise<ModerationReportedPrayer[]> {
  const baseQuery = supabase
    .from("prayer_reports")
    .select(
      "id, prayer_id, reason, created_at, prayers!inner(id, message, post_id, created_at, posts!inner(message))",
    );
  let { data, error } = await baseQuery;

  if (error && isMissingReasonColumnError(error)) {
    const fallbackResult = await supabase
      .from("prayer_reports")
      .select(
        "id, prayer_id, created_at, prayers!inner(id, message, post_id, created_at, posts!inner(message))",
      );

    data =
      fallbackResult.data?.map((row) => ({
        ...row,
        reason: null,
      })) ?? null;
    error = fallbackResult.error;
  }

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as PrayerReportsWithPrayerRow[];
  const grouped = new Map<string, ModerationReportedPrayer>();

  for (const row of rows) {
    const prayer = getSingleRelation(row.prayers);
    const parentPost = getSingleRelation(prayer?.posts);

    if (!row.prayer_id || !prayer || !parentPost) {
      continue;
    }

    const existing = grouped.get(row.prayer_id);
    const reportRecord: ModerationReportRecord = {
      id: row.id,
      reason: normalizeReportReason(row.reason),
      createdAt: row.created_at,
    };

    if (existing) {
      existing.reportCount += 1;
      existing.reports = sortReportsByCreatedAtDesc([
        ...existing.reports,
        reportRecord,
      ]);
      existing.latestReportAt = existing.reports[0]?.createdAt ?? null;
      existing.latestReportReason = existing.reports[0]?.reason ?? null;
      continue;
    }

    grouped.set(row.prayer_id, {
      type: "prayer",
      prayerId: row.prayer_id,
      postId: prayer.post_id,
      reportCount: 1,
      latestReportAt: reportRecord.createdAt,
      latestReportReason: reportRecord.reason,
      reports: [reportRecord],
      message: prayer.message,
      postMessage: parentPost.message,
      createdAt: prayer.created_at,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => {
    if (right.reportCount !== left.reportCount) {
      return right.reportCount - left.reportCount;
    }

    return (
      new Date(right.latestReportAt ?? 0).getTime() -
      new Date(left.latestReportAt ?? 0).getTime()
    );
  });
}
