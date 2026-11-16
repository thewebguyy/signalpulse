"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { OperatorSelector } from "@/components/operator-selector";
import { AreaSelector } from "@/components/area-selector";
import { Toast, type ToastMessage } from "@/components/toast";
import { TEST_PREVIEW_CONFIG } from "@/components/constants";
import type { Operator } from "@/contracts/domain";
import {
  SignalWaveIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from "@/components/icons";

type CheckState = "idle" | "latency" | "download" | "completed" | "cancelled";

export default function NetworkCheckPage() {
  const [operator, setOperator] = useState<Operator>("mtn");
  const [areaId, setAreaId] = useState<string>("ikeja");
  const [mobileDataConfirmed, setMobileDataConfirmed] = useState<boolean>(true);
  const [vpnSetting, setVpnSetting] = useState<"no" | "yes" | "unknown">("no");

  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [simulatedLatency, setSimulatedLatency] = useState<number | null>(null);
  const [simulatedThroughput, setSimulatedThroughput] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleStartSimulation = () => {
    if (!mobileDataConfirmed) return;

    setCheckState("latency");
    setProgress(25);
    setSimulatedLatency(null);
    setSimulatedThroughput(null);

    timerRef.current = setTimeout(() => {
      // Phase 1 Latency simulation
      const sampledLatency = Math.floor(45 + Math.random() * 25);
      setSimulatedLatency(sampledLatency);
      setCheckState("download");
      setProgress(65);

      timerRef.current = setTimeout(() => {
        // Phase 2 Download simulation
        const sampledThroughput = Number((10.5 + Math.random() * 9.5).toFixed(1));
        setSimulatedThroughput(sampledThroughput);
        setProgress(100);
        setCheckState("completed");
      }, 1500);
    }, 1200);
  };

  const handleCancelSimulation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCheckState("cancelled");
    setProgress(0);
    setToast({
      id: "cancel",
      type: "info",
      title: "Demonstration Aborted",
      message: "The diagnostic simulation was stopped. No data was recorded.",
    });
  };

  const handleResetSimulation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCheckState("idle");
    setProgress(0);
    setSimulatedLatency(null);
    setSimulatedThroughput(null);
  };

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title & Status */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 items-start gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-800">
              <SignalWaveIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Network Check
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            Live Service Offline
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Controlled application-level diagnostic protocol runner for Nigerian mobile networks in Lagos State.
        </p>
      </div>

      {/* Prominent Service Availability & Evidence Integrity Disclosure */}
      <section aria-labelledby="status-disclosure-title" className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircleIcon className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1.5">
            <h2 id="status-disclosure-title" className="text-sm font-bold text-amber-950">
              Live Network Measurements Unavailable in this Release
            </h2>
            <p className="text-xs leading-relaxed text-amber-900/90">
              SignalPulse NG strictly requires a calibrated, server-verified measurement endpoint and mobile data confirmation before recording genuine network measurements. In this local foundation milestone, measurement transport and live carrier speed tests are not yet connected to prevent recording inaccurate or uncalibrated network data.
            </p>
            <div className="text-[11px] font-medium text-amber-950 pt-1 border-t border-amber-200/80">
              <strong>Evidence Integrity Guarantee:</strong> To prevent fabricated or synthetic metrics from polluting subscriber dispute dockets or regulatory submissions, simulated measurements cannot be saved to the evidence ledger or exported.
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic Protocol Demonstration Panel */}
      <section aria-labelledby="demo-title" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 id="demo-title" className="font-bold text-base text-slate-900">
              Diagnostic Protocol Demonstration
            </h2>
            <p className="text-xs text-slate-500">
              Inspect diagnostic parameters, observation context, and execution flow. Operates in-memory only.
            </p>
          </div>
          <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            method: {TEST_PREVIEW_CONFIG.METHOD_VERSION}
          </span>
        </div>

        {/* Technical Bounds Cards */}
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1">
            <span className="font-semibold text-slate-700 block">Data Consumption</span>
            <span className="font-bold text-slate-900">~1.5 MB illustrative cap</span>
            <span className="text-[11px] text-slate-500 block">Strict payload limits</span>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1">
            <span className="font-semibold text-slate-700 block">Timeout Bound</span>
            <span className="font-bold text-slate-900">10s timeout limit</span>
            <span className="text-[11px] text-slate-500 block">Bounded test duration</span>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-1">
            <span className="font-semibold text-slate-700 block">Execution Mode</span>
            <span className="font-bold text-slate-900">Isolated In-Memory</span>
            <span className="text-[11px] text-slate-500 block">Zero storage persistence</span>
          </div>
        </div>

        {/* Observation Context Inputs */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <OperatorSelector
            value={operator}
            onChange={(val) => setOperator(val as Operator)}
            disabled={checkState === "latency" || checkState === "download"}
          />

          <AreaSelector
            value={areaId}
            onChange={(val) => setAreaId(val)}
            disabled={checkState === "latency" || checkState === "download"}
          />

          {/* VPN Hint */}
          <div className="space-y-1.5">
            <label htmlFor="vpn-setting" className="block text-xs font-semibold text-slate-900">
              VPN or Intermediary Proxy Active?
            </label>
            <select
              id="vpn-setting"
              value={vpnSetting}
              onChange={(e) => setVpnSetting(e.target.value as "no" | "yes" | "unknown")}
              disabled={checkState === "latency" || checkState === "download"}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#064E3B] focus:outline-hidden"
            >
              <option value="no">No VPN active (Direct connection)</option>
              <option value="yes">VPN active (May distort routing latency)</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Mobile Data Explicit Confirmation */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={mobileDataConfirmed}
                onChange={(e) => setMobileDataConfirmed(e.target.checked)}
                disabled={checkState === "latency" || checkState === "download"}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
              />
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-900 block">
                  I confirm this device is currently connected to cellular mobile data (not Wi-Fi).
                </span>
                <span className="text-slate-500 block leading-relaxed">
                  Web browsers cannot cryptographically read physical cellular radio signal strength. Subscriber confirmation provides the required observation context.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Execution Control CTA */}
        {checkState === "idle" && (
          <button
            type="button"
            onClick={handleStartSimulation}
            disabled={!mobileDataConfirmed}
            className="w-full min-h-[48px] rounded-lg bg-[#064E3B] px-5 py-3 font-semibold text-sm text-white shadow-xs hover:bg-[#022C22] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <SignalWaveIcon className="h-4 w-4" aria-hidden="true" />
            <span>Run Diagnostic Protocol Demonstration</span>
          </button>
        )}

        {/* Live Progress Bar */}
        {(checkState === "latency" || checkState === "download") && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">
                {checkState === "latency"
                  ? "Phase 1 of 2: Measuring Application HTTP Latency..."
                  : "Phase 2 of 2: Sampling Bounded Download Throughput..."}
              </span>
              <span className="font-mono text-slate-500">{progress}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-[#064E3B] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={handleCancelSimulation}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
            >
              Cancel Demonstration
            </button>
          </div>
        )}
      </section>

      {/* Simulated Results Display */}
      {checkState === "completed" && (
        <section aria-labelledby="simulated-results-title" className="rounded-xl border border-slate-300 bg-white p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 id="simulated-results-title" className="font-bold text-base text-slate-900">
                Demonstration Output (Synthetic Simulation)
              </h2>
              <p className="text-xs text-slate-500">
                Simulated values generated for interaction evaluation. Not a genuine measurement.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
              Simulation Isolated
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
              <span className="text-xs font-semibold text-slate-600 block">Simulated HTTP Latency</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums">
                  {simulatedLatency}
                </span>
                <span className="text-sm font-semibold text-slate-500">ms</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Illustrative application-layer round-trip time.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
              <span className="text-xs font-semibold text-slate-600 block">Simulated Download Throughput</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums">
                  {simulatedThroughput}
                </span>
                <span className="text-sm font-semibold text-slate-500">Mbps</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Illustrative transfer rate under capped payload bounds.
              </p>
            </div>
          </div>

          {/* Explicit Evidence Isolation Notice */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <LockClosedIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
              <span>Evidence Isolation Guarantee</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              These simulated metrics were generated in memory for demonstration purposes. They were not recorded by a live measurement server and <strong>cannot be saved to your private evidence ledger or included in regulatory escalation dossiers</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <div>Operator: <strong className="text-slate-700 uppercase">{operator}</strong> (Configured)</div>
              <div>Area: <strong className="text-slate-700 uppercase">{areaId}</strong> (Lagos LGA)</div>
              <div>Persistence: <strong className="text-slate-700">None (In-memory only)</strong></div>
              <div>Evidence Status: <strong className="text-amber-800">Excluded from Dossiers</strong></div>
            </div>
          </div>

          {/* Action CTAs: Reset or Report Real Incident */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetSimulation}
              className="flex-1 min-h-[46px] rounded-md border border-slate-300 bg-white px-4 py-2.5 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Reset Demonstration</span>
            </button>

            <Link
              href={`/incidents?operator=${operator}&area=${areaId}`}
              className="flex-1 min-h-[46px] rounded-md bg-[#064E3B] px-4 py-2.5 font-semibold text-xs text-white hover:bg-[#022C22] transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <span>Log a Genuine Service Failure</span>
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
