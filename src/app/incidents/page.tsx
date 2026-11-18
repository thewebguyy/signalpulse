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
} from "@/components/local-store";
import { INCIDENT_CATEGORIES } from "@/components/constants";
import type { Operator, IncidentCategory } from "@/contracts/domain";
import type { Incident } from "@/contracts/incidents";
import {
  TrashIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShareIcon,
} from "@/components/icons";
import { CloudBackupCard } from "@/components/cloud-backup-card";
import { SyncStatusBadge } from "@/components/sync-status-badge";
import { useSyncEngine, getIncidentSyncStatus, triggerSync } from "@/components/sync-store";
import { ShareReportCard } from "@/components/share-report-card";
import {
  toLocalDateTimeInputValue,
  fromLocalDateTimeInputValue,
  formatDisplayDateTimeWAT,
} from "@/lib/datetime";

export default function IncidentsPage() {
  const [operator, setOperator] = useState<Operator>("mtn");
  const [areaId, setAreaId] = useState<string>("ikeja");
  const [category, setCategory] = useState<IncidentCategory>("failed_call");
  const [narrative, setNarrative] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>(() =>
    toLocalDateTimeInputValue(new Date())
  );
  const [complaintRef, setComplaintRef] = useState<string>("");
  const [complaintContactedAt, setComplaintContactedAt] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [sharingIncident, setSharingIncident] = useState<Incident | null>(null);
  const incidents = useLocalIncidents();
  const storageDiagnostics = useStorageDiagnostics();
  const syncState = useSyncEngine();
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
    const existing = editingId ? incidents.find((item) => item.id === editingId) : null;
    if (editingId && !existing) {
      setIsSubmitting(false);
      setStorageError("The report being edited is no longer available.");
      return;
    }
    const targetId = existing?.id ?? crypto.randomUUID();
    const targetRecordId = existing?.client_record_id ?? crypto.randomUUID();

    const formattedOccurred = fromLocalDateTimeInputValue(occurredAt, now);

    const record: Incident = {
      id: targetId,
      client_record_id: targetRecordId,
      provenance: "user_reported",
      revision: existing ? existing.revision + 1 : 1,
      fields: {
        operator,
        area_id: areaId || null,
        category,
        occurred_at: formattedOccurred,
        narrative: narrative.trim(),
        complaint_reference: complaintRef.trim() || null,
        complaint_contacted_at: complaintContactedAt ? new Date(complaintContactedAt).toISOString() : null,
      },
      created_at: existing?.created_at ?? now,
      updated_at: now,
      expires_at: existing?.expires_at ?? new Date(Date.now() + 365 * 86400_000).toISOString(),
    };

    const writeResult = saveLocalIncident(record);
    setIsSubmitting(false);

    if (writeResult.success) {
      setNarrative("");
      setComplaintRef("");
      setComplaintContactedAt("");
      setEditingId(null);
      setStorageError(null);
      setSharingIncident(record);

      // If cloud backup is enrolled, trigger sync in the background
      if (syncState.backupEnrolled) {
        void triggerSync();
      }

      setToast({
        id: "saved-incident",
        type: "success",
        title: editingId ? "Changes saved" : "Report saved",
        message: syncState.backupEnrolled
          ? "Saved and queued for private cloud backup."
          : "Saved on this device. Ready to include in your complaint.",
      });
    } else {
      // Retain entered form fields in memory so subscriber input is not lost
      setStorageError(writeResult.message);
      setToast({
        id: "err-save",
        type: "warning",
        title: "Could not save report",
        message: "Your browser storage is full or restricted. Review the alert below.",
      });
    }
  };

  const handleEdit = (item: Incident) => {
    setEditingId(item.id);
    setOperator(item.fields.operator);
    setAreaId(item.fields.area_id ?? "ikeja");
    setCategory(item.fields.category);
    setNarrative(item.fields.narrative);
    setOccurredAt(toLocalDateTimeInputValue(item.fields.occurred_at));
    setComplaintRef(item.fields.complaint_reference ?? "");
    setComplaintContactedAt(
      item.fields.complaint_contacted_at ? item.fields.complaint_contacted_at.slice(0, 10) : ""
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNarrative("");
    setComplaintRef("");
    setComplaintContactedAt("");
  };

  const handleDelete = (id: string) => {
    const success = deleteLocalIncident(id);
    if (success.success) {
      if (editingId === id) handleCancelEdit();
      if (syncState.backupEnrolled) {
        void triggerSync();
      }
      setToast({
        id: "deleted-incident",
        type: "info",
        title: "Report removed",
        message: "The record was removed from your saved reports.",
      });
    } else {
      setToast({ id: "delete-failed", type: "warning", title: "Report not removed", message: success.message });
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Report a network problem
        </h1>
        <p className="text-sm text-slate-600">
          Save structured records of network failures on your phone or in your private vault to support customer care and NCC complaints.
        </p>
      </div>

      {/* Cloud Backup & Sync Controls */}
      <CloudBackupCard />

      {/* Storage Degradation / Quota Notice */}
      {!storageDiagnostics.isAvailable && (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-950">
            <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>Browser storage is restricted or unavailable</span>
          </p>
          <p className="leading-relaxed">
            Saved reports cannot be accessed or retained until browser storage is permitted in your settings (e.g. disable Private Browsing or allow site data).
          </p>
        </div>
      )}

      {/* Keep raw local evidence intact until a recovery path is reviewed. */}
      {storageDiagnostics.corruptedCount > 0 && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs sm:text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-amber-950">
              {storageDiagnostics.corruptedCount} unreadable {storageDiagnostics.corruptedCount === 1 ? "record was" : "records were"} found
            </p>
            <p className="text-xs text-amber-800">
              The original stored data has been preserved. Editing and deletion are paused to avoid losing unreadable reports.
            </p>
          </div>
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
            className="w-full min-h-[48px] rounded-md border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm text-slate-900"
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
            className="w-full rounded-md border border-slate-300 bg-white p-3 text-base sm:text-sm text-slate-900 focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]"
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
                className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm text-slate-900"
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
                className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm text-slate-900"
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

      {/* Share Report Card */}
      {sharingIncident && (
        <ShareReportCard
          operator={sharingIncident.fields.operator}
          category={sharingIncident.fields.category}
          areaId={sharingIncident.fields.area_id}
          onDismiss={() => setSharingIncident(null)}
        />
      )}

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
              const syncStatus = getIncidentSyncStatus(item.id);

              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        <span className="uppercase">{item.fields.operator}</span> · {catTitle}
                      </span>
                      <SyncStatusBadge status={syncStatus} onRetry={() => void triggerSync()} />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {formatDisplayDateTimeWAT(item.fields.occurred_at)}
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
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="min-h-[36px] font-semibold text-[#064E3B] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSharingIncident(item);
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }}
                        className="inline-flex min-h-[36px] items-center gap-1 font-semibold text-slate-700 hover:text-slate-900"
                      >
                        <ShareIcon className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                        <span>Share card</span>
                      </button>
                    </div>

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
