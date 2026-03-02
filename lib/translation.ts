import type {
  Category,
  Emotion,
  LanguageCode,
  SupportType,
  TranslationMap,
} from "@/types";

type UiCopy = {
  feed: {
    tagline: string;
    share: string;
    allEmotion: string;
    allTopics: string;
    noPostsTitle: string;
    noPostsBody: string;
    viewFeed: string;
    shareAgain: string;
    successTitle: string;
    successBody: string;
    restartTitle: string;
    restartBody: string;
    restart: string;
    cooldown: (waitTime: number) => string;
  };
  emotionStep: {
    title: string;
    description: string;
    gratefulTitle: string;
    gratefulBody: string;
    strugglingTitle: string;
    strugglingBody: string;
  };
  categoryStep: {
    title: string;
    description: string;
    note: string;
    back: string;
  };
  messageStep: {
    title: string;
    description: string;
    gratefulIntro: string;
    strugglingIntro: string;
    previewSuffix: string;
    gratefulPlaceholder: string;
    strugglingPlaceholder: string;
    goodLength: string;
    atLeast: (min: number, remaining: number) => string;
    tooBrief: string;
    back: string;
    continue: string;
  };
  supportStep: {
    title: string;
    description: string;
    back: string;
  };
  translateStep: {
    title: string;
    description: string;
    yesTitle: string;
    yesBody: string;
    noTitle: string;
    noBody: string;
    back: string;
  };
  reviewStep: {
    title: string;
    description: string;
    initialFeedback: string;
    fallbackFeedback: string;
    reviewing: string;
    back: string;
    share: string;
    checking: string;
  };
  postCard: {
    pray: string;
    original: string;
    translated: string;
    communityPrayer: string;
  };
  prayerModal: {
    title: string;
    prompt: string;
    placeholder: string;
    helper: string;
    submit: string;
    confirmClose: string;
    warningDefault: string;
    warningCrisis: string;
    warningProfanity: string;
    warningMalice: string;
    warningPii: string;
  };
  prayerList: {
    empty: string;
    original: string;
  };
  guardianWarning: {
    piiTitle: string;
    piiMessage: string;
    maliceTitle: string;
    maliceMessage: string;
    profanityTitle: string;
    profanityMessage: string;
    edit: string;
    retry: string;
  };
  crisis: {
    title: string;
    body: string;
    primary: string;
    alternative: string;
    dial: string;
    back: string;
  };
};

const TRANSLATABLE_LANGUAGES: Array<Exclude<LanguageCode, "en">> = [
  "tl",
  "ceb",
  "ilo",
  "hil",
  "war",
  "pam",
  "bcl",
  "es",
];

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  tl: "Tagalog",
  ceb: "Bisaya",
  ilo: "Ilocano",
  hil: "Hiligaynon",
  war: "Waray",
  pam: "Kapampangan",
  bcl: "Bicol",
  es: "Spanish",
};

const TRANSLATION_PREFIXES: Record<Exclude<LanguageCode, "en">, string> = {
  tl: "Pagsasalin sa Tagalog: ",
  ceb: "Hubad sa Binisaya: ",
  ilo: "Patarus iti Ilocano: ",
  hil: "Hubad sa Hiligaynon: ",
  war: "Hubad ha Waray: ",
  pam: "Salin king Kapampangan: ",
  bcl: "Salin sa Bikol: ",
  es: "Traduccion al Espanol: ",
};

const LANGUAGE_REPLACEMENTS: Record<
  Exclude<LanguageCode, "en">,
  Array<[RegExp, string]>
