"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { OperatorSelector } from "@/components/operator-selector";
import { AreaSelector } from "@/components/area-selector";
import type { Operator } from "@/contracts/domain";
import { ArrowRightIcon, AlertCircleIcon } from "@/components/icons";

type DemoState = "idle" | "running" | "completed";

export default function NetworkCheckPage() {
  const [operator, setOperator] = useState<Operator>("mtn");
  const [areaId, setAreaId] = useState<string>("ikeja");
  const [demoState, setDemoState] = useState<DemoState>("idle");
  const [sampleLatency, setSampleLatency] = useState<number | null>(null);
  const [sampleSpeed, setSampleSpeed] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRunSample = () => {
    setDemoState("running");
    setSampleLatency(null);
    setSampleSpeed(null);
    timerRef.current = setTimeout(() => {
      setSampleLatency(54);
      setSampleSpeed(14.2);
      setDemoState("completed");
    }, 1000);
  };

  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Network Check
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Check how your mobile connection is performing in Lagos State.
        </p>
      </div>

      {/* Honest Unavailable State */}
      <section
        aria-labelledby="unavailable-title"
        className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircleIcon className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2">
            <h2 id="unavailable-title" className="text-base font-bold text-amber-950">
              Connection testing isn&apos;t available yet
            </h2>
            <p className="text-sm leading-relaxed text-amber-950/90">
              We haven&apos;t connected live test servers yet, so we can&apos;t measure your real speed or response time right now. Rather than show you made-up numbers, we&apos;ve turned testing off until it&apos;s accurate.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/incidents"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-[#064E3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#022C22] transition-colors"
          >
            <span>Report a network problem</span>
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/guidance"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            How to complain to your network
          </Link>
        </div>
      </section>

      {/* Plain-language explanation of what will eventually be tested */}
      <section aria-labelledby="coming-title" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <h2 id="coming-title" className="text-base font-bold text-slate-900">
          What this check will measure when ready
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-600">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">Response time</h3>
            <p className="leading-relaxed">
              How long it takes your phone to reach our test server and get an answer back, measured in milliseconds (ms).
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">Download speed</h3>
            <p className="leading-relaxed">
              How fast a small, fixed-size file downloads over your mobile data, with the data cost shown before you start.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          You will always be able to cancel a test at any time, and tests will only run when you tap Start.
        </p>
      </section>

      {/* Isolated Developer Preview (collapsed by default) */}
      <details className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        <summary className="cursor-pointer font-semibold text-slate-700 select-none">
          Developer preview: sample test layout (not real measurements)
        </summary>
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded p-2.5">
            Sample layout only. Numbers shown below are fixed example values and are never saved to your reports or evidence.
          </p>
          <OperatorSelector value={operator} onChange={setOperator} disabled={demoState === "running"} />
          <AreaSelector value={areaId} onChange={setAreaId} disabled={demoState === "running"} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRunSample}
              disabled={demoState === "running"}
              className="min-h-[44px] rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
            >
              {demoState === "running" ? "Running sample..." : "Preview sample layout"}
            </button>
            {demoState === "completed" && (
              <span className="text-slate-700">
                Sample output: <strong>{sampleLatency} ms</strong> · <strong>{sampleSpeed} Mbps</strong> (not saved)
              </span>
            )}
          </div>
        </div>
      </details>
    </main>
  );
}
