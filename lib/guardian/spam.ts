const SPAM_PROMO_TERMS = [
  "buy now",
  "pm me",
  "guaranteed",
  "investment",
  "crypto",
  "forex",
  "casino",
  "loan",
  "sign up",
  "earn money",
  "passive income",
  "coaching program",
  "make money from home",
  "deliverance sessions",
  "deliverance session",
  "online coaching program",
];
const SPAM_SOLICITATION_PATTERNS = [
  /\bdonate\b/i,
  /\braising funds?\b/i,
  /\bpaypal\b/i,
  /\bgcash\b/i,
  /\bany amount helps\b/i,
  /\bsend support\b/i,
];
const SPAM_RECRUITMENT_PATTERNS = [
  /\bjoin\b[\s\S]{0,30}\b(?:facebook|discord|telegram|group|circle)\b/i,
  /\bfacebook group\b/i,
  /\bchurch discord\b/i,
  /\bprayer circle\b/i,
  /\bsearch\b[\s\S]{0,40}\b(?:prayer circle|group)\b/i,
];
const SPAM_CHAIN_MESSAGE_PATTERNS = [
  /\bshare this with five people\b/i,
  /\btype amen\b/i,
  /\bpass this message along\b/i,
  /\bwatch what happens\b/i,
];
const SPAM_AFFILIATE_PATTERNS = [
  /\bthis program helped me earn money online\b/i,
  /\bearn money online\b/i,
  /\bhighly recommended\b/i,
];
const SPAM_LINK_OR_HANDLE_PATTERN =
  /(?:https?:\/\/|www\.|t\.me\/|wa\.me\/|(?:^|\s)@[a-z0-9_]{2,})/i;
const SPAM_PUNCTUATION_PATTERN = /[!?]/g;
const SPAM_UPPERCASE_PATTERN = /[A-Z]/g;
const SPAM_ALPHA_PATTERN = /[A-Za-z]/g;
const SPAM_TOKEN_PATTERN = /[a-z0-9]+/g;

export type SpamSignal =
  | "url_or_handle"
  | "promo_keywords"
  | "solicitation_keywords"
  | "recruitment_keywords"
  | "chain_message"
  | "affiliate_style"
  | "repeated_token_burst"
  | "excess_punctuation"
  | "high_caps_ratio";

export const SPAM_SIGNAL_NAMES: readonly SpamSignal[] = [
  "url_or_handle",
  "promo_keywords",
  "solicitation_keywords",
  "recruitment_keywords",
  "chain_message",
  "affiliate_style",
  "repeated_token_burst",
  "excess_punctuation",
  "high_caps_ratio",
] as const;

export type SpamAssessment = {
  score: number;
  signals: SpamSignal[];
  shouldBlock: boolean;
  shouldFlag: boolean;
};

function hasRepeatedTokenBurst(text: string): boolean {
  const tokens = text.toLowerCase().match(SPAM_TOKEN_PATTERN) ?? [];
  const tokenCounts = new Map<string, number>();

  for (const token of tokens) {
    if (token.length <= 1) {
      continue;
    }

    tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
  }

  return [...tokenCounts.values()].some((count) => count >= 4);
}

function matchesAnyPattern(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function analyzeSpam(text: string): SpamAssessment {
  const signals: SpamSignal[] = [];
  let score = 0;
  const lowerText = text.toLowerCase();

  if (SPAM_LINK_OR_HANDLE_PATTERN.test(text)) {
    signals.push("url_or_handle");
    score += 4;
  }

  if (SPAM_PROMO_TERMS.some((term) => lowerText.includes(term))) {
    signals.push("promo_keywords");
    score += 2;
  }

  if (matchesAnyPattern(text, SPAM_SOLICITATION_PATTERNS)) {
    signals.push("solicitation_keywords");
    score += 4;
  }

  if (matchesAnyPattern(text, SPAM_RECRUITMENT_PATTERNS)) {
    signals.push("recruitment_keywords");
    score += 4;
  }

  if (matchesAnyPattern(text, SPAM_CHAIN_MESSAGE_PATTERNS)) {
    signals.push("chain_message");
    score += 4;
  }

  if (matchesAnyPattern(text, SPAM_AFFILIATE_PATTERNS)) {
    signals.push("affiliate_style");
    score += 2;
  }

  if (hasRepeatedTokenBurst(text)) {
    signals.push("repeated_token_burst");
    score += 2;
  }

  const punctuationCount = (text.match(SPAM_PUNCTUATION_PATTERN) ?? []).length;
  if (punctuationCount >= 6) {
    signals.push("excess_punctuation");
    score += 1;
  }

  const uppercaseCount = (text.match(SPAM_UPPERCASE_PATTERN) ?? []).length;
  const alphaCount = (text.match(SPAM_ALPHA_PATTERN) ?? []).length;
  const capsRatio = alphaCount === 0 ? 0 : uppercaseCount / alphaCount;
  if (text.length >= 30 && capsRatio >= 0.6) {
    signals.push("high_caps_ratio");
    score += 1;
  }

  return {
    score,
    signals,
    shouldBlock: score >= 4,
    shouldFlag: score >= 2 && score <= 3,
  };
}
