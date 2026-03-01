"use client";

import React from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface GuardianWarningProps {
  reason: "pii" | "malice";
  onRedo: () => void;
}

export default function GuardianWarning({
  reason,
  onRedo,
}: GuardianWarningProps) {
  const content = {
    pii: {
      title: "Protecting your peace",
      message:
        "The Guardian noticed personal details, like a full name, phone number, email, or social handle, in your message. To keep you anonymous and safe, please remove those details before posting.",
      button: "Edit my message",
    },
    malice: {
      title: "Let's keep it GraceFul",
      message:
        "GraceFul is a space for healing and peace. Some words in your message do not align with the tone we protect here. Please try rephrasing it with kindness.",
      button: "Try again",
    },
  } as const;

  const selected = content[reason];

  return (
    <div className="mx-auto w-full max-w-md animate-in fade-in zoom-in duration-300">
      <div className="rounded-3xl border-2 border-accent/20 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bg-warm">
          <ShieldAlert className="h-8 w-8 text-primary" />
        </div>

        <h2 className="mb-4 text-2xl font-serif font-bold text-primary-dark">
          {selected.title}
        </h2>

        <p className="mb-8 text-sm leading-relaxed text-slate-600">
          {selected.message}
        </p>

        <button
          onClick={onRedo}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.98]"
        >
          <RefreshCw className="h-4 w-4" />
          {selected.button}
        </button>
      </div>
    </div>
  );
}
