# Guardian Improvement Roadmap
Date: 2026-03-06

Goal: Close the gaps between Guardian's current deterministic rule engine and
what an LLM safety layer would catch — without adding API costs or dependencies.

---

## Gap 1 — Passive crisis without keywords (HIGH)

**What Guardian misses:**
Messages that signal distress through exhaustion, resignation, or detachment
without using any exact crisis keyword or matching any current pattern.

Examples that currently pass Guardian:
- "I've been staring at the ceiling for three days. I don't know what I'm still doing here."
- "I don't know why I keep waking up."
- "I'm tired of pretending everything is fine."
- "I just feel like I'm going through the motions."
- "What's even the point of any of this."

**Improvement direction:**
Add a passive distress pattern layer to `checkCrisis` in `lib/guardian.ts`.
These are not keyword matches — they are structural patterns that capture
resignation, pointlessness, and detachment framing even without explicit
self-harm language.

Proposed patterns to add to `PASSIVE_CRISIS_PATTERNS`:
```
/\bdon't know (what|why) i (keep|still|even|bother)\b/i
/\bgoing through the motions\b/i
/\bwhat('s| is) (even )?the point\b/i
/\btired of pretending\b/i
/\bstaring at the (ceiling|wall|floor) (for days|all (day|night|week))\b/i
/\bcan't (feel|remember) the last time (i was|things were|i felt)\b/i
/\bdon't (care|feel) (anything|much) anymore\b/i
/\bjust (existing|surviving|going through it)\b/i
/\bnumb to (everything|it all|life)\b/i  ← already in universal exact, add to pattern layer
/\b(don't|do not) (see|know) (why|what) (i'm|i am) (still|even) here\b/i
```

Also add TL equivalents:
```
/\bwala na kong pakialam\b/i
/\bhindi ko na alam kung bakit ako narito\b/i
/\bparang wala na akong naramdaman\b/i
/\bnag-aantay lang ako ng wala\b/i
/\bwalang nagbabago\b/i
```

---

## Gap 2 — Code-switching crisis signals (HIGH)

**What Guardian misses:**
Filipino users frequently mix Tagalog and English mid-sentence. Crisis patterns
that span both languages in a single message can fall between the EN and TL
lexicon checks.

Examples that currently pass Guardian:
- "Lord I'm so pagod na, I just want everything to matapos na"
- "I can't na talaga, wala na akong lakas"
- "Sobrang tired na ko, I don't want to go on anymore"

**Improvement direction:**
Add cross-language crisis patterns to `universal.crisis` in `harm-lexicon.json`
and as regex patterns in `PASSIVE_CRISIS_PATTERNS` in `lib/guardian.ts`.

Proposed additions:
```
/\b(so |sobrang )?(pagod|tired|exhausted)\s+na\b/i
/\bwala na (akong |kong )?(lakas|strength|energy|reason)\b/i
/\b(i )?can't na (talaga|na|eh)?\b/i
/\b(ayoko|i don't want) na (talagang |talaga )?(magpatuloy|to go on|to continue)\b/i
/\bwant (everything|lahat) to (matapos|end|stop) na\b/i
/\b(so |sobrang )?tired na ko\b/i
```

---

## Gap 3 — Contextual intent reversal false positives (MEDIUM)

**What Guardian may incorrectly flag:**
A prayer submitted on behalf of someone else in crisis can trigger violent
intent or crisis flags because Guardian reads the content of the concern, not
the context of the submission.

Examples that currently may flag incorrectly:
- "Praying for my friend who wants to hurt himself"
- "Lord please help my sister, she said she wants to die"
- "I'm worried about someone who told me they want to end it all"

**Improvement direction:**
Add a prayer-context shield layer in `hasViolentIntent` and `checkCrisis` that
detects intercessory framing before applying gates.

Add intercession detection function:
```ts
const INTERCESSION_PATTERNS = [
  /\b(praying|pray|prayed) for (my |a )?(friend|sister|brother|mom|dad|family|loved one|someone)\b/i,
  /\b(worried|concerned) about (someone|a friend|my)\b/i,
  /\bplease (help|heal|protect|guide) (my|a|someone|this person)\b/i,
  /\b(he|she|they) (told me|said|mentioned) (that )?(they want|they're)\b/i,
  /\bLord (please )?(help|heal|hold|protect|guide|watch over)\b/i,
];

function hasIntercessionContext(text: string): boolean {
  return INTERCESSION_PATTERNS.some(p => p.test(text));
}
```

