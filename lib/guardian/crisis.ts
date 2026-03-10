import { checkLexiconCrisis } from "@/lib/lexicon";

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

export function hasUrgentCrisisContext(text: string): boolean {
  const lowerText = text.toLowerCase();
  const hasUrgency = URGENCY_PATTERNS.some((pattern) => pattern.test(text));
  const hasCrisisSignal =
    SELF_HARM_URGENCY_PATTERN.test(text) ||
    CRISIS_CONTEXT_PATTERN.test(text) ||
    checkLexiconCrisis(text) ||
    CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword));

  return hasUrgency && hasCrisisSignal;
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
