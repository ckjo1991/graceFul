"use client";

import React, { useState } from "react";
import { Heart, Sun } from "lucide-react";
import CategoryStep from "@/components/CategoryStep";
import CrisisScreen from "@/components/CrisisScreen";
import GuardianWarning from "@/components/GuardianWarning";
import MessageStep from "@/components/MessageStep";
import PostCard from "@/components/PostCard";
import PrayerModal from "@/components/PrayerModal";
import ReviewStep from "@/components/ReviewStep";
import SupportStep from "@/components/SupportStep";
import TestDashboard from "@/components/TestDashboard";
import TranslateOptStep from "@/components/TranslateOptStep";
import { analyzeIntent } from "@/lib/ai";
import { canPost, checkCrisis, checkSafety, scrubPII } from "@/lib/guardian";
import type { TestScenario } from "@/lib/testData";

type FeedPost = {
  id: string;
  emotion: "grateful" | "struggling";
  category: string;
  message: string;
  supportType: string;
  allowTranslation: boolean;
  createdAt: string;
  prayerCount: number;
};

const initialPosts: FeedPost[] = [
  {
    id: "1",
    emotion: "grateful" as const,
    category: "Family",
    message:
      "So thankful for my mother's recovery. It's been a hard few months but she's doing so well now.",
    supportType: "A prayer would be nice",
    allowTranslation: true,
    createdAt: "2h ago",
    prayerCount: 5,
  },
  {
    id: "2",
    emotion: "struggling" as const,
    category: "Work",
    message:
      "Feeling very overwhelmed with the new project. Asking for peace and wisdom.",
    supportType: "Both prayer and encouragement",
    allowTranslation: false,
    createdAt: "4h ago",
    prayerCount: 2,
  },
];

const INITIAL_SELECTION = {
  emotion: "" as "grateful" | "struggling" | "",
  category: "",
  message: "",
  support: "",
  allowTranslation: null as boolean | null,
};

type FlowStep =
  | "emotion"
  | "category"
  | "message"
  | "crisis"
  | "warning"
  | "support"
  | "translate_opt"
  | "review"
  | "done"
  | "feed";

type FlowSelection = typeof INITIAL_SELECTION;

