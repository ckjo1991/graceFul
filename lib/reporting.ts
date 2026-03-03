export const REPORT_REASONS = [
  "Harassment or Mockery",
  "Safety Concern",
  "Inappropriate Content",
  "Spam or Scam",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export type ModerationReportRecord = {
  id: string;
  reason: string | null;
  createdAt: string;
};

type ReportReasonInput = {
  reason: string | null;
  createdAt: string;
};

export type ReportReasonSummary = {
  reason: string | null;
  count: number;
  latestCreatedAt: string;
};

function getSortTimestamp(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function normalizeReportReason(reason: string | null | undefined): string | null {
  const normalized = reason?.trim();
  return normalized ? normalized : null;
}

export function getReportReasonLabel(reason: string | null | undefined): string {
  return normalizeReportReason(reason) ?? "Unspecified";
}

export function sortReportsByCreatedAtDesc<T extends { createdAt: string }>(
  reports: T[],
): T[] {
  return [...reports].sort(
    (left, right) =>
      getSortTimestamp(right.createdAt) - getSortTimestamp(left.createdAt),
  );
}

export function summarizeReportReasons(
  reports: ReportReasonInput[],
): ReportReasonSummary[] {
  const summary = new Map<string, ReportReasonSummary>();

  for (const report of reports) {
    const key = normalizeReportReason(report.reason) ?? "__unspecified__";
    const existing = summary.get(key);

    if (existing) {
      existing.count += 1;

      if (
        getSortTimestamp(report.createdAt) > getSortTimestamp(existing.latestCreatedAt)
      ) {
        existing.latestCreatedAt = report.createdAt;
      }

      continue;
    }

    summary.set(key, {
      reason: normalizeReportReason(report.reason),
      count: 1,
      latestCreatedAt: report.createdAt,
    });
  }

  return Array.from(summary.values()).sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return (
      getSortTimestamp(right.latestCreatedAt) -
      getSortTimestamp(left.latestCreatedAt)
    );
  });
}
