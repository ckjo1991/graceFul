import test from "node:test";
import assert from "node:assert/strict";

import {
  GRATEFUL_THANKYOU,
  STRUGGLING_THANKYOU,
  getThankYouVariants,
  pickThankYouMessage,
} from "../lib/thank-you";

test("grateful and just_sharing use the grateful thank-you variants", () => {
  assert.equal(getThankYouVariants("grateful"), GRATEFUL_THANKYOU);
  assert.equal(getThankYouVariants("just_sharing"), GRATEFUL_THANKYOU);
  assert.equal(getThankYouVariants(""), GRATEFUL_THANKYOU);
});

test("struggling uses the struggling thank-you variants", () => {
  assert.equal(getThankYouVariants("struggling"), STRUGGLING_THANKYOU);
});

test("pickThankYouMessage selects a grateful variant from the random index", () => {
  const picked = pickThankYouMessage("grateful", () => 0.99);

  assert.deepEqual(picked, GRATEFUL_THANKYOU[4]);
});

test("pickThankYouMessage selects a struggling variant from the random index", () => {
  const picked = pickThankYouMessage("struggling", () => 0.2);

  assert.deepEqual(picked, STRUGGLING_THANKYOU[1]);
});
