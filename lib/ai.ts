import {
  checkCrisis,
  checkSafety,
  hasViolentIntent,
  runGuardian,
} from "@/lib/guardian";

export interface GuardianAIResult {
  scrubbedMessage: string;
  isCrisis: boolean;
  isSafe: boolean;
  feedback: string;
}

export interface IntentResult {
  isSafe: boolean;
  reason: "malice" | "safe";
}

type GuardianAIMode = "review" | "refine";
export type Tone = "original" | "gentle" | "clear";

export async function analyzeIntent(message: string): Promise<IntentResult> {
  // Placeholder: translate message to English or call a multilingual model here.
  const translated = message;

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (hasViolentIntent(translated)) {
    return { isSafe: false, reason: "malice" };
  }

  const impliedPatterns = /\b(hope|wish|pray)\b.*\b(hurt|die|injury|accident)\b/i;

  if (impliedPatterns.test(translated)) {
    return { isSafe: false, reason: "malice" };
  }

  return { isSafe: true, reason: "safe" };
}

// This is a simulated "server-side" AI entry point for Guardian.
export async function runGuardianAI(
  userMessage: string,
  mode: GuardianAIMode = "review",
): Promise<GuardianAIResult> {
  const prompt = `
    You are the GraceFul Guardian AI.
    Analyze this message: "${userMessage}"

    Tasks:
    1. Identify and REPLACE all PII (Names, Specific Locations, Phone numbers, Social handles) with [generalized info].
    2. Check for Crisis (Self-harm/Suicide).
    3. Check for Malice (Hate speech/Attacks).
    4. ${mode === "refine" ? "Polish the message while preserving the user's meaning." : "Return a safe review version of the message."}

    Return a JSON object:
    {
      "scrubbedMessage": "string",
      "isCrisis": boolean,
      "isSafe": boolean,
      "feedback": "string"
    }
  `;

  void prompt;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const guardianResult = runGuardian(userMessage);
  const isCrisis = guardianResult.outcome === "redirect_crisis" || checkCrisis(userMessage);
  const safety = checkSafety(userMessage);
  const intentResult = await analyzeIntent(userMessage);

  if (isCrisis) {
    return {
      scrubbedMessage: guardianResult.sanitizedMessage,
      isCrisis: true,
      isSafe: false,
      feedback: "This message may need immediate care. Redirecting to crisis support.",
    };
  }

  if (!intentResult.isSafe) {
    return {
      scrubbedMessage: guardianResult.sanitizedMessage,
      isCrisis: false,
      isSafe: false,
      feedback: "Guardian detected harmful intent in this message. Please rephrase it before sharing.",
    };
  }

  if (!safety.isSafe) {
    const feedback =
      safety.reason === "pii"
        ? "Please remove personal details like full names, phone numbers, email addresses, or social handles before sharing."
        : "Please soften any attacking or harmful language before sharing.";

    return {
      scrubbedMessage: guardianResult.sanitizedMessage,
      isCrisis: false,
      isSafe: false,
      feedback,
    };
  }

  const baseMessage = guardianResult.sanitizedMessage;
  const scrubbedMessage =
    mode === "refine" ? refineMessage(baseMessage) : baseMessage;

  return {
    scrubbedMessage,
    isCrisis: false,
    isSafe: true,
    feedback:
      mode === "refine"
        ? "Guardian refined the wording while keeping your meaning intact."
        : guardianResult.reasons.length > 0
          ? `Guardian generalized sensitive details: ${guardianResult.reasons.join(" ")}`
          : "Looks good!",
  };
}

function refineMessage(message: string) {
  let refined = normalizeSentenceCase(message);

  const replacements: Array<[RegExp, string]> = [
    [/\bi hate work\b/gi, "I am feeling very overwhelmed by work right now"],
    [/\bi hate\b/gi, "I am deeply struggling with"],
    [/\bi'm so mad at\b/gi, "I am having a very difficult time with"],
    [/\bi am so mad at\b/gi, "I am having a very difficult time with"],
    [/\bmy boss\b/gi, "a relationship at work"],
    [/\bhe is so mean\b/gi, "the environment feels especially difficult"],
    [/\bshe is so mean\b/gi, "the environment feels especially difficult"],
    [/\bthey are so mean\b/gi, "the environment feels especially difficult"],
  ];

  for (const [pattern, replacement] of replacements) {
    refined = refined.replace(pattern, replacement);
  }

  refined = refined.replace(/\s+/g, " ").trim();

  if (!/[.!?]$/.test(refined)) {
    refined = `${refined}.`;
  }

  return refined;
}

function normalizeSentenceCase(message: string) {
  const trimmed = message.trim();

  if (!trimmed) {
    return "";
  }

  const lower = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  return lower
    .replace(/\bi\b/g, "I")
    .replace(/\bi'm\b/gi, "I am")
    .replace(/\bdon't\b/gi, "do not")
    .replace(/\bcan't\b/gi, "cannot");
}

export async function refineWording(message: string, tone: Tone) {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (tone === "original") {
    return message;
  }

  if (tone === "gentle") {
    return "✨ [Gentle Version]: I've been carrying a lot on my heart lately regarding my situation at work, and I'm looking for a bit of peace and perspective.";
  }

  if (tone === "clear") {
    return "✨ [Clear Version]: I am currently navigating some difficult challenges in my professional life and would appreciate your prayers and support.";
  }

  return message;
}