> = {
  tl: [
    [/\bI am grateful for\b/gi, "Nagpapasalamat ako para sa"],
    [/\bI am grateful\b/gi, "Nagpapasalamat ako"],
    [/\bI am struggling with\b/gi, "Nahihirapan ako sa"],
    [/\bPlease pray\b/gi, "Pakiusap, ipanalangin"],
    [/\bpray for\b/gi, "ipanalangin ang"],
    [/\bpeace\b/gi, "kapayapaan"],
    [/\bstrength\b/gi, "lakas"],
    [/\bwisdom\b/gi, "karunungan"],
    [/\bfamily\b/gi, "pamilya"],
    [/\bwork\b/gi, "trabaho"],
    [/\bhealth\b/gi, "kalusugan"],
    [/\bgrateful\b/gi, "mapagpasalamat"],
    [/\bstruggling\b/gi, "nahihirapan"],
  ],
  ceb: [
    [/\bI am grateful for\b/gi, "Mapasalamaton ko alang sa"],
    [/\bI am grateful\b/gi, "Mapasalamaton ko"],
    [/\bI am struggling with\b/gi, "Nalisdan ko sa"],
    [/\bPlease pray\b/gi, "Palihug pag-ampo"],
    [/\bpray for\b/gi, "iampo ang"],
    [/\bpeace\b/gi, "kalinaw"],
    [/\bstrength\b/gi, "kusog"],
    [/\bwisdom\b/gi, "kaalam"],
    [/\bfamily\b/gi, "pamilya"],
    [/\bwork\b/gi, "trabaho"],
    [/\bhealth\b/gi, "panglawas"],
    [/\bgrateful\b/gi, "mapasalamaton"],
    [/\bstruggling\b/gi, "nalisdan"],
  ],
  ilo: [
    [/\bI am grateful for\b/gi, "Agyamanak iti"],
    [/\bI am grateful\b/gi, "Agyamanak"],
    [/\bI am struggling with\b/gi, "Makibalbalakadak iti"],
    [/\bPlease pray\b/gi, "Pangngaasim ta ikararagyo"],
    [/\bpray for\b/gi, "ikararag ti"],
    [/\bpeace\b/gi, "talna"],
    [/\bstrength\b/gi, "pigsa"],
    [/\bwisdom\b/gi, "sirib"],
    [/\bfamily\b/gi, "pamilia"],
    [/\bwork\b/gi, "trabaho"],
    [/\bhealth\b/gi, "salun-at"],
    [/\bgrateful\b/gi, "agyaman"],
    [/\bstruggling\b/gi, "makikadkadua iti rigat"],
  ],
  hil: [
    [/\bI am grateful for\b/gi, "Mapasalamaton ako para sa"],
    [/\bI am grateful\b/gi, "Mapasalamaton ako"],
    [/\bI am struggling with\b/gi, "Nagapangabudlay ako sa"],
    [/\bPlease pray\b/gi, "Palihog, ipangamuyo"],
    [/\bpray for\b/gi, "ipangamuyo ang"],
    [/\bpeace\b/gi, "kalinong"],
    [/\bstrength\b/gi, "kusog"],
    [/\bwisdom\b/gi, "kaalam"],
    [/\bfamily\b/gi, "pamilya"],
    [/\bwork\b/gi, "ubra"],
    [/\bhealth\b/gi, "lawas"],
    [/\bgrateful\b/gi, "mapasalamaton"],
    [/\bstruggling\b/gi, "nagapangabudlay"],
  ],
  war: [
    [/\bI am grateful for\b/gi, "Mapasalamaton ako para han"],
    [/\bI am grateful\b/gi, "Mapasalamaton ako"],
    [/\bI am struggling with\b/gi, "Nakurian ako ha"],
    [/\bPlease pray\b/gi, "Alayon pag-ampo"],
    [/\bpray for\b/gi, "iampo an"],
    [/\bpeace\b/gi, "kamurayawan"],
    [/\bstrength\b/gi, "kusog"],
    [/\bwisdom\b/gi, "kinaadman"],
    [/\bfamily\b/gi, "pamilya"],
    [/\bwork\b/gi, "trabaho"],
    [/\bhealth\b/gi, "lawas"],
    [/\bgrateful\b/gi, "mapasalamaton"],
    [/\bstruggling\b/gi, "nakukurian"],
  ],
  pam: [
    [/\bI am grateful for\b/gi, "Mapasalamat ku king"],
    [/\bI am grateful\b/gi, "Mapasalamat ku"],
    [/\bI am struggling with\b/gi, "Makasakit kung lub king"],
    [/\bPlease pray\b/gi, "Pakisabi yung manalangin"],
    [/\bpray for\b/gi, "ipanalangin ya ing"],
    [/\bpeace\b/gi, "kapayapan"],
    [/\bstrength\b/gi, "lakas"],
    [/\bwisdom\b/gi, "karunungan"],
    [/\bfamily\b/gi, "pamilya"],
    [/\bwork\b/gi, "obra"],
    [/\bhealth\b/gi, "kalusugan"],
    [/\bgrateful\b/gi, "mapasalamat"],
    [/\bstruggling\b/gi, "makasakit lub"],
  ],
  bcl: [
    [/\bI am grateful for\b/gi, "Nagpapasalamat ako para sa"],
    [/\bI am grateful\b/gi, "Nagpapasalamat ako"],
    [/\bI am struggling with\b/gi, "Nahihirapan ako sa"],
    [/\bPlease pray\b/gi, "Pakisuyo, ipag-ampo"],
    [/\bpray for\b/gi, "ipag-ampo an"],
    [/\bpeace\b/gi, "katoninongan"],
    [/\bstrength\b/gi, "kusog"],
    [/\bwisdom\b/gi, "karahayan na isip"],
    [/\bfamily\b/gi, "pamilya"],
    [/\bwork\b/gi, "trabaho"],
    [/\bhealth\b/gi, "salud"],
    [/\bgrateful\b/gi, "mapasalamaton"],
    [/\bstruggling\b/gi, "nahihirapan"],
  ],
  es: [
    [/\bI am grateful for\b/gi, "Estoy agradecido por"],
    [/\bI am grateful\b/gi, "Estoy agradecido"],
    [/\bI am struggling with\b/gi, "Estoy luchando con"],
    [/\bPlease pray\b/gi, "Por favor oren"],
    [/\bpray for\b/gi, "oren por"],
    [/\bpeace\b/gi, "paz"],
    [/\bstrength\b/gi, "fortaleza"],
    [/\bwisdom\b/gi, "sabiduria"],
    [/\bfamily\b/gi, "familia"],
    [/\bwork\b/gi, "trabajo"],
    [/\bhealth\b/gi, "salud"],
    [/\bgrateful\b/gi, "agradecido"],
    [/\bstruggling\b/gi, "luchando"],
  ],
};

