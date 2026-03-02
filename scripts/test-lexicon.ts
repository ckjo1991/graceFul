// scripts/test-lexicon.ts
// Run with: npx tsx scripts/test-lexicon.ts

import { checkLexicon } from "../lib/lexicon";
import type { } from "../lib/lexicon";

type TestCase = {
  input: string;
  expectedSignal: "violent_intent" | "crisis" | "profanity" | null;
  lang?: string;
  label: string;
};

const cases: TestCase[] = [
  // ─── VIOLENT INTENT — EN ──────────────────────────────────────────────────
  { label: "EN VI: direct death wish", input: "I pray you die", expectedSignal: "violent_intent" },
  { label: "EN VI: removal from world", input: "I hope she gets removed from this world", expectedSignal: "violent_intent" },
  { label: "EN VI: kys slang", input: "just kys already", expectedSignal: "violent_intent" },
  { label: "EN VI: indirect harm wish", input: "hope something happens to them", expectedSignal: "violent_intent" },
  { label: "EN VI: no one would miss", input: "no one would miss her", expectedSignal: "violent_intent" },
  { label: "EN VI: better off without", input: "world is better without him", expectedSignal: "violent_intent" },
  { label: "EN VI: vehicle harm wish", input: "i hope a car hits him", expectedSignal: "violent_intent" },
  { label: "EN VI: deserve to die", input: "they deserve to die for what they did", expectedSignal: "violent_intent" },

  // ─── CRISIS — EN ──────────────────────────────────────────────────────────
  { label: "EN CR: explicit suicidal", input: "I want to kill myself", expectedSignal: "crisis" },
  { label: "EN CR: implied exhaustion", input: "I just want to sleep and not wake up", expectedSignal: "crisis" },
  { label: "EN CR: so tired of everything", input: "I am so tired of everything and can't do this anymore", expectedSignal: "crisis" },
  { label: "EN CR: no reason to live", input: "there is no reason to live anymore", expectedSignal: "crisis" },
  { label: "EN CR: burden", input: "I feel like I am a burden to everyone around me", expectedSignal: "crisis" },
  { label: "EN CR: dead inside", input: "I feel completely dead inside and numb to everything", expectedSignal: "crisis" },
  { label: "EN CR: give up on life", input: "I am giving up on life", expectedSignal: "crisis" },
  { label: "EN CR: everyone better without me", input: "everyone would be better off without me", expectedSignal: "crisis" },
  { label: "EN CR: unalive myself", input: "I want to unalive myself", expectedSignal: "crisis" },
  { label: "EN CR: wish never born", input: "I wish I was never born", expectedSignal: "crisis" },

  // ─── PROFANITY — EN ───────────────────────────────────────────────────────
  { label: "EN PF: fuck you", input: "fuck you", expectedSignal: "profanity" },
  { label: "EN PF: piece of shit", input: "you piece of shit", expectedSignal: "profanity" },

  // ─── VIOLENT INTENT — TL ──────────────────────────────────────────────────
  { label: "TL VI: mamatay ka", input: "mamatay ka na", expectedSignal: "violent_intent" },
  { label: "TL VI: sana mawala", input: "sana mawala ka sa mundo", expectedSignal: "violent_intent" },
  { label: "TL VI: patayin", input: "patayin mo na siya", expectedSignal: "violent_intent" },
  { label: "TL VI: sumpa", input: "sumpa sa iyo", expectedSignal: "violent_intent" },

  // ─── CRISIS — TL ──────────────────────────────────────────────────────────
  { label: "TL CR: ayoko na", input: "ayoko na talaga", expectedSignal: "crisis" },
  { label: "TL CR: wala nang pag-asa", input: "wala nang pag-asa para sa akin", expectedSignal: "crisis" },
  { label: "TL CR: pagod na", input: "pagod na ako sa buhay at sa lahat", expectedSignal: "crisis" },
  { label: "TL CR: wala na akong lakas", input: "wala na akong lakas para magpatuloy", expectedSignal: "crisis" },
  { label: "TL CR: mas mabuti wala na ako", input: "mas mabuti pang wala na ako", expectedSignal: "crisis" },
  { label: "TL CR: pabigat lang", input: "pabigat lang ako sa lahat ng tao", expectedSignal: "crisis" },
  { label: "TL CR: hindi ko na kaya", input: "hindi ko na kaya ang lahat", expectedSignal: "crisis" },

  // ─── PROFANITY — TL ───────────────────────────────────────────────────────
  { label: "TL PF: gago", input: "gago talaga siya", expectedSignal: "profanity" },
  { label: "TL PF: putang ina", input: "putang ina mo", expectedSignal: "profanity" },

  // ─── VIOLENT INTENT — CEB ─────────────────────────────────────────────────
  { label: "CEB VI: mamatay ka unta", input: "mamatay ka unta", expectedSignal: "violent_intent" },
  { label: "CEB VI: patyon ta", input: "patyon ta siya", expectedSignal: "violent_intent" },
  { label: "CEB VI: unta mawala", input: "unta mawala siya sa kalibutan", expectedSignal: "violent_intent" },

  // ─── CRISIS — CEB ─────────────────────────────────────────────────────────
  { label: "CEB CR: kapoy na ko sa kinabuhi", input: "kapoy na ko sa kinabuhi", expectedSignal: "crisis" },
  { label: "CEB CR: wala nay paglaum", input: "wala nay paglaum alang nako", expectedSignal: "crisis" },
  { label: "CEB CR: mas maayo wala na ko", input: "mas maayo kung wala na ko", expectedSignal: "crisis" },
  { label: "CEB CR: dili ko na kaya", input: "dili ko na kayang padayon", expectedSignal: "crisis" },

  // ─── VIOLENT INTENT — ILO ─────────────────────────────────────────────────
  { label: "ILO VI: matay ka koma", input: "matay ka koma", expectedSignal: "violent_intent" },
  { label: "ILO VI: koma mapukaw isuna", input: "koma mapukaw isuna iti lubong", expectedSignal: "violent_intent" },

  // ─── CRISIS — ILO ─────────────────────────────────────────────────────────
  { label: "ILO CR: ayak metten ti biagko", input: "ayak metten ti biagko", expectedSignal: "crisis" },
  { label: "ILO CR: awan ti paglaumen ko", input: "awan ti paglaumen ko", expectedSignal: "crisis" },

  // ─── SAFE INPUTS — should NOT match anything ──────────────────────────────
  { label: "SAFE: normal gratitude prayer", input: "Lord, please remove this burden from her heart and grant her peace", expectedSignal: null },
  { label: "SAFE: general gratitude", input: "I am so grateful for what God has done in my life this week", expectedSignal: null },
  { label: "SAFE: struggling but safe", input: "I have been feeling overwhelmed lately and need prayer for strength", expectedSignal: null },
  { label: "SAFE: healing prayer", input: "I pray that she heals quickly and feels God's peace and comfort", expectedSignal: null },
  { label: "SAFE: take him home peacefully", input: "Lord, take him home peacefully when the time comes", expectedSignal: null },
  { label: "SAFE: Tagalog safe prayer", input: "Panginoon, alisin mo ang sakit na ito sa kanyang buhay at bigyan siya ng kapayapaan", expectedSignal: null },
  { label: "SAFE: generic TL struggle", input: "Napakaraming nangyayari sa buhay ko ngayon, please pray for me", expectedSignal: null },
  { label: "SAFE: generic CEB prayer", input: "Palihug pag-ampo alang nako kay lisod kaayo ang akong kahimtang karon", expectedSignal: null },
  { label: "SAFE: financial struggle", input: "Going through a tough time financially. Trying to stay hopeful but it's hard some days", expectedSignal: null },
  { label: "SAFE: work struggle", input: "Feeling very overwhelmed with the new project. Asking for peace and wisdom", expectedSignal: null },
];

let passed = 0;
let failed = 0;

for (const tc of cases) {
  const result = checkLexicon(tc.input, tc.lang);

  const actualSignal = result.matched ? result.signal : null;
  const ok = actualSignal === tc.expectedSignal;

  if (ok) {
    console.log(`✅ PASS  ${tc.label}`);
    passed++;
  } else {
    console.error(`❌ FAIL  ${tc.label}`);
    console.error(`         Input:    "${tc.input}"`);
    console.error(`         Expected: ${tc.expectedSignal ?? "null (no match)"}`);
    console.error(`         Got:      ${actualSignal ?? "null (no match)"}`);
    if (result.matched) {
      console.error(`         Matched term: "${result.term}" (lang: ${result.lang})`);
    }
    failed++;
  }
}

console.log(`\n─────────────────────────────────────`);
console.log(`${passed} passed, ${failed} failed out of ${cases.length} tests.`);
console.log(`─────────────────────────────────────`);

if (failed > 0) {
  process.exit(1);
}
