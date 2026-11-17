"use client";

import { useSyncExternalStore } from "react";
import { getLocalIncidents } from "./local-store";

export type SyncItemStatus = "local_only" | "queued" | "synced" | "failed" | "conflict";

export interface SyncRecordMeta {
  status: SyncItemStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface SyncEngineState {
  backupEnrolled: boolean;
  recoveryMode: "none" | "email_linked";
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAttempt: string | null;
  records: Record<string, SyncRecordMeta>;
}

const SYNC_STATE_KEY = "signalpulse_sync_state_v0.1";

let syncState: SyncEngineState = {
  backupEnrolled: false,
  recoveryMode: "none",
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
  lastSyncAttempt: null,
  records: {},
};

let syncInitialized = false;

const listeners = new Set<() => void>();
function emitSyncChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeSyncStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function loadSavedSyncState(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(SYNC_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        syncState = {
          ...syncState,
          // Persisted browser flags are not proof of an authenticated session.
          backupEnrolled: false,
          recoveryMode: parsed.recoveryMode === "email_linked" ? "email_linked" : "none",
          lastSyncAttempt: typeof parsed.lastSyncAttempt === "string" ? parsed.lastSyncAttempt : null,
          records: typeof parsed.records === "object" && parsed.records !== null ? parsed.records : {},
        };
      }
    }
  } catch {
    // Ignore storage read errors
  }
}

function persistSyncState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(syncState));
  } catch {
    // Ignore storage write errors
  }
}

export function getSyncState(): SyncEngineState {
  if (!syncInitialized && typeof window !== "undefined") {
    syncInitialized = true;
    loadSavedSyncState();

    window.addEventListener("online", () => {
      syncState = { ...syncState, isOnline: true };
      emitSyncChange();
      if (syncState.backupEnrolled) {
        void triggerSync();
      }
    });

    window.addEventListener("offline", () => {
      syncState = { ...syncState, isOnline: false };
      emitSyncChange();
    });

    // Check current remote session
    void checkRemoteSession();
  }
  return syncState;
}

export function useSyncEngine(): SyncEngineState {
  return useSyncExternalStore(subscribeSyncStore, getSyncState, () => syncState);
}

export function getIncidentSyncStatus(incidentId: string): SyncItemStatus {
  const current = getSyncState();
  return current.records[incidentId]?.status ?? (current.backupEnrolled ? "queued" : "local_only");
}

async function checkRemoteSession(): Promise<void> {
  try {
    const res = await fetch("/api/v1/session", { cache: "no-store" });
    if (!res.ok) return;
    const body = await res.json();
    if (body?.data?.state === "active_guest") {
      const records = Object.fromEntries(Object.entries(syncState.records).map(([id, meta]) =>
        [id, meta.status === "synced" ? { ...meta, status: "queued" as const, lastSyncedAt: null, lastError: "Rechecking cloud owner and record status." } : meta]));
      syncState = {
        ...syncState,
        backupEnrolled: true,
        recoveryMode: body.data.recovery_mode === "email_linked" ? "email_linked" : "none",
        records,
      };
      persistSyncState();
      emitSyncChange();
    } else {
      const records = Object.fromEntries(Object.entries(syncState.records).map(([id, meta]) =>
        [id, meta.status === "synced" ? { ...meta, status: "failed" as const, lastSyncedAt: null, lastError: "Cloud session is no longer verified." } : meta]));
      syncState = { ...syncState, backupEnrolled: false, recoveryMode: "none", records };
      persistSyncState();
      emitSyncChange();
    }
  } catch {
    // Session check failure fails gracefully
  }
}

