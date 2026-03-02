import test from "node:test";
import assert from "node:assert/strict";

import {
  canPost,
  checkCrisis,
  checkSafety,
  hasViolentIntent,
  runGuardian,
  validateMessageLength,
} from "../lib/guardian";

test("validateMessageLength enforces minimum and maximum lengths", () => {
  assert.equal(validateMessageLength("short"), "Message must be at least 40 characters.");
  assert.equal(validateMessageLength("a".repeat(801)), "Message must be at most 800 characters.");
  assert.equal(validateMessageLength("a".repeat(40)), null);
});

test("checkCrisis flags crisis language", () => {
  assert.equal(checkCrisis("I feel hopeless and want to end it all."), true);
  assert.equal(checkCrisis("Please pray for wisdom at work this week."), false);
});

test("hasViolentIntent catches lexicon and structural harm wishes", () => {
  assert.equal(hasViolentIntent("mamatay ka na"), true);
  assert.equal(hasViolentIntent("I hope he gets removed from this world"), true);
  assert.equal(hasViolentIntent("Please pray that I respond with patience and peace."), false);
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

test("runGuardian blocks malicious intent and redirects crisis content", () => {
  const malice = runGuardian("I pray that he dies for what he did.");
  assert.equal(malice.outcome, "block");
  assert.deepEqual(malice.reasons, ["Harmful intent detected. Please rephrase."]);

  const crisis = runGuardian("Ayoko na. Wala nang pag-asa.");
  assert.equal(crisis.outcome, "redirect_crisis");
  assert.deepEqual(crisis.reasons, ["Potential crisis language detected."]);
});

test("canPost enforces cooldown windows", () => {
  assert.deepEqual(canPost(null), { allowed: true, waitTime: 0 });
  assert.equal(canPost(Date.now() - 10_000).allowed, false);
  assert.deepEqual(canPost(Date.now() - 61_000), { allowed: true, waitTime: 0 });
});
