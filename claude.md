# GraceFul Development Rules

## Project Overview

GraceFul is an anonymous prayer wall prototype. It is designed to keep people
focused on prayer, encouragement, and safe sharing rather than identity,
debate, or social performance.

## Current Repo Reality

The active app flow lives in `app/page.tsx`. Treat that file as the main
product shell unless you intentionally migrate the architecture.

- The default screen is the feed, not the share flow.
- A first-session onboarding modal appears before normal use until dismissed.
- Posting is handled through a local step machine inside `app/page.tsx`.
- The review experience uses simulated Guardian review logic from `lib/ai.ts`.
- Guardian and privacy enforcement live in `lib/guardian.ts`.
- Guardian intent detection also depends on the lexicon loader in `lib/lexicon.ts`.
- Prayer submission is local-only and updates counts in client state.
- `components/reference/share-flow.reference.tsx` and
  `components/reference/prayer-feed.reference.tsx` are archived reference
  prototypes, not mounted product code.

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
   Do not describe simulated review behavior as production-ready infrastructure.
   The current `lib/ai.ts` behavior is local demo logic.

## Current Step Model

The main flow in `app/page.tsx` currently uses these states:

- `feed`
- `emotion`
- `category`
- `message`
- `crisis`
- `warning`
- `support`
- `translate_opt`
- `review`
- `done`

If you change this state model, update the docs in the same pass.

## Code Standards

- Use TypeScript throughout. Do not introduce `any`.
- Prefer functional React components and local state where the flow is
  UI-driven.
- Keep product rules centralized in `lib/guardian.ts` and avoid duplicating
  safety logic in multiple places.
- Keep client-side product state understandable; this flow is already complex
  enough without hidden abstractions.
- Preserve the current visual language defined by `tailwind.config.ts`,
  `app/globals.css`, and `lib/constants.ts`.
- Avoid drifting shared models apart. The app currently has both typed shared
  models in `types/index.ts` and local flow-specific models in `app/page.tsx`;
  reduce that duplication rather than adding more.

## File Conventions

- Put main routed UI in `/app`.
- Keep reusable flow screens in `/components`.
- Keep Guardian review and support logic in `/lib`.
- Keep shared product types in `/types`.
- Keep development-only fixtures and scenario data in dedicated helper files
  such as `lib/testData.ts`.

## Testing Expectations

- Add unit coverage for crisis, profanity, PII, and malicious-intent checks.
- Verify the prayer modal uses the same protection standards as post creation.
- Verify the `+ Share` path and return-to-feed path work end to end.
- Keep development-only helpers like `TestDashboard` gated out of production.

## Documentation Rule

When implementation changes materially, update these files together:

- `prd.md`
- `planning.md`
- `tasks.md`
- `claude.md`, when development rules also changed
