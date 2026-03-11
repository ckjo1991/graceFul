"use client";

// REFERENCE ONLY — predates Supabase persistence. Not mounted in product.

import { useState } from "react";

import { CATEGORIES, EMOTIONS, MAX_CHARS, MIN_CHARS, SUPPORTED_LANGUAGES } from "@/lib/constants";
import { moderateSubmission } from "@/api/guardian";
import type {
  Category,
  Emotion,
  GuardianResult,
  PrototypeShareDraft,
  PrototypeShareStep,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const INITIAL_DRAFT: PrototypeShareDraft = {
  emotion: null,
  category: null,
  message: "",
  translatedTo: null,
  wantsWordingHelp: false,
};

function nextStep(step: PrototypeShareStep): PrototypeShareStep {
  const order: PrototypeShareStep[] = [
    // STALE STEP: welcome removed from active flow
    "welcome",
    "category",
    "message",
    "support",
    // STALE STEP: translate_opt removed from active flow
    "translate_opt",
    // STALE STEP: wording removed from active flow
    "wording",
    "done",
  ];
  const currentIndex = order.indexOf(step);

  return order[Math.min(currentIndex + 1, order.length - 1)] ?? "done";
}

export function ShareFlow() {
  // STALE STEP: welcome removed from active flow
  const [step, setStep] = useState<PrototypeShareStep>("welcome");
  const [draft, setDraft] = useState<PrototypeShareDraft>(INITIAL_DRAFT);
  const [guardianNotes, setGuardianNotes] = useState<string[]>([]);
  const [guardianOutcome, setGuardianOutcome] = useState<GuardianResult["outcome"] | null>(null);

  const characterCount = draft.message.trim().length;
  const messageValid = characterCount >= MIN_CHARS && characterCount <= MAX_CHARS;

  const stepLabel = getStepLabel(step);

  const handleEmotion = (emotion: PrototypeShareDraft["emotion"]) => {
    setDraft((current) => ({ ...current, emotion }));
    setStep("category");
  };

  const handleCategory = (category: Category) => {
    setDraft((current) => ({ ...current, category }));
    setStep("message");
  };

  const handleMessageAdvance = () => {
    const result = moderateSubmission(draft.message);
    setDraft((current) => ({ ...current, message: result.sanitizedMessage }));
    setGuardianNotes(result.reasons);
    setGuardianOutcome(result.outcome);

    if (result.outcome === "redirect_crisis") {
      setStep("support");
      return;
    }

    if (result.outcome === "block") {
      return;
    }

    setStep(nextStep(step));
  };

  const resetFlow = () => {
    setDraft(INITIAL_DRAFT);
    setGuardianNotes([]);
    setGuardianOutcome(null);
    // STALE STEP: welcome removed from active flow
    setStep("welcome");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Badge>{stepLabel}</Badge>
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
          State machine
        </span>
      </div>

      <div className="space-y-3">
        <CardTitle>{stepTitle(step)}</CardTitle>
        <CardDescription>{stepDescription(step)}</CardDescription>
      </div>

      {step === "welcome" ? ( // STALE STEP: welcome removed from active flow
        <div className="grid gap-3 sm:grid-cols-2">
          {EMOTIONS.map((emotion) => (
            <Button key={emotion} className="justify-start rounded-[1.5rem]" onClick={() => handleEmotion(emotion)}>
              {formatEmotionLabel(emotion)}
            </Button>
          ))}
        </div>
      ) : null}

      {step === "category" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              className="justify-start rounded-[1.25rem]"
              variant={draft.category === category ? "default" : "outline"}
              onClick={() => handleCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      ) : null}

      {step === "message" ? (
        <div className="space-y-4">
          <Textarea
            maxLength={MAX_CHARS}
            placeholder="Write your prayer request or gratitude here. Guardian will sanitize obvious PII before submission."
            value={draft.message}
            onChange={(event) =>
              setDraft((current) => ({ ...current, message: event.target.value }))
            }
          />
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className={messageValid ? "text-[var(--primary)]" : "text-[var(--destructive)]"}>
              {characterCount}/{MAX_CHARS} characters
            </span>
            <Button disabled={!messageValid} onClick={handleMessageAdvance}>
              Run Guardian
            </Button>
          </div>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Minimum {MIN_CHARS} characters. Crisis content interrupts the flow and
            redirects to support.
          </p>
          {guardianNotes.length > 0 ? (
            <ul className="space-y-2 rounded-[1rem] border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 p-4 text-sm text-[var(--foreground)]">
              {guardianNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {step === "support" ? (
        <div className="space-y-4 rounded-[1.5rem] border border-[var(--destructive)]/30 bg-[var(--destructive)]/8 p-5">
          {guardianOutcome === "redirect_crisis" ? (
            <p className="text-sm leading-7 text-[var(--foreground)]">
              If the message suggests crisis or self-harm, do not continue the
              posting flow. Show NCMH (1553) and Hopeline first.
            </p>
          ) : (
            <p className="text-sm leading-7 text-[var(--foreground)]">
              Guardian has checked the draft. Continue to translation and
              wording options before this prototype reaches persistence.
            </p>
          )}
          {guardianNotes.length > 0 ? (
            <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
              {guardianNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setStep("translate_opt")}>
              {guardianOutcome === "redirect_crisis" ? "Continue prototype" : "Continue"}
            </Button>
            <Button variant="outline" onClick={resetFlow}>
              Reset
            </Button>
          </div>
        </div>
      ) : null}

      {step === "translate_opt" ? ( // STALE STEP: translate_opt removed from active flow
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
              <Button
                key={code}
                variant={draft.translatedTo === code ? "default" : "outline"}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    translatedTo: code as PrototypeShareDraft["translatedTo"],
                  }))
                }
              >
                {label}
              </Button>
            ))}
          </div>
          <Button onClick={() => setStep("wording")}>Save translation preference</Button>
        </div>
      ) : null}

      {step === "wording" ? ( // STALE STEP: wording removed from active flow
        <div className="space-y-4">
          <label className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--border)] bg-white/70 p-4 text-sm">
            <input
              checked={draft.wantsWordingHelp}
              className="h-4 w-4 accent-[var(--primary)]"
              type="checkbox"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  wantsWordingHelp: event.target.checked,
                }))
              }
            />
            Help me with wording, but preserve meaning.
          </label>
          <Button onClick={() => setStep("done")}>Finish flow</Button>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-3 rounded-[1.5rem] bg-[var(--primary)]/10 p-5">
          <p className="text-sm leading-7 text-[var(--foreground)]">
            Draft captured with emotion, category, Guardian pass, translation
            preference, and wording intent.
          </p>
          <pre className="overflow-x-auto rounded-[1rem] bg-[#1f2f25] p-4 text-xs leading-6 text-[#f7f4ec]">
            {JSON.stringify(draft, null, 2)}
          </pre>
          <Button variant="secondary" onClick={resetFlow}>
            Start fresh share
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function stepTitle(step: PrototypeShareStep) {
  switch (step) {
    case "welcome":
      return "Emotion selection first.";
    case "category":
      return "Choose the life area for this post.";
    case "message":
      return "Write the message and validate it.";
    case "support":
      return "Guardian support checkpoint.";
    case "translate_opt":
      return "Offer translation, never force it.";
    case "wording":
      return "Optional wording help only.";
    case "done":
      return "Structured prayer draft complete.";
  }
}

function stepDescription(step: PrototypeShareStep) {
  switch (step) {
    case "welcome":
      return "The flow cannot begin anywhere else. Grateful or Struggling sets the tone of the whole submission.";
    case "category":
      return "Structured categories keep the wall organized without introducing identity or social ranking.";
    case "message":
      return "Use Guardian before the draft can progress. Names, phone numbers, and exact locations are scrubbed.";
    case "support":
      return "Crisis language must interrupt normal posting and redirect to immediate help resources.";
    case "translate_opt":
      return "Plan for English-first UI with Tagalog and Bisaya assistance across user-generated content.";
    case "wording":
      return "Wording help can clarify phrasing, but it cannot change the user's intent.";
    case "done":
      return "This is the point where persistence can later replace sample data and local state.";
  }
}

function getStepLabel(step: PrototypeShareStep) {
  switch (step) {
    case "welcome":
      return "Step 1";
    case "category":
      return "Step 2";
    case "message":
      return "Step 3";
    case "support":
      return "Step 4";
    case "translate_opt":
      return "Step 5";
    case "wording":
      return "Step 6";
    case "done":
      return "Complete";
  }
}

function formatEmotionLabel(emotion: Emotion) {
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
}
