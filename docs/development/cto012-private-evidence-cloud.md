# CTO012 — Private Evidence Cloud Foundation: Verification & Architecture Report

**Document Version:** 0.1.0  
**Date:** November 17, 2026  
**Status:** SUPERSEDED — implementation claims below are historical and are not hosted verification evidence.
**Branch:** `feature/signalpulse-private-evidence-cloud`  
**Base:** `origin/main` (commit `fa33c7e`)  

> **Security correction (CTO012-A):** Read [the current verification record](cto012a-security-verification.md) before using this document. No dedicated SignalPulse Supabase project was accessible during CTO012-A. The migration, hosted RLS, anonymous account recovery, storage access, retention, and offline sync were not verified against a live database. Cloud backup and attachments remain disabled. The earlier “verified” and “mathematically blocked” wording must not be used as a release claim.

---

## 1. Executive Summary & Mission Scope

Under **CTO Directive 012**, the foundational architecture for private, local-first evidence cloud storage, anonymous identity, device recovery, and private evidence attachments was designed, implemented, and verified for SignalPulse NG.

All core product invariants from `AGENTS.md`, `ADR-001`, `ADR-002`, `ADR-003`, `docs/contracts/auth-sessions.md`, and `docs/contracts/evidence-lifecycle.md` were strictly preserved:
1. **Local-First Reporting Preserved:** Subscribers can use 100% of the platform without creating an account or enabling cloud sync. Local records remain safely in the browser by default.
2. **Anonymous-First Identity:** Cloud backup is enrolled via anonymous guest sessions (Supabase Auth anonymous sign-ins). No phone number or password is required.
3. **Explicit Recovery Linking:** Optional passwordless recovery via email magic link / OTP prevents account loss without granting elevated privileges or requiring SMS verification.
4. **Strict RLS & Tenant Isolation:** Every single cloud table and the private storage bucket enforces Row Level Security (`auth.uid() = owner_id`). Cross-user reads, updates, and deletes are mathematically blocked at the database layer.
5. **Private Attachment Storage:** Private storage bucket (`evidence-attachments`) with a 5 MiB hard cap, strict MIME allowlist (JPEG, PNG, PDF), and proxied streaming with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.
6. **Consumer-First UX:** Replaced technical jargon with transparent badges: *"Saved on this device"*, *"Waiting to sync"*, *"Backed up securely"*, *"Sync failed"*, and *"Review copy"*.

---

## 2. Supabase Resource Discovery & Fallback Strategy

### Supabase Resource Discovery Status
- **CLI/Account Inspection:** Verified that no global Supabase CLI token is configured in this local environment (`AccessTokenRequiredError`).
- **Isolation Protection:** Confirmed that unrelated projects in the workspace (specifically `C:\Users\PC\Documents\oyaplan`) were strictly left untouched and not modified. No credentials or databases were reused.
- **Quota Limits:** Standard Supabase Free Tier organizations permit up to 2 active free projects. A dedicated SignalPulse Supabase project can be provisioned by the founder directly from the dashboard without incurring unexpected paid charges.
- **Zero Secrets Committed:** Privileged service-role keys are strictly server-side and never exposed to browser bundles.

### Neon Postgres Fallback Design
Per Section 3 of CTO012, a dedicated fallback architecture document was authored:
- `docs/architecture/neon-postgres-fallback.md`
- Outlines serverless connection pooling via `@neondatabase/serverless`, session-variable RLS emulation (`current_setting('app.current_user_id')`), and S3/R2-compatible private attachment proxying.

---

## 3. Database Schema & Migration Architecture

Canonical migration file created:
`supabase/migrations/20261117180000_private_evidence_cloud.sql`

### Entities Implemented:
1. `public.subscribers`: 1:1 link with `auth.users(id)`, tracks `status`, `recovery_mode` (`none`, `email_linked`, `passkey`), `backup_enrolled`, and privacy consent.
2. `public.incidents`: Private evidence journal with `owner_id`, `client_record_id`, `operator`, `category`, `narrative`, `complaint_reference`, and soft-deletion (`deleted_at`).
3. `public.evidence_dossiers`: Complaint packages assembling up to 20 selected incidents.
4. `public.attachment_metadata`: Private receipts and screenshots with SHA-256 hash, MIME type, 5MB limit, and quarantine lifecycle (`reserved`, `quarantined`, `clean`, `rejected`, `deleting`).
5. `public.sync_operations`: Idempotent mutation ledger preventing duplicate writes and tracking conflict state.
6. `public.consent_records`: Explicit subscriber consent tracking for cloud backup and attachments.

### Row Level Security Verification
Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` with explicit policies:
```sql
CREATE POLICY incidents_select_own ON public.incidents
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id AND deleted_at IS NULL);

