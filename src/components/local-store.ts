import { useSyncExternalStore } from "react";
import { incidentSchema, type Incident } from "@/contracts/incidents";
import type { Measurement } from "@/contracts/measurements";

const INCIDENTS_KEY = "signalpulse_local_incidents_v0.1";

export type StorageWriteResult =
  | { success: true }
  | {
      success: false;
      error: "storage_unavailable" | "quota_exceeded" | "validation_error" | "write_failed" | "simulation_isolated";
      message: string;
    };

export interface StorageDiagnostics {
  isAvailable: boolean;
  rawCount: number;
  validCount: number;
  corruptedCount: number;
  isMalformed: boolean;
}

const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let cachedIncidentsRaw: string | null | undefined = undefined;
let cachedIncidents: Incident[] = [];
let currentDiagnostics: StorageDiagnostics = {
  isAvailable: false,
  rawCount: 0,
  validCount: 0,
  corruptedCount: 0,
  isMalformed: false,
};

/**
 * Checks whether window.localStorage is accessible without throwing.
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return typeof window.localStorage !== "undefined" && window.localStorage !== null;
  } catch {
    return false;
  }
}

/**
 * Safely reads and validates stored incident records.
 * Invalid or malformed records are filtered out to prevent data corruption.
 */
export function getLocalIncidents(): Incident[] {
  if (typeof window === "undefined" || !isLocalStorageAvailable()) {
    currentDiagnostics = {
      isAvailable: false,
      rawCount: 0,
      validCount: 0,
      corruptedCount: 0,
      isMalformed: false,
    };
    return [];
  }

  try {
    const raw = window.localStorage.getItem(INCIDENTS_KEY);
    if (raw === cachedIncidentsRaw) return cachedIncidents;
    cachedIncidentsRaw = raw;
    if (!raw) {
      cachedIncidents = [];
      currentDiagnostics = {
        isAvailable: true,
        rawCount: 0,
        validCount: 0,
        corruptedCount: 0,
        isMalformed: false,
      };
      return cachedIncidents;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      cachedIncidents = [];
      currentDiagnostics = {
        isAvailable: true,
        rawCount: 0,
        validCount: 0,
        corruptedCount: 1,
        isMalformed: true,
      };
      return cachedIncidents;
    }

    if (!Array.isArray(parsed)) {
      cachedIncidents = [];
      currentDiagnostics = {
        isAvailable: true,
        rawCount: 0,
        validCount: 0,
        corruptedCount: 1,
        isMalformed: true,
      };
      return cachedIncidents;
    }

    // Strictly validate each record against the canonical contract
    const validated: Incident[] = [];
    for (const item of parsed) {
      const result = incidentSchema.safeParse(item);
      if (result.success) {
        validated.push(result.data);
      }
    }

    const corruptedCount = Math.max(0, parsed.length - validated.length);
    currentDiagnostics = {
      isAvailable: true,
      rawCount: parsed.length,
      validCount: validated.length,
      corruptedCount,
      isMalformed: false,
    };

    cachedIncidents = validated;
    return cachedIncidents;
  } catch {
    currentDiagnostics = {
      isAvailable: false,
      rawCount: 0,
      validCount: 0,
      corruptedCount: 0,
      isMalformed: true,
    };
    return [];
  }
}

/**
 * Returns diagnostic metadata regarding the health of local storage.
 */
export function getStorageDiagnostics(): StorageDiagnostics {
  // Ensure we have current reading
  getLocalIncidents();
  return currentDiagnostics;
}

/**
 * In this milestone, live calibrated measurements are unavailable.
 * Simulated measurements are strictly isolated and never stored in genuine evidence.
 */
export function getLocalMeasurements(): Measurement[] {
  return [];
}

/**
 * Persists an incident record to localStorage with schema validation and error handling.
 */
