import { containsPattern } from "@/lib/guardian/utils";

export const PHONE_PATTERN = /\b(?:\+?63[-\s]?|0)9\d{2}[-\s]?\d{3}[-\s]?\d{4}\b/g;
export const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
export const SOCIAL_PATTERN =
  /(@[a-zA-Z0-9._]+)|(facebook\.com\/[a-zA-Z0-9._]+)|(fb\.me\/[a-zA-Z0-9._]+)|(twitter\.com\/[a-zA-Z0-9._]+)/gi;
export const LOCATION_PATTERN =
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

export function escapeRegexLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const HOSPITAL_ALIAS_PATTERN = new RegExp(
  String.raw`\b(?:${HOSPITAL_ALIASES.map(escapeRegexLiteral).join("|")})\b`,
  "gi",
);

export const HOSPITAL_NAMED_PATTERN =
  /\b(?:[A-Z][A-Za-z0-9'.-]*(?:\s+[A-Z][A-Za-z0-9'.-]*){0,8}\s+(?:Hospital|Medical Center|General Hospital|District Hospital|City Hospital|Heart Center|Lung Center|Orthopedic Center|Children(?:'s)? Hospital|Kidney and Transplant Institute)|Ospital ng\s+[A-Z][A-Za-z0-9'.-]*(?:\s+[A-Za-z0-9'.-]+){0,5})\b/g;
export const NAME_PATTERN = /\b(?:ako si|my name is|name ko si)\s+[a-z][a-z\s'-]{1,30}\b/gi;
const FULL_NAME_PATTERN =
  /\b([A-Z][a-z]+(?:[-'][A-Z][a-z]+)?\s+[A-Z][a-z]+(?:[-'][A-Z][a-z]+)?)\b/g;
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

export function containsLikelyFullName(text: string): boolean {
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

export function redactLikelyFullNames(text: string, replacement: string): string {
  return text.replace(FULL_NAME_PATTERN, (match, _candidate, offset: number, source: string) =>
    isLikelyFullName(match) && !hasAdjacentCapitalizedWord(source, offset, offset + match.length)
      ? replacement
      : match,
  );
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

export type PIICheckResult = {
  hasPhone: boolean;
  hasEmail: boolean;
  hasSocial: boolean;
  hasHospitalLocation: boolean;
  hasFullName: boolean;
};

export function checkPII(text: string): PIICheckResult {
  return {
    hasPhone: containsPattern(text, PHONE_PATTERN),
    hasEmail: containsPattern(text, EMAIL_PATTERN),
    hasSocial: containsPattern(text, SOCIAL_PATTERN),
    hasHospitalLocation: containsSpecificHospitalLocation(text),
    hasFullName: containsLikelyFullName(text),
  };
}

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
