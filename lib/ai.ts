import {
  analyzeSpam,
  checkCrisis,
  checkProfanity,
  checkSafety,
  hasViolentIntent,
  runGuardian,
} from "@/lib/guardian";

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

/**
 * Analyzes message for harmful intent across multiple languages.
 * Detects:
 * - Direct harm wishes: "I hope he dies" (English)
 * - Implicit curses: "Sana karmahin siya" (Tagalog - I hope karma gets him)
 * - Vehicle/accident harm: "I wish a car hits him" (any language)
 * - Wishes for loss: "I hope they lose everything" (any language)
 * - Profanity attacks: "gago", "fuck", etc.
 */
export async function analyzeIntent(message: string): Promise<IntentResult> {
  const translated = message; // placeholder for future multilingual support

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (checkProfanity(translated)) {
    return { isSafe: false, reason: "profanity" };
  }

  if (hasViolentIntent(translated)) {
    return { isSafe: false, reason: "malice" };
  }

  const spamAssessment = analyzeSpam(translated);
  if (spamAssessment.shouldBlock) {
    return { isSafe: false, reason: "spam" };
  }

  return { isSafe: true, reason: "safe" };
}

// Simulated review pass used by the review screen before local posting.
export async function runGuardianReview(
  userMessage: string,
): Promise<GuardianAIResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const guardianResult = runGuardian(userMessage);
  const isCrisis =
    guardianResult.outcome === "redirect_crisis" || checkCrisis(userMessage);
  const safety = checkSafety(userMessage);
  const intentResult = await analyzeIntent(userMessage);

  // Level 3: CRISIS (Most Critical)
  if (isCrisis) {
    return {
      scrubbedMessage: guardianResult.sanitizedMessage,
      isCrisis: true,
      isSafe: false,
      feedback:
        "You may be carrying something very heavy. GraceFul can hold a quiet moment with you, but you may also need immediate support beyond this space. Please reach out to National Center for Mental Health (1553) or Hopeline if you can.",
    };
  }

  // Level 2: MALICE & INTENT (Safety)
  if (!intentResult.isSafe) {
    if (intentResult.reason === "profanity") {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback:
          "GraceFul is meant to be a respectful and supportive space. Please adjust the language in your message before sharing.",
      };
    }

    if (intentResult.reason === "malice") {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback:
          "GraceFul is a space for healing and peace. Some parts of your message may come across as hurtful. Please rephrase it with care before sharing.",
      };
    }

    if (intentResult.reason === "spam") {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback:
          "GraceFul is for sincere prayer and support. Please remove promotional or repetitive language before sharing.",
      };
    }
  }

  // Level 1: PII (Privacy)
  if (!safety.isSafe) {
    if (safety.reason === "pii") {
      const feedback = safety.foundDetail?.includes("phone")
        ? "📱 Phone number removed for privacy."
        : safety.foundDetail?.includes("email")
          ? "📧 Email address removed for privacy."
          : safety.foundDetail?.includes("social")
            ? "👥 Social media handle removed for privacy."
            : safety.foundDetail?.includes("full name")
              ? "🪪 Full name removed for anonymity."
              : "📍 Specific location removed for safety.";

      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback,
      };
    }

    if (
      safety.reason === "malice" ||
      safety.reason === "profanity" ||
      safety.reason === "spam"
    ) {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback:
          "This space is meant to stay calm, respectful, and sincere. Please soften or revise your message before sharing.",
      };
    }
  }

  return {
    scrubbedMessage: guardianResult.sanitizedMessage,
    isCrisis: false,
    isSafe: true,
    feedback:
      guardianResult.reasons.length > 0
        ? `We softened a few sensitive details: ${guardianResult.reasons.join(" ")}`
        : "This looks ready to share.",
  };
}