export default function GracefulFlow() {
  const [step, setStep] = useState<FlowStep>("feed");
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [selection, setSelection] = useState<FlowSelection>(INITIAL_SELECTION);
  const [lastPostTime, setLastPostTime] = useState<number | null>(null);
  const [warningReason, setWarningReason] = useState<"pii" | "malice" | null>(
    null,
  );

  const startFreshShare = () => {
    const { allowed, waitTime } = canPost(lastPostTime);

    if (!allowed) {
      alert(
        `🌿 Take a breath. GraceFul is a quiet space. You can share again in ${waitTime} seconds.`,
      );
      return;
    }

    setSelection(INITIAL_SELECTION);
    setWarningReason(null);
    setStep("emotion");
  };

  const handleEmotionSelect = (emotion: "grateful" | "struggling") => {
    setSelection((current) => ({ ...current, emotion }));
    setStep("category");
  };

  const handleCategorySelect = (category: string) => {
    setSelection((current) => {
      const nextSelection = { ...current, category };
      console.log("Current Selection:", nextSelection);
      return nextSelection;
    });
    setStep("message");
  };

  const handleMessageSubmit = (message: string) => {
    setSelection((current) => ({ ...current, message }));

    if (checkCrisis(message)) {
      setWarningReason(null);
      setStep("crisis");
      return;
    }

    const safety = checkSafety(message);

    if (!safety.isSafe && safety.reason) {
      setWarningReason(safety.reason);
      setStep("warning");
      return;
    }

    setWarningReason(null);
    setStep("support");
  };

  const handleSupportSelect = (support: string) => {
    setSelection((current) => ({ ...current, support }));
    setStep("translate_opt");
  };

  const handleTranslateSelect = (allow: boolean) => {
    setSelection((current) => ({ ...current, allowTranslation: allow }));
    setStep("review");
  };

  const handleFinalPost = async (finalMessage: string) => {
    if (!selection.emotion) {
      return;
    }

    console.log("Guardian is checking:", finalMessage);

    const isCrisis = checkCrisis(finalMessage);

    if (isCrisis) {
      console.error("Guardian blocked a crisis post at the final gate!", {
        isCrisis,
      });
      setWarningReason(null);
      setStep("crisis");
      return;
    }

    setIsPosting(true);

    try {
      const safety = await analyzeIntent(finalMessage);

      if (!safety.isSafe) {
        console.error("AI intent analysis blocked a post at the final gate!", {
          reason: safety.reason,
        });
        setWarningReason("malice");
        setStep("warning");
        return;
      }

      const sanitizedMessage = scrubPII(finalMessage);
      const postedAt = Date.now();
      const newPost: FeedPost = {
        id: postedAt.toString(),
        emotion: selection.emotion,
        category: selection.category,
        message: sanitizedMessage,
        supportType: selection.support,
        allowTranslation: selection.allowTranslation || false,
        createdAt: "Just now",
        prayerCount: 0,
      };

      console.log("POSTING TO COMMUNITY:", {
        ...newPost,
        createdAt: new Date(postedAt).toISOString(),
      });
      setPosts((current) => [newPost, ...current]);
      setLastPostTime(postedAt);
      setStep("done");
    } catch (error) {
      console.error("AI intent analysis failed at the final gate.", error);
      const fallbackSafety = checkSafety(finalMessage);

      if (!fallbackSafety.isSafe) {
        setWarningReason(fallbackSafety.reason ?? "malice");
        setStep("warning");
        return;
      }

      const sanitizedMessage = scrubPII(finalMessage);
      const postedAt = Date.now();
      const newPost: FeedPost = {
        id: postedAt.toString(),
        emotion: selection.emotion,
        category: selection.category,
        message: sanitizedMessage,
        supportType: selection.support,
        allowTranslation: selection.allowTranslation || false,
        createdAt: "Just now",
        prayerCount: 0,
      };

      setPosts((current) => [newPost, ...current]);
      setLastPostTime(postedAt);
      setStep("done");
    } finally {
      setIsPosting(false);
    }
  };

  const handleOpenPrayer = (postId: string) => {
    const post = posts.find((entry) => entry.id === postId);
    if (post) {
      setActivePost({ id: post.id, message: post.message });
      setIsPrayerModalOpen(true);
    }
  };

  const handleClosePrayer = () => {
    setIsPrayerModalOpen(false);
    setActivePost(null);
  };

  const handlePrayerSubmit = (postId: string, text: string) => {
    console.log(`Submitting prayer for ${postId}:`, text);
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, prayerCount: post.prayerCount + 1 }
          : post,
      ),
    );
    setIsPrayerModalOpen(false);
    setActivePost(null);
  };

  const injectScenario = (scenario: TestScenario) => {
    setSelection((current) => ({
      ...current,
      emotion: scenario.emotion,
      category: scenario.category,
      message: scenario.message,
    }));
    setStep("message");
  };

  let content: React.ReactNode;

  if (step === "feed") {
    content = (
      <main className="min-h-screen bg-bg-warm p-6">
        <div className="mx-auto max-w-md">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-center text-2xl font-serif font-bold text-primary-dark">
              GraceFul
            </h1>
            <button
              onClick={startFreshShare}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              + Share
            </button>
          </header>

          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPray={handleOpenPrayer}
              />
            ))}
          </div>

          <PrayerModal
            post={activePost}
            isOpen={isPrayerModalOpen}
            onClose={handleClosePrayer}
            onSubmit={handlePrayerSubmit}
          />
        </div>
      </main>
    );
  } else if (step === "emotion") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6 text-center">
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-serif font-bold text-primary-dark">
            GraceFul
          </h1>
          <p className="text-lg text-[#6b7c6d]">How are you today?</p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => handleEmotionSelect("grateful")}
            className="group flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-[#d4e4cc] bg-white p-8 shadow-sm transition-all hover:border-primary"
          >
            <Sun className="h-10 w-10 text-primary transition-transform group-hover:scale-110" />
            <div className="w-full text-center">
              <span className="block text-xl font-bold text-[#2c3a2e]">
                I&apos;m grateful for something
              </span>
              <span className="text-sm text-[#6b7c6d]">
                Share what&apos;s bringing you joy or peace
              </span>
            </div>
          </button>

          <button
            onClick={() => handleEmotionSelect("struggling")}
            className="group flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-[#d4e4cc] bg-white p-8 shadow-sm transition-all hover:border-struggle"
          >
            <Heart className="h-10 w-10 text-struggle transition-transform group-hover:scale-110" />
            <div className="w-full text-center">
              <span className="block text-xl font-bold text-[#2c3a2e]">
                I&apos;m struggling with something
              </span>
              <span className="text-sm text-[#6b7c6d]">
                Share what&apos;s weighing on your heart
              </span>
            </div>
          </button>
        </div>
      </main>
    );
  } else if (step === "category") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6">
        <CategoryStep
          selectedEmotion={selection.emotion as "grateful" | "struggling"}
          onSelect={handleCategorySelect}
          onBack={() => setStep("emotion")}
        />
      </main>
    );
  } else if (step === "message") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6">
        <MessageStep
          key={`${selection.emotion}:${selection.category}:${selection.message}`}
          category={selection.category}
          initialMessage={selection.message}
          selectedEmotion={selection.emotion as "grateful" | "struggling"}
          onNext={handleMessageSubmit}
          onBack={() => setStep("category")}
        />
      </main>
    );
  } else if (step === "crisis") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6">
        <CrisisScreen onBack={() => setStep("message")} />
      </main>
    );
  } else if (step === "warning" && warningReason) {
    content = (
      <main className="flex min-h-screen items-center justify-center bg-bg-warm p-6">
        <GuardianWarning
          reason={warningReason}
          onRedo={() => {
            setWarningReason(null);
            setStep("message");
          }}
        />
      </main>
    );
  } else if (step === "support") {
    content = (
      <main className="min-h-screen bg-bg-warm flex flex-col items-center justify-center p-6">
        <SupportStep
          supportOptions={[
            "A prayer would be nice",
            "Just sharing",
            "Both prayer and encouragement",
          ]}
          onSelect={handleSupportSelect}
          onBack={() => setStep("message")}
        />
      </main>
    );
  } else if (step === "translate_opt") {
    content = (
      <main className="min-h-screen bg-bg-warm flex flex-col items-center justify-center p-6">
        <TranslateOptStep
          allowTranslation={selection.allowTranslation}
          onSelect={handleTranslateSelect}
          onBack={() => setStep("support")}
        />
      </main>
    );
  } else if (step === "review") {
    content = (
      <main className="min-h-screen bg-bg-warm flex flex-col items-center justify-center p-6">
        <ReviewStep
          key={selection.message}
          isPosting={isPosting}
          message={selection.message}
          onBack={() => setStep("translate_opt")}
          onCrisisDetected={() => setStep("crisis")}
          onPost={handleFinalPost}
        />
      </main>
    );
  } else if (step === "done") {
    content = (
      <main className="min-h-screen bg-bg-warm flex flex-col items-center justify-center p-6 text-center">
        <div className="scale-up-center">
          <span className="mb-6 block text-6xl">🌿</span>
          <h2 className="mb-2 text-3xl font-serif font-bold text-primary-dark">
            Your message has been shared
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-text-light">
            Thank you for trusting this community. You are not alone.
          </p>
          <button
            onClick={() => setStep("feed")}
            className="font-bold text-primary underline"
          >
            Back to Feed
          </button>
        </div>
      </main>
    );
  } else {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-[#d4e4cc] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-primary-dark">
            Something went off flow
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7c6d]">
            Restart the sharing journey to continue.
          </p>
          <button
            onClick={startFreshShare}
            className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Start over
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="relative">
      {content}
      <TestDashboard onInject={injectScenario} />
    </div>
  );
}