const CATEGORY_LABELS: Record<LanguageCode, Record<Category, string>> = {
  en: {
    Financial: "Financial",
    Family: "Family",
    Health: "Health",
    Personal: "Personal",
    Work: "Work",
    Other: "Other",
  },
  tl: {
    Financial: "Pananalapi",
    Family: "Pamilya",
    Health: "Kalusugan",
    Personal: "Personal",
    Work: "Trabaho",
    Other: "Iba pa",
  },
  ceb: {
    Financial: "Pinansyal",
    Family: "Pamilya",
    Health: "Panglawas",
    Personal: "Personal",
    Work: "Trabaho",
    Other: "Uban pa",
  },
  ilo: {
    Financial: "Pinansyal",
    Family: "Pamilia",
    Health: "Salun-at",
    Personal: "Personal",
    Work: "Trabaho",
    Other: "Dadduma pay",
  },
  hil: {
    Financial: "Pinansyal",
    Family: "Pamilya",
    Health: "Panglawas",
    Personal: "Personal",
    Work: "Ubra",
    Other: "Iban pa",
  },
  war: {
    Financial: "Pinansyal",
    Family: "Pamilya",
    Health: "Panglawas",
    Personal: "Personal",
    Work: "Trabaho",
    Other: "Iba pa",
  },
  pam: {
    Financial: "Pinansyal",
    Family: "Pamilya",
    Health: "Kalusugan",
    Personal: "Personal",
    Work: "Obra",
    Other: "Aliwa pa",
  },
  bcl: {
    Financial: "Pinansyal",
    Family: "Pamilya",
    Health: "Salud",
    Personal: "Personal",
    Work: "Trabaho",
    Other: "Iba pa",
  },
  es: {
    Financial: "Finanzas",
    Family: "Familia",
    Health: "Salud",
    Personal: "Personal",
    Work: "Trabajo",
    Other: "Otro",
  },
};

const SUPPORT_LABELS: Record<LanguageCode, Record<SupportType, string>> = {
  en: {
    "A prayer would be nice": "A prayer would be nice",
    "Just sharing": "Just sharing",
    "Both prayer and encouragement": "Both prayer and encouragement",
  },
  tl: {
    "A prayer would be nice": "Masaya ako sa panalangin",
    "Just sharing": "Nagbabahagi lang",
    "Both prayer and encouragement": "Panalangin at pagpapatibay ng loob",
  },
  ceb: {
    "A prayer would be nice": "Maayo unta og naay pag-ampo",
    "Just sharing": "Nagpaambit lang",
    "Both prayer and encouragement": "Pag-ampo ug pagdasig",
  },
  ilo: {
    "A prayer would be nice": "Nasayaat ti kararag",
    "Just sharing": "Agibagak laeng",
    "Both prayer and encouragement": "Kararag ken pammabileg",
  },
  hil: {
    "A prayer would be nice": "Mayo ang isa ka pangamuyo",
    "Just sharing": "Nagapaambit lang",
    "Both prayer and encouragement": "Pangamuyo kag pagdasig",
  },
  war: {
    "A prayer would be nice": "Maopay an pag-ampo",
    "Just sharing": "Nagpapasumat la",
    "Both prayer and encouragement": "Pag-ampo ngan pagdasig",
  },
  pam: {
    "A prayer would be nice": "Masanting ing panalangin",
    "Just sharing": "Mikweku lang",
    "Both prayer and encouragement": "Panalangin ampong pamagpalakas lub",
  },
  bcl: {
    "A prayer would be nice": "Magayon an pag-ampo",
    "Just sharing": "Nagpapahiling lang",
    "Both prayer and encouragement": "Pag-ampo asin pagdasig",
  },
  es: {
    "A prayer would be nice": "Una oracion seria buena",
    "Just sharing": "Solo comparto",
    "Both prayer and encouragement": "Oracion y animo",
  },
};

const EMOTION_LABELS: Record<LanguageCode, Record<Emotion, string>> = {
  en: {
    grateful: "🙏 Grateful",
    struggling: "💙 Struggling",
  },
  tl: {
    grateful: "🙏 Mapagpasalamat",
    struggling: "💙 Nahihirapan",
  },
  ceb: {
    grateful: "🙏 Mapasalamaton",
    struggling: "💙 Nalisdan",
  },
  ilo: {
    grateful: "🙏 Agyaman",
    struggling: "💙 Nakarikna iti rigat",
  },
  hil: {
    grateful: "🙏 Mapasalamaton",
    struggling: "💙 Nagapangabudlay",
  },
  war: {
    grateful: "🙏 Mapasalamaton",
    struggling: "💙 Nakukurian",
  },
  pam: {
    grateful: "🙏 Mapasalamat",
    struggling: "💙 Makasakit lub",
  },
  bcl: {
    grateful: "🙏 Mapasalamaton",
    struggling: "💙 Nahihirapan",
  },
  es: {
    grateful: "🙏 Agradecido",
    struggling: "💙 Luchando",
  },
};

