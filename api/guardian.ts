import { runGuardian } from "@/lib/guardian";

export function moderateSubmission(message: string) {
  return runGuardian(message);
}

