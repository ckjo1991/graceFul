import { MAX_CHARS, MIN_CHARS } from "@/lib/constants";
import { checkCrisis } from "@/lib/guardian/crisis";
import {
  checkPII,
  containsLikelyFullName,
  escapeRegexLiteral,
  LOCATION_PATTERN,
  NAME_PATTERN,
  redactLikelyFullNames,
  scrubPII,
} from "@/lib/guardian/pii";
import { analyzeSpam } from "@/lib/guardian/spam";
import { containsPattern } from "@/lib/guardian/utils";
import { hasViolentIntent } from "@/lib/guardian/violent-intent";
import type { GuardianResult } from "@/types";

const FORBIDDEN_WORDS = [
  "fuck",
  "gago",
  "puta",
  "tangina",
  "hell",
  "crap",
  "pissed",
];
const COOLDOWN_MS = 60000;

type SafetyCheckResult = {
  isSafe: boolean;
  reason: "malice" | "pii" | "profanity" | "spam" | null;
  foundDetail: string | null;
};

export function validateMessageLength(message: string) {
  const length = message.trim().length;

  if (length < MIN_CHARS) {
    return `Message must be at least ${MIN_CHARS} characters.`;
  }

  if (length > MAX_CHARS) {
    return `Message must be at most ${MAX_CHARS} characters.`;
  }

  return null;
}

function matchProfanity(text: string): string | null {
  for (const word of FORBIDDEN_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegexLiteral(word)}\\b`, "i");

    if (pattern.test(text)) {
      return word;
    }
  }

  return null;
}

export const checkProfanity = (text: string): boolean => {
  return matchProfanity(text) !== null;
};

export const checkSafety = (text: string): SafetyCheckResult => {
  const matchedProfanity = matchProfanity(text);
  if (matchedProfanity) {
    return { isSafe: false, reason: "profanity", foundDetail: matchedProfanity };
  }

  if (hasViolentIntent(text)) {
    return { isSafe: false, reason: "malice", foundDetail: "violent intent" };
  }

  const spamAssessment = analyzeSpam(text);
  if (spamAssessment.shouldBlock) {
    return {
      isSafe: false,
      reason: "spam",
      foundDetail: spamAssessment.signals.join(","),
    };
  }

  const piiCheck = checkPII(text);
  if (piiCheck.hasPhone || piiCheck.hasEmail || piiCheck.hasSocial) {
    return {
      isSafe: false,
      reason: "pii",
      foundDetail: "personal contact info",
    };
  }

  if (piiCheck.hasHospitalLocation) {
    return {
      isSafe: false,
      reason: "pii",
      foundDetail: "hospital/location",
    };
  }

  if (piiCheck.hasFullName) {
    return { isSafe: false, reason: "pii", foundDetail: "full name" };
  }

  return { isSafe: true, reason: null, foundDetail: null };
};

export const canPost = (
  lastPostTime: number | null,
): { allowed: boolean; waitTime: number } => {
  if (!lastPostTime) return { allowed: true, waitTime: 0 };

  const now = Date.now();
  const timeDiff = now - lastPostTime;

  if (timeDiff < COOLDOWN_MS) {
    return {
      allowed: false,
      waitTime: Math.ceil((COOLDOWN_MS - timeDiff) / 1000),
    };
  }

  return { allowed: true, waitTime: 0 };
};

export function runGuardian(rawMessage: string): GuardianResult {
  const crisisHit = checkCrisis(rawMessage);

  if (crisisHit) {
    return {
      outcome: "redirect_crisis",
      sanitizedMessage: rawMessage.trim(),
      reasons: ["Potential crisis language detected."],
    };
  }

  const safety = checkSafety(rawMessage);

  if (!safety.isSafe) {
    if (safety.reason === "malice") {
      return {
        outcome: "block",
        sanitizedMessage: rawMessage.trim(),
        reasons: ["Harmful intent detected. Please rephrase."],
      };
    }

    if (safety.reason === "profanity") {
      return {
        outcome: "block",
        sanitizedMessage: rawMessage.trim(),
        reasons: ["Offensive language detected. Please rephrase."],
      };
    }

    if (safety.reason === "spam") {
      return {
        outcome: "block",
        sanitizedMessage: rawMessage.trim(),
        reasons: ["Likely spam or promotional content detected. Please rephrase."],
      };
    }
  }

  let sanitizedMessage = rawMessage.trim();
  const reasons: string[] = [];
  const piiCheck = checkPII(sanitizedMessage);

  if (
    piiCheck.hasPhone ||
    piiCheck.hasEmail ||
    piiCheck.hasSocial ||
    piiCheck.hasHospitalLocation
  ) {
    sanitizedMessage = scrubPII(sanitizedMessage);
    if (piiCheck.hasPhone) reasons.push("Phone number removed.");
    if (piiCheck.hasEmail) reasons.push("Email removed.");
    if (piiCheck.hasSocial) reasons.push("Social link removed.");
    if (piiCheck.hasHospitalLocation) reasons.push("Hospital/location generalized.");
  }

  if (containsPattern(sanitizedMessage, NAME_PATTERN)) {
    sanitizedMessage = sanitizedMessage.replaceAll(
      NAME_PATTERN,
      "[redacted identity]",
    );
    reasons.push("Name reference removed.");
  }

  if (containsLikelyFullName(sanitizedMessage)) {
    const redactedMessage = redactLikelyFullNames(
      sanitizedMessage,
      "[redacted name]",
    );

    if (redactedMessage !== sanitizedMessage) {
      sanitizedMessage = redactedMessage;
      reasons.push("Full name removed.");
    }
  }

  if (containsPattern(sanitizedMessage, LOCATION_PATTERN)) {
    sanitizedMessage = sanitizedMessage.replaceAll(
      LOCATION_PATTERN,
      "[redacted location]",
    );
    reasons.push("Specific location removed.");
  }

  if (reasons.length > 0) {
    return { outcome: "sanitize", sanitizedMessage, reasons };
  }

  return { outcome: "allow", sanitizedMessage, reasons: [] };
}
