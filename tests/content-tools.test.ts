import test from "node:test";
import assert from "node:assert/strict";

import {
  getDisplayTranslatedMessage,
  generateTranslations,
  getLanguageLabel,
  getPrayerCountLabel,
  getViewPrayerLabel,
  getTranslatedMessage,
  getUiCopy,
  localizeCategory,
} from "../lib/translation";

test("generateTranslations creates local Tagalog and Bisaya variants", () => {
  const translations = generateTranslations(
    "I am so grateful for my mother's recovery. The past few months have been hard, but she is getting stronger now.",
  );

  assert.equal(
    translations.tl,
    "Napakalaking biyaya para sa amin na gumagaling na ang nanay ko. Salamat sa Diyos sa Kanyang kabutihan sa aming pamilya.",
  );
  assert.equal(
    translations.ceb,
    "Dako kaayo akong pasalamat sa pagkaayo sa akong inahan. Salamat sa Diyos kay padayon Niyang gipalig-on ang among pamilya.",
  );
});

test("getTranslatedMessage returns original english and translated local variants", () => {
  const message = "I am grateful for my family.";
  const translations = generateTranslations(message);

  assert.equal(getTranslatedMessage(message, translations, "en"), message);
  assert.notEqual(getTranslatedMessage(message, translations, "tl"), message);
  assert.notEqual(getTranslatedMessage(message, translations, "ceb"), message);
  assert.equal(getLanguageLabel("tl"), "Tagalog");
});

test("ui localization helpers return page-level localized copy", () => {
  assert.equal(getUiCopy("tl").feed.share, "+ Magbahagi");
  assert.equal(localizeCategory("Family", "ceb"), "Pamilya");
  assert.equal(getPrayerCountLabel(2, "tl"), "2 mga panalangin");
  assert.equal(getViewPrayerLabel(1, "en"), "View prayer (1)");
  assert.equal(getViewPrayerLabel(2, "en"), "View prayers (2)");
});

test("generateTranslations covers remaining dialects and languages", () => {
  const message =
    "I am still holding on to hope. God has not left me, and I am trusting Him one day at a time.";
  const translations = generateTranslations(message);

  assert.equal(
    translations.hil,
    "Wala ko ginabayaan ang paglaum. Matutom ang Diyos, kag nagasalig ako nga updan Niya ako adlaw-adlaw.",
  );
  assert.equal(translations.es, "Todavia me aferro a la esperanza. Dios no me ha dejado, y sigo confiando en El dia tras dia.");
  assert.ok(!("ilo" in translations));
  assert.ok(!("war" in translations));
  assert.ok(!("pam" in translations));
  assert.ok(!("bcl" in translations));
});

test("getDisplayTranslatedMessage returns clean translated copy with no prefix", () => {
  const message = "I am grateful for my family.";
  const translations = generateTranslations(message);

  assert.equal(
    getDisplayTranslatedMessage(message, translations, "tl"),
    "Nagpapasalamat ako sa kapayapaang ibinibigay ng Diyos sa aming tahanan. Ramdam ko ang Kanyang pag-aalaga sa aming pamilya.",
  );
});

test("generateTranslations falls back to the original message when no scenario matches", () => {
  const message = "The rain finally stopped this afternoon, and I had time to sit quietly outside.";
  const translations = generateTranslations(message);

  assert.equal(translations.tl, message);
  assert.equal(translations.ceb, message);
  assert.equal(translations.es, message);
});