Wire this into `checkCrisis` — if intercession context is detected, route to
crisis resource display (not block) so the person sharing the concern gets
support resources surfaced, not a content block.

---

## Gap 4 — Severity gradation (MEDIUM)

**What Guardian misses:**
Crisis detection is binary — a message either trips the crisis gate or it
doesn't. There is no gradation between "mildly concerning" and "immediate risk."
The UI response is identical for both.

Examples of severity spectrum Guardian can't distinguish:
- Low: "I've been feeling really low lately" (concern, no block needed)
- Medium: "I don't see the point anymore" (resource surface warranted)
- High: "I want to end it all tonight" (immediate crisis intervention)

**Improvement direction:**
Add a `crisisSeverity` return value to `checkCrisis` — returning `"low"`,
`"medium"`, or `"high"` instead of a boolean.

Severity logic:
- `"high"` — direct self-harm language, explicit ideation, time markers
  ("tonight", "today", "now"), or matches `SELF_HARM_URGENCY_PATTERN`
- `"medium"` — hopelessness, exhaustion, passive ideation, no-reason-to-live
  patterns without time markers
- `"low"` — general distress, resignation, fatigue language without ideation

This enables the UI to show a gentle "you're not alone" message for low
severity, surface crisis resources for medium, and show the full crisis
intervention screen for high.

Signature change:
```ts
// Before
export const checkCrisis = (text: string): boolean

// After
export const checkCrisis = (text: string): { detected: boolean; severity: "low" | "medium" | "high" | null }
```

Note: This is a breaking change. All callers of `checkCrisis` in
`lib/guardian.ts`, `lib/app-flow.ts`, and tests must be updated together.

---

## Gap 5 — Spanish violent_intent coverage (LOW)

**What Guardian misses:**
`es.violent_intent.exact` and `es.violent_intent.patterns` are both empty
arrays in `harm-lexicon.json`. Spanish crisis coverage exists but violent
intent is unguarded.

**Improvement direction:**
Add a minimum viable Spanish violent intent set to `harm-lexicon.json`:

```json
"exact": [
  "mátate",
  "ojalá te mueras",
  "ojalá mueras",
  "espero que te mueras",
  "te voy a matar",
  "te voy a hacer daño",
  "desaparece",
  "no mereces vivir",
  "el mundo está mejor sin ti",
  "nadie te va a extrañar"
],
"patterns": [
  "ojalá (te |le )?(pase algo|muera|sufra|desaparezca)",
  "(espero|deseo) que (te|le) (pase algo malo|mueras|sufras)",
  "(te|le) voy a (matar|hacer daño|destruir)",
  "no (mereces|deberías) (vivir|existir|estar aquí)",
  "el mundo (está|estaría) mejor sin (ti|él|ella|ellos)"
]
```

---

## Gap 6 — Sarcasm and bitter irony (LOW)

**What Guardian misses:**
Flat statements with bitter or sarcastic framing that signal chronic low-grade
distress. No keywords, no patterns, no flags.

Examples:
- "Great, another day to be alive."
- "Can't wait to do this all over again tomorrow."
- "Another morning. Wonderful."

**Improvement direction:**
This gap is difficult to close with deterministic rules without generating
excessive false positives on genuinely cheerful sarcasm ("Another Monday,
wonderful!"). Recommend flagging for human review rather than blocking.

Add a low-confidence distress signal layer that tags posts for soft review
without interrupting the share flow — similar to `shouldFlag` in spam
assessment. This would feed into the admin moderation surface as a "soft flag"
category, not a crisis gate.

---

## Implementation order

1. Gap 1 — Passive distress patterns (highest risk, lowest complexity)
2. Gap 2 — Code-switching patterns (high risk, moderate complexity)
3. Gap 3 — Intercession context shield (medium risk, prevents false blocks)
4. Gap 5 — Spanish violent intent (low effort, closes declared gap)
5. Gap 4 — Severity gradation (medium risk, breaking change — do last)
6. Gap 6 — Sarcasm soft flag (low urgency, depends on admin surface maturity)

---

## What this roadmap does not cover

- LLM API integration (separate decision — see Phase 2 in planning.md)
- Ilokano (ilo) coverage expansion
- Prayer response quality evaluation
- Cross-session behavior pattern detection
