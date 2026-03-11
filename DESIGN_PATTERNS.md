# DESIGN_PATTERNS.md

This file instructs AI tools (Claude, Codex, Gemini) on when and how to apply design patterns in this project.

Design patterns are reusable solutions to common structural problems in code. They are not rules to apply everywhere. They are options to reach for when a specific problem appears.

Before suggesting or applying any pattern:
1. Identify the specific problem the pattern solves.
2. Confirm the problem actually exists in the current code.
3. Do not apply a pattern speculatively or to make code look more "engineered."
4. State which pattern you are applying and why, before writing any code.

Stacks covered: Next.js, React, TypeScript, Python, Supabase, general web.

---

## How to Use This File

At the start of a session, tell the AI:

```
Read DESIGN_PATTERNS.md. When suggesting structural changes, identify the pattern by name, explain why it fits, and wait for approval before writing code.
```

Use this file alongside `CODE_SMELLS.md` and `REFACTORING.md`:
- `CODE_SMELLS.md` → find the problem
- `REFACTORING.md` → clean up the code
- `DESIGN_PATTERNS.md` → apply the right structure when a recurring problem needs a proven solution

---

## The Three Categories

Patterns are grouped by what they do:

| Category | Purpose |
|---|---|
| **Creational** | Control how objects or data structures are created |
| **Structural** | Control how things are composed and connected |
| **Behavioral** | Control how things communicate and hand off responsibility |

---

## Creational Patterns

These solve problems around how you create things. Use them when object creation logic is getting complex, repeated, or fragile.

---

### Factory Method

**Problem it solves:** You need to create different types of objects but do not want the caller to know which specific type is being created.

**Use when:** The type of object to create depends on a condition or config, and that condition may grow over time.

```ts
// Instead of:
if (type === "catamaran") return new CatamaranYacht();
if (type === "monohull") return new MonohullYacht();

// Use a factory:
function createYacht(type: YachtType): Yacht {
  const factories: Record<YachtType, () => Yacht> = {
    catamaran: () => new CatamaranYacht(),
    monohull: () => new MonohullYacht(),
  };
  return factories[type]();
}
```

**Do not use when:** There are only 2 types and no expectation of growth. A simple conditional is cleaner.

---

### Abstract Factory

**Problem it solves:** You need to create families of related objects that must be used together, and you want to swap the whole family at once.

**Use when:** You have multiple variants of a UI theme, a data source, or a service layer that need to be swapped as a group.

**Do not use when:** You only have one family. Abstract Factory adds significant complexity. Only reach for it when the second family actually exists.

---

### Builder

**Problem it solves:** Creating an object requires many steps or optional parameters, and doing it in one constructor call is unreadable.

**Use when:** A function or object has 5+ configuration options, some optional.

```ts
// Instead of:
new BookingRequest(yachtId, userId, startDate, endDate, notes, promoCode, guestCount, null, true)

// Use a builder or params object:
const booking = new BookingRequestBuilder()
  .forYacht(yachtId)
  .byUser(userId)
  .from(startDate).to(endDate)
  .withGuests(guestCount)
  .build();
```

**In TypeScript/React:** A plain params object with optional fields is usually enough before reaching for a full Builder class.

**Do not use when:** The object only has 2 to 3 fields. A params object is sufficient.

---

### Prototype

**Problem it solves:** You need to create a copy of an existing object without depending on its class.

**Use when:** You need to duplicate complex objects (deep clones) and the cost of creating from scratch is high.

```ts
// TypeScript — spread is fine for shallow clones
const clonedYacht = { ...originalYacht };

// For deep clones with nested objects:
const clonedYacht = structuredClone(originalYacht);
```

**Do not use when:** A simple spread or `structuredClone` covers it. A formal Prototype class is rarely needed in TypeScript.

---

### Singleton

**Problem it solves:** Ensures only one instance of something exists across the entire app — typically a shared service, config, or connection.

**Use when:** A database connection, logger, or config object must be shared globally and initialized once.

```ts
// Supabase client — classic Singleton use case
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// Import this one instance everywhere. Never call createClient() again.
```

**Warning:** Singletons make testing harder because they carry global state. Use sparingly. In React, consider Context or a module-level export instead of a class-based Singleton.

**Do not use when:** The "singleton" is just a config object. Export a const instead.

---

## Structural Patterns

These solve problems around how parts of your code connect and compose. Use them when the structure of your components, modules, or services is getting tangled.

---

### Adapter

**Problem it solves:** You have two things that need to work together but have incompatible interfaces.

**Use when:** Integrating a third-party API, SDK, or library that uses a different data shape than your app expects.

```ts
// Third-party API returns: { yacht_name, vessel_type, max_guests }
// Your app expects: { name, type, capacity }

function adaptYachtFromAPI(raw: ExternalYacht): Yacht {
  return {
    name: raw.yacht_name,
    type: raw.vessel_type,
    capacity: raw.max_guests,
  };
}
```

**In Next.js:** Adapters belong in `lib/adapters/` or inside the API route that fetches external data. Never adapt data inside a component.

---

### Bridge

