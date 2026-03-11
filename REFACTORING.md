# REFACTORING.md

This file instructs AI tools (Claude, Codex, Gemini) on how to refactor code in this project.
Follow every rule in this file before writing or suggesting any refactored code.

Stacks covered: Next.js, React, TypeScript, Python, Supabase, SQL, HTML, CSS, general web.

---

## Non-Negotiable Rules

These apply to every refactor task, every stack, every time.

- Never refactor and add a feature in the same pass. If you notice a missing feature during a refactor, flag it. Do not implement it.
- Never rename a file and change its logic in the same commit.
- Never assume a file path. Confirm the exact path before modifying anything.
- Never create a new abstraction unless the pattern appears in 3 or more places.
- Never break a working test to make the code cleaner. If a test needs updating, do it in a separate step and say so.
- If a change touches more than one module, list all affected files before writing any code.
- One type of change per commit: extract, rename, move, or simplify. Not a mix.

---

## Before Writing Any Code

Answer these before starting:

1. Is this change purely structural, or does it alter behavior? If it alters behavior, stop and clarify.
2. Does a test exist for this code? If not, say so. Do not proceed without flagging the gap.
3. Does the target function or component have a single responsibility? If not, extract first, then refactor.
4. Is this a shared utility, hook, component, or helper? List every file that imports it.

---

## Composing Methods (All Stacks)

**Extract** a method or function when:
- A block of code can be clearly named
- The same block appears in 2 or more places

**Inline** a function when:
- The body is a single obvious expression
- The abstraction adds no clarity

**Extract a variable** when:
- An expression is complex
- The same expression is used more than once

**Replace temp with a function** when a local variable holds a computed result that could be a reusable query or function.

Do not:
- Extract a function just to reduce line count
- Name anything `handleData`, `processItem`, `doThing`, `utils`, or `helpers`
- Leave a function that needs "and" in its name. Split it.

---

## Composing Methods: Python

```python
# Bad
def process(data):
    result = []
    for item in data:
        if item["active"]:
            result.append(item["value"] * 1.12)
    return result

# Good
def apply_tax(value: float) -> float:
    TAX_RATE = 1.12
    return value * TAX_RATE

def filter_active_values(data: list[dict]) -> list[float]:
    return [apply_tax(item["value"]) for item in data if item["active"]]
```

---

## Composing Methods: TypeScript / React

```ts
// Bad
function YachtCard({ yacht }) {
  const label = yacht.capacity > 10
    ? yacht.type === "catamaran" ? "Large Cat" : "Large Mono"
    : "Standard";
  return <div>{label}</div>;
}

// Good
function getYachtLabel(yacht: Yacht): string {
  if (yacht.capacity <= 10) return "Standard";
  return yacht.type === "catamaran" ? "Large Cat" : "Large Mono";
}

function YachtCard({ yacht }) {
  return <div>{getYachtLabel(yacht)}</div>;
}
```

---

## Organizing Data

**Replace magic numbers and strings with named constants.**

```ts
// Bad
if (score > 80) ...

// Good
const PASSING_SCORE = 80;
if (score > PASSING_SCORE) ...
```

```python
# Bad
if retries > 3: ...

# Good
MAX_RETRIES = 3
if retries > MAX_RETRIES: ...
```

**Replace primitives with typed objects** when a value carries domain meaning.

```ts
type YachtId = string;
type OwnerId = string;
```

**Encapsulate collections.** Do not expose raw arrays directly from a class or module. Return a copy or use a typed getter.

**Replace type codes with union types** in TypeScript.
```ts
type BookingStatus = "confirmed" | "pending" | "cancelled";
```

**Replace type codes with Enums** in Python.
```python
from enum import Enum

class BookingStatus(Enum):
    CONFIRMED = "confirmed"
    PENDING = "pending"
    CANCELLED = "cancelled"
```

---

## Simplifying Conditionals

**Decompose complex conditions into named booleans.**

```ts
// Bad
if (user.role === "admin" && !user.suspended && plan.active) ...

// Good
const canAccessDashboard = user.role === "admin" && !user.suspended && plan.active;
if (canAccessDashboard) ...
```

**Use guard clauses. Return early. Do not nest.**

```ts
// Bad
function process(user) {
  if (user) {
    if (user.active) {
      // logic
    }
  }
}

// Good
function process(user) {
  if (!user) return;
  if (!user.active) return;
  // logic
}
```

```python
# Bad
def process(user):
    if user:
        if user.get("active"):
            # logic

# Good
def process(user):
    if not user:
        return
    if not user.get("active"):
        return
    # logic
```

**Do not** add a ternary inside JSX that spans more than 2 lines. Extract the logic above the return.

**Do not** use `Replace Conditional with Polymorphism` unless there are already 3 or more types and the list is expected to grow.

---

## Simplifying Method Calls

**Rename** when the function name no longer matches what it does. Do this in one commit. Do not leave aliases unless it is a public API.

**Introduce a parameter object** when a function takes more than 3 related arguments.

```ts
// Bad
function createYacht(name: string, type: string, capacity: number, ownerId: string) ...

// Good
function createYacht(params: CreateYachtParams) ...
```

