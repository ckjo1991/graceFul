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
    myPosts: string;
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
    warningSpam: string;
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
    spamTitle: string;
    spamMessage: string;
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
  "hil",
  "es",
];

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  tl: "Tagalog",
  ceb: "Bisaya",
  hil: "Hiligaynon",
  es: "Spanish",
};

type TranslationScenarioId =
  | "gratefulFamily"
  | "gratefulRecovery"
  | "gratefulFinancial"
  | "strugglingFinancial"
  | "strugglingWork"
  | "strugglingHealth"
  | "strugglingPersonal"
  | "strugglingRelationships"
  | "prayerRequest"
  | "hopefulExpression";

type TranslationScenario = {
  id: TranslationScenarioId;
  source: string;
  anchors: string[];
  keywords: string[];
  minScore: number;
};

type LanguageReferenceLibrary = Record<TranslationScenarioId, string>;

const TRANSLATION_SCENARIOS: TranslationScenario[] = [
  {
    id: "gratefulFamily",
    source:
      "I am grateful for the peace in our home and for the way God is caring for my family.",
    anchors: [
      "peace in our home",
      "our home",
      "our family",
      "my family",
      "family",
      "home",
    ],
    keywords: ["grateful", "thankful", "family", "home", "peace", "caring"],
    minScore: 7,
  },
  {
    id: "gratefulRecovery",
    source:
      "I am so grateful for my mother's recovery. The past few months have been hard, but she is getting stronger now.",
    anchors: [
      "mothers recovery",
      "my mother",
      "my mom",
      "recover",
      "recovery",
      "healing",
      "test results",
      "tests",
    ],
    keywords: ["grateful", "thankful", "mother", "mom", "recovery", "healing"],
    minScore: 7,
  },
  {
    id: "gratefulFinancial",
    source:
      "God provided for us right on time. I am thankful and still asking for wisdom as we steward what has been placed in our hands.",
    anchors: [
      "provided for us",
      "right on time",
      "provision",
      "entrusted",
      "placed in our hands",
      "financial",
      "money",
    ],
    keywords: ["grateful", "thankful", "wisdom", "provide", "provided", "need"],
    minScore: 7,
  },
  {
    id: "strugglingFinancial",
    source:
      "We are going through a hard season financially. I am trying to stay hopeful, but some days feel very heavy.",
    anchors: [
      "financially",
      "financial",
      "bills",
      "rent",
      "debt",
      "hard season",
      "stay hopeful",
    ],
    keywords: ["hard", "heavy", "money", "hopeful", "struggling", "provide"],
    minScore: 7,
  },
  {
    id: "strugglingWork",
    source:
      "Work has been heavy lately. I feel tired and discouraged, and I need prayer for strength and wisdom.",
    anchors: [
      "work has been heavy",
      "about work",
      "at work",
      "my job",
      "work",
      "job",
      "career",
    ],
    keywords: [
      "tired",
      "discouraged",
      "exhausted",
      "strength",
      "wisdom",
      "endurance",
      "anxiety",
    ],
    minScore: 7,
  },
  {
    id: "strugglingHealth",
    source:
      "I am waiting on test results and trying not to let fear take over. Please pray for peace and strength.",
    anchors: [
      "test results",
      "waiting on",
      "doctor",
      "hospital",
      "healing",
      "recovery",
      "health",
      "tests",
    ],
    keywords: ["fear", "anxious", "peace", "strength", "wait", "results"],
    minScore: 7,
  },
  {
    id: "strugglingPersonal",
    source:
      "I am trying to rebuild my life after a hard season. I am asking God for grace for small and faithful steps.",
    anchors: [
      "rebuild",
      "hard season",
      "small steps",
      "starting again",
      "healthy routines",
      "routines",
      "routine",
    ],
    keywords: ["steadiness", "grace", "healing", "again", "personal", "steps"],
    minScore: 7,
  },
  {
    id: "strugglingRelationships",
    source:
      "There is tension in our relationships right now, and it hurts deeply. Please pray for healing, humility, and peace between us.",
    anchors: [
      "relationship",
      "relationships",
      "marriage",
      "husband",
      "wife",
      "family tension",
      "conflict",
      "between us",
    ],
    keywords: ["hurts", "healing", "humility", "peace", "forgive", "forgiveness"],
    minScore: 7,
  },
  {
    id: "prayerRequest",
    source:
      "Please pray for me. I need God's guidance, peace, and strength for what I am facing.",
    anchors: [
      "please pray",
      "pray for me",
      "keep me in prayer",
      "cover me in prayer",
      "i need prayer",
    ],
    keywords: ["guidance", "peace", "strength", "wisdom", "facing", "prayer"],
    minScore: 7,
  },
  {
    id: "hopefulExpression",
    source:
      "I am still holding on to hope. God has not left me, and I am trusting Him one day at a time.",
    anchors: [
      "holding on to hope",
      "holding on",
      "stay hopeful",
      "still hopeful",
      "one day at a time",
      "trusting him",
      "god has not left me",
      "god hasnt left me",
    ],
    keywords: ["hope", "hopeful", "trust", "trusting", "faith", "faithful"],
    minScore: 7,
  },
];

