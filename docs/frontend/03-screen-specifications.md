# SignalPulse NG — Six Product Experience Specifications

> **Document ID:** `CTO002-B-03`
> **Status:** Proposed (Awaiting CTO Review)
> **Owner:** Antigravity (Principal Frontend Engineer & Product Design Lead)
> **Scope:** Detailed wire-level layout, user journey, copywriting, state matrix, and provenance guardrails for all six core SignalPulse NG experiences.

---

## Experience A: Home / Overview (`/`)

### 1. Purpose & Subscriber Promise
Establish immediate trust and clarity: *"Measure what can be measured. Document what happened. Understand what to do next."* Differentiate SignalPulse NG from generic speed-test apps and make clear what the platform can and cannot verify.

### 2. Layout & Information Hierarchy (Mobile-First Top-to-Bottom)
1. **Hero & Core Promise Banner:**
   - Eyebrow badge: `INDEPENDENT CONSUMER EVIDENCE PLATFORM • LAGOS, NIGERIA`
   - Headline (`h1`): **"Measure what can be measured. Document what happened. Understand what to do next."**
   - Lead copy: *"SignalPulse NG helps Lagos mobile subscribers run bounded connection checks, log service incidents offline or online, and assemble structured evidence summaries for provider and NCC escalation."*
   - **Primary Action Pair (Full-width stacked on `320px`, side-by-side on `>= 400px`):**
     - Primary Button (`#0B5D4C`): **"Check my connection"** (`-> /check`)
     - Secondary Button (High-contrast outline): **"Report a problem"** (`-> /incidents`)
2. **Four-Pillar Truth Matrix ("What SignalPulse Does — And Does Not Do"):**
   - **Card 1 — What We Measure (`APP MEASURED` badge):** Application-level HTTP request latency and bounded download throughput under your disclosed test conditions.
   - **Card 2 — What You Can Document (`USER REPORTED` / `USER ATTACHED` badges):** Slow or unusable data, loss of service, dropped calls, suspected bundle depletion discrepancies, failed recharges, and billing disputes—even while offline.
   - **Card 3 — What Evidence Summaries Help You Do:** Organize timestamped test logs and incident notes into a clean, private PDF/JSON docket to support formal operator complaints and NCC escalations.
   - **Card 4 — What We Cannot Independently Verify (`LIMITATION` alert box):** A web browser cannot read cellular tower IDs, radio signal dBm, carrier billing ledgers, or prove deliberate throttling or fraud. SignalPulse does not guarantee compensation.
3. **Privacy & Independence Reassurance Strip:**
   - Explicit bullets:
     - **No GPS Required:** Manual Lagos LGA & neighbourhood selection only.
     - **No SIM/Phone Number Harvesting:** We never collect MSISDN, IMEI, IMSI, or contacts.
     - **Private by Default:** Your incident narratives and attachments are never published publicly.
     - **100% Independent:** Not operated by MTN, Airtel, Glo, T2mobile, or the NCC.
4. **Secondary Navigation Cards:**
   - Quick links to **Evidence Builder** (`/evidence`), **Network Intelligence** (`/intelligence` — showing honest cohort status), and **NCC Consumer Guidance** (`/guidance`).

---

## Experience B: Network Check (`/check`)

### 1. Purpose
Guide the subscriber through an 8-step controlled, bounded, and transparently disclosed connectivity check using **clearly labelled synthetic previews** until backend measurement endpoints are live.

### 2. End-to-End 8-Step User Flow
- **Step 1 — Select Operator (`user_reported`):**
  - 2x2 accessible radio card grid: **MTN**, **Airtel**, **Glo**, **T2mobile**.
  - Helper caption: *"Labeled as User-Reported because browsers cannot read your active SIM card."*
- **Step 2 — Select Lagos LGA & Neighbourhood (`user_reported`):**
  - Required `<select>` for the 20 Lagos LGAs + optional curated Neighbourhood `<select>`.
  - Explicit note: *"Manual selection only. GPS is never requested."*
- **Step 3 — Confirm Mobile-Data Usage (`user_reported` + `device_observed` hint):**
  - Required checkbox (`48px` hit target): *"I confirm this device is currently connected via mobile data on the selected operator (not Wi-Fi or another phone's hotspot)."*
  - Supplemental browser hint pill (`DEVICE HINT`): Displays `navigator.connection.effectiveType` / `type` when supported, or `"Browser network API unavailable on this device (normal on Safari/iOS)"`.
