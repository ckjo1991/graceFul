# GraceFul Development Rules

## Project Overview
GraceFul is an anonymous prayer wall built to provide a safe space for
vulnerability. It focuses on structured spiritual response through prayers
instead of social debate, public identity, or engagement metrics.

## Current Repo Reality

The current repository is a prototype. When changing code, preserve the
distinction between what is already implemented and what is only planned.

- `app/page.tsx` currently renders a standalone emotional entry screen.
- `components/sharing/share-flow.tsx` contains the richer state-machine flow.
- `components/feed/prayer-feed.tsx` renders seeded posts from
  `lib/sample-posts.ts`.
- `api/guardian.ts` is a local wrapper around `lib/guardian.ts`, not a real
  HTTP API route.
- Translation and wording assistance are represented as captured intent, not as
  completed service integrations.

## Critical Workflow Rules
1. **Emotion Selection First:** Every user journey must begin with an
   explicit choice between `Grateful` or `Struggling`. This frames the post
   and is non-negotiable.
1. **No Identity Storage:** Zero tracking of personal identity. Do not store
   accounts, profiles, names, or other identifying markers.
1. **No Social Metrics:** Do not add likes, engagement counts, reactions, or
   comment threads. The only allowed interaction is a written prayer.
1. **The Guardian Layer:** Every submission must pass through Guardian
   safeguards.
   - **Crisis Detection:** Immediately block and redirect users to
     `NCMH (1553)` or `Hopeline` when self-harm or hopelessness is detected.
   - **PII Scrubbing:** Automatically remove names, phone numbers including
     `09xx` formats, and specific locations before content is stored or shown.
1. **Meaning Preservation:** AI rewording through
   `✨ Help me with wording` may clarify phrasing, but it must not change the
   user's original heart, intent, or meaning.
1. **State Machine Navigation:** The UI must follow the state-driven flow
   `welcome → category → message → support → translate_opt → wording → done`.
1. **Prototype Accuracy:** Do not mark translation, wording help, feed
   filtering, or prayer submission as complete unless the behavior is actually
   wired and testable in the code.

## Code Standards
- **TypeScript Strict Mode:** All new code must be typed. Do not use `any`.
- **Functional Components:** Use React functional components and Hooks such as
  `useState` and `useEffect`.
- **Centralized Styling:** Use the `COLORS` constant for the nature-inspired
  palette, with primary color `#4a7c59`.
- **Validation:** Strictly enforce `MIN_CHARS = 40` and `MAX_CHARS = 800`.
- **Shared Models:** Keep `types/index.ts`, `lib/sample-posts.ts`, and the
  rendered component props aligned. Do not allow sample data and shared types
  to drift apart.
- **Naming Conventions:** Use clear, semantic names such as `resetFlow`,
  `runGuardian`, and `moderateSubmission`.

## File Conventions
- **Components:** Organize UI in `/components`, including areas such as
  `/sharing` and `/feed`.
- **Logic:** Keep AI and moderation logic in `/lib`.
- **Types:** Centralize interfaces and shared types in `/types`.
- **Language:** Manage UI strings through `UI_EN` to support
  multi-dialect translation.
- **App Composition:** Assemble the actual product experience through the
  App Router entrypoints in `/app`.
- **Styling:** Keep theme tokens coherent between `app/globals.css`,
  `tailwind.config.ts`, and `lib/constants.ts`.
- **Docs:** When implementation changes materially, update `prd.md`,
  `planning.md`, and `tasks.md` in the same pass.

## Testing Requirements
- **Moderation Logic:** Add unit tests to verify PII and malicious content are
  flagged or sanitized correctly.
- **Crisis Redirect:** Manually verify that crisis keywords trigger
  `NCMH (1553)` or `Hopeline` resources.
- **Posting Flow:** Add integration tests to confirm a post completes every
  required step before appearing in the feed.
- **Type Consistency:** Add checks or tests that fail when post/prayer sample
  data no longer matches the shared TypeScript model.