const TL_REFERENCE_TRANSLATIONS: LanguageReferenceLibrary = {
  gratefulFamily:
    "Nagpapasalamat ako sa kapayapaang ibinibigay ng Diyos sa aming tahanan. Ramdam ko ang Kanyang pag-aalaga sa aming pamilya.",
  gratefulRecovery:
    "Napakalaking biyaya para sa amin na gumagaling na ang nanay ko. Salamat sa Diyos sa Kanyang kabutihan sa aming pamilya.",
  gratefulFinancial:
    "Dumating ang probisyon ng Diyos sa tamang panahon. Taos-puso akong nagpapasalamat at hinihingi ko pa rin ang Kanyang karunungan sa paghawak nito.",
  strugglingFinancial:
    "Mabigat ang pinansyal naming kalagayan ngayon, pero kumakapit pa rin ako sa pag-asa. Pakiusap, isama ninyo kami sa panalangin.",
  strugglingWork:
    "Mabigat ang dinadala ko sa trabaho nitong mga araw. Pagod na ako, pero humihingi pa rin ako ng lakas at karunungan sa Diyos.",
  strugglingHealth:
    "Naghihintay ako ng resulta ng mga pagsusuri at minsan nilalamon ako ng kaba. Pakiusap, ipanalangin ninyo na bigyan ako ng Diyos ng kapayapaan at lakas.",
  strugglingPersonal:
    "Sinusubukan kong buuin muli ang sarili ko pagkatapos ng isang mabigat na yugto. Hinihingi ko sa Diyos ang biyaya para sa maliliit pero tapat na hakbang.",
  strugglingRelationships:
    "May bigat sa relasyon namin ngayon at masakit itong dalhin. Ipanalangin ninyo sana ang paggaling, pagpapakumbaba, at kapayapaan sa pagitan namin.",
  prayerRequest:
    "Pakiusap, isama ninyo ako sa panalangin. Kailangan ko ng gabay, kapayapaan, at lakas mula sa Diyos.",
  hopefulExpression:
    "Hindi ko pa rin binibitawan ang pag-asa. Tapat ang Diyos, at nagtitiwala akong sasamahan Niya ako araw-araw.",
};

