# SignalPulse NG — Reusable Frontend Component Specification

> **Document ID:** `CTO002-B-04`
> **Status:** Proposed (Awaiting CTO Review)
> **Owner:** Antigravity (Principal Frontend Engineer & Product Design Lead)
> **Scope:** Semantic HTML structure, TypeScript prop interfaces, keyboard/ARIA accessibility contracts, and responsive rules for the 14 core reusable UI components.

---

## Architectural Guardrails for Component Implementation

1. **Zero Competing UI Frameworks:** Built with semantic React + TypeScript + standard CSS custom properties / Tailwind utility classes (matching Codex's `CTO002-A` configuration). No Material UI, Chakra, Ant Design, or heavy runtime CSS-in-JS.
2. **Contract-Driven Provenance:** Every data-display component (`MeasurementResultCard`, `IncidentCard`, `EvidenceSummaryPreview`, `OfficialSourceCard`) requires an explicit `provenance: ProvenanceType` prop so unlabeled data cannot compile.
3. **48px Minimum Touch Targets:** Every interactive control enforces `min-height: 48px` (`3rem`) and `min-width: 48px` with visible `:focus-visible` outlines (`2px solid #0B5D4C`, `offset: 2px`).

---

## 1. Header & Mobile Navigation (`<AppShellNavigation />`)

- **Semantic HTML:** `<header role="banner">` + `<nav aria-label="Primary Navigation">` (desktop left rail / mobile bottom bar) + `<main id="main-content" tabIndex={-1}>` with a first-child `<a href="#main-content" className="skip-link">Skip to main content</a>`.
- **Props Interface:**
  ```ts
  export type NavRouteId = 'home' | 'check' | 'incidents' | 'evidence' | 'intelligence' | 'guidance';

  export interface AppShellNavigationProps {
    activeRoute: NavRouteId;
    onNavigate: (route: NavRouteId) => void;
    isOnline: boolean;
    localDraftCount: number;
  }
  ```
- **Accessibility & Keyboard:**
  - Active link sets `aria-current="page"`.
  - Connection status pill uses `role="status"` and `aria-live="polite"` when switching between `Online` and `Offline — Local Drafts Active`.

---

## 2. Buttons & Action Links (`<Button />`)

- **Semantic HTML:** `<button type="button | submit | reset">` or `<a>` when navigating across routes.
- **Props Interface:**
  ```ts
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'md' | 'lg'; // md = 48px min-height, lg = 52px min-height
    fullWidthOnMobile?: boolean;
    isLoading?: boolean;
    loadingText?: string;
  }
  ```
- **Accessibility:** When `isLoading={true}`, sets `aria-busy="true"` and disables duplicate submission while preserving readable `loadingText`.

---

## 3. Operator Selection (`<OperatorSelector />`)

- **Semantic HTML:** `<fieldset>` + `<legend>` containing a `2x2` grid of `<label>`-wrapped `<input type="radio" name="operator">` controls.
- **Props Interface:**
  ```ts
  export type OperatorId = 'mtn' | 'airtel' | 'glo' | 't2mobile';

  export interface OperatorSelectorProps {
    value: OperatorId | null;
    onChange: (operator: OperatorId) => void;
    required?: boolean;
    errorMessage?: string;
    helperText?: string;
  }
  ```
- **UX & Provenance Rule:** Renders an automatic inline caption: `"Provenance: User Reported (browsers cannot verify active SIM carrier)"`.
- **Keyboard:** Arrow keys (`Up/Down/Left/Right`) move selection between MTN, Airtel, Glo, and T2mobile natively via `<input type="radio">`.

---

## 4. Area Selection (`<LagosAreaSelector />`)

- **Semantic HTML:** `<fieldset>` with two paired `<label>` + `<select>` controls:
  1. `lga` (20 official Lagos State LGAs)
  2. `neighbourhood` (filtered dynamically by selected LGA, plus `"Other / Unlisted in LGA"`)
- **Props Interface:**
  ```ts
  export interface LagosAreaSelection {
    state: 'Lagos';
    lga: string;
    neighbourhood?: string;
  }

  export interface LagosAreaSelectorProps {
    value: LagosAreaSelection;
    onChange: (area: LagosAreaSelection) => void;
    lgaRequired?: boolean;
    neighbourhoodOptional?: boolean;
    errorMessage?: string;
  }
  ```
- **Privacy Guardrail:** Includes an inline lock note: `"Manual area selection only. SignalPulse NG does not request GPS coordinates."`

---

## 5. Form Inputs (`<FormField />`, `<TextAreaField />`, `<DateTimeField />`)

- **Semantic HTML:** Explicit `<label htmlFor={id}>`, `<input>` / `<textarea>`, linked helper `<p id="{id}-hint">`, and error `<p id="{id}-error" role="alert">` via `aria-describedby`.
- **Mobile Optimization:** Base font size is strictly `16px` (`1rem`) on all inputs to prevent forced viewport zoom on iOS Safari and Android Chrome.

---

## 6. Provenance / Source Labels (`<ProvenanceBadge />`)

- **Semantic HTML:** `<span className="sp-provenance-badge" data-provenance={type}>` with an inline SVG icon (`aria-hidden="true"`) + explicit text label.
- **Props Interface:**
  ```ts
  export type ProvenanceType =
    | 'app_measured'
    | 'device_observed'
    | 'user_reported'
    | 'user_attached'
    | 'official_source';

  export interface ProvenanceBadgeProps {
    type: ProvenanceType;
    isPreview?: boolean; // appends "(PREVIEW)" when showing synthetic UI state
  }
  ```

---

## 7. Status Indicators (`<RecordStatusBadge />`)

- **Purpose:** Distinguishes local offline drafts from saved private records and sync errors.
- **Props Interface:**
  ```ts
  export type RecordStorageStatus =
    | 'draft_local'
    | 'queued_sync'
    | 'saved_private'
    | 'sync_error';
  ```

---

## 8. Progress Indicators (`<BoundedTestProgress />`)

- **Semantic HTML:** `<div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={phaseLabel}>` paired with an `aria-live="polite"` status summary and a `48px` `"Cancel Check"` button.
- **Props Interface:**
  ```ts
  export interface BoundedTestProgressProps {
    phase: 'latency' | 'download' | 'complete' | 'cancelled' | 'timeout' | 'failed';
    latencySamplesCompleted: number;
    latencySamplesTotal: number;
    bytesTransferred: number;
    maxBytesCap: number; // Derived from calibrated methodology config, not hardcoded
    elapsedSeconds: number;
    maxSecondsCap: number; // Derived from calibrated methodology config, not hardcoded
    onCancel: () => void;
  }
  ```

---

## 9. Measurement Result Presentation (`<MeasurementResultCard />`)

- **Purpose:** Displays HTTP latency and download throughput alongside mandatory methodology metadata and qualification notices.
- **Props Interface:**
  ```ts
  export interface MeasurementResultData {
    id: string;
    isSyntheticPreview: boolean;
    provenance: 'app_measured';
    methodologyVersion: string;
    endpointRegion: string;
    startedAtUtc: string;
    completedAtUtc: string;
    operator: OperatorId; // user_reported
    lga: string;          // user_reported
    neighbourhood?: string;
    wifiExclusionStatus: 'user_confirmed' | 'device_hint_cellular' | 'unknown';
    deviceNetworkHint?: string; // device_observed
    completionState: 'completed' | 'partial_timeout' | 'cancelled' | 'failed';
    httpLatencyMs: {
      median: number | null;
      min: number | null;
      jitter: number | null;
      samplesCompleted: number;
      samplesTotal: number;
    };
    downloadThroughputMbps: number | null;
    bytesTransferred: number;
    durationSeconds: number;
  }
  ```
- **Anti-Misrepresentation Enforcement:** Component automatically renders `"Application-Level HTTP Latency (Not ICMP Ping)"` and `"Measured Download Throughput for This Test"` and refuses to render unqualified single-word labels like `"Speed"`.

---

## 10. Incident Cards (`<IncidentCard />`)

- **Semantic HTML:** `<article aria-labelledby="incident-title-{id}">`.
- **Provisional Category Keys (6 Categories):** `'slow_unusable_data' | 'no_service' | 'failed_dropped_calls' | 'data_depletion_discrepancy' | 'failed_purchase' | 'billing_dispute'`.
- **Displays:** Category heading, `<ProvenanceBadge type="user_reported" />`, optional `<ProvenanceBadge type="user_attached" />` if attachment exists, `<RecordStatusBadge />` (clearly indicating local draft vs private saved record), operator & Lagos LGA tags, WAT/UTC timestamp, factual description, and footer buttons (`Edit`, `Add to Evidence`, `Delete`).

---

## 11. Evidence Summaries (`<EvidenceSummaryPreview />`)

- **Semantic HTML:** `<section aria-label="Evidence Dossier Preview">` formatted both for screen inspection and clean `@media print` output.
- **Displays:**
  1. Dossier header with generation timestamp (`UTC` & `WAT`) and unique local reference ID.
  2. Prominent verification & legal limitation box.
  3. Subscriber-supplied complaint context & operator ticket reference.
  4. Segregated tables/cards for `APP MEASURED` connectivity checks vs `USER REPORTED` / `USER ATTACHED` incidents.

---

## 12. Public Intelligence Publication State Cards (`<PublicationStateCard />` & `<HonestEmptyState />`)

- **Purpose:** Used across Network Intelligence to display area-level metrics strictly according to backend publication states, and in Incident Journal when 0 records exist.
- **Props Interface:**
  ```ts
  export type BackendPublicationState = 'insufficient_data' | 'withheld' | 'published';

  export interface PublicationStateCardProps {
    publicationState: BackendPublicationState;
    geography: { state: 'Lagos'; lga: string };
    observationWindow: { startUtc: string; endUtc: string };
    methodologyVersion: string;
    metrics?: {
      operators: Array<{
        operator: OperatorId;
        httpLatencyMedianMs: number;
        httpLatencyIqrMs: [number, number];
        downloadThroughputMedianMbps: number;
        downloadThroughputIqrMbps: [number, number];
      }>;
    };
  }

  export interface HonestEmptyStateProps {
    variant: 'empty_history' | 'insufficient_data' | 'withheld' | 'offline_error' | 'unsupported_browser';
    title: string;
    explanation: string;
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
  }
  ```
- **Privacy & Security Enforcement:** The component never accepts or exposes raw contributor counts, suppressed counts, or internal abuse-review details. In `insufficient_data` and `withheld` states, no distribution metrics are rendered.

---

## 13. Confirmation Dialogs (`<ConfirmDialog />`)

- **Semantic HTML:** Native `<dialog>` element (or accessible modal with `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, focus trap, and `Escape` key dismissal).
- **Primary Use Cases:**
  - Confirming permanent deletion of a local incident draft or saved record.
  - Confirming cancellation or clearing of an assembled evidence summary.

---

## 14. Privacy & Methodology Disclosures (`<DisclosureCallout />`)

- **Semantic HTML:** `<aside aria-label={title}>` or collapsible `<details><summary>` for detailed methodology specifications.
- **Variants:**
  - `privacy_reassurance` (No GPS, no MSISDN/IMEI, private by default)
  - `pii_upload_warning` (Displayed adjacent to file input in Incident Journal)
  - `methodology_limitations` (Explains PWA cellular telemetry boundaries)
  - `official_source_citation` (Renders publisher, source URL/reference, effective period, retrieved date, and review status for NCC guidance)
