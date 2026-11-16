# Antigravity handoff — review before frontend execution

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED; **handoff for usability review only, no frontend implementation authorized**.

Base Git commit: 5ea102175c76ccf44120a5d45ae78de0fcc83fe2 on main. AGENTS.md has preserved prior audit changes plus this directive's revisions; docs are uncommitted. Read root AGENTS.md, [index](README.md), [API schemas](../contracts/api-v1.md), [session lifecycle](../contracts/auth-sessions.md), [evidence lifecycle](../contracts/evidence-lifecycle.md), [publication](../contracts/aggregation.md) and [roadmap](implementation-roadmap.md). Do not treat the initial audit's broad endpoint suggestions as a competing API.

## Ownership boundary

Codex owns backend contracts and integration coordination, schema/access-policy proposals, server measurement endpoint/receipt validation, privacy lifecycles and export semantics. Antigravity owns frontend implementation, accessible interaction design, PWA/drafts and browser-side measurement **after approval**. Neither may independently alter shared payloads, enums, method sizes/timing, consent semantics or ownership. Proposed usability changes must be returned as contract review comments with scenario, affected field and suggested resolution; do not patch a different backend into mocks.

## Review required before execution

Confirm the exact baseline/API/method/notice revisions. Walk through these states and flag missing fields or contradictions:

1. Local draft without a session → explicit guest warning → private save → no contribution selected.
2. Session expires or browser data is cleared → private history unavailable → no recovery promise, no silent resave under a new owner.
3. Incident text only → JSON/PDF and editable factual complaint template. Upload and network test must not block this path.
4. Consent control appears only for a saved measurement, default off. Grant means candidate only; withdrawal displays pending until server ack. Do not imply a public cohort exists.
5. Bounded test: data-cost confirmation, cancel, app-measured labels, unsupported upload, partial results, client_only receipt state and declared operator/LGA. No “verified mobile speed” badge.
6. Explicit measurement retention with an incident → shown expiry → raw_expired summary label later. Source deletion previews removal of linked summaries.
7. Later file flow: redact notice, uploading, quarantined, clean, rejected, deletion pending; no public/signed URL or active PDF preview assumptions.
8. Public unavailable state has no hidden count or inferred cause. Pseudonymous owner bands are not unique people. Do not rank an unavailable operator as worst.
9. Owner A logs out on a shared device: no cached private content; local drafts clearly identified and controllable. Service worker excludes private API, measurements, exports and files.

Acknowledge usability against actual fields/errors: null versus zero; timestamps/timezone; expected_revision conflicts; safe retries; guest bootstrap and anti-CSRF token transport; deletion202 accepted versus complete; API503 capability_disabled for unreleased phases. Mocks must be explicitly synthetic and contract-derived only after authorization; no fabricated live activity counters or claims.

## Response requested from Antigravity

Return reviewed revision, reviewer/tool identity, date, supported-browser assumptions, scenario outcomes, blockers and agreed contract changes. Acceptance must precede frontend execution. The current mission did not invoke Antigravity and did not send this brief externally. An unavailable reviewer is recorded as pending, not automatically approved. DeepSeek V4 Pro did not run in this session; do not attribute specialist sign-off to it.

## First eventual frontend slice

Once authorized: local journal form, guest-save warning, owned history and text-only evidence review/download. Possible module ownership: features/incidents, features/evidence-ui and lib/offline; exact paths follow accepted scaffold. No upload transport, public map, native collector, runtime LLM or automatic complaint submission. Security/access decisions remain server-authoritative even if the UI hides controls.