export function saveLocalIncident(incident: Incident): StorageWriteResult {
  // Validate against canonical contract
  const validation = incidentSchema.safeParse(incident);
  if (!validation.success) {
    return {
      success: false,
      error: "validation_error",
      message: "The incident record does not conform to the canonical incident schema.",
    };
  }

  if (typeof window === "undefined" || !isLocalStorageAvailable()) {
    return {
      success: false,
      error: "storage_unavailable",
      message: "Browser local storage is not available in this environment (e.g. private browsing restrictions or cookies disabled).",
    };
  }

  try {
    const current = getLocalIncidents();
    if (currentDiagnostics.isMalformed || currentDiagnostics.corruptedCount > 0) {
      return { success: false, error: "validation_error", message: "Stored reports contain unreadable data. Export the original browser data before changing reports." };
    }
    const updated = [validation.data, ...current.filter((i) => i.id !== incident.id)];
    if (updated.length > 50) {
      return { success: false, error: "quota_exceeded", message: "This device already holds 50 reports. Export important reports before removing any." };
    }
    const serialized = JSON.stringify(updated);
    window.localStorage.setItem(INCIDENTS_KEY, serialized);
    cachedIncidentsRaw = serialized;
    cachedIncidents = updated;
    currentDiagnostics = {
      isAvailable: true,
      rawCount: updated.length,
      validCount: updated.length,
      corruptedCount: 0,
      isMalformed: false,
    };
    emitChange();
    return { success: true };
  } catch (err: unknown) {
    if (
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED" || err.code === 22 || err.code === 1014)
    ) {
      return {
        success: false,
        error: "quota_exceeded",
        message: "Browser storage quota exceeded. Please export or delete older incident entries to free space.",
      };
    }
    if (err instanceof DOMException && err.name === "SecurityError") {
      return {
        success: false,
        error: "storage_unavailable",
        message: "Browser local storage access is restricted or disabled.",
      };
    }
    return {
      success: false,
      error: "write_failed",
      message: "An unexpected error occurred while saving the incident to browser storage.",
    };
  }
}

/**
 * Deletes an incident record by ID.
 */
export function deleteLocalIncident(id: string): StorageWriteResult {
  if (typeof window === "undefined" || !isLocalStorageAvailable()) {
    return {
      success: false,
      error: "storage_unavailable",
      message: "Browser local storage is not available.",
    };
  }

  try {
    const current = getLocalIncidents();
    if (currentDiagnostics.isMalformed || currentDiagnostics.corruptedCount > 0) {
      return { success: false, error: "validation_error", message: "Stored reports contain unreadable data. Export the original browser data before changing reports." };
    }
    const updated = current.filter((i) => i.id !== id);
    const serialized = JSON.stringify(updated);
    window.localStorage.setItem(INCIDENTS_KEY, serialized);
    cachedIncidentsRaw = serialized;
    cachedIncidents = updated;
    currentDiagnostics = {
      isAvailable: true,
      rawCount: updated.length,
      validCount: updated.length,
      corruptedCount: 0,
      isMalformed: false,
    };
    emitChange();
    return { success: true };
  } catch {
    return {
      success: false,
      error: "write_failed",
      message: "Failed to remove the incident from browser storage.",
    };
  }
}

/**
 * Purges unreadable or corrupted records from localStorage, keeping only verified valid records.
 */
export function purgeCorruptedIncidents(): StorageWriteResult {
  return { success: false, error: "validation_error", message: "Unreadable reports were preserved. Export the original browser data before any repair." };
}

/**
 * Rejects saving simulated measurements into genuine evidence storage.
 * Enforces architectural isolation between test runner simulation and real evidence.
 */
export function saveLocalMeasurement(_measurement: Measurement): StorageWriteResult {
  void _measurement;
  return {
    success: false,
    error: "simulation_isolated",
    message: "Live network measurements are not active in this release. Simulated metrics cannot be saved to the evidence ledger.",
  };
}

const emptyIncidents: Incident[] = [];
const emptyMeasurements: Measurement[] = [];
const defaultDiagnostics: StorageDiagnostics = {
  isAvailable: true,
  rawCount: 0,
  validCount: 0,
  corruptedCount: 0,
  isMalformed: false,
};

export function useLocalIncidents(): Incident[] {
  return useSyncExternalStore(subscribeStore, getLocalIncidents, () => emptyIncidents);
}

export function useLocalMeasurements(): Measurement[] {
  return useSyncExternalStore(subscribeStore, getLocalMeasurements, () => emptyMeasurements);
}

export function useStorageDiagnostics(): StorageDiagnostics {
  return useSyncExternalStore(subscribeStore, getStorageDiagnostics, () => defaultDiagnostics);
}
