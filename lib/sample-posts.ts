import type { Post } from "@/types";

export const samplePosts: Post[] = [
  {
    id: "post-1",
    emotion: "Grateful",
    category: "Family",
    message:
      "I am grateful that my mother came through her tests well this week. Please pray that our family stays steady and thankful as we keep caring for her.",
    prayerCount: 12,
    translationLabel: "English",
    createdAt: "2026-02-27T09:00:00.000Z",
    prayers: [
      {
        id: "prayer-1",
        authorLabel: "Another prayer",
        message:
          "Lord, keep this family grounded in peace and give them strength for every next appointment.",
        createdAt: "2026-02-27T10:30:00.000Z",
      },
    ],
  },
  {
    id: "post-2",
    emotion: "Struggling",
    category: "Work",
    message:
      "I have been carrying deep anxiety about work and I need prayer for wisdom, endurance, and the courage to keep going without losing hope.",
    prayerCount: 9,
    translationLabel: "Tagalog available",
    createdAt: "2026-02-26T13:15:00.000Z",
    prayers: [
      {
        id: "prayer-2",
        authorLabel: "Shared prayer",
        message:
          "May you find rest for your mind and clarity for the next faithful step in front of you.",
        createdAt: "2026-02-26T16:00:00.000Z",
      },
    ],
  },
  {
    id: "post-3",
    emotion: "Grateful",
    category: "Financial",
    message:
      "Provision came just when we needed it. I want to thank God openly and ask for continued wisdom as we handle what has been entrusted to us.",
    prayerCount: 6,
    translationLabel: "Bisaya available",
    createdAt: "2026-02-25T07:45:00.000Z",
    prayers: [],
  },
];