const CEB_REFERENCE_TRANSLATIONS: LanguageReferenceLibrary = {
  gratefulFamily:
    "Mapasalamaton ko sa kalinaw nga gihatag sa Diyos sa among panimalay. Klaro gyud ang Iyang pag-atiman sa among pamilya.",
  gratefulRecovery:
    "Dako kaayo akong pasalamat sa pagkaayo sa akong inahan. Salamat sa Diyos kay padayon Niyang gipalig-on ang among pamilya.",
  gratefulFinancial:
    "Miabot ang panalangin sa hustong panahon. Nagpasalamat ko sa Diyos ug nangayo gihapon ko og kaalam sa pagdumala sa gisalig Niya kanamo.",
  strugglingFinancial:
    "Lisod karon ang among kahimtang sa pinansyal, pero nagkupot gihapon ko sa paglaum. Palihug iapil mi ninyo sa pag-ampo.",
  strugglingWork:
    "Bug-at na kaayo ang trabaho karong mga adlawa. Kapoy na ko, pero nangayo gihapon ko sa Diyos og kusog ug kaalam.",
  strugglingHealth:
    "Naghulat ko sa resulta sa akong mga test ug usahay madaog ko sa kahadlok. Palihug iampo nga hatagan ko sa Diyos og kalinaw ug kusog.",
  strugglingPersonal:
    "Naningkamot ko nga motindog pag-usab human sa lisod nga panahon. Nangayo ko sa Diyos og grasya para sa gagmay pero matinud-anong mga lakang.",
  strugglingRelationships:
    "Naay kasakit ug tensiyon sa among relasyon karon. Palihug iampo ang kaayohan, pagpaubos, ug kalinaw sa among taliwala.",
  prayerRequest:
    "Palihug iampo ko ninyo. Kinahanglan ko karon ang giya, kalinaw, ug kusog nga gikan sa Diyos.",
  hopefulExpression:
    "Wala pa ko mobiya sa paglaum. Matinumanon ang Diyos, ug nagsalig ko nga ubanan Niya ko matag adlaw.",
};

const HIL_REFERENCE_TRANSLATIONS: LanguageReferenceLibrary = {
  gratefulFamily:
    "Mapasalamaton ako sa kalinong nga ginhatag sang Diyos sa amon balay. Mabatyagan gid ang Iya nga pag-atipan sa amon pamilya.",
  gratefulRecovery:
    "Daku gid ang akon pagpasalamat sa pag-ayo sang akon iloy. Salamat sa Diyos kay padayon Niya kami nga ginapalig-on bilang pamilya.",
  gratefulFinancial:
    "Nag-abot ang bulig sang Diyos sa husto nga tion. Nagapasalamat gid ako kag nagapangayo man sang kaalam sa pagdumala sang iya ginsalig sa amon.",
  strugglingFinancial:
    "Budlay gid subong ang amon kahimtangan sa pinansyal, pero nagakapit gihapon ako sa paglaum. Palihog updan ninyo kami sa pangamuyo.",
  strugglingWork:
    "Mabug-at ang akon ginadala sa obra subong nga mga inadlaw. Kapoy na ako, pero nagapangayo gihapon ako sang kusog kag kaalam sa Diyos.",
  strugglingHealth:
    "Naghulat ako sang resulta sang akon mga test kag usahay nagadamo ang kahadlok ko. Palihog ipangamuyo nga hatagan ako sang Diyos sang kalinong kag kusog.",
  strugglingPersonal:
    "Ginatinguhaan ko nga magbangon liwat pagkatapos sang mabudlay nga tion. Nagapangayo ako sang grasya sang Diyos para sa gamay pero matutom nga mga tikang.",
  strugglingRelationships:
    "May kasakit kag tensiyon sa amon relasyon subong, kag mabug-at gid ini sa tagipusuon. Palihog ipangamuyo ang pag-ayo, pagpaubos, kag kalinong sa amon.",
  prayerRequest:
    "Palihog, ipangamuyo ninyo ako. Kinahanglan ko subong ang giya, kalinong, kag kusog halin sa Diyos.",
  hopefulExpression:
    "Wala ko ginabayaan ang paglaum. Matutom ang Diyos, kag nagasalig ako nga updan Niya ako adlaw-adlaw.",
};

