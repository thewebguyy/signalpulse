# SignalPulse NG — Contract Integration & Antigravity-to-Codex Handoff

> **Document ID:** `CTO002-B-06`
> **Status:** Ready for CTO002-A Integration
> **Owner:** Antigravity (Principal Frontend Engineer & Product Design Lead)
> **Counterpart:** Codex (`CTO002-A` — Engineering Foundation, Next.js Scaffold & Shared Contracts)

---

## 1. Repository Baseline & Missing Canonical Dependencies (`CTO001-r1`)

At the start of `CTO002-B` execution (`2026-11-16`), inspection of `C:\Users\PC\Documents\signalpulse` (`main` at commit `5ea1021`) established:

- **Present in Repository:**
  - `AGENTS.md` (`19,419 bytes` — Canonical operating contract).
- **Missing / Not Yet Committed to `main` (`CTO001-r1` & `CTO002-A` artifacts):**
  - Architecture Decision Records (ADRs)
  - Shared API/data contracts (`packages/` or `src/contracts/` or `src/lib/schemas/`)
  - Measurement methodology specification document
  - Privacy and security requirements document
  - Founder decision register & approved implementation roadmap
  - Next.js `package.json`, `tsconfig.json`, Tailwind configuration, and `src/` scaffold (`CTO002-A` in progress)

### How Antigravity Proceeded Safely
In strict adherence to `CTO002-B` §2, §3, §7, and §10:
- We **did not** create a competing Next.js application, `package.json`, `tsconfig.json`, or Tailwind config.
- All frontend specifications, design tokens, component interfaces, and the zero-dependency interactive reference harness are isolated strictly inside `docs/frontend/`.
- Existing tracked files (`AGENTS.md`) are 100% untouched.

---

## 2. Contract Alignment & Reconciliation Items (Flagged for Codex & CTO)

Before binding frontend components to Codex's `CTO002-A` Zod/TypeScript schemas, the following four contract points are formally reconciled / requested:

### 2.1 Incident Category Scope: Provisional 6 Categories (`CTO001-r1`)
- **Provisional Scope:** Exactly **six** incident categories are supported:
  1. `slow_unusable_data` (Slow or unusable data)
  2. `no_service` (No service / loss of connectivity)
  3. `failed_dropped_calls` (Failed or dropped calls)
  4. `data_depletion_discrepancy` (Suspected data-bundle depletion discrepancy)
  5. `failed_purchase` (Failed airtime or data purchase)
  6. `billing_dispute` (Billing dispute)
- **Discrepancy Recorded:** Older `AGENTS.md` §2 listed a 7th bullet `"other network/service issue"`. Per `CTO002-B.1`, the frontend adheres strictly to the six provisional categories from `CTO001-r1`. Formal contract reconciliation is requested from Codex on whether `other` will be incorporated in a future version.

### 2.2 Provenance Source Schema Contract
- **Requirement for Codex (`CTO002-A`):** Export the canonical 5-value provenance union:
  ```ts
  export const ProvenanceSourceSchema = z.enum([
    'app_measured',
    'device_observed',
    'user_reported',
    'user_attached',
    'official_source'
  ]);
  export type ProvenanceSource = z.infer<typeof ProvenanceSourceSchema>;
  ```

### 2.3 Measurement Limits & Methodology Configuration Contract
- **Clarification:** `1.5 MB` and `15 seconds` in prototype previews are illustrative non-production placeholders, **not approved measurement limits**.
- **Requirement for Codex (`CTO002-A`):** The measurement service and client must consume limits dynamically from the calibrated methodology configuration (`MAX_TEST_BYTES_CONFIG`, `MAX_TEST_DURATION_MS_CONFIG`, `METHODOLOGY_VERSION`). The frontend will display these configuration-driven parameters directly without hardcoded client assumptions.

### 2.4 Public Network Intelligence Publication States (`insufficient_data` | `withheld` | `published`)
- **Correction:** The frontend must **not** assume that 10 guest sessions establish 10 independent contributors, nor does it compute aggregation rules client-side.
- **Requirement for Codex (`CTO002-A`):** The backend aggregation endpoint (`GET /api/intelligence`) must return an explicit publication state enum:
  ```ts
  export const PublicationStateSchema = z.enum([
    'insufficient_data',
    'withheld',
    'published'
  ]);
  export type PublicationState = z.infer<typeof PublicationStateSchema>;
  ```
- **Privacy & Security Rules:**
  - When `publication_state` is `'insufficient_data'` or `'withheld'`, metric fields are `null`.
  - The API and UI must **never** expose raw contributor counts, suppressed counts, or internal abuse-review signals.
  - Metrics (Medians, IQR) are displayed only when `publication_state === 'published'`.

---

## 3. Detailed Frontend-to-Next.js Integration Mapping

