"use client";

import { useState } from "react";
import Link from "next/link";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { Toast, type ToastMessage } from "@/components/toast";
import { useLocalIncidents } from "@/components/local-store";
import type { ExportDocument } from "@/contracts/evidence";
import { exportDocumentSchema } from "@/contracts/evidence";
import {
  PaperclipIcon,
  DownloadIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@/components/icons";

export default function EvidencePage() {
  const incidents = useLocalIncidents();

  const [selectedIncidentIds, setSelectedIncidentIds] = useState<Set<string>>(new Set());

  const [complaintText, setComplaintText] = useState<string>(
    "I am lodging a formal consumer dispute regarding repeated service degradation and failure experienced in Lagos State. Attached are structured incident entries and factual records assembled from my device."
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const totalSelected = selectedIncidentIds.size;

  const toggleIncident = (id: string) => {
    const next = new Set(selectedIncidentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (next.size >= 20) {
        setToast({
          id: "err-max",
          type: "warning",
          title: "Maximum Records Reached",
          message: "A single dispute dossier can include up to 20 unique records.",
        });
        return;
      }
      next.add(id);
    }
    setSelectedIncidentIds(next);
  };

  const handleSelectAll = () => {
    const allIds = incidents.slice(0, 20).map((i) => i.id);
    setSelectedIncidentIds(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedIncidentIds(new Set());
  };

  const handleExportJSON = () => {
    const chosenIncidents = incidents.filter((i) => selectedIncidentIds.has(i.id));

    if (chosenIncidents.length === 0) {
      setToast({
        id: "err-empty",
        type: "warning",
        title: "No Records Selected",
        message: "Please select at least 1 incident record to assemble an evidence dossier.",
      });
      return;
    }

    if (chosenIncidents.length > 20) {
      setToast({
        id: "err-max-exceeded",
        type: "warning",
        title: "Too Many Records",
        message: "Evidence dossiers are bounded to a maximum of 20 unique records.",
      });
      return;
    }

    const now = new Date().toISOString();

    const candidateDoc: ExportDocument = {
      export_schema_version: "evidence-0.1",
      generated_at: now,
      timezone: "Africa/Lagos",
      incidents: chosenIncidents,
      measurements: [],
      retained_summaries: [],
      complaint_descriptions: chosenIncidents.map((i) => ({
        incident_id: i.id,
        text: complaintText.trim(),
      })),
      assets: [],
      limitations: [
        "Subscriber-assembled consumer evidence dossier generated locally via SignalPulse NG.",
        "Incident records represent subscriber testimony recorded under user_reported provenance.",
        "This dossier does not constitute an official regulatory determination, billing audit, or certificate of carrier fault.",
        "Formal escalation to the Nigerian Communications Commission requires prior lodging of a complaint with the licensed mobile provider.",
      ],
    };

    // Formally validate using canonical contract schema before export
    const parseResult = exportDocumentSchema.safeParse(candidateDoc);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message ?? "Schema validation error.";
      setToast({
        id: "err-validation",
        type: "warning",
        title: "Dossier Validation Failed",
        message: `The assembled dossier does not meet canonical requirements: ${issue}`,
      });
      return;
    }

    try {
      const blob = new Blob([JSON.stringify(parseResult.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signalpulse-dispute-dossier-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({
        id: "json-exported",
        type: "success",
        title: "Evidence Dossier Downloaded",
        message: "JSON file validated against canonical evidence-0.1 schema and saved to your device.",
      });
    } catch {
      setToast({
        id: "err-download",
        type: "warning",
        title: "Download Failed",
        message: "Unable to generate file download in this browser environment.",
      });
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 items-start gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-slate-800">
              <PaperclipIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Evidence Builder
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            Dispute Workspace
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Assemble your private incident records into a structured, timestamped evidence dossier to attach when escalating with your provider or the NCC.
        </p>
      </div>

      {/* Control Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <LockClosedIcon className="h-4 w-4 text-[#064E3B]" aria-hidden="true" />
          <span>
            Selected Records: <strong className="text-slate-900 font-bold">{totalSelected} / 20</strong>
            <span className="text-slate-400 ml-1">(1 to 20 unique records per dossier)</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={totalSelected === 0}
            className="min-h-[44px] rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#022C22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            <span>Download JSON Dossier</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={totalSelected === 0}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Export Instructions & Print Truth Note */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <span>Browser Print &amp; PDF Export:</span>
        </div>
        <p className="leading-relaxed">
          Clicking <strong>&ldquo;Print / Save as PDF&rdquo;</strong> triggers your browser&apos;s native print dialogue. In the print dialogue, choose <strong>&ldquo;Save as PDF&rdquo;</strong> as your destination to save a clean, ink-efficient document formatted specifically for regulatory and provider submissions.
        </p>
      </div>

      {/* 1. Record Selection */}
      <section aria-labelledby="records-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="records-title" className="text-base font-bold text-slate-900">
            1. Select Incident Records from Local Ledger
          </h2>
          {incidents.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[#064E3B] hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-slate-500 hover:underline"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {incidents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center space-y-3">
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              No service incidents are currently saved in this browser&apos;s local ledger. Record a failed call, dropped connection, or billing dispute first to assemble an evidence dossier.
            </p>
            <Link
              href="/incidents"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#022C22] transition-colors"
            >
              <span>Go to Incident Journal</span>
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            {incidents.map((inc) => {
              const isSelected = selectedIncidentIds.has(inc.id);
              return (
                <label
                  key={inc.id}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                    isSelected ? "bg-emerald-50/40" : "hover:bg-slate-50/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleIncident(inc.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#064E3B] focus:ring-[#064E3B]"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 uppercase">
                          {inc.fields.operator}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-700 capitalize font-medium">
                          {inc.fields.category.replace(/_/g, " ")}
                        </span>
                      </div>
                      <ProvenanceBadge provenance={inc.provenance} />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {inc.fields.narrative}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                      <span>
                        Occurred: {new Date(inc.fields.occurred_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                      </span>
                      {inc.fields.area_id && (
                        <span>LGA: {inc.fields.area_id.toUpperCase()}</span>
                      )}
                      {inc.fields.complaint_reference && (
                        <span className="text-[#064E3B] font-semibold">
                          Ticket: {inc.fields.complaint_reference}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Formal Consumer Statement */}
      <section aria-labelledby="statement-title" className="space-y-2">
        <h2 id="statement-title" className="text-base font-bold text-slate-900">
          2. Consumer Statement
        </h2>
        <p className="text-xs text-slate-500">
          State clearly what resolution you are requesting from your mobile service provider or the NCC (e.g. airtime refund, data bundle restoration, or service investigation).
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
              incidents
                .filter((i) => selectedIncidentIds.has(i.id))
                .map((inc) => (
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
                ))
            )}
          </div>
        </div>

        {/* Evidentiary Limitations & Notice */}
        <div className="border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-500 space-y-1">
          <p className="font-semibold text-slate-900">Evidentiary Limitations &amp; Notice:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Assembled by the subscriber using SignalPulse NG. Not an official telecommunications billing ledger or carrier audit.</li>
            <li>Incident records reflect subscriber testimony recorded under <code>user_reported</code> provenance.</li>
            <li>For formal escalation, submit this dossier along with your service provider ticket reference to NCC Consumer Affairs via Toll-Free 622 or the NCC Consumer Portal.</li>
          </ul>
        </div>
      </section>

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