```python
# Bad
def create_booking(yacht_id, user_id, start_date, end_date, price):

# Good
from dataclasses import dataclass
from datetime import date

@dataclass
class BookingParams:
    yacht_id: str
    user_id: str
    start_date: date
    end_date: date
    price: float

def create_booking(params: BookingParams):
```

**Preserve whole objects.** Pass the object, not 4 of its properties.

**Separate query from modifier.** A function either returns data or causes a side effect. Not both.

```ts
// Bad
function getAndSaveUser() ...

// Good
function getUser() ...
function saveUser() ...
```

**Replace error codes with exceptions or typed results.** Do not return `null`, `-1`, or `false` to signal failure.

```ts
// Bad
function getYacht(id): Yacht | null

// Good
function getYacht(id): Yacht  // throws if not found
// or
function getYacht(id): Result<Yacht, NotFoundError>
```

---

## Moving Features

**Move a method** when it uses data from another module more than its own.

**Extract a class or module** when something has grown beyond one responsibility.
- React components over ~200 lines are a signal, not a hard rule.
- Split by concern: data fetching, display logic, interaction logic.

**Hide delegate.** Do not let a component reach through multiple layers for data. Pass the resolved value.

**Do not** move a method without updating every import and callsite. List them first.

---

## Dealing with Generalization

**Extract an interface or type** when two or more components or services share the same shape.

**Prefer composition over inheritance** in both React and Python.

**Pull up** a shared field or method to a parent only when 2 or more children use it identically.

**Push down** when a method is only relevant to one specific variant.

**Do not** create a base class or abstract component unless 3 or more concrete implementations already exist.

---

## Next.js Specific

- Do not convert a Server Component to a Client Component just to add interactivity. Isolate the interactive child into its own Client Component and keep the parent as a Server Component.
- Do not fetch data inside a Client Component when a Server Component can do it.
- Keep `use client` boundaries as deep in the tree as possible.
- Route handlers in `app/api/` must be thin. Move business logic to service files under `lib/` or `services/`.
- Do not put business logic in `layout.tsx` or `page.tsx`.
- Do not co-locate data fetching, transformation, and rendering in the same component. Separate them.

---

## React / TypeScript Specific

- Custom hooks are for reusable stateful logic only. Do not create a hook that is called in exactly one place unless the logic is complex enough to warrant isolation.
- Do not use `useEffect` for data transformation. Derive values from state directly or use `useMemo`.
- Props interfaces must be explicit. Do not use `any`. Do not spread unknown props.
- Do not put conditional logic inside JSX unless it is a single ternary or short-circuit. Extract to a variable or function above the return.

---

## Supabase / SQL Specific

- Do not write Supabase queries inside component files. Move them to `lib/db/` or `lib/queries/`.
- Do not call Supabase directly from a UI component. Use a service layer or custom hook.
- Do not hardcode table names or column names as raw strings in multiple places. Define them as constants.
- Column renames must go through a migration file. Do not patch by updating hardcoded strings across files.
- RLS policies are part of the schema. Do not work around them in application code.
- Avoid `select *` in production queries. Select only the columns you need.

```ts
// Bad
const { data } = await supabase.from("yachts").select("*");

// Good
const { data } = await supabase.from("yachts").select("id, name, type, capacity");
```

---

## Python Specific

- Use type hints on every function signature. No exceptions for new or refactored code.
- Do not use mutable default arguments.

```python
# Bad
def add_item(item, items=[]):

# Good
def add_item(item, items=None):
    if items is None:
        items = []
```

- Replace bare `except:` with specific exception types.
- Use `dataclass` or `TypedDict` instead of passing raw dicts with assumed structure.
- Keep functions under 30 lines. If longer, extract.

---

## HTML / CSS Specific

- Do not use inline styles for anything that belongs in a stylesheet or Tailwind class.
- Do not use `!important` to fix a specificity problem. Fix the selector.
- Class names must describe purpose, not appearance.

```html
<!-- Bad -->
<div class="red-text bold padding-10">

<!-- Good -->
<div class="error-message">
```

- Remove unused CSS classes. Do not comment them out.
- Do not use pixel-based font sizes. Use `rem` or a design token.
- Do not use `id` selectors for styling. Reserve `id` for JS hooks or accessibility.

---

## Commit Discipline

Each refactor commit must:
- Do exactly one type of change: extract, rename, move, or simplify.
- Pass all existing tests without logic changes.
- Use a clear message format:

```
refactor: extract useYachtFilters hook from YachtListPage
refactor: replace magic numbers with STATUS constants in bookingService
refactor: move Supabase queries from YachtCard to lib/queries/yachts
```

Never write:
- `refactor: clean up code`
- `fix + refactor` in the same commit
- Vague messages like `refactor: misc changes`

---

## Stop and Reassess If

- You are renaming more than 5 things in one pass.
- The refactor is taking longer than the original feature would have.
- You are changing a shared utility used in 10 or more files.
- The refactor requires updating types, tests, and UI simultaneously.
- You cannot describe the change in one sentence.

Break it into smaller steps. State what the steps are before starting.

---

## Reference

Refactoring technique catalog: https://refactoring.guru/refactoring/techniques
