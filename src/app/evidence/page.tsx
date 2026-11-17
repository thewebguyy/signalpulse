"use client";

import { useState } from "react";
import Link from "next/link";
import { Toast, type ToastMessage } from "@/components/toast";
import { useLocalIncidents, useStorageDiagnostics } from "@/components/local-store";
import { INCIDENT_CATEGORIES } from "@/components/constants";
import type { ExportDocument } from "@/contracts/evidence";
import { exportDocumentSchema } from "@/contracts/evidence";
import {
  DownloadIcon,
  ArrowRightIcon,
  AlertCircleIcon,
} from "@/components/icons";

export default function EvidencePage() {
  const incidents = useLocalIncidents();
  const storageDiagnostics = useStorageDiagnostics();

  const [selectedIncidentIds, setSelectedIncidentIds] = useState<Set<string>>(new Set());

  const [complaintText, setComplaintText] = useState<string>(
    "I am writing to report repeated mobile network problems I experienced in Lagos State. Please review the attached dates, times, and details and resolve this issue."
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);

  const selectedIncidents = incidents.filter((i) => selectedIncidentIds.has(i.id));
  const totalSelected = selectedIncidents.length;
  const missingTickets = totalSelected > 0 && selectedIncidents.every((i) => !i.fields.complaint_reference);

  const toggleIncident = (id: string) => {
    const next = new Set(selectedIncidentIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (next.size >= 20) {
        setToast({
          id: "err-max",
          type: "warning",
          title: "Limit reached",
          message: "You can include up to 20 reports in one file.",
        });
        return;
      }
      next.add(id);
    }
    setSelectedIncidentIds(next);
  };

  const handleSelectAll = () => {
    setSelectedIncidentIds(new Set(incidents.slice(0, 20).map((i) => i.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIncidentIds(new Set());
  };

  const handleExportJSON = () => {
    if (selectedIncidents.length === 0) {
      setToast({
        id: "err-empty",
        type: "warning",
        title: "No reports selected",
        message: "Pick at least 1 saved report first.",
      });
      return;
    }

    if (!complaintText.trim()) {
      setToast({
        id: "err-text",
        type: "warning",
        title: "Write what you want done",
        message: "Add a short note explaining what you want your network to fix or refund before downloading.",
      });
      return;
    }

    if (selectedIncidents.length > 20) {
      setToast({
        id: "err-max-exceeded",
        type: "warning",
        title: "Too many reports",
        message: "You can include up to 20 reports in one file.",
      });
      return;
    }

    const now = new Date().toISOString();

    const candidateDoc: ExportDocument = {
      export_schema_version: "evidence-0.1",
      generated_at: now,
      timezone: "Africa/Lagos",
      incidents: selectedIncidents,
      measurements: [],
      retained_summaries: [],
      complaint_descriptions: selectedIncidents.map((i) => ({
        incident_id: i.id,
        text: complaintText.trim(),
      })),
      assets: [],
      limitations: [
        "Personal record assembled by the subscriber on SignalPulse NG.",
        "Includes reports saved by the user; not independently verified by a network or regulator.",
        "This summary is not an official ruling from your mobile network or the NCC.",
        "If escalating to the NCC, contact your mobile network first and keep your ticket number.",
      ],
    };

    const parseResult = exportDocumentSchema.safeParse(candidateDoc);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message ?? "Please check your selected reports and complaint note.";
      setToast({
        id: "err-validation",
        type: "warning",
        title: "Couldn't create file",
        message: issue,
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
      link.download = `signalpulse-complaint-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setToast({
        id: "json-exported",
        type: "success",
        title: "File downloaded",
        message: "Your complaint file has been saved to this device.",
      });
    } catch {
      setToast({
        id: "err-download",
        type: "warning",
        title: "Download failed",
        message: "Your browser couldn't download the file. Try Print or save PDF instead.",
      });
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Prepare a Complaint
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600">
          Pick the reports you want to include, write what you&apos;re asking for, and download or print your summary.
        </p>
      </div>

      {/* Storage Access Denial Notice */}
      {!storageDiagnostics.isAvailable && (
        <div role="status" aria-live="polite" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
          <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-semibold">Browser storage is turned off: </strong>
            Saved reports can&apos;t be loaded in this private window.
          </div>
        </div>
      )}

      {/* Corrupted Records Notice */}
      {storageDiagnostics.corruptedCount > 0 && (
        <div role="status" aria-live="polite" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              {storageDiagnostics.corruptedCount} unreadable item was skipped.
            </div>
          </div>
          <Link
            href="/incidents"
            className="text-xs font-semibold text-[#064E3B] hover:underline"
          >
            Clean up in My Reports
          </Link>
        </div>
      )}

      {/* Control Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-700">
          Selected: <strong className="text-slate-900 font-bold">{totalSelected}</strong> of 20 max
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={totalSelected === 0}
            className="min-h-[44px] rounded-lg bg-[#064E3B] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#022C22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
            <span>Download file (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={totalSelected === 0}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Print or save PDF
          </button>
        </div>
      </div>

      {/* 1. Record Selection */}
      <section aria-labelledby="records-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="records-title" className="text-base font-bold text-slate-900">
            1. Choose reports to include
          </h2>
          {incidents.length > 0 && (
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[#064E3B] hover:underline font-semibold"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {incidents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              You don&apos;t have any saved reports yet. Add a report first so you can include it here.
            </p>
            <Link
              href="/incidents"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-[#064E3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#022C22] transition-colors"
            >
              <span>Add a report</span>
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden">
            {incidents.map((inc) => {
              const isSelected = selectedIncidentIds.has(inc.id);
              const catTitle =
                INCIDENT_CATEGORIES.find((c) => c.code === inc.fields.category)?.title ??
                inc.fields.category.replace(/_/g, " ");
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
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        <span className="uppercase">{inc.fields.operator}</span> · {catTitle}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(inc.fields.occurred_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {inc.fields.narrative}
                    </p>

                    {inc.fields.complaint_reference && (
                      <div className="text-xs text-[#064E3B] font-medium">
                        Ticket: {inc.fields.complaint_reference}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {missingTickets && (
          <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Tip: None of your selected reports include a network ticket number yet. You can still download or print now, or add your ticket number in <Link href="/incidents" className="font-semibold underline">My Reports</Link> before escalating to the NCC.
          </p>
        )}
      </section>

      {/* 2. Statement */}
      <section aria-labelledby="statement-title" className="space-y-2">
        <label htmlFor="complaint-statement" id="statement-title" className="text-base font-bold text-slate-900 block">
          2. What you want your network to do
        </label>
        <p className="text-xs sm:text-sm text-slate-600">
          Edit this short note to say what happened and what you&apos;re asking for (e.g. a refund, missing data credit, or network check).
        </p>
        <textarea
          id="complaint-statement"
          rows={3}
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]"
        />
      </section>

      {/* 3. Printable Summary Preview */}
      <section aria-labelledby="preview-title" className="rounded-xl border border-slate-300 bg-white p-6 sm:p-8 space-y-6 print-expand">
        <div className="border-b border-slate-200 pb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="preview-title" className="text-xl font-bold tracking-tight text-slate-900">
              Your complaint summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal record · Lagos, Nigeria (WAT)
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {totalSelected} {totalSelected === 1 ? "report" : "reports"} included
          </span>
        </div>

        <div className="rounded-md bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 border border-slate-200">
          <span className="font-semibold text-slate-900 block mb-1">Your note:</span>
          {complaintText.trim() || "No note written yet."}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">
            Included reports ({totalSelected})
          </h3>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-md overflow-hidden text-sm">
            {totalSelected === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs sm:text-sm">
                Select one or more reports above to preview them here.
              </div>
            ) : (
              selectedIncidents.map((inc) => {
                const catTitle =
                  INCIDENT_CATEGORIES.find((c) => c.code === inc.fields.category)?.title ??
                  inc.fields.category.replace(/_/g, " ");
                return (
                  <div key={inc.id} className="p-3.5 bg-white space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        <span className="uppercase">{inc.fields.operator}</span> · {catTitle}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(inc.fields.occurred_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs sm:text-sm">{inc.fields.narrative}</p>
                    {inc.fields.complaint_reference && (
                      <div className="text-xs text-[#064E3B] font-medium">
                        Ticket: {inc.fields.complaint_reference}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className="border-t border-slate-200 pt-4 text-xs leading-relaxed text-slate-500">
          Note: This summary is made from your own saved reports on this device. It is not an official ruling from your mobile network or the NCC. When escalating to the NCC (call 622 or visit consumer.ncc.gov.ng), include your network ticket number.
        </p>
      </section>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
