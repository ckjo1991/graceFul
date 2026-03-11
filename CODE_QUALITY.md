# CODE_QUALITY.md

Master instruction file for AI tools (Claude, Codex, Gemini).

When starting any coding session, tell the AI:

```
Read CODE_QUALITY.md and follow its instructions before touching any code.
```

---

## What This File Does

It tells the AI to read three files in order and apply them in sequence:

1. `CODE_SMELLS.md` — find what is wrong
2. `REFACTORING.md` — clean it up
3. `DESIGN_PATTERNS.md` — give it the right structure

Do not skip steps. Do not combine steps. Work through them in order.

---

## Step 1: Audit First (CODE_SMELLS.md)

Before writing or changing any code:

- Read `CODE_SMELLS.md`
- Scan every file relevant to the current task
- List every smell found with: the smell name, the category, the file and line, and the recommended fix
- Do not write any code yet

If no smells are found, say so explicitly. Do not proceed silently.

---

## Step 2: Refactor Second (REFACTORING.md)

After the audit is approved:

- Read `REFACTORING.md`
- Apply fixes one at a time, one type of change per pass
- Confirm the file path before every edit
- List all affected files before starting
- Do not add features during this step

If a fix requires touching a shared utility used in multiple files, stop and flag it before proceeding.

---

## Step 3: Apply Structure Third (DESIGN_PATTERNS.md)

After refactoring is done:

- Read `DESIGN_PATTERNS.md`
- Only suggest a pattern if a recurring structural problem exists
- Name the pattern, explain the specific problem it solves, and list affected files
- Wait for approval before implementing

Do not apply a pattern speculatively. If a simpler solution works, use that instead.

---

## Non-Negotiable Rules Across All Three Steps

These apply at all times, regardless of which step you are on:

- Never assume a file path. Always confirm before editing.
- Never refactor and add a feature in the same pass.
- Never apply more than one type of change per commit.
- Never write code before the audit is reviewed and approved.
- If a change touches more than one module, list all affected files first.
- One step at a time. Get approval before moving to the next step.

---

## Session Workflow

```
You:   Read CODE_QUALITY.md. Here is the code: [paste code or file]
AI:    Runs Step 1 — lists all smells found
You:   Approve, reject, or adjust the findings
AI:    Runs Step 2 — applies refactors one at a time
You:   Approve each change before the next one
AI:    Runs Step 3 — suggests patterns only if needed
You:   Approve before any structural changes are made
```

---

## When to Use Each File Alone

You do not always need all three steps. Use the shortcut that fits your task:

| Task | File to reference |
|---|---|
| "Does this code have problems?" | `CODE_SMELLS.md` only |
| "Clean this up, structure is fine" | `REFACTORING.md` only |
| "What pattern fits this problem?" | `DESIGN_PATTERNS.md` only |
| "Full review before a big feature" | All three via this file |
| "Quick fix, small change" | `REFACTORING.md` only |

---

## Reference

- Code smells: https://refactoring.guru/refactoring/smells
- Refactoring techniques: https://refactoring.guru/refactoring/techniques
- Design patterns: https://refactoring.guru/design-patterns/catalog
