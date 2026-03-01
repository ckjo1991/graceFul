# GraceFul Planning Document

## Current Product State

GraceFul is currently a Next.js 15 prototype for an anonymous prayer wall.
The repository already demonstrates the intended emotional entry flow,
Guardian moderation pass, and a read-only prayer feed, but it does not yet
persist posts or call external AI services.

## Architecture Overview

- **Framework:** Next.js 15 App Router with React 19 and TypeScript.
- **App Shell:** `app/layout.tsx` defines the document metadata and mounts the
  single-page experience.
- **Styling:** Tailwind 4 plus `app/globals.css`, with theme tokens and fonts
  reinforced by `tailwind.config.ts` and the shared `COLORS` constant in
  `lib/constants.ts`.
- **Share Flow:** Client-side state machine in
  `components/sharing/share-flow.tsx` covering
  `welcome -> category -> message -> support -> translate_opt -> wording -> done`.
- **Moderation Layer:** Local Guardian logic in `lib/guardian.ts`, surfaced
  through `api/guardian.ts`.
- **Feed Layer:** Prototype feed in `components/feed/prayer-feed.tsx` backed by
  `lib/sample-posts.ts`.

## Implemented Scope

1. **Dual-path entry**
   Users start by choosing `Grateful` or `Struggling`, which sets the tone for
   the rest of the share flow.
2. **Structured categories**
   The prototype offers `Financial`, `Family`, `Personal`, `Work`, and `Other`
   before message entry.
3. **Guardian checkpoint**
   Messages are length-validated, scanned for crisis language, and scrubbed for
   obvious phone, identity, and location references.
4. **Optional support tools**
   Translation preference and wording-help intent are captured as part of the
   draft flow, but no external translation or rewriting service is wired yet.
5. **Prayer-centered feed**
   The feed renders anonymous sample posts, category labels, and prayer counts
   without likes, identities, or social ranking mechanics.

## Key Files

- `app/page.tsx` contains the current standalone emotion-entry landing view.
- `components/sharing/share-flow.tsx` contains the richer prototype flow that
  should become the main share experience.
- `components/feed/prayer-feed.tsx` contains the current read-only community
  feed surface.
- `lib/constants.ts` defines colors, categories, supported languages, and
  length constraints.
- `lib/sample-posts.ts` defines the seeded feed data currently shown in the UI.
- `types/index.ts` is intended to hold shared models but currently needs to be
  reconciled with the feed and share-flow code.

## Known Gaps

- No persistence layer exists yet. Posts and prayers are still sample data.
- `api/guardian.ts` is a local function wrapper, not a real network/API route.
- The landing page in `app/page.tsx` is disconnected from the richer share-flow
  and feed components.
- Type definitions in `types/index.ts` do not match the fields used by
  `lib/sample-posts.ts`.
- The entry page and the share flow duplicate the same product intent in two
  different UI surfaces instead of one composed experience.
- Translation, wording help, prayer submission, and feed filtering are only
  partially represented in UI and are not end-to-end functional.
- No automated tests are present for Guardian, share flow, or feed behavior.

## Delivery Plan

1. **Phase 1: Prototype consolidation**
   Connect the entry page to the actual share flow and community feed, remove
   duplicate product assumptions, and align shared types with rendered data.
2. **Phase 2: Real submission pipeline**
   Add a proper server boundary for Guardian, persist posts and prayers, and
   define the storage model for anonymous submissions.
3. **Phase 3: Interaction completion**
   Finish feed filtering, prayer submission state, and translation/wording
   actions so the core prayer loop works end to end.
4. **Phase 4: Safety and release readiness**
   Add rate limiting, moderation test coverage, accessibility checks, and
   deployable environment configuration.

## Immediate Priorities

- Merge the current prototype surfaces into a single coherent homepage flow.
- Normalize types for posts, prayers, emotions, and share-draft state.
- Replace sample-only assumptions with a persistence-ready data shape.
- Add tests for message length rules, PII scrubbing, and crisis redirects.
