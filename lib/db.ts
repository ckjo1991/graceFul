import { generateTranslations } from "@/lib/translation";
import type { FeedPost, Prayer } from "@/types";

import { supabase } from "./supabase";

type PrayerRow = {
  id: string;
  message: string;
  created_at: string;
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

export async function deletePostById(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw error;
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
