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
} from "@/lib/db";
import type { FeedPost, Prayer } from "@/types";

type PostsContextType = {
  posts: FeedPost[];
  isLoading: boolean;
  addPost: (post: FeedPost) => void;
  addPrayer: (postId: string, prayerText: string) => void;
  deletePost: (id: string) => void;
  deletePrayer: (id: string) => void;
  deleteAllPosts: () => void;
};

const PostsContext = createContext<PostsContextType | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

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
        console.error("Failed to load posts from Supabase.", error);

        if (isActive) {
          setPosts([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isActive = false;
    };
  }, []);

  const addPost = useCallback((post: FeedPost) => {
    setPosts((prev) => [post, ...prev]);

    void insertPost(post).catch((error) => {
      console.error("Failed to persist post.", error);
    });
  }, []);

  const addPrayer = useCallback((postId: string, prayerText: string) => {
    const prayer: Prayer = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${postId}-prayer-${Date.now()}`,
      message: prayerText,
      createdAt: "Just now",
      authorLabel: "Community prayer",
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              prayers: [...post.prayers, prayer],
            }
          : post,
      ),
    );

    void insertPrayer(postId, prayer).catch((error) => {
      console.error("Failed to persist prayer.", error);
    });
  }, []);

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
