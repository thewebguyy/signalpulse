# SignalPulse NG — React Component Implementation & Testing Plan

> **Document ID:** `CTO002-B-07`
> **Status:** Implementation-Ready Blueprint (Prepared for CTO002-A Integration)
> **Owner:** Antigravity (Principal Frontend Engineer & Product Design Lead)
> **Scope:** Detailed TypeScript component blueprints, IndexedDB local storage schema, synthetic test fixtures, and Vitest/React Testing Library test matrices.

---

## 1. Architectural Strategy for React Implementation

Once Codex's `CTO002-A` Next.js App Router scaffold is available in the remote repository, Antigravity will branch from that commit (`feature/signalpulse-frontend-implementation`) and land the components cleanly.

To ensure zero friction during integration, all component blueprints follow three strict rules:
1. **Zero Global State Bloat:** Use local React state (`useState`, `useReducer`) and standard browser `IndexedDB` for persistence. No Redux, MobX, or heavy external state managers.
2. **Contract-First Props:** All domain components strictly type their props via Codex's shared schemas (e.g. `ProvenanceSource`, `OperatorId`, `LagosLga`, `IncidentCategory`, `PublicationState`).
3. **Pure Presentation / Container Separation:** Presentational components (`<MeasurementResultCard />`, `<IncidentCard />`, `<PublicationStateCard />`) are completely pure and deterministic, accepting data and callbacks only, making them 100% testable in isolation.

---

## 2. IndexedDB Local Storage Architecture (`src/lib/offline-store`)

Because subscribers frequently log incidents during total network outages, local persistence operates independently of server connectivity:

### 2.1 Database Schema (`signalpulse_offline_v1`)
- **Database Name:** `signalpulse_offline_v1`
- **Object Stores:**
  1. `incident_drafts`:
     - Key Path: `id` (string: `sp_draft_` + timestamp)
     - Indexes: `by_status` (`storage_status`), `by_operator` (`operator`), `by_created` (`created_at_utc`)
     - Value Shape:
       ```ts
       export interface LocalIncidentDraft {
         id: string;
         category: 'slow_unusable_data' | 'no_service' | 'failed_dropped_calls' | 'data_depletion_discrepancy' | 'failed_purchase' | 'billing_dispute';
         operator: 'mtn' | 'airtel' | 'glo' | 't2mobile';
         lga?: string;
         neighbourhood?: string;
         occurred_at_wat: string; // ISO string
         occurred_at_utc: string; // ISO string
         description: string;
         attachment_meta?: {
           filename: string;
           mime_type: string;
           byte_size: number;
           blob?: Blob;
         };
         storage_status: 'draft_local' | 'queued_sync' | 'sync_error';
         created_at_utc: string;
         updated_at_utc: string;
       }
       ```
  2. `local_test_history`:
     - Key Path: `id` (string: `sp_chk_` + timestamp)
     - Indexes: `by_operator` (`operator`), `by_created` (`completed_at_utc`)
     - Value Shape: `MeasurementResultData` (Stores local synthetic previews and bounded test runs)

---

## 3. Synthetic Data Fixtures for Isolated UI Development & Testing

These fixtures provide deterministic, contract-compliant test data that strictly respects our privacy, provenance, and anti-misrepresentation rules.

### 3.1 Provisional Six Incident Categories Fixture
```ts
export const MOCK_INCIDENT_FIXTURES: LocalIncidentDraft[] = [
  {
    id: 'sp_draft_001',
    category: 'failed_purchase',
    operator: 'mtn',
    lga: 'Ikeja',
    neighbourhood: 'Computer Village / Alausa',
    occurred_at_wat: '2026-11-16T14:30:00+01:00',
    occurred_at_utc: '2026-11-16T13:30:00Z',
    description: 'Debited N3,500 for 10GB monthly bundle via banking USSD. Debit confirmed by SMS, but balance remained 0 MB after 45 minutes.',
    storage_status: 'draft_local',
    created_at_utc: '2026-11-16T13:35:00Z',
    updated_at_utc: '2026-11-16T13:35:00Z'
  },
  {
    id: 'sp_draft_002',
    category: 'slow_unusable_data',
    operator: 'airtel',
    lga: 'Lagos Mainland',
    neighbourhood: 'Yaba',
    occurred_at_wat: '2026-11-15T18:15:00+01:00',
    occurred_at_utc: '2026-11-15T17:15:00Z',
    description: 'Active 4G icon displayed, but HTTP requests timed out repeatedly. Speed test failed to reach edge server.',
    attachment_meta: {
      filename: 'sanitized_speed_timeout.png',
      mime_type: 'image/png',
      byte_size: 142050
    },
    storage_status: 'draft_local',
    created_at_utc: '2026-11-15T17:20:00Z',
    updated_at_utc: '2026-11-15T17:20:00Z'
  }
];
```

