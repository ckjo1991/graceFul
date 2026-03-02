"use client";

import React from "react";
import { Beaker } from "lucide-react";

import { TEST_SCENARIOS, type TestScenario } from "@/lib/testData";

interface TestDashboardProps {
  onInject: (scenario: TestScenario) => void;
}

export default function TestDashboard({ onInject }: TestDashboardProps) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.NEXT_PUBLIC_SHOW_DEBUGGER !== "1"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-[200px] rounded-2xl border-2 border-primary/20 bg-white/90 p-4 shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
        <Beaker className="w-4 h-4" />
        <span>UX Debugger</span>
      </div>

      <div className="flex flex-col gap-2">
        {TEST_SCENARIOS.map((scenario) => (
          <button
            key={scenario.label}
            onClick={() => onInject(scenario)}
            className="rounded-lg border border-border/50 bg-bg-warm p-2 text-left text-[10px] font-bold text-text transition-colors hover:bg-accent/20"
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-[9px] italic text-muted">Click to auto-fill the current step</p>
    </div>
  );
}
