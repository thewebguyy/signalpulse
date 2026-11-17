"use client";

import React, { useState } from "react";
import { useSyncEngine, enrollInCloudBackup, triggerSync } from "./sync-store";

export function CloudBackupCard() {
  const syncState = useSyncEngine();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  // Cloud enrollment stays unavailable until hosted isolation and recovery gates pass.
  const cloudEnabled = false;

  const handleEnroll = async () => {
    setIsEnrolling(true);
    const success = await enrollInCloudBackup(true);
    if (!success) setEnrollError("Cloud backup is unavailable. Your reports remain on this device.");
    setIsEnrolling(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Private Cloud Backup
              {syncState.backupEnrolled ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Session active
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Local-only
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {syncState.backupEnrolled
                ? "Check each report's sync status. A guest session does not guarantee that every report is backed up."
                : "Your reports stay on this device. Cloud backup is not active."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors"
        >
          {isOpen ? "Close" : "Manage"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {!syncState.backupEnrolled ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                How Private Backup Works
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                By default, SignalPulse saves everything in this browser. If you clear browser history or use Private Browsing, your reports disappear. 
                Cloud backup requires an active guest session and confirmed sync for each report. Clearing this browser before recovery is available can make cloud records inaccessible.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={isEnrolling || !cloudEnabled}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
                >
                  {isEnrolling ? "Enabling..." : cloudEnabled ? "Enable Private Backup" : "Cloud backup unavailable"}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {cloudEnabled ? "Guest sessions have no verified lost-device recovery." : "This preview keeps reports on this device."}
                </span>
              </div>
              {enrollError && <p role="alert" className="mt-2 text-xs text-rose-700">{enrollError}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${syncState.isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <span className="text-slate-600 dark:text-slate-300">
                    {syncState.isOnline ? "Connected" : "Offline (waiting for signal)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void triggerSync()}
                  disabled={syncState.isSyncing || !syncState.isOnline}
                  className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline disabled:opacity-50"
                >
                  {syncState.isSyncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>

              {/* Recovery remains unavailable until confirmation and lost-device tests pass. */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Device Recovery
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Unavailable</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Recovery linking has not been verified. Keep this browser session and export important reports.
                </p>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