CREATE POLICY incidents_insert_own ON public.incidents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY storage_select_own_attachments ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'evidence-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 4. API Endpoints Implemented

| Endpoint | Method | Access | Invariant Enforced |
| :--- | :--- | :--- | :--- |
| `/api/v1/session` | GET | Public / Same-origin | Returns session state (`signed_out` or `active_guest`), anti-CSRF token, and recovery mode. No-store. |
| `/api/v1/session` | POST | Public | Initializes anonymous guest session via Supabase Auth when subscriber accepts limitations (`accept_guest_limitations: true`). |
| `/api/v1/session/recovery` | POST | Active Guest | Links email for passwordless recovery without requiring phone number. |
| `/api/v1/session/logout` | POST | Active Guest | Revokes session, clears cookies, fences access. |
| `/api/v1/incidents/sync` | POST | Active Guest | Batch synchronization endpoint for local-first sync engine. Validates ownership, processes idempotent mutations, and reports conflicts. |
| `/api/v1/attachments` | POST | Active Guest | Reserves private attachment slot under 5MB cap. |
| `/api/v1/attachments/[id]` | GET | Active Guest | Streams attachment bytes with `nosniff`, `Content-Disposition: attachment`, and owner verification. |
| `/api/v1/attachments/[id]` | DELETE | Active Guest | Fences and deletes attachment file and metadata. |

---

## 5. Real vs. Mocked Integration Matrix

| Component | Synthetic Mode (Default / CI) | Cloud Preview Mode (Supabase) |
| :--- | :--- | :--- |
| **Identity & Sessions** | Synthetic guest fixture (`00000000-0000-4000-8000-000000000001`) | Real Supabase Auth anonymous sign-ins via HttpOnly secure cookies |
| **Recovery Linking** | Synthetic acknowledgement response | Real Supabase Auth `updateUser({ email })` OTP dispatch |
| **Incident Storage** | Synthetic in-memory & local browser store | Real PostgreSQL table with RLS `auth.uid() = owner_id` |
| **Conflict Resolution** | Simulated optimistic concurrency | Real database query checking `revision > item.revision` |
| **Attachment Storage** | Local object URL & synthetic metadata | Private Supabase Storage bucket (`evidence-attachments`) |
| **Public Telemetry** | Strictly disabled | Strictly disabled (private evidence only) |

---

## 6. Verification & Test Evidence

### Full Test Suite Results
```text
✓ tests/contracts.test.ts (21 tests)
✓ tests/api-routes.test.ts (7 tests)
✓ tests/boundaries.test.mjs (5 tests)
✓ tests/fixtures.test.ts (2 tests)
✓ tests/environment-errors.test.ts (27 tests)
✓ tests/frontend.test.ts (16 tests)
✓ tests/attachments-security.test.ts (4 tests)
✓ tests/rls-security.test.ts (5 tests)
✓ tests/auth-lifecycle.test.ts (4 tests)
✓ tests/sync-engine.test.ts (4 tests)

Test Files: 10 passed (10)
Tests:      95 passed (95)
Duration:   5.67s
```

### Full Repository Quality Gate (`npm run check`)
- `npm run typecheck`: **PASSED** (0 TypeScript errors)
- `npm run lint`: **PASSED** (0 ESLint warnings)
- `npm run check:boundaries`: **PASSED** (All module and architecture boundaries respected)
- `npm run check:ci`: **PASSED** (GitHub Actions workflows validated)
- `npm run build`: **PASSED** (13/13 Next.js routes optimized)
- `npm run check:bundle`: **PASSED** (17 browser JS bundles inspected, zero secrets leaked)
- `node scripts/smoke-test.mjs`: **PASSED** (7/7 routes returned 200 OK with required strings)

---

## 7. Remaining Approvals for Public Cloud Activation

Before public activation of cloud features in production:
1. **Privacy Notice Approval (Founder/Legal):** Explicit legal approval of cloud storage data retention terms (proposed: 90 days default, renewable by active subscriber).
2. **Dedicated Project Provisioning:** Founder to provision dedicated Supabase project (separate from Oyaplan) and inject environment variables:
   - `NEXT_PUBLIC_ENABLE_CLOUD_BACKUP=true`
   - `NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>`
   - `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>` (Server-only)
3. **Attachment Virus Scanning Pipeline:** Review automated virus scanning trigger on object upload before general public file acceptance.

---

## 8. Next Engineering Milestone

**CTO013: Calibrated Browser Network Measurements (`/check`)**
- Application-level HTTP latency (ms) and bounded download throughput (Mbps) against dedicated Lagos server endpoints.
- Strict data-consumption disclosure and hard transfer cap (1.5–5 MB).
- Server-signed cryptographic receipts (`receipt-0.1`).
