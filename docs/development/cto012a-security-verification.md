# CTO012-A security verification record

Status: **local remediation complete; cloud release blocked**. Branch: `feature/signalpulse-private-evidence-cloud`. This record supersedes the verification claims in `cto012-private-evidence-cloud.md`.

## Scope and evidence

The code review covered all CTO012 API routes, Supabase adapters, the migration and storage policies, sync state, local evidence storage, attachment UI, contracts and tests. A clean `npm ci` and the local quality gate were run in an isolated checkout. Static migration tests and mocked/synthetic tests **do not prove hosted RLS**.

The connected Supabase account exposed only WithYou, SabiCRM and OyaPlan. No dedicated SignalPulse test project was available. None of those projects was changed. No migration was applied, no security advisor was run, and no fictional or real subscriber data was sent to Supabase. The connected Vercel account exposed no SignalPulse project; production environment and access protection could not be independently inspected. No deployment was made.

## Corrections made

- Server identity checks use `auth.getUser()` and require an active subscriber profile. Cookie-local `getSession()` is not an authorization proof.
- Mutating API routes reject missing or cross-origin `Origin` headers. The response body uses the canonical safe error envelope. The current `csrf_token` response field is not a validated token; the route defense is the origin check and cookie policy. This contract inconsistency needs review before cloud activation.
- Synthetic mode fails closed for guest creation, sync, recovery and attachment reservation. It cannot claim that a cloud write succeeded.
- Email recovery is unavailable until a confirmed link **and** a lost-device recovery test exist. No endpoint marks an unconfirmed email as linked. The UI explains guest loss risk.
- The client does not mark every record synced after a partial/invalid acknowledgement. Persisted browser sync flags are not treated as proof of an active session. The server rechecks each owned incident row instead of trusting a client-writable completed ledger entry. A stale revision cannot overwrite a newer row; update and deletion require an acknowledged row.
- Unreadable local records are preserved. Save/delete and the former cleanup action cannot silently discard malformed entries; the old implicit 50-record truncation is gone. Incident edits retain the original client record ID, creation timestamp and incrementing revision. The UI checks actual delete results.
- Attachments are not represented as exported evidence. The file-picker demonstration was removed from the evidence page. Reservation and content upload are fail-closed pending scanning, type/digest verification and a reviewed quota pipeline; the private bucket has **no authenticated object policies** in this migration. Attachment metadata cannot self-promote to `clean`, and the parent incident is constrained to the same owner.
- No service-role credential is required or accepted by the app. Cloud client creation requires both `cloud_preview` and explicit `NEXT_PUBLIC_ENABLE_CLOUD_BACKUP=true`. The shipping example remains `synthetic` with cloud flags off.

## Open release blockers

1. **Hosted RLS and Auth untested (P0).** Apply the migration only to a dedicated SignalPulse test project. Test with two real anonymous identities and the actual Supabase client, including direct PostgREST and Storage access. Static SQL assertions are insufficient.
2. **Account recovery unimplemented (P1).** Current guest identity is tied to its browser session. No email-linking, callback confirmation, account restore or revoked-session fence has been verified. Do not promise device recovery.
3. **Cloud sync incomplete (P1).** Row-level retries are conservative, but batch writes are not atomic. There is no transactionally protected idempotency ledger, per-record acknowledgement or tested offline owner-switch handling. Client failures preserve local copies. Do not claim reliable automatic backup.
4. **Attachments unavailable (P1).** No scanning/quarantine pipeline, verified content digest, object quota, safe streaming or retention job exists. Reservation metadata is not a completed upload. Keep `SIGNALPULSE_ATTACHMENTS_ENABLED=false`.
5. **Deletion/retention incomplete (P1).** Migration defaults an incident expiry but has no scheduled purge, all-data deletion fence, Auth deletion, backup lifecycle or consent withdrawal propagation. The 90-day value needs founder/privacy approval. Do not claim records are erased on schedule.
6. **Abuse controls incomplete (P1).** Guest creation and sync need rate limits, request-size limits and workload quotas before external access.
7. **Production isolation externally unverified.** No connected SignalPulse Vercel project was visible. Confirm preview protection, production branch, deployment environment variables and existing synthetic-only deployment before activation.

## Dedicated-project verification checklist

Use a new or existing **SignalPulse-only nonproduction** Supabase project. Never use OyaPlan or another product. Use fictional records and no sensitive file contents.

1. Record project ID and backup plan; review the migration diff and extension availability. Apply `20261117180000_private_evidence_cloud.sql`. Run Supabase database security advisors and record all findings. Verify table grants, RLS enabled/forced behavior, trigger owner and function search path.
2. Create guest A and guest B through separate isolated browser profiles. Verify `getUser()`, cookie renewal, logout, invalid/expired token behavior, no session crossover and same-origin mutation rejection. Test direct requests with guessed owner IDs and forged metadata.
3. As A, insert/read/update/delete own incidents and attempt every operation on B's incident and dossier. Repeat as B and unauthenticated. Verify cross-owner attachment parent FK. Confirm a deleting subscriber cannot use an old token; add a fence before release if the check fails.
4. Test an unchanged retry, stale revision, same-revision divergent body, concurrent writes, duplicate mutation ID with different payload, partial batch failure and lost HTTP acknowledgement. Verify client keeps local copies and reports uncertain status. Test offline-to-online resume and owner switch. Do not activate sync if any case falsely reports success or overwrites evidence.
5. Verify browser-authenticated users cannot upload, select or delete Storage objects under the current deny-all policy. After a separate reviewed scanner pipeline is implemented, test allowed/blocked MIME and signatures, hashes, actual byte limits, cross-user paths, clean-only downloads, scan failure and deletion.
6. Test consent recording, withdrawal, single-record deletion, all-data deletion, incident/attachment expiry, backup retention and restore. Implement missing jobs/fences and obtain founder/privacy approval for durations before external use.
7. Inspect Vercel project settings read-only. Require `SIGNALPULSE_DATA_MODE=synthetic`, `NEXT_PUBLIC_ENABLE_CLOUD_BACKUP=false`, `SIGNALPULSE_ATTACHMENTS_ENABLED=false` for current production. Verify preview access protection with an unauthenticated request before inviting external reviewers. Never add service-role or subscriber credentials to build variables.

## Release rule

Keep the cloud flag disabled and PR #5 in draft. Do not merge, deploy cloud mode, or collect real subscriber data until the CTO has reviewed the hosted evidence and approved the unresolved privacy, recovery, retention and security decisions.