- **Step 4 — Pre-Flight Disclosure (Test Limitations & Data Budget):**
  - Framed specification box showing:
    - **Data Consumption Limit:** `CONFIG_MAX_BYTES_PLACEHOLDER` (Illustrative non-production preview: e.g. `<= 1.5 MB` placeholder; final limit calibrated by approved methodology).
    - **Timeout Boundary:** `CONFIG_TIMEOUT_MS_PLACEHOLDER` (Illustrative non-production preview: e.g. `15.0s` placeholder; final duration calibrated by approved methodology).
    - **Methodology Version:** `sp-http-v0.1-preview` (Methodology calibrated independently from UI).
    - **What Is Measured:** Application-level HTTP request latency (ms) and bounded payload download throughput (Mbps). Not ICMP ping.
- **Step 5 — Initiate Test:**
  - Primary CTA: **"Start Bounded Connection Check (Preview Demonstration)"** (disabled until Steps 1–3 are completed).
- **Step 6 — Observe Progress (Cancellable):**
  - Live progress bar (`aria-live="polite"`) showing Phase 1 (*HTTP Latency Samples: 1/5...5/5*), Phase 2 (*Bounded Download Payload: e.g. 0.42 MB / 1.50 MB illustrative placeholder transferred*), and elapsed timer (`04.2s / 15.0s placeholder`).
  - Prominent **"Cancel Check Immediately"** button (`min-height: 48px`) that halts transfer and records a `cancelled_by_user` state.
- **Step 7 — View Results (`SYNTHETIC PREVIEW` Banner Active):**
  - Top amber/blue banner: **`SYNTHETIC UI PREVIEW — NO LIVE NETWORK TRAFFIC SENT`** (ensuring zero confusion with live tests).
  - Metric Cards (`tabular-nums`):
    - **Application-Level HTTP Latency:** Median `84 ms` (Min `68 ms`, Jitter `19 ms`, `5/5 samples`) — Badge: `APP MEASURED (PREVIEW)`.
    - **Measured Download Throughput (This Test):** `6.42 Mbps` (`1.24 MB transferred in 1.54s` — Illustrative non-production values) — Badge: `APP MEASURED (PREVIEW)`.
  - **Methodology & Context Metadata Drawer:** Displays UTC & WAT timestamps, method version `sp-http-v0.1-preview`, Endpoint region (`lagos-preview-01`), Wi-Fi exclusion status (`User-Confirmed`), and browser hint.
- **Step 8 — Save or Document the Experience:**
  - Action 1: **"Save to Local Test History (Prototype Local State)"**
  - Action 2: **"Attach to New Incident Report"** (`-> /incidents` with test ID pre-linked)
  - Action 3: **"Add to Evidence Builder"** (`-> /evidence`)

### 3. Edge & Failure States Designed in UI
Switchable state preview control in the prototype allows inspecting:
1. **`ready`** — Pre-test configuration & disclosure.
2. **`running`** — Active progress with byte counter and `"Cancel Check"` button.
3. **`completed_preview`** — Qualified synthetic result with provenance tags.
4. **`cancelled`** — User aborted mid-check; shows exact bytes consumed before abort (e.g. `0.38 MB illustrative`) and option to retry.
5. **`timeout_partial`** — Test hit the configuration-driven timeout cap; returns a **Limited/Qualified Result** showing completed latency samples while marking download throughput as `"Incomplete (Timed Out at Config Limit)"`.
6. **`failed_offline`** — Connection dropped completely; prompts user to **"Log 'No Service / Loss of Connectivity' Incident Offline"** immediately.
7. **`unsupported_browser`** — Graceful degradation notice if required fetch/timing APIs are restricted.

---

## Experience C: Incident Journal (`/incidents`)

### 1. Purpose
Provide a structured, calm, offline-capable reporting ledger where subscribers record service incidents with strict `USER REPORTED` and `USER ATTACHED` provenance.

### 2. Provisional Six Incident Categories (`CTO001-r1` Scope)
Per `CTO001-r1`, the provisional product scope comprises exactly **six approved incident categories**. (Note: An older `AGENTS.md` listed a 7th item "other network/service issue". Per `CTO002-B.1`, the provisional frontend scope is strictly the 6 approved categories below; the contract discrepancy is formally recorded for Codex reconciliation):

| # | Category Key | Display Label | Structured Prompt Helper |
| :--- | :--- | :--- | :--- |
| 1 | `slow_unusable_data` | **Slow or unusable data** | Pages failing to load, apps timing out despite active data bundle |
| 2 | `no_service` | **No service / loss of connectivity** | Complete loss of signal bars, emergency calls only, or dead data connection |
| 3 | `failed_dropped_calls` | **Failed or dropped calls** | Calls failing to connect, dropping mid-conversation, or one-way audio |
| 4 | `data_depletion_discrepancy` | **Suspected data-bundle depletion discrepancy** | Bundle balance exhausting faster than expected usage (Note: requires user documentation; app cannot audit carrier billing ledger) |
| 5 | `failed_purchase` | **Failed airtime or data purchase** | Bank/USSD debit occurred but airtime or data bundle was not credited |
| 6 | `billing_dispute` | **Billing dispute** | Unexplained airtime deduction, VAS subscription charge, or tariff discrepancy |

