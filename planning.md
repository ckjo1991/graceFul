# GraceFul Planning Document

## Current Product State

GraceFul is a routed Next.js application with:

- Landing page at `/`
- Main community route at `/feed`
- Admin moderation route at `/admin` (key-gated via query param)

The product is no longer local-only. Supabase is the live source for:

- Posts
- Prayers
- Post reports
- Prayer reports
- Post heart counts

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
- **Safety Engine:** `lib/guardian.ts`
- **Guardian Review Simulation:** `lib/ai.ts`
- **Flow Helpers:** `lib/app-flow.ts`
- **Reporting Helpers:** `lib/reporting.ts`
- **Feed Interaction:** `components/PostCard.tsx`,
  `components/PrayerModal.tsx`, and `components/PrayerListModal.tsx`
- **Onboarding and Retention:** `components/OnboardingModal.tsx` and
  `components/CommunityNudge.tsx`
- **Dev Harness:** `components/TestDashboard.tsx` (dev-only and env-gated)

## Implemented Scope

1. **Routed product shell**
   The app has separate landing, feed, and moderation routes.
2. **Structured share flow**
   Users move through emotion, category, message, support, review, and
   completion.
3. **Guardian enforcement**
   The app blocks or redirects crisis, PII, profanity, and harmful-intent
   content, including stem-aware threat matching, structural threat gates,
   metaphor-shield exceptions, and expanded PH-specific PII scrubbing.
4. **Persistent posts and prayers**
   Feed data is fetched from Supabase rather than living only in browser state.
5. **Realtime feed updates**
   Supabase Realtime is subscribed for post insert/update/delete and prayer
   insert/delete.
6. **Report intake**
   Users can report posts and prayers, and those reports are stored.
7. **Moderation review surface**
   Reported posts and prayers are aggregated and triaged in `/admin`.
8. **Localized interface copy**
   UI strings and category/emotion labels adapt to the selected language.
9. **Retention nudges and onboarding**
   The app tracks a quiet-return nudge and first-session framing.
10. **Heart persistence**
   Heart updates are written to Supabase and synced back through realtime post
   updates.

## Known Gaps

- The Guardian review step is still simulated and local.
- Moderation access is URL-key gated and still lacks robust role-based auth.
- Deletion actions in moderation do not yet have durable audit trails.
- Feed-card translation display remains partially parked even though translation
  data is generated and used in prayer surfaces.
- Realtime delivery is implemented but still under active verification across
  multiple devices.
- The current realtime subscription includes debug logs for status and payload
  inspection and should be cleaned up after verification.
- Archived reference components still exist in `components/reference/`.

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
- `review -> crisis` if simulated analysis escalates to crisis
- `done -> feed` after successful submission

## Delivery Plan

1. **Phase 1: Moderation hardening**
   Move from key-gated access to authenticated roles and add moderation action
   auditability.
2. **Phase 2: Guardian backend boundary**
   Replace simulated review and intent checks with server-backed decisions.
3. **Phase 3: Translation and localization completion**
   Re-enable or redesign post-level translation display so the language model
   data surfaces consistently in the feed.
4. **Phase 4: Realtime hardening**
   Verify cross-device behavior end to end and remove temporary debug logs.
5. **Phase 5: Release hardening**
   Add broader browser-level coverage, production-safe Supabase configuration, and operational
   readiness for deployment.

## Immediate Priorities

- Harden `/admin` access control and moderation accountability.
- Replace simulated Guardian review with server-backed moderation logic.
- Verify cross-device realtime behavior for posts, prayers, and hearts.
- Remove temporary realtime debug logs once verification is complete.

## Guardian References

- Crisis detection reference spec: `docs/guardian/GUARDIAN_CRISIS_DETECTION_V1.md`