### 3.2 Network Intelligence Publication States Fixture
```ts
export const MOCK_INTELLIGENCE_FIXTURES = {
  insufficient_data: {
    publication_state: 'insufficient_data' as const,
    geography: { state: 'Lagos', lga: 'All LGAs' },
    observation_window: { start_utc: '2026-11-09T00:00:00Z', end_utc: '2026-11-16T00:00:00Z' },
    methodology_version: 'sp-http-v0.1',
    metrics: null
  },
  withheld: {
    publication_state: 'withheld' as const,
    geography: { state: 'Lagos', lga: 'Lagos Mainland' },
    observation_window: { start_utc: '2026-11-09T00:00:00Z', end_utc: '2026-11-16T00:00:00Z' },
    methodology_version: 'sp-http-v0.1',
    metrics: null
  },
  published_synthetic: {
    publication_state: 'published' as const,
    geography: { state: 'Lagos', lga: 'Ikeja' },
    observation_window: { start_utc: '2026-11-09T00:00:00Z', end_utc: '2026-11-16T00:00:00Z' },
    methodology_version: 'sp-http-v0.1',
    metrics: {
      operators: [
        {
          operator: 'airtel' as const,
          http_latency_ms: { median: 92, iqr: [74, 138] },
          download_throughput_mbps: { median: 5.8, iqr: [3.1, 9.4] }
        },
        {
          operator: 'mtn' as const,
          http_latency_ms: { median: 86, iqr: [69, 124] },
          download_throughput_mbps: { median: 6.4, iqr: [3.8, 11.2] }
        }
      ]
    }
  }
};
```

---

## 4. Frontend Component Test Matrix (Vitest + React Testing Library)

| Test Suite File | Component(s) Tested | Key Test Assertions |
| :--- | :--- | :--- |
| `src/components/domain/__tests__/OperatorSelector.test.tsx` | `<OperatorSelector />` | - Renders 4 operators (MTN, Airtel, Glo, T2mobile) in 2x2 grid.<br>- Embeds provenance label (`USER REPORTED`) in `<legend>`.<br>- Arrow keys change radio selection cleanly.<br>- Touch targets enforce `>= 48px`. |
| `src/components/domain/__tests__/BoundedTestProgress.test.tsx` | `<BoundedTestProgress />` | - Displays configuration-driven caps (`maxBytesCap`, `maxSecondsCap`).<br>- Renders accessible progress bar (`role="progressbar"`).<br>- "Cancel Check" button triggers callback cleanly.<br>- Respects `prefers-reduced-motion`. |
| `src/components/domain/__tests__/IncidentJournal.test.tsx` | `<IncidentJournalView />` | - Contains exactly the 6 provisional categories.<br>- Validates required fields before allowing local save.<br>- Surfaces PII cropping disclosure adjacent to file input.<br>- Renders local drafts with distinct status badge.<br>- Empty history renders `<HonestEmptyState />`. |
| `src/components/domain/__tests__/PublicationStateCard.test.tsx` | `<PublicationStateCard />` | - In `insufficient_data`: displays explanation banner; confirms 0 metric cells render.<br>- In `withheld`: displays neutral review notice; confirms no internal abuse/contributor counts leaked.<br>- In `published`: renders Medians & IQR; confirms no single "Best Network" score rendered. |
| `src/components/domain/__tests__/EvidenceSummaryPreview.test.tsx` | `<EvidenceSummaryPreview />` | - Segregates `APP MEASURED` from `USER REPORTED` / `USER ATTACHED`.<br>- Renders mandatory legal/verification disclaimer.<br>- Export buttons disabled with clear backend-pending status. |
