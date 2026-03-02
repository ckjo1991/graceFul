# GraceFul Planning Document

## Current Product State

GraceFul is a client-heavy Next.js prototype with a working local feed,
posting flow, onboarding modal, prayer composer and prayer viewer, local
translation rendering, and Guardian safety logic. The app is usable as a
demo, but all primary data is still in browser state and all review behavior is
simulated. The mounted feed now includes a styled language selector, a header
level `My Posts` shortcut, and a unified feed filter state for emotion and
device-specific post views.

## Architecture Overview

- **Framework:** Next.js 15 App Router with React 19 and TypeScript
- **Primary UI Shell:** `app/page.tsx`
- **Design System:** Tailwind config plus `app/globals.css` theme tokens and
  shared UI components
- **Safety Engine:** `lib/guardian.ts`
- **Lexicon Layer:** `lib/lexicon.ts` plus `data/harm-lexicon.json`
- **Guardian Review Simulation:** `lib/ai.ts`
- **Flow Screens:** `components/CategoryStep.tsx`,
  `components/MessageStep.tsx`, `components/SupportStep.tsx`,
  `components/TranslateOptStep.tsx`, `components/ReviewStep.tsx`,
  `components/CrisisScreen.tsx`, and `components/GuardianWarning.tsx`
- **Feed Interaction:** `components/PostCard.tsx` and
  `components/PrayerModal.tsx`
- **Prayer Viewing:** `components/PrayerListModal.tsx`
- **Local Translation:** `lib/translation.ts`
- **Onboarding:** `components/OnboardingModal.tsx`
- **Dev Harness:** `components/TestDashboard.tsx` with `lib/testData.ts`

## Implemented Scope

1. **Feed-first entry**
   Users land on a community feed and start posting through `+ Share`.
2. **Structured post flow**
   The app guides users through emotion, category, message, support
   preference, translation preference, and review.
3. **Guardian enforcement**
   The prototype checks for crisis, profanity, violent intent, and multiple
   forms of PII before posts or prayers are accepted, with a lexicon-backed
   harm pass ahead of the regex checks.
4. **Prayer interaction**
   Eligible posts can receive a prayer through a modal, and existing prayers
   can be viewed from the feed, with prayer entries and counts updated locally.
5. **Guardian review gate**
   The review screen runs a simulated Guardian review pass before final
   submission.
6. **Developer scenario injection**
   In development, test scenarios can prefill the flow for crisis, PII, and
   harmful-intent validation.
7. **First-session framing**
   An onboarding modal sets expectations around anonymity, prayer, and staying
   connected to real community.
8. **Unified feed controls**
   The header and filter row share a single active feed filter state for
   `all`, `grateful`, `struggling`, and `my_posts`, with a dedicated empty
   state for device-scoped posts.

## Known Gaps

- No database or backend persistence exists.
- Feed posts and prayer counts live only in client memory.
- `lib/ai.ts` is simulated review behavior, not a real backend moderation service.
- Translation is still a local deterministic helper, not a real translation
  service.
- The repo still contains archived reference prototypes in
  `components/reference/`, which should not be treated as the active product
  path.
- Coverage now exists for Guardian rules, prayer submission safety, and the
  core share-flow state transitions, but browser-level UI coverage is still
  absent, including feed header layout and filter rendering details.

## Active Flow Definition

The mounted application currently uses this state order:

- `feed`
- `emotion`
- `category`
- `message`
- `crisis`
- `warning`
- `support`
- `translate_opt`
- `review`
- `done`

Some transitions are conditional:

- `message -> crisis` when crisis language is detected
- `message -> warning` when safety or profanity checks fail
- `review -> crisis` if the review pass detects crisis content
- `done -> feed` after successful local publication

## Delivery Plan

1. **Phase 1: Consolidate source of truth**
   Choose the main product architecture explicitly, keep `app/page.tsx` as the
   mounted flow for now, and document the secondary prototype files as
   references or remove them later.
2. **Phase 2: Unify product models**
   Replace duplicate local type shapes with shared post, prayer, and flow
   models. This is now in progress and the mounted app path is aligned to the
   shared definitions.
3. **Phase 3: Server-backed submission**
   Move feed posts, prayer counts, and submission logic out of client-only
   state and into a persistence layer.
4. **Phase 4: Server moderation boundary**
   Replace simulated `lib/ai.ts` behavior with a server-backed moderation path.
5. **Phase 5: Quality and release readiness**
   Add test coverage, production-safe configuration, and a reliable deployment
   workflow.

## Immediate Priorities

- Reduce architectural drift between the mounted app and the alternative
  prototype components.
- Replace local-only posting and prayer updates with persistence-ready flows.
- Add browser-level UI coverage if the team wants confidence in rendered
  behavior rather than just flow-state logic, especially around feed header
  controls and empty states.
