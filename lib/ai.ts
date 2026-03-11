import { checkSafety, runGuardian } from "@/lib/guardian";

export interface GuardianAIResult {
  scrubbedMessage: string;
  isCrisis: boolean;
  isSafe: boolean;
  feedback: string;
}

export interface IntentResult {
  isSafe: boolean;
  reason: "malice" | "profanity" | "spam" | "safe";
}

type IntentUnsafeReason = Exclude<IntentResult["reason"], "safe">;
type UnsafeReviewReason =
  | "malice"
  | "profanity"
  | "spam"
  | "pii_phone"
  | "pii_email"
  | "pii_social"
  | "pii_full_name"
  | "pii_location"
  | "fallback";

const REVIEW_FEEDBACK = {
  crisis: {
    crisis:
      "You may be carrying something very heavy. GraceFul can hold a quiet moment with you, but you may also need immediate support beyond this space. Please reach out to National Center for Mental Health (1553) or Hopeline if you can.",
  },
  unsafe: {
    profanity:
      "GraceFul is meant to be a respectful and supportive space. Please adjust the language in your message before sharing.",
    malice:
      "GraceFul is a space for healing and peace. Some parts of your message may come across as hurtful. Please rephrase it with care before sharing.",
    spam: "GraceFul is for sincere prayer and support. Please remove promotional or repetitive language before sharing.",
    pii_phone: "📱 Phone number removed for privacy.",
    pii_email: "📧 Email address removed for privacy.",
    pii_social: "👥 Social media handle removed for privacy.",
    pii_full_name: "🪪 Full name removed for anonymity.",
    pii_location: "📍 Specific location removed for safety.",
    fallback:
      "This space is meant to stay calm, respectful, and sincere. Please soften or revise your message before sharing.",
  },
  safe: {
    clean: "This looks ready to share.",
    sanitizedPrefix: "We softened a few sensitive details:",
  },
} as const;

export async function analyzeIntent(message: string): Promise<IntentResult> {
  const safety = checkSafety(message);

  if (!safety.isSafe && safety.reason && safety.reason !== "pii") {
    return { isSafe: false, reason: safety.reason };
  }

  return { isSafe: true, reason: "safe" };
}

function getPiiReviewReason(foundDetail: string | null): UnsafeReviewReason {
  if (foundDetail?.includes("phone")) {
    return "pii_phone";
  }

  if (foundDetail?.includes("email")) {
    return "pii_email";
  }

  if (foundDetail?.includes("social")) {
    return "pii_social";
  }

  if (foundDetail?.includes("full name")) {
    return "pii_full_name";
  }

  return "pii_location";
}

// TODO: Replace simulated review with server-backed Guardian decision.
// See planning.md Phase 2 — Guardian backend boundary.
// DEPRECATED: Replaced by reviewPostServerSide in lib/db.ts via Edge Function.
// Retained for reference only. Do not call from product code.
export async function runGuardianReview(
  userMessage: string,
): Promise<GuardianAIResult> {
  const guardianResult = runGuardian(userMessage);
  const safety = checkSafety(userMessage);
  const intentResult = await analyzeIntent(userMessage);

  if (guardianResult.outcome === "redirect_crisis") {
    return {
      scrubbedMessage: guardianResult.sanitizedMessage,
      isCrisis: true,
      isSafe: false,
      feedback: REVIEW_FEEDBACK.crisis.crisis,
    };
  }

  if (!intentResult.isSafe) {
    const unsafeReason = intentResult.reason as IntentUnsafeReason;

    return {
      scrubbedMessage: guardianResult.sanitizedMessage,
      isCrisis: false,
      isSafe: false,
      feedback: REVIEW_FEEDBACK.unsafe[unsafeReason],
    };
  }

  if (!safety.isSafe) {
    if (safety.reason === "pii") {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback: REVIEW_FEEDBACK.unsafe[getPiiReviewReason(safety.foundDetail)],
      };
    }

    if (safety.reason === "malice" || safety.reason === "profanity" || safety.reason === "spam") {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback: REVIEW_FEEDBACK.unsafe.fallback,
      };
    }
  }

  return {
    scrubbedMessage: guardianResult.sanitizedMessage,
    isCrisis: false,
    isSafe: true,
    feedback:
      guardianResult.reasons.length > 0
        ? `${REVIEW_FEEDBACK.safe.sanitizedPrefix} ${guardianResult.reasons.join(" ")}`
        : REVIEW_FEEDBACK.safe.clean,
  };
}
