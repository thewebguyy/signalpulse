"use client";

import { useState } from "react";
import Link from "next/link";
import { OperatorSelector } from "@/components/operator-selector";
import { AreaSelector } from "@/components/area-selector";
import { Toast, type ToastMessage } from "@/components/toast";
import {
  saveLocalIncident,
  useStorageDiagnostics,
} from "@/components/local-store";
import { INCIDENT_CATEGORIES, OPERATOR_OPTIONS } from "@/components/constants";
import type { Operator, IncidentCategory } from "@/contracts/domain";
import type { Incident } from "@/contracts/incidents";
import { AlertCircleIcon, ArrowRightIcon } from "@/components/icons";
import { ShareReportCard } from "@/components/share-report-card";

interface ReportFormProps {
  initialOperator?: Operator;
  onSaved?: (incident: Incident) => void;
  title?: string;
  subtitle?: string;
  idPrefix?: string;
}

export function ReportForm({
  initialOperator = "mtn",
  onSaved,
  title,
  subtitle,
  idPrefix = "rep",
}: ReportFormProps) {
  const [operator, setOperator] = useState<Operator>(initialOperator);
  const [areaId, setAreaId] = useState<string>("ikeja");
  const [category, setCategory] = useState<IncidentCategory>("failed_call");
  const [narrative, setNarrative] = useState<string>("");
  const [occurredAt, setOccurredAt] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [complaintRef, setComplaintRef] = useState<string>("");
  const [complaintContactedAt, setComplaintContactedAt] = useState<string>("");
  const [showOptionalRef, setShowOptionalRef] = useState<boolean>(false);

  const [savedRecord, setSavedRecord] = useState<Incident | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const storageDiagnostics = useStorageDiagnostics();
  const currentOp = OPERATOR_OPTIONS.find((o) => o.code === operator) ?? OPERATOR_OPTIONS[0]!;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      setToast({
        id: "err-narrative",
        type: "warning",
        title: "Description Required",
        message: "Please describe what happened in a few words.",
      });
      return;
    }

    setIsSubmitting(true);
    setStorageError(null);

    const now = new Date().toISOString();
    const formattedOccurred = occurredAt ? new Date(occurredAt).toISOString() : now;

    const record: Incident = {
      id: crypto.randomUUID(),
      client_record_id: crypto.randomUUID(),
      provenance: "user_reported",
      revision: 1,
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
      setSavedRecord(record);
      setToast({
        id: "saved-incident",
        type: "success",
        title: "Report saved on this phone",
        message: "Your record is saved privately. You can share that you logged a problem below.",
      });
      if (onSaved) onSaved(record);
    } else {
      setStorageError(writeResult.message);
      setToast({
        id: "err-save",
        type: "warning",
        title: "Could not save report",
        message: "Browser storage is unavailable. Review the note below.",
      });
    }
  };

  const handleResetForAnother = () => {
    setSavedRecord(null);
    setNarrative("");
    setComplaintRef("");
    setComplaintContactedAt("");
    setShowOptionalRef(false);
    setOccurredAt(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {/* If a report was just saved, show the Share Card prominently! */}
      {savedRecord ? (
        <div className="space-y-6">
          <ShareReportCard
            operator={savedRecord.fields.operator}
            category={savedRecord.fields.category}
            areaId={savedRecord.fields.area_id}
            onDismiss={handleResetForAnother}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Want to log another issue or view your records?
              </p>
              <p className="text-xs text-slate-500">
                Your report is saved on this device.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetForAnother}
                className="inline-flex min-h-[40px] items-center rounded-lg bg-[#064E3B] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#022C22] transition-colors"
              >
                Log another problem
              </button>
              <Link
                href="/evidence"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>View my saved records</span>
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <form
          id="report-form"
          onSubmit={handleSave}
          className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
        >
          {/* Header */}
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              {title ?? "Record what happened"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {subtitle ?? "No signup required. Your record stays private on this phone unless you share or export it."}
            </p>
          </div>

          {/* Step 1: Network Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Step 1 of 4
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Active: <strong className="text-slate-900">{currentOp.name}</strong>
              </span>
            </div>
            <OperatorSelector
              value={operator}
              onChange={setOperator}
              idPrefix={`${idPrefix}-op`}
            />
          </div>

          {/* Step 2: What happened? Category Selection */}
          <fieldset className="space-y-2 border-0 p-0 m-0">
            <div className="flex items-center justify-between">
              <legend className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Step 2 of 4 · What happened? <span className="text-rose-700" aria-hidden="true">*</span>
              </legend>
            </div>
            <p className="text-xs text-slate-500">
              Select the main problem you experienced on {currentOp.name}.
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
              {INCIDENT_CATEGORIES.map((cat) => {
                const isSelected = category === cat.code;
                return (
                  <label
                    key={cat.code}
                    className={`flex cursor-pointer flex-col rounded-lg border p-3.5 transition-colors ${
                      isSelected
                        ? "border-[#064E3B] bg-emerald-50/50 ring-1 ring-[#064E3B]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name={`${idPrefix}-category`}
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

          {/* Step 3: Area Selection (Lagos LGA) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Step 3 of 4 · Where did it happen?
              </span>
            </div>
            <AreaSelector value={areaId} onChange={setAreaId} id={`${idPrefix}-lga`} />
          </div>

          {/* Step 4: Describe what went wrong */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={`${idPrefix}-narrative`} className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Step 4 of 4 · Details <span className="text-rose-700" aria-hidden="true">*</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {narrative.length} / 4000
              </span>
            </div>
            <textarea
              id={`${idPrefix}-narrative`}
              required
              rows={3}
              maxLength={4000}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              placeholder={`e.g. My ${currentOp.name} data stopped opening pages around 1:30 PM in ${areaId || "Ikeja"}. Reconnected three times but still zero connection.`}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-base sm:text-sm text-slate-900 focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]"
            />
          </div>

          {/* Optional: When did it happen & Ticket Reference */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`${idPrefix}-occurred`} className="text-xs font-semibold text-slate-700 block mb-1">
                  When did it happen?
                </label>
                <input
                  type="datetime-local"
                  id={`${idPrefix}-occurred`}
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="flex flex-col justify-end">
                {!showOptionalRef ? (
                  <button
                    type="button"
                    onClick={() => setShowOptionalRef(true)}
                    className="text-left text-xs text-[#064E3B] font-semibold hover:underline py-2.5"
                  >
                    + Add customer care ticket number (Optional)
                  </button>
                ) : (
                  <div>
                    <label htmlFor={`${idPrefix}-ticket`} className="text-xs font-semibold text-slate-700 block mb-1">
                      Customer care ticket / ref
                    </label>
                    <input
                      type="text"
                      id={`${idPrefix}-ticket`}
                      value={complaintRef}
                      onChange={(e) => setComplaintRef(e.target.value)}
                      placeholder="e.g. CAS-98214-LAG"
                      className="w-full min-h-[44px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Storage Warning if Restricted */}
          {!storageDiagnostics.isAvailable && (
            <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircleIcon className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Private browsing or cookies disabled. You can still generate and download a share card or evidence summary, but local history won&apos;t persist across browser tabs.</span>
            </div>
          )}

          {storageError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">
              {storageError}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#064E3B] px-6 py-3 text-base font-semibold text-white hover:bg-[#022C22] transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{isSubmitting ? "Saving..." : "Save report on this phone"}</span>
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="text-xs text-slate-500 text-center sm:text-right">
              🔒 100% private. Stored on your device only.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