const EN_UI_COPY: UiCopy = {
  feed: {
    tagline: "Anonymous sharing & prayer",
    share: "+ Share",
    allEmotion: "All",
    allTopics: "All Topics",
    noPostsTitle: "No posts match these filters",
    noPostsBody:
      "Try switching to another topic or emotion to keep the community in view.",
    viewFeed: "View Feed",
    shareAgain: "Share Again",
    successTitle: "Your message has been shared",
    successBody: "Thank you for trusting this community. You are not alone.",
    restartTitle: "Something went off flow",
    restartBody: "Restart the sharing journey to continue.",
    restart: "Start over",
    cooldown: (waitTime: number) =>
      `Take a breath. GraceFul is a quiet space. You can share again in ${waitTime} seconds.`,
  },
  emotionStep: {
    title: "How are you today?",
    description: "Share anonymously. No account needed. You are safe here.",
    gratefulTitle: "I'm grateful for something",
    gratefulBody: "Share what's bringing you joy or peace",
    strugglingTitle: "I'm struggling with something",
    strugglingBody: "Share what's weighing on your heart",
  },
  categoryStep: {
    title: "What area of life is this about?",
    description: "Choose the category that fits best.",
    note:
      "GraceFul is a place to share, pray, and encourage, but it is not a substitute for real community. Please stay connected to a local Connect Group, Ministry, or trusted person in your life.",
    back: "Back",
  },
  messageStep: {
    title: "Share what's on your heart",
    description: "Write freely. Your identity will never be shown.",
    gratefulIntro: "I am grateful for",
    strugglingIntro: "I am struggling with",
    previewSuffix: "your words will appear here...",
    gratefulPlaceholder: "Tell us more about what you're grateful for...",
    strugglingPlaceholder: "Tell us more about what you're going through...",
    goodLength: "Good length",
    atLeast: (min: number, remaining: number) =>
      `At least ${min} characters needed (${remaining} more)`,
    tooBrief:
      "Your message is a little brief. Please share a bit more so others can pray for you meaningfully.",
    back: "Back",
    continue: "Continue",
  },
  supportStep: {
    title: "What kind of support would you like?",
    description: "Let the community know how they can support you.",
    back: "Back",
  },
  translateStep: {
    title: "Would you like to allow viewers to translate your post?",
    description:
      "If someone has set their language, your post will appear in theirs while your original stays available.",
    yesTitle: "Yes, allow translation",
    yesBody:
      "Viewers can read it in their language while your original stays available",
    noTitle: "No, keep my words only",
    noBody: "Your words stay exactly as written",
    back: "Back",
  },
  reviewStep: {
    title: "Review your message",
    description: "Take one last look before sharing with the community.",
    initialFeedback: "Guardian is reviewing your message.",
    fallbackFeedback:
      "Guardian could not finish analysis, so the original draft is shown.",
    reviewing: "Reviewing your message...",
    back: "Back",
    share: "Share Anonymously",
    checking: "Checking intent...",
  },
  postCard: {
    pray: "Pray for this",
    original: "Original",
    translated: "Showing in",
    communityPrayer: "Community prayer",
  },
  prayerModal: {
    title: "Write a Prayer",
    prompt: "Your sincere prayer:",
    placeholder: "Lord, I lift up this person and pray...",
    helper:
      "Take a moment and write a sincere prayer. It will be shared with the community to encourage the person who posted. GraceFul keeps prayers respectful, private, and genuine.",
    submit: "Submit Prayer",
    confirmClose: "Are you sure you want to let go of this prayer?",
    warningDefault:
      "Guardian blocked this prayer. Please review and rephrase before continuing.",
    warningCrisis:
      "We detect you may be in distress. Your safety matters. Please reach out to NCMH (1553) or Hopeline (0917-558-4673) if you need support. Prayers are meant to lift others, not express your own crisis.",
    warningProfanity:
      "Guardian detected offensive language. Prayers are most powerful when shared with respect and kindness. Please rephrase without profanity.",
    warningMalice:
      "Guardian detected harmful intent toward someone. Prayers should come from a place of compassion, not wishing ill. Please rewrite with genuine care for this person.",
    warningPii:
      "Guardian found personal details (phone, email, name, or location). Remove these to protect privacy before submitting your prayer.",
  },
  prayerList: {
    empty: "No prayers have been shared yet.",
    original: "Original",
  },
  guardianWarning: {
    piiTitle: "Protecting your peace",
    piiMessage:
      "The Guardian noticed personal details, like a full name, phone number, email, or social handle, in your message. To keep you anonymous and safe, please remove those details before posting.",
    maliceTitle: "Let's keep it GraceFul",
    maliceMessage:
      "GraceFul is a space for healing and peace. Some words in your message do not align with the tone we protect here. Please try rephrasing it with kindness.",
    profanityTitle: "Mind the language",
    profanityMessage:
      "Guardian detected offensive language in your message. Please rephrase it respectfully before sharing with the community.",
    edit: "Edit my message",
    retry: "Try again",
  },
  crisis: {
    title: "You are not alone.",
    body:
      "It sounds like you're carrying something very heavy. GraceFul cares about you, and we want to make sure you get real, immediate support.",
    primary: "Primary Hotline (PH)",
    alternative: "Alternative Support",
    dial: "Dial",
    back: "Go back to my message",
  },
};

