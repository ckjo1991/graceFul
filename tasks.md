# GraceFul Task List

## Foundation and Routing

- [x] Set up a Next.js 15 + React 19 + TypeScript project.
- [x] Define shared styling tokens in the live app styles.
- [x] Create reusable UI primitives for buttons, badges, cards, and textareas.
- [x] Add a landing page at `/`.
- [x] Mount the main product flow at `/feed`.
- [x] Wrap the app in a shared `PostsProvider`.
- [x] Add a moderation route at `/admin` with all-post and reported-content
  views.

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
- [x] Add spam and promo detection.
- [x] Add lexicon-backed multilingual harm detection.
- [x] Expand violent-intent exact lexicon entries and metaphor exceptions.
- [x] Expand PH mobile number detection patterns.
- [x] Add stem-aware threat matching and structural threat gates.
- [x] Add weapon-plus-violent-verb threat pairing checks.
- [x] Add PII detection and scrubbing for posts.
- [x] Expand PII scrubbing for Metro Manila hospital and location references.
- [x] Add marker-triggered and surname-aware name redaction heuristics.
- [x] Reuse Guardian protection for prayer submission.
- [x] Add a local cooldown check before starting a fresh share.
- [x] Surface crisis and warning states in dedicated UI screens.
- [x] Add final posting guard checks before backend write.
- [ ] Replace simulated review with a server-backed moderation decision path.

## Persistence and Realtime

- [x] Add a shared Supabase client in `lib/supabase.ts`.
- [x] Add database read and write helpers in `lib/db.ts`.
- [x] Fetch posts from Supabase on app load.
- [x] Persist new posts to Supabase.
- [x] Persist new prayers to Supabase.
- [x] Guard post creation with rate-limit, duplicate, and spam checks.
- [x] Guard prayer creation with rate-limit, duplicate, and spam checks.
- [x] Guard report creation with duplicate and abuse checks.
- [x] Log abuse events for blocked or suspicious submissions.
- [x] Add Supabase Realtime subscriptions for post inserts and deletes.
- [x] Add Supabase Realtime subscription for post updates (heart sync).
- [x] Add Supabase Realtime subscriptions for prayer inserts and deletes.
- [x] Add null guards to realtime payload handlers to prevent crashes on
  incomplete events.
- [x] Persist heart reactions in Supabase.
- [ ] Verify realtime behavior across devices and remove any temporary debug
  paths that are no longer needed.

## Feed and Prayer Interaction

- [x] Render post cards with emotion, category, time, support intent, and
  prayer count.
- [x] Show and persist heart counts.
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
- [x] Surface abuse-event summaries and recent events in moderation.
- [ ] Harden moderation access control beyond query-key checks.
- [ ] Add explicit moderation action tracking for who deleted what and why.

## Quality and Release Readiness

- [x] Add unit tests for Guardian behavior.
- [x] Add tests for share-flow helpers.
- [x] Add tests for prayer submission safety behavior.
- [x] Add tests for reporting helpers.
- [x] Add tests for translation and content helper behavior.
- [x] Add tests for thank-you variant selection.
- [x] Keep `npm run build` passing after current backend and realtime changes.
- [ ] Add browser-level coverage for realtime feed behavior.
- [ ] Add browser-level coverage for moderation workflow behavior.
- [ ] Confirm development-only tooling does not ship into production UX beyond
  its env gate.

## Documentation and Alignment

- [x] Update `prd.md`, `planning.md`, `tasks.md`, and `claude.md` to match the
  current routed app and Supabase-backed architecture.
- [x] Include guarded-write and abuse-event realities in top-level docs.
- [x] Keep `/admin` limitations explicit in top-level docs.
- [x] Keep UI language support accurate as `en`, `tl`, and `ceb`.
- [ ] Restore a canonical design-token document or remove remaining stale
  references to the missing token doc.
- [ ] Eliminate stale prototype assumptions from remaining reference code and
  comments.
