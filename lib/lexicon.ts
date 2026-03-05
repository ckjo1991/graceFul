// lib/lexicon.ts
// Loads harm-lexicon.json and exposes checkLexicon().
// Returns signal type: violent_intent | crisis | profanity | none
// Sits as Gate 1 before regex and LLM checks in the guardian pipeline.

import lexiconData from "@/data/harm-lexicon.json";

type SignalType = "violent_intent" | "crisis" | "profanity";

type SignalEntry = {
  exact: string[];
  patterns: string[];
};

type LanguageEntry = {
  violent_intent: SignalEntry;
  crisis: SignalEntry;
  profanity: SignalEntry;
};

type UniversalEntry = {
  violent_intent: SignalEntry;
  crisis: SignalEntry;
  profanity: SignalEntry;
};

type LexiconData = {
  version: string;
  languages: Record<string, LanguageEntry>;
  universal: UniversalEntry;
};

const lexicon = lexiconData as LexiconData;

// Compile all regex patterns once at module load
type CompiledEntry = {
  exact: string[];
  patterns: RegExp[];
};

type CompiledLanguage = Record<SignalType, CompiledEntry>;

const compiled: Record<string, CompiledLanguage> = {};

for (const [lang, entry] of Object.entries(lexicon.languages)) {
  compiled[lang] = {
    violent_intent: {
      exact: entry.violent_intent.exact,
      patterns: entry.violent_intent.patterns.map((p) => new RegExp(p, "i")),
    },
    crisis: {
      exact: entry.crisis.exact,
      patterns: entry.crisis.patterns.map((p) => new RegExp(p, "i")),
    },
    profanity: {
      exact: entry.profanity.exact,
      patterns: entry.profanity.patterns.map((p) => new RegExp(p, "i")),
    },
  };
}

// Universal
compiled["universal"] = {
  violent_intent: {
    exact: lexicon.universal.violent_intent.exact,
    patterns: lexicon.universal.violent_intent.patterns.map((p) => new RegExp(p, "i")),
  },
  crisis: {
    exact: lexicon.universal.crisis.exact,
    patterns: lexicon.universal.crisis.patterns.map((p) => new RegExp(p, "i")),
  },
  profanity: {
    exact: lexicon.universal.profanity.exact,
    patterns: lexicon.universal.profanity.patterns.map((p) => new RegExp(p, "i")),
  },
};

export type LexiconMatch =
  | { matched: true; signal: SignalType; lang: string; term: string }
  | { matched: false };

function checkEntry(text: string, lower: string, entry: CompiledEntry): string | null {
  for (const term of entry.exact) {
    if (lower.includes(term)) return term;
  }
  for (const pattern of entry.patterns) {
    if (pattern.test(text)) return pattern.source;
  }
  return null;
}

/**
 * Check a message against the harm lexicon.
 * Returns the first signal match found, in priority order:
 * crisis > violent_intent > profanity
 *
 * @param text     Raw user input
 * @param langHint Optional BCP-47 language code ("en", "tl", "ceb", "ilo", "hil", "es")
 *                 If omitted, all languages are checked.
 */
export function checkLexicon(text: string, langHint?: string): LexiconMatch {
  const lower = text.toLowerCase();

  // Priority order: crisis first, then violent_intent, then profanity
  const priority: SignalType[] = ["crisis", "violent_intent", "profanity"];

  // Always check universal first
  for (const signal of priority) {
    const term = checkEntry(text, lower, compiled["universal"]![signal]!);
    if (term) return { matched: true, signal, lang: "universal", term };
  }

  // Determine which languages to check
  const langsToCheck = langHint
    ? Array.from(new Set([langHint, "en"]))
    : Object.keys(lexicon.languages);

  for (const lang of langsToCheck) {
    const langEntry = compiled[lang];
    if (!langEntry) continue;

    for (const signal of priority) {
      const term = checkEntry(text, lower, langEntry[signal]!);
      if (term) return { matched: true, signal, lang, term };
    }
  }

  return { matched: false };
}

/**
 * Convenience: check only for crisis signals.
 */
export function checkLexiconCrisis(text: string, langHint?: string): boolean {
  const lower = text.toLowerCase();
  const langsToCheck = langHint
    ? Array.from(new Set([langHint, "en"]))
    : Object.keys(lexicon.languages);

  const universalTerm = checkEntry(text, lower, compiled["universal"]!.crisis);
  if (universalTerm) return true;

  for (const lang of langsToCheck) {
    const langEntry = compiled[lang];
    if (!langEntry) continue;
    const term = checkEntry(text, lower, langEntry.crisis);
    if (term) return true;
  }

  return false;
}

/**
 * Convenience: check only for violent intent signals.
 */
export function checkLexiconViolentIntent(text: string, langHint?: string): boolean {
  const lower = text.toLowerCase();
  const langsToCheck = langHint
    ? Array.from(new Set([langHint, "en"]))
    : Object.keys(lexicon.languages);

  const universalTerm = checkEntry(text, lower, compiled["universal"]!.violent_intent);
  if (universalTerm) return true;

  for (const lang of langsToCheck) {
    const langEntry = compiled[lang];
    if (!langEntry) continue;
    const term = checkEntry(text, lower, langEntry.violent_intent);
    if (term) return true;
  }

  return false;
}
