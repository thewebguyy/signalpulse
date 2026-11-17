"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function IntelligencePage() {
  const [showSample, setShowSample] = useState(false);

  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Network Insights
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Area comparisons for MTN, Airtel, Glo, and T2mobile across Lagos State.
        </p>
      </div>

      {/* Honest Empty State */}
      <section
        aria-labelledby="insights-empty-title"
        className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4"
      >
        <h2 id="insights-empty-title" className="text-lg font-bold text-slate-900">
          Area insights aren&apos;t ready yet
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 max-w-xl">
          We only show network comparisons when there are enough real, verified checks from people in an area. Since connection testing isn&apos;t live yet, we don&apos;t have area numbers to show right now.
        </p>
        <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          <li>We won&apos;t guess or crown a &ldquo;best network&rdquo; without real data.</li>
          <li>Your personal incident reports are never made public here.</li>
        </ul>

        <div className="pt-2">
          <Link
            href="/incidents"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#064E3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#022C22] transition-colors"
          >
            <span>Report a problem in your area</span>
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Isolated Developer Preview */}
      <details
        className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600"
        open={showSample}
        onToggle={(e) => setShowSample((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer font-semibold text-slate-700 select-none">
          Developer preview: sample area summary format (not real data)
        </summary>
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
          <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded p-2.5">
            Example layout only. These numbers are placeholders to show how verified area ranges will appear once live testing is enabled.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 bg-white border border-slate-200 rounded-lg p-4">
            <div>
              <span className="text-slate-500 block">Lower range (25th)</span>
              <span className="text-lg font-bold text-slate-900">4.2 Mbps</span>
            </div>
            <div>
              <span className="text-[#064E3B] font-semibold block">Typical (Median)</span>
              <span className="text-lg font-bold text-[#064E3B]">11.8 Mbps</span>
            </div>
            <div>
              <span className="text-slate-500 block">Upper range (75th)</span>
              <span className="text-lg font-bold text-slate-900">19.4 Mbps</span>
            </div>
          </div>
        </div>
      </details>
    </main>
  );
}
