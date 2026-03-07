# GraceFul QA Fix Pass Report
Date: 2026-03-06

## Summary
| Fix Area | Status | Notes |
|---|---|---|
| Fix 1 — TestDashboard gate | DONE | Feed route now gates `TestDashboard` behind `NEXT_PUBLIC_ENABLE_TEST_DASHBOARD === "true"` and uses a dynamic import |
| Fix 2 — Hearts update guard | DONE | Posts realtime `UPDATE` handler now requires an explicit `hearts` field in the payload |
| Fix 3 — `console.log` removal | DONE | Removed the two confirmed standalone `console.log` calls |
| Fix 4 — UI language narrowing | DONE | Declared/selectable UI languages are now `en`, `tl`, `ceb` |
| Build | PASS | `npm run build` completed successfully |
| Tests | PASS | 47 passed, 0 failed |
| `console.log` scan | CLEAN | No `console.log` matches under `lib/` or `components/` |
| GitHub ready | YES | Scoped changes only; build and tests are green |

## Files Changed

### `app/feed/page.tsx`
- Replaced the static `TestDashboard` import with a dynamic import.
- Wrapped the render so it only mounts when `process.env.NEXT_PUBLIC_ENABLE_TEST_DASHBOARD === "true"`.
- Left `TestDashboard` component internals unchanged.

### `lib/posts-context.tsx`
- Updated the posts realtime `UPDATE` handler to return early unless `event?.new?.id` exists and the payload explicitly contains `hearts`.
- Removed the realtime subscription status `console.log`.
- Left all other realtime handlers unchanged.

### `lib/app-flow.ts`
- Removed the standalone escalation-request `console.log`.
- Left the surrounding flow logic unchanged.

### `lib/constants.ts`
- Narrowed `SUPPORTED_LANGUAGES` to `en`, `tl`, and `ceb`.

### `types/index.ts`
- Added `UiLanguageCode` for declared/selectable UI languages.
- Preserved `LanguageCode` as a broader union so existing translation/reference data for `hil` and `es` remains type-safe without editing out-of-scope files.

## Implementation Notes

### Fix 1 — TestDashboard gate
- The feed route previously imported and rendered `TestDashboard` unconditionally.
- The route now blocks loading and rendering unless `NEXT_PUBLIC_ENABLE_TEST_DASHBOARD === "true"`.
- The component still keeps its existing internal gate on `NEXT_PUBLIC_SHOW_DEBUGGER === "1"`, so both conditions must allow rendering.

### Fix 2 — Hearts update guard
- The previous realtime posts `UPDATE` handler synced by `id` and used `event.new.hearts ?? post.hearts`.
- The handler now skips the event entirely when the payload does not explicitly include a `hearts` field.

### Fix 3 — `console.log` removal
- Removed:
  - Realtime status log in `lib/posts-context.tsx`
  - Escalation-request log in `lib/app-flow.ts`
- No replacement logging or comments were added.

### Fix 4 — UI language narrowing
- The audit issue was about overstated UI support, not translation data deletion.
- `SUPPORTED_LANGUAGES` now exposes only `en`, `tl`, and `ceb`.
- `UiLanguageCode` was introduced so the UI can narrow correctly while translation/reference code can continue holding partial `hil` and `es` data untouched.

## Verification

### Build
- `npm run build`: PASS

### Tests
- `npm test`: PASS
- Result: 47 passed, 0 failed

### `console.log` scan
- Command: `rg -n "console\\.log" lib components`
- Result: no matches

### Scope check
- Intended code changes are limited to:
  - `app/feed/page.tsx`
  - `lib/posts-context.tsx`
  - `lib/app-flow.ts`
  - `lib/constants.ts`
  - `types/index.ts`
- QA documentation added:
  - `docs/qa/qa-fix-pass-2026-03-06.md`

## Final Confirmation
```text
Fix 1 (TestDashboard gate): DONE
Fix 2 (hearts field check): DONE
Fix 3 (console.log removal): DONE
Fix 4 (language narrowing): DONE

Build: PASS
Tests: PASS (47 passed, 0 failed)
Console.log scan: CLEAN

GitHub ready: YES
```
