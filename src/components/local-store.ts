import { useSyncExternalStore } from "react";
import type { Incident } from "@/contracts/incidents";
import type { Measurement } from "@/contracts/measurements";

const INCIDENTS_KEY = "signalpulse_local_incidents_v0.1";
const MEASUREMENTS_KEY = "signalpulse_local_measurements_v0.1";

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

let cachedIncidentsRaw: string | null = null;
let cachedIncidents: Incident[] = [];

export function getLocalIncidents(): Incident[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INCIDENTS_KEY);
    if (raw === cachedIncidentsRaw) return cachedIncidents;
    cachedIncidentsRaw = raw;
    cachedIncidents = raw ? JSON.parse(raw) : [];
    return cachedIncidents;
  } catch {
    return [];
  }
}

let cachedMeasurementsRaw: string | null = null;
let cachedMeasurements: Measurement[] = [];

export function getLocalMeasurements(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MEASUREMENTS_KEY);
    if (raw === cachedMeasurementsRaw) return cachedMeasurements;
    cachedMeasurementsRaw = raw;
    cachedMeasurements = raw ? JSON.parse(raw) : [];
    return cachedMeasurements;
  } catch {
    return [];
  }
}

export function saveLocalIncident(incident: Incident): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalIncidents();
    const updated = [incident, ...current.filter((i) => i.id !== incident.id)];
    window.localStorage.setItem(INCIDENTS_KEY, JSON.stringify(updated.slice(0, 50)));
    emitChange();
  } catch {
    // Quota or storage unavailable
  }
}

export function deleteLocalIncident(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalIncidents();
    const filtered = current.filter((i) => i.id !== id);
    window.localStorage.setItem(INCIDENTS_KEY, JSON.stringify(filtered));
    emitChange();
  } catch {
    // Quota or storage unavailable
  }
}

export function saveLocalMeasurement(measurement: Measurement): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalMeasurements();
    const updated = [measurement, ...current.filter((m) => m.id !== measurement.id)];
    window.localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(updated.slice(0, 50)));
    emitChange();
  } catch {
    // Quota or storage unavailable
  }
}

const emptyIncidents: Incident[] = [];
const emptyMeasurements: Measurement[] = [];

export function useLocalIncidents(): Incident[] {
  return useSyncExternalStore(subscribeStore, getLocalIncidents, () => emptyIncidents);
}

export function useLocalMeasurements(): Measurement[] {
  return useSyncExternalStore(subscribeStore, getLocalMeasurements, () => emptyMeasurements);
}
