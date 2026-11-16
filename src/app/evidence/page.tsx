"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { Toast, type ToastMessage } from "@/components/toast";
import {
  useLocalIncidents,
  useLocalMeasurements,
} from "@/components/local-store";
import type { ExportDocument } from "@/contracts/evidence";
import { exportDocumentSchema } from "@/contracts/evidence";
import {
  PaperclipIcon,
  DownloadIcon,
  LockClosedIcon,
} from "@/components/icons";

export default function EvidencePage() {
  const incidents = useLocalIncidents();
  const measurements = useLocalMeasurements();

  const [selectedIncidentIds, setSelectedIncidentIds] = useState<Set<string>>(new Set());
  const [selectedMeasurementIds, setSelectedMeasurementIds] = useState<Set<string>>(new Set());

  const [complaintText, setComplaintText] = useState<string>(
    "I am lodging a formal consumer dispute regarding repeated service degradation and failure experienced in Lagos State. Attached are structured incident entries and application-level test measurements recorded on my device."
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const totalSelected = selectedIncidentIds.size + selectedMeasurementIds.size;

  const toggleIncident = (id: string) => {
    const next = new Set(selectedIncidentIds);
    if (next.has(id)) next.delete(id);
    else if (totalSelected < 20) next.add(id);
    setSelectedIncidentIds(next);
  };

  const toggleMeasurement = (id: string) => {
    const next = new Set(selectedMeasurementIds);
    if (next.has(id)) next.delete(id);
    else if (totalSelected < 20) next.add(id);
    setSelectedMeasurementIds(next);
  };

  const handleExportJSON = () => {
    const chosenIncidents = incidents.filter((i) => selectedIncidentIds.has(i.id));
    const chosenMeasurements = measurements.filter((m) => selectedMeasurementIds.has(m.id));

    if (chosenIncidents.length === 0 && chosenMeasurements.length === 0) {
      setToast({
        id: "err-empty",
        type: "warning",
        title: "No Records Selected",
        message: "Select at least 1 record to assemble an Evidence Dossier.",
      });
      return;
    }

    const now = new Date().toISOString();

    const candidateDoc: ExportDocument = {
      export_schema_version: "evidence-0.1",
      generated_at: now,
      timezone: "Africa/Lagos",
      incidents: chosenIncidents,
      measurements: chosenMeasurements.map((m) => ({
        id: m.id,
        summary: m.summary,
        provenance: "app_measured" as const,
      })),
      retained_summaries: [],
      complaint_descriptions: chosenIncidents.map((i) => ({
        incident_id: i.id,
        text: complaintText,
      })),
      assets: [],
      limitations: [
        "Subscriber-assembled dispute dossier generated locally via SignalPulse NG.",
        "Measurements reflect application-layer HTTP tests under recorded test conditions.",
        "User narratives represent subscriber testimony and are not independently verified.",
        "Does not constitute an official NCC finding or carrier liability determination.",
      ],
    };

    // Formally validate using canonical contract schema before export
    const parseResult = exportDocumentSchema.safeParse(candidateDoc);
    if (!parseResult.success) {
      setToast({
        id: "err-validation",
        type: "warning",
        title: "Dossier Validation Failed",
        message: "The assembled dossier does not meet the schema requirements (e.g. 1 to 20 unique resources).",
      });
      return;
    }

    const blob = new Blob([JSON.stringify(parseResult.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `signalpulse-evidence-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setToast({
      id: "json-exported",
      type: "success",
      title: "Evidence Dossier Downloaded",
      message: "JSON document validated against canonical export schema and saved to your device.",
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-800">
              <PaperclipIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Evidence Builder
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            Dispute Workspace
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Assemble your private records into a structured, timestamped evidence dossier to attach when escalating with your provider or the NCC.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <LockClosedIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
          <span className="font-semibold text-slate-900">Included Records:</span>
          <span className="font-mono font-bold text-[#064E3B]">{totalSelected} / 20</span>
          <span className="text-slate-500">(1 to 20 unique records per dossier)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={totalSelected === 0}
            className="min-h-[40px] rounded-md bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#022C22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Download JSON Dossier</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={totalSelected === 0}
            className="min-h-[40px] rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* 1. Record Selection */}
      <section aria-labelledby="select-title" className="space-y-4">
        <h2 id="select-title" className="text-base font-bold text-slate-900">
          1. Select Records from Local Ledger
        </h2>

        {incidents.length === 0 && measurements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-900">No records saved on this device yet.</p>
            <p className="text-xs text-slate-500">
              Run a <a href="/check" className="text-[#064E3B] underline font-medium">Network Check</a> or log an <a href="/incidents" className="text-[#064E3B] underline font-medium">Incident</a> to begin assembling evidence.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Incidents Column */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Saved Incidents ({incidents.length})
              </span>
              {incidents.map((inc) => {
                const isChecked = selectedIncidentIds.has(inc.id);
                return (
                  <label
                    key={inc.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                      isChecked
                        ? "border-[#064E3B] bg-emerald-50/40 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleIncident(inc.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs uppercase text-slate-900">
                          {inc.fields.operator} · {inc.fields.category.replace(/_/g, " ")}
                        </span>
                        <ProvenanceBadge provenance={inc.provenance} />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {inc.fields.narrative}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {new Date(inc.fields.occurred_at).toLocaleDateString("en-NG")}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Measurements Column */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Test Telemetry ({measurements.length})
              </span>
              {measurements.map((meas) => {
                const isChecked = selectedMeasurementIds.has(meas.id);
                return (
                  <label
                    key={meas.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                      isChecked
                        ? "border-[#064E3B] bg-emerald-50/40 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMeasurement(meas.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs uppercase text-slate-900">
                          {meas.summary.context.operator} · HTTP Check
                        </span>
                        <ProvenanceBadge provenance="app_measured" />
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-900">
                        <span>Latency: <strong>{meas.summary.latency.value ?? "—"} ms</strong></span>
                        <span>Download: <strong>{meas.summary.download.value ?? "—"} Mbps</strong></span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {new Date(meas.created_at).toLocaleDateString("en-NG")} · {meas.summary.corroboration}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Formal Complaint Statement */}
      <section aria-labelledby="statement-title" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
        <h2 id="statement-title" className="text-base font-bold text-slate-900">
          2. Consumer Statement
        </h2>
        <p className="text-xs text-slate-500">
          State clearly what resolution you are requesting (e.g. airtime refund, data bundle restoration, or service investigation).
        </p>
        <textarea
          rows={3}
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-xs focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]"
        />
      </section>

      {/* 3. Formal Dossier Preview (Print-Optimized) */}
      <section aria-labelledby="preview-title" className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 shadow-sm space-y-6 print-expand">
        <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Consumer Dispute Docket · Private Record
            </div>
            <h2 id="preview-title" className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              SignalPulse Evidence Summary
            </h2>
          </div>
          <div className="text-xs text-right font-mono text-slate-600">
            <div>Schema: evidence-0.1</div>
            <div>Timezone: Africa/Lagos</div>
          </div>
        </div>

        {/* Statement */}
        <div className="rounded-md bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 border border-slate-200">
          <span className="font-bold text-slate-900 block mb-1">Subscriber Statement:</span>
          {complaintText}
        </div>

        {/* Chronological Record List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
            Compiled Evidence Entries ({totalSelected})
          </span>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-md overflow-hidden text-xs">
            {totalSelected === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No entries selected above. Check the items to include them in this formal summary.
              </div>
            ) : (
              <>
                {incidents.filter((i) => selectedIncidentIds.has(i.id)).map((inc) => (
                  <div key={inc.id} className="p-3.5 bg-white space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        [INCIDENT] {inc.fields.operator.toUpperCase()} · {inc.fields.category.replace(/_/g, " ")}
                      </span>
                      <ProvenanceBadge provenance={inc.provenance} />
                    </div>
                    <p className="text-slate-700">{inc.fields.narrative}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                      <span>Occurred: {new Date(inc.fields.occurred_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</span>
                      {inc.fields.complaint_reference && (
                        <span className="text-[#064E3B] font-semibold">
                          Provider Ticket: {inc.fields.complaint_reference}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {measurements.filter((m) => selectedMeasurementIds.has(m.id)).map((meas) => (
                  <div key={meas.id} className="p-3.5 bg-slate-50 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        [TEST] {meas.summary.context.operator.toUpperCase()} · Latency {meas.summary.latency.value}ms · Download {meas.summary.download.value}Mbps
                      </span>
                      <ProvenanceBadge provenance="app_measured" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500">
                      <span>Observed: {new Date(meas.created_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</span>
                      <span>Method: {meas.summary.method_version}</span>
                      <span>Corroboration: {meas.summary.corroboration}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Limitations & Legal Disclosures */}
        <div className="border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-500 space-y-1">
          <p className="font-semibold text-slate-900">Evidentiary Limitations & Notice:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Assembled by the subscriber using SignalPulse NG. Not an official telecommunications billing ledger or carrier audit.</li>
            <li>HTTP test results record application-level performance at test time. User reports reflect subscriber testimony.</li>
            <li>For formal escalation, submit this dossier with your provider ticket reference to NCC Consumer Affairs via Toll-Free 622.</li>
          </ul>
        </div>
      </section>

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
