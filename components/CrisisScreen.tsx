"use client";

import React from "react";
import { ExternalLink, Heart, Phone } from "lucide-react";

import { PHILIPPINE_RESOURCES } from "@/lib/guardian";
import { getUiCopy } from "@/lib/translation";
import type { LanguageCode } from "@/types";

export default function CrisisScreen({
  onBack,
  language,
}: {
  onBack: () => void;
  language: LanguageCode;
}) {
  const copy = getUiCopy(language);
  return (
    <div className="mx-auto w-full max-w-md animate-in fade-in zoom-in text-center duration-500">
      <div className="rounded-3xl border-2 border-red-100 bg-white p-8 shadow-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <Heart className="h-10 w-10 fill-crisis text-crisis" />
        </div>

        <h2 className="mb-4 text-2xl font-serif font-bold text-slate-900">
          {copy.crisis.title}
        </h2>
        <p className="mb-8 leading-relaxed text-slate-600">
          {copy.crisis.body}
        </p>

        <div className="space-y-4 text-left">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              {copy.crisis.primary}
            </p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">
                  {PHILIPPINE_RESOURCES.ncmh.name}
                </p>
                <p className="text-xl font-serif font-bold text-primary">
                  {copy.crisis.dial} {PHILIPPINE_RESOURCES.ncmh.hotline}
                </p>
              </div>
              <a
                href={`tel:${PHILIPPINE_RESOURCES.ncmh.hotline}`}
                className="rounded-full bg-primary p-3 text-white shadow-lg"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              {copy.crisis.alternative}
            </p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">
                  {PHILIPPINE_RESOURCES.hopeline.name}
                </p>
                <p className="text-sm text-slate-600">
                  {PHILIPPINE_RESOURCES.hopeline.mobile}
                </p>
              </div>
              <a
                href={`tel:${PHILIPPINE_RESOURCES.hopeline.mobile}`}
                className="rounded-full border-2 border-primary p-3 text-primary"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-8 text-sm font-medium text-slate-400 underline transition-colors hover:text-primary"
        >
          {copy.crisis.back}
        </button>
      </div>
    </div>
  );
}
