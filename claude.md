# GraceFul Development Rules

## Project Overview

GraceFul is an anonymous prayer wall focused on gratitude, struggle, prayer,
and safe sharing. The product should feel calm and supportive, not social,
performative, or identity-driven.

## Current Repo Reality

The active product experience is split across routed surfaces:

- `app/page.tsx` is the landing page
- `app/feed/page.tsx` is the mounted feed and share flow
- `app/admin/page.tsx` is the moderation surface

Other current architecture rules:

- `app/layout.tsx` wraps the app in `PostsProvider`
- `lib/posts-context.tsx` is the main client-side source of truth for feed
  state
- Posts, prayers, post reports, prayer reports, and heart counts are persisted
  through Supabase helpers in `lib/db.ts`
- Writes use guarded Supabase RPCs for posts, prayers, and reports
- Supabase Realtime syncs post insert/update/delete and prayer insert/delete
- Guardian runtime enforcement lives in `lib/guardian/` and is re-exported
  through `lib/guardian.ts`
- Review-step messaging still uses simulated logic from `lib/ai.ts`
- `api/guardian.ts` is only a thin helper wrapper today, not the live posting
  boundary
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
   Content must pass crisis, PII, profanity, malicious-intent, and spam checks
   before it is accepted.
5. **Crisis Takes Priority**
   If crisis language is detected, interrupt the flow and show support
   resources instead of continuing normally.
6. **Guarded Writes Stay Canonical**
   Post, prayer, and report creation must continue to flow through guarded
   Supabase RPCs, not direct unguarded inserts.
7. **Prototype Accuracy**
   Do not describe simulated review behavior as production-ready moderation
   infrastructure.
8. **Realtime Safety**
   Realtime handlers must defensively guard `payload?.new` and `payload?.old`
   before using event data.
9. **Moderation Access**
   Treat `/admin` key-based access as temporary. Do not present it as secure
   role-based authentication.
10. **Deduplicate Safety Data**
    Before adding new Guardian phrases, aliases, or regex alternatives, check
    existing entries first and merge without introducing duplicates.
11. **Be Honest About Design Tokens**
    Do not point implementation work at `docs/design-system/TOKENS.md` unless
    that file actually exists. In the current repo, styling tokens live in
    `app/globals.css` and related config until a dedicated token doc is restored.

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
- Prefer clear functional React components and local state for UI interaction.
- Keep Guardian rules centralized in `lib/guardian/`.
- Keep Guardian false-positive controls aligned with threat-detection updates.
- Keep data reads and writes centralized through `lib/db.ts` and
  `lib/posts-context.tsx` rather than scattering Supabase calls through UI
  components.
- Keep realtime handlers idempotent and defensive so duplicate or partial
  events do not break the feed.
- Preserve the current route split between `/`, `/feed`, and `/admin`.
- Keep abuse-event visibility in mind when changing guarded-write behavior.
- Keep hearts as persisted counters; avoid local-only heart behavior.
- Keep translation behavior honest: UI language support is `en`, `tl`, and
  `ceb`, while generated content translations are broader but not fully exposed
  in the feed UI.

## File Conventions

- Put routed UI in `/app`.
- Keep reusable flow and feed components in `/components`.
- Keep data access, Guardian logic, reporting, translation, and support logic
  in `/lib`.
- Keep shared product types in `/types`.
- Keep SQL changes in `/db/migrations`.
- Keep development-only fixtures and scenario data in dedicated helper files.
- Keep Guardian reference specs in `docs/guardian/` and runtime enforcement in
  `lib/guardian/`.

## Testing Expectations

- Keep `npm run build` passing.
- Keep `npm test` passing when Guardian, reporting, translation, prayer, or
  flow helpers change.
- Verify prayer submission uses the same protection standards as post creation.
- Add coverage for guarded-write or abuse-event behavior when backend contracts
  change.
- Add coverage for future realtime state-management bug fixes.
- Keep development-only helpers like `TestDashboard` gated out of production.

## Documentation Rule

When implementation changes materially, update these files together:

- `prd.md`
- `planning.md`
- `tasks.md`
- `claude.md`