const ES_REFERENCE_TRANSLATIONS: LanguageReferenceLibrary = {
  gratefulFamily:
    "Estoy agradecido por la paz que Dios ha traido a nuestro hogar. Su cuidado sobre nuestra familia se siente muy real.",
  gratefulRecovery:
    "Estoy profundamente agradecido por la recuperacion de mi madre. Le doy gracias a Dios porque nos ha sostenido como familia.",
  gratefulFinancial:
    "La provision de Dios llego justo a tiempo. Le doy gracias de todo corazon y sigo pidiendo sabiduria para administrar bien lo que recibimos.",
  strugglingFinancial:
    "Estamos pasando por un tiempo dificil en lo economico, pero sigo aferrandome a la esperanza. Por favor, oren por nosotros.",
  strugglingWork:
    "El trabajo ha sido muy pesado estos dias. Me siento cansado, pero sigo pidiendole a Dios fuerzas y sabiduria.",
  strugglingHealth:
    "Estoy esperando los resultados de unos estudios y a veces el miedo me gana. Por favor, oren para que Dios me de paz y fortaleza.",
  strugglingPersonal:
    "He estado tratando de reconstruirme despues de una temporada muy dura. Le pido a Dios gracia para dar pasos pequenos pero firmes.",
  strugglingRelationships:
    "Hay dolor y tension en nuestras relaciones en este momento. Oren, por favor, por sanidad, humildad y paz entre nosotros.",
  prayerRequest:
    "Por favor, oren por mi. Necesito la guia, la paz y la fortaleza que solo Dios puede dar.",
  hopefulExpression:
    "Todavia me aferro a la esperanza. Dios no me ha dejado, y sigo confiando en El dia tras dia.",
};

const REFERENCE_TRANSLATIONS: Record<
  Exclude<LanguageCode, "en">,
  LanguageReferenceLibrary
> = {
  tl: TL_REFERENCE_TRANSLATIONS,
  ceb: CEB_REFERENCE_TRANSLATIONS,
  hil: HIL_REFERENCE_TRANSLATIONS,
  es: ES_REFERENCE_TRANSLATIONS,
};

const MATCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "been",
  "but",
  "for",
  "from",
  "has",
  "have",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "this",
  "to",
  "us",
  "we",
  "with",
]);

const CATEGORY_LABELS: Record<LanguageCode, Record<Category, string>> = {
  en: {
    Financial: "Financial",
    Family: "Family",
    Health: "Health",
    Work: "Work",
    Personal: "Personal",
  },
  tl: {
    Financial: "Pananalapi",
    Family: "Pamilya",
    Health: "Kalusugan",
    Work: "Trabaho",
    Personal: "Personal",
  },
  ceb: {
    Financial: "Pinansyal",
    Family: "Pamilya",
    Health: "Panglawas",
    Work: "Trabaho",
    Personal: "Personal",
  },
  hil: {
    Financial: "Pinansyal",
    Family: "Pamilya",
    Health: "Panglawas",
    Work: "Ubra",
    Personal: "Personal",
  },
  es: {
    Financial: "Finanzas",
    Family: "Familia",
    Health: "Salud",
    Work: "Trabajo",
    Personal: "Personal",
  },
};

