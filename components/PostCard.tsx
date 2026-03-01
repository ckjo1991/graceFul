"use client";

import React from "react";
import {
  HandHeart as PrayingHand,
  Languages,
  MessageSquare,
} from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    emotion: "grateful" | "struggling";
    category: string;
    message: string;
    supportType: string;
    allowTranslation: boolean;
    createdAt: string;
    prayerCount: number;
  };
  onPray: (postId: string) => void;
}

export default function PostCard({ post, onPray }: PostCardProps) {
  const isGrateful = post.emotion === "grateful";

  return (
    <div
      className={`mb-4 w-full rounded-xl border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md ${
        isGrateful ? "border-primary" : "border-struggle"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-2">
          <span
            className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
              isGrateful
                ? "bg-emerald-50 text-primary"
                : "bg-orange-50 text-struggle"
            }`}
          >
            {isGrateful ? "🙏 Grateful" : "💙 Struggling"}
          </span>
          <span className="rounded-md bg-bg-warm px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
            {post.category}
          </span>
        </div>
        <span className="text-xs font-medium text-border">{post.createdAt}</span>
      </div>

      <p className="mb-4 text-[15px] leading-relaxed text-text">
        {post.message}
      </p>

      {post.allowTranslation && (
        <button className="mb-4 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
          <Languages className="h-3 w-3" />
          Translate to your language
        </button>
      )}

      <div className="flex items-center justify-between border-t border-bg-warm pt-4">
        <div className="flex items-center gap-2 text-muted">
          <PrayingHand className="h-4 w-4" />
          <span className="text-xs font-medium">
            {post.prayerCount} {post.prayerCount === 1 ? "prayer" : "prayers"}
          </span>
        </div>

        {post.supportType !== "Just sharing" && (
          <button
            onClick={() => onPray(post.id)}
            className="flex items-center gap-2 rounded-lg bg-bg-warm px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-accent/20"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Write a Prayer
          </button>
        )}
      </div>
    </div>
  );
}
