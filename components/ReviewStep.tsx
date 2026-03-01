"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";

import WordingAssist from "@/components/WordingAssist";
import { runGuardianAI } from "@/lib/ai";

interface ReviewStepProps {
  isPosting: boolean;
  message: string;
  onBack: () => void;
  onCrisisDetected: () => void;
  onPost: (finalMessage: string) => Promise<void>;
}

export default function ReviewStep({
  isPosting,
  message,
  onBack,
  onCrisisDetected,
  onPost,
}: ReviewStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSafe, setIsSafe] = useState(true);
  const [displayMessage, setDisplayMessage] = useState("");
  const [feedback, setFeedback] = useState("Guardian is reviewing your message.");
  const [isWordingAssistOpen, setIsWordingAssistOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const analyze = async () => {
      setIsAnalyzing(true);
      setIsSafe(true);
      setIsWordingAssistOpen(false);
      console.log("ReviewStep received draft:", message);

      try {
        const result = await runGuardianAI(message);

        if (!isActive) {
          return;
        }

        console.log("ReviewStep Guardian result:", result);

        if (result.isCrisis) {
          onCrisisDetected();
          return;
        }

        setDisplayMessage(result.scrubbedMessage);
        setIsSafe(result.isSafe);
        setFeedback(result.feedback);
      } catch {
        if (!isActive) {
          return;
        }

        setDisplayMessage(message);
        setIsSafe(true);
        setFeedback("Guardian could not finish analysis, so the original draft is shown.");
      } finally {
        if (isActive) {
          setIsAnalyzing(false);
        }
      }
    };

    void analyze();

    return () => {
      isActive = false;
    };
  }, [message, onCrisisDetected]);

  const handleWordingConfirm = (finalMessage: string) => {
    console.log("ReviewStep wording confirmed:", finalMessage);
    setDisplayMessage(finalMessage);
    setFeedback("Wording updated. Review the version you selected before sharing.");
    setIsWordingAssistOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col items-start">
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-sm text-muted transition-colors hover:text-primary"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </button>
        <h2 className="text-2xl font-serif font-bold text-primary-dark">
          Review your message
        </h2>
        <p className="mt-1 text-sm text-text-light">
          One last look before sharing with the community.
        </p>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-border bg-white p-6 shadow-sm">
        <div className="absolute right-0 top-0 p-2">
          <ShieldCheck className="h-5 w-5 text-accent opacity-50" />
        </div>
        {isAnalyzing ? (
          <div className="flex min-h-28 items-center gap-3 text-text-light">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="font-semibold text-primary-dark">Guardian is thinking...</p>
              <p className="text-sm">
                Checking for sensitive details and making sure this is safe to share.
              </p>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-text">
            {displayMessage}
          </p>
        )}
      </div>

      {!isWordingAssistOpen ? (
        <button
          onClick={() => setIsWordingAssistOpen(true)}
          disabled={isAnalyzing || !isSafe || !displayMessage}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-accent px-4 py-3 font-semibold text-primary transition-all hover:bg-accent/10 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          ✨ Help me with wording
        </button>
      ) : (
        <div className="mb-8 space-y-3">
          <WordingAssist
            originalMessage={displayMessage || message}
            onConfirm={handleWordingConfirm}
          />
          <button
            onClick={() => setIsWordingAssistOpen(false)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-bg-warm"
          >
            Keep current wording
          </button>
        </div>
      )}

      <div className="mb-8 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-primary-dark">
          <strong>GraceFul Guardian:</strong> {feedback}
        </p>
      </div>

      <button
        onClick={() => {
          console.log("ReviewStep submitting:", {
            originalMessage: message,
            displayMessage,
            isSafe,
            isPosting,
          });
          void onPost(displayMessage);
        }}
        disabled={
          isAnalyzing || isPosting || isWordingAssistOpen || !isSafe || !displayMessage
        }
        className="w-full rounded-xl bg-primary-dark py-4 font-bold text-white shadow-lg transition-all hover:bg-[#1b3d26] active:scale-[0.98]"
      >
        {isPosting ? "Checking intent..." : "Share Anonymously 🌿"}
      </button>
    </div>
  );
}
