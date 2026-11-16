"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { OperatorSelector } from "@/components/operator-selector";
import { AreaSelector } from "@/components/area-selector";
import { Toast, type ToastMessage } from "@/components/toast";
import { saveLocalMeasurement } from "@/components/local-store";
import { TEST_PREVIEW_CONFIG } from "@/components/constants";
import type { Operator } from "@/contracts/domain";
import type { Measurement } from "@/contracts/measurements";
import {
  SignalWaveIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@/components/icons";

type CheckState = "idle" | "latency" | "download" | "completed" | "cancelled";

export default function NetworkCheckPage() {
  const [operator, setOperator] = useState<Operator>("mtn");
  const [areaId, setAreaId] = useState<string>("ikeja");
  const [mobileDataConfirmed, setMobileDataConfirmed] = useState<boolean>(true);
  const [vpnSetting, setVpnSetting] = useState<"no" | "yes" | "unknown">("no");

  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [currentLatency, setCurrentLatency] = useState<number | null>(null);
  const [currentThroughput, setCurrentThroughput] = useState<number | null>(null);
  const [completedMeasurement, setCompletedMeasurement] = useState<Measurement | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartCheck = () => {
    if (!mobileDataConfirmed) return;

    setCheckState("latency");
    setProgress(20);
    setCurrentLatency(null);
    setCurrentThroughput(null);
    setCompletedMeasurement(null);

    timerRef.current = setTimeout(() => {
      // Phase 1 Latency simulation
      const sampledLatency = Math.floor(45 + Math.random() * 25);
      setCurrentLatency(sampledLatency);
      setCheckState("download");
      setProgress(60);

      timerRef.current = setTimeout(() => {
        // Phase 2 Download simulation
        const sampledThroughput = Number((10.5 + Math.random() * 9.5).toFixed(1));
        setCurrentThroughput(sampledThroughput);
        setProgress(100);
        setCheckState("completed");

        const now = new Date().toISOString();
        const fakeId = `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0")}` as const;
        const fakeRecordId = `00000000-0000-4000-8000-${(Date.now() + 1).toString(16).padStart(12, "0")}` as const;

        const record: Measurement = {
          id: fakeId,
          client_record_id: fakeRecordId,
          provenance: "app_measured",
          summary: {
            method_version: TEST_PREVIEW_CONFIG.METHOD_VERSION,
            endpoint_id: TEST_PREVIEW_CONFIG.ENDPOINT_ID,
            endpoint_region: "africa-lagos-1",
            context: {
              operator,
              area_id: areaId || null,
              mobile_data_confirmed: mobileDataConfirmed,
              vpn: vpnSetting,
            },
            observed_start: now,
            observed_end: new Date(Date.now() + 3000).toISOString(),
            received_at: new Date(Date.now() + 3050).toISOString(),
            state: "completed",
            latency: { state: "completed", value: sampledLatency, unit: "ms" },
            download: { state: "completed", value: sampledThroughput, unit: "Mbps" },
            upload: { state: "not_run", value: null, unit: "Mbps" },
            corroboration: "client_only",
            receipt_version: null,
            quality_flags: [{ code: "receipt_missing", scope: "record" }],
            assessed_at: now,
          },
          contribution: {
            state: "off",
            revision: 1,
            notice_version: null,
            changed_at: now,
            publication_effect: "not_contributing",
          },
          created_at: now,
          expires_at: new Date(Date.now() + 90 * 86400_000).toISOString(),
        };

        setCompletedMeasurement(record);
        saveLocalMeasurement(record);
      }, 1500);
    }, 1200);
  };

  const handleCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCheckState("cancelled");
    setProgress(0);
    setToast({
      id: "cancel",
      type: "info",
      title: "Test Cancelled",
      message: "Measurement aborted before completion. No data recorded.",
    });
  };

  const handleSaveToEvidence = () => {
    if (completedMeasurement) {
      saveLocalMeasurement(completedMeasurement);
      setToast({
        id: "saved-evidence",
        type: "success",
        title: "Added to Private Evidence Ledger",
        message: "Record stored in your browser for dispute dossier compilation.",
      });
    }
  };

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title & Clear Purpose */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 items-start gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-100 text-blue-800">
              <SignalWaveIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Network Check
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900">
            Simulated in this milestone
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Measure application-layer HTTP latency and download throughput under transparent, capped parameters.
        </p>
      </div>

      {/* Pre-Flight Diagnostic Parameters */}
      <section aria-labelledby="preflight-title" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 id="preflight-title" className="font-bold text-base text-slate-900">
              Pre-Flight Parameters & Disclosures
            </h2>
            <p className="text-xs text-slate-500">Configure observation context before starting the check.</p>
          </div>
          <span className="font-mono text-xs text-slate-500">Method {TEST_PREVIEW_CONFIG.METHOD_VERSION}</span>
        </div>

        {/* Capped Bounds Notice */}
        <div className="grid gap-3 sm:grid-cols-3 text-xs text-slate-700">
          <div className="rounded-md bg-slate-50 p-3 border border-slate-200/80">
            <span className="font-bold text-slate-900 block">Data Consumption</span>
            <span className="text-slate-600">{TEST_PREVIEW_CONFIG.DATA_CAP_LABEL}</span>
          </div>
          <div className="rounded-md bg-slate-50 p-3 border border-slate-200/80">
            <span className="font-bold text-slate-900 block">Timeout Bound</span>
            <span className="text-slate-600">{TEST_PREVIEW_CONFIG.TIMEOUT_LABEL}</span>
          </div>
          <div className="rounded-md bg-slate-50 p-3 border border-slate-200/80">
            <span className="font-bold text-slate-900 block">Execution Mode</span>
            <span className="text-slate-600">Simulated browser client</span>
          </div>
        </div>

        {/* Milestone Disclosure Banner */}
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertCircleIcon className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="leading-relaxed">
            <strong className="font-semibold">Simulated Telemetry Milestone: </strong>
            In this local engineering milestone, telemetry runs entirely as an in-browser simulation. No live production endpoints are contacted, and results are labeled as simulated.
          </div>
        </div>

        {/* Parameters: Operator & LGA */}
        <div className="space-y-4 pt-1">
          <OperatorSelector
            value={operator}
            onChange={setOperator}
            disabled={checkState === "latency" || checkState === "download"}
          />

          <AreaSelector
            value={areaId}
            onChange={setAreaId}
            disabled={checkState === "latency" || checkState === "download"}
          />

          {/* Mandatory Mobile Data Confirmation */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mobileDataConfirmed}
                onChange={(e) => setMobileDataConfirmed(e.target.checked)}
                disabled={checkState === "latency" || checkState === "download"}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block text-sm">
                  I confirm this device is currently connected via cellular mobile data (not Wi-Fi)
                </span>
                <span className="text-slate-500 leading-relaxed block mt-0.5">
                  Web browsers cannot cryptographically read physical cellular radio signal strength. Your confirmation provides the observation context.
                </span>
              </div>
            </label>
          </div>

          {/* VPN Exclusion Setting */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
            <label htmlFor="vpn-setting" className="font-medium text-slate-700">
              VPN or Private Relay state:
            </label>
            <select
              id="vpn-setting"
              value={vpnSetting}
              onChange={(e) => setVpnSetting(e.target.value as "no" | "yes" | "unknown")}
              disabled={checkState === "latency" || checkState === "download"}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
            >
              <option value="no">VPN Inactive (Direct Cellular Path)</option>
              <option value="yes">VPN Active (Alters Latency Path)</option>
              <option value="unknown">Unknown / Not Sure</option>
            </select>
          </div>
        </div>

        {/* Trigger Button */}
        <div className="pt-2">
          {checkState === "idle" || checkState === "cancelled" || checkState === "completed" ? (
            <button
              type="button"
              onClick={handleStartCheck}
              disabled={!mobileDataConfirmed}
              className="w-full min-h-[48px] rounded-md bg-[#064E3B] px-5 py-3 font-semibold text-white shadow-xs hover:bg-[#022C22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <SignalWaveIcon className="h-5 w-5" aria-hidden="true" />
              <span>{checkState === "completed" ? "Run Another Test Pass" : "Start Bounded Network Check"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full min-h-[48px] rounded-md border border-rose-300 bg-rose-50 px-5 py-3 font-semibold text-rose-900 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
              <span>Cancel Check ({checkState === "latency" ? "Phase 1: Latency" : "Phase 2: Download"})</span>
            </button>
          )}
        </div>
      </section>

      {/* Live Progress Stage */}
      {(checkState === "latency" || checkState === "download") && (
        <section aria-live="polite" className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-900 uppercase tracking-wide">
              {checkState === "latency" ? "Phase 1: Sampling HTTP Request Latency..." : "Phase 2: Sampling Bounded Download Throughput..."}
            </span>
            <span className="font-mono font-semibold text-blue-800">{progress}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-blue-200 overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-blue-800/80">
            {checkState === "latency"
              ? "Exchanging non-cached HTTP request samples to measure application-layer round-trip time."
              : "Transferring bounded non-compressible samples to observe throughput."}
          </p>
        </section>
      )}

      {/* Completed Results */}
      {checkState === "completed" && completedMeasurement && (
        <section aria-labelledby="results-title" className="rounded-xl border-2 border-slate-900 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                SIMULATED PREVIEW RESULT
              </span>
              <h2 id="results-title" className="text-xl font-bold text-slate-900 mt-1">
                Measured Connection Summary
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {new Date(completedMeasurement.created_at).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos" })}
            </span>
          </div>

          {/* Key Metric Readouts */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                HTTP Latency
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums">
                  {currentLatency}
                </span>
                <span className="text-sm font-semibold text-slate-500">ms</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Application round-trip time for HTTP requests. Not an ICMP ping.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Download Throughput
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums">
                  {currentThroughput}
                </span>
                <span className="text-sm font-semibold text-slate-500">Mbps</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Observed download throughput for this bounded sample only.
              </p>
            </div>
          </div>

          {/* Integrity Metadata Table */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Observation Context:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-600">
              <div>Operator: <strong className="text-slate-900 uppercase">{operator}</strong> (User reported)</div>
              <div>Area: <strong className="text-slate-900 uppercase">{areaId}</strong> (Lagos LGA)</div>
              <div>Mobile Data: <strong className="text-slate-900">User confirmed</strong></div>
              <div>Corroboration: <strong className="font-mono text-slate-900">client_only</strong></div>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
              Status: <code className="bg-white px-1 py-0.5 rounded">receipt_missing (synthetic development preview)</code>. Does not qualify for public aggregation.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveToEvidence}
              className="flex-1 min-h-[46px] rounded-md border border-[#064E3B] bg-emerald-50 px-4 py-2.5 font-semibold text-xs text-[#064E3B] hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
              <span>Save to Evidence Ledger</span>
            </button>

            <Link
              href={`/incidents?operator=${operator}&area=${areaId}`}
              className="flex-1 min-h-[46px] rounded-md bg-[#064E3B] px-4 py-2.5 font-semibold text-xs text-white hover:bg-[#022C22] transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <span>Log Incident with this Result</span>
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
