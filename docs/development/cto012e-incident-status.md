# CTO012-E security incident status

Date: 18 November 2026. Branch baseline: `fix/cto012c-real-supabase-verification` at `8089864`. Target: the dedicated **SignalPulse NG test** Supabase project `wpyfguutcbcutvsarwir`. Status: **not closed**. No production configuration, other Supabase project, or real subscriber data was touched.

## Credential incident

| Question | Observed evidence | Status |
| --- | --- | --- |
| Removed from current source? | Both live verification scripts read `process.env.SUPABASE_DB_PASSWORD`; no literal database password appears in the current scripts. The credential-removal commit `6423392` and its documentation successor `8089864` are retained. | Yes, current source. |
| Rotated? | The CTO012-D report records a direct connection attempt with the compromised credential returning PostgreSQL password-authentication failure after founder rotation. CTO012-E attempted an independent test without displaying the value, but the pooler TLS certificate chain was not trusted by this environment and the connection stopped **before authentication**. We did not disable certificate verification. | Previously reported invalid; independent reconfirmation **inconclusive**. Obtain the official project root certificate or owner rotation audit evidence. |
| Historical exposure resolved? | GitHub still returns the old secret-bearing commit `9496a323a75a4e6be8d69716a028395136270892` by SHA after the branch rewrite. Its contents were not displayed in this review. The commit is not on current `main` or the remediation branch, but the object remains externally retrievable. | **No.** Treat the credential as permanently disclosed. Review GitHub retention/caches/forks and obtain owner approval for any further history or hosting remediation. Never restore the old credential. |

The prior report's “Git History Scrubbing: Complete” and “CONTAINED & REMEDIATED” statements therefore overstate closure. Rotation is the primary containment; GitHub object cleanup and exposure accounting remain open.

## Live function inventory and intended callers

Read-only catalog inspection confirmed the exact signatures, `SECURITY DEFINER` mode and current effective `EXECUTE` rights:

| Function | Intended caller | `anon` | `authenticated` | `service_role` |
| --- | --- | ---: | ---: | ---: |
| `public.handle_new_subscriber()` | Auth trigger only | No | No | Yes |
| `public.purge_expired_records(integer)` | Controlled maintenance only | No | No | Yes |
| `public.rls_auto_enable()` | Database event trigger only | No | No | Yes |
| `public.apply_sync_batch(text,jsonb,uuid[])` | Signed-in user's own sync RPC | No | **Yes** | Yes |

The subscriber trigger and RLS event trigger each have one live registration. The live SQL grants match Section 13 of `20261117180000_private_evidence_cloud.sql`. **No grant change was made in CTO012-E:** rerunning identical revocations would not improve the already-correct catalog state. The Supabase migration-history list is empty despite installed objects, so the repository SQL and live schema must be compared before any future migration replay.

## Advisor and API evidence

- Supabase Security Advisor was run twice on the dedicated project. It reports **one** external warning: [authenticated callers can execute `public.apply_sync_batch` as `SECURITY DEFINER`](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). It does not report the earlier four anon and four authenticated function warnings. The single finding is expected from the current client RPC architecture; it is **not** a blanket clearance of the function body.
- Real PostgREST requests using the project's publishable key returned `42501` for `anon` calls to `apply_sync_batch`, `purge_expired_records` (non-destructive zero-day argument), and `rls_auto_enable`. Direct `handle_new_subscriber` RPC returned `PGRST202` because trigger functions are not exposed as callable RPCs; the live catalog separately proves `anon` and `authenticated` lack `EXECUTE`.
- A real anonymous Auth signup attempt returned `anonymous_provider_disabled` (HTTP 422). The project contained zero Auth users, incidents and sync operations at inspection time. No two-user authenticated API test or legitimate live sync could run. The CTO approved a temporary test-project Auth window, but the browser's security approval gate denied access to the dashboard sign-in origin. No alternate route was used. The CTO elected to handle the setting personally; this report does not claim the setting changed.
- The local test script `scripts/verify-rpc-api.mjs` takes a project URL and publishable key through stdin, does not print keys or tokens, uses fictional A/B records, checks direct REST/RPC ownership and tries to remove its own fixtures. The first run stopped before user creation because anonymous signup was disabled. It has **not** passed the authenticated sections.

## Why the remaining definer warning is not hidden

`apply_sync_batch` is intentionally an authenticated PostgREST RPC, and its body derives `v_owner_id` from `auth.uid()` and scopes incident lookup, mutation and deletion by that owner. Those are source and catalog observations, **not** an authenticated API proof. Moving the function to an unexposed schema without changing its callable wrapper would only hide the warning. Switching to `SECURITY INVOKER` currently fails because `sync_operations` is not granted to `authenticated`; granting direct ledger writes would let clients forge completed operations. A safe redesign needs a reviewed ledger access model and two-user API tests. Trigger-only and maintenance routines can be moved to a non-exposed schema in a later migration after trigger and scheduler callers are verified.

The direct RPC still needs request-size/item bounds, replay payload binding and an active-subscriber/deletion fence. A completed mutation ID currently returns a cached result without proving a repeated payload is identical. These are release blockers for externally enabled cloud sync, not reasons to loosen table grants.

## Next verification gate

After the CTO enables anonymous sign-ins **only on the dedicated test project**, run `scripts/verify-rpc-api.mjs` with the project's publishable key supplied on stdin. Record two distinct real Auth identities, forged owner/deletion attempts, direct REST isolation, successful own sync, replay result and fixture cleanup. Re-run the Advisor and catalog query afterward. Then have the CTO disable anonymous sign-ins again and confirm that setting. Do not enable production cloud backup, merge this PR, or close the incident while the historical commit remains retrievable and authenticated RPC behavior is unproven.
