# GraceFul QA Resolved Items
Date: 2026-03-07

This list captures issues found in the 2026-03-06 QA audit that are no longer present after the fix pass.

## Resolved Issues

1. **Test dashboard exposed in the feed route**
   - Before: `TestDashboard` was imported and rendered unconditionally in `/feed`.
   - Now: `app/feed/page.tsx` only loads it when `NEXT_PUBLIC_ENABLE_TEST_DASHBOARD === "true"` and uses a dynamic import.

2. **Unsafe realtime hearts sync**
   - Before: the posts `UPDATE` realtime handler synced by `id` even when the payload did not explicitly include `hearts`.
   - Now: `lib/posts-context.tsx` skips the sync unless the payload includes a `hearts` field.

3. **Runtime debug logs left in app code**
   - Before: standalone `console.log` calls existed in `lib/posts-context.tsx` and `lib/app-flow.ts`.
   - Now: both confirmed runtime logs were removed, and the QA scan reported no `console.log` matches under `lib/` or `components/`.

4. **UI language support overstated**
   - Before: the product declared `hil` and `es` as supported UI languages even though dedicated UI copy was missing for them.
   - Now: the selectable UI language set is narrowed to `en`, `tl`, and `ceb`, which matches the implemented UI copy.

## Verified Outcomes

- `npm run build`: PASS
- `npm test`: PASS (`47` passed, `0` failed)
- `console.log` scan: CLEAN

## Source Reports

- Audit: `docs/qa/qa-report-2026-03-06.md`
- Fix pass: `docs/qa/qa-fix-pass-2026-03-06.md`

## Still Noted But Not Included Here

These audit items were not listed as resolved in the fix pass:

- Realtime handler `: any` typing in `lib/posts-context.tsx`
- User-facing `account` copy flagged for human review