**Problem it solves:** You have two dimensions of variation (e.g., type of yacht AND type of pricing model) and do not want to create a class for every combination.

**Use when:** You find yourself creating types like `CatamaranWeeklyPricing`, `MonohullDailyPricing`, `CatamaranDailyPricing` — the combinations are exploding.

**Fix:** Separate the two dimensions. Pass one as a dependency to the other.

**Do not use when:** You only have one dimension of variation. This pattern adds complexity only justified by a combination problem.

---

### Composite

**Problem it solves:** You need to treat individual items and groups of items the same way.

**Use when:** Building tree-like structures — navigation menus, nested comment threads, folder structures, permission hierarchies.

```ts
// Both a single MenuItem and a MenuGroup respond to render()
interface MenuNode {
  render(): JSX.Element;
}

class MenuItem implements MenuNode { ... }
class MenuGroup implements MenuNode {
  children: MenuNode[];
  render() { return <>{this.children.map(c => c.render())}</>; }
}
```

**In React:** Component composition already handles most of what Composite solves. Reach for the formal pattern only when the tree is dynamic and recursive.

---

### Decorator

**Problem it solves:** You want to add behavior to an object without changing its class or creating a subclass.

**Use when:** Adding logging, caching, authorization, or validation to an existing function or service without modifying it.

```ts
// Wrap a service function with caching behavior
function withCache<T>(fn: () => Promise<T>, key: string): () => Promise<T> {
  return async () => {
    const cached = cache.get(key);
    if (cached) return cached;
    const result = await fn();
    cache.set(key, result);
    return result;
  };
}
```

**In React:** Higher-Order Components (HOCs) and custom hooks are the React version of Decorator. Prefer hooks over HOCs for new code.

---

### Facade

**Problem it solves:** A subsystem is complex and you want to expose a simpler interface to it.

**Use when:** You have a set of Supabase queries, auth checks, and data transforms that a component needs to call together. Instead of the component knowing all of that, expose one clean function.

```ts
// lib/services/yachtService.ts — this is a Facade
export async function getYachtDashboardData(yachtId: string) {
  const yacht = await fetchYacht(yachtId);
  const bookings = await fetchBookings(yachtId);
  const analytics = await fetchAnalytics(yachtId);
  return { yacht, bookings, analytics };
}

// Component only calls one thing:
const data = await getYachtDashboardData(id);
```

**This is the most useful pattern for your stack.** Any time a component is making 3 or more related calls, introduce a Facade in `lib/services/`.

---

### Flyweight

**Problem it solves:** You have a large number of similar objects consuming too much memory because they store repeated data.

**Use when:** Rendering hundreds of map pins, table rows, or chart nodes that share common properties.

**In practice:** This is rarely implemented explicitly in React/TypeScript. React's virtual DOM and memoization (`React.memo`, `useMemo`) serve a similar purpose. Flag this pattern only if memory or render performance is a confirmed problem.

---

### Proxy

**Problem it solves:** You want to control access to an object — adding lazy loading, caching, logging, or access checks without changing the object itself.

**Use when:** You need to gate a service call behind an auth check, add request logging, or defer loading until needed.

```ts
// API route proxy — checks auth before passing through
export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return realHandler(req);
}
```

**In Next.js:** Middleware is the built-in Proxy for route-level concerns. Use `middleware.ts` for auth guards instead of repeating the check in every route.

---

## Behavioral Patterns

These solve problems around how objects communicate, hand off work, and react to change.

---

### Chain of Responsibility

**Problem it solves:** A request needs to pass through a series of handlers. Each handler decides whether to process it or pass it along.

**Use when:** Building validation pipelines, middleware chains, or multi-step approval flows.

```ts
// Validation chain — each validator passes or blocks
type Validator = (data: BookingData) => string | null; // returns error or null

const validators: Validator[] = [
  checkDatesNotInPast,
  checkYachtAvailability,
  checkGuestCapacity,
];

function validate(data: BookingData): string | null {
  for (const validator of validators) {
    const error = validator(data);
    if (error) return error;
  }
  return null;
}
```

---

### Command

**Problem it solves:** You want to turn an action into an object so it can be queued, undone, logged, or replayed.

**Use when:** Implementing undo/redo, audit logs, or action queues.

```ts
interface Command {
  execute(): void;
  undo(): void;
}

class UpdateYachtNameCommand implements Command {
  constructor(private yacht: Yacht, private newName: string, private oldName: string) {}
  execute() { this.yacht.name = this.newName; }
  undo() { this.yacht.name = this.oldName; }
}
```

**Do not use when:** The action is simple and one-directional with no need to undo or replay.

---

### Iterator

**Problem it solves:** You want to traverse a collection without exposing how it is structured internally.

**In TypeScript/Python:** Built into the language. `for...of`, `Array.map`, `for item in list` are all iterators. You rarely need to implement this manually.

**Flag it** only if you are building a custom data structure that needs traversal (e.g., a tree, a paginated dataset, a graph).

---

### Mediator

**Problem it solves:** Multiple components or services communicate directly with each other, creating a tangled web. A Mediator sits in the middle and coordinates them.

**Use when:** You have 3 or more components that all need to react to each other's events.

