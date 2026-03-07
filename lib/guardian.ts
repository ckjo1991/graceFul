import { checkLexiconCrisis, checkLexiconViolentIntent } from "@/lib/lexicon";
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

const FORBIDDEN_WORDS = [
  "fuck",
  "gago",
  "puta",
  "tangina",
  "hell",
  "crap",
  "pissed",
];
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

export type SpamAssessment = {
  score: number;
  signals: SpamSignal[];
  shouldBlock: boolean;
  shouldFlag: boolean;
};

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
const URGENCY_PATTERNS = [
  /\basap\b/i,
  /\burgent(?:ly)?\b/i,
  /\bright now\b/i,
  /\bimmediately\b/i,
  /\bwithout delay\b/i,
];
const SELF_HARM_URGENCY_PATTERN =
  /\b(remove me|end this|end it all|end my life|take my life|take my own life|kill myself|hurt myself|let me die|i can't go on|i can't do this anymore|don't want to live|don't want to be here|cease to exist)\b/i;
const CRISIS_CONTEXT_PATTERN =
  /\b(i can't go on|i can't do this anymore|don't want to live|don't want to be here|want to die|end my life|kill myself|hurt myself|self-harm|hopeless|no hope|give up|worthless|burden)\b/i;
const PASSIVE_CRISIS_PATTERNS = [
  /\b(?:i\s+)?don't see a reason to keep going(?: anymore)?\b/i,
  /\bit would be easier if i(?: just)? disappeared\b/i,
  /\bdon't know how much longer i can keep doing this\b/i,
  /\bdon't (know|understand) (what|why) i (keep|still|even|bother)\b/i,
  /\bgoing through the motions\b/i,
  /\bwhat('s| is) (even )?the point( of (any of )?this)?\b/i,
  /\btired of pretending( everything('s| is) (fine|okay|ok|alright))?\b/i,
  /\bstaring at the (ceiling|wall|floor) (for (days|hours|weeks)|all (day|night|week))\b/i,
  /\bcan't (feel|remember) the last time (i was|things were|i felt|life felt)\b/i,
  /\bdon't (care|feel) (anything|much|anything at all) anymore\b/i,
  /\bjust (existing|surviving|going through it)( now| these days)?\b/i,
  /\b(don't|do not) (see|know) (why|what) (i'm|i am) (still|even) here\b/i,
  /\bwhy (do i|am i) (even )?(bother|keep going|still here|still trying)\b/i,
  /\bfeeling (hollow|empty|like nothing|like a shell)( inside| anymore)?\b/i,
  /\bcan't remember (the last time|when) (i (smiled|laughed|felt okay|felt happy))\b/i,
  /\bdon't care about (anything|much|anything at all) anymore\b/i,
  /\b(don't|do not) know what (i'm|i am) still doing here\b/i,
  /\b(so |sobrang )?(pagod|tired|exhausted)\s+na( ako| ko| na)?\b/i,
  /\bwala na (akong |kong )?(lakas|strength|energy|reason|dahilan)\b/i,
  /\b(i )?can't na (talaga|na|eh|muna)?\b/i,
  /\b(ayoko|i don't want) na (talagang |talaga )?(magpatuloy|to go on|to continue|to keep going)\b/i,
  /\bwant (everything|lahat) to (matapos|end|stop|be over) na\b/i,
  /\b(so |sobrang )?tired na (ko|ako|na)\b/i,
  /\bhindi ko na (alam|kaya)( kung)? (why|bakit|what|ano) (i'm|i am|ako)\b/i,
  /\b(i )?give up na( talaga| na)?\b/i,
  /\bsurrender na (ako|ko|na)( sa (lahat|buhay|everything))?\b/i,
  /\bwala na (akong|kong) (pake|pakialam|maisip|maramdaman)\b/i,
];

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

const PHONE_PATTERN = /\b(?:\+?63[-\s]?|0)9\d{2}[-\s]?\d{3}[-\s]?\d{4}\b/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SOCIAL_PATTERN =
  /(@[a-zA-Z0-9._]+)|(facebook\.com\/[a-zA-Z0-9._]+)|(fb\.me\/[a-zA-Z0-9._]+)|(twitter\.com\/[a-zA-Z0-9._]+)/gi;
const LOCATION_PATTERN =
  /\b(?:street|st\.|barangay|brgy\.|avenue|ave\.|city hall|subdivision)\b/gi;
const HOSPITAL_ALIASES = [
  "pgh",
  "up pgh",
  "pgh manila",
  "st lukes",
  "st luke's",
  "st lukes qc",
  "st lukes bgc",
  "slmc",
  "slmc qc",
  "slmc bgc",
  "tmc",
  "tmc pasig",
  "tmc ortigas",
  "medical city",
  "medical city ortigas",
  "makati med",
  "makati medical center",
  "osmak",
  "os makati",
  "nch",
  "nch qc",
  "national children's hospital",
  "national childrens hospital",
  "usth",
  "ust hospital",
  "ust med",
  "manila doctors",
  "mary johnston",
  "tondo med",
  "jose reyes",
  "jrrmmc",
  "east ave",
  "eamc",
  "qmmc",
  "nkti",
  "phc",
  "lcp",
  "pcmc",
  "poc",
  "qcgh",
  "rizal med",
  "rmc",
  "tpdh",
  "ospar",
  "asian hospital",
  "vrp",
  "tala hospital",
  "uerm",
];

function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const HOSPITAL_ALIAS_PATTERN = new RegExp(
  String.raw`\b(?:${HOSPITAL_ALIASES.map(escapeRegexLiteral).join("|")})\b`,
  "gi",
);

const HOSPITAL_NAMED_PATTERN =
  /\b(?:[A-Z][A-Za-z0-9'.-]*(?:\s+[A-Z][A-Za-z0-9'.-]*){0,8}\s+(?:Hospital|Medical Center|General Hospital|District Hospital|City Hospital|Heart Center|Lung Center|Orthopedic Center|Children(?:'s)? Hospital|Kidney and Transplant Institute)|Ospital ng\s+[A-Z][A-Za-z0-9'.-]*(?:\s+[A-Za-z0-9'.-]+){0,5})\b/g;
const NAME_PATTERN = /\b(?:ako si|my name is|name ko si)\s+[a-z][a-z\s'-]{1,30}\b/gi;
const FULL_NAME_PATTERN =
  /\b([A-Z][a-z]+(?:[-'][A-Z][a-z]+)?\s+[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?)\b/g;
const COOLDOWN_MS = 60000;
const MARKER_TRIGGER_PATTERN =
  /\b(?:si|ni|kay|sina|nina|kina|mr\.?|ms\.?|mrs\.?|dr\.?|atty\.?|kuya|ate|tito|tita)\s+([A-Za-z][A-Za-z'’-]{1,30})\b/gi;
const FILIPINO_SURNAMES = new Set([
  "dela cruz",
  "garcia",
  "reyes",
  "ramos",
  "mendoza",
  "santos",
  "flores",
  "gonzales",
  "bautista",
  "villanueva",
  "fernandez",
  "cruz",
  "de guzman",
  "lopez",
  "perez",
  "castillo",
  "francisco",
  "rivera",
  "aquino",
  "castro",
  "sanchez",
  "torres",
  "de leon",
  "domingo",
  "martinez",
  "gonzalez",
  "morales",
  "gutierrez",
  "ortega",
  "ramirez",
  "velasco",
  "valdez",
  "salazar",
  "pascual",
  "manalo",
  "panganiban",
  "pangilinan",
  "galang",
  "mallari",
  "canlas",
  "dizon",
  "lim",
  "tan",
  "ong",
  "uy",
  "go",
  "chua",
  "tuazon",
  "yap",
  "sy",
  "gatchalian",
  "cojuangco",
  "lacson",
  "tecson",
  "abellana",
  "acosta",
  "agbayani",
  "agcaoili",
  "agustin",
  "aguilar",
  "aguinaldo",
  "alcantara",
  "alejandro",
  "alvarez",
  "ampatuan",
  "araneta",
  "arellano",
  "arguelles",
  "aragon",
  "arroyo",
  "asuncion",
  "atienza",
  "avila",
  "ayala",
  "bagatsing",
  "balagtas",
  "baltazar",
  "banal",
  "barretto",
  "basilio",
  "beltran",
  "benitez",
  "bernardo",
  "blanco",
  "bonifacio",
  "borja",
  "briones",
  "bugayong",
  "cabrera",
  "calderon",
  "camacho",
  "campo",
  "campos",
  "capistrano",
  "carandang",
  "cardona",
  "carpio",
  "carrillo",
  "casimiro",
  "catindig",
  "cayabyab",
  "cayanan",
  "celis",
  "chavez",
  "coronel",
  "corpus",
  "cuevas",
]);
const COMMON_VERB_LIKE_FIRST_WORDS = new Set([
  "i",
  "we",
  "they",
  "he",
  "she",
  "you",
  "saw",
  "see",
  "met",
  "call",
  "called",
  "message",
  "messaged",
  "talk",
  "talked",
  "ask",
  "asked",
  "tell",
  "told",
  "praying",
  "pray",
]);
const FULL_NAME_EXCLUSIONS = new Set([
  "And",
  "But",
  "For",
  "From",
  "God",
  "Jesus",
  "Lord",
  "Father",
  "Your",
  "You",
  "Hope",
  "Joy",
  "Grace",
  "Faith",
  "Peace",
  "Mercy",
  "Charity",
  "Angel",
  "Heaven",
  "Summer",
  "Winter",
  "April",
  "May",
  "June",
  "Rose",
  "Lily",
  "Daisy",
  "Luna",
  "Aurora",
  "Star",
  "Dawn",
  "Light",
  "River",
  "Sky",
  "Malaya",
  "Ligaya",
  "Hiraya",
  "Pagasa",
  "Tala",
  "Buhay",
  "Liwanag",
  "Ganda",
  "Tapang",
  "Saya",
  "Araw",
  "Bituin",
]);

function isLikelyFullName(candidate: string): boolean {
  const parts = candidate.trim().split(/\s+/);

  return parts.length === 2 && parts.every((part) => !FULL_NAME_EXCLUSIONS.has(part));
}

function hasAdjacentCapitalizedWord(
  text: string,
  matchStart: number,
  matchEnd: number,
): boolean {
  const before = text.slice(0, matchStart).match(/[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?\s*$/);
  const after = text.slice(matchEnd).match(/^\s*[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?/);

  return Boolean(before || after);
}

function containsLikelyFullName(text: string): boolean {
  for (const match of text.matchAll(FULL_NAME_PATTERN)) {
    const candidate = match[1];
    const start = match.index ?? -1;

    if (
      candidate &&
      isLikelyFullName(candidate) &&
      start >= 0 &&
      !hasAdjacentCapitalizedWord(text, start, start + match[0].length)
    ) {
      return true;
    }
  }

  return false;
}

function redactLikelyFullNames(text: string, replacement: string): string {
  return text.replace(FULL_NAME_PATTERN, (match, _candidate, offset: number, source: string) =>
    isLikelyFullName(match) && !hasAdjacentCapitalizedWord(source, offset, offset + match.length)
      ? replacement
      : match,
  );
}

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

  // Gate 1: lexicon crisis signal (covers implied crisis, exhaustion, hopelessness)
  if (checkLexiconCrisis(text)) return true;

  // Gate 1.5: urgency only counts when paired with self-harm or crisis language.
  if (hasUrgentCrisisContext(text)) return true;

  if (PASSIVE_CRISIS_PATTERNS.some((pattern) => pattern.test(text))) return true;

  // Gate 2: hardcoded keywords as fallback
  return CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));
};

export const checkProfanity = (text: string): boolean => {
  return matchProfanity(text) !== null;
};

function matchProfanity(text: string): string | null {
  for (const word of FORBIDDEN_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegexLiteral(word)}\\b`, "i");

    if (pattern.test(text)) {
      return word;
    }
  }

  return null;
}

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

function hasUrgentCrisisContext(text: string): boolean {
  const lowerText = text.toLowerCase();
  const hasUrgency = URGENCY_PATTERNS.some((pattern) => pattern.test(text));
  const hasCrisisSignal =
    SELF_HARM_URGENCY_PATTERN.test(text) ||
    CRISIS_CONTEXT_PATTERN.test(text) ||
    checkLexiconCrisis(text) ||
    CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));

  return hasUrgency && hasCrisisSignal;
}

function hasMetaphorShield(text: string): boolean {
  return METAPHOR_SHIELD_PATTERNS.some((pattern) => pattern.test(text));
}

function hasWeaponLinkedThreat(text: string): boolean {
  return VIOLENT_STEM_PATTERN.test(text) && WEAPON_PATTERN.test(text);
}

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

function containsSpecificHospitalLocation(text: string): boolean {
  return (
    containsPattern(text, HOSPITAL_ALIAS_PATTERN) ||
    containsPattern(text, HOSPITAL_NAMED_PATTERN)
  );
}

function redactMarkerTriggeredNames(text: string, replacement: string): string {
  return text.replace(MARKER_TRIGGER_PATTERN, (match, name: string) =>
    match.replace(name, replacement),
  );
}

function redactSurnameMatches(text: string, replacement: string): string {
  return text.replace(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g, (match, first, second) => {
    const firstLower = String(first).toLowerCase();
    const secondLower = String(second).toLowerCase();

    if (!FILIPINO_SURNAMES.has(secondLower)) {
      return match;
    }

    if (COMMON_VERB_LIKE_FIRST_WORDS.has(firstLower)) {
      return `${first} ${replacement}`;
    }

    return `${replacement} ${replacement}`;
  });
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

export const checkSafety = (
  text: string,
): {
  isSafe: boolean;
  reason: "malice" | "pii" | "profanity" | "spam" | null;
  foundDetail: string | null;
} => {
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

  if (containsSpecificHospitalLocation(text)) {
    return {
      isSafe: false,
      reason: "pii",
      foundDetail: "hospital/location",
    };
  }

  if (containsLikelyFullName(text)) {
    return { isSafe: false, reason: "pii", foundDetail: "full name" };
  }

  return { isSafe: true, reason: null, foundDetail: null };
};

export const scrubPII = (text: string): string => {
  let sanitized = text;

  try {
    sanitized = sanitized.replaceAll(PHONE_PATTERN, "[phone removed]");
    sanitized = sanitized.replaceAll(EMAIL_PATTERN, "[email removed]");
    sanitized = sanitized.replaceAll(SOCIAL_PATTERN, "[social link removed]");
    sanitized = sanitized.replaceAll(HOSPITAL_NAMED_PATTERN, "[location generalized]");
    sanitized = sanitized.replaceAll(HOSPITAL_ALIAS_PATTERN, "[location generalized]");
    sanitized = redactMarkerTriggeredNames(sanitized, "[name removed]");
    sanitized = redactSurnameMatches(sanitized, "[name removed]");
    sanitized = redactLikelyFullNames(sanitized, "[name removed]");
  } catch (error) {
    console.error("Scrubbing failed:", error);
  }

  return sanitized;
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

  const hasPhone = containsPattern(sanitizedMessage, PHONE_PATTERN);
  const hasEmail = containsPattern(sanitizedMessage, EMAIL_PATTERN);
  const hasSocial = containsPattern(sanitizedMessage, SOCIAL_PATTERN);
  const hasHospitalLocation = containsSpecificHospitalLocation(sanitizedMessage);

  if (hasPhone || hasEmail || hasSocial || hasHospitalLocation) {
    sanitizedMessage = scrubPII(sanitizedMessage);
    if (hasPhone) reasons.push("Phone number removed.");
    if (hasEmail) reasons.push("Email removed.");
    if (hasSocial) reasons.push("Social link removed.");
    if (hasHospitalLocation) reasons.push("Hospital/location generalized.");
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

function containsPattern(value: string, pattern: RegExp) {
  const scopedPattern = new RegExp(pattern.source, pattern.flags);
  return scopedPattern.test(value);
}
