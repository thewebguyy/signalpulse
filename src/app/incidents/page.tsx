"use client";

import { useState } from "react";
import Link from "next/link";
import { OperatorSelector } from "@/components/operator-selector";
import { AreaSelector } from "@/components/area-selector";
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
  TrashIcon,
  CheckCircleIcon,
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
        title: editingId ? "Changes saved" : "Report saved",
        message: "Saved on this device. Ready to include in your complaint.",
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
        title: "Report deleted",
        message: "Removed from this device.",
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
    <main id="main" className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          My Reports
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600">
          Record what happened while the details are fresh. Saved only on this device.
        </p>
        <p className="text-xs text-slate-500">
          If you&apos;re using a shared phone or computer, download your records and delete them when you&apos;re done.
        </p>
      </div>

      {/* Storage Access Denial Notice */}
      {!storageDiagnostics.isAvailable && (
        <div role="status" aria-live="polite" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
          <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="font-semibold">Browser storage is turned off: </strong>
            You can still type a report here, but this private window won&apos;t save it if you close or refresh the page.
          </div>
        </div>
      )}

      {/* Corrupted Record / Unsupported Format Recovery Notice */}
      {(storageDiagnostics.corruptedCount > 0 || storageDiagnostics.isMalformed) && (
        <div role="alert" aria-live="assertive" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong className="font-semibold">Some old saved data couldn&apos;t be read: </strong>
              {storageDiagnostics.corruptedCount > 0
                ? `${storageDiagnostics.corruptedCount} unreadable item was skipped. Your ${storageDiagnostics.validCount} saved reports are safe.`
                : "Some saved browser data was damaged and skipped."}
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
                  title: "Cleaned up",
                  message: "Unreadable data has been removed.",
                });
              }
            }}
            className="min-h-[40px] rounded-md border border-amber-400 bg-white px-3 py-1.5 font-semibold text-xs text-amber-900 hover:bg-amber-100 transition-colors"
          >
            Clean up unreadable data
          </button>
        </div>
      )}

      {/* Structured Incident Form */}
      <form onSubmit={handleSaveIncident} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900">
            {editingId ? "Edit report" : "New report"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel editing
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
            What happened? <span className="text-rose-700" aria-hidden="true">*</span>
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
            {INCIDENT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.code;
              return (
                <label
                  key={cat.code}
                  className={`flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors ${isSelected
                    ? "border-[#064E3B] bg-emerald-50/50 ring-1 ring-[#064E3B]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="incident-category-radio"
                      value={cat.code}
                      checked={isSelected}
                      onChange={() => setCategory(cat.code)}
                      className="h-4 w-4 text-[#064E3B] focus:ring-[#064E3B]"
                    />
                    <span className="font-semibold text-sm text-slate-900">{cat.title}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 pl-6.5">
                    {cat.description}
                  </p>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 4. Timestamp */}
        <div className="space-y-1.5">
          <label htmlFor="occurred-at" className="text-sm font-semibold text-slate-900 block">
            When did it happen? <span className="text-rose-700" aria-hidden="true">*</span>
          </label>
          <input
            type="datetime-local"
            id="occurred-at"
            required
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="w-full min-h-[48px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>

        {/* 5. Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="narrative" className="text-sm font-semibold text-slate-900">
              What went wrong? <span className="text-rose-700" aria-hidden="true">*</span>
            </label>
            <span className="text-xs text-slate-400">
              {narrative.length} / 4000
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Include helpful details like the time, amount lost, or error message you saw.
          </p>
          <textarea
            id="narrative"
            required
            rows={4}
            maxLength={4000}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="e.g. Tried calling 0803... at 2:15 PM in Ikeja, call cut off after 10 seconds."
            className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]"
          />
        </div>

        {/* 6. Optional Provider Ticket Reference */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div>
            <span className="text-sm font-semibold text-slate-900 block">
              Already contacted your network? (Optional)
            </span>
            <span className="text-xs text-slate-600">
              If customer care gave you a ticket number, add it here so it stays with your report.
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="complaint-ref" className="text-xs font-medium text-slate-700 block mb-1">
                Ticket or reference number
              </label>
              <input
                type="text"
                id="complaint-ref"
                value={complaintRef}
                onChange={(e) => setComplaintRef(e.target.value)}
                placeholder="e.g. MTN-CAS-2026-99120"
                className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="complaint-date" className="text-xs font-medium text-slate-700 block mb-1">
                Date you contacted them
              </label>
              <input
                type="date"
                id="complaint-date"
                value={complaintContactedAt}
                onChange={(e) => setComplaintContactedAt(e.target.value)}
                className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Inline Storage Failure Alert with Recovery Guidance */}
        {storageError && (
          <div role="alert" aria-live="assertive" className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <AlertCircleIcon className="h-4 w-4 text-red-700 shrink-0" aria-hidden="true" />
              <span>Couldn&apos;t save to browser storage</span>
            </div>
            <p className="leading-relaxed">{storageError}</p>
            <p className="text-xs text-red-800 pt-1 border-t border-red-200/80">
              <strong>Don&apos;t worry, your text is still here:</strong> Open Evidence in another tab to download your older reports, or delete an old report below to make room.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !narrative.trim()}
          className="w-full min-h-[48px] rounded-lg bg-[#064E3B] px-5 py-3 text-sm sm:text-base font-semibold text-white hover:bg-[#022C22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          <span>{editingId ? "Save changes" : "Save report"}</span>
        </button>
      </form>

      {/* Saved Records List */}
      <section aria-labelledby="saved-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="saved-title" className="text-base font-bold text-slate-900">
            Your saved reports ({incidents.length})
          </h2>
          {incidents.length > 0 && (
            <Link
              href="/evidence"
              className="text-xs sm:text-sm font-semibold text-[#064E3B] hover:underline"
            >
              Prepare a complaint →
            </Link>
          )}
        </div>

        {incidents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-900">No reports saved yet</p>
            <p className="text-xs sm:text-sm text-slate-500">
              Fill out the form above to save your first report on this device.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((item) => {
              const catTitle =
                INCIDENT_CATEGORIES.find((c) => c.code === item.fields.category)?.title ??
                item.fields.category.replace(/_/g, " ");
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        <span className="uppercase">{item.fields.operator}</span> · {catTitle}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(item.fields.occurred_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-700">
                    {item.fields.narrative}
                  </p>

                  {item.fields.complaint_reference && (
                    <div className="rounded bg-slate-50 p-2.5 text-xs text-slate-700">
                      Ticket number: <strong className="text-slate-900">{item.fields.complaint_reference}</strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="min-h-[36px] font-semibold text-[#064E3B] hover:underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex min-h-[36px] items-center gap-1 text-rose-700 hover:text-rose-900 font-medium"
                      aria-label={`Delete report ${catTitle}`}
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