```ts
// Instead of FilterPanel talking directly to YachtList and PriceChart:
// All three talk to a shared useYachtDashboard() hook (the Mediator)

function useYachtDashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const yachts = useFilteredYachts(filters);
  const chartData = usePriceData(filters);
  return { filters, setFilters, yachts, chartData };
}
```

**In React:** A shared custom hook or Context is almost always the Mediator. Reach for formal Mediator language when describing this pattern in code reviews or documentation.

---

### Memento

**Problem it solves:** You need to save and restore the previous state of an object without exposing its internals.

**Use when:** Implementing undo history, draft saving, or rollback on form edits.

```ts
// Save snapshots of form state for undo
const history: FormState[] = [];

function saveSnapshot(state: FormState) {
  history.push(structuredClone(state));
}

function undo(): FormState | undefined {
  return history.pop();
}
```

---

### Observer

**Problem it solves:** When one object changes, other objects need to be notified and updated automatically.

**Use when:** Multiple parts of the UI need to react to the same event or data change.

**In React:** `useState`, `useEffect`, React Context, and tools like Zustand or React Query are all implementations of Observer. You are already using this pattern.

**In Supabase:** Realtime subscriptions are Observer.
```ts
supabase
  .channel("bookings")
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
    // React to new bookings
  })
  .subscribe();
```

---

### State

**Problem it solves:** An object behaves differently depending on its current state, and state transitions need to be managed clearly.

**Use when:** A component or workflow has 3 or more distinct states with different behavior in each (e.g., idle, loading, success, error — or draft, submitted, approved, rejected).

```ts
type BookingState = "idle" | "submitting" | "confirmed" | "failed";

// Each state has different UI and allowed actions
// Avoid scattered boolean flags like isLoading + isError + isSuccess
// Use one state variable instead
const [bookingState, setBookingState] = useState<BookingState>("idle");
```

**Do not use when:** There are only 2 states. A boolean is fine.

---

### Strategy

**Problem it solves:** You want to swap out an algorithm or behavior at runtime without changing the code that uses it.

**Use when:** You have multiple ways to do something (sorting, pricing calculations, export formats) and need to switch between them.

```ts
type PricingStrategy = (base: number, nights: number) => number;

const weeklyRate: PricingStrategy = (base, nights) => base * nights * 0.85;
const dailyRate: PricingStrategy = (base, nights) => base * nights;
const peakRate: PricingStrategy = (base, nights) => base * nights * 1.2;

function calculatePrice(base: number, nights: number, strategy: PricingStrategy) {
  return strategy(base, nights);
}
```

**This is one of the most practical patterns for your stack.** Wherever you have `if season === "peak"` scattered through pricing logic, Strategy cleans it up.

---

### Template Method

**Problem it solves:** Multiple processes share the same steps but differ in how some steps are implemented.

**Use when:** You have 2 or more workflows with the same skeleton but different implementations at specific steps (e.g., different export formats that all go through validate → transform → output).

```ts
// Abstract skeleton
abstract class ReportExporter {
  export(data: ReportData) {
    const validated = this.validate(data);
    const transformed = this.transform(validated);
    return this.output(transformed);
  }

  abstract transform(data: ReportData): unknown;
  abstract output(data: unknown): string;

  validate(data: ReportData) { /* shared logic */ return data; }
}

class CSVExporter extends ReportExporter { ... }
class PDFExporter extends ReportExporter { ... }
```

**In TypeScript:** Abstract classes support this directly. In functional code, pass the variable steps as function arguments instead.

---

### Visitor

**Problem it solves:** You need to perform many different operations on a complex object structure without changing the objects themselves.

**Use when:** You have a tree or graph of objects and need to run analytics, serialization, or validation across all nodes.

**Rarely needed in React/TypeScript frontend work.** Flag this only if you are building a rule engine, AST processor, or document tree walker.

---

## Pattern Selection Guide

Use this when you know you have a problem but are not sure which pattern fits.

| Problem | Pattern to consider |
|---|---|
| Object creation is getting complex or conditional | Factory Method, Builder |
| Need to swap a whole family of objects | Abstract Factory |
| Need to clone objects | Prototype |
| Need one shared instance globally | Singleton |
| Integrating an incompatible third-party API | Adapter |
| Component makes too many service calls | Facade |
| Want to add behavior without changing the original | Decorator |
| Want to gate access to a service | Proxy |
| Multiple components react to the same state | Observer, Mediator |
| Behavior changes based on current state | State |
| Multiple algorithms for the same task | Strategy |
| Need undo / rollback | Memento, Command |
| Validation steps in sequence | Chain of Responsibility |
| Same process, different implementations at some steps | Template Method |

---

## Rules for AI Tools

- Never apply a pattern just because the code looks like it could use one.
- Always state the pattern name and the specific problem it solves before writing code.
- If a simpler solution (a plain function, a params object, a conditional) solves the problem, use that instead.
- Do not stack multiple patterns in one pass. Introduce one at a time.
- If a pattern requires significant restructuring, list all affected files first and wait for approval.

---

## Reference

Design pattern catalog: https://refactoring.guru/design-patterns/catalog