export async function enrollInCloudBackup(acceptLimitations: boolean): Promise<boolean> {
  if (!acceptLimitations) return false;

  try {
    const res = await fetch("/api/v1/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept_guest_limitations: true }),
    });

    if (!res.ok) {
      return false;
    }

    const incidents = getLocalIncidents();
    const updatedRecords = { ...syncState.records };
    for (const incident of incidents) {
      const existing = updatedRecords[incident.id];
      if (!existing || existing.status === "local_only") {
        updatedRecords[incident.id] = {
          status: "queued",
          lastSyncedAt: null,
          lastError: null,
        };
      }
    }

    syncState = {
      ...syncState,
      backupEnrolled: true,
      records: updatedRecords,
    };
    persistSyncState();
    emitSyncChange();

    // Trigger initial batch sync
    void triggerSync();
    return true;
  } catch {
    return false;
  }
}

export async function linkRecoveryEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/v1/session/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      return { success: false, message: "Could not link recovery email. Please try again." };
    }

    const body = await res.json();
    if (body?.data?.success !== true || body.data.recovery_mode !== "email_linked") {
      return { success: false, message: "Recovery is not yet verified. Keep this device session and your local evidence." };
    }

    syncState = {
      ...syncState,
      recoveryMode: "email_linked",
    };
    persistSyncState();
    emitSyncChange();
    return { success: true, message: "Recovery email linked successfully." };
  } catch {
    return { success: false, message: "Connection error. Please check your internet." };
  }
}

export async function triggerSync(): Promise<void> {
  if (syncState.isSyncing || !syncState.isOnline) return;

  const incidents = getLocalIncidents();
  if (incidents.length === 0) return;

  syncState = { ...syncState, isSyncing: true };
  emitSyncChange();

  const mutationId = "mutation-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

  try {
    const res = await fetch("/api/v1/incidents/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_mutation_id: mutationId,
        incidents,
        deleted_incident_ids: [],
      }),
    });

    const now = new Date().toISOString();

    if (!res.ok) {
      // Mark queued as failed
      const updatedRecords = { ...syncState.records };
      for (const incident of incidents) {
        if (updatedRecords[incident.id]?.status === "queued") {
          updatedRecords[incident.id] = {
            status: "failed",
            lastSyncedAt: null,
            lastError: "Sync request failed with status " + res.status,
          };
        }
      }
      syncState = {
        ...syncState,
        isSyncing: false,
        lastSyncAttempt: now,
        records: updatedRecords,
      };
      persistSyncState();
      emitSyncChange();
      return;
    }

    const body = await res.json();
    if (!body?.data || typeof body.data.synced_count !== "number" || typeof body.data.failed_count !== "number") throw new Error("Invalid sync acknowledgement");
    const conflicts = body.data.conflicts ?? [];
    const conflictIds = new Set(conflicts.map((c: { id: string }) => c.id));

    const updatedRecords = { ...syncState.records };
    for (const incident of incidents) {
      if (conflictIds.has(incident.id)) {
        updatedRecords[incident.id] = {
          status: "conflict",
          lastSyncedAt: now,
          lastError: "A newer revision exists in cloud vault. Local draft preserved.",
        };
      } else if (body.data.failed_count === 0 && body.data.synced_count === incidents.length) {
        updatedRecords[incident.id] = {
          status: "synced",
          lastSyncedAt: now,
          lastError: null,
        };
      } else {
        updatedRecords[incident.id] = { status: "failed", lastSyncedAt: null, lastError: "Cloud did not confirm this record. Local copy preserved." };
      }
    }

    syncState = {
      ...syncState,
      isSyncing: false,
      lastSyncAttempt: now,
      records: updatedRecords,
    };
    persistSyncState();
    emitSyncChange();
  } catch (err) {
    const now = new Date().toISOString();
    const updatedRecords = { ...syncState.records };
    for (const incident of incidents) {
      if (updatedRecords[incident.id]?.status === "queued") {
        updatedRecords[incident.id] = {
          status: "failed",
          lastSyncedAt: null,
          lastError: err instanceof Error ? err.message : "Network error",
        };
      }
    }
    syncState = {
      ...syncState,
      isSyncing: false,
      lastSyncAttempt: now,
      records: updatedRecords,
    };
    persistSyncState();
    emitSyncChange();
  }
}