const TL_UI_COPY: UiCopy = {
  feed: {
    tagline: "Anonymous na pagbabahagi at panalangin",
    share: "+ Magbahagi",
    allEmotion: "Lahat",
    allTopics: "Lahat ng Paksa",
    noPostsTitle: "Walang tugmang post sa mga filter na ito",
    noPostsBody:
      "Subukang palitan ang paksa o damdamin para makita pa rin ang komunidad.",
    viewFeed: "Tingnan ang Feed",
    shareAgain: "Magbahagi Muli",
    successTitle: "Naibahagi na ang iyong mensahe",
    successBody:
      "Salamat sa pagtitiwala sa komunidad na ito. Hindi ka nag-iisa.",
    restartTitle: "May nalihis sa daloy",
    restartBody: "Simulan muli ang pagbabahagi para magpatuloy.",
    restart: "Magsimula muli",
    cooldown: (waitTime: number) =>
      `Huminga muna. Tahimik na espasyo ang GraceFul. Maaari kang magbahagi muli pagkalipas ng ${waitTime} segundo.`,
  },
  emotionStep: {
    title: "Kumusta ka ngayon?",
    description:
      "Magbahagi nang anonymous. Walang account na kailangan. Ligtas ka rito.",
    gratefulTitle: "May ipinagpapasalamat ako",
    gratefulBody: "Ibahagi kung ano ang nagbibigay sa iyo ng saya o payapa",
    strugglingTitle: "May pinagdaraanan ako",
    strugglingBody: "Ibahagi kung ano ang nagpapabigat sa iyong puso",
  },
  categoryStep: {
    title: "Anong bahagi ng buhay ito tungkol?",
    description: "Piliin ang pinakaangkop na kategorya.",
    note:
      "Ang GraceFul ay lugar para magbahagi, manalangin, at magpalakas ng loob, pero hindi kapalit ng totoong komunidad. Manatiling konektado sa local Connect Group, Ministry, o mapagkakatiwalaang tao sa iyong buhay.",
    back: "Bumalik",
  },
  messageStep: {
    title: "Ibahagi ang laman ng iyong puso",
    description:
      "Malaya kang magsulat. Hindi kailanman ipapakita ang iyong pagkakakilanlan.",
    gratefulIntro: "Nagpapasalamat ako para sa",
    strugglingIntro: "Nahihirapan ako sa",
    previewSuffix: "dito lilitaw ang iyong mga salita...",
    gratefulPlaceholder: "Ikuwento pa kung ano ang ipinagpapasalamat mo...",
    strugglingPlaceholder: "Ikuwento pa ang pinagdaraanan mo...",
    goodLength: "Maayos ang haba",
    atLeast: (min: number, remaining: number) =>
      `Kailangan ng hindi bababa sa ${min} character (${remaining} pa)`,
    tooBrief:
      "Medyo maikli pa ang iyong mensahe. Magbahagi pa nang kaunti para mas makahulugan ang panalangin ng iba para sa iyo.",
    back: "Bumalik",
    continue: "Magpatuloy",
  },
  supportStep: {
    title: "Anong uri ng suporta ang gusto mo?",
    description: "Ipaalam sa komunidad kung paano ka nila masusuportahan.",
    back: "Bumalik",
  },
  translateStep: {
    title: "Papayagan mo bang isalin ng mga tumitingin ang post mo?",
    description:
      "Kung may napili silang wika, lalabas ang post mo sa wika nila habang nananatiling available ang orihinal mo.",
    yesTitle: "Oo, payagan ang pagsasalin",
    yesBody:
      "Mababasa nila ito sa kanilang wika habang available pa rin ang iyong orihinal",
    noTitle: "Hindi, panatilihin lang ang aking mga salita",
    noBody: "Mananatili ang eksaktong pagkakasulat mo",
    back: "Bumalik",
  },
  reviewStep: {
    title: "Suriin ang iyong mensahe",
    description: "Silipin ito nang huli bago ibahagi sa komunidad.",
    initialFeedback: "Sinusuri ng Guardian ang iyong mensahe.",
    fallbackFeedback:
      "Hindi natapos ng Guardian ang pagsusuri kaya ipinapakita ang orihinal na draft.",
    reviewing: "Sinusuri ang iyong mensahe...",
    back: "Bumalik",
    share: "Magbahagi nang Anonymous",
    checking: "Sinusuri ang intensyon...",
  },
  postCard: {
    pray: "Ipanalangin ito",
    original: "Orihinal",
    translated: "Ipinapakita sa",
    communityPrayer: "Panalangin ng komunidad",
  },
  prayerModal: {
    title: "Sumulat ng Panalangin",
    prompt: "Iyong taos-pusong panalangin:",
    placeholder: "Panginoon, itinataas ko ang taong ito at idinadalangin ko...",
    helper:
      "Maglaan ng sandali at sumulat ng taos-pusong panalangin. Ibabahagi ito sa komunidad para palakasin ang loob ng taong nag-post. Pinananatili ng GraceFul na magalang, pribado, at tapat ang mga panalangin.",
    submit: "Isumite ang Panalangin",
    confirmClose: "Sigurado ka bang bibitawan mo ang panalanging ito?",
    warningDefault:
      "Hinarang ng Guardian ang panalanging ito. Pakisuri at baguhin muna bago magpatuloy.",
    warningCrisis:
      "Mukhang ikaw ay nasa mabigat na pinagdaraanan. Mahalaga ang iyong kaligtasan. Mangyaring makipag-ugnayan sa NCMH (1553) o Hopeline (0917-558-4673) kung kailangan mo ng suporta. Ang mga panalangin dito ay para magpalakas ng iba, hindi para ipahayag ang sarili mong krisis.",
    warningProfanity:
      "Nakakita ang Guardian ng hindi angkop na pananalita. Mas makapangyarihan ang panalangin kung may paggalang at kabutihan. Pakibago ito nang walang pagmumura.",
    warningMalice:
      "Nakakita ang Guardian ng mapanakit na intensyon laban sa iba. Ang panalangin ay dapat magmula sa habag, hindi sa paghiling ng masama. Pakisulat itong muli nang may tunay na malasakit.",
    warningPii:
      "Nakakita ang Guardian ng personal na detalye (telepono, email, pangalan, o lokasyon). Alisin ang mga ito para maprotektahan ang privacy bago isumite ang panalangin.",
  },
  prayerList: {
    empty: "Wala pang naibabahaging mga panalangin.",
    original: "Orihinal",
  },
  guardianWarning: {
    piiTitle: "Pinoprotektahan ang iyong kapayapaan",
    piiMessage:
      "May napansin ang Guardian na personal na detalye, gaya ng buong pangalan, numero ng telepono, email, o social handle, sa iyong mensahe. Para manatili kang anonymous at ligtas, pakialis ang mga detalyeng ito bago mag-post.",
    maliceTitle: "Panatilihin nating GraceFul",
    maliceMessage:
      "Ang GraceFul ay lugar para sa paghilom at kapayapaan. May ilang salita sa iyong mensahe na hindi tugma sa tonong pinangangalagaan natin dito. Pakisubukang isulat muli ito nang may kabutihan.",
    profanityTitle: "Bantayan ang pananalita",
    profanityMessage:
      "Nakakita ang Guardian ng nakakasakit na pananalita sa iyong mensahe. Pakisulat itong muli nang may paggalang bago ibahagi sa komunidad.",
    edit: "I-edit ang mensahe ko",
    retry: "Subukan muli",
  },
  crisis: {
    title: "Hindi ka nag-iisa.",
    body:
      "Mukhang may mabigat kang dinadala. Nagmamalasakit sa iyo ang GraceFul, at gusto naming matiyak na makakakuha ka ng totoong agarang suporta.",
    primary: "Pangunahing Hotline (PH)",
    alternative: "Alternatibong Suporta",
    dial: "I-dial",
    back: "Bumalik sa mensahe ko",
  },
};

