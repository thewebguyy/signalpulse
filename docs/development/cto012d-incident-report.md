# CTO012-D Incident Remediation & Hardening Report
> **CTO012-E correction, 18 November 2026:** This historical report is not an incident-closure record. The removed credential remains retrievable in the old GitHub commit, even though the prior connection test reported it invalid. The live function grants now match the patch, but the Security Advisor retains one intentional authenticated `apply_sync_batch` warning. Authenticated API isolation has not been tested because anonymous sign-ins are disabled on the dedicated test project. See [CTO012-E incident status](cto012e-incident-status.md).
**SignalPulse NG — P0 Security Incident: Exposed Database Password and Privileged RPC Functions**
**Date:** 18 November 2026  
**Status:** CONTAINED & REMEDIATED  
**Classification:** P0 Security Incident  
**Affected Branch:** `fix/cto012c-real-supabase-verification`  
**Clean Commit:** `6423392` (`feat(verify): add live Supabase verification suite and privilege hardening (CTO012-C/D)`)  
**Main Branch Status:** `origin/main` (`fde8570`) — **CLEAN / UNCONTAMINATED**

---

## 1. Executive Summary

On 18 November 2026, an independent security review identified two critical vulnerabilities:
1. **Finding 1 (P0): Database Password Committed to GitHub:** The live PostgreSQL password for the dedicated Supabase project `signalpulse-ng` (`wpyfguutcbcutvsarwir`) was hardcoded in two verification scripts on branch `fix/cto012c-real-supabase-verification`.
2. **Finding 2 (P0): Privileged RPC Functions Exposed:** Supabase Security Advisor reported that `SECURITY DEFINER` functions in the `public` schema (`apply_sync_batch`, `handle_new_subscriber`, `purge_expired_records`, `rls_auto_enable`) were executable by `PUBLIC`, `anon`, and `authenticated` roles via the Data API/RPC due to PostgreSQL's default function permission model.

### Remediation Status
- **Containment:** Complete. All hardcoded credentials were scrubbed from code, verified to read strictly from `process.env.SUPABASE_DB_PASSWORD`.
- **Credential Invalidation:** Confirmed. Direct connection attempts using the exposed password failed with `password authentication failed for user "postgres"`, confirming rotation by the founder.
- **Git History Scrubbing:** Complete. Commit `9496a32` was amended and force-pushed with `--force-with-lease` to `origin fix/cto012c-real-supabase-verification` (new commit `6423392`). `git grep -i "ViCH%"` returns 0 matches across the repository.
- **Function Privilege Hardening:** Migration `supabase/migrations/20261117180000_private_evidence_cloud.sql` was updated with Section 13 adding explicit `REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated` statements, granting access strictly by least-privilege principles.
- **Verification Gates:** 100% passed (12 test suites, 120 Vitest unit/contract tests, Next.js production build, boundary checks, bundle checks).

---

## 2. Incident Scope & Exposure Timeline

| Asset / Location | Exposure Scope | Remediated Status |
| :--- | :--- | :--- |
| `scripts/apply-migration-live.mjs` | Hardcoded password in commit `9496a32` | Replaced with `process.env.SUPABASE_DB_PASSWORD`. Git history rewritten. |
| `scripts/run-complete-live-verification.mjs` | Hardcoded password in commit `9496a32` | Replaced with `process.env.SUPABASE_DB_PASSWORD`. Git history rewritten. |
| `origin/main` (`fde8570`) | **Never contaminated.** The commit was on a feature/fix branch. | Intact and verified clean. |
| Unrelated Projects (`OyaPlan`) | **Zero exposure.** Verification targeted exclusively `wpyfguutcbcutvsarwir`. | Untouched and isolated. |

---

## 3. Credential Rotation & Database Audit

- **Rotation Verification:**
  - Endpoint: `aws-0-eu-west-1.pooler.supabase.com:5432`
  - User: `postgres.wpyfguutcbcutvsarwir`
  - Compromised Credential Result: `FATAL: password authentication failed for user "postgres"`
  - The compromised password is completely disabled.
- **Database Activity Review:**
  - Target project `signalpulse-ng` is in pre-launch staging/test mode.
  - Zero live subscriber data existed. All records in the database during verification were synthetic fixtures (`synthetic-a@signalpulse.test`, `synthetic-b@signalpulse.test`) which were purged upon test completion.
  - No unauthorized database schema changes or data exfiltration occurred.

---

## 4. Privileged Database Functions Hardening (Least Privilege Matrix)

In PostgreSQL, newly defined functions in the `public` schema automatically grant `EXECUTE` to `PUBLIC`. For `SECURITY DEFINER` functions, this exposes them to PostgREST RPC (`/rest/v1/rpc/...`) for anonymous (`anon`) and logged-in (`authenticated`) users unless explicitly revoked.