### 3. Form Fields & Safeguards
- **Operator Selection (Required):** MTN, Airtel, Glo, T2mobile (`USER REPORTED`).
- **Location Selection (Optional):** Lagos LGA + Neighbourhood selector (`"Optional — helps organize your evidence log"`).
- **Incident Date & Time (Required):** Defaults to current WAT (`UTC+1`) time, editable for recent past incidents, stored as ISO-8601 UTC.
- **Factual Description (Required, `max 1,000 chars`):** Guided placeholder encouraging calm, factual details (*"What were you trying to do? What error message or USSD response appeared? Did you contact customer care?"*).
- **Optional Evidence Attachment (`USER ATTACHED`):**
  - Accepts PNG/JPEG/PDF (`<= 5 MB`).
  - **Mandatory PII Warning Box before file selection:** *"Privacy Reminder: Before attaching a screenshot or receipt, please crop or mask your phone number (MSISDN), bank account digits, full home address, and BVN/NIN. Attachments remain private by default."*
- **Action Bar:**
  - **"Save Local Draft (Offline-Safe)"** (`draft_local` in IndexedDB)
  - **"Save to Private Incident Log"** (`saved_private`)

### 4. Journal History & Lifecycle States
- **Empty State:** Honest card explaining *"You have not recorded any service incidents yet. Incidents you log are stored privately and never shared publicly."*
- **Saved / Local Draft Cards:** Display category title, operator pill, WAT timestamp, storage status badge (`LOCAL DRAFT` vs `SAVED PRIVATE`), provenance badges (`USER REPORTED`, `USER ATTACHED`), and inline **"Edit"**, **"Add to Evidence"**, and **"Delete"** (with confirmation modal) actions.
- **Sync Error / Retry Banner:** Non-blocking top banner when a queued incident cannot reach the server: *"Connection interrupted. Your incident is safely stored as a Local Draft on this device. [Retry Sync]"*.

---

## Experience D: Evidence Builder (`/evidence`)

### 1. Purpose
Allow subscribers to assemble selected `app_measured` tests and `user_reported` / `user_attached` incidents into a structured, timestamped evidence summary for operator escalation or NCC reference—while explicitly stating verification and legal limits.

### 2. Layout & Workflow (Split-Pane on Desktop, Stepper Tabs on Mobile)
1. **Step 1 — Select Records to Include:**
   - Checkable list of the user's private Network Checks and Incident Journal entries, filterable by Operator (`MTN`, `Airtel`, `Glo`, `T2mobile`) and date range.
   - Each item visibly carries its provenance badge (`APP MEASURED`, `USER REPORTED`, `USER ATTACHED`).
2. **Step 2 — Unified Chronological Timeline:**
   - Interleaves selected connectivity tests and logged incidents in UTC/WAT chronological order, highlighting methodology versions and keeping measured metrics visually separated from user assertions.
3. **Step 3 — Factual Complaint-Description Template:**
   - Structured fields that auto-populate a clean, non-inflammatory summary:
     - **Target Operator:** e.g., `MTN Nigeria`
     - **Primary Area Affected:** e.g., `Ikeja LGA (Alade / Computer Village)`
     - **Operator Complaint Reference / Ticket ID (if already filed):** Text input (e.g., `MTN-2026-88412`) or toggle *"I am preparing my initial complaint to the operator"*.
     - **Summary of Issue & Requested Resolution:** Pre-filled factual template that users can edit without accusatory boilerplate.
4. **Step 4 — Live Evidence Dossier Preview & Export Affordances:**
   - Renders a structured preview of the Evidence Summary showing:
     - **Document Header:** `SIGNALPULSE NG — USER-ASSEMBLED CONSUMER EVIDENCE RECORD`
     - **Mandatory Legal & Verification Disclaimer Box:**
       > *"IMPORTANT LIMITATION: This document is a user-assembled record generated via SignalPulse NG. Items marked `APP MEASURED` reflect application-level HTTP tests under user-confirmed conditions (`method: sp-http-v0.1`). Items marked `USER REPORTED` or `USER ATTACHED` are subscriber statements/files that have NOT been independently verified or audited by SignalPulse NG or the Nigerian Communications Commission (NCC). This summary does not constitute a legal finding, billing audit, or guarantee of compensation."*
   - **Export Controls (Honest Pre-Backend State):**
     - **"Preview JSON Payload (Local Preview)"** — Displays the exact structured JSON schema in an inspectable code drawer.
     - **"Export Private PDF Summary"** & **"Export Private JSON File"** — Clearly badged with `AWAITING BACKEND EXPORT VERIFICATION (CTO002-A)` so the UI never fabricates a server-side signed export before Codex's endpoint is integrated.

