import { generateTranslations } from "@/lib/translation";
import { canPost, checkCrisis, checkSafety, scrubPII } from "@/lib/guardian";
import type { TestScenario } from "@/lib/testData";
import type {
  AppFlowSelection,
  AppFlowStep,
  Category,
  Emotion,
  FeedPost,
  PrayerResponse,
  SupportType,
} from "@/types";

export type WarningReason = "pii" | "malice" | "profanity" | null;

export const INITIAL_SELECTION: AppFlowSelection = {
  emotion: "",
  category: "",
  message: "",
  support: "",
  wantsFollowUp: false,
};

export const INITIAL_POSTS: FeedPost[] = [
  {
    id: "1",
    emotion: "grateful",
    category: "Family",
    message:
      "So thankful for my mother's recovery. It's been a hard few months but she's doing so well now.",
    wantsFollowUp: false,
    supportType: "A prayer would be nice",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Napakalaking biyaya para sa amin na gumagaling na ang nanay ko. Salamat sa Diyos sa Kanyang kabutihan sa aming pamilya.",
      ceb: "Dako kaayo akong pasalamat sa pagkaayo sa akong inahan. Salamat sa Diyos kay padayon Niyang gipalig-on ang among pamilya.",
    },
    createdAt: "2h ago",
    prayerCount: 1,
    prayers: [
      {
        id: "prayer-1",
        message:
          "Lord, continue covering this family with peace and steady healing in the days ahead.",
        createdAt: "1h ago",
        authorLabel: "Community prayer",
      },
    ],
  },
  {
    id: "2",
    emotion: "struggling",
    category: "Financial",
    message:
      "Going through a tough time financially. Trying to stay hopeful but it's hard some days.",
    wantsFollowUp: false,
    supportType: "Both prayer and encouragement",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: generateTranslations(
      "Going through a tough time financially. Trying to stay hopeful but it's hard some days.",
    ),
    createdAt: "4h ago",
    prayerCount: 1,
    prayers: [
      {
        id: "prayer-2",
        message:
          "May provision, wisdom, and daily peace meet you right where you are today.",
        createdAt: "3h ago",
        authorLabel: "Shared prayer",
      },
    ],
  },
  {
    id: "3",
    emotion: "grateful",
    category: "Work",
    message:
      "A difficult conversation at work ended with more peace than I expected. I am grateful for the patience and clarity that showed up right on time.",
    wantsFollowUp: false,
    supportType: "Just sharing",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: generateTranslations(
      "A difficult conversation at work ended with more peace than I expected. I am grateful for the patience and clarity that showed up right on time.",
    ),
    createdAt: "7h ago",
    prayerCount: 0,
    prayers: [],
  },
  {
    id: "4",
    emotion: "struggling",
    category: "Health",
    message:
      "Waiting on some test results this week and feeling more anxious than I expected. Praying for peace and strength while I wait.",
    wantsFollowUp: false,
    supportType: "A prayer would be nice",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: generateTranslations(
      "Waiting on some test results this week and feeling more anxious than I expected. Praying for peace and strength while I wait.",
    ),
    createdAt: "9h ago",
    prayerCount: 2,
    prayers: [
      {
        id: "prayer-3",
        message: "God, hold this person steady while they wait and bring calm to every thought.",
        createdAt: "8h ago",
        authorLabel: "Another prayer",
      },
      {
        id: "prayer-4",
        message: "Please surround them with peace, clear results, and caring support.",
        createdAt: "7h ago",
        authorLabel: "Community prayer",
      },
    ],
  },
  {
    id: "5",
    emotion: "struggling",
    category: "Personal",
    message:
      "I have been trying to rebuild healthy routines again after a hard season. Asking for steadiness and grace for small steps.",
    wantsFollowUp: false,
    supportType: "Both prayer and encouragement",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Sinusubukan kong buuin muli ang sarili ko pagkatapos ng isang mabigat na yugto. Hinihingi ko sa Diyos ang biyaya para sa maliliit pero tapat na hakbang.",
      ceb: "Naningkamot ko nga motindog pag-usab human sa lisod nga panahon. Nangayo ko sa Diyos og grasya para sa gagmay pero matinud-anong mga lakang.",
    },
    createdAt: "11h ago",
    prayerCount: 1,
    prayers: [
      {
        id: "prayer-5",
        message: "Lord, bless these small steps and turn them into steady healing over time.",
        createdAt: "10h ago",
        authorLabel: "Shared prayer",
      },
    ],
  },
  {
    id: "6",
    emotion: "grateful",
    category: "Other",
    message:
      "A neighbor showed unexpected kindness today and it reminded me that quiet goodness still finds us in ordinary moments.",
    wantsFollowUp: false,
    supportType: "Just sharing",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: generateTranslations(
      "A neighbor showed unexpected kindness today and it reminded me that quiet goodness still finds us in ordinary moments.",
    ),
    createdAt: "13h ago",
    prayerCount: 0,
    prayers: [],
  },
];

