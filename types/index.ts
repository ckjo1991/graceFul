export type Emotion = "grateful" | "struggling";

export type Category =
  | "Financial"
  | "Family"
  | "Health"
  | "Personal"
  | "Work"
  | "Other";

export type SupportType =
  | "A prayer would be nice"
  | "Just sharing"
  | "Both prayer and encouragement";

export type LanguageCode =
  | "en"
  | "tl"
  | "ceb"
  | "ilo"
  | "hil"
  | "war"
  | "pam"
  | "bcl"
  | "es";

export type AppFlowStep =
  | "feed"
  | "emotion"
  | "category"
  | "message"
  | "crisis"
  | "warning"
  | "support"
  | "translate_opt"
  | "review"
  | "done";

export type PrototypeShareStep =
  | "welcome"
  | "category"
  | "message"
  | "support"
  | "translate_opt"
  | "wording"
  | "done";

export interface AppFlowSelection {
  emotion: Emotion | "";
  category: Category | "";
  message: string;
  support: SupportType | "";
  allowTranslation: boolean | null;
}

export interface PrototypeShareDraft {
  emotion: Emotion | null;
  category: Category | null;
  message: string;
  translatedTo: LanguageCode | null;
  wantsWordingHelp: boolean;
}

export interface GuardianResult {
  outcome: "allow" | "sanitize" | "redirect_crisis" | "block";
  sanitizedMessage: string;
  reasons: string[];
}

export interface PrayerResponse {
  id: string;
  message: string;
  createdAt: string;
  authorLabel?: string;
}

export type TranslationMap = Partial<Record<LanguageCode, string>>;

export interface FeedPost {
  id: string;
  emotion: Emotion;
  category: Category;
  message: string;
  supportType: SupportType;
  allowTranslation: boolean;
  sourceLanguage: LanguageCode;
  translations: TranslationMap;
  createdAt: string;
  prayerCount: number;
  prayers: PrayerResponse[];
}

export interface FeedPostWithPrayers extends FeedPost {
  translationLabel: string;
}