---

## Experience E: Network Intelligence (`/intelligence`)

### 1. Purpose
Present privacy-protected, area-level summaries of Lagos network experience **only when the backend explicitly authorizes publication**.

### 2. Backend Publication States (Proposed Contract)
Per `CTO002-B.1`, the frontend does not assume that 10 guest sessions establish 10 independent contributors, nor does it compute aggregation rules client-side. Instead, the UI renders according to three backend-issued publication states:

1. **`insufficient_data` (Default Public State):**
   - The backend indicates that not enough qualified, verified observations have met publication criteria for the selected area/operator cohort.
   - Shows an honest explanation: *"Insufficient observations to draw a reliable area conclusion. SignalPulse NG suppresses sparse cohorts to protect subscriber privacy and prevent misleading statistics."*
   - Metrics are completely suppressed.
2. **`withheld` (Publication Withheld):**
   - Observations exist for this cohort, but the backend has withheld publication due to ongoing review, data-hygiene safeguards, or quality thresholds.
   - Shows a calm, neutral status notice: *"Publication for this cohort is currently withheld pending quality and consistency review."*
   - **Crucial Rule:** Does **not** expose internal abuse-review signals, internal fraud flags, or raw contributor counts.
3. **`published` (Authorized Public Summary):**
   - The backend explicitly authorizes publication for this cohort.
   - Shows qualified distributions:
     - **Median (P50)** and **Interquartile Range (P25–P75)** for HTTP Latency (ms) and Download Throughput (Mbps) side-by-side per operator.
     - Never blends `app_measured` tests and `user_reported` incidents into a single opaque score.
     - Never provides a "best/worst" operator ranking.
     - Includes mandatory metadata header: Observation window dates, geography level, methodology version, and last-updated freshness timestamp.

### 3. UI State Demonstrations (Prototype)
The prototype provides an interactive inspection switcher between these three backend publication states (`insufficient_data` active by default, `withheld`, and `published` marked as a synthetic layout demonstration).

---

## Experience F: NCC Consumer Guidance (`/guidance`)

### 1. Purpose
Give Nigerian subscribers a clear, calm, step-by-step escalation pathway grounded strictly in sourced, dated official information—without inventing deadlines or promising compensation.

### 2. Four-Step Escalation Pathway UI
1. **Step 1 — Contact Your Network Operator First (Mandatory Prerequisite):**
   - Explains that under NCC consumer protection procedure, a subscriber must first report the issue to their operator (MTN, Airtel, Glo, or T2mobile) via official customer care channels.
2. **Step 2 — Record Your Operator Complaint Reference / Ticket Number:**
   - Explains why the ticket number, date, and summary of the operator's response are essential before escalating to the regulator. Includes a one-tap link: **"Log my ticket number in Evidence Builder"**.
3. **Step 3 — Assemble Your Supporting Evidence:**
   - Shows how to combine `APP MEASURED` connection checks and `USER REPORTED` incident logs into a factual timeline without inflammatory language.
4. **Step 4 — Escalate Unresolved Complaints via Verified NCC Channels:**
   - Presents official NCC escalation channels (e.g., **NCC Toll-Free Consumer Center: `622`**, NCC Consumer Portal) with clear guidance that the subscriber submits their complaint directly to the NCC (SignalPulse NG does not file complaints on the user's behalf in v0.1).

### 3. Official-Source Provenance Card Pattern (`OFFICIAL SOURCE`)
Every regulatory reference card renders a mandatory metadata footer:
- **Provenance Badge:** `OFFICIAL SOURCE` (`official_source`)
- **Publisher:** `Nigerian Communications Commission (NCC)`
- **Source Document / Reference:** Explicit title and canonical reference slot
- **Effective / Publication Period:** Displayed explicitly (or marked `Pending CTO001-r1 Curated Dataset Import`)
- **Last Checked / Verified Date:** Displayed in `YYYY-MM-DD` format
- **Review Status Badge:** `REVIEWED OFFICIAL RECORD` (or `SCHEMA PLACEHOLDER — AWAITING VERIFIED IMPORT`)
- **Informational Limitation Notice:** *"This lookup is informational only. Official NCC regulations and operator terms govern complaint resolution. SignalPulse NG cannot determine individual eligibility or guarantee compensation."*
