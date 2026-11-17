# ADR-002 — Guest ownership and recovery

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED · Owner: Codex.

**CTO direction.** Resolve guest creation, access isolation, lost-session behavior, recovery, deletion and contributor-count limitations.

**Recommended default.** Local drafting needs no session. Explicit cloud-save or test-session creation creates a pseudonymous Supabase guest owner after a recovery notice. The application server manages provider credentials in secure cookies; browser code receives an application session description, not reusable provider tokens in JSON or localStorage. A guest Auth identity owns records; individual refresh/access sessions do not define independent contributors.

Supabase anonymous sign-ins use the authenticated database role and do not require email/phone. Losing the guest session without a linked identity can lose access. Role membership alone never grants access to another owner's data. [Supabase anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous).

No email, phone, device fingerprint, recovery code or account linking in this proposed first slice. Optional verified email linking before loss is a future alternative requiring F02 approval, UX/security contracts and explicit implementation authorization. There is no automatic merge of guest histories. An exported evidence file, record ID, IP, screenshot or knowledge of incident text is not a recovery credential.

**Tradeoff.** Guest-first minimizes collection and signup friction but cannot promise durable cross-device history. This limitation must appear before saving, on sign-out and in exports. If the founder requires recovery at launch, revise this decision before implementation; do not improvise support impersonation.

**Deletion.** A live owner can delete a record or all cloud data. Revoke authorization immediately through application/DB deletion state as well as provider session revocation; JWT expiry alone is insufficient. Lost owners cannot self-serve deletion; provide a privacy-request channel with proportionate ownership review and no unverified disclosure, plus automatic retention expiry. [Session lifecycle](../contracts/auth-sessions.md) is normative.

**Statistical boundary.** An owner can have several sessions; a person can create many owners; a shared browser may serve several people. Count pseudonymous owners, never independently verified people or devices.

**Founder pending.** F02: accept unrecoverable guest-first launch or require verified recovery; F03: privacy/support operations. **Review evidence later required:** two-owner isolation, stale/revoked token denial, guest creation retries, shared-device logout, lost-session messaging and deletion racing export/upload.