const SUPPORT_LABELS: Record<LanguageCode, Record<SupportType, string>> = {
  en: {
    prayer: "A prayer would be nice",
    just_sharing: "Just sharing",
    both: "Both prayer and encouragement",
    encouragement: "Encouragement only",
  },
  tl: {
    prayer: "Masaya ako sa panalangin",
    just_sharing: "Nagbabahagi lang",
    both: "Panalangin at pagpapatibay ng loob",
    encouragement: "Pagpapatibay ng loob lang",
  },
  ceb: {
    prayer: "Maayo unta og naay pag-ampo",
    just_sharing: "Nagpaambit lang",
    both: "Pag-ampo ug pagdasig",
    encouragement: "Pagdasig lang",
  },
  hil: {
    prayer: "Mayo ang isa ka pangamuyo",
    just_sharing: "Nagapaambit lang",
    both: "Pangamuyo kag pagdasig",
    encouragement: "Pagdasig lang",
  },
  es: {
    prayer: "Una oracion seria buena",
    just_sharing: "Solo comparto",
    both: "Oracion y animo",
    encouragement: "Solo animo",
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
  hil: {
    grateful: "🙏 Mapasalamaton",
    struggling: "💙 Nagapangabudlay",
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
    myPosts: "My Posts",
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
    initialFeedback: "We're taking a quiet look at your message.",
    fallbackFeedback:
      "We couldn't finish the review, so your original words are shown.",
    reviewing: "Reviewing your message...",
    back: "Back",
    share: "Share Anonymously",
    checking: "Checking that your message fits this space...",
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
      "This prayer needs a few changes before it can be shared. Please review and rephrase it.",
    warningCrisis:
      "It sounds like you may be going through something very difficult. GraceFul welcomes prayer, but you may also need support beyond this space. If you can, please reach out to NCMH (1553) or Hopeline (0917-558-4673) right now.",
    warningProfanity:
      "GraceFul encourages prayers that feel respectful and caring. Please adjust the language in your prayer before sharing.",
    warningMalice:
      "GraceFul encourages prayers that come from compassion and care. Please rewrite your prayer in a way that seeks good for this person.",
    warningSpam:
      "GraceFul is meant for sincere prayer and encouragement. Please remove promotional or repetitive language before sharing this prayer.",
    warningPii:
      "To keep everyone safe and anonymous, GraceFul does not allow personal contact details or identifying information in prayers. Please remove those details before sharing.",
  },
  prayerList: {
    empty: "No prayers have been shared yet.",
    original: "Original",
  },
  guardianWarning: {
    piiTitle: "Protecting your peace",
    piiMessage:
      "To keep everyone safe and anonymous, GraceFul does not allow personal contact details or identifying information. Please remove those details before posting.",
    maliceTitle: "Let's keep it GraceFul",
    maliceMessage:
      "GraceFul is a space for healing and peace. Some parts of your message may come across as hurtful. Please take a moment to rephrase it with care before sharing.",
    spamTitle: "Keep it sincere",
    spamMessage:
      "GraceFul is a place for sincere prayer and support. Please remove promotional or repetitive language before sharing.",
    profanityTitle: "Let's keep this space respectful",
    profanityMessage:
      "GraceFul is meant to be a respectful and supportive space. Please adjust the language in your message before sharing.",
    edit: "Edit my message",
    retry: "Rephrase my message",
  },
  crisis: {
    title: "You are not alone",
    body:
      "It sounds like you may be going through something very difficult. GraceFul is a place where people can pray with you, but you may also need support beyond this space. If you can, consider reaching out to someone who can help right now.",
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
    myPosts: "Aking Mga Post",
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
    warningSpam:
      "Nakakita ang Guardian ng spam o promo na pananalita. Panatilihing taos-puso ang panalangin at iwasan ang links, ads, o paulit-ulit na sales wording.",
    warningPii:
      "Nakakita ang Guardian ng personal na detalye (telepono, email, pangalan, social handle, o lokasyon tulad ng pangalan ng ospital). Alisin ang mga ito para maprotektahan ang privacy bago isumite ang panalangin.",
  },
  prayerList: {
    empty: "Wala pang naibabahaging mga panalangin.",
    original: "Orihinal",
  },
  guardianWarning: {
    piiTitle: "Pinoprotektahan ang iyong kapayapaan",
    piiMessage:
      "May napansin ang Guardian na personal na detalye, gaya ng buong pangalan, numero ng telepono, email, social handle, o reference sa lokasyon tulad ng pangalan ng ospital, sa iyong mensahe. Para manatili kang anonymous at ligtas, pakialis ang mga detalyeng ito bago mag-post.",
    maliceTitle: "Panatilihin nating GraceFul",
    maliceMessage:
      "Ang GraceFul ay lugar para sa paghilom at kapayapaan. May ilang salita sa iyong mensahe na hindi tugma sa tonong pinangangalagaan natin dito. Pakisubukang isulat muli ito nang may kabutihan.",
    spamTitle: "Panatilihing taos-puso",
    spamMessage:
      "Mukhang promo o spam ang iyong mensahe. Ang GraceFul ay para sa panalangin at suporta, hindi para sa advertising o paulit-ulit na promotions.",
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
    myPosts: "Akong Mga Post",
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
    warningSpam:
      "Nakamatikod ang Guardian og spam o promo nga sinultihan. Himoang sinsero ang imong pag-ampo ug likayi ang links, ads, ug balik-balik nga sales wording.",
    warningPii:
      "Nakamatikod ang Guardian og personal nga detalye (telepono, email, ngalan, social handle, o lokasyon sama sa ngalan sa ospital). Tangtanga kini aron maprotektahan ang privacy sa dili pa isumite ang imong pag-ampo.",
  },
  prayerList: {
    empty: "Wala pay naambit nga mga pag-ampo.",
    original: "Orihinal",
  },
  guardianWarning: {
    piiTitle: "Pagpanalipod sa imong kalinaw",
    piiMessage:
      "Namatikdan sa Guardian ang personal nga detalye sama sa tibuok nga ngalan, numero sa telepono, email, social handle, o reference sa lokasyon sama sa ngalan sa ospital sa imong mensahe. Aron magpabilin kang anonymous ug luwas, palihug tangtanga kini sa dili pa mag-post.",
    maliceTitle: "Padayon ta nga GraceFul",
    maliceMessage:
      "Ang GraceFul usa ka luna alang sa kaayohan ug kalinaw. Adunay mga pulong sa imong mensahe nga dili mohaom sa atong gipanalipdan nga tono dinhi. Palihug sulayi og usab sa mas malinawon nga paagi.",
    spamTitle: "Himoang sinsero",
    spamMessage:
      "Murag promo o spam ang imong mensahe. Ang GraceFul para sa pag-ampo ug suporta, dili para sa advertising o balik-balik nga promotions.",
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

  if (language === "hil") {
    return `${count} ${count === 1 ? "pangamuyo" : "mga pangamuyo"}`;
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

  if (language === "hil") {
    return `Tan-awa ang pangamuyo (${count})`;
  }

  if (language === "es") {
    return `Ver oracion (${count})`;
  }

  return `View ${count === 1 ? "prayer" : "prayers"} (${count})`;
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

export function getDisplayTranslatedMessage(
  originalMessage: string,
  translations: TranslationMap,
  targetLanguage: LanguageCode,
) {
  return getTranslatedMessage(originalMessage, translations, targetLanguage);
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
    "You may be carrying something very heavy. GraceFul can hold a quiet moment with you, but you may also need immediate support beyond this space. Please reach out to National Center for Mental Health (1553) or Hopeline if you can."
  ) {
    return language === "tl"
      ? "🆘 May natukoy na krisis. Mahalaga ang iyong kaligtasan. Inililipat ka sa suporta ng National Center for Mental Health (1553) at Hopeline."
      : "🆘 Nakit-an ang krisis. Importante ang imong kaluwasan. Gidirekta ka sa National Center for Mental Health (1553) ug Hopeline nga suporta.";
  }

  if (
    feedback ===
    "GraceFul is meant to be a respectful and supportive space. Please adjust the language in your message before sharing."
  ) {
    return language === "tl"
      ? "⚠️ Babala ng Guardian: May natukoy na nakakasakit na pananalita. Pakisulat itong muli nang may kabutihan at paggalang."
      : "⚠️ Pahimangno sa Guardian: Nakamatikod og mapintas nga pinulongan. Palihug usba kini nga adunay kaayo ug pagtahod.";
  }

  if (
    feedback ===
    "GraceFul is a space for healing and peace. Some parts of your message may come across as hurtful. Please rephrase it with care before sharing."
  ) {
    return language === "tl"
      ? "⚠️ Babala ng Guardian: May natukoy na mapanakit na intensyon. Pakibahagi ang iyong puso nang walang masamang hangarin."
      : "⚠️ Pahimangno sa Guardian: Nakamatikod og makadaot nga tinguha. Palihug ipaambit ang imong kasingkasing nga walay pagdumot.";
  }

  if (
    feedback ===
    "GraceFul is for sincere prayer and support. Please remove promotional or repetitive language before sharing."
  ) {
    return language === "tl"
      ? "⚠️ Babala ng Guardian: May natukoy na promo o spam na mensahe. Panatilihing taos-puso at nakatuon sa panalangin ang iyong ibabahagi."
      : "⚠️ Pahimangno sa Guardian: Nakamatikod og promo o spam nga mensahe. Palihug himoa kini nga sinsero ug naka-focus sa pag-ampo.";
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
    "This space is meant to stay calm, respectful, and sincere. Please soften or revise your message before sharing."
  ) {
    return language === "tl"
      ? "⚠️ Babala ng Guardian: May natukoy na mapanakit na pananalita. Pakihinahon ang iyong mga salita bago ibahagi."
      : "⚠️ Pahimangno sa Guardian: Nakamatikod og makadaot nga pinulongan. Palihug himoa nga mas malinawon ang imong mga pulong sa dili pa ipaambit.";
  }

  if (feedback === "This looks ready to share.") {
    return language === "tl"
      ? "✓ Maayos na ito. Handa nang ibahagi."
      : "✓ Maayo na kini. Andam na ipaambit.";
  }

  if (feedback.startsWith("We softened a few sensitive details:")) {
    const details = feedback.replace(
      "We softened a few sensitive details:",
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
  const normalizedMessage = normalizeSpacing(message);
  const scenario = findClosestTranslationScenario(normalizedMessage);

  if (!scenario) {
    return normalizedMessage;
  }

  return REFERENCE_TRANSLATIONS[targetLanguage][scenario.id];
}

function normalizeSpacing(message: string) {
  return message.replace(/\s+/g, " ").trim();
}

function findClosestTranslationScenario(message: string) {
  const normalizedMessage = normalizeForMatching(message);
  const messageTokens = tokenizeForMatching(normalizedMessage);

  let bestMatch: TranslationScenario | null = null;
  let bestScore = 0;

  for (const scenario of TRANSLATION_SCENARIOS) {
    const score = scoreTranslationScenario(normalizedMessage, messageTokens, scenario);

    if (score < scenario.minScore) {
      continue;
    }

    if (score > bestScore) {
      bestMatch = scenario;
      bestScore = score;
    }
  }

  return bestMatch;
}

function scoreTranslationScenario(
  normalizedMessage: string,
  messageTokens: Set<string>,
  scenario: TranslationScenario,
) {
  const anchorHits = scenario.anchors.filter((anchor) =>
    normalizedMessage.includes(anchor),
  ).length;
  const keywordHits = scenario.keywords.filter(
    (keyword) =>
      normalizedMessage.includes(keyword) || messageTokens.has(keyword),
  ).length;
  const sourceOverlap = [...tokenizeForMatching(scenario.source)].filter((token) =>
    messageTokens.has(token),
  ).length;

  return anchorHits * 4 + keywordHits * 2 + Math.min(sourceOverlap, 4);
}

function normalizeForMatching(message: string) {
  return normalizeSpacing(message)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function tokenizeForMatching(message: string) {
  return new Set(
    message
      .split(/\s+/)
      .filter((token) => token.length > 1 && !MATCH_STOP_WORDS.has(token)),
  );
}
