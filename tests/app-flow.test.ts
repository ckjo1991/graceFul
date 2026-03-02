import test from "node:test";
import assert from "node:assert/strict";

import {
  addPrayerToPost,
  completeSuccessfulPost,
  createInitialPosts,
  createInitialSelection,
  injectScenario,
  returnToFeed,
  selectCategory,
  selectEmotion,
  selectSupport,
  startShareFlow,
  submitMessage,
} from "../lib/app-flow";
import { samplePosts } from "../lib/sample-posts";
import { TEST_SCENARIOS } from "../lib/testData";

test("share flow supports the happy path from feed to done and back to feed", () => {
  const shareStart = startShareFlow(null);
  assert.equal(shareStart.allowed, true);
  if (!shareStart.allowed) {
    assert.fail("Expected share flow to start.");
  }

  let selection = shareStart.selection;
  assert.equal(shareStart.nextStep, "emotion");

  const emotion = selectEmotion(selection, "grateful");
  selection = emotion.selection;
  assert.equal(emotion.nextStep, "category");

  const category = selectCategory(selection, "Family");
  selection = category.selection;
  assert.equal(category.nextStep, "message");

  const message = submitMessage(
    selection,
    "I am grateful for a calm week with my family and I would love prayer for continued peace in our home.",
  );
  selection = message.selection;
  assert.equal(message.nextStep, "support");
  assert.equal(message.warningReason, null);

  const support = selectSupport(selection, "A prayer would be nice");
  selection = support.selection;
  assert.equal(support.nextStep, "review");

  const posts = createInitialPosts();
  const completed = completeSuccessfulPost(
    posts,
    selection,
    selection.message,
    1_700_000_000_000,
    "device-123",
  );
  assert.ok(completed);
  if (!completed) {
    assert.fail("Expected successful completion.");
  }

  const createdPost = completed.posts[0];
  assert.equal(completed.nextStep, "done");
  assert.equal(completed.lastPostTime, 1_700_000_000_000);
  assert.equal(completed.posts.length, posts.length + 1);
  assert.equal(createdPost.id, "1700000000000");
  assert.equal(createdPost.emotion, "grateful");
  assert.equal(createdPost.category, "Family");
  assert.equal(
    createdPost.message,
    "I am grateful for a calm week with my family and I would love prayer for continued peace in our home.",
  );
  assert.equal(createdPost.deviceId, "device-123");
  assert.equal(createdPost.supportType, "A prayer would be nice");
  assert.equal(createdPost.allowTranslation, true);
  assert.equal(createdPost.sourceLanguage, "en");
  assert.equal(createdPost.createdAt, "Just now");
  assert.equal(createdPost.prayerCount, 0);
  assert.deepEqual(createdPost.prayers, []);
  assert.ok(
    !(createdPost.translations.tl ?? "").startsWith("Pagsasalin sa Tagalog:"),
  );
  assert.ok(
    !(createdPost.translations.ceb ?? "").startsWith("Hubad sa Binisaya:"),
  );
  assert.notEqual(createdPost.translations.tl, createdPost.message);
  assert.notEqual(createdPost.translations.ceb, createdPost.message);

  assert.equal(returnToFeed(), "feed");
});

test("share flow respects cooldown before restarting", () => {
  const result = startShareFlow(Date.now() - 5_000);
  assert.equal(result.allowed, false);
  if (result.allowed) {
    assert.fail("Expected cooldown to block a new share.");
  }

  assert.ok(result.waitTime > 0);
});

test("message submission routes crisis content into the crisis step", () => {
  const result = submitMessage(
    createInitialSelection(),
    "Ayoko na talaga. Wala nang pag-asa at gusto ko nang matapos ito.",
  );

  assert.equal(result.nextStep, "crisis");
  assert.equal(result.warningReason, null);
});

test("message submission routes unsafe content into the warning step", () => {
  const piiResult = submitMessage(
    createInitialSelection(),
    "Please pray for me and text me at 09175551234 because I need comfort today.",
  );
  assert.equal(piiResult.nextStep, "warning");
  assert.equal(piiResult.warningReason, "pii");

  const profanityResult = submitMessage(
    createInitialSelection(),
    "I feel gago and angry about everything that happened to me this week.",
  );
  assert.equal(profanityResult.nextStep, "warning");
  assert.equal(profanityResult.warningReason, "profanity");
});

test("prayer submissions append a prayer and increment only the targeted post", () => {
  const posts = samplePosts.map((post) => ({ ...post, prayers: [...post.prayers] }));
  const updated = addPrayerToPost(
    posts,
    "post-2",
    "Lord, please provide peace and daily provision for this person.",
    "Just now",
  );

  assert.equal(updated[0].prayerCount, posts[0].prayerCount);
  assert.equal(updated[1].prayerCount, posts[1].prayerCount + 1);
  assert.equal(updated[2].prayerCount, posts[2].prayerCount);
  assert.equal(updated[1].prayers.length, posts[1].prayers.length + 1);
  assert.equal(
    updated[1].prayers.at(-1)?.message,
    "Lord, please provide peace and daily provision for this person.",
  );
});

test("createInitialPosts stays empty outside development", () => {
  assert.deepEqual(createInitialPosts(), []);
});

test("scenario injection preloads the selection and returns to the message step", () => {
  const result = injectScenario(createInitialSelection(), TEST_SCENARIOS[0]);

  assert.equal(result.nextStep, "message");
  assert.equal(result.selection.emotion, TEST_SCENARIOS[0].emotion);
  assert.equal(result.selection.category, TEST_SCENARIOS[0].category);
  assert.equal(result.selection.message, TEST_SCENARIOS[0].message);
});
