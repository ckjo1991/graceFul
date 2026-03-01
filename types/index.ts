export type Emotion = "Grateful" | "Struggling";

export type Category =
  | "Financial"
  | "Family"
  | "Personal"
  | "Work"
  | "Other";

export type LanguageCode = "en" | "tl" | "ceb";

export type ShareStep =
  | "welcome"
  | "category"
  | "message"
  | "support"
  | "translate_opt"
  | "wording"
  | "done";

export interface ShareDraft {
  emotion: Emotion | null;
  category: Category | null;
  message: string;
  translatedTo: LanguageCode | null;
  wantsWordingHelp: boolean;
}

export interface GuardianResult {
  outcome: "allow" | "sanitize" | "redirect_crisis";
  sanitizedMessage: string;
  reasons: string[];
}

export interface Prayer {
  id: string;
  authorLabel: string;
  message: string;
  createdAt: string;
}

export interface Post {
  id: string;
  emotion: Emotion;
  category: Category;
  message: string;
  prayerCount: number;
  translationLabel: string;
  createdAt: string;
  prayers: Prayer[];
}
