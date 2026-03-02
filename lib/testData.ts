import type { Category, Emotion } from "@/types";

export interface TestScenario {
  label: string;
  emotion: Emotion;
  category: Category;
  message: string;
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    label: "✅ Safe (Grateful)",
    emotion: "grateful",
    category: "Family",
    message:
      "I am so grateful for the rain today. It's been so hot lately, and the cool breeze is such a blessing for my garden.",
  },
  {
    label: "🚨 Crisis (NCMH)",
    emotion: "struggling",
    category: "Personal",
    message:
      "I feel so hopeless today. Ayoko na talaga, parang wala nang pag-asa lahat ng ginagawa ko. I just want it to end.",
  },
  {
    label: "📞 PII (Phone)",
    emotion: "grateful",
    category: "Work",
    message:
      "I got the job! If anyone needs tips on the interview, you can text me at 09175551234. Happy to help!",
  },
  {
    label: "🪪 PII (Full Name)",
    emotion: "struggling",
    category: "Personal",
    message:
      "Please pray for Cesar Obcena. I am worried about everything happening right now and need peace.",
  },
  {
    label: "🚫 Malice (Unkind)",
    emotion: "struggling",
    category: "Other",
    message:
      "Napakasama ng ugali ng kapitbahay ko. Gago talaga siya, mamatay ka sana sa ginawa mo sa akin.",
  },
  {
    label: "🕵️ NER Test (Mixed PII)",
    emotion: "struggling",
    category: "Work",
    message:
      "I'm so stressed at St. Luke's Hospital. Please email me at rico@email.com or message me on FB at facebook.com/rico.ux to talk.",
  },
];