const CEB_UI_COPY: UiCopy = {
  feed: {
    tagline: "Anonymous nga pagpaambit ug pag-ampo",
    share: "+ Moambit",
    allEmotion: "Tanan",
    allTopics: "Tanang Hilisgutan",
    noPostsTitle: "Walay post nga mohaom niini nga mga filter",
    noPostsBody:
      "Sulayi og balhin sa laing topiko o pagbati aron makita gihapon ang komunidad.",
    viewFeed: "Tan-awa ang Feed",
    shareAgain: "Moambit Pag-usab",
    successTitle: "Naambit na ang imong mensahe",
    successBody: "Salamat sa pagsalig niini nga komunidad. Dili ka nag-inusara.",
    restartTitle: "Naay nasayop sa daloy",
    restartBody: "Sugdi pag-usab ang pagpaambit aron mopadayon.",
    restart: "Sugdi pag-usab",
    cooldown: (waitTime: number) =>
      `Pahuway sa makadiyot. Hilom nga luna ang GraceFul. Makapaambit ka pag-usab human sa ${waitTime} ka segundo.`,
  },
  emotionStep: {
    title: "Kumusta ka karon?",
    description:
      "Moambit nga anonymous. Walay account nga gikinahanglan. Luwas ka diri.",
    gratefulTitle: "Aduna koy gipasalamatan",
    gratefulBody: "Ipaambit ang naghatag nimo og kalipay o kalinaw",
    strugglingTitle: "Aduna koy ginaagian",
    strugglingBody: "Ipaambit ang gibug-aton sa imong kasingkasing",
  },
  categoryStep: {
    title: "Unsang bahin sa kinabuhi kini?",
    description: "Pilia ang kategoriya nga pinakabagay.",
    note:
      "Ang GraceFul usa ka lugar sa pagpaambit, pag-ampo, ug pagdasig, apan dili kini puli sa tinuod nga komunidad. Pabiling konektado sa lokal nga Connect Group, Ministry, o kasaligan nga tawo sa imong kinabuhi.",
    back: "Balik",
  },
  messageStep: {
    title: "Ipaambit ang sulod sa imong kasingkasing",
    description:
      "Pagsulat nga gawasnon. Dili gayud ipakita ang imong pagkaila.",
    gratefulIntro: "Mapasalamaton ko alang sa",
    strugglingIntro: "Nalisdan ko sa",
    previewSuffix: "ang imong mga pulong makita dinhi...",
    gratefulPlaceholder: "Isulti pa unsa ang imong gipasalamatan...",
    strugglingPlaceholder: "Isulti pa unsa ang imong ginaagian...",
    goodLength: "Sakto ang gidaghanon",
    atLeast: (min: number, remaining: number) =>
      `Kinahanglan ug labing menos ${min} ka karakter (${remaining} pa)`,
    tooBrief:
      "Mubo pa ang imong mensahe. Palihug dugangi pa gamay aron makahuluganon ang pag-ampo sa uban para nimo.",
    back: "Balik",
    continue: "Padayon",
  },
  supportStep: {
    title: "Unsang klase nga suporta ang gusto nimo?",
    description: "Ipahibalo sa komunidad unsaon ka nila pagsuporta.",
    back: "Balik",
  },
  translateStep: {
    title: "Tugotan ba nimo ang mga motan-aw nga mohubad sa imong post?",
    description:
      "Kung naa silay napiling pinulongan, makita nila ang imong post sa ilang pinulongan samtang anaa gihapon ang orihinal.",
    yesTitle: "Oo, tugoti ang hubad",
    yesBody:
      "Mabasa nila kini sa ilang pinulongan samtang anaa gihapon ang imong orihinal",
    noTitle: "Dili, akoa rang mga pulong",
    noBody: "Magpabilin sama sa imong gisulat ang imong mga pulong",
    back: "Balik",
  },
  reviewStep: {
    title: "Susihon ang imong mensahe",
    description: "Tan-awa pag-usab sa dili pa ipaambit sa komunidad.",
    initialFeedback: "Gisusi sa Guardian ang imong mensahe.",
    fallbackFeedback:
      "Wala mahuman sa Guardian ang pagsusi mao nga gipakita ang orihinal nga draft.",
    reviewing: "Gisusi ang imong mensahe...",
    back: "Balik",
    share: "Moambit nga Anonymous",
    checking: "Gisusi ang tinguha...",
  },
  postCard: {
    pray: "Iampo kini",
    original: "Orihinal",
    translated: "Gipakita sa",
    communityPrayer: "Pag-ampo sa komunidad",
  },
  prayerModal: {
    title: "Pagsulat og Pag-ampo",
    prompt: "Imong kinasingkasing nga pag-ampo:",
    placeholder: "Ginoo, ginaampo ko kining tawhana ug ako nagaampo...",
    helper:
      "Paghatag og gutlo ug isulat ang tinuod nga pag-ampo. Ipakigbahin kini sa komunidad aron madasig ang tawo nga nag-post. Gipabilin sa GraceFul nga matinahuron, pribado, ug tinuod ang mga pag-ampo.",
    submit: "Isumite ang Pag-ampo",
    confirmClose: "Sigurado ba ka nga biyaan nimo kining pag-ampo?",
    warningDefault:
      "Gibabagan sa Guardian kining pag-ampo. Palihug susiha ug usba una sa pagpadayon.",
    warningCrisis:
      "Murag naa ka sa bug-at nga kahimtang. Importante ang imong kaluwasan. Palihug kontaka ang NCMH (1553) o Hopeline (0917-558-4673) kung kinahanglan nimo og suporta. Ang mga pag-ampo dinhi para sa pagpalig-on sa uban, dili para ipadayag ang imong kaugalingong krisis.",
    warningProfanity:
      "Nakamatikod ang Guardian og dili angay nga mga pulong. Mas kusgan ang pag-ampo kung adunay pagtahod ug kaayo. Palihug usba kini nga walay pamalikas.",
    warningMalice:
      "Nakamatikod ang Guardian og dautang tinguha batok sa laing tawo. Ang pag-ampo dapat gikan sa kalooy, dili sa paghandum og dautan. Palihug isulat kini pag-usab uban sa tinuod nga pag-atiman.",
    warningPii:
      "Nakamatikod ang Guardian og personal nga detalye (telepono, email, ngalan, o lokasyon). Tangtanga kini aron maprotektahan ang privacy sa dili pa isumite ang imong pag-ampo.",
  },
  prayerList: {
    empty: "Wala pay naambit nga mga pag-ampo.",
    original: "Orihinal",
  },
  guardianWarning: {
    piiTitle: "Pagpanalipod sa imong kalinaw",
    piiMessage:
      "Namatikdan sa Guardian ang personal nga detalye sama sa tibuok nga ngalan, numero sa telepono, email, o social handle sa imong mensahe. Aron magpabilin kang anonymous ug luwas, palihug tangtanga kini sa dili pa mag-post.",
    maliceTitle: "Padayon ta nga GraceFul",
    maliceMessage:
      "Ang GraceFul usa ka luna alang sa kaayohan ug kalinaw. Adunay mga pulong sa imong mensahe nga dili mohaom sa atong gipanalipdan nga tono dinhi. Palihug sulayi og usab sa mas malinawon nga paagi.",
    profanityTitle: "Bantayi ang pinulongan",
    profanityMessage:
      "Nakamatikod ang Guardian og mapintas nga pinulongan sa imong mensahe. Palihug usba kini nga may pagtahod sa dili pa ipaambit sa komunidad.",
    edit: "Usba ang akong mensahe",
    retry: "Sulayi pag-usab",
  },
  crisis: {
    title: "Dili ka nag-inusara.",
    body:
      "Murag bug-at kaayo ang imong gidala. Naga-atiman ang GraceFul nimo, ug gusto namo masiguro nga makadawat ka og tinuod ug dayon nga suporta.",
    primary: "Pangunang Hotline (PH)",
    alternative: "Alternatibong Suporta",
    dial: "Tawagi",
    back: "Balik sa akong mensahe",
  },
};

