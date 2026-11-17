# Directive 001 review and baseline record

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED; author review completed, independent acceptance pending. Date: 2026-11-16.

## Baseline evidence

Local branch main; HEAD `5ea102175c76ccf44120a5d45ae78de0fcc83fe2`. Initial status ` M AGENTS.md` with87 inserted/19 removed lines relative to HEAD. SHA-256 of the pre-directive AGENTS.md was `65E480A08926C5894D38382A68B2AEA7C753C6161FC4B74854A91B57E81C4919`, equal to the prior delivered output. Prior audit revisions are incorporated locally but not committed; no other repository documentation/application files existed before this directive. The previous report and three output deliverables are preserved unchanged outside the checkout.

A sandbox identity change caused Git's dubious-ownership guard. Read-only Git operations use a command-scoped safe.directory for this exact known checkout; no global trust/config setting was changed. No fetch/remote mutation was needed; this record describes local HEAD, not an assertion that GitHub could not have changed independently since the prior audit.

A pre-edit copy of AGENTS.md and original output hashes were preserved in work/cto001-baseline. Root AGENTS.md was edited incrementally, retaining prior product/measurement/privacy conventions. New docs are untracked and no staging, commit, push or deployment was performed.

## CTO finding resolution and prior-audit contradictions

| Finding / prior ambiguity | Resolution in this proposal | Residual decision |
| --- | --- | --- |
| P0 measurement receipt could imply verified speed | ADR-004 + method/receipt matrix distinguish bytes written/received, client timing, user declarations and limited endpoint matching; unknown/expired receipts never public | F04 calibration and F05 residual spoofing risk |
| P0 guest ownership/recovery not concrete | ADR-002 + auth contract specify bootstrap, server-managed session, isolation, refresh/logout/revocation, loss and no-recovery default | F02 accept loss or design verified recovery; actual provider settings still need validation |
| P1 private save versus publication consent implicit | Per-record contribution defaults off; grant separate, withdrawal does not delete private evidence; read gate suppresses before ack | F03 notice/legal basis; F05 release |
| P1 raw90 days versus incident12 months unresolved | Explicit minimal private incident snapshots, fixed parent expiry; raw telemetry expires independently; manual source delete removes all copies | F03 durations/backup/support |
| P1 daily medians still overweight owners active on more days | Daily→weekly per-owner→cohort median gives one value per owner; one context per owner/week | F05 tradeoff: reduced travel/multi-SIM coverage; Sybils still possible |
| P1 “ten contributors” can read as people | Counts explicitly pseudonymous owners, bands and additional gates; no independent-person claim | F05 independent publication review |
| P1 roadmap table put attachment phase before exports despite prose promising journal→export | Revised phase 4 text-only PDF/JSON depends only on journal; attachment phase 7 separate | CTO sequence acceptance |
| Original manual neighbourhood scope more detailed than minimal LGA approach | Current contract LGA only; neighbourhoods/GPS deferred with explicit design gate | F03 precision |
| Original signed URL wording left access/revocation open | Default application proxy, no bearer download URLs; future alternative requires contract revision | F06 host caps/cost |
| Original public analytics allowed vaguely labelled incident data | Current public numerical scope limited to qualified download/latency; no incident rates or private upload comparison | F05 publication scope |
| Historical audit-only authorization could persist indefinitely | AGENTS separates historical mission, current directive and permanent rules; drafts do not authorize code | CTO acceptance plus separate implementation task |
| Missing contract precedence and required frontend acknowledgement | Index/AGENTS define accepted ADR versus approved interface/method authority and conflict-stop rule | Antigravity usability review pending |
| Unknown raw-data expiration impact on historical trends | Public60-day horizon shorter than90-day raw retention; no indefinite untraceable public archive | F03/F05 horizon acceptance |

Additional author cross-checks resolved within this draft: phase-scoped QualityIssue avoids treating failed upload as failed download; raw-expired source deletion can still purge owned retained summaries; receipt must be unused at ingestion but consumed thereafter; session-specific logout is distinct from owner-wide deletion; context selection, withdrawal and late regrant cannot silently republish a closed cohort.

## Model and review provenance

DeepSeek V4 Pro **did not run**. Session tool discovery exposed no callable DeepSeek specialist-review runtime; available collaboration model identifiers also do not include it. A public model catalog or image-model tool is not an authorized configured text review session. No credentials, dependency installations or alternative model routing were invented to simulate availability. DeepSeek Flash and Antigravity did not run. No handoff message was sent externally.

Codex performed the repository inspection, contract authorship and internal consistency review. This is author review, not independent security or statistical approval. CTO acceptance, Antigravity usability review and an independent qualified security/privacy/publication review remain pending at their respective gates. Use a genuinely available specialist later and record exact revision, reviewer, scenarios, findings and disposition.

Supabase skill guidance from the audit was applied to the ownership/storage proposal. Official documentation was rechecked for anonymous users, sessions and object access; source links are attached to relevant ADRs/contracts. No Supabase project or user data was accessed or modified.

## Exact repository changes

Modified:

- AGENTS.md

Added:

- docs/architecture/README.md
- docs/architecture/adr-001-web-and-data.md
- docs/architecture/adr-002-guest-ownership.md
- docs/architecture/adr-003-private-evidence.md
- docs/architecture/adr-004-measurement-boundary.md
- docs/architecture/adr-005-data-lifecycle.md
- docs/architecture/adr-006-publication.md
- docs/architecture/privacy-decision-matrix.md
- docs/architecture/founder-decisions.md
- docs/architecture/implementation-roadmap.md
- docs/architecture/antigravity-handoff.md
- docs/architecture/review-record.md
- docs/contracts/common.md
- docs/contracts/domain.md
- docs/contracts/api-v1.md
- docs/contracts/auth-sessions.md
- docs/contracts/evidence-lifecycle.md
- docs/contracts/aggregation.md
- docs/measurement/browser-http-v0.1.md
- docs/measurement/receipt-v0.1.md

Delivery copies, patches, manifest and review bundle are placed under outputs/CTO-Directive-001; they are snapshots, not independent editable contracts. Scratch validation tools remain outside the repository in work/. Prior outputs remain untouched. The directive patch is relative to the preserved pre-directive working state; the cumulative patch is relative to HEAD and includes the previous audit revision. Do not apply both patches to the same baseline.

## Documentation validation and limits

Validation checks: current branch/HEAD and allowed changed paths; whitespace/conflict markers; local Markdown link resolution; baseline/version/status labels; ADR and decision references; fenced JSON parsing and synthetic incident/consent example shapes; named schema-reference closure; methodology arithmetic and fixed-cohort boundary examples; text-only export sequencing; prior-output hashes; patch applicability/reversibility; bundle byte equality. Detailed actual results are delivered in DOCUMENTATION-CHECKS.md. These checks validate documentation structure and specified examples, not runtime behavior.

No application tests/build/lint/typecheck, live auth/RLS/storage test, upload scanner test, network throughput experiment, statistical field study or production scan was run. None is implemented. No real users/data were collected. No dependency, migration, application feature, authentication route, environment or production configuration was created.

Remaining risks: untrusted browser timing, Sybil guests and nonrepresentative sample; unrecoverable lost guest history; provider limits for proxy/streaming/revocation/backups; capacity for deletion/withdrawal fences; legally adequate notices/rights handling; expired raw evidence's limited re-verifiability; prior public/downloaded copies outside deletion control. These are explicit approval/validation gates, not defects claimed to be fixed by prose.

Mission stops after documentation delivery. Await CTO review; no implicit permission to implement, commit, push, deploy or collect user data.
