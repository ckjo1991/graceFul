# GraceFul Task List

## Prototype Foundation

- [x] Set up a Next.js 15 + React 19 + TypeScript project structure.
- [x] Add shared constants for colors, message limits, categories, and
  supported languages.
- [x] Configure the theme layer through `tailwind.config.ts` and
  `app/globals.css`.
- [x] Establish base UI primitives for buttons, badges, cards, and textareas.
- [x] Define an initial product brief, planning doc, and development rules.
- [x] Update repo Markdown so requirements, planning, and tasks match the
  current prototype.

## Current Product Work

- [x] Build the dual-path emotional entry screen in `app/page.tsx`.
- [x] Implement the share-flow state machine with ordered steps from welcome
  through done.
- [x] Enforce the 40-800 character rule before moderation can proceed.
- [x] Add local Guardian logic for crisis detection and basic PII scrubbing.
- [x] Capture translation preference and wording-help intent in the share draft.
- [x] Render a prototype prayer feed from local sample data.

## Incomplete or Partially Implemented

- [ ] Mount `ShareFlow` and `PrayerFeed` into the actual page experience.
- [ ] Replace the standalone landing-only behavior in `app/page.tsx` with a
  composed page that reflects the documented product flow.
- [ ] Replace the local Guardian wrapper with a real server/API boundary.
- [ ] Align `types/index.ts` with the fields used by `lib/sample-posts.ts` and
  the share flow.
- [ ] Turn feed filter buttons into working stateful filters.
- [ ] Implement prayer submission instead of showing only seeded prayer data.
- [ ] Implement actual translation behavior instead of storing preference only.
- [ ] Implement actual wording assistance instead of storing intent only.

## Persistence and Safety

- [ ] Design the persistence model for anonymous posts and prayers.
- [ ] Add a database layer to replace `samplePosts`.
- [ ] Add submission rate limiting and abuse controls.
- [ ] Prevent crisis-marked drafts from continuing into a normal publish path.
- [ ] Add validation around stored prayer content, not just initial posts.

## Quality and Release Readiness

- [ ] Add unit tests for Guardian length validation, PII scrubbing, and crisis
  detection.
- [ ] Add integration coverage for the share-flow happy path and support path.
- [ ] Run lint and fix any type/model issues uncovered by stricter checks.
- [ ] Review mobile layout and accessibility for the entry page, share flow,
  and feed.
- [ ] Keep product Markdown in sync with implementation when flow steps or data
  models change.
- [ ] Prepare environment configuration and deployment setup once persistence
  exists.
