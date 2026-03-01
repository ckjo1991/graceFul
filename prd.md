# GraceFul Product Requirements Document

## Executive Summary

GraceFul is an anonymous prayer wall designed around two emotional entry
points: gratitude and struggle. The product should help a user move from a
private feeling to a shareable prayer request in a calm, non-performative,
and safety-conscious flow.

## Current Prototype Status

The repository currently implements a prototype of the core experience:

- A dual-path entry screen
- A client-side share-flow state machine
- Local Guardian moderation and crisis detection
- A read-only prayer feed backed by sample data

The prototype does not yet include persistence, real translation or wording
assistance, or end-to-end prayer submission.

## Product Goal

GraceFul should let a user share what they are carrying in as few steps as
possible while maintaining anonymity, spiritual focus, and clear safety
interventions when distress language appears.

## Core Product Principles

- Anonymous by default
- Prayer over performance
- Safety before posting
- Simplicity over social features
- Support for Philippine languages and dialects

## Core Features

### Dual-Path Entry

Users begin by choosing one of two emotional entry points:

- Grateful
- Struggling

This choice frames the rest of the flow and should remain the first required
decision in the product.

### Structured Categories

Every shared post must be assigned to one life-area category:

- Financial
- Family
- Personal
- Work
- Other

These categories organize the wall without introducing identity, ranking, or
debate.

### Guardian Safety Layer

Every post must pass through a moderation layer before submission. Guardian
must:

- Enforce message length rules
- Detect crisis or self-harm language
- Remove obvious personally identifying details such as names, phone numbers,
  and specific locations

The current codebase does this locally. A later version may move that logic to
server-side processing or external services.

### Crisis Intervention

If a message suggests self-harm, crisis, or acute emotional danger, the normal
posting flow must pause and prioritize support resources, including:

- NCMH Crisis Hotline: 1553
- Hopeline

This intervention has priority over normal post completion.

### Language and Wording Support

GraceFul should offer optional support for clearer expression without changing
meaning:

- Translation across English, Tagalog, and Bisaya
- Wording refinement that preserves the user’s intent

In the current prototype, the user can express preference for these options,
but the actual service behavior is not yet implemented.

### Prayer-Centered Interaction

Other users should be able to respond with prayer rather than debate. Allowed
interaction is intentionally narrow:

- Pray for this
- Write a short prayer response

The product must not drift into open comment threads, reactions, or social
performance loops.

## Functional Requirements

- Users must be able to complete the share flow without creating an account or
  exposing identity.
- Posts must enforce a minimum length of 40 characters and a maximum length of
  800 characters.
- Moderation and crisis checks must occur before final submission.
- Translation and wording assistance must remain optional and user-invoked.
- The product must not display likes, follower counts, reaction totals, or
  similar social metrics.
- Prayer responses must be text-based and supportive rather than conversational
  or argumentative.

## Technical Requirements

### Platform

- Next.js App Router
- React client components where local step-state is required
- TypeScript for shared product models

### Current UI Composition

- `app/page.tsx` currently acts as the first emotional choice surface
- `components/sharing/share-flow.tsx` contains the deeper structured share flow
- `components/feed/prayer-feed.tsx` contains the community-wall prototype

The shipped product experience should compose these surfaces coherently rather
than leaving them as disconnected prototypes.

### Visual Direction

- Clean, calm interface with a nature-inspired aesthetic
- Shared palette defined through the `COLORS` constant
- Theme tokens and typography should remain aligned across
  `tailwind.config.ts` and `app/globals.css`
- No gamified or attention-seeking interaction patterns

### Flow Definition

The share flow should follow this state order:

- welcome
- category
- message
- support
- translate_opt
- wording
- done

### Data Direction

- Anonymous posts and prayers should eventually move from seeded sample data to
  a persistence layer
- Shared types must remain consistent across the feed, share flow, and
  moderation logic

## Non-Goals

- Public identities or user profiles
- Likes, rankings, or popularity mechanics
- Debate threads or open comment discussions
- Social networking behavior unrelated to prayer support

## Success Metrics

- Share-flow completion rate
- Prayer participation rate once prayer submission is implemented
- Moderation interception rate for crisis and PII cases
- Low friction from first screen to completed anonymous post