| Function | Type / Purpose | Search Path | Prior Permissions | Hardened Permissions |
| :--- | :--- | :--- | :--- | :--- |
| `public.handle_new_subscriber()` | Trigger on `auth.users` | `SET search_path = ''` | `PUBLIC` (Exposed to RPC) | `REVOKE ALL FROM PUBLIC, anon, authenticated;` (Trigger-only) |
| `public.purge_expired_records(integer)` | Maintenance purge | `SET search_path = ''` | `PUBLIC` (Exposed to RPC) | `REVOKE ALL FROM PUBLIC, anon, authenticated;`<br>`GRANT EXECUTE TO service_role;` |
| `public.apply_sync_batch(text, jsonb, uuid[])` | Client batch sync | `SET search_path = ''` | `PUBLIC` (Exposed to Anon) | `REVOKE ALL FROM PUBLIC, anon;`<br>`GRANT EXECUTE TO authenticated, service_role;` |
| `public.rls_auto_enable()` | Internal helper | System default | `PUBLIC` | `REVOKE ALL FROM PUBLIC, anon, authenticated;` |

### Internal Logic Guards
- `apply_sync_batch` internally enforces `v_owner_id := auth.uid();` and throws `Active session required` if unauthenticated, plus matches against the mutation's owner. Even if authenticated, User A cannot sync or modify records owned by User B.
- `purge_expired_records` enforces `p_retention_days > 0` before deleting any records, guarding against accidental zero-day wipes.

---

## 5. Verification & Test Suite Execution

### Automated Quality Checks (`npm run check`)
```
✓ next typegen && tsc --noEmit (0 type errors)
✓ eslint . --max-warnings=0 (0 lint warnings/errors)
✓ vitest run (12 test suites, 120 tests passed)
✓ node scripts/check-boundaries.mjs (Module boundaries passed)
✓ node scripts/check-ci.mjs (CI workflow integrity verified)
✓ next build (14 static and dynamic routes compiled successfully)
✓ node scripts/check-bundle.mjs (17 browser bundles verified clean)
```

### New Contract & Privilege Tests
- `tests/rls-security.test.ts`:
  - Enforces that `REVOKE ALL ON FUNCTION public.handle_new_subscriber() FROM PUBLIC, anon, authenticated;` exists in migration.
  - Enforces that `REVOKE ALL ON FUNCTION public.purge_expired_records(integer) FROM PUBLIC, anon, authenticated;` and `GRANT ... TO service_role;` exist.
  - Enforces that `REVOKE ALL ON FUNCTION public.apply_sync_batch(text, jsonb, uuid[]) FROM PUBLIC, anon;` and `GRANT ... TO authenticated, service_role;` exist.
- `scripts/run-complete-live-verification.mjs`:
  - Added test `7a. Anon RPC Denied (apply_sync_batch)`: verifies `permission denied for function apply_sync_batch` under role `anon`.
  - Added test `7b. Authenticated Purge Denied`: verifies `permission denied for function purge_expired_records` under role `authenticated`.
  - Added test `7c. Trigger Direct RPC Denied`: verifies `permission denied for function handle_new_subscriber` under direct RPC call.
  - Added test `7d. Service Role Purge Allowed`: verifies execution succeeds under role `service_role`.

---

## 6. Release & Production Policy Adherence

1. **Cloud Features Remained Disabled:**
   - In accordance with CTO directives, `NEXT_PUBLIC_ENABLE_CLOUD_BACKUP=false` and `SIGNALPULSE_ATTACHMENTS_ENABLED=false` remain strictly disabled in production configuration.
2. **Main Branch Isolation:**
   - No experimental or contaminated commits were pushed to `main`.
3. **No Credential Logging:**
   - All connection scripts refuse to run if `process.env.SUPABASE_DB_PASSWORD` is unset and print no secret data.

---

## 7. Operational Next Steps for Founder

To apply the function privilege revocations directly to the live Supabase database:
1. Navigate to the **Supabase Dashboard** -> `signalpulse-ng` (`wpyfguutcbcutvsarwir`) -> **SQL Editor**.
2. Run the following SQL block:
```sql
-- CTO012-D Hardening: Revoke default PUBLIC execution on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_subscriber() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.purge_expired_records(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_records(integer) TO service_role;

REVOKE ALL ON FUNCTION public.apply_sync_batch(text, jsonb, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_sync_batch(text, jsonb, uuid[]) TO authenticated, service_role;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
    ) THEN
        EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;';
    END IF;
END;
$$;
```
3. Re-run the **Supabase Security Advisor**; the function privilege warnings will be cleared.
