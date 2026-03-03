export type NudgeState = {
  hasShownNudge: boolean;
  passivePostCount: number;
  feedViewStartTime: number;
  prayerSubmittedThisSession: boolean;
  isInActiveFlow: boolean;
  lastPostSubmittedAt: number | null;
};

export const nudgeState: NudgeState = {
  hasShownNudge: false,
  passivePostCount: 0,
  feedViewStartTime: Date.now(),
  prayerSubmittedThisSession: false,
  isInActiveFlow: false,
  lastPostSubmittedAt: null,
};

export function shouldShowNudge(): boolean {
  if (nudgeState.hasShownNudge) return false;
  if (nudgeState.isInActiveFlow) return false;
  if (nudgeState.prayerSubmittedThisSession) return false;

  if (
    nudgeState.lastPostSubmittedAt !== null &&
    Date.now() - nudgeState.lastPostSubmittedAt < 10_000
  ) {
    return false;
  }

  const minutesBrowsing = (Date.now() - nudgeState.feedViewStartTime) / 60000;

  if (nudgeState.passivePostCount >= 2) return true;
  if (minutesBrowsing >= 3) return true;

  return false;
}

export function markNudgeShown() {
  nudgeState.hasShownNudge = true;
}
