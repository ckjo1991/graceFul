import type {
  AppFlowStep,
  Category,
  Emotion,
  LanguageCode,
  PrototypeShareStep,
  SupportType,
} from "@/types";

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

export const EMOTIONS: readonly Emotion[] = ["grateful", "struggling"];
export const CATEGORIES: readonly Category[] = [
  "Financial",
  "Family",
  "Health",
  "Work",
  "Personal",
];
export const SUPPORT_OPTIONS: readonly SupportType[] = [
  "prayer",
  "just_sharing",
  "both",
];

export const SUPPORTED_LANGUAGES: Readonly<Record<LanguageCode, string>> = {
  en: "English",
  tl: "Tagalog",
  ceb: "Bisaya",
  hil: "Hiligaynon",
  es: "Spanish",
};

export const FLOW_STEPS: readonly AppFlowStep[] = [
  "feed",
  "emotion",
  "category",
  "message",
  "crisis",
  "warning",
  "support",
  "review",
  "done",
];

export const LEGACY_SHARE_STEPS: readonly PrototypeShareStep[] = [
  "welcome",
  "category",
  "message",
  "support",
  "translate_opt",
  "wording",
  "done",
];

export const UI_EN = {
  heroTitle: "GraceFul keeps prayer requests calm and anonymous.",
  heroBody:
    "The current product opens on the feed, then moves into a guided share flow only when someone chooses to post.",
  supportTitle: "Support comes as prayer, not debate.",
  crisisTitle: "If you are in immediate danger, contact NCMH (1553) or Hopeline now.",
  translatePrompt: "Offer translation after the core message is written",
} as const;
