# GraceFul Task List

## Foundation and UI

- [x] Set up a Next.js 15 + React 19 + TypeScript project.
- [x] Define the theme in `tailwind.config.ts` and `app/globals.css`.
- [x] Create reusable UI primitives for buttons, badges, cards, and textareas.
- [x] Build the feed-first shell in `app/page.tsx`.
- [x] Add a first-session onboarding modal.

## Posting Flow

- [x] Add emotion selection for `grateful` and `struggling`.
- [x] Add category selection.
- [x] Add message entry with 40-800 character constraints.
- [x] Add support-preference selection.
- [x] Add translation-permission selection.
- [x] Add a review step before final submission.
- [x] Add a success state that returns users to the feed.

## Safety and Guardian

- [x] Add crisis detection.
- [x] Add profanity detection.
- [x] Add violent-intent detection.
- [x] Add lexicon-backed multilingual harm detection.
- [x] Add PII detection and scrubbing for posts.
- [x] Reuse Guardian protection for prayer submission.
- [x] Add a local cooldown check before starting a fresh share.
- [x] Surface crisis and warning states in dedicated UI screens.

## Feed and Prayer Interaction

- [x] Seed the feed with local anonymous posts.
- [x] Render post cards with emotion, category, time, and prayer count.
- [x] Add a prayer modal for eligible posts.
- [x] Add a prayer viewer for posts with existing prayers.
- [x] Update prayer counts locally after a prayer is submitted.
- [x] Show working local translation rendering when a post allows translation.

## Guardian Review and Prototype Support

- [x] Simulate Guardian review behavior in `lib/ai.ts`.
- [x] Add a development-only test dashboard with scenario injection.
- [x] Update `prd.md`, `claude.md`, `planning.md`, and `tasks.md` to match the
  current app structure.

## Cleanup and Alignment

- [x] Unify the post and prayer models across `app/page.tsx`, `types/index.ts`,
  and related components.
- [x] Archive the older share and feed prototypes under `components/reference/`.
- [ ] Eliminate duplicated product assumptions across active and secondary
  prototypes.

## Persistence and Backend

- [ ] Replace client-only post state with persistent storage.
- [ ] Replace client-only prayer count updates with persistent prayer records.
- [ ] Move final submission and moderation decisions behind a server boundary.
- [ ] Replace simulated Guardian review with a real service or server action.

## Quality and Release Readiness

- [x] Add unit tests for `lib/guardian.ts`.
- [x] Add integration coverage for the full posting flow.
- [x] Add tests for prayer submission safety behavior.
- [x] Run lint and fix issues caused by model drift or dead prototype files.
- [ ] Confirm development-only tooling does not ship into production UX.
