import type { Category, Emotion, LanguageCode, ShareStep } from "@/types";

export const COLORS = {
  bg: "#f5f1e8",
  primary: "#4a7c59",
  secondary: "#8fa78d",
  accent: "#c59563",
  text: "#1f2f25",
  danger: "#9f3e34",
} as const;

export const MIN_CHARS = 40;
export const MAX_CHARS = 800;

export const EMOTIONS: readonly Emotion[] = ["Grateful", "Struggling"];
export const CATEGORIES: readonly Category[] = [
  "Financial",
  "Family",
  "Personal",
  "Work",
  "Other",
];

export const SUPPORTED_LANGUAGES: Readonly<Record<LanguageCode, string>> = {
  en: "English",
  tl: "Tagalog",
  ceb: "Bisaya",
};

export const FLOW_STEPS: readonly ShareStep[] = [
  "welcome",
  "category",
  "message",
  "support",
  "translate_opt",
  "wording",
  "done",
];

export const UI_EN = {
  heroTitle: "Share what your heart is carrying.",
  heroBody:
    "GraceFul keeps the flow calm, anonymous, and prayer-centered from the first tap.",
  supportTitle: "Support comes as prayer, not debate.",
  crisisTitle: "If you are in immediate danger, contact NCMH (1553) or Hopeline now.",
  wordingPrompt: "Help me with wording",
  translatePrompt: "Offer translation after the core message is written",
} as const;

