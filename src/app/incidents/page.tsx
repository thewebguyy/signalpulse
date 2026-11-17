"use client";

import { useState } from "react";
import { OperatorSelector } from "@/components/operator-selector";
import { AreaSelector } from "@/components/area-selector";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { Toast, type ToastMessage } from "@/components/toast";
import {
  useLocalIncidents,
  saveLocalIncident,
  deleteLocalIncident,
  useStorageDiagnostics,
  purgeCorruptedIncidents,
} from "@/components/local-store";
import { INCIDENT_CATEGORIES } from "@/components/constants";
import type { Operator, IncidentCategory } from "@/contracts/domain";
import type { Incident } from "@/contracts/incidents";
import {
  DocketPenIcon,
  TrashIcon,
  CheckCircleIcon,
  LockClosedIcon,
  AlertCircleIcon,
} from "@/components/icons";

export default function IncidentsPage() {
  const [operator, setOperator] = useState<Operator>("mtn");
  const [areaId, setAreaId] = useState<string>("ikeja");
  const [category, setCategory] = useState<IncidentCategory>("failed_call");
  const [narrative, setNarrative] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [complaintRef, setComplaintRef] = useState<string>("");
  const [complaintContactedAt, setComplaintContactedAt] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const incidents = useLocalIncidents();
  const storageDiagnostics = useStorageDiagnostics();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      setToast({
        id: "err-narrative",
        type: "warning",
        title: "Description Required",
        message: "Please describe what occurred in factual terms.",
      });
      return;
    }

    setIsSubmitting(true);
    setStorageError(null);

    const now = new Date().toISOString();
    const targetId = editingId ?? (`00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0")}` as const);
    const targetRecordId = `00000000-0000-4000-8000-${(Date.now() + 1).toString(16).padStart(12, "0")}` as const;

    const formattedOccurred = occurredAt ? new Date(occurredAt).toISOString() : now;

    const record: Incident = {
      id: targetId,
      client_record_id: targetRecordId,
      provenance: "user_reported",
      revision: editingId ? 2 : 1,
      fields: {
        operator,
        area_id: areaId || null,
        category,
        occurred_at: formattedOccurred,
        narrative: narrative.trim(),
        complaint_reference: complaintRef.trim() || null,
        complaint_contacted_at: complaintContactedAt ? new Date(complaintContactedAt).toISOString() : null,
      },
      created_at: now,
      updated_at: now,
      expires_at: new Date(Date.now() + 365 * 86400_000).toISOString(),
    };

    const writeResult = saveLocalIncident(record);
    setIsSubmitting(false);

    if (writeResult.success) {
      setNarrative("");
      setComplaintRef("");
      setComplaintContactedAt("");
      setEditingId(null);
      setStorageError(null);
      setToast({
        id: "saved-incident",
        type: "success",
        title: editingId ? "Incident Updated" : "Incident Saved to Device",
        message: "Stored locally in browser storage. Ready for your private Evidence Dossier.",
      });
    } else {
      // Retain entered form fields in memory so subscriber input is not lost
      setStorageError(writeResult.message);
      setToast({
        id: "err-save",
        type: "warning",
        title: "Save Failed",
        message: writeResult.message,
      });
    }
  };

  const handleEdit = (item: Incident) => {
    setEditingId(item.id);
    setOperator(item.fields.operator);
    setAreaId(item.fields.area_id ?? "ikeja");
    setCategory(item.fields.category);
    setNarrative(item.fields.narrative);
    setComplaintRef(item.fields.complaint_reference ?? "");
    setComplaintContactedAt(item.fields.complaint_contacted_at ? item.fields.complaint_contacted_at.slice(0, 10) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNarrative("");
    setComplaintRef("");
    setComplaintContactedAt("");
  };

  const handleDelete = (id: string) => {
    const deleteResult = deleteLocalIncident(id);
    if (deleteResult.success) {
      if (editingId === id) setEditingId(null);
      setToast({
        id: "deleted-incident",
        type: "info",
        title: "Record Deleted",
        message: "The incident was permanently removed from local browser storage.",
      });
    } else {
      setToast({
        id: "err-delete",
        type: "warning",
        title: "Delete Failed",
        message: deleteResult.message,
      });
    }
  };

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-amber-100 text-amber-900">
              <DocketPenIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Incident Journal
            </h1>
          </div>
          <ProvenanceBadge provenance="user_reported" />
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Record mobile network service failures in a structured, timestamped format. Preserved locally on this device.
        </p>
      </div>

      {/* Storage Truth & Shared Device Advisory */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
        <div className="flex items-start gap-2.5">
          <LockClosedIcon className="h-4 w-4 text-[#064E3B] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="text-slate-900 font-semibold">Local Browser Storage Only: </strong>
            Your entries are saved solely in this browser profile&apos;s local storage. They are never automatically uploaded to any server or published without your explicit choice.
          </div>
        </div>
        <div className="text-[11px] text-slate-500 pl-6 border-t border-slate-200/60 pt-1.5">
          <strong className="text-slate-700 font-medium">Shared Device Advisory: </strong>
          Anyone with access to this browser can view these local records. If you share this device, consider exporting your dossier and clearing your records.
        </div>
      </div>

      {/* Storage Access Denial Notice */}
      {!storageDiagnostics.isAvailable && (
        <div role="status" aria-live="polite" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-semibold">Local Storage Inaccessible: </strong>
            Your browser has restricted local storage access (common in strict private/incognito windows or when cookies are disabled). You can compose and review entries in this session, but they will not persist across browser reloads.
          </div>
        </div>
      )}

      {/* Corrupted Record / Unsupported Format Recovery Notice */}
      {(storageDiagnostics.corruptedCount > 0 || storageDiagnostics.isMalformed) && (
        <div role="alert" aria-live="assertive" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="font-semibold">Storage Integrity Notice: </strong>
              {storageDiagnostics.corruptedCount > 0
                ? `${storageDiagnostics.corruptedCount} unreadable or invalid local entry was detected and excluded from your ledger. Your ${storageDiagnostics.validCount} valid records are safe.`
                : "Malformed data was detected in local storage. Invalid entries were safely excluded."}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const res = purgeCorruptedIncidents();
              if (res.success) {
                setToast({
                  id: "purge-success",
                  type: "success",
                  title: "Ledger Cleaned",
                  message: "Unreadable local entries have been safely removed.",
                });
              }
            }}
            className="rounded-md border border-amber-400 bg-white px-3 py-1.5 font-semibold text-xs text-amber-900 hover:bg-amber-100 transition-colors"
          >
            Purge Unreadable Entries
          </button>
        </div>
      )}

      {/* Structured Incident Form */}
      <form onSubmit={handleSaveIncident} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">
            {editingId ? "Edit Saved Incident" : "Log a Service Failure"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* 1. Operator Selection */}
        <OperatorSelector value={operator} onChange={setOperator} idPrefix="inc-op" />

        {/* 2. Lagos LGA Selection */}
        <AreaSelector value={areaId} onChange={setAreaId} id="inc-lga" />

        {/* 3. Category Selection Grid */}
        <fieldset className="space-y-2 border-0 p-0 m-0">
          <legend className="text-sm font-semibold text-slate-900">
            Category of Service Failure
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 pt-1">
            {INCIDENT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.code;
              return (
                <label
                  key={cat.code}
                  className={`flex cursor-pointer flex-col rounded-lg border p-3.5 transition-all ${isSelected
                    ? "border-[#064E3B] bg-emerald-50/50 ring-1 ring-[#064E3B]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="incident-category-radio"
                      value={cat.code}
                      checked={isSelected}
                      onChange={() => setCategory(cat.code)}
                      className="h-4 w-4 text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <span className="font-semibold text-xs text-slate-900">{cat.title}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 pl-6">
                    {cat.description}
                  </p>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 4. Timestamp */}
        <div className="space-y-1.5">
          <label htmlFor="occurred-at" className="text-xs font-semibold text-slate-700">
            Approximate Occurrence Date & Time
          </label>
          <input
            type="datetime-local"
            id="occurred-at"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-xs"
          />
        </div>

        {/* 5. Factual Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="narrative" className="text-xs font-semibold text-slate-700">
              Factual Narrative Description
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {narrative.length} / 4000
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            State observable facts (e.g. &quot;Attempted call to 0802... at 14:15, fast-busy tone immediately&quot;). Avoid accusations or speculation.
          </p>
          <textarea
            id="narrative"
            rows={4}
            maxLength={4000}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Describe what occurred, your physical location, error prompts, and any error tones received..."
            className="w-full rounded-md border border-slate-300 bg-white p-3 text-xs text-slate-900 shadow-xs focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]"
          />
        </div>

        {/* 6. Optional Provider Ticket Reference */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Provider Dispute Details (Optional)
            </span>
            <span className="text-[11px] text-slate-500">
              If you have already contacted customer care, record the reference here for later NCC escalation.
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="complaint-ref" className="text-xs font-medium text-slate-700 block mb-1">
                Provider Ticket / Reference ID
              </label>
              <input
                type="text"
                id="complaint-ref"
                value={complaintRef}
                onChange={(e) => setComplaintRef(e.target.value)}
                placeholder="e.g. MTN-CAS-2026-99120"
                className="w-full min-h-[40px] rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="complaint-date" className="text-xs font-medium text-slate-700 block mb-1">
                Date Contacted Provider
              </label>
              <input
                type="date"
                id="complaint-date"
                value={complaintContactedAt}
                onChange={(e) => setComplaintContactedAt(e.target.value)}
                className="w-full min-h-[40px] rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Inline Storage Failure Alert with Recovery Guidance */}
        {storageError && (
          <div role="alert" aria-live="assertive" className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <AlertCircleIcon className="h-4 w-4 text-red-700 shrink-0" aria-hidden="true" />
              <span>Storage Save Blocked</span>
            </div>
            <p className="leading-relaxed">{storageError}</p>
            <div className="text-[11px] text-red-800 pt-1 border-t border-red-200/80">
              <strong>Your Input is Safe:</strong> Your entered text has been retained in memory. If storage is full, navigate to the Evidence Builder in another tab to export your current records, or delete older entries below to free space.
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !narrative.trim()}
          className="w-full min-h-[48px] rounded-md bg-[#064E3B] px-5 py-3 font-semibold text-white shadow-xs hover:bg-[#022C22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          <span>{editingId ? "Update Saved Incident" : "Save Incident to Device"}</span>
        </button>
      </form>

      {/* Saved Records List */}
      <section aria-labelledby="saved-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="saved-title" className="text-base font-bold text-slate-900">
            Saved Incidents on this Device ({incidents.length})
          </h2>
          <span className="text-xs text-slate-500">Local Browser Storage</span>
        </div>

        {incidents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-900">No incidents recorded yet.</p>
            <p className="text-xs text-slate-500">
              When a network failure occurs, log it above to preserve the record for your dispute dossier.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase text-slate-900">
                      {item.fields.operator} · {item.fields.category.replace(/_/g, " ")}
                    </span>
                    <ProvenanceBadge provenance={item.provenance} />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date(item.fields.occurred_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  {item.fields.narrative}
                </p>

                {item.fields.complaint_reference && (
                  <div className="rounded bg-slate-50 p-2 text-[11px] text-slate-600">
                    Provider Ticket Ref: <strong className="font-mono text-slate-900">{item.fields.complaint_reference}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="font-medium text-[#064E3B] hover:underline"
                  >
                    Edit details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-medium"
                    aria-label={`Delete record ${item.id}`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
