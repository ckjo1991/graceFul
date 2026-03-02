"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe2, Heart, Leaf, Sun } from "lucide-react";
import CategoryStep from "@/components/CategoryStep";
import CrisisScreen from "@/components/CrisisScreen";
import GuardianWarning from "@/components/GuardianWarning";
import MessageStep from "@/components/MessageStep";
import OnboardingModal from "@/components/OnboardingModal";
import PostCard from "@/components/PostCard";
import PrayerListModal from "@/components/PrayerListModal";
import PrayerModal from "@/components/PrayerModal";
import ReviewStep from "@/components/ReviewStep";
import ShareStepShell from "@/components/ShareStepShell";
import SupportStep from "@/components/SupportStep";
import TestDashboard from "@/components/TestDashboard";
import { analyzeIntent } from "@/lib/ai";
import {
  addPrayerToPost,
  completeSuccessfulPost,
  createInitialPosts,
  createInitialSelection,
  injectScenario as applyScenarioInjection,
  returnToFeed,
  selectCategory,
  selectEmotion,
  selectSupport,
  startShareFlow,
  submitMessage,
  type WarningReason,
} from "@/lib/app-flow";
import { SUPPORT_OPTIONS, SUPPORTED_LANGUAGES } from "@/lib/constants";
import { checkCrisis, checkSafety } from "@/lib/guardian";
import type { TestScenario } from "@/lib/testData";
import { getUiCopy, localizeCategory, localizeEmotion } from "@/lib/translation";
import type {
  AppFlowSelection,
  AppFlowStep,
  Category,
  Emotion,
  FeedPost,
  LanguageCode,
} from "@/types";

type TopicFilter = "all" | Category;
type FeedFilter = "all" | Emotion | "my_posts";

const DEVICE_ID_STORAGE_KEY = "graceful_device_id";
const DEFAULT_FEED_FILTER: FeedFilter = "all";

type DebouncedFunction<Args extends unknown[]> = ((...args: Args) => void) & {
  cancel: () => void;
};

function debounce<Args extends unknown[]>(fn: (...args: Args) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = ((...args: Args) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn(...args);
    }, ms);
  }) as DebouncedFunction<Args>;

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
    }
  };

  return debounced;
}

