// Lightweight per-user health data store, mirroring the localStorage "mock DB"
// pattern already used by AuthContext. This lets pages that collect a patient's
// own health data (Tracker, Vitals) persist it, and lets admin-facing tools
// (MedTrace) read it back for a given patient by username.

export interface StoredMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  condition: string;
  count: number;
  total: number;
}

export interface StoredVitalEntry {
  date: string;       // ISO date or display label
  systolic?: number;
  diastolic?: number;
  sugar?: number;
  hr?: number;
  temp?: number;
}

const MEDS_KEY = (username: string) => `medpal_medications_${username}`;
const VITALS_KEY = (username: string) => `medpal_vitals_${username}`;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.)
  }
}

export function getMedications(username: string): StoredMedication[] | null {
  if (!username) return null;
  const raw = localStorage.getItem(MEDS_KEY(username));
  return raw ? safeGet<StoredMedication[]>(MEDS_KEY(username), []) : null;
}

export function setMedications(username: string, meds: StoredMedication[]) {
  if (!username) return;
  safeSet(MEDS_KEY(username), meds);
}

export function getVitalsLog(username: string): StoredVitalEntry[] | null {
  if (!username) return null;
  const raw = localStorage.getItem(VITALS_KEY(username));
  return raw ? safeGet<StoredVitalEntry[]>(VITALS_KEY(username), []) : null;
}

export function setVitalsLog(username: string, entries: StoredVitalEntry[]) {
  if (!username) return;
  safeSet(VITALS_KEY(username), entries);
}

export function addVitalsEntry(username: string, entry: StoredVitalEntry) {
  const existing = getVitalsLog(username) || [];
  const next = [...existing, entry];
  setVitalsLog(username, next);
  return next;
}
