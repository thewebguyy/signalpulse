# Typed contract coverage and unresolved specification details

Wire contract: 0.1.0. Architecture baseline: CTO001-r1 (provisionally accepted). Implementation coverage: CTO002-A-r1. This is an implementation index, not a new API revision. Normative shapes remain in ../contracts/api-v1.md and common.md.

## Available frontend contract surface

Import directly from @/contracts/<module>. DTO types are inferred from exported Zod schemas. Request schemas reject unknown fields, including supplied owner IDs. Response parsers strip additive fields; unknown enums fail validation and must never be treated as trusted/eligible. Required nullable fields must be present with null; missing values and empty strings are not substituted.

| Module | Implemented contract subset | Still requires service-level checks |
| --- | --- | --- |
| version, scalars, domain | Versions, exact enums, UUID/UTC/date/text/integer/duration/unit primitives | Random ID generation; trusted clocks; supported catalogs and registries |
| common | Success/failure/page envelopes, error codes/status map | HTTP serialization, headers, body caps, pagination/cursors, safe field-path mapping |
| session, catalogs | Guest acknowledgement, signed-out/active-guest DTOs, operator/area entries | Live auth, cookies, CSRF, recovery, active catalogs |
| incidents | Create/replace/read DTOs; injected clock/catalog create validation | Ownership, immutable fields, revision checks, durable uniqueness, retention, replay fences |
| measurements | Context, read-only summaries/history DTO, contribution request/response | Ingest, receipt verification, metric calculation, eligibility, grant/withdrawal transactions |
| evidence | Selection, preservation request and snapshot DTO, export document | All-resource ownership, atomic preservation, output caps, JSON/PDF renderer and deletion |
| intelligence | Fixed-query shape and published/unavailable DTO shape | Supported cohorts, qualification/suppression, privacy, count bands, statistics derivation |

Ports exist for auth, incidents, measurement history, evidence and intelligence. Their methods are not implemented or connected. The official-information boundary is explicitly contract_pending: CTO001-r1 intentionally defines no NCC read model. No fabricated NCC records or guessed route appear.

Synthetic fixtures are created via src/fixtures/synthetic.ts on the server. Keep the source/warning envelope when passing props to a frontend preview. They are not seeds, network observations, credentials, approved Lagos catalog entries or a fake authenticated session. The text-only export-shaped fixture has empty measurement, preserved-summary and asset arrays.

## Deferred contradictions and clarifications

| ID | Evidence in CTO001-r1 | Treatment in this milestone | Decision needed before |
| --- | --- | --- | --- |
| C01 | common.md says retry_after_seconds is null except 429/retryable503, then requires a retry delay for operation_in_progress409 | Error enum/status retained; error constructor excludes operation_in_progress rather than choosing semantics | HTTP idempotency handler: CTO to approve the 409 exception or remove the conflicting requirement |
| C02 | common.md says Instant normalizes supported input; exact accepted alternate representations are unspecified | Schema accepts the canonical millisecond UTC wire form only; UI must serialize to it | Any adapter accepting alternate timestamp syntax must specify and review normalization first |
| C03 | api-v1 latency observations require slot_id; client-only session_id=null is allowed; the offline/no-ledger slot plan is not fully defined | No MeasurementCreate/TestSession implementation or fake receipt validator | Measurement ingestion and browser transport |
| C04 | Method permits independently useful completed metrics; receipt termination on failure and subsequent-slot handling need a shared state-machine walkthrough | Read-only summary DTO only, no state derivation or transport | Measurement implementation review, including partial latency/download/upload cases |
| C05 | NCC content model, editorial workflow and account recovery linking are explicitly undefined | Disabled boundary, no invented API | Those separately authorized features |
| C06 | F01 historically gates scaffolding; original documents still say no implementation exists | CTO002-A explicitly authorizes the local stack; preserve historical docs and record current state here | No blocker to this foundation; remaining provider/region/cost choices still need approval |

Do not silently modify the baseline to erase these issues. They do not block pure shapes, fixtures or a local shell. Dependent services remain unimplemented. CTO/Antigravity review must resolve C01/C03/C04 before affected execution; C02's broader input support requires a contract clarification.

## Integration expectations

- Parse untrusted API data using the applicable response schema when routes eventually exist; schema failure becomes a safe generic integration error.
- Do not cast arbitrary JSON to a DTO or turn a failed validation into an empty success.
- Ports are domain interfaces, not HTTP clients. No frontend may invent fetch routes or send owner_id.
- Distinguish user_reported, app_measured, device_observed, user_attached and official_source at every display/export boundary.
- Never infer contribution from private saving. Withdrawals may use null/old notice; grants require contribution-0.1 and deliberate action.
- Never display null as zero. endpoint_matched corroborates endpoint activity, not operator, location, truthful client timing or independent people.
- Preserve UTC values; label any user-facing conversion Africa/Lagos.
- A passed shape test does not authorize public publication or imply future services enforce access control.
