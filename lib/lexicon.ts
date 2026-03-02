// lib/lexicon.ts
// Loads harm-lexicon.json and exposes checkLexicon().
// Sits before regex and LLM checks in the guardian pipeline.

import lexiconData from "@/data/harm-lexicon.json";

type LanguageEntry = {
  exact: string[];
  patterns: string[];
};

type LexiconData = {
  version: string;
  languages: Record<string, LanguageEntry>;
  universal: LanguageEntry;
};

const lexicon = lexiconData as LexiconData;

// Compile all regex patterns once at module load, not per call.
const compiledPatterns: Record<string, RegExp[]> = {};

for (const [lang, entry] of Object.entries(lexicon.languages)) {
  compiledPatterns[lang] = entry.patterns.map(
    (p) => new RegExp(p, "i"),
  );
}

compiledPatterns["universal"] = lexicon.universal.patterns.map(
  (p) => new RegExp(p, "i"),
);

export type LexiconMatch = {
  matched: true;
  lang: string;
  term: string;
} | {
  matched: false;
};

/**
 * Check a message against the harm lexicon.
 *
 * @param text     Raw user input (not lowercased yet — we handle that internally)
 * @param langHint Optional BCP-47 language code hint ("tl", "ceb", "ilo", "en").
 *                 If omitted, all languages are checked.
 */
export function checkLexicon(text: string, langHint?: string): LexiconMatch {
  const lower = text.toLowerCase();

  // Always check universal first
  for (const term of lexicon.universal.exact) {
    if (lower.includes(term)) {
      return { matched: true, lang: "universal", term };
    }
  }
  for (const pattern of compiledPatterns["universal"] ?? []) {
    if (pattern.test(lower)) {
      return { matched: true, lang: "universal", term: pattern.source };
    }
  }

  // Determine which languages to check
  const langsToCheck = langHint
    ? [langHint, "en"] // always include English as fallback
    : Object.keys(lexicon.languages);

  for (const lang of langsToCheck) {
    const entry = lexicon.languages[lang];
    if (!entry) continue;

    for (const term of entry.exact) {
      if (lower.includes(term)) {
        return { matched: true, lang, term };
      }
    }

    for (const pattern of compiledPatterns[lang] ?? []) {
      if (pattern.test(lower)) {
        return { matched: true, lang, term: pattern.source };
      }
    }
  }

  return { matched: false };
}
