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
  const [showSyntheticPreview, setShowSyntheticPreview] = useState<boolean>(false);

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF] text-[#1D4ED8]">
            <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#121514] sm:text-3xl">
            Network Intelligence
          </h1>
          <ProvenanceBadge provenance="app_measured" />
        </div>
        <p className="text-sm leading-relaxed text-[#3F4946]">
          Qualified, privacy-screened public summaries for Lagos State mobile networks. Aggregated strictly across Monday-to-Monday cohorts.
        </p>
      </div>

      {/* Anti-Misrepresentation & Publication Rules */}
      <div className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <LockClosedIcon className="h-4 w-4 text-[#0C4A3E]" aria-hidden="true" />
          <h2 className="text-sm font-bold text-[#121514]">
            Ethical Measurement & Publication Safeguards
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-xs text-[#3F4946]">
          <div className="rounded bg-[#F4F3F0] p-3 space-y-1">
            <span className="font-semibold text-[#121514] block">No Arbitrary Rankings</span>
            <span>We never assign &quot;Best Network&quot; or &quot;Worst Network&quot; badges. We publish distributions (p25, median, p75).</span>
          </div>
          <div className="rounded bg-[#F4F3F0] p-3 space-y-1">
            <span className="font-semibold text-[#121514] block">Sparse Cohort Suppression</span>
            <span>A minimum of 10 distinct pseudonymous contributors is required. Sparse cells are automatically withheld.</span>
          </div>
          <div className="rounded bg-[#F4F3F0] p-3 space-y-1">
            <span className="font-semibold text-[#121514] block">No Accusations from Correlation</span>
            <span>We never infer carrier billing fraud or deliberate throttling from throughput drops alone.</span>
          </div>
        </div>
      </div>

      {/* Cohort Filter Controls */}
      <section aria-labelledby="filter-heading" className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
        <h2 id="filter-heading" className="font-bold text-sm text-[#121514]">
          Lagos Area & Operator Query
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="intel-op-select" className="text-xs font-semibold text-[#3F4946] block mb-1">
              Operator
            </label>
            <select
              id="intel-op-select"
              value={operator}
              onChange={(e) => setOperator(e.target.value as Operator)}
              className="w-full min-h-[44px] rounded border border-[#64706C]/40 bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#121514]"
            >
              {OPERATOR_OPTIONS.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <AreaSelector value={areaId} onChange={setAreaId} id="intel-area-select" />
          </div>

          <div>
            <label htmlFor="intel-metric-select" className="text-xs font-semibold text-[#3F4946] block mb-1">
              Metric Dimension
            </label>
            <select
              id="intel-metric-select"
              value={metric}
              onChange={(e) => setMetric(e.target.value as "download" | "latency")}
              className="w-full min-h-[44px] rounded border border-[#64706C]/40 bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#121514]"
            >
              <option value="download">Download Throughput (Mbps)</option>
              <option value="latency">Application HTTP Latency (ms)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E5E2DC] text-xs">
          <span className="font-mono text-[#64706C]">
            Observation Cohort: Mon 2026-11-09 to Sun 2026-11-15 (Lagos)
          </span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSyntheticPreview}
              onChange={(e) => setShowSyntheticPreview(e.target.checked)}
              className="h-4 w-4 rounded border-[#64706C] text-[#0C4A3E] focus:ring-[#0C4A3E]"
            />
            <span className="font-medium text-[#121514]">
              Inspect Synthetic Telemetry Layout
            </span>
          </label>
        </div>
      </section>

      {/* Cohort Status Display */}
      {!showSyntheticPreview ? (
        /* Canonical Unavailable / Withheld State */
        <section aria-labelledby="status-heading" className="rounded-xl border border-dashed border-[#E5E2DC] bg-[#FFFFFF] p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF3C7] text-[#92400E]">
            <AlertCircleIcon className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2.5 py-1 rounded">
              Status: Unavailable (Withheld)
            </span>
            <h2 id="status-heading" className="text-xl font-bold text-[#121514] pt-2">
              Insufficient Qualified Data for this Cohort
            </h2>
            <p className="max-w-md mx-auto text-xs leading-relaxed text-[#64706C]">
              No publishable observations exist for <strong>{operator.toUpperCase()}</strong> in <strong>{areaId}</strong>. To safeguard privacy and prevent misrepresentation, public metrics require at least 10 distinct contributing owners before publication.
            </p>
          </div>

          <div className="rounded-md border border-[#E5E2DC] bg-[#F4F3F0] p-4 max-w-lg mx-auto text-left text-xs space-y-1.5 text-[#3F4946]">
            <span className="font-bold text-[#121514] block">Canonical Publication Rules:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Synthetic development fixtures never qualify for public metrics.</li>
              <li>Only screened voluntary samples passing receipt corroboration qualify.</li>
              <li>Toggle &quot;Inspect Synthetic Telemetry Layout&quot; above to preview visual presentation.</li>
            </ul>
          </div>
        </section>
      ) : (
        /* Synthetic Layout Inspection (Preview Only) */
        <section aria-labelledby="synthetic-preview-heading" className="rounded-xl border border-[#0C4A3E] bg-[#FFFFFF] p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2DC] pb-4">
            <div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A]">
                Synthetic Layout Demonstration Only
              </span>
              <h2 id="synthetic-preview-heading" className="text-xl font-bold text-[#121514] mt-1">
                Lagos Telemetry Distribution Preview
              </h2>
            </div>
            <ProvenanceBadge provenance="app_measured" />
          </div>

          {/* Metric Distribution Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-[#E5E2DC] bg-[#FBFBFA] p-4 text-center">
              <span className="text-xs font-semibold uppercase text-[#64706C] block">25th Percentile (p25)</span>
              <span className="font-mono text-3xl font-bold text-[#121514] tabular-nums mt-1 block">
                {metric === "download" ? "6.8" : "68"}
              </span>
              <span className="text-[11px] text-[#64706C]">{metric === "download" ? "Mbps" : "ms"}</span>
            </div>

            <div className="rounded-lg border-2 border-[#0C4A3E] bg-[#E8F2EF] p-4 text-center shadow-xs">
              <span className="text-xs font-bold uppercase text-[#0C4A3E] block">Median Performance</span>
              <span className="font-mono text-3xl font-bold text-[#0C4A3E] tabular-nums mt-1 block">
                {metric === "download" ? "14.2" : "44"}
              </span>
              <span className="text-[11px] font-semibold text-[#0C4A3E]">{metric === "download" ? "Mbps" : "ms"}</span>
            </div>

            <div className="rounded-lg border border-[#E5E2DC] bg-[#FBFBFA] p-4 text-center">
              <span className="text-xs font-semibold uppercase text-[#64706C] block">75th Percentile (p75)</span>
              <span className="font-mono text-3xl font-bold text-[#121514] tabular-nums mt-1 block">
                {metric === "download" ? "22.5" : "28"}
              </span>
              <span className="text-[11px] text-[#64706C]">{metric === "download" ? "Mbps" : "ms"}</span>
            </div>
          </div>

          {/* Quality Indicators & Sample Counts */}
          <div className="rounded-md border border-[#E5E2DC] bg-[#F4F3F0] p-4 text-xs space-y-2 text-[#3F4946]">
            <div className="flex items-center gap-2 font-bold text-[#121514]">
              <CheckCircleIcon className="h-4 w-4 text-[#0C4A3E]" aria-hidden="true" />
              <span>Cohort Integrity & Attribution Metadata</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>Sample Size Band: <strong className="font-mono text-[#121514]">25-50 tests</strong></div>
              <div>Contributing Owners Band: <strong className="font-mono text-[#121514]">10-25 devices</strong></div>
              <div>Quality Classification: <strong className="font-mono text-[#121514]">screened_voluntary_sample</strong></div>
              <div>Aggregation Version: <strong className="font-mono text-[#121514]">aggregate-0.1</strong></div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
