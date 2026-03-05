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

const FORBIDDEN_WORDS = ["fuck", "gago", "puta", "tangina"];

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

const DIRECTED_TARGET_SOURCE =
  String.raw`(?:he|she|they|him|her|them|someone|somebody|that\s+person|this\s+person|my\s+(?:dad|mom|mother|father|boss|sister|brother|friend|wife|husband|partner)|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)`;

const DIRECTED_REMOVAL_PATTERN =
  new RegExp(
    String.raw`\b(?:i\s+)?(?:pray|hope|wish|want)\s+(?:that\s+)?${DIRECTED_TARGET_SOURCE}\s+(?:gets?\s+|be\s+|is\s+|would\s+be\s+)?(?:removed?|taken|erased?|wiped?|eliminated?|gone|disappear(?:ed)?)\s+(?:from\s+)?(?:this\s+world|existence|our\s+(?:lives?|world)|my\s+(?:life|world))\b`,
    "i",
  );

const DIRECTED_HARM_PATTERN =
  new RegExp(
    String.raw`\b(?:i\s+)?(?:pray|hope|wish|want)\s+(?:that\s+)?${DIRECTED_TARGET_SOURCE}\s+(?:gets?\s+|be\s+|is\s+|would\s+be\s+)?(?:kill(?:ed)?|hurt|dead|die(?:s)?|murder(?:ed)?|shot|stabbed|punished|suffer(?:s)?|burn(?:ed)?|beaten)\b`,
    "i",
  );

