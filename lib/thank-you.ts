import type { Emotion } from "@/types";

export interface ThankYouMessage {
  title: string;
  body: string;
}

export const GRATEFUL_THANKYOU: ThankYouMessage[] = [
  {
    title: "Your gratitude is contagious.",
    body: "Someone out there needed to read something good today.",
  },
  {
    title: "Thank you for sharing the good.",
    body: "Gratitude shared is gratitude multiplied.",
  },
  {
    title: "This matters more than you know.",
    body: "Your thankfulness adds light to this space.",
  },
  {
    title: "What a beautiful thing to carry.",
    body: "Thank you for letting the community celebrate with you.",
  },
  {
    title: "Goodness, shared.",
    body: "Your gratitude is now a prayer for someone else's hope.",
  },
];

export const STRUGGLING_THANKYOU: ThankYouMessage[] = [
  {
    title: "You were brave to share this.",
    body: "You are not carrying this alone anymore.",
  },
  {
    title: "This took courage.",
    body: "The community is with you. You don't have to figure it out alone.",
  },
  {
    title: "Thank you for trusting this space.",
    body: "What you're feeling is real, and it deserves to be held gently.",
  },
  {
    title: "You showed up. That's enough.",
    body: "Rest here. Let others lift this with you.",
  },
  {
    title: "You are seen.",
    body: "Sharing the hard stuff is an act of faith. We're glad you did.",
  },
];

export function getThankYouVariants(
  emotion: Emotion | "" | "just_sharing" | null | undefined,
) {
  return emotion === "struggling" ? STRUGGLING_THANKYOU : GRATEFUL_THANKYOU;
}

export function pickThankYouMessage(
  emotion: Emotion | "" | "just_sharing" | null | undefined,
  random: () => number = Math.random,
): ThankYouMessage {
  const variants = getThankYouVariants(emotion);
  const pickedIndex = Math.floor(random() * variants.length);
  const safeIndex = Math.min(variants.length - 1, Math.max(0, pickedIndex));

  return variants[safeIndex];
}