| # | Existing Prototype View (`index.html`) | Intended Next.js Route | Required Components | Shared Contract Dependency (`CTO002-A`) | Backend Dependency (`CTO002-A`) | Test Requirements | File Ownership |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `#view-home` | `src/app/(public)/page.tsx` | `<AppShellNavigation>`, `<TruthMatrix>`, `<ProvenanceBadge>`, `<DisclosureCallout>` | None (static layout + trust contracts) | None | Page render test, a11y landmark test | **Antigravity** |
| **2** | `#view-check` | `src/app/(public)/check/page.tsx` | `<OperatorSelector>`, `<LagosAreaSelector>`, `<BoundedTestProgress>`, `<MeasurementResultCard>`, `<ConfirmDialog>` | `OperatorIdSchema`, `LagosLocationSchema`, `MeasurementResultSchema`, `MethodologyConfigSchema` | `POST /api/check/session`, `GET /api/check/payload` (bounded measurement endpoint) | Mock test flow, cancellation abort test, timeout state test | UI: **Antigravity**<br>Endpoint: **Codex** |
| **3** | `#view-incidents` | `src/app/(public)/incidents/page.tsx` | `<IncidentCategorySelect>`, `<IncidentCard>`, `<RecordStatusBadge>`, `<HonestEmptyState>`, `<ConfirmDialog>` | `IncidentCategorySchema` (6 categories), `IncidentSubmissionSchema`, `RecordStatusSchema` | `POST /api/incidents`, IndexedDB offline store (`src/lib/offline-store`) | Offline draft persistence, delete confirmation, form validation test | UI: **Antigravity**<br>DB/API: **Codex** |
| **4** | `#view-evidence` | `src/app/(public)/evidence/page.tsx` | `<RecordSelectorList>`, `<EvidenceTimeline>`, `<EvidenceSummaryPreview>`, `<JsonDrawer>` | `EvidenceDossierSchema`, `ProvenanceSourceSchema` | `POST /api/evidence/assemble`, `GET /api/evidence/export/pdf` (signed URL) | Dossier assembly test, disclaimer presence test, print layout test | UI: **Antigravity**<br>PDF Engine: **Codex** |
| **5** | `#view-intelligence` | `src/app/(public)/intelligence/page.tsx` | `<PublicationStateCard>`, `<HonestEmptyState>`, `<OperatorDistributionTable>` | `PublicationStateSchema`, `AreaAggregateSchema` | `GET /api/intelligence` (query params: `lga`, `window_days`) | Default `insufficient_data` test, `withheld` test, `published` distribution test | UI: **Antigravity**<br>Aggregation: **Codex** |
| **6** | `#view-guidance` | `src/app/(public)/guidance/page.tsx` | `<EscalationStepper>`, `<OfficialSourceCard>`, `<ProvenanceBadge>` | `OfficialSourceRecordSchema` | `GET /api/guidance/ncc` (sourced regulatory records) | Static link audit, official source metadata display test | UI: **Antigravity**<br>Data curation: **Codex** |

---

## 4. File Ownership & Boundary Matrix (Post-`CTO002-A` Merge)

Once Codex lands the `CTO002-A` Next.js scaffold, file ownership divides cleanly without conflict:

| Path / Module | Owner | Responsibility & Edit Rules |
| :--- | :--- | :--- |
| `package.json`, `tsconfig.json`, `next.config.*`, `tailwind.config.*`, `.env.example` | **Codex (`CTO002-A`)** | Antigravity reads only; requests approval before any dependency or config change. |
| `src/lib/contracts/**`, `src/server/**`, `src/app/api/**`, `supabase/migrations/**` | **Codex (`CTO002-A`)** | Backend routes, DB schema, RLS, rate limiting, and shared Zod/TS schemas. Antigravity imports types/schemas read-only. |
| `src/styles/tokens.css` (or Tailwind theme tokens in `globals.css`) | **Antigravity (`CTO002-B`)** | Maps `--sp-*` CSS custom properties from `docs/frontend/01-design-system.md`. |
| `src/components/ui/**` & `src/components/domain/**` | **Antigravity (`CTO002-B`)** | Reusable accessible components (`ProvenanceBadge`, `OperatorSelector`, `LagosAreaSelector`, `BoundedTestProgress`, `MeasurementResultCard`, `IncidentCard`, `EvidenceSummaryPreview`, `HonestEmptyState`, `ConfirmDialog`). |
| `src/lib/offline-store/**` | **Antigravity (`CTO002-B`)** | IndexedDB local draft store & outbox queue for offline incident logging. |
| `src/app/(public)/**` (Page views for `/`, `/check`, `/incidents`, `/evidence`, `/intelligence`, `/guidance`) | **Antigravity (`CTO002-B`)** | Mobile-first responsive Next.js App Router views wired to Codex's shared contracts. |
| `docs/frontend/**` | **Antigravity (`CTO002-B`)** | Design system, UX architecture, screen specs, reference prototype, and accessibility checklists. |

---

## 4. Step-by-Step Integration Sequence Upon `CTO002-A` Handoff

As soon as Codex publishes the `CTO002-A` branch/commit:

1. **Inspect & Verify Contracts:** Read Codex's `package.json`, `tsconfig.json`, and shared contract schemas; verify zero drift against the 4 alignment items in Section 2 above.
2. **Apply Design Tokens:** Port the CSS custom properties from `docs/frontend/01-design-system.md` into the Next.js stylesheet without altering Codex's build configuration.
3. **Port the 14 Reusable Components:** Translate the verified HTML/CSS/ARIA patterns from `docs/frontend/prototype/index.html` and `docs/frontend/04-component-specifications.md` into typed React components with unit/component tests.
4. **Assemble the 6 Product Routes:** Implement `/`, `/check`, `/incidents`, `/evidence`, `/intelligence`, and `/guidance` using Codex's API client/schemas and IndexedDB local draft persistence.
5. **Run Full Verification Suite:** Execute `lint`, `typecheck`, unit/component tests, production `build`, and multi-viewport browser verification (`320px`, `375px`, `430px`, `768px`, `1280px`).