const ALT_VIOLENT_INTENT_PATTERN =
  new RegExp(
    String.raw`\b(?:hope|wish|pray)\b[\s\S]{0,60}\b${DIRECTED_TARGET_SOURCE}\b[\s\S]{0,40}\b(?:die|dies|dead|gone|removed|erased|eliminated|taken)\b`,
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
  String.raw`\b(?:hope|wish|pray|karma|let|i\s+want|sana|karmahin|mabulok)\b[\s\S]{0,50}\b(?:you|him|her|them|that\s+person|this\s+person|si|ka|yung|kita|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b[\s\S]{0,30}\b(?:die|dead|accident|crash|fall|mamatay|maaksidente|malunod|mabulok|masagasaan)\b`,
  "i",
);

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
const HOSPITAL_LOCATION_PATTERN =
  /\b(?:[A-Za-z0-9'.-]+(?:\s+[A-Za-z0-9'.-]+){0,8}\s+(?:Hospital|Medical Center|General Hospital|District Hospital|City Hospital|Heart Center|Lung Center|Orthopedic Center|Children(?:'s)? Hospital|Kidney and Transplant Institute)|Ospital ng\s+[A-Za-z0-9'.-]+(?:\s+[A-Za-z0-9'.-]+){0,4}|Philippine General Hospital|University of Santo Tomas Hospital|Manila Doctors Hospital|Chinese General Hospital and Medical Center|Metropolitan Medical Center|Mary Johnston Hospital|Mary Chiles General Hospital|De Ocampo Memorial Medical Center|Hospital of the Infant Jesus|Ospital ng Maynila Medical Center|Sta\.?\s*Ana Hospital|Ospital ng Sampaloc|Tondo Medical Center|Jose R\.?\s*Reyes Memorial Medical Center|San Lazaro Hospital|Dr\.?\s*Jose Fabella Memorial Hospital|St\.?\s*Luke'?s Medical Center(?:\s*-\s*(?:Quezon City|Global City))?|East Avenue Medical Center|Quirino Memorial Medical Center|National Kidney and Transplant Institute|Philippine Heart Center|Lung Center of the Philippines|Philippine Children(?:'s)? Medical Center|Philippine Orthopedic Center|National Children(?:'s)? Hospital|Capitol Medical Center|De Los Santos Medical Center|Dr\.?\s*Fe Del Mundo Medical Center|Commonwealth Hospital and Medical Center|Novaliches District Hospital|Quezon City General Hospital|Makati Medical Center|Ospital ng Makati|Makati Life Medical Center|(?:The\s+)?Medical City|Pasig Doctors Medical Center|Rizal Medical Center|Pasig City General Hospital|Taguig-Pateros District Hospital|Bicutan Medical Center|Taguig City General Hospital|Adventist Medical Center Manila|San Juan De Dios Hospital|Pasay City General Hospital|Paranaque Doctors Hospital|Unihealth Paranaque Hospital and Medical Center|Ospital ng Paranaque|Olivarez General Hospital|University of Perpetual Help Dalta Medical Center|Las Pinas Doctors Hospital|Las Pinas General Hospital and Satellite Trauma Center|Pope John Paul II Hospital and Medical Center|Cardinal Santos Medical Center|San Juan Medical Center|Fatima University Medical Center|Valenzuela Medical Center|Valenzuela City Emergency Hospital|Valenzuela City General Hospital|Ospital ng Malabon|San Lorenzo Ruiz General Hospital|Navotas City Hospital|Ospital ng Muntinlupa|Asian Hospital and Medical Center|Mandaluyong City Medical Center|VRP Medical Center|Dr\.?\s*Jose N\.?\s*Rodriguez Memorial Hospital|up pgh|pgh manila|sa pgh|taft pgh|opd pgh|pgh|ust hospital|usth|ust hosp|ust med|sa ust|manila doctors|mdh|madocs|doctors hospital manila|un ave doctors|chinese gen|chinese hospital|cghmc|cgh|intsik hospital|blumentritt hospital|metro medical|metropolitan|metro hospital|mmc metro|metro binondo|mary johnston|mjh|tondo hospital|mary chiles|mcgh|de ocampo|ocampo hospital|docmmc|infant jesus hospital|hij hospital|osmaynila|os maynila|om|maynila hospital|sta ana hospital|santa ana hospital|sa sta ana|os sampaloc|ossamp|sampaloc hospital|tondo med|tondo medical|tmc tondo|jose reyes|reyes hospital|jrrmmc|jr reyes|san lazaro|lazaro hospital|slh|fabella hospital|fabella|djfmh|jose fabella|st lukes|st lukes qc|st lukes quezon city|slmc qc|st lukes e rodriguez|east ave|east avenue hospital|eamc|sa east ave|quirino hospital|qmmc|labor hospital|nkti|nk ti|kidney center|kidney institute|heart center|phc|sa heart center|lung center|lcp|sa lung center|pcmc|childrens hospital qc|lungsod ng kabataan|q ave childrens|orthopedic hospital|poc|banawe hospital|ortho banawe|nch|national childrens|nch qc|capitol med|cmc qc|capitol hospital|de los santos|dlsmc|de los santos med|fe del mundo|fdmmc|del mundo hospital|childrens medical center banawe|commonwealth hospital|chmc|novaliches district|ndh|nova hospital|qc general|qcgh|quezon city hospital|qc gen|makati med|mmc makati|makati medical|mmc|osmak|os makati|makati life|medical city|tmc|tmc pasig|tmc ortigas|medical city ortigas|pasig doctors|pdmc|rizal med|rmc pasig|rmc|pasig gen|pasig hospital|pcgh|st lukes bgc|slmc bgc|st lukes taguig|tpdh|taguig pateros hospital|bicutan med|bicutan hospital|taguig gen|tcgh|adventist hospital pasay|adventist med|amcm|sjdh|san juan de dios|pasay gen|pasay hospital|pcgh pasay|paranaque doctors|pdh|unihealth paranaque|uphmc|ospar|os paranaque|ospar 1|ospar 2|olivarez hospital|olivarez gen|perpetual las pinas|perpetual hospital|uphdmc|perpetual dalta|las pinas doctors|lpdh|las pinas general|lpgstc|lpgh|john paul hospital|pjpii|cardinal santos|csmc|greenhills hospital|cardinal|san juan med|sjmc|fatima hospital|fumc|fatima valenzuela|vmc valenzuela|vmc|valenzuela emergency|vceh|valenzuela gen|vcgh|osmalabon|malabon hospital|os malabon|san lorenzo|slrgh|navotas hospital|nch navotas|osmuntinlupa|os muntinlupa|osmun|asian hospital|asian hosp|ahmc|asian alabang|mandaluyong hospital|mcmc|mandaluyong city med|vrp hospital|vrp med|vrp|tala hospital|tala|djnrmh|jose rodriguez memorial|ManilaMed - Medical Center Manila|Our Lady of Lourdes Hospital|University of the East Ramon Magsaysay Memorial Medical Center|Diliman Doctors Hospital|Dr\.?\s*Jesus C\.?\s*Delgado Memorial Hospital|Providence Hospital|Fort Bonifacio General Hospital|Manila Naval Hospital|Salve Regina General Hospital|Mission Hospital|St\.?\s*Camillus Medical Center|Medical Center Taguig|Metro Pasay Hospital and Medical Center|Medical Center Paranaque|South Superhighway Medical Center|ACE Medical Center - Pateros|manilamed|manila med|mc manila|med city manila|un ave med|lourdes hospital|lourdes manila|ol lh|sta mesa lourdes|uerm|uerm hospital|uerm med|uerm aurora|sa uerm|diliman docs|ddh|commonwealth doctors|delgado hospital|delgado|kamuning hospital|providence|providence qc|phqc|fort boni hospital|fbgh|navy hospital|afp general|naval hospital|navy med|mnh|salve regina|salve hospital|marcos highway hospital|mission pasig|mission med|st camillus|camillus med|pasig camillus|mct|taguig med|med center taguig|metro pasay|pasay medical|mphmc|mcp|paranaque medical|mcp sucat|ssmc|south superhighway|ssmc paranaque|ace pateros|ace med|ace hospital)\b[^.!?\n]*/gi;
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

function containsLikelyFullName(text: string): boolean {
  for (const match of text.matchAll(FULL_NAME_PATTERN)) {
    if (match[1] && isLikelyFullName(match[1])) {
      return true;
    }
  }

  return false;
}

function redactLikelyFullNames(text: string, replacement: string): string {
  return text.replace(FULL_NAME_PATTERN, (match) =>
    isLikelyFullName(match) ? replacement : match,
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

  // Gate 2: hardcoded keywords as fallback
  return CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));
};

export const checkProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return FORBIDDEN_WORDS.some((word) => lowerText.includes(word));
};

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
  const hasFaithContext = hasFaithDeclaration(text);
  const directThreatHit =
    DIRECT_THREAT_EN_PATTERN.test(text) || DIRECT_THREAT_PH_PATTERN.test(text);
  const maliciousWishHit = MALICIOUS_WISH_PATTERN.test(text);
  const weaponLinkedThreatHit = hasWeaponLinkedThreat(text);
  const metaphorShieldHit = hasMetaphorShield(text);

  if (metaphorShieldHit && !(directThreatHit || maliciousWishHit || weaponLinkedThreatHit)) {
    return false;
  }

  // Gate 1: lexicon violent_intent signal
  if (checkLexiconViolentIntent(text)) {
    return true;
  }

  // Gate A/B: direct threats and malicious wishes
  if (directThreatHit || maliciousWishHit || weaponLinkedThreatHit) {
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
  reason: "malice" | "pii" | "profanity" | null;
  foundDetail: string | null;
} => {
  const lowerText = text.toLowerCase();

  for (const word of FORBIDDEN_WORDS) {
    if (lowerText.includes(word)) {
      return { isSafe: false, reason: "profanity", foundDetail: word };
    }
  }

  if (hasViolentIntent(text)) {
    return { isSafe: false, reason: "malice", foundDetail: "violent intent" };
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

  if (containsPattern(text, HOSPITAL_LOCATION_PATTERN)) {
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
    sanitized = sanitized.replaceAll(
      HOSPITAL_LOCATION_PATTERN,
      "[location generalized]",
    );
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
  }

  let sanitizedMessage = rawMessage.trim();
  const reasons: string[] = [];

  const hasPhone = containsPattern(sanitizedMessage, PHONE_PATTERN);
  const hasEmail = containsPattern(sanitizedMessage, EMAIL_PATTERN);
  const hasSocial = containsPattern(sanitizedMessage, SOCIAL_PATTERN);
  const hasHospitalLocation = containsPattern(
    sanitizedMessage,
    HOSPITAL_LOCATION_PATTERN,
  );

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
