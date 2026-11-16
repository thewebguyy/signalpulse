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
} from "@/components/local-store";
import { INCIDENT_CATEGORIES } from "@/components/constants";
import type { Operator, IncidentCategory } from "@/contracts/domain";
import type { Incident } from "@/contracts/incidents";
import {
  DocketPenIcon,
  TrashIcon,
  CheckCircleIcon,
  LockClosedIcon,
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

  const incidents = useLocalIncidents();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      setToast({
        id: "err-narrative",
        type: "warning",
        title: "Narrative Required",
        message: "Please describe what occurred in factual terms.",
      });
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const fakeId = `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0")}` as const;
    const fakeRecordId = `00000000-0000-4000-8000-${(Date.now() + 1).toString(16).padStart(12, "0")}` as const;

    const formattedOccurred = occurredAt ? new Date(occurredAt).toISOString() : now;

    const newIncident: Incident = {
      id: fakeId,
      client_record_id: fakeRecordId,
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

    saveLocalIncident(newIncident);
    setNarrative("");
    setComplaintRef("");
    setComplaintContactedAt("");
    setIsSubmitting(false);

    setToast({
      id: "saved-incident",
      type: "success",
      title: "Incident Saved Locally",
      message: "Recorded to your private browser ledger. Ready for inclusion in an Evidence Dossier.",
    });
  };

  const handleDelete = (id: string) => {
    deleteLocalIncident(id);
    setToast({
      id: "deleted-incident",
      type: "info",
      title: "Draft Deleted",
      message: "The record was removed from this device's local storage.",
    });
  };

  return (
    <main id="main" className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FEF3C7] text-[#92400E]">
            <DocketPenIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#121514] sm:text-3xl">
            Incident Journal
          </h1>
          <ProvenanceBadge provenance="user_reported" />
        </div>
        <p className="text-sm leading-relaxed text-[#3F4946]">
          Document telecom service incidents in a structured, timestamped format. Every entry is preserved privately on your device.
        </p>
      </div>

      {/* Local-Only Disclosure Banner */}
      <div className="rounded-lg border border-[#E5E2DC] bg-[#F4F3F0] p-4 text-xs text-[#3F4946] flex items-start gap-2.5">
        <LockClosedIcon className="h-4 w-4 text-[#0C4A3E] shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="text-[#121514]">Private Device Storage: </strong>
          Entries are saved in your browser&apos;s local storage. They are never sent to external servers or published publicly without your explicit grant.
        </div>
      </div>

      {/* Structured Incident Form */}
      <form onSubmit={handleSaveIncident} className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
          <h2 className="text-base font-bold text-[#121514]">
            Log a Structured Service Failure
          </h2>
          <span className="text-xs font-mono text-[#64706C]">6 Canonical Categories</span>
        </div>

        {/* 1. Operator Selection */}
        <OperatorSelector value={operator} onChange={setOperator} idPrefix="inc-op" />

        {/* 2. Lagos LGA Selection */}
        <AreaSelector value={areaId} onChange={setAreaId} id="inc-lga" />

        {/* 3. Category Selection Grid */}
        <fieldset className="space-y-2 border-0 p-0 m-0">
          <legend className="text-sm font-semibold text-[#121514]">
            Incident Category (Select one)
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
            {INCIDENT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.code;
              return (
                <label
                  key={cat.code}
                  className={`flex cursor-pointer flex-col rounded-md border p-3 transition-all ${
                    isSelected
                      ? "border-[#0C4A3E] bg-[#E8F2EF] ring-2 ring-[#0C4A3E]/20"
                      : "border-[#E5E2DC] bg-[#FFFFFF] hover:border-[#64706C]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="incident-category-radio"
                        value={cat.code}
                        checked={isSelected}
                        onChange={() => setCategory(cat.code)}
                        className="h-4 w-4 text-[#0C4A3E] focus:ring-[#0C4A3E]"
                      />
                      <span className="font-semibold text-xs text-[#121514]">{cat.title}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#3F4946] pl-6">
                    {cat.description}
                  </p>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 4. Timestamp */}
        <div className="space-y-1.5">
          <label htmlFor="occurred-at" className="text-sm font-semibold text-[#121514]">
            Approximate Occurrence Time
          </label>
          <input
            type="datetime-local"
            id="occurred-at"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="w-full min-h-[48px] rounded-md border border-[#64706C]/40 bg-[#FFFFFF] px-3 py-2 text-sm text-[#121514] shadow-xs"
          />
        </div>

        {/* 5. Factual Narrative Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="narrative" className="text-sm font-semibold text-[#121514]">
              Factual Narrative
            </label>
            <span className="text-[11px] text-[#64706C] font-mono">
              {narrative.length} / 4000
            </span>
          </div>
          <p className="text-xs text-[#64706C]">
            Stick to observable facts (e.g. &quot;Attempted call to 0803... at 14:15, fast-busy tone immediately&quot;). Avoid unsubstantiated accusations.
          </p>
          <textarea
            id="narrative"
            rows={4}
            maxLength={4000}
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Describe what occurred, your physical location, error prompts, and any error tones received..."
            className="w-full rounded-md border border-[#64706C]/40 bg-[#FFFFFF] p-3 text-sm text-[#121514] shadow-xs focus:border-[#0C4A3E] focus:ring-1 focus:ring-[#0C4A3E]"
          />
        </div>

        {/* 6. Optional Telco Complaint Reference */}
        <div className="rounded-md border border-[#E5E2DC] bg-[#FBFBFA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#121514] uppercase tracking-wider">
              Operator Complaint Escalation (Optional)
            </span>
            <span className="text-[11px] text-[#64706C]">For NCC Escalations</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="complaint-ref" className="text-xs font-semibold text-[#3F4946] block mb-1">
                Telco Ticket / Reference ID
              </label>
              <input
                type="text"
                id="complaint-ref"
                value={complaintRef}
                onChange={(e) => setComplaintRef(e.target.value)}
                placeholder="e.g. MTN-CAS-2026-99120"
                className="w-full min-h-[44px] rounded border border-[#64706C]/40 bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#121514]"
              />
            </div>
            <div>
              <label htmlFor="complaint-date" className="text-xs font-semibold text-[#3F4946] block mb-1">
                Date Contacted Provider
              </label>
              <input
                type="date"
                id="complaint-date"
                value={complaintContactedAt}
                onChange={(e) => setComplaintContactedAt(e.target.value)}
                className="w-full min-h-[44px] rounded border border-[#64706C]/40 bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#121514]"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#64706C]">
            Under NCC guidelines, a valid operator complaint reference is required before the Commission can intervene via Toll-Free 622.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !narrative.trim()}
          className="w-full min-h-[48px] rounded-md bg-[#0C4A3E] px-4 py-3 font-semibold text-white shadow-xs hover:bg-[#08352C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          <span>Save Incident to Local Device Ledger</span>
        </button>
      </form>

      {/* Local Records List */}
      <section aria-labelledby="records-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="records-heading" className="text-lg font-bold text-[#121514]">
            Your Saved Local Incidents ({incidents.length})
          </h2>
          <span className="text-xs font-medium text-[#64706C]">Device Storage</span>
        </div>

        {incidents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E2DC] bg-[#FFFFFF] p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-[#121514]">No incidents recorded yet.</p>
            <p className="text-xs text-[#64706C]">
              When you experience a service drop or billing anomaly, log it above to assemble your private dispute evidence.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[#E5E2DC] bg-[#FFFFFF] p-4 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E2DC] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase text-[#121514]">
                      {item.fields.operator} · {item.fields.category.replace(/_/g, " ")}
                    </span>
                    <ProvenanceBadge provenance={item.provenance} />
                  </div>
                  <span className="text-[11px] font-mono text-[#64706C]">
                    {new Date(item.fields.occurred_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-[#3F4946]">
                  {item.fields.narrative}
                </p>

                {item.fields.complaint_reference && (
                  <div className="rounded bg-[#F4F3F0] p-2 text-[11px] text-[#3F4946]">
                    Telco Ticket Ref: <strong className="font-mono text-[#121514]">{item.fields.complaint_reference}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-[#E5E2DC]">
                  <span className="text-[11px] font-mono text-[#64706C]">
                    ID: {item.id.slice(0, 18)}...
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center gap-1 text-xs text-[#991B1B] hover:text-[#7F1D1D] font-medium"
                    aria-label={`Delete incident ${item.id}`}
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
