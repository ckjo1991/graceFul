# CODE_SMELLS.md

This file instructs AI tools (Claude, Codex, Gemini) to detect and flag problematic code patterns before writing or suggesting changes.

Before touching any code, scan for the smells listed here. Flag every smell found. State which category it belongs to and what the fix should be. Do not silently work around a smell — surface it first.

Stacks covered: Next.js, React, TypeScript, Python, Supabase, SQL, HTML, CSS, general web.

---

## How to Use This File

At the start of a session, tell the AI:

```
Read CODE_SMELLS.md. Scan the code I share and flag any smells before making changes.
```

The AI will audit first, then propose fixes. You decide which ones to address and in what order.

---

## Category 1: Bloaters

Code that has grown too large to work with comfortably. Usually builds up slowly over time.

---

### Long Method

**What it looks like:**
A function or component that does too many things and is hard to read top to bottom.

**Signal:** More than 20 to 30 lines in a function. Needs scrolling to understand. Hard to name in one phrase.

**Flag if you see:**
```ts
// A function doing: validation + data fetch + formatting + rendering logic all in one
function YachtDashboard() {
  // 80 lines of mixed concerns
}
```

```python
def process_booking(data):
    # validates, calculates price, sends email, updates DB — all in one function
```

**Fix:** Extract smaller functions. Each function should do one thing and be nameable in one phrase.

---

### Large Class or Component

**What it looks like:**
A single file or class handling too many responsibilities.

**Signal:** Over ~200 lines in a React component. Over ~300 lines in a Python class. Multiple unrelated methods grouped together.

**Fix:** Split by concern. Separate data fetching, display logic, and interaction logic into their own files or components.

---

### Primitive Obsession

**What it looks like:**
Using raw strings, numbers, or booleans to represent things that have real meaning in your app.

**Flag if you see:**
```ts
// Bad — what does "1" mean here?
function getStatus(code: number) {
  if (code === 1) return "active";
  if (code === 2) return "pending";
}

// Bad — passing raw strings with domain meaning
function createYacht(type: string, status: string) ...
```

**Fix:** Replace with named types, enums, or constants.
```ts
type YachtStatus = "active" | "pending" | "archived";
type YachtType = "catamaran" | "monohull" | "motor";
```

---

### Long Parameter List

**What it looks like:**
A function that takes more than 3 arguments.

**Flag if you see:**
```ts
function createBooking(yachtId: string, userId: string, start: Date, end: Date, price: number, notes: string)
```

```python
def send_notification(user_id, message, channel, priority, retry_count, template_id):
```

**Fix:** Group related parameters into an object or dataclass.
```ts
function createBooking(params: BookingParams)
```

---

### Data Clumps

**What it looks like:**
The same group of variables appearing together in multiple places, passed around as separate arguments instead of one object.

**Flag if you see:**
```ts
// startDate and endDate always travel together — they should be one object
function getAvailability(yachtId, startDate, endDate) ...
function checkConflicts(bookingId, startDate, endDate) ...
function calculatePrice(rateId, startDate, endDate) ...
```

**Fix:** Wrap the clump into a named type.
```ts
type DateRange = { startDate: Date; endDate: Date };
```

---

## Category 2: Object-Orientation Abusers

Code that misuses or ignores the tools the language gives you for organizing logic.

---

### Switch Statements (or Long If-Else Chains)

**What it looks like:**
A long `switch` or `if/else if` block that checks a type or status and runs different logic for each case. Usually spreads across multiple files.

**Flag if you see:**
```ts
if (yacht.type === "catamaran") {
  // ...
} else if (yacht.type === "monohull") {
  // ...
} else if (yacht.type === "motor") {
  // ...
}
```

**Fix:** If this pattern appears in 3 or more places, consider a lookup map or polymorphism. For TypeScript, a record map is often enough:
```ts
const labelByType: Record<YachtType, string> = {
  catamaran: "Catamaran",
  monohull: "Monohull",
  motor: "Motor Yacht",
};
```

---

### Temporary Field

**What it looks like:**
A field or variable on a class or component that is only set sometimes, and is `null` or `undefined` the rest of the time.

**Flag if you see:**
```ts
// discountCode is only set during checkout, undefined everywhere else
const [discountCode, setDiscountCode] = useState<string | undefined>();
```

**Fix:** Move the field into the specific context where it is actually used. Do not attach it to a broader state object if it only lives in one step.

---

### Refused Bequest

**What it looks like:**
A child class or component that inherits from a parent but ignores most of what the parent provides.

**Flag if you see:** A component extends a base class but overrides almost every method, or receives props it never uses.

**Fix:** Prefer composition. Pass only what is needed. Do not inherit structure that does not apply.

---

### Alternative Classes with Different Interfaces

**What it looks like:**
Two functions or components that do the same job but have different names and signatures, so they cannot be swapped.

**Flag if you see:**
```ts
function fetchYachtData(id: string) ...
function loadYachtInfo(yachtId: string) ... // same thing, different name
```

**Fix:** Standardize the interface. Pick one, rename the other, update all callsites.

---

## Category 3: Change Preventers

Code that makes future edits painful. Changing one thing forces changes in many other places.

---

### Divergent Change

**What it looks like:**
A single file or function that has to be edited for unrelated reasons. Every new feature or fix touches the same file even when the changes are not related.

**Signal:** "Every time we change X, we also have to edit this file."

**Fix:** Split the file by responsibility. Each module should have one reason to change.

---

### Shotgun Surgery

