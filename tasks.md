# GraceFul Task List

## Foundation and Routing

- [x] Set up a Next.js 15 + React 19 + TypeScript project.
- [x] Define the theme in `tailwind.config.ts` and `app/globals.css`.
- [x] Create reusable UI primitives for buttons, badges, cards, and textareas.
- [x] Add a landing page at `/`.
- [x] Mount the main product flow at `/feed`.
- [x] Wrap the app in a shared `PostsProvider`.
- [x] Add a moderation route at `/admin` with tabbed views for all posts and
  flagged content.

## Posting Flow

- [x] Add emotion selection for `grateful` and `struggling`.
- [x] Add category selection.
- [x] Add message entry with product length constraints.
- [x] Add support-preference selection.
- [x] Add a review step before final submission.
- [x] Add a success state that returns users to the feed.
- [x] Add a first-session onboarding modal.
- [x] Add a quiet-return community nudge.

## Safety and Guardian

- [x] Add crisis detection.
- [x] Add profanity detection.
- [x] Add violent-intent detection.
- [x] Add lexicon-backed multilingual harm detection.
- [x] Expand violent-intent exact lexicon entries (EN/PH) and add metaphor exceptions.
- [x] Expand PH mobile number detection patterns.
- [x] Add stem-aware threat matching and direct-threat/malicious-wish structural gates.
- [x] Add weapon-plus-violent-verb threat pairing checks.
- [x] Add PII detection and scrubbing for posts.
- [x] Expand PII scrubbing for Metro Manila hospital/location references and aliases.
- [x] Add marker-triggered and surname-aware name redaction heuristics.
- [x] Reuse Guardian protection for prayer submission.
- [x] Add a local cooldown check before starting a fresh share.
- [x] Surface crisis and warning states in dedicated UI screens.
- [x] Add final posting guard checks before Supabase write.
- [ ] Replace simulated review with a server-backed moderation decision path.

## Persistence and Realtime

- [x] Add a shared Supabase client in `lib/supabase.ts`.
- [x] Add database read and write helpers in `lib/db.ts`.
- [x] Fetch posts from Supabase on app load.
- [x] Persist new posts to Supabase.
- [x] Persist new prayers to Supabase.
- [x] Add Supabase Realtime subscriptions for post inserts and deletes.
- [x] Add Supabase Realtime subscription for post updates (heart sync).
- [x] Add Supabase Realtime subscriptions for prayer inserts and deletes.
- [x] Add null guards to realtime payload handlers to prevent crashes on
  incomplete events.
- [x] Persist heart reactions in Supabase.
- [x] Add temporary realtime debug logging for subscription status and received
  payloads.
- [ ] Verify realtime behavior across devices and remove temporary debug logs.

## Feed and Prayer Interaction

- [x] Render post cards with emotion, category, time, support intent, and
  prayer count.
- [x] Show and persist heart counts for supported post types.
- [x] Add `My Posts` filtering based on the current device.
- [x] Add emotion and topic feed filters.
- [x] Add a prayer modal for eligible posts.
- [x] Add a prayer viewer for posts with existing prayers.
- [x] Sync prayer inserts back into feed state.
- [x] Add localized UI copy for supported viewer languages.
- [ ] Re-enable or redesign feed-card translation display.

## Reporting and Moderation Intake

- [x] Add post reporting flow.
- [x] Persist post reports.
- [x] Add prayer reporting flow.
- [x] Persist prayer reports.
- [x] Build a moderation review UI for stored reports.
- [ ] Harden moderation access control beyond URL key checks.
- [ ] Add explicit moderation action tracking (who/when/why) for deletions.

## Quality and Release Readiness

- [x] Add unit tests for `lib/guardian.ts`.
- [x] Add tests for the share-flow helpers.
- [x] Add tests for prayer submission safety behavior.
- [x] Add tests for reporting helpers.
- [x] Add tests for translation/content helper behavior.
- [x] Add tests for thank-you variant selection.
- [x] Keep `npm run build` passing after realtime fixes.
- [ ] Add browser-level coverage for realtime feed behavior.
- [ ] Add browser-level coverage for moderation workflow behavior.
- [ ] Confirm development-only tooling does not ship into production UX.

## Documentation and Alignment

- [x] Update `prd.md`, `planning.md`, `tasks.md`, and `claude.md` to match the
  current routed app and Supabase-backed architecture.
- [x] Include `/admin` moderation realities and heart persistence status in all
  top-level docs.
- [x] Add Guardian crisis reference spec in `docs/guardian/GUARDIAN_CRISIS_DETECTION_V1.md`.
- [ ] Eliminate stale prototype assumptions from remaining reference code and
  comments.

## Design System

- [x] Extract design system from live UI at graceful-space.vercel.app
- [x] Audit color contrast across all palette pairs (WCAG AA)
- [x] Fix body text contrast: darken --text-body to #555555 (was #6B6B6B, 4.21:1 → 5.89:1)
- [x] Commit design system token reference to docs/design-system/TOKENS.md
- [x] Configure Codex to treat TOKENS.md as forward-only UI source of truth
- [ ] Align existing component files to TOKENS.md token names (incremental — do per component when touched)
- [ ] Audit tailwind.config.ts and globals.css for full token name alignment
