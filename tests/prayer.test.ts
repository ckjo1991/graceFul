import test from "node:test";
import assert from "node:assert/strict";

import { validatePrayerSubmission } from "../lib/prayer";

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
