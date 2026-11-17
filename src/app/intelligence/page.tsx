"use client";

import { useState } from "react";
import { AreaSelector } from "@/components/area-selector";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { OPERATOR_OPTIONS } from "@/components/constants";
import type { Operator } from "@/contracts/domain";
import {
  ChartBarIcon,
  AlertCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
} from "@/components/icons";

export default function IntelligencePage() {
  const [operator, setOperator] = useState<Operator>("mtn");
  const [areaId, setAreaId] = useState<string>("ikeja");
  const [metric, setMetric] = useState<"download" | "latency">("download");
  const [showDemoLayout, setShowDemoLayout] = useState<boolean>(false);

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-100 text-blue-800">
              <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Network Intelligence
            </h1>
          </div>
          <ProvenanceBadge provenance="app_measured" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Screened, privacy-protected public network summaries for Lagos State. Strictly aggregated across Monday-to-Monday observation cohorts.
        </p>
      </div>

      {/* Publication & Privacy Principles */}
      <section aria-labelledby="principles-title" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <LockClosedIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
          <h2 id="principles-title" className="font-bold text-sm text-slate-900">
            Publication Integrity & Consumer Safeguards
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-xs text-slate-600">
          <div className="rounded-md bg-slate-50 p-3 space-y-1 border border-slate-200/80">
            <span className="font-bold text-slate-900 block">No Single-Score Rankings</span>
            <span>We never crown a &quot;Best Network&quot; or &quot;Worst Network&quot;. We report statistical distributions (25th percentile, median, 75th percentile).</span>
          </div>

          <div className="rounded-md bg-slate-50 p-3 space-y-1 border border-slate-200/80">
            <span className="font-bold text-slate-900 block">Sparse Cohort Suppression</span>
            <span>Cohorts require a minimum threshold of independent contributors before release. Underpopulated areas are withheld to prevent re-identification.</span>
          </div>

          <div className="rounded-md bg-slate-50 p-3 space-y-1 border border-slate-200/80">
            <span className="font-bold text-slate-900 block">Screened Samples Only</span>
            <span>Only controlled application checks passing receipt corroboration qualify for public summaries. Synthetic data never publishes.</span>
          </div>
        </div>
      </section>

      {/* Cohort Query Filters */}
      <section aria-labelledby="filter-title" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <h2 id="filter-title" className="font-bold text-sm text-slate-900">
          Lagos Geographic & Network Query
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="intel-op" className="text-xs font-semibold text-slate-700 block mb-1">
              Mobile Operator
            </label>
            <select
              id="intel-op"
              value={operator}
              onChange={(e) => setOperator(e.target.value as Operator)}
              className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
            >
              {OPERATOR_OPTIONS.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <AreaSelector value={areaId} onChange={setAreaId} id="intel-lga" />
          </div>

          <div>
            <label htmlFor="intel-metric" className="text-xs font-semibold text-slate-700 block mb-1">
              Metric Dimension
            </label>
            <select
              id="intel-metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value as "download" | "latency")}
              className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
            >
              <option value="download">Download Throughput (Mbps)</option>
              <option value="latency">HTTP Latency (ms)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="font-mono text-slate-500">
            Observation Cohort: Mon 2026-11-09 to Sun 2026-11-15 (Lagos State)
          </span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDemoLayout}
              onChange={(e) => setShowDemoLayout(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
            />
            <span className="font-medium text-slate-700">
              Inspect Synthetic Demonstration Layout
            </span>
          </label>
        </div>
      </section>

      {/* Cohort Status Presentation */}
      {!showDemoLayout ? (
        /* Honest Unavailable / Withheld State */
        <section aria-labelledby="status-title" className="rounded-xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-900">
            <AlertCircleIcon className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="space-y-1 max-w-lg mx-auto">
            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              Status: Unavailable for this Cohort
            </span>
            <h2 id="status-title" className="text-xl font-bold text-slate-900 pt-2">
              Insufficient Qualified Data for {operator.toUpperCase()} in {areaId}
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              No publishable observations exist for this LGA cohort. In accordance with SignalPulse privacy rules, public metrics remain withheld until sufficient independent contributors pass verification gates.
            </p>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 max-w-md mx-auto text-left text-xs space-y-1.5 text-slate-600">
            <span className="font-bold text-slate-900 block">Why is data withheld?</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>We do not fabricate numbers to populate an empty chart.</li>
              <li>Synthetic development fixtures never qualify for public metrics.</li>
              <li>Toggle &quot;Inspect Synthetic Demonstration Layout&quot; above to review the presentation format.</li>
            </ul>
          </div>
        </section>
      ) : (
        /* Synthetic Layout Demonstration */
        <section aria-labelledby="demo-title" className="rounded-xl border-2 border-slate-900 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                DEVELOPMENT DEMONSTRATION ONLY
              </span>
              <h2 id="demo-title" className="text-xl font-bold text-slate-900 mt-1">
                Lagos Distribution Format Preview
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500">Method browser-http-0.1</span>
          </div>

          {/* Statistical Distribution Percentiles */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                25th Percentile (p25)
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums mt-1 block">
                {metric === "download" ? "7.2" : "64"}
              </span>
              <span className="text-xs text-slate-500">{metric === "download" ? "Mbps" : "ms"}</span>
            </div>

            <div className="rounded-lg border-2 border-[#064E3B] bg-emerald-50/50 p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#064E3B] block">
                Median Performance
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-bold text-[#064E3B] tabular-nums mt-1 block">
                {metric === "download" ? "14.8" : "42"}
              </span>
              <span className="text-xs font-bold text-[#064E3B]">{metric === "download" ? "Mbps" : "ms"}</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                75th Percentile (p75)
              </span>
              <span className="font-mono text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums mt-1 block">
                {metric === "download" ? "21.4" : "29"}
              </span>
              <span className="text-xs text-slate-500">{metric === "download" ? "Mbps" : "ms"}</span>
            </div>
          </div>

          {/* Sample Metadata */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5 text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CheckCircleIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
              <span>Sample Classification & Limitations:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Classification: <strong className="font-mono text-slate-900">screened_voluntary_sample</strong></div>
              <div>Aggregation Version: <strong className="font-mono text-slate-900">aggregate-0.1</strong></div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
              Voluntary application-layer samples do not constitute an exhaustive census of all cellular subscribers.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
