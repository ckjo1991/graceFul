import fs from "node:fs";
import test, { describe } from "node:test";
import assert from "node:assert/strict";

import {
  analyzeSpam,
  canPost,
  checkCrisis,
  checkSafety,
  hasViolentIntent,
  runGuardian,
  validateMessageLength,
} from "../lib/guardian";

const SUPPLIED_POST_CASES = [
  {
    id: 1,
    label: "family healing request",
    text:
      "My dad has been going through a difficult time lately and our conversations keep turning into arguments. I still love him and want things to be better between us. If anyone could pray for patience and healing in our family, that would mean a lot.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 2,
    label: "grateful work update",
    text:
      "Today I finally received a job offer after months of applying. I'm grateful and also nervous about starting something new. Thankful for this opportunity.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 3,
    label: "personal discouragement",
    text:
      "Some days I feel like I'm falling behind everyone else in life. I'm trying to stay hopeful but it has been hard lately.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 4,
    label: "financial stress",
    text:
      "Money has been really tight these past few months. I'm doing what I can but it's stressful. I would appreciate prayers for provision and wisdom.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 5,
    label: "health gratitude",
    text:
      "My test results came back better than expected today. I feel relieved and thankful.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 6,
    label: "frustration with self",
    text:
      "I feel really frustrated with myself lately. I'm trying to change some habits but it's harder than I expected.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 7,
    label: "estranged sibling",
    text:
      "My sister and I haven't spoken in months. I miss her and hope one day we can fix things.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 8,
    label: "burned out should stay safe",
    text:
      "Work has been overwhelming lately and I feel burned out. I'm trying to stay positive but some days are heavy.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 9,
    label: "hell and crap profanity",
    text:
      "Work has been absolute hell lately and my boss keeps treating everyone like crap.",
    expectedOutcome: "block",
    expectedReason: "Offensive language detected. Please rephrase.",
  },
  {
    id: 10,
    label: "pissed profanity",
    text: "I'm honestly so pissed about what happened today.",
    expectedOutcome: "block",
    expectedReason: "Offensive language detected. Please rephrase.",
  },
  {
    id: 11,
    label: "deserved suffering wish",
    text:
      "I hope the person who ruined my career gets what they deserve and suffers for it.",
    expectedOutcome: "block",
    expectedReason: "Harmful intent detected. Please rephrase.",
  },
  {
    id: 12,
    label: "wish they disappear",
    text: "Sometimes I wish the people who hurt me would just disappear.",
    expectedOutcome: "block",
    expectedReason: "Harmful intent detected. Please rephrase.",
  },
  {
    id: 13,
    label: "wish something bad happens",
    text:
      "My neighbor keeps causing problems and honestly I wish something bad would happen to him.",
    expectedOutcome: "block",
    expectedReason: "Harmful intent detected. Please rephrase.",
  },
  {
    id: 14,
    label: "name and hospital location",
    text:
      "Please pray for my mom Maria Santos who is currently admitted at St Luke's BGC.",
    expectedOutcome: "sanitize",
    expectedReason: "Hospital/location generalized.",
  },
  {
    id: 15,
    label: "direct phone number",
    text: "If anyone wants to talk you can reach me at 09171234567.",
    expectedOutcome: "sanitize",
    expectedReason: "Phone number removed.",
  },
  {
    id: 16,
    label: "named hospital location",
    text: "My brother Mark from Quezon City just had surgery at Medical City.",
    expectedOutcome: "sanitize",
    expectedReason: "Hospital/location generalized.",
  },
  {
    id: 17,
    label: "no reason to keep going",
    text:
      "I feel like everything in my life is falling apart and I don't see a reason to keep going anymore.",
    expectedOutcome: "redirect_crisis",
    expectedReason: "Potential crisis language detected.",
  },
  {
    id: 18,
    label: "easier if i disappeared",
    text: "Sometimes I wonder if it would be easier if I just disappeared.",
    expectedOutcome: "redirect_crisis",
    expectedReason: "Potential crisis language detected.",
  },
  {
    id: 19,
    label: "how much longer can i do this",
    text:
      "I feel so tired of everything and I don't know how much longer I can keep doing this.",
    expectedOutcome: "redirect_crisis",
    expectedReason: "Potential crisis language detected.",
  },
  {
    id: 20,
    label: "life is dying slowly metaphor",
    text: "I feel like my life is dying slowly because of stress.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 21,
    label: "dreams were killed metaphor",
    text: "My dreams feel like they were killed by all the pressure around me.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
  {
    id: 22,
    label: "put old self to death metaphor",
    text: "I'm trying to put the old version of myself to death and start fresh.",
    expectedOutcome: "allow",
    expectedReason: null,
  },
] as const;

const SUPPLIED_SPAM_CASES = [
  {
    id: 1,
    label: "telegram investment promo",
    text:
      "If anyone here needs financial help you can join our investment group. We teach people how to earn passive income. Message me on Telegram t.me/wealthbuilder",
    expectedOutcome: "block",
  },
  {
    id: 2,
    label: "coaching promo url",
    text:
      "Struggling financially? Join our online coaching program and learn how to make money from home. Visit www.fastprofitnow.com",
    expectedOutcome: "block",
  },
  {
    id: 3,
    label: "deliverance signup url",
    text:
      "Need healing? Our ministry offers powerful deliverance sessions. Sign up here www.healingbreakthrough.org",
    expectedOutcome: "block",
  },
  {
    id: 4,
    label: "donation solicitation with gcash",
    text:
      "Please donate to help our ministry expand. Any amount helps. Send through GCash 09171234567.",
    expectedOutcome: "block",
  },
  {
    id: 5,
    label: "paypal fundraising ask",
    text:
      "I am raising funds for a project. If anyone is willing to help please send support through PayPal at my email.",
    expectedOutcome: "block",
  },
  {
    id: 6,
    label: "share this chain prayer",
    text:
      "If you read this prayer and believe God will bless you today. Share this with five people and watch what happens.",
    expectedOutcome: "block",
  },
  {
    id: 7,
    label: "type amen chain message",
    text: "Type AMEN and pass this message along to receive blessings this week.",
    expectedOutcome: "block",
  },
  {
    id: 8,
    label: "single generic encouragement stays allowed",
    text: "God loves you. Everything will be okay.",
    expectedOutcome: "allow",
  },
  {
    id: 11,
    label: "facebook prayer group recruitment",
    text:
      'Join our prayer group on Facebook where we pray together daily. Search "Faith Warriors Prayer Circle".',
    expectedOutcome: "block",
  },
  {
    id: 12,
    label: "discord recruitment",
    text:
      "If you want deeper support join our church Discord. We have daily prayer sessions.",
    expectedOutcome: "block",
  },
  {
    id: 13,
    label: "tinyurl suspicious link",
    text: "This message changed my life. Read it here http://tinyurl.com/faithstory",
    expectedOutcome: "block",
  },
  {
    id: 14,
    label: "affiliate style testimonial",
    text:
      "I was struggling financially but this program helped me earn money online. Highly recommended.",
    expectedOutcome: "block",
  },
  {
    id: 15,
    label: "single simple encouragement stays allowed",
    text: "Stay strong everyone. God is good.",
    expectedOutcome: "allow",
  },
] as const;

test("validateMessageLength enforces minimum and maximum lengths", () => {
  assert.equal(validateMessageLength("short"), "Message must be at least 40 characters.");
  assert.equal(validateMessageLength("a".repeat(801)), "Message must be at most 800 characters.");
  assert.equal(validateMessageLength("a".repeat(40)), null);
});

test("checkCrisis flags crisis language", () => {
  assert.equal(checkCrisis("I feel hopeless and want to end it all."), true);
  assert.equal(
    checkCrisis("I am tired of this life and don't want to push with it."),
    true,
  );
  assert.equal(checkCrisis("Please pray for wisdom at work this week."), false);
  assert.equal(
    checkCrisis("Please remove this fear asap and help me rest in Your peace."),
    false,
  );
  assert.equal(
    checkCrisis("Lord, remove me asap because I can't go on anymore."),
    true,
  );
  assert.equal(
    checkCrisis("Kapoy na ko sa kinabuhi ug dili na ko mopadayon."),
    true,
  );
  assert.equal(
    checkCrisis("Kapoy na gid ko sa kabuhi kag indi na ko magpadayon."),
    true,
  );
  assert.equal(
    checkCrisis("Estoy cansado de esta vida y no quiero seguir."),
    true,
  );
});

test("hasViolentIntent catches lexicon and structural harm wishes", () => {
  assert.equal(hasViolentIntent("mamatay ka na"), true);
  assert.equal(hasViolentIntent("I hope he gets removed from this world"), true);
  assert.equal(
    hasViolentIntent("I pray that you and your family will get poisoned."),
    true,
  );
  assert.equal(hasViolentIntent("Please pray that I respond with patience and peace."), false);
  assert.equal(
    hasViolentIntent(
      "Lord I created something that I am not sure if the world is ready for but I know that with your guidance, You will make it happen. And Lord I declare that if this doesn't align with you then Lord remove this asap.",
    ),
    false,
  );
});

test("checkSafety flags profanity and PII", () => {
  assert.deepEqual(checkSafety("Gago siya and I hate this."), {
    isSafe: false,
    reason: "profanity",
    foundDetail: "gago",
  });

  assert.deepEqual(checkSafety("You can text me at 09175551234 for details."), {
    isSafe: false,
    reason: "pii",
    foundDetail: "personal contact info",
  });

  assert.deepEqual(checkSafety("Please pray for him at St Lukes tonight."), {
    isSafe: false,
    reason: "pii",
    foundDetail: "hospital/location",
  });

  assert.deepEqual(checkSafety("My dad is admitted at TMC pasig right now."), {
    isSafe: false,
    reason: "pii",
    foundDetail: "hospital/location",
  });

  assert.deepEqual(
    checkSafety(
      "I am currently struggling with sickness and currently in a hospital, please call me at and visit me.",
    ),
    {
      isSafe: true,
      reason: null,
      foundDetail: null,
    },
  );

  assert.deepEqual(
    checkSafety("WWW.PROMO-HYPE.COM!!!!!! BUY NOW GUARANTEED CRYPTO LOAN"),
    {
      isSafe: false,
      reason: "spam",
      foundDetail: "url_or_handle,promo_keywords,excess_punctuation,high_caps_ratio",
    },
  );

  assert.deepEqual(
    checkSafety(
      'Join our prayer group on Facebook where we pray together daily. Search "Faith Warriors Prayer Circle".',
    ),
    {
      isSafe: false,
      reason: "spam",
      foundDetail: "recruitment_keywords",
    },
  );
});

test("analyzeSpam computes balanced thresholds", () => {
  assert.deepEqual(
    analyzeSpam("THIS IS A LONG ALL CAPS TEST MESSAGE ONLY FOR CHECKING."),
    {
      score: 1,
      signals: ["high_caps_ratio"],
      shouldBlock: false,
      shouldFlag: false,
    },
  );

  assert.deepEqual(
    analyzeSpam("I have an investment update to share."),
    {
      score: 2,
      signals: ["promo_keywords"],
      shouldBlock: false,
      shouldFlag: true,
    },
  );

  assert.deepEqual(
    analyzeSpam("Please check www.example.com for details."),
    {
      score: 4,
      signals: ["url_or_handle"],
      shouldBlock: true,
      shouldFlag: false,
    },
  );

  assert.deepEqual(
    analyzeSpam("WWW.PROMO-HYPE.COM!!!!!! BUY NOW GUARANTEED CRYPTO LOAN"),
    {
      score: 8,
      signals: [
        "url_or_handle",
        "promo_keywords",
        "excess_punctuation",
        "high_caps_ratio",
      ],
      shouldBlock: true,
      shouldFlag: false,
    },
  );
});

test("analyzeSpam blocks the supplied spam corpus and allows sincere encouragement", () => {
  for (const testCase of SUPPLIED_SPAM_CASES) {
    const result = runGuardian(testCase.text);

    assert.equal(
      result.outcome,
      testCase.expectedOutcome,
      `Spam case ${testCase.id} (${testCase.label}) produced ${result.outcome}.`,
    );

    if (testCase.expectedOutcome === "block") {
      assert.deepEqual(
        result.reasons,
        ["Likely spam or promotional content detected. Please rephrase."],
        `Spam case ${testCase.id} (${testCase.label}) should block for spam.`,
      );
    }
  }
});

test("runGuardian sanitizes PII while allowing safe intent", () => {
  const result = runGuardian(
    "Please pray for Maria Santos in barangay Maligaya. You can text me at 09175551234.",
  );

  assert.equal(result.outcome, "sanitize");
  assert.match(result.sanitizedMessage, /\[name removed\]/);
  assert.match(result.sanitizedMessage, /\[phone removed\]/);
  assert.match(result.sanitizedMessage, /\[redacted location\]/);
});

test("runGuardian sanitizes formatted phone numbers and short social links", () => {
  const result = runGuardian(
    "Please message me at 0917 555 1234 or +63 917-555-1234 and fb.me/john_doe",
  );

  assert.equal(result.outcome, "sanitize");
  assert.equal(result.sanitizedMessage.includes("0917 555 1234"), false);
  assert.equal(result.sanitizedMessage.includes("+63 917-555-1234"), false);
  assert.equal(result.sanitizedMessage.includes("fb.me/john_doe"), false);
  assert.match(result.sanitizedMessage, /\[phone removed\]/);
  assert.match(result.sanitizedMessage, /\[social link removed\]/);
});

test("runGuardian blocks malicious intent and redirects crisis content", () => {
  const malice = runGuardian("I pray that he dies for what he did.");
  assert.equal(malice.outcome, "block");
  assert.deepEqual(malice.reasons, ["Harmful intent detected. Please rephrase."]);

  const crisis = runGuardian("Ayoko na. Wala nang pag-asa.");
  assert.equal(crisis.outcome, "redirect_crisis");
  assert.deepEqual(crisis.reasons, ["Potential crisis language detected."]);

  const spam = runGuardian("WWW.PROMO-HYPE.COM!!!!!! BUY NOW GUARANTEED CRYPTO LOAN");
  assert.equal(spam.outcome, "block");
  assert.deepEqual(spam.reasons, [
    "Likely spam or promotional content detected. Please rephrase.",
  ]);
});

test("runGuardian generalizes hospital aliases in normal posting flow", () => {
  const samples = [
    "Please pray for him at TMC pasig tonight.",
    "She was admitted sa NCH yesterday.",
    "Nasa TMC siya ngayon.",
    "Dad is in St lukes for checkup.",
  ];

  for (const sample of samples) {
    const result = runGuardian(sample);
    assert.equal(result.outcome, "sanitize");
    assert.match(result.sanitizedMessage, /\[location generalized\]/);
  }
});

test("runGuardian allows generic hospital mentions but sanitizes specific hospital names", () => {
  const generic = runGuardian(
    "I am currently struggling with sickness and currently in a hospital, please call me at and visit me.",
  );
  assert.equal(generic.outcome, "allow");
  assert.equal(
    generic.sanitizedMessage,
    "I am currently struggling with sickness and currently in a hospital, please call me at and visit me.",
  );

  const named = runGuardian("Admitted at Makati Medical Center for monitoring.");
  assert.equal(named.outcome, "sanitize");
  assert.equal(
    named.sanitizedMessage,
    "Admitted at [location generalized] for monitoring.",
  );
  assert.deepEqual(named.reasons, ["Hospital/location generalized."]);
});

test("runGuardian keeps surrounding context when hospital aliases are sanitized", () => {
  const result = runGuardian(
    "Please pray for Dad, he is in St lukes for checkup and waiting for results.",
  );

  assert.equal(result.outcome, "sanitize");
  assert.equal(
    result.sanitizedMessage,
    "Please pray for Dad, he is in [location generalized] for checkup and waiting for results.",
  );
  assert.deepEqual(result.reasons, ["Hospital/location generalized."]);
});

test("canPost enforces cooldown windows", () => {
  assert.deepEqual(canPost(null), { allowed: true, waitTime: 0 });
  assert.equal(canPost(Date.now() - 10_000).allowed, false);
  assert.deepEqual(canPost(Date.now() - 61_000), { allowed: true, waitTime: 0 });
});

test("guardian aligns with the supplied moderation corpus", () => {
  for (const testCase of SUPPLIED_POST_CASES) {
    const result = runGuardian(testCase.text);

    assert.equal(
      result.outcome,
      testCase.expectedOutcome,
      `Post ${testCase.id} (${testCase.label}) produced ${result.outcome}.`,
    );

    if (testCase.expectedReason) {
      assert.deepEqual(
        result.reasons,
        [testCase.expectedReason],
        `Post ${testCase.id} (${testCase.label}) returned unexpected reasons.`,
      );
    } else {
      assert.deepEqual(
        result.reasons,
        [],
        `Post ${testCase.id} (${testCase.label}) should not add Guardian reasons.`,
      );
    }
  }
});

test("guarded write migration keeps duplicate protections and spam keywords aligned", () => {
  const sql = fs.readFileSync(
    "./db/migrations/20260306_guarded_writes_and_abuse_events.sql",
    "utf8",
  );

  assert.match(sql, /created_at >= now\(\) - interval '24 hours'/);
  assert.match(sql, /return jsonb_build_object\('ok', false, 'reason', 'duplicate'\)/);
  assert.match(sql, /url_or_handle/);
  assert.match(sql, /solicitation_keywords/);
  assert.match(sql, /recruitment_keywords/);
  assert.match(sql, /chain_message/);
  assert.match(sql, /affiliate_style/);
  assert.match(sql, /paypal/);
  assert.match(sql, /gcash/);
  assert.match(sql, /discord/);
  assert.match(sql, /prayer circle/);
});

describe("passive distress patterns (Gap 1)", () => {
  const passivelyCrisisMessages = [
    "I don't know why I keep waking up.",
    "Just going through the motions these days.",
    "What's even the point of any of this.",
    "I'm tired of pretending everything's fine.",
    "I don't care about anything anymore.",
    "Just existing now, nothing more.",
    "Can't remember the last time I felt okay.",
    "I don't know what I'm still doing here.",
  ];

  passivelyCrisisMessages.forEach((msg) => {
    test(`detects passive crisis: "${msg.slice(0, 40)}..."`, () => {
      assert.equal(checkCrisis(msg), true);
    });
  });
});

describe("code-switching crisis patterns (Gap 2)", () => {
  const codeSwitchedMessages = [
    "So pagod na ako, I just can't anymore.",
    "Wala na akong lakas, I don't want to go on.",
    "I can't na talaga, everything is too much.",
    "Ayoko na magpatuloy, I give up na.",
    "Sobrang tired na ko sa lahat.",
    "I surrender na sa lahat, wala na.",
  ];

  codeSwitchedMessages.forEach((msg) => {
    test(`detects code-switched crisis: "${msg.slice(0, 40)}..."`, () => {
      assert.equal(checkCrisis(msg), true);
    });
  });
});
