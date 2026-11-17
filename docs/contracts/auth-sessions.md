# Authentication and guest session lifecycle

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED. Default depends on F02. Authentication is not implemented.

## Creation and transport

Local drafts and public catalogs need no guest. GET /api/v1/session returns signed-out or owned state and an anti-CSRF token, never provider credentials. Before first cloud save/test, UI shows: “This private history is tied to this browser session. Without a recovery method, clearing browser data or signing out can lose access. Export important records.” User explicitly accepts guest limitations; POST /session/guest creates the provider guest and binds it to server-managed Secure, HttpOnly, SameSite=Lax cookies. Reject cross-origin creation; rate-limit creation separately from data mutations. Token values never enter URLs, logs, export or local draft storage.

Creation uses a short-lived same-site bootstrap cookie and an idempotency key bound to that browser bootstrap, not an attacker-supplied owner. Repeated concurrent creation returns the same live session when possible. A response lost before cookie establishment must not expose a created owner's credential based on knowledge of the idempotency key alone; require the original bootstrap binding. Orphaned empty guest identities are cleaned on the schedule in the privacy matrix. This is not durable account recovery.

## States and refresh

| State | Allowed behavior | Transition |
| --- | --- | --- |
| local_only / signed_out | Draft locally, read public catalogs and sanitized public summaries | Explicit guest creation → active_guest |
| active_guest | Own CRUD/export; explicit measurement; per-record consent | Refresh under server adapter, logout or deletion |
| expired_session | Preserve local drafts, stop private reads/writes; do not sync as another owner | Valid provider refresh → same owner; failure → signed_out with recovery notice |
| deleting | No new reads/exports/writes/tests; cleanup continues | Revocation + deletion → signed_out |
| lost_session | No authenticated link to old owner | New guest is a new owner; no access transfer |

Validate provider claims and expiry plus current session/owner revocation state for sensitive operations. Signature verification alone does not establish non-revocation. Refresh rotates tokens server-side; concurrent refresh must not leak between requests. Never trust owner/role from user-editable metadata. Anonymous users' authenticated role is not cross-owner authorization. Provider token lifetime is an implementation setting requiring review, not a reason to postpone a delete/revoke fence. Provider sessions can persist until terminated according to configuration; configure intended limits explicitly. [Supabase sessions](https://supabase.com/docs/guides/auth/sessions).

GET session reports `recovery_mode: "none"`; it must not advertise an unimplemented option. Active ownership queries and RLS must deny an owner marked deleting even if an older JWT remains cryptographically valid. Same-origin application API is the only supported browser auth adapter in this baseline; use provider-appropriate server APIs after version verification, not guessed SDK calls in this document.

## Logout, loss and recovery

POST /session/logout revokes that provider session, sets a session-specific authorization fence, clears cookies, and tells the UI to clear private in-memory state/local caches. It does not delete the owner or the records; all-data deletion uses an owner-wide fence. Warn beforehand that no linked recovery exists. Local drafts are not automatically uploaded; offer explicit deletion on the device. A browser reopened by another person must not show a previous owner's cached history. This cannot secure a session deliberately left open on a shared device; communicate the risk.

Clearing browser storage, expiry without refresh, device loss or logout can make cloud records inaccessible. Creating a new guest must not attach old queued requests to that new owner without a deliberate new-save flow; existing server-linked drafts are frozen until the original session is restored, otherwise export their local text or abandon them. Do not merge two owners by matching narrative, time, IP, export hash or client_record_id.

Recovery options for founder review: (A) guest-first with no recovery, default; (B) opt-in verified identity linking while still authenticated, a separate future contract; (C) mandatory recoverable accounts, larger collection/friction and a changed product decision. No recovery token system is silently added. A privacy support request is not an account-recovery shortcut. If ownership cannot be proportionately verified, do not disclose or transfer records; rely on policy-driven expiry and specialist-approved rights handling.

## Deletion and counting

Delete single objects while active or request all-data deletion. All-data deletion first atomically fences owner access and contribution, then revokes provider sessions and purges records/storage asynchronously; failure to reach Auth must not reopen access. Cleanup status is privately scoped; all-data response returns a non-secret reference for support, not a new read credential. A lost session cannot read deletion status by reference alone.

Count distinct owner IDs internally, not access sessions. Refreshing/login sessions must not increase contributors; new guest creation can. Neither owner IDs nor IP addresses establish independent people. Any CAPTCHA/abuse provider needs privacy/cost review before use. No fingerprint or SIM identifier is permitted for deduplication.

Required review evidence later: A/B/signed-out access, guessed IDs, forged owner fields, concurrent bootstrap/refresh, revoked JWTs, offline sync after owner switch, logout caches, all-data deletion race, and explicit lost-session UX. F02 acceptance and Antigravity usability acknowledgement remain pending.
