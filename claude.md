# GraceFul Development Rules

## Project Overview

GraceFul is an anonymous prayer wall focused on gratitude, struggle, prayer,
and safe sharing. The product should feel calm and supportive, not social,
performative, or identity-driven.

## Current Repo Reality

The active product experience is split across routed surfaces:

- `app/page.tsx` is the landing page
- `app/feed/page.tsx` is the mounted feed and share flow
- `app/admin/page.tsx` is the moderation surface (key-gated)

Other current architecture rules:

- `app/layout.tsx` wraps the app in `PostsProvider`
- `lib/posts-context.tsx` is the main client-side source of truth for feed
  state
- Posts, prayers, reports, prayer reports, and heart counts are persisted
  through Supabase helpers in `lib/db.ts`
- Supabase Realtime is used to sync post insert/update/delete and prayer
  insert/delete into the feed
- Guardian and privacy enforcement live in `lib/guardian.ts`
- The review experience still uses simulated logic from `lib/ai.ts`
- `components/reference/*` are archived references, not mounted product code

## Critical Workflow Rules

1. **Emotion Selection First**
   Any new post must begin with an explicit `grateful` or `struggling`
   selection.
2. **Anonymous by Default**
   Do not add accounts, public identities, profile handles, or personal
   attribution to posts or prayers.
3. **Prayer Over Social Feedback**
   Do not add likes, comments, follower mechanics, or ranking systems.
4. **Guardian Before Publication**
   Content must pass crisis, PII, profanity, and malicious-intent checks before
   it is accepted.
5. **Crisis Takes Priority**
   If crisis language is detected, interrupt the flow and show support
   resources instead of continuing normally.
6. **Prototype Accuracy**
   Do not describe simulated review behavior as production-ready moderation
   infrastructure.
7. **Realtime Safety**
   Realtime handlers must defensively guard `payload?.new` and
   `payload?.old?.id` before using event data, including update events.
8. **Moderation Access**
   Treat `/admin` key-based access as temporary. Do not present it as secure
   role-based authentication.
9. **Deduplicate Safety Data**
   Before adding new Guardian phrases, aliases, or regex alternatives, check
   existing entries first and merge without introducing duplicates.

## Current Step Model

The main product flow in `app/feed/page.tsx` currently uses:

- `feed`
- `emotion`
- `category`
- `message`
- `crisis`
- `warning`
- `support`
- `review`
- `done`

If this state model changes, update the docs in the same pass.

## Code Standards

- Use TypeScript throughout. Do not introduce `any`.
- Prefer clear functional React components and local state for UI-specific
  interaction.
- Keep Guardian rules centralized in `lib/guardian.ts`.
- Keep Guardian false-positive controls (metaphor shields and name/hospital
  redaction safeguards) aligned with threat-detection updates.
- Keep feed data reads and writes centralized through `lib/db.ts` and
  `lib/posts-context.tsx` rather than scattering Supabase calls through the UI.
- Keep realtime handlers idempotent and defensive so duplicate or partial
  events do not break the feed.
- Preserve the current route split between `/`, `/feed`, and `/admin`.
- Avoid drifting shared models in `types/index.ts` away from the mounted app.
- Keep hearts as persisted counters; avoid reintroducing local-only heart
  behavior.
- Keep translation behavior honest: feed-card translation is intentionally
  parked while prayer surfaces can show translated post context.

## File Conventions

- Put routed UI in `/app`.
- Keep reusable flow and feed components in `/components`.
- Keep data access, Guardian logic, reporting, and support logic in `/lib`.
- Keep shared product types in `/types`.
- Keep development-only fixtures and scenario data in dedicated helper files.
- Keep Guardian reference specs in `docs/guardian/` and runtime enforcement in
  `lib/guardian.ts`.

## Testing Expectations

- Keep `npm run build` passing.
- Add or update tests when Guardian, reporting, or flow helpers change.
- Verify prayer submission uses the same protection standards as post creation.
- Add coverage for any future realtime state-management bug fixes.
- Add or update moderation helper coverage when report aggregation changes.
- Keep development-only helpers like `TestDashboard` gated out of production.

## Documentation Rule

When implementation changes materially, update these files together:

- `prd.md`
- `planning.md`
- `tasks.md`
- `claude.md`
