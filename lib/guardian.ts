import { MAX_CHARS, MIN_CHARS } from "@/lib/constants";
import type { GuardianResult } from "@/types";

export const CRISIS_KEYWORDS = [
  "suicide",
  "end it all",
  "kill myself",
  "ayoko na",
  "mamatay",
  "hopeless",
  "self-harm",
  "wala nang pag-asa",
];

const HARM_VERBS = [
  "kill",
  "murder",
  "shoot",
  "stab",
  "hit by",
  "run over",
  "beat",
  "hurt",
  "burn",
  "hang",
  "poison",
  "slay",
  "massacre",
  "wipe out",
];

const INTENT_PHRASES = [
  "i want",
  "i wish",
  "i hope",
  "i pray",
  "someone should",
  "let's",
  "lets",
  "we should",
  "i would like",
];

const TARGET_PATTERN =
  /\b(him|her|them|someone|somebody|my\s+(?:dad|mom|mother|father|boss|sister|brother|friend|wife|husband|partner)|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/;

const LOWERCASE_TARGET_PATTERN =
  /\b(him|her|them|someone|somebody|my\s+(?:dad|mom|mother|father|boss|sister|brother|friend|wife|husband|partner))\b/;

const ALT_VIOLENT_INTENT_PATTERN =
  /\b(?:hope|wish|pray)\b[\s\S]{0,60}\b(?:him|her|them|someone|somebody|my\s+(?:dad|mom|mother|father|boss|sister|brother|friend|wife|husband|partner)|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b[\s\S]{0,40}\b(?:die|dies|dead|gone)\b/i;

export const PHILIPPINE_RESOURCES = {
  ncmh: {
    name: "National Center for Mental Health",
    hotline: "1553",
    mobile: "0917-899-8727",
  },
  hopeline: {
    name: "Hopeline Philippines",
    mobile: "0917-558-4673",
    landline: "(02) 8804-4673",
  },
};

const PHONE_PATTERN = /\b(?:\+63|0)9\d{9}\b/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SOCIAL_PATTERN =
  /(@[a-zA-Z0-9._]+)|(facebook\.com\/[a-zA-Z0-9._]+)|(fb\.me\/[a-zA-Z0-9._]+)/gi;
const LOCATION_PATTERN =
  /\b(?:street|st\.|barangay|brgy\.|avenue|ave\.|city hall|subdivision)\b/gi;
const NAME_PATTERN = /\b(?:ako si|my name is|name ko si)\s+[a-z][a-z\s'-]{1,30}\b/gi;
const FULL_NAME_PATTERN =
  /\b([A-Z][a-z]+(?:[-'][A-Z][a-z]+)?\s+[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?)\b/g;
const COOLDOWN_MS = 60000;

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

export const checkCrisis = (text: string): boolean => {
  const lowerText = text.toLowerCase();

  return CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));
};

export function hasViolentIntent(text: string): boolean {
  const lowerText = text.toLowerCase();
  const hasVerb = HARM_VERBS.some((verb) => lowerText.includes(verb));
  const hasIntent = INTENT_PHRASES.some((phrase) => lowerText.includes(phrase));
  const hasTarget =
    LOWERCASE_TARGET_PATTERN.test(lowerText) || TARGET_PATTERN.test(text);

  return (hasVerb && hasIntent && hasTarget) || ALT_VIOLENT_INTENT_PATTERN.test(text);
}

export const checkSafety = (
  text: string,
): {
  isSafe: boolean;
  reason: "malice" | "pii" | null;
  foundDetail: string | null;
} => {
  const lowerText = text.toLowerCase();
  const forbiddenWords = ["fuck", "gago", "puta", "tangina"];
  const namePattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;

  for (const word of forbiddenWords) {
    if (lowerText.includes(word)) {
      return {
        isSafe: false,
        reason: "malice",
        foundDetail: word,
      };
    }
  }

  if (hasViolentIntent(text)) {
    return {
      isSafe: false,
      reason: "malice",
      foundDetail: "violent intent",
    };
  }

  if (
    containsPattern(text, PHONE_PATTERN) ||
    containsPattern(text, EMAIL_PATTERN) ||
    containsPattern(text, SOCIAL_PATTERN)
  ) {
    return {
      isSafe: false,
      reason: "pii",
      foundDetail: "personal contact info",
    };
  }

  if (namePattern.test(text)) {
    return {
      isSafe: false,
      reason: "pii",
      foundDetail: "full name",
    };
  }

  return { isSafe: true, reason: null, foundDetail: null };
};

export const scrubPII = (text: string): string => {
  let sanitized = text;

  // Every pattern used with replaceAll must be global.
  const PHONE_PATTERN = /(\+?63|0)9\d{9}/g;
  const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const SOCIAL_PATTERN = /(@|facebook\.com\/|twitter\.com\/)[a-zA-Z0-9._-]+/gi;
  const FULL_NAME_PATTERN = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
  const LOCATION_PATTERN =
    /(St\.|Hospital|Clinic|Avenue|Brgy\.)\s+[A-Z][a-z]+/g;

  try {
    sanitized = sanitized.replaceAll(PHONE_PATTERN, "[phone removed]");
    sanitized = sanitized.replaceAll(EMAIL_PATTERN, "[email removed]");
    sanitized = sanitized.replaceAll(SOCIAL_PATTERN, "[social link removed]");
    sanitized = sanitized.replaceAll(FULL_NAME_PATTERN, "[name removed]");
    sanitized = sanitized.replaceAll(LOCATION_PATTERN, "[location generalized]");
  } catch (e) {
    console.error("Scrubbing failed:", e);
  }

  return sanitized;
};

export const canPost = (
  lastPostTime: number | null,
): { allowed: boolean; waitTime: number } => {
  if (!lastPostTime) {
    return { allowed: true, waitTime: 0 };
  }

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

  let sanitizedMessage = rawMessage.trim();
  const reasons: string[] = [];

  if (containsPattern(sanitizedMessage, PHONE_PATTERN)) {
    sanitizedMessage = scrubPII(sanitizedMessage);
    reasons.push("Phone number removed.");
  }

  if (containsPattern(sanitizedMessage, NAME_PATTERN)) {
    sanitizedMessage = sanitizedMessage.replaceAll(NAME_PATTERN, "[redacted identity]");
    reasons.push("Name reference removed.");
  }

  if (containsPattern(sanitizedMessage, FULL_NAME_PATTERN)) {
    sanitizedMessage = sanitizedMessage.replaceAll(
      FULL_NAME_PATTERN,
      "[redacted name]",
    );
    reasons.push("Full name removed.");
  }

  if (containsPattern(sanitizedMessage, LOCATION_PATTERN)) {
    sanitizedMessage = sanitizedMessage.replaceAll(LOCATION_PATTERN, "[redacted location]");
    reasons.push("Specific location removed.");
  }

  if (reasons.length > 0) {
    return {
      outcome: "sanitize",
      sanitizedMessage,
      reasons,
    };
  }

  return {
    outcome: "allow",
    sanitizedMessage,
    reasons: [],
  };
}

function containsPattern(value: string, pattern: RegExp) {
  const scopedPattern = new RegExp(pattern.source, pattern.flags);

  return scopedPattern.test(value);
}
