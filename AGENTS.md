# GraceFul — AGENTS.md

Anonymous sharing and prayer app. Built for real people processing real things.
Read this file fully before touching any code, running any query, or proposing any fix.

---

## Project Identity

| | |
|---|---|
| App | GraceFul |
| Purpose | Anonymous emotional sharing and prayer support |
| Live URL | graceful-space.vercel.app |
| Admin URL | graceful-space.vercel.app/admin?key=graceful-admin-2026 |
| Local path | /Users/ckjobcena/Documents/project_GraceFul |
| Repo | Public GitHub → auto-deploys on push to main |

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS (utility-first, no CSS modules) |
| Database | Supabase (Postgres + Realtime + RLS) |
| Hosting | Vercel (auto-deploy from GitHub) |
| Identity | Anonymous — no accounts, no login |
| Device ID | `graceful_device_id` stored in localStorage |

---

## File Map

### App routes
```
app/
  page.tsx                  — Landing page
  feed/page.tsx             — Main feed (filters, post list)
  admin/page.tsx            — Admin panel (key-gated)
  layout.tsx                — Root layout, providers
```

### Components
```
components/
  PostCard.tsx              — Post display + hearts + report
  PrayerListModal.tsx       — Prayer modal per post
  CommunityNudge.tsx        — Toast nudge system
```

### Library
```
lib/
  posts-context.tsx         — Global post state + Realtime subscriptions
  db.ts                     — All Supabase queries (single source of truth)
  supabase.ts               — Supabase client init
  guardian.ts               — Harm detection logic
  harm-lexicon.json         — Blocked terms list
  nudge-engine.ts           — Nudge trigger logic
  constants.ts              — Shared constants
```

### Types
```
types/
  index.ts                  — FeedPost, Prayer, and other shared types
```

---

## Data Model

### FeedPost (key fields)
```ts
{
  id: string
  emotion: "grateful" | "struggling"
  category: "Financial" | "Family" | "Health" | "Work" | "Personal"
  message: string
  support: "prayer" | "just_sharing" | "both"
  createdAt: string
  deviceId?: string
  wantsFollowUp: boolean
  hearts: number
  allowTranslation: boolean
  prayers: Prayer[]
}
```

### Narrative label logic
```ts
if (emotion === "grateful") return `Grateful for ${category}`
if (emotion === "struggling") return `Struggling with ${category}`
```

---

## Coding Rules

### Always
- Read the relevant file before proposing any change
- Route all Supabase queries through `lib/db.ts` — never call Supabase directly inside components
- Use TypeScript types from `types/index.ts` — do not inline types
- Follow Tailwind utility-first — no inline styles, no new CSS files
- Scope component state locally — do not lift state unless it must be shared across routes
- Confirm file location before injecting any code

### Never
- Rewrite logic that is not broken
- Assume a fix without reading the actual code first
- Create new Supabase clients outside `lib/supabase.ts`
- Expose secrets or keys in client-side code beyond what is already accepted (`NEXT_PUBLIC_ADMIN_KEY` is the known exception)
- Add dependencies without flagging them for review

---

## Session Order

Every work session follows this sequence unless explicitly told otherwise:

1. Codex tasks — code fixes and feature work
2. Supabase tasks — SQL, RLS, schema changes (done after code is confirmed)
3. Manual tasks — testing, verification, prod checks

Do not move to Supabase before Codex work is confirmed.
Do not skip to testing before Supabase changes are applied.

---

## Debug Protocol

Before writing any fix or proposing any change:

1. Read the relevant file(s) — identify the exact function and behavior
2. Name the root cause — file, function, what it does wrong
3. Check for side effects — what else could break
4. Propose the fix — minimal, targeted, does not touch unrelated code
5. Flag manual verification steps — what needs checking after deploy

---

## Known Bugs

| Bug | Location | Status |
|---|---|---|
| Heart/reaction state resets on page refresh | PostCard.tsx, posts-context.tsx | Open — fix: persist in localStorage keyed by `graceful_device_id` |
| Mobile WebSocket drops when tab is backgrounded | lib/posts-context.tsx | Open — reconnection logic not implemented |
| UPDATE handler fires for any column change on posts | lib/posts-context.tsx | Known — current handler only syncs `hearts`, others ignored |

---

## Known Pitfalls

| Pitfall | Detail |
|---|---|
| Supabase Realtime payload | Event callback receives payload directly — `event` IS the payload. Never use `event.payload` |
| Hearts not syncing | Requires UPDATE handler on posts table — INSERT/DELETE alone is not enough |
| `isReported` bleed | Was shared state at parent level — now scoped inside PostCard |
| Dev seed guard | Seeds only if DB is empty — verify condition logic if prod data is wiped |
| No rate limiting | Public insert policies with no custom rate limiting on Supabase |

---

## Z-Index Hierarchy

| Layer | Value |
|---|---|
| Post cards | z-0 |
| Sticky header | z-10 |
| Mobile bottom nav | z-20 |
| Community nudge toast | z-30 |
| Report backdrop | z-40 |
| Report modal | z-50 |

Do not introduce a new z-index value without checking this table first.

---

## Skill Usage

### Before any feature or behavior change
Trigger the `brainstorming` skill first. Do not jump to implementation.

```
Use brainstorming skill. I want to [describe feature].
Context: GraceFul — Next.js 15, Supabase, anonymous users, graceful_device_id.
```

### Before any design or UI work
Trigger `figma` skill if a Figma file exists for the component.
Then trigger `figma-implement-design` to convert it to Tailwind + React.

```
Use figma skill to get [component name] from [Figma URL].
Then use figma-implement-design to generate the Tailwind + TypeScript implementation.
Match the existing PostCard.tsx structure and z-index hierarchy.
```

### For debugging
State the symptom, the file, and what you expect vs what happens.

```
Bug: [symptom]
File: [filename]
Expected: [what should happen]
Actual: [what is happening]
Do not rewrite unrelated code.
```

### After implementation is confirmed
```
Use vercel-deploy to deploy to graceful-space.vercel.app.
Confirm deployment URL and check for build errors.
```

---

## Deployment

```bash
cd /Users/ckjobcena/Documents/project_GraceFul
git add .
git commit -m "[type]: short description"
git push
# Vercel auto-deploys in 1–2 min
```

Commit message types: `fix`, `feat`, `refactor`, `chore`, `style`

---

## Feature Request Protocol

When Ces proposes a new feature:

1. Trigger `brainstorming` skill — do not skip this
2. Ask one clarifying question at a time
3. Propose 2–3 implementation approaches with tradeoffs
4. Wait for approach approval before writing any code
5. Confirm which files will be touched before starting
6. Implement in the smallest working increment
7. Flag what needs manual verification after deploy

Apply YAGNI — if a proposed addition is not required for the stated goal, flag it.

---

## What Codex Should Not Do

- Do not redesign the anonymous identity model (no accounts, no login — this is intentional)
- Do not add new npm packages without listing them and asking for approval first
- Do not modify `lib/harm-lexicon.json` without being asked explicitly
- Do not change RLS policies without listing the exact SQL and confirming
- Do not deploy to Vercel until code changes are reviewed and confirmed
