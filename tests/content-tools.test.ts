import test from "node:test";
import assert from "node:assert/strict";

import {
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
    "I am grateful for my family and I need peace and strength today.",
  );

  assert.match(translations.tl ?? "", /^Pagsasalin sa Tagalog:/);
  assert.match(translations.ceb ?? "", /^Hubad sa Binisaya:/);
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
  assert.equal(getViewPrayerLabel(2, "en"), "View prayer (2)");
});

test("generateTranslations covers added dialects and languages", () => {
  const translations = generateTranslations(
    "I am grateful for my family and I need peace and strength today.",
  );

  assert.match(translations.ilo ?? "", /^Patarus iti Ilocano:/);
  assert.match(translations.hil ?? "", /^Hubad sa Hiligaynon:/);
  assert.match(translations.war ?? "", /^Hubad ha Waray:/);
  assert.match(translations.pam ?? "", /^Salin king Kapampangan:/);
  assert.match(translations.bcl ?? "", /^Salin sa Bikol:/);
  assert.match(translations.es ?? "", /^Traduccion al Espanol:/);
});
