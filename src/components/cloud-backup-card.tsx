"use client";

import React, { useState } from "react";
import { useSyncEngine, enrollInCloudBackup, linkRecoveryEmail, triggerSync } from "./sync-store";

export function CloudBackupCard() {
  const syncState = useSyncEngine();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [email, setEmail] = useState("");
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    await enrollInCloudBackup(true);
    setIsEnrolling(false);
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLinking(true);
    setRecoveryStatus(null);
    const result = await linkRecoveryEmail(email.trim());
    setIsLinking(false);
    setRecoveryStatus(result.message);
    if (result.success) {
      setEmail("");
    }
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
                  Active
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Local-only
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {syncState.backupEnrolled
                ? "Your records back up automatically to your private vault."
                : "Your reports stay on this phone by default. Enable backup to prevent data loss."}
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
                Enabling backup stores an encrypted copy in your private vault so your evidence is preserved.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors"
                >
                  {isEnrolling ? "Enabling..." : "Enable Private Backup"}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  No signup or password needed.
                </span>
              </div>
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

              {/* Recovery Linking */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Device Recovery
                  {syncState.recoveryMode === "email_linked" ? (
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      ✓ Email Linked
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      ⚠ Recovery Not Set
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {syncState.recoveryMode === "email_linked"
                    ? "If you switch devices or reset your browser, you can recover your private vault using your linked email."
                    : "Your cloud backup is tied to this browser. Add an email so you can recover your vault if you switch phones or clear cookies."}
                </p>

                {syncState.recoveryMode !== "email_linked" && (
                  <form onSubmit={handleLinkEmail} className="mt-3 flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter recovery email"
                      required
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isLinking}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isLinking ? "Linking..." : "Link Email"}
                    </button>
                  </form>
                )}

                {recoveryStatus && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    {recoveryStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