export default function GracefulFlow() {
  const [step, setStep] = useState<AppFlowStep>("feed");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>(createInitialPosts);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>(DEFAULT_FEED_FILTER);
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [viewerLanguage, setViewerLanguage] = useState<LanguageCode>("en");
  const [isCompact, setIsCompact] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [activePost, setActivePost] = useState<Pick<FeedPost, "id" | "message"> | null>(null);
  const [activePrayerListPostId, setActivePrayerListPostId] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [selection, setSelection] = useState<AppFlowSelection>(createInitialSelection);
  const [lastPostTime, setLastPostTime] = useState<number | null>(null);
  const [warningReason, setWarningReason] = useState<WarningReason>(null);
  const copy = getUiCopy(viewerLanguage);

  const emotionFilters: Array<{
    label: string;
    value: FeedFilter;
  }> = [
    { label: copy.feed.allEmotion, value: "all" },
    { label: localizeEmotion("grateful", viewerLanguage), value: "grateful" },
    { label: localizeEmotion("struggling", viewerLanguage), value: "struggling" },
  ];

  const topicFilters: Array<{
    label: string;
    value: TopicFilter;
  }> = [
    { label: copy.feed.allTopics, value: "all" },
    { label: localizeCategory("Financial", viewerLanguage), value: "Financial" },
    { label: localizeCategory("Family", viewerLanguage), value: "Family" },
    { label: localizeCategory("Health", viewerLanguage), value: "Health" },
    { label: localizeCategory("Personal", viewerLanguage), value: "Personal" },
    { label: localizeCategory("Work", viewerLanguage), value: "Work" },
    { label: localizeCategory("Other", viewerLanguage), value: "Other" },
  ];

  useEffect(() => {
    setShowOnboarding(!window.sessionStorage.getItem("graceful_onboarded"));

    try {
      const storedDeviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);

      if (storedDeviceId) {
        setDeviceId(storedDeviceId);
        return;
      }

      const generatedDeviceId = window.crypto.randomUUID();
      window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, generatedDeviceId);
      setDeviceId(generatedDeviceId);
    } catch (error) {
      console.error("Unable to initialize graceful device ID.", error);
      setDeviceId(window.crypto.randomUUID());
    }
  }, []);

  useEffect(() => {
    const handleIntersection = debounce(([entry]: IntersectionObserverEntry[]) => {
      setIsCompact(!entry.isIntersecting);
    }, 50);

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0,
      rootMargin: "0px",
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
      handleIntersection.cancel();
    };
  }, []);

  const startFreshShare = () => {
    const result = startShareFlow(lastPostTime);

    if (!result.allowed) {
      alert(`🌿 ${copy.feed.cooldown(result.waitTime)}`);
      return;
    }

    setSelection(result.selection);
    setWarningReason(result.warningReason);
    setStep(result.nextStep);
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    const result = selectEmotion(selection, emotion);
    setSelection(result.selection);
    setStep(result.nextStep);
  };

  const handleCategorySelect = (category: Category) => {
    const result = selectCategory(selection, category);
    setSelection(result.selection);
    setStep(result.nextStep);
  };

  const handleMessageSubmit = (message: string) => {
    const result = submitMessage(selection, message);
    setSelection(result.selection);
    setWarningReason(result.warningReason);
    setStep(result.nextStep);
  };

  const handleSupportSelect = (support: FeedPost["supportType"]) => {
    const result = selectSupport(selection, support);
    setSelection(result.selection);
    setStep(result.nextStep);
  };

  const handleViewerLanguageChange = (language: LanguageCode) => {
    setViewerLanguage(language);
  };

  const handleFinalPost = async (finalMessage: string) => {
    if (!selection.emotion || !selection.category || !selection.support) {
      return;
    }

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
        console.error("Guardian intent analysis blocked a post at the final gate!", {
          reason: safety.reason,
        });
        setWarningReason(
          safety.reason === "profanity" ? "profanity" : "malice",
        );
        setStep("warning");
        return;
      }

      const postedAt = Date.now();
      const result = completeSuccessfulPost(
        posts,
        selection,
        finalMessage,
        postedAt,
        deviceId ?? undefined,
      );

      if (!result) {
        return;
      }

      setPosts(result.posts);
      setLastPostTime(result.lastPostTime);
      setStep(result.nextStep);
    } catch (error) {
      console.error("Guardian intent analysis failed at the final gate.", error);
      const fallbackSafety = checkSafety(finalMessage);

      if (!fallbackSafety.isSafe) {
        setWarningReason(fallbackSafety.reason ?? "malice");
        setStep("warning");
        return;
      }

      const postedAt = Date.now();
      const result = completeSuccessfulPost(
        posts,
        selection,
        finalMessage,
        postedAt,
        deviceId ?? undefined,
      );

      if (!result) {
        return;
      }

      setPosts(result.posts);
      setLastPostTime(result.lastPostTime);
      setStep(result.nextStep);
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

  const handleOpenPrayerList = (postId: string) => {
    setActivePrayerListPostId(postId);
  };

  const handleClosePrayerList = () => {
    setActivePrayerListPostId(null);
  };

  const handlePrayerSubmit = (postId: string, text: string) => {
    setPosts((current) => addPrayerToPost(current, postId, text, "Just now"));
    setIsPrayerModalOpen(false);
    setActivePost(null);
  };

  const injectScenario = (scenario: TestScenario) => {
    const result = applyScenarioInjection(selection, scenario);
    setSelection(result.selection);
    setStep(result.nextStep);
  };

  const currentDeviceId =
    deviceId ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem(DEVICE_ID_STORAGE_KEY)
      : null);

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "my_posts") {
      if (!currentDeviceId || post.deviceId !== currentDeviceId) {
        return false;
      }
    } else if (activeFilter !== "all" && post.emotion !== activeFilter) {
      return false;
    }

    if (topicFilter !== "all" && post.category !== topicFilter) {
      return false;
    }

    return true;
  });
  const activePrayerListPost =
    activePrayerListPostId
      ? posts.find((post) => post.id === activePrayerListPostId) ?? null
      : null;

  let content: React.ReactNode;

  if (step === "feed") {
    content = (
      <main className="min-h-screen bg-[var(--page-bg)] px-3 py-3 md:px-4 md:py-4">
        <div className="mx-auto rounded-[2.1rem] border border-[var(--shell-border)] bg-[var(--shell-bg)] shadow-[0_16px_44px_rgba(57,84,61,0.06)]">
          <div ref={sentinelRef} className="h-0 w-full" />
          <header
            className={`sticky top-0 z-40 overflow-hidden bg-white/95 backdrop-blur-sm will-change-transform transition-shadow duration-200 ${
              isCompact ? "border-b border-[#d4e4cc] shadow-sm" : ""
            }`}
          >
            <div
              className={`px-5 transition-all duration-200 md:px-7 ${
                isCompact ? "py-3" : "py-6"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[var(--brand)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)]">
                      <Leaf className="h-4.5 w-4.5" />
                    </span>
                    <h1
                      className={`font-serif font-bold text-[#2c3a2e] transition-all duration-200 ${
                        isCompact ? "text-lg" : "text-3xl"
                      }`}
                    >
                      GraceFul
                    </h1>
                  </div>
                  <p
                    className={`text-[0.98rem] text-[var(--muted-ink)] md:text-[1rem] ${
                      isCompact ? "hidden" : "block"
                    }`}
                  >
                    {copy.feed.tagline}
                  </p>
                </div>

                <div className="hidden flex-col gap-3 self-start sm:flex">
                  {/* TODO: Language switcher parked — re-enable with translation */}
                  <div className="relative ml-3 hidden min-w-[11rem]">
                    <div className="flex items-center gap-2 rounded-xl border border-[#d4e4cc] bg-white px-4 py-2 hover:border-[#4a7c59]">
                      <Globe2 className="h-4 w-4 shrink-0 text-[#2c3a2e]" />
                      <select
                        aria-label="Language"
                        value={viewerLanguage}
                        onChange={(event) =>
                          handleViewerLanguageChange(event.target.value as LanguageCode)
                        }
                        className="min-w-0 flex-1 cursor-pointer appearance-none border-none bg-transparent text-sm font-semibold text-[#2c3a2e] outline-none"
                      >
                        {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none h-3.5 w-3.5 shrink-0 text-[#6b7c6d]" />
                    </div>
                  </div>
                  <div className="hidden items-center gap-3 sm:flex">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          activeFilter === "my_posts" ? "all" : "my_posts",
                        )
                      }
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        activeFilter === "my_posts"
                          ? "bg-[#2c3a2e] text-white"
                          : "border border-[#d4e4cc] bg-white text-[#2c3a2e] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      }`}
                    >
                      {copy.feed.myPosts}
                    </button>
                    <button
                      type="button"
                      onClick={startFreshShare}
                      className="rounded-xl bg-[#4a7c59] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
                    >
                      {copy.feed.share}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section className="px-5 py-7 pb-24 sm:pb-0 md:px-7 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[50rem]">
              <div
                className={`relative z-30 flex flex-col gap-4 bg-transparent transition-opacity duration-200 ${
                  activeFilter === "my_posts"
                    ? "pointer-events-none h-0 opacity-0"
                    : "opacity-100"
                }`}
              >
                <div className="overflow-x-auto whitespace-nowrap bg-transparent scrollbar-hide sm:overflow-visible sm:whitespace-normal">
                  <div className="flex flex-nowrap gap-3 sm:flex-wrap">
                    {emotionFilters.map((filter) => {
                      const isActive = activeFilter === filter.value;

                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setActiveFilter(filter.value)}
                          className={`inline-flex shrink-0 rounded-full border px-5 py-2.5 text-[0.95rem] font-medium transition-all md:text-[0.98rem] ${
                            isActive
                              ? "border-[var(--chip-active-border)] bg-[var(--chip-active-bg)] text-[var(--chip-active-text)] shadow-[0_12px_24px_rgba(79,132,92,0.16)]"
                              : "border-[var(--chip-border)] bg-[var(--chip-bg)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="overflow-x-auto whitespace-nowrap bg-transparent scrollbar-hide sm:overflow-visible sm:whitespace-normal">
                  <div className="flex flex-nowrap gap-3 sm:flex-wrap">
                    {topicFilters.map((filter) => {
                      const isActive = topicFilter === filter.value;

                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setTopicFilter(filter.value)}
                          className={`inline-flex shrink-0 rounded-full border px-5 py-2.5 text-[0.95rem] font-medium transition-all md:text-[0.98rem] ${
                            isActive
                              ? "border-[var(--chip-active-border)] bg-[var(--chip-active-bg)] text-[var(--chip-active-text)] shadow-[0_12px_24px_rgba(79,132,92,0.16)]"
                              : "border-[var(--chip-border)] bg-[var(--chip-bg)] text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPray={handleOpenPrayer}
                      onViewPrayers={handleOpenPrayerList}
                      viewerLanguage={viewerLanguage}
                    />
                  ))
                ) : activeFilter === "my_posts" ? (
                  <div className="rounded-[1.85rem] border border-[var(--card-border)] bg-[var(--card-bg)] px-6 py-10 text-center shadow-[0_10px_34px_rgba(57,84,61,0.05)]">
                    <h2 className="text-3xl font-semibold text-[var(--ink)]">
                      You haven&apos;t shared anything yet
                    </h2>
                    <p className="mt-3 text-lg leading-8 text-[var(--muted-ink)]">
                      Your posts will appear here after you share something with the
                      community.
                    </p>
                    <div className="mt-4 flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={startFreshShare}
                        className="inline-flex h-12 items-center justify-center rounded-[0.95rem] bg-[var(--brand)] px-6 text-[0.98rem] font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
                      >
                        + Share something
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFilter("all")}
                        className="cursor-pointer text-sm text-[#4a7c59] underline"
                      >
                        Browse the feed
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.85rem] border border-[var(--card-border)] bg-[var(--card-bg)] px-6 py-10 text-center shadow-[0_10px_34px_rgba(57,84,61,0.05)]">
                    <h2 className="text-3xl font-semibold text-[var(--ink)]">
                      {copy.feed.noPostsTitle}
                    </h2>
                    <p className="mt-3 text-lg leading-8 text-[var(--muted-ink)]">
                      {copy.feed.noPostsBody}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <PrayerModal
            post={activePost}
            isOpen={isPrayerModalOpen}
            onClose={handleClosePrayer}
            onSubmit={handlePrayerSubmit}
            language={viewerLanguage}
            postTranslations={
              activePost
                ? posts.find((entry) => entry.id === activePost.id)?.translations
                : undefined
            }
          />
          <PrayerListModal
            post={activePrayerListPost}
            isOpen={Boolean(activePrayerListPost)}
            onClose={handleClosePrayerList}
            language={viewerLanguage}
          />
        </div>

        <div className="fixed bottom-6 left-1/2 z-50 block -translate-x-1/2 sm:hidden">
          <div className="flex items-center gap-0 overflow-hidden rounded-full border border-[#d4e4cc] bg-white/95 shadow-lg shadow-black/10 backdrop-blur-sm">
            <button
              type="button"
              onClick={() =>
                setActiveFilter(
                  activeFilter === "my_posts" ? "all" : "my_posts",
                )
              }
              className={`px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeFilter === "my_posts"
                  ? "bg-[#2c3a2e] text-white"
                  : "bg-transparent text-[#2c3a2e] hover:bg-[#f0f7f0]"
              }`}
            >
              {copy.feed.myPosts}
            </button>
            <div className="h-5 w-px bg-[#d4e4cc]" aria-hidden="true" />
            <button
              type="button"
              onClick={startFreshShare}
              className="bg-[#4a7c59] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3d6b4a]"
            >
              {copy.feed.share}
            </button>
          </div>
        </div>
      </main>
    );
  } else if (step === "emotion") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6 text-center">
        <ShareStepShell
          onClose={() => setStep(returnToFeed())}
          step={1}
          title={copy.emotionStep.title}
          description={copy.emotionStep.description}
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleEmotionSelect("grateful")}
              className="group w-full rounded-[0.9rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-4 text-left transition-all hover:border-[var(--brand)] hover:bg-white"
            >
              <div className="flex items-start gap-3">
                <Sun className="mt-1 h-5 w-5 text-[var(--brand)]" />
                <div>
                  <span className="block text-[1rem] font-semibold text-[var(--ink)]">
                    {copy.emotionStep.gratefulTitle}
                  </span>
                  <span className="mt-1 block text-[0.88rem] leading-6 text-[var(--muted-ink)]">
                    {copy.emotionStep.gratefulBody}
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleEmotionSelect("struggling")}
              className="group w-full rounded-[0.9rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-4 text-left transition-all hover:border-[var(--struggling-rail)] hover:bg-white"
            >
              <div className="flex items-start gap-3">
                <Heart className="mt-1 h-5 w-5 text-[var(--struggling-rail)]" />
                <div>
                  <span className="block text-[1rem] font-semibold text-[var(--ink)]">
                    {copy.emotionStep.strugglingTitle}
                  </span>
                  <span className="mt-1 block text-[0.88rem] leading-6 text-[var(--muted-ink)]">
                    {copy.emotionStep.strugglingBody}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </ShareStepShell>
      </main>
    );
  } else if (step === "category") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6">
        <CategoryStep
          onClose={() => setStep(returnToFeed())}
          selectedEmotion={selection.emotion as Emotion}
          onSelect={handleCategorySelect}
          onBack={() => setStep("emotion")}
          language={viewerLanguage}
        />
      </main>
    );
  } else if (step === "message") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6">
        <MessageStep
          key={`${selection.emotion}:${selection.category}:${selection.message}`}
          category={selection.category as Category}
          initialMessage={selection.message}
          onClose={() => setStep(returnToFeed())}
          selectedEmotion={selection.emotion as Emotion}
          onNext={handleMessageSubmit}
          onBack={() => setStep("category")}
          language={viewerLanguage}
        />
      </main>
    );
  } else if (step === "crisis") {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6">
        <CrisisScreen onBack={() => setStep("message")} language={viewerLanguage} />
      </main>
    );
  } else if (step === "warning" && warningReason) {
    content = (
      <main className="flex min-h-screen items-center justify-center bg-bg-warm p-6">
        <GuardianWarning
          reason={warningReason}
          language={viewerLanguage}
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
          onClose={() => setStep(returnToFeed())}
          supportOptions={SUPPORT_OPTIONS}
          onSelect={handleSupportSelect}
          onBack={() => setStep("message")}
          language={viewerLanguage}
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
          onClose={() => setStep(returnToFeed())}
          onBack={() => setStep("support")}
          onCrisisDetected={() => setStep("crisis")}
          onPost={handleFinalPost}
          language={viewerLanguage}
        />
      </main>
    );
  } else if (step === "done") {
    content = (
      <main className="min-h-screen bg-bg-warm flex flex-col items-center justify-center p-6 text-center">
        <ShareStepShell
          onClose={() => setStep(returnToFeed())}
          step={5}
          title={copy.feed.successTitle}
          description={copy.feed.successBody}
        >
          <div className="mb-5 flex justify-center text-5xl text-[var(--brand)]">
            <Leaf className="h-12 w-12" />
          </div>

          <div className="rounded-[0.75rem] border border-[var(--shell-border)] bg-[var(--brand-soft)]/35 px-4 py-3 text-left text-[0.84rem] italic leading-6 text-[var(--muted-ink)]">
            {copy.categoryStep.note}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setStep(returnToFeed())}
              className="rounded-[0.55rem] bg-[var(--brand)] px-5 py-2.5 text-[0.92rem] font-medium text-white transition-colors hover:bg-[var(--brand-dark)]"
            >
              {copy.feed.viewFeed}
            </button>
            <button
              type="button"
              onClick={startFreshShare}
              className="rounded-[0.55rem] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-5 py-2.5 text-[0.92rem] text-[var(--muted-ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {copy.feed.shareAgain}
            </button>
          </div>
        </ShareStepShell>
      </main>
    );
  } else {
    content = (
      <main className="flex min-h-screen flex-col items-center justify-center bg-bg-warm p-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-[#d4e4cc] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-primary-dark">
            {copy.feed.restartTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7c6d]">
            {copy.feed.restartBody}
          </p>
          <button
            onClick={startFreshShare}
            className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {copy.feed.restart}
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="relative">
      {showOnboarding ? (
        <OnboardingModal
          onComplete={() => {
            window.sessionStorage.setItem("graceful_onboarded", "1");
            setShowOnboarding(false);
          }}
        />
      ) : null}
      {content}
      <TestDashboard onInject={injectScenario} />
    </div>
  );
}
