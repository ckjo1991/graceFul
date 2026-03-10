// Re-export shim — preserves all existing import paths.
// Source of truth is now lib/guardian/index.ts
// Do not add logic here.

export {
  canPost,
  checkProfanity,
  checkSafety,
  runGuardian,
  validateMessageLength,
} from "@/lib/guardian/index";

export {
  checkCrisis,
  CRISIS_KEYWORDS,
  PHILIPPINE_RESOURCES,
} from "@/lib/guardian/crisis";

export { analyzeSpam } from "@/lib/guardian/spam";
export { scrubPII } from "@/lib/guardian/pii";
export { hasViolentIntent } from "@/lib/guardian/violent-intent";