export function createInitialSelection(): AppFlowSelection {
  return { ...INITIAL_SELECTION };
}

export function createInitialPosts(): FeedPost[] {
  return INITIAL_POSTS.map((post) => ({ ...post }));
}

export function startShareFlow(lastPostTime: number | null) {
  const cooldown = canPost(lastPostTime);

  if (!cooldown.allowed) {
    return {
      allowed: false as const,
      waitTime: cooldown.waitTime,
    };
  }

  return {
    allowed: true as const,
    nextStep: "emotion" as AppFlowStep,
    selection: createInitialSelection(),
    warningReason: null as WarningReason,
  };
}

export function selectEmotion(selection: AppFlowSelection, emotion: Emotion) {
  return {
    selection: { ...selection, emotion },
    nextStep: "category" as AppFlowStep,
  };
}

export function selectCategory(selection: AppFlowSelection, category: Category) {
  return {
    selection: { ...selection, category },
    nextStep: "message" as AppFlowStep,
  };
}

export function submitMessage(selection: AppFlowSelection, message: string) {
  const nextSelection = { ...selection, message };

  if (checkCrisis(message)) {
    return {
      selection: nextSelection,
      nextStep: "crisis" as AppFlowStep,
      warningReason: null as WarningReason,
    };
  }

  const safety = checkSafety(message);
  if (!safety.isSafe && safety.reason) {
    return {
      selection: nextSelection,
      nextStep: "warning" as AppFlowStep,
      warningReason: safety.reason as Exclude<WarningReason, null>,
    };
  }

  return {
    selection: nextSelection,
    nextStep: "support" as AppFlowStep,
    warningReason: null as WarningReason,
  };
}

export function selectSupport(selection: AppFlowSelection, support: SupportType) {
  return {
    selection: { ...selection, support },
    nextStep: "review" as AppFlowStep,
  };
}

export function handleEscalationRequest(post: FeedPost): void {
  if (!post.wantsFollowUp) return;

  // TODO: When prayer team integration is ready, replace this
  // with a real notification - email, Slack, internal dashboard,
  // or whatever delivery mechanism the church team decides on.
  // The post.id and post.category are available for routing.
  // The poster remains anonymous - no contact info is collected.
  // The prayer team reaches out through existing church channels.
  console.log("[GraceFul] Escalation requested for post:", {
    postId: post.id,
    category: post.category,
    emotion: post.emotion,
    wantsFollowUp: post.wantsFollowUp,
    createdAt: post.createdAt,
  });
}

export function createFeedPost(
  selection: AppFlowSelection,
  finalMessage: string,
  postedAt: number,
  deviceId?: string,
): FeedPost | null {
  if (!selection.emotion || !selection.category || !selection.support) {
    return null;
  }

  const sanitizedMessage = scrubPII(finalMessage);

  return {
    id: postedAt.toString(),
    emotion: selection.emotion,
    category: selection.category,
    message: sanitizedMessage,
    deviceId,
    wantsFollowUp: selection.wantsFollowUp,
    supportType: selection.support,
    allowTranslation: true,
    sourceLanguage: "en",
    translations: generateTranslations(sanitizedMessage),
    createdAt: "Just now",
    prayerCount: 0,
    prayers: [],
  };
}

export function completeSuccessfulPost(
  posts: FeedPost[],
  selection: AppFlowSelection,
  finalMessage: string,
  postedAt: number,
  deviceId?: string,
) {
  const newPost = createFeedPost(selection, finalMessage, postedAt, deviceId);

  if (!newPost) {
    return null;
  }

  handleEscalationRequest(newPost);

  return {
    posts: [newPost, ...posts],
    lastPostTime: postedAt,
    nextStep: "done" as AppFlowStep,
  };
}

export function addPrayerToPost(
  posts: FeedPost[],
  postId: string,
  prayerText: string,
  createdAt: string,
) {
  return posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          prayerCount: post.prayerCount + 1,
          prayers: [
            ...post.prayers,
            createPrayerEntry(post, prayerText, createdAt),
          ],
        }
      : post,
  );
}

export function returnToFeed() {
  return "feed" as AppFlowStep;
}

export function injectScenario(selection: AppFlowSelection, scenario: TestScenario) {
  return {
    selection: {
      ...selection,
      emotion: scenario.emotion,
      category: scenario.category,
      message: scenario.message,
    },
    nextStep: "message" as AppFlowStep,
  };
}

function createPrayerEntry(post: FeedPost, prayerText: string, createdAt: string): PrayerResponse {
  return {
    id: `${post.id}-prayer-${post.prayerCount + 1}`,
    message: prayerText,
    createdAt,
    authorLabel: "Community prayer",
  };
}