const UI_COPY: Partial<Record<LanguageCode, UiCopy>> = {
  en: EN_UI_COPY,
  tl: TL_UI_COPY,
  ceb: CEB_UI_COPY,
};

export function getLanguageLabel(language: LanguageCode) {
  return LANGUAGE_LABELS[language];
}

export function getUiCopy(language: LanguageCode) {
  return UI_COPY[language] ?? EN_UI_COPY;
}

export function localizeCategory(category: Category, language: LanguageCode) {
  return CATEGORY_LABELS[language][category];
}

export function localizeSupportType(
  supportType: SupportType,
  language: LanguageCode,
) {
  return SUPPORT_LABELS[language][supportType];
}

export function localizeEmotion(emotion: Emotion, language: LanguageCode) {
  return EMOTION_LABELS[language][emotion];
}

export function getPrayerCountLabel(count: number, language: LanguageCode) {
  if (language === "tl") {
    return `${count} ${count === 1 ? "panalangin" : "mga panalangin"}`;
  }

  if (language === "ceb") {
    return `${count} ${count === 1 ? "pag-ampo" : "mga pag-ampo"}`;
  }

  if (language === "ilo") {
    return `${count} ${count === 1 ? "kararag" : "dagiti kararag"}`;
  }

  if (language === "hil") {
    return `${count} ${count === 1 ? "pangamuyo" : "mga pangamuyo"}`;
  }

  if (language === "war") {
    return `${count} ${count === 1 ? "pag-ampo" : "mga pag-ampo"}`;
  }

  if (language === "pam") {
    return `${count} ${count === 1 ? "panalangin" : "malawe pang panalangin"}`;
  }

  if (language === "bcl") {
    return `${count} ${count === 1 ? "pag-ampo" : "mga pag-ampo"}`;
  }

  if (language === "es") {
    return `${count} ${count === 1 ? "oracion" : "oraciones"}`;
  }

  return `${count} ${count === 1 ? "prayer" : "prayers"}`;
}

export function getViewPrayerLabel(count: number, language: LanguageCode) {
  if (language === "tl") {
    return `Tingnan ang panalangin (${count})`;
  }

  if (language === "ceb") {
    return `Tan-awa ang pag-ampo (${count})`;
  }

  if (language === "ilo") {
    return `Kitaen ti kararag (${count})`;
  }

  if (language === "hil") {
    return `Tan-awa ang pangamuyo (${count})`;
  }

  if (language === "war") {
    return `Kitaa an pag-ampo (${count})`;
  }

  if (language === "pam") {
    return `Ikit ya ing panalangin (${count})`;
  }

  if (language === "bcl") {
    return `Hilingon an pag-ampo (${count})`;
  }

  if (language === "es") {
    return `Ver oracion (${count})`;
  }

  return `View prayer (${count})`;
}

