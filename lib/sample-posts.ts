import type { FeedPostWithPrayers } from "@/types";

export const samplePosts: FeedPostWithPrayers[] = [
  {
    id: "post-1",
    emotion: "grateful",
    category: "Family",
    message:
      "I am grateful that my mother came through her tests well this week. Please pray that our family stays steady and thankful as we keep caring for her.",
    supportType: "A prayer would be nice",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Pagsasalin sa Tagalog: Nagpapasalamat ako dahil maayos ang naging resulta ng mga pagsusuri ng aking nanay ngayong linggo. Pakiusap, ipanalangin na manatiling matatag at mapagpasalamat ang aming pamilya habang inaalagaan namin siya.",
      ceb: "Hubad sa Binisaya: Mapasalamaton ko nga maayo ang resulta sa mga test sa akong inahan niining semanaha. Palihug iampo nga magpabiling lig-on ug mapasalamaton ang among pamilya samtang ampingan namo siya.",
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
    supportType: "Both prayer and encouragement",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Pagsasalin sa Tagalog: Mabigat ang aking pagkabalisa tungkol sa trabaho at kailangan ko ng panalangin para sa karunungan, pagtitiis, at tapang na magpatuloy nang may pag-asa.",
      ceb: "Hubad sa Binisaya: Bug-at ang akong kabalaka bahin sa trabaho ug nanginahanglan ko og pag-ampo para sa kaalam, paglahutay, ug kaisog nga mopadayon nga adunay paglaum.",
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
    supportType: "Just sharing",
    allowTranslation: true,
    sourceLanguage: "en",
    translations: {
      tl: "Pagsasalin sa Tagalog: Dumating ang probisyon sa tamang oras. Nais kong magpasalamat sa Diyos at humingi ng patuloy na karunungan sa paghawak ng ipinagkatiwala sa amin.",
      ceb: "Hubad sa Binisaya: Miabot ang panalangin sa hustong panahon. Gusto kong mopasalamat sa Diyos ug mangayo og padayon nga kaalam sa pagdumala sa gisalig kanamo.",
    },
    prayerCount: 6,
    translationLabel: "Bisaya available",
    createdAt: "2026-02-25T07:45:00.000Z",
    prayers: [],
  },
];
