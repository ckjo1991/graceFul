# GraceFul Product Requirements Document

## Executive Summary

GraceFul is an anonymous prayer wall centered on gratitude, struggle, prayer,
and safety. The product is designed for honest spiritual sharing without public
identity, social performance pressure, or debate-style engagement.

## Current Product Status

The repository currently ships a routed Next.js app with:

- Landing page at `/`
- Main community experience at `/feed`
- Key-gated moderation page at `/admin` (via `?key=<NEXT_PUBLIC_ADMIN_KEY>`)

Shipped capabilities today:

- Feed-first anonymous posting and prayer experience
- First-session onboarding and in-session community nudge
- Multi-step share flow with Guardian checks before publishing
- Supabase persistence for posts, prayers, post reports, and prayer reports
- Realtime subscriptions for post insert/update/delete and prayer insert/delete
- Heart reactions persisted to Supabase and synced through realtime post updates
- Device-scoped `My Posts` filtering
- Post and prayer report submission with reason selection
- Admin moderation UI with:
  - all-post management
  - reported-content triage
  - reason summaries and report counts
  - delete actions for posts and prayers
- Localized UI copy and generated translation variants (`en`, `tl`, `ceb`,
  `hil`, `es`)
- Development-only scenario injector (`TestDashboard`) gated by env flags

Current limitations:

- Guardian review/intent checks are still simulated in `lib/ai.ts`
- Admin access is URL-key gated, not authenticated role-based access
- Feed-card translation display is intentionally parked while language switching
  UX is deferred
- Realtime debug logging is still enabled in `lib/posts-context.tsx`

## Product Goal

Enable people to share gratitude or struggle, receive prayer, and feel held by
a calm and safe community while staying anonymous by default.

## Core Product Principles

- Anonymous by default
- Prayer over performance
- Safety before publication
- Calm and simple interaction design
- Multilingual inclusivity with Philippine-first relevance

## Core Experience

### Entry and Feed

Users enter through `/`, then browse/share at `/feed`.

Each feed post includes:

- Emotion (`grateful` or `struggling`)
- Category
- Message
- Relative timestamp
- Support intent
- Heart count (when applicable)
- Prayer count
- Reporting affordance for non-owned posts

Feed controls include:

- `My Posts` toggle (device-scoped)
- Emotion filters
- Topic filters
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

Mounted at `app/feed/page.tsx`, coordinated through `lib/app-flow.ts`.

### Guardian Safety Layer

Every message is screened for:

- Length constraints
- Crisis indicators
- Profanity
- Violent/malicious intent with structural threat gates
- PII risk and redaction
- Lexicon-backed multilingual harm patterns
- Stem-aware violent verb matching (English and Filipino variants)
- Metaphor-shield exceptions to reduce false positives (for example `dead tired`)
- Expanded hospital/location generalization for Metro Manila references in `scrubPII`
- Marker- and surname-driven name redaction heuristics in `scrubPII`

Primary rules are centralized in `lib/guardian.ts`.

### Crisis Intervention

Crisis-signal messages interrupt normal posting and surface support resources,
including:

- National Center for Mental Health: `1553`
- Hopeline Philippines

### Prayer Response Flow

Prayer replies remain anonymous, safety-checked, and persisted. Prayer list
viewing and prayer reporting are available from feed cards with existing
prayers.

### Reporting and Moderation

Users can report posts and prayers with explicit reasons. Reports persist in
Supabase and can be reviewed in the current admin interface at `/admin`.

### Realtime Sync

Realtime updates currently support:

- Post INSERT
- Post UPDATE (hearts)
- Post DELETE
- Prayer INSERT
- Prayer DELETE

Handlers must remain defensive around missing payload fields and duplicate
events.

## Functional Requirements

- Posting and prayer actions must work without account creation.
- Posts/prayers must not expose identity.
- Crisis content must interrupt share flow.
- Unsafe content (profanity, malice, PII) must be blocked or scrubbed.
- Feed filters must compose cleanly (`emotion`, `topic`, `My Posts`).
- Hearts, prayers, and reports must persist in Supabase.
- Realtime handlers must avoid crashes on partial events.
- Moderation tooling must surface reported posts and prayers with useful
  summaries.

## Technical Requirements

### Platform

- Next.js App Router + React 19 + TypeScript
- Tailwind styling and global design tokens
- Supabase for persistence and realtime events

### Current Architecture

- `app/page.tsx`: landing
- `app/feed/page.tsx`: feed and share flow
- `app/admin/page.tsx`: moderation surface
- `app/layout.tsx`: global provider wiring
- `lib/posts-context.tsx`: feed state and realtime subscription logic
- `lib/db.ts`: Supabase data access and moderation query helpers
- `lib/supabase.ts`: client initialization
- `lib/guardian.ts`: safety and redaction rules
- `lib/ai.ts`: simulated review layer
- `lib/reporting.ts`: report reason normalization/summaries
- `components/PostCard.tsx`, `components/PrayerModal.tsx`,
  `components/PrayerListModal.tsx`: feed interaction surfaces
- `components/reference/*`: archived prototypes, not mounted product UI

## Non-Goals

- Public profiles or identity-based social graph features
- Comment threads, follows, or engagement ranking loops
- Treating simulated Guardian review as production moderation service
- Positioning heart reactions as social status metrics

## Success Metrics

- Share-flow completion rate
- Prayer response rate
- Crisis interception rate
- PII interception/redaction rate
- Realtime sync latency for posts/prayers/hearts
- Report submission success rate
- Moderation triage responsiveness for reported items
