# SignalPulse NG — Storage Integrity & User Experience Contract (CTO005-B)

> **Document Status:** Active Frontend Specification  
> **Author:** Antigravity (Principal Product Designer & Staff Frontend Engineer)  
> **Target Audience:** Frontend Team, Codex (Backend/Core Engineering), QA  
> **Baseline Commit:** `9c2d0b7`  
> **Revision:** v0.1.0  

---

## 1. Purpose & Scope

This document specifies the user-facing states, error presentations, and recovery interactions for local browser persistence in SignalPulse NG. 

In accordance with **CTO005-B Section 3**, Codex is independently conducting a deep architectural audit of storage corruption and recovery algorithms. To avoid competing persistence logic, this specification defines the **presentation interface, state contract, and user experience requirements** that the frontend implements to gracefully communicate storage integrity events to subscribers.

---

## 2. Five Canonical Storage Failure & Integrity States

```
+-----------------------------------------------------------------------------------+
|                              LOCAL STORAGE INTEGRITY                              |
+---------------------+-------------------------------+-----------------------------+
| State Code          | Cause                         | User Experience Action      |
+---------------------+-------------------------------+-----------------------------+
| ACCESS_DENIED       | Private window, disabled      | Persistent warning banner;  |
|                     | cookies, or security error    | form inputs kept in memory. |
+---------------------+-------------------------------+-----------------------------+
| QUOTA_EXCEEDED      | Device / browser storage full | Form preserved; actionable  |
|                     | (DOMException code 22/1014)   | export/delete instructions. |
+---------------------+-------------------------------+-----------------------------+
| CORRUPTED_RECORDS   | Malformed JSON syntax or      | Non-destructive notice;     |
|                     | non-array stored payload      | valid entries preserved;    |
|                     |                               | option to purge invalid.    |
+---------------------+-------------------------------+-----------------------------+
| UNSUPPORTED_FORMAT  | Schema mismatch, legacy keys, | Valid entries isolated;     |
|                     | or missing required fields    | legacy entries flagged.     |
+---------------------+-------------------------------+-----------------------------+
| PARTIAL_RECOVERY    | Some records valid, some      | Healthy entries loaded;     |
|                     | invalid within same array     | user informed of count.     |
+---------------------+-------------------------------+-----------------------------+
```

---

## 3. Detailed UX State Specifications

### State 1: Storage Access Denial (`storage_unavailable` / `ACCESS_DENIED`)
- **Trigger:** `window.localStorage` throws a `SecurityError`, is disabled by browser policies, or is unavailable in restricted iframe contexts.
- **User-Facing Presentation:**
  - In `Incident Journal` (`/incidents`): An alert banner displayed above the form:
    > **⚠️ Local Storage Inaccessible:**  
    > *This browser has restricted local storage access (common in strict private/incognito windows or when third-party site storage is blocked). You may still test and compose incident entries, but they will not persist across browser reloads.*
  - In `Evidence Builder` (`/evidence`):
    > *Local storage is unavailable. No stored records can be read on this device.*
- **Behavioral Guarantee:**
  - The application must not crash or display a blank screen.
  - All form entries remain preserved in React component state.

---

### State 2: Quota Exceeded (`quota_exceeded`)
- **Trigger:** Browser raises `QuotaExceededError` (DOMException name `QuotaExceededError` or code `22`/`1014`) when saving an incident.
- **User-Facing Presentation:**
  - Form remains fully populated with the user's narrative and details.
  - Form displays an immediate inline warning alert:
    > **⚠️ Storage Quota Exceeded:**  
    > *Your browser's local storage limit for this site has been reached. Your current form input has been preserved in memory.*  
    > **Recovery Steps:**
    > 1. Do not close or refresh this tab (your text is safe in the form below).
    > 2. Open [Evidence Builder](/evidence) in another tab or window to download your saved records as a JSON dossier.
    > 3. Delete resolved or older incidents from your journal to free storage space.
- **Behavioral Guarantee:**
  - The form is **never wiped or reset** upon a write failure.

---

### State 3: Malformed JSON / Total Corruption (`CORRUPTED_RECORDS`)
- **Trigger:** `window.localStorage.getItem(INCIDENTS_KEY)` returns unparseable text (e.g. truncated string, syntax error, or non-JSON content).
- **User-Facing Presentation:**
  - The parser catches `SyntaxError` safely.
  - An inline alert banner appears above the ledger:
    > **⚠️ Local Storage Corrupted:**  
    > *The incident journal data in this browser was unreadable or corrupted. To protect your session, no invalid entries were loaded.*  
    > *[Reset Ledger]* (Clears only corrupted key without affecting other browser storage).
- **Behavioral Guarantee:**
  - Parser never throws an unhandled exception to the React render tree.

---

### State 4: Unsupported Format / Schema Mismatch (`UNSUPPORTED_FORMAT`)
- **Trigger:** The stored payload is valid JSON, but the data structure does not match `incidentSchema` (e.g. outdated pre-alpha fields, unexpected types, or missing UUIDs).
- **User-Facing Presentation:**
  - The record fails `incidentSchema.safeParse`.
  - The record is quarantined from the main ledger so it cannot pollute evidence export dockets.
  - The UI displays:
    > *Storage Notice: 1 record from an unsupported schema version was detected and safely excluded.*

---

### State 5: Partial Record Recovery (`PARTIAL_RECOVERY`)
- **Trigger:** The stored array contains `N` items, where `V` items pass `incidentSchema.safeParse` and `C` items fail.
- **User-Facing Presentation:**
  - All `V` valid items are loaded normally and rendered in the journal and evidence picker.
  - A discreet notification badge informs the subscriber:
    > *Integrity Notice: Loaded {V} valid records. {C} invalid entry was excluded.*
  - A utility action button *"Clean Ledger"* allows the subscriber to prune only the `C` invalid entries, preserving all `V` valid records.

---

## 4. Coordination Contract with Codex

1. **Storage Keys:**
   - Active canonical incidents: `signalpulse_local_incidents_v0.1`
   - Quarantined / legacy entries (when implemented by Codex): `signalpulse_quarantine_v0.1`
2. **Schema Invariant:**
   - Every incident surfaced to the user or Evidence Builder must pass `incidentSchema.safeParse`.
3. **Data Loss Invariant:**
   - Under no circumstance may an error in one record cause the silent deletion of valid neighboring records.
   - Form inputs must never be cleared upon a storage failure.
