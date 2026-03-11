# GraceFul Planning Document

## Current Product State

GraceFul is a routed Next.js application with:

- Landing page at `/`
- Main community route at `/feed`
- Admin moderation route at `/admin` gated by `NEXT_PUBLIC_ADMIN_KEY`

The app is Supabase-backed for:

- Posts
- Prayers
- Post reports
- Prayer reports
- Heart counts
- Abuse-event logging

Feed state is managed in `lib/posts-context.tsx` and synchronized through
Supabase Realtime subscriptions.

## Architecture Overview

- **Framework:** Next.js 15 App Router with React 19 and TypeScript
- **Landing Page:** `app/page.tsx`
- **Primary Product Route:** `app/feed/page.tsx`
- **Moderation Route:** `app/admin/page.tsx`
- **App-level Data Provider:** `app/layout.tsx` + `lib/posts-context.tsx`
- **Persistence Layer:** `lib/db.ts`
- **Realtime Client:** `lib/supabase.ts`
- **Guardian Runtime:** `lib/guardian/` and `lib/guardian.ts`
- **Review Simulation:** `lib/ai.ts`
- **Thin API Wrapper:** `api/guardian.ts`
- **Flow Helpers:** `lib/app-flow.ts`
- **Reporting Helpers:** `lib/reporting.ts`
- **Translation Helpers:** `lib/translation.ts`
- **Moderation and Abuse Schema:** `db/migrations/20260306_guarded_writes_and_abuse_events.sql`
- **Feed Interaction:** `components/PostCard.tsx`,
  `components/PrayerModal.tsx`, and `components/PrayerListModal.tsx`
- **Onboarding and Retention:** `components/OnboardingModal.tsx` and
  `components/CommunityNudge.tsx`
- **Dev Harness:** `components/TestDashboard.tsx` gated by
  `NEXT_PUBLIC_ENABLE_TEST_DASHBOARD === "true"`

## Implemented Scope

1. **Routed product shell**
   The app has separate landing, feed, and moderation routes.
2. **Structured share flow**
   Users move through emotion, category, message, crisis or warning,
   support, review, and completion.
3. **Guardian enforcement**
   The app blocks or redirects crisis, profanity, violent intent, spam-like
   language, and risky PII, including Philippine-specific redaction rules.
4. **Guarded backend writes**
   Post, prayer, and report creation use Supabase RPC guards for rate limits,
   duplicate detection, and spam assessment.
5. **Persistent posts and prayers**
   Feed data is fetched from Supabase rather than living only in browser state.
6. **Realtime feed updates**
   Supabase Realtime is subscribed for post insert/update/delete and prayer
   insert/delete.
7. **Report intake**
   Users can report posts and prayers, and those reports are stored through
   guarded RPCs.
8. **Moderation review surface**
   `/admin` aggregates reported posts, reported prayers, reason summaries, and
   recent abuse events.
9. **Localized interface copy**
   The mounted UI supports `en`, `tl`, and `ceb`.
10. **Retention nudges and onboarding**
   The app tracks a first-session framing modal and a quiet-return nudge.
11. **Heart persistence**
   Heart updates are written to Supabase and synced back through realtime post
   updates.

## Known Gaps

- Review-step moderation is still simulated in `lib/ai.ts`.
- `/admin` access is URL-key gated and still lacks authenticated roles.
- Moderation deletions do not yet record moderator identity or rationale.
- Feed-card translation display remains parked even though translation data is
  generated for posts.
- Realtime behavior still needs explicit cross-device verification and cleanup.
- The codebase still contains archived reference components that can confuse
  future changes if treated as live UI.
- Older documentation referenced `docs/design-system/TOKENS.md`, but that file
  is not present in the current repo.

## Active Flow Definition

The mounted feed route currently uses this state order:

- `feed`
- `emotion`
- `category`
- `message`
- `crisis`
- `warning`
- `support`
- `review`
- `done`

Conditional transitions include:

- `message -> crisis` when crisis language is detected
- `message -> warning` when safety checks fail
- `review -> crisis` if simulated review escalates to crisis
- `done -> feed` after successful submission

## Delivery Plan

1. **Phase 1: Moderation hardening**
   Move from query-key access to authenticated moderator roles and add durable
   moderation audit trails.
2. **Phase 2: Guardian backend boundary**
   Replace simulated review-state logic with a real server-backed moderation
   decision path and make `api/guardian.ts` meaningful or remove it.
3. **Phase 3: Translation UX completion**
   Re-enable or redesign feed-level translation display so translation data is
   surfaced intentionally.
4. **Phase 4: Realtime hardening**
   Verify cross-device behavior end to end and remove any remaining temporary
   debug paths.
5. **Phase 5: Documentation and design-source cleanup**
   Restore a canonical design-token reference or remove stale references to the
   missing token doc, and continue pruning archived prototype assumptions.

## Immediate Priorities

- Harden `/admin` access control and moderation accountability.
- Replace simulated Guardian review with a server-backed decision path.
- Verify cross-device realtime behavior for posts, prayers, and hearts.
- Decide on the canonical design-token source of truth and document it clearly.

## Guardian References

- Crisis detection reference spec:
  `docs/guardian/GUARDIAN_CRISIS_DETECTION_V1.md`
- Guardian improvement roadmap:
  `docs/guardian/guardian-improvement-roadmap.md`
