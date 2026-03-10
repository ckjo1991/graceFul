/**
 * Safely tests a regex against a string without stateful lastIndex bleed.
 * Required because RegExp with /g flag maintains .lastIndex between calls.
 */
export function containsPattern(value: string, pattern: RegExp): boolean {
  const scopedPattern = new RegExp(pattern.source, pattern.flags);
  return scopedPattern.test(value);
}
