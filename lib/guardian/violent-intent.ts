import { hasUrgentCrisisContext } from "@/lib/guardian/crisis";
import { checkLexiconViolentIntent } from "@/lib/lexicon";

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
  "remove",
  "removed",
  "eliminate",
  "eliminated",
  "erase",
  "erased",
  "get rid of",
  "take away",
  "taken away",
  "disappear",
  "vanish",
  "wipe",
  "wiped",
];

const INTENT_PHRASES = [
  "i want",
  "i wish",
  "i hope",
  "i pray",
  "i pray that",
  "someone should",
  "let's",
  "lets",
  "we should",
  "i would like",
];

const FAITH_PATTERNS = [
  /\bLord\b/i,
  /\bJesus\b/i,
  /\bGod\b/i,
  /\bFather\b/i,
  /\bI declare\b/i,
  /\bI pray\b/i,
  /\bwith your guidance\b/i,
  /\bYour will\b/i,
  /\balign with you\b/i,
];

const LOWERCASE_TARGET_PATTERN =
  /\b(him|her|them|someone|somebody|that person|this person|my\s+(?:dad|mom|mother|father|boss|sister|brother|friend|wife|husband|partner))\b/;

const CAPITALIZED_TARGET_PATTERN = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
const NON_TARGET_CAPITALIZED_WORDS = new Set([
  "Lord",
  "Jesus",
  "God",
  "Father",
  "Your",
]);
const DIRECTED_TARGET_SOURCE =
  String.raw`(?:you(?:\s+and\s+(?:your\s+)?family)?|your\s+family|he|she|they|him|her|them|someone|somebody|that\s+person|this\s+person|my\s+(?:dad|mom|mother|father|boss|sister|brother|friend|wife|husband|partner)|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)`;

const DIRECTED_REMOVAL_PATTERN =
  new RegExp(
    String.raw`\b(?:i\s+)?(?:pray|hope|wish|want)\s+(?:that\s+)?${DIRECTED_TARGET_SOURCE}\s+(?:gets?\s+|be\s+|is\s+|would\s+be\s+)?(?:removed?|taken|erased?|wiped?|eliminated?|gone|disappear(?:ed)?)\s+(?:from\s+)?(?:this\s+world|existence|our\s+(?:lives?|world)|my\s+(?:life|world))\b`,
    "i",
  );

const DIRECTED_HARM_PATTERN =
  new RegExp(
    String.raw`\b(?:i\s+)?(?:pray|hope|wish|want)\s+(?:that\s+)?${DIRECTED_TARGET_SOURCE}\s+(?:gets?\s+|get\s+|be\s+|is\s+|are\s+|would\s+be\s+|will\s+be\s+|will\s+get\s+)?(?:kill(?:ed)?|hurt|dead|die(?:s)?|murder(?:ed)?|shot|stabbed|punished|suffer(?:s)?|burn(?:ed)?|beaten|poison(?:ed|ing)?)\b`,
    "i",
  );

const ALT_VIOLENT_INTENT_PATTERN =
  new RegExp(
    String.raw`\b(?:hope|wish|pray)\b[\s\S]{0,60}\b${DIRECTED_TARGET_SOURCE}\b[\s\S]{0,40}\b(?:die|dies|dead|gone|removed|erased|eliminated|taken|poison(?:ed|ing)?)\b`,
    "i",
  );

const VIOLENT_VERB_STEM_SOURCE =
  String.raw`(?:k(?:i|1|!)ll(?:s|ed|ing|er)?|murd(?:er(?:s|ed|ing|er)?|3r)|stab(?:s|bed|bing)?|shoot(?:s|ing)?|sh00t|shot|strangl(?:e|es|ed|ing)|chok(?:e|es|ed|ing)|burn(?:s|ed|ing|t)?|beat(?:s|ing|en)?|punch(?:es|ed|ing)?|strike|struck|crush(?:es|ed|ing)?|smash(?:es|ed|ing)?|break(?:s|ing|en)?|snap(?:s|ped|ping)?|drown(?:s|ed|ing)?|poison(?:s|ed|ing)?|slaughter(?:s|ed|ing)?|saksak(?:in|an)?|sinaksak|sasaksak(?:in)?|baril(?:in)?|binaril|babaril(?:in)?|papatay(?:in)?|patay(?:in)?|pinatay|pumatay|sakal(?:in)?|sinakal|sasakal(?:in)?|sunog|sinunog|susunugin|bugbog|binugbog|bubugbugin|suntok|sinuntok|durog|dinurog|dudurugin|bali|binali|babaliin|lunod|nalunod|malulunod|nilunod|lason|nilason|lalasunin|katay|kinatay|kakatayin)`;

const DIRECT_THREAT_EN_PATTERN = new RegExp(
  String.raw`\b(?:i|i['’]?ll|i\s+am\s+going\s+to|im\s+gonna)\b[\s\S]{0,24}\b${VIOLENT_VERB_STEM_SOURCE}\b[\s\S]{0,24}\b(?:you|him|her|them|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b`,
  "i",
);

const DIRECT_THREAT_PH_PATTERN = new RegExp(
  String.raw`\b(?:papatayin|sasaksakin|babarilin|dudurugin|patayin|saksakin|barilin|babaliin)\b[\s\S]{0,20}\b(?:kita|ka|si|ni|kay)\b`,
  "i",
);

