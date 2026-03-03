"use client";

import {
  createContext,
  useEffect,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { createInitialPosts } from "@/lib/app-flow";
import {
  deleteAllPosts as deleteAllPostsFromDb,
  deletePrayer as deletePrayerFromDb,
  deletePostById,
  fetchPosts,
  insertPost,
  insertPrayer,
  mapRowToPost,
  mapRowToPrayer,
} from "@/lib/db";
import type { FeedPost, Prayer } from "@/types";
import { supabase } from "@/lib/supabase";

type PostsContextType = {
  posts: FeedPost[];
  isLoading: boolean;
  postError: string | null;
  addPost: (post: FeedPost) => Promise<boolean>;
  addPrayer: (postId: string, prayerText: string) => Promise<boolean>;
  deletePost: (id: string) => void;
  deletePrayer: (id: string) => void;
  deleteAllPosts: () => void;
};

const PostsContext = createContext<PostsContextType | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  const pushPost = useCallback((incomingPost: FeedPost) => {
    setPosts((prev) => {
      if (prev.find((post) => post.id === incomingPost.id)) {
        return prev;
      }

      return [incomingPost, ...prev];
    });
  }, []);

  const attachPrayer = useCallback((incomingPrayer: Prayer & { postId: string }) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === incomingPrayer.postId
          ? {
              ...post,
              prayers: post.prayers.find((prayer) => prayer.id === incomingPrayer.id)
                ? post.prayers
                : [
                    ...post.prayers,
                    {
                      id: incomingPrayer.id,
                      message: incomingPrayer.message,
                      createdAt: incomingPrayer.createdAt,
                      authorLabel: incomingPrayer.authorLabel,
                    },
                  ],
            }
          : post,
      ),
    );
  }, []);

  const setTimedPostError = useCallback((message: string) => {
    setPostError(message);
  }, []);

  useEffect(() => {
    if (!postError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPostError(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [postError]);

  useEffect(() => {
    let isActive = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribeToFeed = () => {
      if (!isActive || channel) {
        return;
      }

      channel = supabase
        .channel("feed-sync")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "posts" },
          (payload) => {
            const newPost = mapRowToPost(payload.new as Parameters<typeof mapRowToPost>[0]);
            pushPost(newPost);
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "posts" },
          (payload) => {
            const deletedId = (payload.old as { id?: string }).id;

            if (!deletedId) {
              return;
            }

            setPosts((prev) => prev.filter((post) => post.id !== deletedId));
          },
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "prayers" },
          (payload) => {
            const prayer = mapRowToPrayer(payload.new as Parameters<typeof mapRowToPrayer>[0]);
            attachPrayer(prayer);
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "prayers" },
          (payload) => {
            const deletedId = (payload.old as { id?: string }).id;

            if (!deletedId) {
              return;
            }

            setPosts((prev) =>
              prev.map((post) => ({
                ...post,
                prayers: post.prayers.filter((prayer) => prayer.id !== deletedId),
              })),
            );
          },
        )
        .subscribe();
    };

    async function loadPosts() {
      setIsLoading(true);

      try {
        const loadedPosts = await fetchPosts();

        if (!isActive) {
          return;
        }

        if (loadedPosts.length === 0 && process.env.NODE_ENV === "development") {
          const developmentPosts = createInitialPosts();
          setPosts(developmentPosts);

          void Promise.allSettled(
            developmentPosts.flatMap((post) => [
              insertPost(post),
              ...post.prayers.map((prayer) => insertPrayer(post.id, prayer)),
            ]),
          ).then((results) => {
            const rejectedSeeds = results.filter((result) => result.status === "rejected");

            if (rejectedSeeds.length > 0) {
              console.warn("Failed to seed development posts.", rejectedSeeds);
            }
          });

          return;
        }

        setPosts(loadedPosts);
      } catch (error) {
        console.error("[GraceFul] fetchPosts failed:", error);

        if (isActive) {
          setPosts([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
          subscribeToFeed();
        }
      }
    }

    void loadPosts();

    return () => {
      isActive = false;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [attachPrayer, pushPost]);

  const addPost = useCallback(async (post: FeedPost) => {
    setPostError(null);

    try {
      await insertPost(post);
      pushPost(post);
      return true;
    } catch (error) {
      console.error("[GraceFul] Post save failed:", error);
      setTimedPostError("Something went wrong saving your post. Please try again.");
      return false;
    }
  }, [pushPost, setTimedPostError]);

  const addPrayer = useCallback(async (postId: string, prayerText: string) => {
    setPostError(null);

    const prayer: Prayer = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${postId}-prayer-${Date.now()}`,
      message: prayerText,
      createdAt: "Just now",
      authorLabel: "Community prayer",
    };

    try {
      await insertPrayer(postId, prayer);
      attachPrayer({ ...prayer, postId });
      return true;
    } catch (error) {
      console.error("[GraceFul] Prayer save failed:", error);
      setTimedPostError("Something went wrong saving your post. Please try again.");
      return false;
    }
  }, [attachPrayer, setTimedPostError]);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));

    void deletePostById(id).catch((error) => {
      console.error("Failed to delete post.", error);
    });
  }, []);

  const deletePrayer = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((post) => ({
        ...post,
        prayers: post.prayers.filter((prayer) => prayer.id !== id),
      })),
    );

    void deletePrayerFromDb(id).catch((error) => {
      console.error("Failed to delete prayer.", error);
    });
  }, []);

  const deleteAllPosts = useCallback(() => {
    setPosts([]);

    void deleteAllPostsFromDb().catch((error) => {
      console.error("Failed to delete all posts.", error);
    });
  }, []);

  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        postError,
        addPost,
        addPrayer,
        deletePost,
        deletePrayer,
        deleteAllPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error("usePosts must be used inside PostsProvider");
  }

  return context;
}
