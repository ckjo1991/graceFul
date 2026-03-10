import { generateTranslations } from "@/lib/translation";
import { canPost, checkCrisis, checkSafety, scrubPII } from "@/lib/guardian";
import { samplePosts } from "@/lib/sample-posts";
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

export type WarningReason = "pii" | "malice" | "profanity" | "spam" | null;

export interface CreateFeedPostParams {
  selection: AppFlowSelection;
  finalMessage: string;
  postedAt: number;
  deviceId?: string;
}

export interface CompletePostParams {
  posts: FeedPost[];
  selection: AppFlowSelection;
  finalMessage: string;
  postedAt: number;
  deviceId?: string;
}

export interface AddPrayerParams {
  posts: FeedPost[];
  postId: string;
  prayerText: string;
  createdAt: string;
}

export const INITIAL_SELECTION: AppFlowSelection = {
  emotion: "",
  category: "",
  message: "",
  support: "",
  wantsFollowUp: false,
};

export const INITIAL_POSTS: FeedPost[] =
  process.env.NODE_ENV === "development"
    ? samplePosts.map((post) => ({ ...post, prayers: [...post.prayers] }))
    : [];

export function createInitialSelection(): AppFlowSelection {
  return { ...INITIAL_SELECTION };
}

export function createInitialPosts(): FeedPost[] {
  return INITIAL_POSTS.map((post) => ({ ...post, prayers: [...post.prayers] }));
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
}

export function createFeedPost({
  selection,
  finalMessage,
  postedAt,
  deviceId,
}: CreateFeedPostParams): FeedPost | null {
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
    support: selection.support,
    allowTranslation: true,
    sourceLanguage: "en",
    translations: generateTranslations(sanitizedMessage),
    createdAt: "Just now",
    hearts: 0,
    prayers: [],
  };
}

export function completeSuccessfulPost({
  posts,
  selection,
  finalMessage,
  postedAt,
  deviceId,
}: CompletePostParams) {
  const newPost = createFeedPost({ selection, finalMessage, postedAt, deviceId });

  if (!newPost) {
    return null;
  }

  handleEscalationRequest(newPost);

  return {
    newPost,
    posts: [newPost, ...posts],
    lastPostTime: postedAt,
    nextStep: "done" as AppFlowStep,
  };
}

export function addPrayerToPost({
  posts,
  postId,
  prayerText,
  createdAt,
}: AddPrayerParams) {
  return posts.map((post) =>
    post.id === postId
      ? {
          ...post,
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
    id: `${post.id}-prayer-${post.prayers.length + 1}`,
    message: prayerText,
    createdAt,
    authorLabel: "Community prayer",
  };
}
