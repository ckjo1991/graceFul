import test from "node:test";
import assert from "node:assert/strict";

import { validatePrayerSubmission } from "../lib/prayer";

const SUPPLIED_PRAYER_CASES = [
  {
    id: 1,
    label: "supportive prayer should pass",
    text:
      "Lord, please bring peace to the person who shared this. Help them feel supported and not alone.",
    expected: {
      allowed: true,
      sanitizedText:
        "Lord, please bring peace to the person who shared this. Help them feel supported and not alone.",
    },
  },
  {
    id: 2,
    label: "brief sincere prayer should pass",
    text: "God, give them strength and wisdom as they face this situation.",
    expected: {
      allowed: true,
      sanitizedText: "God, give them strength and wisdom as they face this situation.",
    },
  },
  {
    id: 3,
    label: "punitive prayer should block for malice",
    text: "God please punish the people who hurt them and make them suffer.",
    expected: {
      allowed: false,
      reason: "malice",
    },
  },
] as const;

test("validatePrayerSubmission rejects prayers that are too short", () => {
  assert.deepEqual(validatePrayerSubmission("hey"), {
    allowed: false,
    reason: "too_short",
  });
});

test("validatePrayerSubmission rejects crisis content", () => {
  assert.deepEqual(validatePrayerSubmission("Ayoko na talaga, wala nang pag-asa."), {
    allowed: false,
    reason: "crisis",
  });
});

test("validatePrayerSubmission rejects profanity", () => {
  assert.deepEqual(validatePrayerSubmission("Gago ka."), {
    allowed: false,
    reason: "profanity",
  });
});

test("validatePrayerSubmission rejects malicious wishes", () => {
  assert.deepEqual(validatePrayerSubmission("I pray that he dies soon."), {
    allowed: false,
    reason: "malice",
  });

  assert.deepEqual(
    validatePrayerSubmission("I pray that you and your family will get poisoned."),
    {
      allowed: false,
      reason: "malice",
    },
  );
});

test("validatePrayerSubmission rejects spammy promotional prayers", () => {
  assert.deepEqual(
    validatePrayerSubmission("WWW.PROMO-HYPE.COM!!!!!! BUY NOW GUARANTEED CRYPTO LOAN"),
    {
      allowed: false,
      reason: "spam",
    },
  );
});

test("validatePrayerSubmission rejects PII", () => {
  assert.deepEqual(
    validatePrayerSubmission("Lord, give this person peace. Text me at 09175551234 if needed."),
    {
      allowed: false,
      reason: "pii",
    },
  );
});

test("validatePrayerSubmission rejects hospital location aliases as PII", () => {
  assert.deepEqual(
    validatePrayerSubmission("Lord, please comfort him tonight at St Lukes."),
    {
      allowed: false,
      reason: "pii",
    },
  );
});

test("validatePrayerSubmission allows safe prayers and trims whitespace", () => {
  const result = validatePrayerSubmission(
    "  Lord, please give this person peace, wisdom, and steady strength today.  ",
  );

  assert.equal(result.allowed, true);
  if (!result.allowed) {
    assert.fail("Expected prayer to pass validation.");
  }

  assert.equal(
    result.sanitizedText,
    "Lord, please give this person peace, wisdom, and steady strength today.",
  );
});

test("validatePrayerSubmission allows faith declarations with non-harmful urgency phrasing", () => {
  const result = validatePrayerSubmission(
    "Lord I created something that I am not sure if the world is ready for but I know that with your guidance, You will make it happen. And Lord I declare that if this doesn't align with you then Lord remove this asap.",
  );

  assert.equal(result.allowed, true);
  if (!result.allowed) {
    assert.fail("Expected faith declaration prayer to pass validation.");
  }
});

test("validatePrayerSubmission aligns with the supplied prayer corpus", () => {
  for (const testCase of SUPPLIED_PRAYER_CASES) {
    assert.deepEqual(
      validatePrayerSubmission(testCase.text),
      testCase.expected,
      `Prayer ${testCase.id} (${testCase.label}) did not match the expected outcome.`,
    );
  }
});