const MALICIOUS_WISH_PATTERN = new RegExp(
  String.raw`\b(?:hope|wish|pray|karma|let|i\s+want|sana|karmahin|mabulok)\b[\s\S]{0,50}\b(?:you|your\s+family|him|her|them|that\s+person|this\s+person|si|ka|yung|kita|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b[\s\S]{0,30}\b(?:die|dead|accident|crash|fall|mamatay|maaksidente|malunod|mabulok|masagasaan|poison(?:ed|ing)?)\b`,
  "i",
);
const DESERVED_SUFFERING_PATTERN =
  /\b(?:i\s+)?hope\b[\s\S]{0,80}\bgets?\s+what\s+(?:he|she|they)\s+deserve(?:s)?\b[\s\S]{0,40}\bsuffer(?:s|ing)?\b/i;
const BAD_THINGS_WISH_PATTERN =
  /\b(?:i\s+)?wish\s+something\s+bad\s+would\s+happen\s+to\s+(?:him|her|them|you|that\s+person|this\s+person|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i;

const VIOLENT_STEM_PATTERN = new RegExp(String.raw`\b${VIOLENT_VERB_STEM_SOURCE}\b`, "i");

const WEAPON_PATTERN =
  /\b(?:gun|knife|blade|bomb|grenade|rifle|pistol|bullet|sh0tgun|machete|katana|kris|itak|kutsilyo|balisong|bat|hammer|chainsaw|rope|poison|acid|explosive|apoy)\b/i;

const METAPHOR_SHIELD_PATTERNS = [
  /\bkilling me\b[\s\S]{0,20}\b(?:boredom|traffic|work|deadlines|commute|it)\b/i,
  /\bdead\s+(?:tired|serious|gorgeous|hungry|starving)\b/i,
  /\bdying\s+(?:of laughter|to see|to know)\b/i,
  /\bkilled by boredom\b/i,
  /\bdying of boredom\b/i,
  /\bbored to death\b/i,
  /\bthis homework is killing me\b/i,
  /\bthis traffic is killing me\b/i,
  /\bthat joke killed me\b/i,
  /\bthis is killing me\b/i,
  /\bkilling it\b/i,
  /\bcrushing it\b/i,
  /\bslaying\b/i,
  /\bburned out\b/i,
];

function hasFaithDeclaration(text: string): boolean {
  return FAITH_PATTERNS.some((pattern) => pattern.test(text));
}

function hasCapitalizedTargetReference(text: string): boolean {
  for (const match of text.matchAll(CAPITALIZED_TARGET_PATTERN)) {
    const candidate = match[1];

    if (!candidate) {
      continue;
    }

    if (!NON_TARGET_CAPITALIZED_WORDS.has(candidate)) {
      return true;
    }
  }

  return false;
}

function hasTargetReference(text: string): boolean {
  const lowerText = text.toLowerCase();

  return (
    LOWERCASE_TARGET_PATTERN.test(lowerText) || hasCapitalizedTargetReference(text)
  );
}

function hasMetaphorShield(text: string): boolean {
  return METAPHOR_SHIELD_PATTERNS.some((pattern) => pattern.test(text));
}

function hasWeaponLinkedThreat(text: string): boolean {
  return VIOLENT_STEM_PATTERN.test(text) && WEAPON_PATTERN.test(text);
}

export function hasViolentIntent(text: string): boolean {
  const lowerText = text.toLowerCase();
  if (/\bburned out\b/i.test(text)) {
    return false;
  }

  const hasFaithContext = hasFaithDeclaration(text);
  const directThreatHit =
    DIRECT_THREAT_EN_PATTERN.test(text) || DIRECT_THREAT_PH_PATTERN.test(text);
  const maliciousWishHit = MALICIOUS_WISH_PATTERN.test(text);
  const deservedSufferingHit = DESERVED_SUFFERING_PATTERN.test(text);
  const badThingsWishHit = BAD_THINGS_WISH_PATTERN.test(text);
  const weaponLinkedThreatHit = hasWeaponLinkedThreat(text);
  const metaphorShieldHit = hasMetaphorShield(text);

  if (
    metaphorShieldHit &&
    !(directThreatHit || maliciousWishHit || deservedSufferingHit || badThingsWishHit || weaponLinkedThreatHit)
  ) {
    return false;
  }

  // Gate 1: lexicon violent_intent signal
  if (checkLexiconViolentIntent(text)) {
    return true;
  }

  // Gate A/B: direct threats and malicious wishes
  if (
    directThreatHit ||
    maliciousWishHit ||
    deservedSufferingHit ||
    badThingsWishHit ||
    weaponLinkedThreatHit
  ) {
    return true;
  }

  // Gate 2: directed structural patterns (high-confidence regex)
  if (DIRECTED_REMOVAL_PATTERN.test(text)) return true;
  if (DIRECTED_HARM_PATTERN.test(text)) return true;
  if (ALT_VIOLENT_INTENT_PATTERN.test(text)) return true;

  // Gate 3: triple-token check (verb + intent + target co-occurring)
  const hasVerb = HARM_VERBS.some((verb) => lowerText.includes(verb));
  const hasIntent = INTENT_PHRASES.some((phrase) => lowerText.includes(phrase));
  const hasTarget = hasTargetReference(text);

  if (hasFaithContext && !hasTarget && !hasUrgentCrisisContext(text)) {
    return false;
  }

  if (hasVerb && hasIntent && hasTarget) return true;

  return false;
}
