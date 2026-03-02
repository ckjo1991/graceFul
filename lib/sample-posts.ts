import type { FeedPostWithPrayers } from "@/types";

export const samplePosts: FeedPostWithPrayers[] = [
  {
    id: "post-1",
    emotion: "grateful",
    category: "Family",
    message:
      "I am grateful that my mother came through her tests well this week. Please pray that our family stays steady and thankful as we keep caring for her.",
    wantsFollowUp: false,
    supportType: "A prayer would be nice",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Napakalaking biyaya para sa amin na gumagaling na ang nanay ko. Salamat sa Diyos sa Kanyang kabutihan sa aming pamilya.",
      ceb: "Dako kaayo akong pasalamat sa pagkaayo sa akong inahan. Salamat sa Diyos kay padayon Niyang gipalig-on ang among pamilya.",
    },
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
    emotion: "struggling",
    category: "Work",
    message:
      "I have been carrying deep anxiety about work and I need prayer for wisdom, endurance, and the courage to keep going without losing hope.",
    wantsFollowUp: false,
    supportType: "Both prayer and encouragement",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Mabigat ang dinadala ko sa trabaho nitong mga araw. Pagod na ako, pero humihingi pa rin ako ng lakas at karunungan sa Diyos.",
      ceb: "Bug-at na kaayo ang trabaho karong mga adlawa. Kapoy na ko, pero nangayo gihapon ko sa Diyos og kusog ug kaalam.",
    },
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
    emotion: "grateful",
    category: "Financial",
    message:
      "Provision came just when we needed it. I want to thank God openly and ask for continued wisdom as we handle what has been entrusted to us.",
    wantsFollowUp: false,
    supportType: "Just sharing",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Dumating ang probisyon ng Diyos sa tamang panahon. Taos-puso akong nagpapasalamat at hinihingi ko pa rin ang Kanyang karunungan sa paghawak nito.",
      ceb: "Miabot ang panalangin sa hustong panahon. Nagpasalamat ko sa Diyos ug nangayo gihapon ko og kaalam sa pagdumala sa gisalig Niya kanamo.",
    },
    prayerCount: 6,
    translationLabel: "Bisaya available",
    createdAt: "2026-02-25T07:45:00.000Z",
    prayers: [],
  },
];
