export type Emotion = "grateful" | "struggling";

export type Category =
  | "Financial"
  | "Family"
  | "Health"
  | "Work"
  | "Personal";

export type SupportType =
  | "just_sharing"
  | "prayer"
  | "both"
  | "encouragement";

export type LanguageCode =
  | "en"
  | "tl"
  | "ceb"
  | "hil"
  | "es";

export type AppFlowStep =
  | "feed"
  | "emotion"
  | "category"
  | "message"
  | "crisis"
  | "warning"
  | "support"
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
  wantsFollowUp: boolean;
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

export type Prayer = PrayerResponse;

export type TranslationMap = Partial<Record<LanguageCode, string>>;

export interface FeedPost {
  id: string;
  emotion: Emotion;
  category: Category;
  message: string;
  deviceId?: string;
  wantsFollowUp: boolean;
  support: SupportType;
  allowTranslation: boolean;
  sourceLanguage: LanguageCode;
  translations: TranslationMap;
  createdAt: string;
  hearts: number;
  prayers: PrayerResponse[];
}

export interface FeedPostWithPrayers extends FeedPost {
  translationLabel: string;
}
