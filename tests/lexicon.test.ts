import test from "node:test";
import assert from "node:assert/strict";

import { checkLexicon } from "../lib/lexicon";

test("checkLexicon uses boundary-aware exact matching", () => {
  const result = checkLexicon("matay ka koma");

  assert.equal(result.matched, true);
  if (!result.matched) {
    assert.fail("Expected a violent_intent match.");
  }

  assert.equal(result.signal, "violent_intent");
});

test("checkLexicon normalizes punctuation for exact phrase checks", () => {
  const result = checkLexicon("I pray—you die.");

  assert.equal(result.matched, true);
  if (!result.matched) {
    assert.fail("Expected a violent_intent match.");
  }

  assert.equal(result.signal, "violent_intent");
});
