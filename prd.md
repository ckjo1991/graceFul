# GraceFul Product Requirements Document

## Executive Summary

GraceFul is an anonymous prayer wall for gratitude, struggle, prayer, and
light-touch support. The product is meant to feel quiet, safe, and spiritually
grounded, without identity performance or social-graph pressure.

## Current Product Status

The repository currently ships a routed Next.js app with:

- Landing page at `/`
- Main community experience at `/feed`
- Key-gated moderation page at `/admin` via `?key=<NEXT_PUBLIC_ADMIN_KEY>`

Shipped capabilities today:

- Feed-first anonymous posting and prayer experience
- First-session onboarding and quiet-return community nudge
- Multi-step share flow with Guardian checks before publishing
- Supabase persistence for posts, prayers, post reports, prayer reports, and
  heart counts
- Guarded Supabase RPC writes for posts, prayers, and report submission
- Abuse-event logging for rate limits, duplicate submissions, and spam-like
  activity
- Realtime subscriptions for post insert/update/delete and prayer insert/delete
- Device-scoped `My Posts` filtering
- Post and prayer report submission with explicit reason selection
- Admin moderation UI with:
  - all-post management
  - reported-content triage
  - report reason summaries
  - abuse-event summaries and recent event visibility
  - delete actions for posts and prayers
- UI language support for `en`, `tl`, and `ceb`
- Generated translation variants on post content data, with feed-card
  translation display still intentionally parked
- Development-only scenario injector (`TestDashboard`) gated by
  `NEXT_PUBLIC_ENABLE_TEST_DASHBOARD === "true"`

Current limitations:

- Guardian review copy and review-state behavior still rely on simulated logic
  in `lib/ai.ts`
- `api/guardian.ts` exists as a thin wrapper but is not the primary submission
  boundary
- Admin access is still URL-key gated, not authenticated role-based access
- Moderation deletions do not yet create durable moderator audit entries
- Realtime verification and cleanup are still in progress
- The design-token source-of-truth doc referenced in older rules does not exist
  in this repo today

## Product Goal

Help people share gratitude or struggle, receive prayer, and feel gently held
by a calm community while staying anonymous by default.

## Core Product Principles

- Anonymous by default
- Prayer over performance
- Safety before publication
- Calm, low-friction interaction design
- Philippine-first language and safety relevance

## Core Experience

### Entry and Feed

Users enter through `/`, then browse or share at `/feed`.

Each feed post includes:

- Emotion (`grateful` or `struggling`)
- Category
- Message
- Relative timestamp
- Support preference
- Heart count
- Prayer count
- Reporting affordance for non-owned posts

Feed controls include:

- `My Posts` toggle using a local device ID
- Emotion filters
- Topic filters
- Language switcher for UI copy
- Share entry point

### Share Flow

Current flow state sequence:

- `feed`
- `emotion`
- `category`
- `message`
- `crisis`
- `warning`
- `support`
- `review`
- `done`

Mounted at `app/feed/page.tsx` and coordinated through `lib/app-flow.ts`.

### Guardian Safety Layer

Every message is screened for:

- Length constraints
- Crisis indicators
- Profanity
- Violent or malicious intent
- Spam-like or promotional language
- PII risk and redaction
- Lexicon-backed multilingual harm patterns
- Stem-aware violent verb matching
- Metaphor-shield exceptions to reduce false positives
- Hospital and location generalization for Philippine-specific references
- Name-redaction heuristics for likely full names

Guardian runtime logic lives in `lib/guardian/` and is re-exported through
`lib/guardian.ts`.

### Crisis Intervention

Crisis-signal messages interrupt normal posting and surface support resources,
including:

- National Center for Mental Health: `1553`
- Hopeline Philippines

### Prayer Response Flow

Prayer replies remain anonymous, pass the same guarded-write backend path, and
are synced into the feed through realtime events.

### Reporting and Moderation

Users can report posts and prayers with explicit reasons. Reports persist in
Supabase through guarded RPCs and can be reviewed in `/admin`.

The moderation surface currently shows:

- All posts
- Reported posts
- Reported prayers
- Reason summaries
- Recent abuse events
- Top abuse reasons
- Top device repeaters

### Realtime Sync

Realtime updates currently support:

- Post `INSERT`
- Post `UPDATE` for heart sync
- Post `DELETE`
- Prayer `INSERT`
- Prayer `DELETE`

Handlers are written defensively around missing payload data and duplicate
events.

## Functional Requirements

- Posting and prayer actions must work without account creation.
- Posts and prayers must not expose identity.
- Crisis content must interrupt the normal share flow.
- Unsafe content must be blocked or scrubbed before storage.
- Guarded backend writes must reject rate-limited, duplicate, or spam-like
  submissions.
- Feed filters must compose cleanly across emotion, topic, and `My Posts`.
- Hearts, prayers, and reports must persist in Supabase.
- Realtime handlers must not crash on partial or repeated events.
- Moderation tooling must surface reported content and abuse signals clearly.

## Technical Requirements

### Platform

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase for persistence and realtime

### Current Architecture

- `app/page.tsx`: landing experience
- `app/feed/page.tsx`: feed and share flow
- `app/admin/page.tsx`: moderation surface
- `app/layout.tsx`: global provider wiring
- `lib/posts-context.tsx`: feed state and realtime subscription logic
- `lib/db.ts`: Supabase read/write helpers and moderation queries
- `lib/supabase.ts`: client initialization
- `lib/guardian/`: Guardian runtime modules
- `lib/guardian.ts`: Guardian export surface
- `lib/ai.ts`: simulated review layer
- `lib/reporting.ts`: report reason normalization and summaries
- `db/migrations/20260306_guarded_writes_and_abuse_events.sql`: guarded write
  RPCs and abuse-event schema
- `components/PostCard.tsx`, `components/PrayerModal.tsx`,
  `components/PrayerListModal.tsx`: feed interaction surfaces
- `components/reference/*`: archived references, not mounted product UI

## Non-Goals

- Public profiles or identity-based social features
- Comment threads, follows, or ranking loops
- Presenting simulated review behavior as production moderation AI
- Treating heart reactions as social status

## Success Metrics

- Share-flow completion rate
- Prayer response rate
- Crisis interception rate
- PII interception and redaction rate
- Guarded-write rejection rate by reason
- Realtime sync latency for posts, prayers, and hearts
- Report submission success rate
- Moderation triage responsiveness
