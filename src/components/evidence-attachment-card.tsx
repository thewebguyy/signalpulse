"use client";

import React, { useState } from "react";
import type { AttachmentFileType } from "@/contracts/attachments";

export interface AttachedEvidenceItem {
  id: string;
  filename: string;
  fileType: AttachmentFileType;
  byteSize: number;
  previewUrl?: string;
  isSynthetic: boolean;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MiB

export function EvidenceAttachmentCard({
  attachments,
  onAttach,
  onRemove,
}: {
  incidentId?: string;
  attachments: AttachedEvidenceItem[];
  onAttach: (item: AttachedEvidenceItem) => void;
  onRemove: (id: string) => void;
}) {
  const [selectedType, setSelectedType] = useState<AttachmentFileType>("receipt");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    // 1. Size check
    if (file.size > MAX_BYTES) {
      setError("File is too large (" + (file.size / (1024 * 1024)).toFixed(1) + "MB). Keep under 5MB so it uploads reliably on slow network connections.");
      e.target.value = "";
      return;
    }

    // 2. MIME type check
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported file format. Please attach a JPG, PNG screenshot, or PDF document.");
      e.target.value = "";
      return;
    }

    setIsProcessing(true);

    try {
      const isImage = file.type.startsWith("image/");
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      const item: AttachedEvidenceItem = {
        id: crypto.randomUUID(),
        filename: file.name,
        fileType: selectedType,
        byteSize: file.size,
        ...(previewUrl ? { previewUrl } : {}),
        isSynthetic: true, // Tagged synthetic in this milestone
      };

      onAttach(item);
      e.target.value = "";
    } catch {
      setError("Failed to process file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getLabel = (type: AttachmentFileType) => {
    switch (type) {
      case "receipt":
        return "Airtime Purchase Receipt";
      case "debit_screenshot":
        return "Bank Debit Screenshot";
      case "ussd_error":
        return "USSD Error Message";
      default:
        return "Network Evidence Document";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Supporting Documents & Screenshots
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            (Optional)
          </span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Attach bank transaction debit alerts, USSD recharge errors, or proof of payment for your complaint dossier.
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
        <p className="font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Privacy Warning: Crop Sensitive Information
        </p>
        <p className="mt-1 text-amber-700/90 dark:text-amber-300/80 leading-relaxed">
          Before attaching screenshots, please crop or hide your full Bank Verification Number (BVN), card CVV, or personal bank account balance. Attachments remain private in your vault.
        </p>
      </div>

      {/* Attachment Selector & Upload */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AttachmentFileType)}
            className="text-base sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="receipt">Airtime / Data Purchase Receipt</option>
            <option value="debit_screenshot">Bank Debit Alert Screenshot</option>
            <option value="ussd_error">USSD Code Error Screenshot</option>
            <option value="other">Other Network Evidence</option>
          </select>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 cursor-pointer transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{isProcessing ? "Adding..." : "Add Document"}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="sr-only"
            />
          </label>
        </div>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Attached Files List */}
      {attachments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Attached Evidence ({attachments.length})
          </h4>
          <div className="grid gap-2">
            {attachments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {item.filename}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {getLabel(item.fileType)} • {(item.byteSize / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Private Vault
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="text-rose-600 hover:text-rose-800 dark:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove attachment"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