export function generateTranslations(message: string): TranslationMap {
  return Object.fromEntries(
    TRANSLATABLE_LANGUAGES.map((language) => [
      language,
      localizeMessage(message, language),
    ]),
  ) as TranslationMap;
}

export function getTranslatedMessage(
  originalMessage: string,
  translations: TranslationMap,
  targetLanguage: LanguageCode,
) {
  if (targetLanguage === "en") {
    return originalMessage;
  }

  return (
    translations[targetLanguage] ??
    localizeMessage(originalMessage, targetLanguage)
  );
}

export function localizeGuardianFeedback(
  feedback: string,
  language: LanguageCode,
) {
  if (language === "en") {
    return feedback;
  }

  if (language !== "tl" && language !== "ceb") {
    return feedback;
  }

  if (
    feedback ===
    "🆘 Crisis detected. Your safety matters. Redirecting to National Center for Mental Health (1553) and Hopeline support."
  ) {
    return language === "tl"
      ? "🆘 May natukoy na krisis. Mahalaga ang iyong kaligtasan. Inililipat ka sa suporta ng National Center for Mental Health (1553) at Hopeline."
      : "🆘 Nakit-an ang krisis. Importante ang imong kaluwasan. Gidirekta ka sa National Center for Mental Health (1553) ug Hopeline nga suporta.";
  }

  if (
    feedback ===
    "⚠️ Guardian Warning: Offensive language detected. Please rephrase with kindness and respect."
  ) {
    return language === "tl"
      ? "⚠️ Babala ng Guardian: May natukoy na nakakasakit na pananalita. Pakisulat itong muli nang may kabutihan at paggalang."
      : "⚠️ Pahimangno sa Guardian: Nakamatikod og mapintas nga pinulongan. Palihug usba kini nga adunay kaayo ug pagtahod.";
  }

  if (
    feedback ===
    "⚠️ Guardian Warning: Harmful intent detected (wishing ill on someone). Please share your heart without malice."
  ) {
    return language === "tl"
      ? "⚠️ Babala ng Guardian: May natukoy na mapanakit na intensyon. Pakibahagi ang iyong puso nang walang masamang hangarin."
      : "⚠️ Pahimangno sa Guardian: Nakamatikod og makadaot nga tinguha. Palihug ipaambit ang imong kasingkasing nga walay pagdumot.";
  }

  if (feedback === "📱 Phone number removed for privacy.") {
    return language === "tl"
      ? "📱 Inalis ang numero ng telepono para sa privacy."
      : "📱 Gikuha ang numero sa telepono alang sa privacy.";
  }

  if (feedback === "📧 Email address removed for privacy.") {
    return language === "tl"
      ? "📧 Inalis ang email address para sa privacy."
      : "📧 Gikuha ang email address alang sa privacy.";
  }

  if (feedback === "👥 Social media handle removed for privacy.") {
    return language === "tl"
      ? "👥 Inalis ang social media handle para sa privacy."
      : "👥 Gikuha ang social media handle alang sa privacy.";
  }

  if (feedback === "🪪 Full name removed for anonymity.") {
    return language === "tl"
      ? "🪪 Inalis ang buong pangalan para mapanatili ang anonymity."
      : "🪪 Gikuha ang tibuok ngalan aron mapadayon ang anonymity.";
  }

  if (feedback === "📍 Specific location removed for safety.") {
    return language === "tl"
      ? "📍 Inalis ang tiyak na lokasyon para sa kaligtasan."
      : "📍 Gikuha ang piho nga lokasyon alang sa kaluwasan.";
  }

  if (
    feedback ===
    "⚠️ Guardian Warning: Harmful language detected. Please soften your words before sharing."
  ) {
    return language === "tl"
      ? "⚠️ Babala ng Guardian: May natukoy na mapanakit na pananalita. Pakihinahon ang iyong mga salita bago ibahagi."
      : "⚠️ Pahimangno sa Guardian: Nakamatikod og makadaot nga pinulongan. Palihug himoa nga mas malinawon ang imong mga pulong sa dili pa ipaambit.";
  }

  if (feedback === "✓ Looks good! Ready to share.") {
    return language === "tl"
      ? "✓ Maayos na ito. Handa nang ibahagi."
      : "✓ Maayo na kini. Andam na ipaambit.";
  }

  if (feedback.startsWith("✨ Guardian generalized sensitive details:")) {
    const details = feedback.replace(
      "✨ Guardian generalized sensitive details:",
      "",
    ).trim();

    return language === "tl"
      ? `✨ Pinalawak ng Guardian ang sensitibong detalye: ${details}`
      : `✨ Gi-generalize sa Guardian ang sensitibong detalye: ${details}`;
  }

  return feedback;
}

function localizeMessage(
  message: string,
  targetLanguage: Exclude<LanguageCode, "en">,
) {
  let translated = normalizeSpacing(message);

  for (const [pattern, replacement] of LANGUAGE_REPLACEMENTS[targetLanguage]) {
    translated = translated.replace(pattern, replacement);
  }

  return `${TRANSLATION_PREFIXES[targetLanguage]}${translated}`;
}

function normalizeSpacing(message: string) {
  return message.replace(/\s+/g, " ").trim();
}
