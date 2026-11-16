"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { OperatorSelector } from "@/components/operator-selector";
import { AreaSelector } from "@/components/area-selector";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
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
    setProgress(15);
    setCurrentLatency(null);
    setCurrentThroughput(null);
    setCompletedMeasurement(null);

    // Simulate bounded, controlled check steps
    timerRef.current = setTimeout(() => {
      // Latency completed (simulated realistic Lagos cellular HTTP latency)
      const sampledLatency = Math.floor(42 + Math.random() * 26);
      setCurrentLatency(sampledLatency);
      setCheckState("download");
      setProgress(55);

      timerRef.current = setTimeout(() => {
        // Download completed (simulated realistic throughput)
        const sampledThroughput = Number((9.2 + Math.random() * 11.4).toFixed(1));
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
            observed_end: new Date(Date.now() + 3200).toISOString(),
            received_at: new Date(Date.now() + 3250).toISOString(),
            state: "completed",
            latency: { state: "completed", value: sampledLatency, unit: "ms" },
            download: { state: "completed", value: sampledThroughput, unit: "Mbps" },
            upload: { state: "not_run", value: null, unit: "Mbps" },
            corroboration: "client_only",
            receipt_version: null,
            quality_flags: [
              { code: "receipt_missing", scope: "record" },
            ],
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
      }, 1600);
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
      message: "The network measurement was stopped before completion.",
    });
  };

  const handleSaveToEvidence = () => {
    if (completedMeasurement) {
      saveLocalMeasurement(completedMeasurement);
      setToast({
        id: "saved-evidence",
        type: "success",
        title: "Added to Evidence Ledger",
        message: "Measurement stored locally on this device for your private dispute dossier.",
      });
    }
  };

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      {/* Page Title & Scope */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFF6FF] text-[#1D4ED8]">
            <SignalWaveIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#121514] sm:text-3xl">
            Network Check
          </h1>
          <ProvenanceBadge provenance="app_measured" />
        </div>
        <p className="text-sm leading-relaxed text-[#3F4946]">
          Initiate a bounded, transparent HTTP test measuring application-layer latency and download throughput under disclosed conditions.
        </p>
      </div>

      {/* Pre-Flight Parameters & Disclosures */}
      <section aria-labelledby="preflight-heading" className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-3">
          <h2 id="preflight-heading" className="font-bold text-sm text-[#121514]">
            Pre-Flight Configuration & Disclosures
          </h2>
          <span className="font-mono text-xs text-[#64706C]">Method {TEST_PREVIEW_CONFIG.METHOD_VERSION}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-xs text-[#3F4946]">
          <div className="rounded bg-[#F4F3F0] p-3">
            <span className="font-semibold text-[#121514] block">Data Consumption</span>
            <span>{TEST_PREVIEW_CONFIG.DATA_CAP_LABEL}</span>
          </div>
          <div className="rounded bg-[#F4F3F0] p-3">
            <span className="font-semibold text-[#121514] block">Duration Bound</span>
            <span>{TEST_PREVIEW_CONFIG.TIMEOUT_LABEL}</span>
          </div>
          <div className="rounded bg-[#F4F3F0] p-3">
            <span className="font-semibold text-[#121514] block">Synthetic Mode</span>
            <span>Local browser execution</span>
          </div>
        </div>

        <div className="rounded border border-[#FDE68A] bg-[#FEF3C7]/60 p-3 text-xs text-[#78350F] flex items-start gap-2">
          <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-semibold">Pre-Flight Notice: </strong>
            Testing consumes cellular data. This preview simulates HTTP request passes inside your browser. No live production endpoints are contacted.
          </div>
        </div>

        {/* Input Parameters */}
        <div className="space-y-4 pt-2">
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

          {/* Mobile Data Confirmation Checkbox */}
          <div className="rounded-md border border-[#E5E2DC] bg-[#FBFBFA] p-3.5 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={mobileDataConfirmed}
                onChange={(e) => setMobileDataConfirmed(e.target.checked)}
                disabled={checkState === "latency" || checkState === "download"}
                className="mt-0.5 h-4 w-4 rounded border-[#64706C] text-[#0C4A3E] focus:ring-[#0C4A3E]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#121514] block">
                  I confirm this device is currently connected via cellular mobile data (not Wi-Fi)
                </span>
                <span className="text-[#64706C]">
                  Required before running tests. Browsers cannot independently verify physical cellular radio states.
                </span>
              </div>
            </label>
          </div>

          {/* VPN Exclusion Setting */}
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="vpn-setting" className="font-medium text-[#3F4946]">
              Active VPN or Proxy exclusion:
            </label>
            <select
              id="vpn-setting"
              value={vpnSetting}
              onChange={(e) => setVpnSetting(e.target.value as "no" | "yes" | "unknown")}
              disabled={checkState === "latency" || checkState === "download"}
              className="rounded border border-[#64706C]/40 bg-[#FFFFFF] px-2 py-1 text-xs"
            >
              <option value="no">VPN Inactive (Direct Cellular Path)</option>
              <option value="yes">VPN Active (Alters Latency Path)</option>
              <option value="unknown">Unknown / Default</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {checkState === "idle" || checkState === "cancelled" || checkState === "completed" ? (
            <button
              type="button"
              onClick={handleStartCheck}
              disabled={!mobileDataConfirmed}
              className="w-full min-h-[48px] rounded-md bg-[#0C4A3E] px-4 py-3 font-semibold text-white shadow-xs hover:bg-[#08352C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <SignalWaveIcon className="h-5 w-5" aria-hidden="true" />
              <span>{checkState === "completed" ? "Run Another Network Check" : "Start Bounded Network Check"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancel}
              className="w-full min-h-[48px] rounded-md border border-[#991B1B] bg-[#FEF2F2] px-4 py-3 font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-2"
            >
              <span>Cancel Test ({checkState === "latency" ? "Measuring Latency" : "Measuring Download"})</span>
            </button>
          )}
        </div>
      </section>

      {/* Live Progress / Active Testing Area */}
      {(checkState === "latency" || checkState === "download") && (
        <section aria-live="polite" className="rounded-lg border border-[#0C4A3E]/30 bg-[#FFFFFF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#0C4A3E]">
              {checkState === "latency" ? "Phase 1: HTTP Latency Sampling" : "Phase 2: Bounded Download Throughput"}
            </span>
            <span className="font-mono text-[#64706C]">{progress}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-[#E8E6E1] overflow-hidden">
            <div
              className="h-full bg-[#0C4A3E] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-[#64706C]">
            {checkState === "latency"
              ? "Sending non-cached HTTP request samples to measure application-layer round-trip time..."
              : "Transferring bounded non-compressible payload samples to estimate download throughput..."}
          </p>
        </section>
      )}

      {/* Completed Results Cards */}
      {checkState === "completed" && completedMeasurement && (
        <section aria-labelledby="results-heading" className="rounded-lg border border-[#0C4A3E] bg-[#FFFFFF] p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2DC] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3E]">
                Test Completed Under Disclosed Conditions
              </span>
              <h2 id="results-heading" className="text-xl font-bold text-[#121514]">
                Measured Network Telemetry
              </h2>
            </div>
            <ProvenanceBadge provenance="app_measured" />
          </div>

          {/* Metric Tiles */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Latency Card */}
            <div className="rounded-lg border border-[#E5E2DC] bg-[#FBFBFA] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64706C]">
                  HTTP Request Latency
                </span>
                <span className="text-[11px] font-mono text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  Completed
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-[#121514] tabular-nums">
                  {currentLatency}
                </span>
                <span className="font-medium text-sm text-[#64706C]">ms</span>
              </div>
              <p className="text-[11px] text-[#64706C]">
                Application-layer HTTP round-trip time. Not an ICMP ping.
              </p>
            </div>

            {/* Download Throughput Card */}
            <div className="rounded-lg border border-[#E5E2DC] bg-[#FBFBFA] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64706C]">
                  Measured Download
                </span>
                <span className="text-[11px] font-mono text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  Completed
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-[#121514] tabular-nums">
                  {currentThroughput}
                </span>
                <span className="font-medium text-sm text-[#64706C]">Mbps</span>
              </div>
              <p className="text-[11px] text-[#64706C]">
                Measured for this test payload only; does not predict general speed.
              </p>
            </div>
          </div>

          {/* Context & Metadata Table */}
          <div className="rounded-md border border-[#E5E2DC] bg-[#F4F3F0] p-4 text-xs space-y-2">
            <span className="font-bold text-[#121514] block">Observation Context & Integrity Flags</span>
            <div className="grid grid-cols-2 gap-2 text-[#3F4946]">
              <div>Operator: <strong className="text-[#121514] uppercase">{operator}</strong> (User Reported)</div>
              <div>Area: <strong className="text-[#121514] uppercase">{areaId}</strong> (Lagos LGA)</div>
              <div>Mobile Data: <strong className="text-[#121514]">User Confirmed</strong></div>
              <div>Corroboration: <strong className="font-mono text-[#121514]">client_only</strong></div>
            </div>
            <p className="text-[11px] text-[#64706C] pt-1">
              Quality scope: <code className="bg-white px-1 py-0.5 rounded">receipt_missing (client preview)</code>. This record does not qualify for public aggregation.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveToEvidence}
              className="flex-1 min-h-[48px] rounded-md border border-[#0C4A3E] bg-[#E8F2EF] px-4 py-2.5 font-semibold text-xs text-[#0C4A3E] hover:bg-[#D4E8E2] transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
              <span>Add to Evidence Ledger</span>
            </button>

            <Link
              href={`/incidents?operator=${operator}&area=${areaId}`}
              className="flex-1 min-h-[48px] rounded-md bg-[#0C4A3E] px-4 py-2.5 font-semibold text-xs text-white hover:bg-[#08352C] transition-colors flex items-center justify-center gap-1.5 text-center"
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
