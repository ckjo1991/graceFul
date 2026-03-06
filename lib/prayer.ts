import {
  checkCrisis,
  checkProfanity,
  checkSafety,
  hasViolentIntent,
  scrubPII,
} from "@/lib/guardian";

export type PrayerValidationFailureReason =
  | "too_short"
  | "crisis"
  | "profanity"
  | "malice"
  | "spam"
  | "pii";

export type PrayerValidationResult =
  | {
      allowed: true;
      sanitizedText: string;
    }
  | {
      allowed: false;
      reason: PrayerValidationFailureReason;
    };

export function validatePrayerSubmission(prayerText: string): PrayerValidationResult {
  const trimmedPrayer = prayerText.trim();

  if (trimmedPrayer.length < 5) {
    return { allowed: false, reason: "too_short" };
  }

  if (checkCrisis(trimmedPrayer)) {
    return { allowed: false, reason: "crisis" };
  }

  if (checkProfanity(trimmedPrayer)) {
    return { allowed: false, reason: "profanity" };
  }

  if (hasViolentIntent(trimmedPrayer)) {
    return { allowed: false, reason: "malice" };
  }

  const safety = checkSafety(trimmedPrayer);
  if (!safety.isSafe) {
    return {
      allowed: false,
      reason: safety.reason as "pii" | "profanity" | "malice" | "spam",
    };
  }

  return {
    allowed: true,
    sanitizedText: scrubPII(trimmedPrayer),
  };
}
