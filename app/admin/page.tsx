"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { usePosts } from "@/lib/posts-context";

const ADMIN_KEY = "graceful-admin-2026";

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { posts, deletePost, deleteAllPosts } = usePosts();
  const key = searchParams.get("key");

  // TODO: Replace with proper auth before scaling beyond internal use
  if (key !== ADMIN_KEY) {
    return <main>Access denied</main>;
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-semibold">
          GraceFul Admin — {posts.length} posts
        </h1>

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
          <button type="button" onClick={() => router.refresh()}>
            Reload
          </button>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start justify-between gap-4 border p-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap gap-2 text-sm">
                  <span>{post.createdAt}</span>
                  <span>{post.emotion}</span>
                  <span>{post.category}</span>
                </div>
                <p className="break-words">
                  {post.message.length > 80
                    ? `${post.message.slice(0, 80)}...`
                    : post.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => deletePost(post.id)}
                className="shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
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
