import assert from "node:assert/strict";
import test from "node:test";

import {
  getReportReasonLabel,
  sortReportsByCreatedAtDesc,
  summarizeReportReasons,
  type ModerationReportRecord,
} from "../lib/reporting";

const reports: ModerationReportRecord[] = [
  {
    id: "report-1",
    reason: "Spam or Scam",
    createdAt: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "report-2",
    reason: "Safety Concern",
    createdAt: "2026-03-03T08:00:00.000Z",
  },
  {
    id: "report-3",
    reason: "Safety Concern",
    createdAt: "2026-03-02T08:00:00.000Z",
  },
  {
    id: "report-4",
    reason: null,
    createdAt: "2026-03-04T08:00:00.000Z",
  },
];

test("sortReportsByCreatedAtDesc keeps the newest report first", () => {
  const sorted = sortReportsByCreatedAtDesc(reports);

  assert.deepEqual(
    sorted.map((report) => report.id),
    ["report-4", "report-2", "report-3", "report-1"],
  );
});

test("summarizeReportReasons groups counts and keeps newest grouped reason first", () => {
  const summary = summarizeReportReasons(reports);

  assert.deepEqual(summary, [
    {
      reason: "Safety Concern",
      count: 2,
      latestCreatedAt: "2026-03-03T08:00:00.000Z",
    },
    {
      reason: null,
      count: 1,
      latestCreatedAt: "2026-03-04T08:00:00.000Z",
    },
    {
      reason: "Spam or Scam",
      count: 1,
      latestCreatedAt: "2026-03-01T08:00:00.000Z",
    },
  ]);
});

test("getReportReasonLabel falls back for legacy rows without a stored reason", () => {
  assert.equal(getReportReasonLabel(null), "Unspecified");
  assert.equal(getReportReasonLabel("  "), "Unspecified");
  assert.equal(getReportReasonLabel("Safety Concern"), "Safety Concern");
});
