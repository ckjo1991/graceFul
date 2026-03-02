# GraceFul Product Requirements Document

## Executive Summary

GraceFul is an anonymous prayer wall centered on two emotional starting
points: gratitude and struggle. The product is meant to help a person move
from an internal burden to a shareable community prayer request without
identity, debate, or performative social features.

## Current Prototype Status

The current repository ships a working local prototype in `app/page.tsx`.
Today it includes:

- A feed-first entry point with a `+ Share` action
- A feed header with a styled native language selector, a `My Posts`
  shortcut, and a direct share action
- A first-session onboarding modal that frames anonymity, prayer, and real-world community
- A multi-step posting flow built from dedicated UI step components
- Local Guardian checks for crisis, PII, profanity, and violent intent
- A lexicon-backed harm-detection pass before regex-based intent checks
- A review step that simulates Guardian analysis before final posting
- A prayer composer plus prayer-list viewing for each eligible post
- Local in-app translation rendering for posts that opt in
- Development-only test scenario injection through `TestDashboard`

The prototype does not yet include persistence, authentication, server-backed
moderation, or server-backed translation.

## Product Goal

GraceFul should make it easy to share gratitude or struggle, receive prayer,
and feel held by a calm spiritual community. The product should stay
lightweight, anonymous, and safety-first from start to finish.

## Core Product Principles

- Anonymous by default
- Prayer over performance
- Safety before posting
- Calm, simple interaction design
- Support for multilingual community use, especially Philippine contexts

## Core Experience

### Feed-First Community Wall

Users currently land on a feed of anonymous posts. Each post shows:

- Emotional tone: grateful or struggling
- Category
- Message body
- Relative post time
- Prayer count
- Optional translation toggle when the post allows it and the viewer selects a supported language

The feed shell currently includes:

- A language selector in the header using `SUPPORTED_LANGUAGES`
- A `My Posts` header action that filters by the current device ID
- Emotion pills for `All`, `Grateful`, and `Struggling`
- Topic/category pills as a secondary filter row
- A dedicated empty state for `My Posts` with a `+ Share something` CTA when
  the current device has not posted yet

The feed should remain free of likes, rankings, public profiles, or threaded
discussion.

### Share Flow

When a user taps `+ Share`, the intended posting path is:

- emotion
- category
- message
- warning or crisis, if needed
- support
- translate_opt
- review
- done
- feed

This flow is currently orchestrated inside `app/page.tsx` and rendered through
specialized components such as `CategoryStep`, `MessageStep`, `SupportStep`,
`TranslateOptStep`, `ReviewStep`, `GuardianWarning`, and `CrisisScreen`.

### Guardian Safety Layer

Every shared message must be checked before publication. The current prototype
Guardian behavior includes:

- Message length validation
- Crisis detection
- PII detection and scrubbing
- Profanity detection
- Violent or malicious intent detection
- Lexicon-based multilingual harm matching before structural pattern checks

Guardian logic is implemented locally in `lib/guardian.ts`.

### Crisis Intervention

If a message suggests self-harm or crisis, GraceFul must interrupt the normal
flow and prioritize support resources. The current prototype references:

- National Center for Mental Health: 1553
- Hopeline Philippines

This intervention takes precedence over normal posting.

### Review Gate

Before final submission, the review step runs a simulated Guardian review pass
through `lib/ai.ts`. The prototype currently supports:

- A simulated review pass with feedback
- Safety-based disablement of final posting

This is still local/demo behavior. It is not a real backend moderation integration.

### Prayer Response Flow

Users can open a prayer modal from eligible feed posts, submit a short prayer,
and view previously shared prayers. The prayer flow must remain:

- Anonymous
- Respectful
- Free from identity disclosure
- Free from harmful or profane language

The current prototype stores prayer entries in local client state after
Guardian checks pass.

## Functional Requirements

- Users must be able to complete the flow without creating an account.
- Posts must remain anonymous and must not expose personal identity.
- Shared messages must respect the 40-800 character range.
- Crisis content must interrupt the normal post path.
- Harmful intent, profanity, and obvious PII must be blocked or scrubbed.
- Prayer interactions must remain supportive rather than conversational or
  argumentative.
- Translation must remain optional.
- Feed filtering must preserve a single mutually exclusive state for `all`,
  `grateful`, `struggling`, and `my_posts`.
- Posting must not introduce social metrics beyond prayer count.

## Technical Requirements

### Platform

- Next.js App Router
- React client-side state for the current flow
- TypeScript for product models and guardrail logic
- Tailwind-based styling plus global CSS theme tokens

### Current Architecture

- `app/page.tsx` is the active prototype shell
- `lib/guardian.ts` contains the primary safety rules
- `lib/lexicon.ts` loads the harm lexicon used by Guardian intent detection
- `lib/ai.ts` simulates the Guardian review pass
- `components/*Step.tsx` files implement the main flow screens
- `components/PostCard.tsx` and `components/PrayerModal.tsx` implement feed
  interaction
- `components/OnboardingModal.tsx` handles first-session product framing
- `components/TestDashboard.tsx` provides development-only scenario injection

### Archived Reference Prototypes

The repository also keeps archived reference surfaces in:

- `components/reference/share-flow.reference.tsx`
- `components/reference/prayer-feed.reference.tsx`

These are not the primary application flow currently mounted in `app/page.tsx`.

## Non-Goals

- Public identities or profiles
- Likes, reactions, or engagement ranking
- Open comment threads or debate
- Social networking mechanics unrelated to prayer support
- Mandatory automatic rewriting of a user’s message

## Success Metrics

- Share-flow completion rate
- Prayer participation rate
- Crisis interception rate
- PII interception rate
- Time from tapping `+ Share` to successful anonymous post
