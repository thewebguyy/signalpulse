"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { Toast, type ToastMessage } from "@/components/toast";
import {
  useLocalIncidents,
  useLocalMeasurements,
} from "@/components/local-store";
import type { ExportDocument } from "@/contracts/evidence";
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
    "I am lodging a formal dispute regarding repeated mobile network service failures experienced in Lagos State. Attached are structured incident entries and application-measured connection telemetry recorded under controlled conditions."
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
        message: "Please select at least 1 record to assemble an Evidence Dossier.",
      });
      return;
    }

    const now = new Date().toISOString();

    const exportDoc: ExportDocument = {
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
        "User-assembled evidence dossier generated via SignalPulse NG.",
        "Measurements reflect application-layer HTTP tests at recorded time and location.",
        "User narratives represent subscriber testimony and are not independently verified.",
        "Does not constitute an official NCC finding or carrier liability determination.",
      ],
    };

    const blob = new Blob([JSON.stringify(exportDoc, null, 2)], {
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
      title: "Evidence Dossier Exported",
      message: "JSON dossier successfully compiled and downloaded to your device.",
    });
  };

  const handlePrintDossier = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F1F5F9] text-[#334155]">
            <PaperclipIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#121514] sm:text-3xl">
            Evidence Builder
          </h1>
          <span className="rounded bg-[#F4F3F0] px-2 py-0.5 text-[11px] font-mono font-semibold text-[#3F4946] border border-[#E5E2DC]">
            Multi-Source Dossier
          </span>
        </div>
        <p className="text-sm leading-relaxed text-[#3F4946]">
          Select private records to assemble a formal, timestamped evidence dossier for operator escalation and NCC dispute resolution.
        </p>
      </div>

      {/* Selection Control Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <LockClosedIcon className="h-4 w-4 text-[#0C4A3E]" aria-hidden="true" />
          <span className="font-semibold text-[#121514]">Selected Records:</span>
          <span className="font-mono font-bold text-[#0C4A3E]">{totalSelected} / 20</span>
          <span className="text-[#64706C]">(Maximum 20 items per export schema)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={totalSelected === 0}
            className="min-h-[40px] rounded-md bg-[#0C4A3E] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#08352C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export JSON Dossier</span>
          </button>

          <button
            type="button"
            onClick={handlePrintDossier}
            disabled={totalSelected === 0}
            className="min-h-[40px] rounded-md border border-[#64706C]/40 bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-semibold text-[#121514] hover:bg-[#F4F3F0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Print / PDF View
          </button>
        </div>
      </div>

      {/* Record Selector Grid */}
      <section aria-labelledby="selection-heading" className="space-y-4">
        <h2 id="selection-heading" className="text-base font-bold text-[#121514]">
          1. Select Records from Local Ledger
        </h2>

        {incidents.length === 0 && measurements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E2DC] bg-[#FFFFFF] p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-[#121514]">No local records found.</p>
            <p className="text-xs text-[#64706C]">
              Run a <a href="/check" className="text-[#0C4A3E] underline font-semibold">Network Check</a> or log an <a href="/incidents" className="text-[#0C4A3E] underline font-semibold">Incident</a> to begin assembling private evidence.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Incidents column */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64706C] block">
                Incident Reports ({incidents.length})
              </span>
              {incidents.map((inc) => {
                const isChecked = selectedIncidentIds.has(inc.id);
                return (
                  <label
                    key={inc.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                      isChecked
                        ? "border-[#0C4A3E] bg-[#E8F2EF]/60 shadow-xs"
                        : "border-[#E5E2DC] bg-[#FFFFFF] hover:border-[#64706C]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleIncident(inc.id)}
                      className="mt-1 h-4 w-4 rounded border-[#64706C] text-[#0C4A3E] focus:ring-[#0C4A3E]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs uppercase text-[#121514]">
                          {inc.fields.operator} · {inc.fields.category.replace(/_/g, " ")}
                        </span>
                        <ProvenanceBadge provenance={inc.provenance} />
                      </div>
                      <p className="text-xs text-[#3F4946] line-clamp-2">
                        {inc.fields.narrative}
                      </p>
                      <span className="text-[10px] font-mono text-[#64706C] block">
                        {new Date(inc.fields.occurred_at).toLocaleDateString("en-NG")}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Measurements column */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64706C] block">
                Network Check Telemetry ({measurements.length})
              </span>
              {measurements.map((meas) => {
                const isChecked = selectedMeasurementIds.has(meas.id);
                return (
                  <label
                    key={meas.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                      isChecked
                        ? "border-[#0C4A3E] bg-[#E8F2EF]/60 shadow-xs"
                        : "border-[#E5E2DC] bg-[#FFFFFF] hover:border-[#64706C]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMeasurement(meas.id)}
                      className="mt-1 h-4 w-4 rounded border-[#64706C] text-[#0C4A3E] focus:ring-[#0C4A3E]"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs uppercase text-[#121514]">
                          {meas.summary.context.operator} · HTTP Check
                        </span>
                        <ProvenanceBadge provenance="app_measured" />
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-[#121514]">
                        <span>Latency: <strong>{meas.summary.latency.value ?? "—"} ms</strong></span>
                        <span>Download: <strong>{meas.summary.download.value ?? "—"} Mbps</strong></span>
                      </div>
                      <span className="text-[10px] font-mono text-[#64706C] block">
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

      {/* Factual Complaint Statement */}
      <section aria-labelledby="statement-heading" className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
        <h2 id="statement-heading" className="text-base font-bold text-[#121514]">
          2. Factual Complaint Summary
        </h2>
        <p className="text-xs text-[#64706C]">
          Customize the overarching statement that accompanies your dispute dossier. Keep it factual and concise.
        </p>
        <textarea
          rows={3}
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          className="w-full rounded-md border border-[#64706C]/40 bg-[#FFFFFF] p-3 text-xs text-[#121514] shadow-xs focus:border-[#0C4A3E] focus:ring-1 focus:ring-[#0C4A3E]"
        />
      </section>

      {/* Dossier Preview Card (Styled for Screen & Print) */}
      <section aria-labelledby="preview-heading" className="rounded-xl border border-[#121514] bg-[#FFFFFF] p-6 shadow-md space-y-6">
        <div className="border-b-2 border-[#121514] pb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#64706C]">
              Private Consumer Evidence Dossier
            </span>
            <h2 id="preview-heading" className="text-2xl font-bold tracking-tight text-[#121514]">
              SignalPulse Evidence Summary
            </h2>
          </div>
          <div className="text-right text-xs">
            <span className="font-mono block text-[#121514]">Schema: evidence-0.1</span>
            <span className="text-[#64706C]">Timezone: Africa/Lagos</span>
          </div>
        </div>

        {/* Narrative Statement */}
        <div className="rounded bg-[#F4F3F0] p-4 text-xs leading-relaxed text-[#121514]">
          <span className="font-bold block mb-1">Subscriber Statement:</span>
          {complaintText}
        </div>

        {/* Attached Records Table */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#121514] block">
            Compiled Evidentiary Records ({totalSelected})
          </span>

          <div className="divide-y divide-[#E5E2DC] border border-[#E5E2DC] rounded-md overflow-hidden text-xs">
            {totalSelected === 0 ? (
              <div className="p-4 text-center text-[#64706C]">No records currently included in this dossier.</div>
            ) : (
              <>
                {incidents.filter((i) => selectedIncidentIds.has(i.id)).map((inc) => (
                  <div key={inc.id} className="p-3 bg-[#FFFFFF] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#121514]">
                        [INCIDENT] {inc.fields.operator.toUpperCase()} · {inc.fields.category}
                      </span>
                      <ProvenanceBadge provenance={inc.provenance} />
                    </div>
                    <p className="text-[#3F4946]">{inc.fields.narrative}</p>
                    {inc.fields.complaint_reference && (
                      <span className="text-[11px] font-mono text-[#0C4A3E]">
                        Operator Ticket Ref: {inc.fields.complaint_reference}
                      </span>
                    )}
                  </div>
                ))}

                {measurements.filter((m) => selectedMeasurementIds.has(m.id)).map((meas) => (
                  <div key={meas.id} className="p-3 bg-[#FBFBFA] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#121514]">
                        [CHECK] {meas.summary.context.operator.toUpperCase()} · Latency {meas.summary.latency.value}ms · Down {meas.summary.download.value}Mbps
                      </span>
                      <ProvenanceBadge provenance="app_measured" />
                    </div>
                    <span className="text-[11px] font-mono text-[#64706C] block">
                      Method: {meas.summary.method_version} · Status: {meas.summary.state} · Corroboration: {meas.summary.corroboration}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Disclaimers & Limitations */}
        <div className="border-t border-[#E5E2DC] pt-4 text-[11px] leading-relaxed text-[#64706C] space-y-1">
          <p className="font-semibold text-[#121514]">Evidentiary Notice & Disclaimers:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>This dossier is compiled by the subscriber using SignalPulse NG. It is not an official audit or telecommunications billing ledger.</li>
            <li>HTTP checks measure application-layer performance at test time. Unusable internet claims reflect subscriber observations.</li>
            <li>Official escalations require a valid telco dispute reference. See NCC Consumer Guidance for formal escalation.</li>
          </ul>
        </div>
      </section>

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
