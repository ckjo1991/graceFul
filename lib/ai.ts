import {
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
  reason: "malice" | "profanity" | "safe";
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
        "🆘 Crisis detected. Your safety matters. Redirecting to National Center for Mental Health (1553) and Hopeline support.",
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
          "⚠️ Guardian Warning: Offensive language detected. Please rephrase with kindness and respect.",
      };
    }

    if (intentResult.reason === "malice") {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback:
          "⚠️ Guardian Warning: Harmful intent detected (wishing ill on someone). Please share your heart without malice.",
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

    if (safety.reason === "malice" || safety.reason === "profanity") {
      return {
        scrubbedMessage: guardianResult.sanitizedMessage,
        isCrisis: false,
        isSafe: false,
        feedback:
          "⚠️ Guardian Warning: Harmful language detected. Please soften your words before sharing.",
      };
    }
  }

  return {
    scrubbedMessage: guardianResult.sanitizedMessage,
    isCrisis: false,
    isSafe: true,
    feedback:
      guardianResult.reasons.length > 0
        ? `✨ Guardian generalized sensitive details: ${guardianResult.reasons.join(" ")}`
        : "✓ Looks good! Ready to share.",
  };
}
