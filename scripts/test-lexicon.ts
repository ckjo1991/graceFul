// scripts/test-lexicon.ts
// Run with: npx tsx scripts/test-lexicon.ts
// Used to validate harm-lexicon.json entries without starting the full app.

import { checkLexicon } from "../lib/lexicon";

type TestCase = {
  input: string;
  shouldMatch: boolean;
  lang?: string;
  label: string;
};

const cases: TestCase[] = [
  // English — should match
  { label: "EN: direct death wish", input: "I pray you die", shouldMatch: true },
  { label: "EN: removal from world", input: "I hope she gets removed from this world", shouldMatch: true },
  { label: "EN: kys slang", input: "just kys already", shouldMatch: true },
  { label: "EN: indirect harm", input: "i hope something happens to them", shouldMatch: true },
  { label: "EN: no one would miss", input: "no one would miss her", shouldMatch: true },
  { label: "EN: burn in hell", input: "burn in hell", shouldMatch: true },

  // Tagalog — should match
  { label: "TL: mamatay ka", input: "mamatay ka na", shouldMatch: true },
  { label: "TL: sana mawala", input: "sana mawala ka sa mundo", shouldMatch: true },
  { label: "TL: patayin", input: "patayin mo na siya", shouldMatch: true },

  // Bisaya — should match
  { label: "CEB: mamatay ka unta", input: "mamatay ka unta", shouldMatch: true },
  { label: "CEB: patyon ta", input: "patyon ta siya", shouldMatch: true },
  { label: "CEB: unta mawala", input: "unta mawala siya sa kalibutan", shouldMatch: true },

  // Ilocano — should match
  { label: "ILO: matay ka koma", input: "matay ka koma", shouldMatch: true },
  { label: "ILO: koma mapukaw", input: "koma mapukaw isuna iti lubong", shouldMatch: true },

  // Safe inputs — should NOT match
  { label: "SAFE: normal prayer", input: "Lord, please remove this burden from her heart", shouldMatch: false },
  { label: "SAFE: gratitude", input: "I am so grateful for what God has done in my life", shouldMatch: false },
  { label: "SAFE: struggling", input: "I have been feeling hopeless lately and need prayer", shouldMatch: false },
  { label: "SAFE: healing prayer", input: "I pray that she heals quickly and feels God's peace", shouldMatch: false },
  { label: "SAFE: take him home peacefully", input: "Lord, take him home peacefully when the time comes", shouldMatch: false },
  { label: "SAFE: Tagalog prayer", input: "Panginoon, alisin mo ang sakit na ito sa kanyang buhay", shouldMatch: false },
  { label: "SAFE: generic struggle", input: "Napakaraming nangyayari sa buhay ko ngayon, please pray for me", shouldMatch: false },
];

let passed = 0;
let failed = 0;

for (const tc of cases) {
  const result = checkLexicon(tc.input, tc.lang);
  const didMatch = result.matched;
  const ok = didMatch === tc.shouldMatch;

  if (ok) {
    console.log(`✅ PASS  ${tc.label}`);
    passed++;
  } else {
    console.error(`❌ FAIL  ${tc.label}`);
    console.error(`         Input: "${tc.input}"`);
    console.error(`         Expected match: ${tc.shouldMatch}, Got: ${didMatch}`);
    if (result.matched) {
      console.error(`         Matched term: "${result.term}" (lang: ${result.lang})`);
    }
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${cases.length} tests.`);

if (failed > 0) {
  process.exit(1);
}
