"use client";

import React, { useEffect, useState } from "react";
import { Check, Globe2, Heart, Leaf, Sun } from "lucide-react";
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
import TranslateOptStep from "@/components/TranslateOptStep";
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
  selectTranslation,
  startShareFlow,
  submitMessage,
  type WarningReason,
} from "@/lib/app-flow";
import { SUPPORT_OPTIONS, SUPPORTED_LANGUAGES } from "@/lib/constants";
import { checkCrisis, checkSafety } from "@/lib/guardian";
import type { TestScenario } from "@/lib/testData";
import {
  getLanguageLabel,
  getUiCopy,
  localizeCategory,
  localizeEmotion,
} from "@/lib/translation";
import type {
  AppFlowSelection,
  AppFlowStep,
  Category,
  Emotion,
  FeedPost,
  LanguageCode,
} from "@/types";

type EmotionFilter = "all" | Emotion;
type TopicFilter = "all" | Category;

export default function GracefulFlow() {
  const [step, setStep] = useState<AppFlowStep>("feed");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>(createInitialPosts);
  const [emotionFilter, setEmotionFilter] = useState<EmotionFilter>("all");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");
  const [viewerLanguage, setViewerLanguage] = useState<LanguageCode>("en");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
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
    value: EmotionFilter;
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
    console.log("Current Selection:", result.selection);
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

  const handleTranslateSelect = (allow: boolean) => {
    const result = selectTranslation(selection, allow);
    setSelection(result.selection);
    setStep(result.nextStep);
  };

  const handleFinalPost = async (finalMessage: string) => {
    if (!selection.emotion || !selection.category || !selection.support) {
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
      const result = completeSuccessfulPost(posts, selection, finalMessage, postedAt);

      if (!result) {
        return;
      }

      console.log("POSTING TO COMMUNITY:", {
        ...result.posts[0],
        createdAt: new Date(postedAt).toISOString(),
      });
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
      const result = completeSuccessfulPost(posts, selection, finalMessage, postedAt);

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
    console.log(`Submitting prayer for ${postId}:`, text);
    setPosts((current) => addPrayerToPost(current, postId, text, "Just now"));
    setIsPrayerModalOpen(false);
    setActivePost(null);
  };

  const injectScenario = (scenario: TestScenario) => {
    const result = applyScenarioInjection(selection, scenario);
    setSelection(result.selection);
    setStep(result.nextStep);
  };

  const filteredPosts = posts.filter((post) => {
    if (emotionFilter !== "all" && post.emotion !== emotionFilter) {
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
        <div className="mx-auto overflow-hidden rounded-[2.1rem] border border-[var(--shell-border)] bg-[var(--shell-bg)] shadow-[0_16px_44px_rgba(57,84,61,0.06)]">
          <header className="border-b border-[var(--shell-border)]/90 px-5 py-5 md:px-7 md:py-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-[var(--brand)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)]">
                    <Leaf className="h-4.5 w-4.5" />
                  </span>
                  <h1 className="text-[2.45rem] font-semibold tracking-[-0.03em] text-[var(--brand)] md:text-[2.95rem]">
                    GraceFul
                  </h1>
                </div>
                <p className="text-[0.98rem] text-[var(--muted-ink)] md:text-[1rem]">
                  {copy.feed.tagline}
                </p>
              </div>

              <div className="relative flex items-center gap-3 self-start">
                <button
                  type="button"
                  aria-label="Language settings"
                  onClick={() => setIsLanguageMenuOpen((current) => !current)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[0.95rem] border border-[var(--brand)] bg-[var(--shell-bg)] px-4 text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
                >
                  <Globe2 className="h-5 w-5" />
                  <span className="text-[0.94rem] font-medium">
                    {getLanguageLabel(viewerLanguage)}
                  </span>
                </button>
                {isLanguageMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-[12rem] rounded-[1rem] border border-[var(--shell-border)] bg-[var(--shell-bg)] p-2 shadow-[0_12px_30px_rgba(57,84,61,0.14)]">
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => {
                      const isActive = viewerLanguage === code;

                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setViewerLanguage(code as LanguageCode);
                            setIsLanguageMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-[0.75rem] px-3 py-2.5 text-left text-[0.92rem] transition-colors ${
                            isActive
                              ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                              : "text-[var(--muted-ink)] hover:bg-[var(--chip-bg)]"
                          }`}
                        >
                          <span>{label}</span>
                          {isActive ? <Check className="h-4 w-4" /> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={startFreshShare}
                  className="inline-flex h-12 items-center justify-center rounded-[0.95rem] bg-[var(--brand)] px-6 text-[0.98rem] font-semibold text-white transition-colors hover:bg-[var(--brand-dark)]"
                >
                  {copy.feed.share}
                </button>
              </div>
            </div>
          </header>

          <section className="px-5 py-7 md:px-7 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[50rem]">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  {emotionFilters.map((filter) => {
                    const isActive = emotionFilter === filter.value;

                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setEmotionFilter(filter.value)}
                        className={`rounded-full border px-5 py-2.5 text-[0.95rem] font-medium transition-all md:text-[0.98rem] ${
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

                <div className="flex flex-wrap gap-3">
                  {topicFilters.map((filter) => {
                    const isActive = topicFilter === filter.value;

                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setTopicFilter(filter.value)}
                        className={`rounded-full border px-5 py-2.5 text-[0.95rem] font-medium transition-all md:text-[0.98rem] ${
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
  } else if (step === "translate_opt") {
    content = (
      <main className="min-h-screen bg-bg-warm flex flex-col items-center justify-center p-6">
        <TranslateOptStep
          allowTranslation={selection.allowTranslation}
          onClose={() => setStep(returnToFeed())}
          onSelect={handleTranslateSelect}
          onBack={() => setStep("support")}
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
          onBack={() => setStep("translate_opt")}
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
          step={6}
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