**What it looks like:**
One small change requires editing many files.

**Signal:** Adding a new field to a form requires touching the schema, the type, the component, the API route, and the database query all at once.

**Fix:** Centralize related logic. If a concept is spread across 6 files, consolidate it.

---

### Parallel Inheritance Hierarchies

**What it looks like:**
Every time you add a subclass in one place, you have to add a matching subclass somewhere else.

**Flag if you see:** Two inheritance trees that always grow together (e.g., `YachtRenderer` and `YachtValidator` always adding the same subtypes at the same time).

**Fix:** Merge or eliminate one of the hierarchies. Usually one can be folded into the other.

---

## Category 4: Dispensables

Code that serves no purpose. It adds noise without adding value. Remove it.

---

### Duplicate Code

**What it looks like:**
The same block of logic copied in two or more places.

**Flag if you see:**
```ts
// In BookingCard.tsx
const formattedDate = new Date(date).toLocaleDateString("en-PH", { ... });

// In YachtCard.tsx — exact same block
const formattedDate = new Date(date).toLocaleDateString("en-PH", { ... });
```

**Fix:** Extract into a shared utility function. One source of truth.

---

### Dead Code

**What it looks like:**
Code that is never called, never reached, or commented out.

**Flag if you see:**
```ts
// Old version — remove this
// function calculateOldRate(price) { ... }

function unusedHelper(data) { ... } // nothing calls this
```

```python
if False:
    do_something()  # never runs
```

**Fix:** Delete it. If it is needed later, version control has it.

---

### Lazy Class

**What it looks like:**
A class, component, or file that does almost nothing. It exists but contributes barely anything.

**Flag if you see:** A component file that only wraps one other component with no added logic. A utility file with a single one-line function.

**Fix:** Inline it into the caller. Remove the file.

---

### Speculative Generality

**What it looks like:**
Code written "just in case" it is needed later. Abstract classes, unused parameters, extra configuration options that nothing uses yet.

**Flag if you see:**
```ts
// params.future is never used anywhere
function createYacht(params: { name: string; type: string; future?: unknown })
```

**Fix:** Remove it. Build for what exists now. Add abstractions when the second real use case arrives.

---

### Unnecessary Comments

**What it looks like:**
Comments that explain *what* the code does instead of *why* it does it. If the code is readable, the comment is noise.

**Flag if you see:**
```ts
// Loop through items
for (const item of items) {

// Set the name
yacht.name = newName;
```

**Fix:** Remove the comment. Rename the variable or function so it explains itself. Keep comments only for non-obvious decisions or business rules.

---

## Category 5: Couplers

Code where components or modules are too tangled together. A change in one forces a change in another.

---

### Feature Envy

**What it looks like:**
A function that spends most of its time accessing data from another module instead of its own.

**Flag if you see:**
```ts
// This function lives in BookingService but almost everything it touches is from YachtService
function calculateFee(booking: Booking) {
  const base = booking.yacht.dailyRate;
  const tax = booking.yacht.taxRate;
  const discount = booking.yacht.ownerDiscount;
  return base * tax - discount;
}
```

**Fix:** Move the function closer to the data it uses. This logic probably belongs in `YachtService`.

---

### Inappropriate Intimacy

**What it looks like:**
Two modules that know too much about each other's internal details.

**Flag if you see:** Component A directly reads or writes to the internal state of Component B. A service directly queries the internals of another service's data structure.

**Fix:** Add a clear interface between them. Each module should expose only what others need to know.

---

### Message Chains

**What it looks like:**
A long chain of calls to get to the data you actually need.

**Flag if you see:**
```ts
const country = booking.user.profile.address.country;
const rate = booking.yacht.owner.pricingConfig.baseRate;
```

**Fix:** Add a method or computed property that returns the value directly. Do not reach through multiple layers.

---

### Middle Man

**What it looks like:**
A class or function that does nothing except forward calls to something else.

**Flag if you see:**
```ts
class YachtService {
  getYacht(id: string) {
    return this.yachtRepository.getYacht(id); // just passing through, no logic added
  }
}
```

**Fix:** Call the underlying thing directly, or give the middle layer a real responsibility. Remove it if it adds nothing.

---

### Incomplete Library Class / Utility

**What it looks like:**
A shared utility or helper that almost does what you need, so callers patch around it with extra logic.

**Flag if you see:** The same workaround applied every time a utility is called.

**Fix:** Extend the utility properly instead of patching it at every callsite.

---

## Quick Reference: Smell to Fix Mapping

| Smell | Fix |
|---|---|
| Long Method | Extract smaller functions |
| Large Class | Split by concern |
| Primitive Obsession | Use named types or enums |
| Long Parameter List | Introduce parameter object |
| Data Clumps | Group into a named type |
| Switch Statements | Use a lookup map or polymorphism |
| Temporary Field | Move to the context where it is used |
| Duplicate Code | Extract to shared utility |
| Dead Code | Delete it |
| Lazy Class | Inline or remove |
| Speculative Generality | Remove it |
| Unnecessary Comments | Delete or rename the variable instead |
| Feature Envy | Move the function to where its data lives |
| Message Chains | Add a direct accessor |
| Middle Man | Remove or give it real responsibility |
| Shotgun Surgery | Centralize the scattered logic |
| Divergent Change | Split the file by responsibility |

---

## Reference

Code smell catalog: https://refactoring.guru/refactoring/smells
Refactoring techniques: https://refactoring.guru/refactoring/techniques
