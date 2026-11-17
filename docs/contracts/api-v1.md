# API v1 — proposed request/response schemas

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED. No API routes exist. All paths below are under `/api/v1` except explicitly named measurement transport. Common scalar, wrapper, error, idempotency and cache rules are in [common](common.md). Closed objects below use that schema notation; every listed field is required unless a dedicated partial-update rule says otherwise. This baseline uses full PUT replacements, not ambiguous PATCH.

## Endpoint inventory

`S<T>` means common `Success<T>`. `Page<T> { items: T[], next_cursor: string|null }` uses the bounded common pagination rules. Any inaccessible owned ID returns 404, regardless of method.

| Method / path | Access | Request | Success | Additional constraints |
| --- | --- | --- | --- | --- |
| GET /session | Public, same origin | none | 200 S<Session> | Bootstrap CSRF cookie/token; private/no-store |
| POST /session/guest | Bootstrap-bound | GuestCreate | 201 S<Session> | Existing active guest returns 200; never create on page load |
| POST /session/logout | Owner | Empty | 204 | Clear cookies/revoke; warning in UI before request |
| GET /operators | Public | none | 200 S<OperatorEntry[]> | Four operators |
| GET /areas | Public | none | 200 S<AreaEntry[]> | Curated Lagos LGAs; no user locations |
| POST /incidents | Owner | IncidentCreate | 201 S<Incident> | Owner-scoped client_record_id |
| GET /incidents | Owner | cursor, limit | 200 S<Page<Incident>> | Own rows only |
| GET /incidents/{id} | Owner | none | 200 S<Incident> | No raw linked file bytes |
| PUT /incidents/{id} | Owner | IncidentReplace | 200 S<Incident> | expected_revision; does not renew expiry |
| DELETE /incidents/{id} | Owner | none | 202 S<Deletion> | Includes snapshots/assets, leaves standalone measurements |
| POST /measurement-sessions | Owner | TestCreate | 201 S<TestSession> | Explicit test confirmation; no contribution consent implied |
| GET /measurement-sessions/{id}/receipt | Owner | none | 200 S<ReceiptSummary> | Pending ledger state allowed; see receipt spec |
| POST /measurements | Owner | MeasurementCreate | 201 S<Measurement> | Atomic receipt consume if eligible; raw immutable |
| GET /measurements | Owner | cursor, limit | 200 S<Page<Measurement>> | Own rows, summaries only |
| GET /measurements/{id} | Owner | none | 200 S<Measurement> | Private quality reasons |
| DELETE /measurements/{id} | Owner | none | 202 S<Deletion> | Also purges linked snapshots; UI previews impact |
| POST /incidents/{id}/measurement-snapshots | Owner | SnapshotCreate | 201 S<Snapshot> | Same owner; explicit preservation; unique incident/source pair |
| GET /incidents/{id}/measurement-snapshots | Owner | none | 200 S<Snapshot[]> | Max 20 per incident |
| DELETE /incidents/{id}/measurement-snapshots/{snapshot_id} | Owner | none | 202 S<Deletion> | Unlinks only this preserved summary, not source raw data |
| GET /measurements/{id}/contribution | Owner | none | 200 S<Contribution> | Never inferred from saving |
| PUT /measurements/{id}/contribution | Owner | ContributionChange | 200 S<Contribution> | Immediate public exclusion on withdrawal before ack |
| POST /exports | Owner | ExportCreate | 200 JSON document or PDF bytes | No wrapper; no persistence; see ExportDocument and lifecycle |
| POST /assets | Owner | AssetReserve | 201 S<Asset> | Later phase; 503 capability_disabled until released |
| PUT /assets/{id}/content | Owner | Binary | 200 S<Asset> | One immutable upload, streaming size cap, later phase |
| GET /assets/{id} | Owner | none | 200 S<Asset> | No object path or bearer URL |
| GET /assets/{id}/content | Owner | none | 200 bytes | clean only, download attachment, no-store |
| DELETE /assets/{id} | Owner | none | 202 S<Deletion> | Fenced immediately |
| POST /privacy/delete-all | Owner | DeleteAll | 202 S<Deletion> | Fence/revoke all sessions; see auth contract |
| GET /deletions/{id} | Owner, still active | none | 200 S<Deletion> | No public tracking by job ID |
| GET /intelligence | Public | cohort query below | 200 S<PublicCohort> | Sanitized fixed cohorts only |

NCC source import/admin endpoints and recoverable account linking are deliberately not defined or authorized here; a reviewed content read model can be designed when that milestone is approved. Browser UI must not invent such routes. Developer fixtures derive from these contracts only after implementation authorization.

## Session and catalogs

```text
Empty {}
GuestCreate { accept_guest_limitations: true }
Session { state: "signed_out"|"active_guest", owner_id: ID|null,
          recovery_mode: "none", csrf_token: string }
OperatorEntry { code: Operator, display_name: Text }
AreaEntry { id: AreaID, name: Text, state: "Lagos", kind: "lga" }
```

csrf_token is a transport anti-CSRF value, not an access credential; signed_out implies owner_id=null. active_guest implies non-null owner_id. No response reveals another owner. GET session failure to validate/refresh returns signed_out (or retryable 503 when validation service is unavailable), never fabricated active state.

## Incidents

```text
IncidentFields { operator: Operator, area_id: AreaID|null,
  category: IncidentCategory, occurred_at: Instant, narrative: Text,
  complaint_reference: Text|null, complaint_contacted_at: Instant|null }
IncidentCreate { client_record_id: ID, client_created_at: Instant,
  fields: IncidentFields }
IncidentReplace { expected_revision: UInt, fields: IncidentFields }
Incident { id: ID, client_record_id: ID, fields: IncidentFields,
  provenance: "user_reported", revision: UInt, created_at: Instant,
  updated_at: Instant, expires_at: Instant }
```

Narrative 1–4000 code points; complaint_reference 1–128 when non-null. occurred_at is user-reported and cannot exceed server time +5 minutes; old incident dates are allowed, while client_created_at controls offline retry age. complaint_contacted_at may be present without a ticket (operator may not issue one), and vice versa (date unknown); both are private. Catalog ID must be supported. area_id is optional for private evidence. revision starts at 1; server created_at/expiry are immutable. No payment account/phone or exact address field is added.

## Test session and browser observations

```text
TestContext { operator: Operator, area_id: AreaID|null,
  mobile_data_confirmed: boolean, vpn: "yes"|"no"|"unknown" }
TestCreate { method_version: "browser-http-0.1", context: TestContext,
  upload_requested: boolean, confirm_metered_test: true }
TestSession { id: ID, method_version: "browser-http-0.1",
  endpoint_id: string, endpoint_region: string, context: TestContext,
  phase_plan: PhaseSlot[], payload_budget_bytes: UInt,
  active_duration_limit_ms: UInt, start_by: Instant,
  receipt_submit_by: Instant|null }
PhaseSlot { id: ID, kind: "latency"|"download"|"upload",
  payload_bytes: UInt, transport_path: string, one_use_token: string }
ReceiptSummary { session_id: ID, receipt_id: ID|null,
  state: "pending"|"final"|"expired", submit_by: Instant|null }
LatencyObservation { slot_id: ID, duration_ms: PositiveMs|null,
  state: PhaseState }
TransferObservation { slot_id: ID|null, state: PhaseState,
  bytes_observed: UInt, duration_ms: PositiveMs|null }
BrowserObservation { observed_start: Instant, observed_end: Instant,
  latency: LatencyObservation[], download: TransferObservation,
  upload: TransferObservation, visibility_interrupted: boolean,
  connection_changed: boolean, app_version: string }
MeasurementCreate { client_record_id: ID, client_created_at: Instant,
  session_id: ID|null, receipt_id: ID|null,
  method_version: "browser-http-0.1", endpoint_id: string,
  context: TestContext, observation: BrowserObservation }
Metric { state: PhaseState, value: number|null, unit: "ms"|"Mbps" }
MeasurementSummary { method_version: string, endpoint_id: string,
  endpoint_region: string|null, context: TestContext,
  observed_start: Instant, observed_end: Instant, received_at: Instant,
  state: MeasurementState, latency: Metric, download: Metric, upload: Metric,
  corroboration: "client_only"|"endpoint_matched",
  receipt_version: "receipt-0.1"|null,
  quality_flags: QualityIssue[], assessed_at: Instant }
QualityIssue { code: QualityFlag,
  scope: "record"|"latency"|"download"|"upload" }
Measurement { id: ID, client_record_id: ID, summary: MeasurementSummary,
  provenance: "app_measured", contribution: Contribution,
  created_at: Instant, expires_at: Instant }
```

`QualityFlag` = `receipt_missing` | `receipt_expired` | `endpoint_error` | `phase_mismatch` | `duration_too_short` | `client_clock_skew` | `interrupted` | `mobile_unconfirmed` | `location_unknown` | `vpn_not_excluded` | `upload_private_only`.

Receipt/context/clock/interruption flags have record scope and exclude both public metrics. duration_too_short has download scope in this method; upload_private_only has upload scope. phase_mismatch and endpoint_error identify an affected phase; a degraded/unknown whole endpoint uses record scope. A private upload error must not accidentally disqualify a completed healthy download or latency metric. Qualification evaluates record-level issues plus issues scoped to the candidate metric.

receipt_version records the version actually assessed from the trusted ledger, including an expired receipt assessment when available; null when no ledger was assessed. It does not change client_only into endpoint_matched. Expired-ledger evidence summaries preserve the version of the historical assessment, not a claim to ongoing verification.

Endpoint IDs and app_version are 1–64 ASCII safe identifier characters. Endpoint region comes from registry, never trusted client input. phase_plan determines slot count (five latency, one download, optional one upload); tokens/paths are sensitive and never persisted in IndexedDB/logs/exports. Context is frozen at test creation; saving a session-bound result with different context is 422. session_id=null requires receipt_id=null; such a structurally valid supported endpoint result is private client_only. A nonexistent/foreign supplied session/receipt yields 404, not a fallback upgrade. Owner-matched but malformed receipt relationship = 422. Expired legitimate receipt permits private save with receipt_expired, no consume/qualification. Already consumed receipt on another submission = 409.

Completed transfer requires bytes>0 and duration_ms>0; not_run/unsupported requires bytes=0,duration_ms=null,slot_id=null. Failed/cancelled phase may have partial byte count and duration, but yields null Metric.value. Latency includes at most five exact session slots, with completed durations required; absent phases are not zero. No client-supplied Mbps values are accepted. Server recomputes using submitted samples, labels client timing, and cross-checks receipt. At least one attempted phase is required for saving. Server derives overall state as specified by the method. Future metric/provider/method versions require a contract revision.

## Contribution

```text
Contribution { state: ContributionState, revision: UInt,
  notice_version: string|null, changed_at: Instant,
  publication_effect: "not_contributing"|"candidate_only"|"withdrawn" }
ContributionChange { expected_revision: UInt, contribute: boolean,
  notice_version: string|null }
```

New measurement contribution is off, revision=1, notice_version=null. Grant requires current contribution-0.1 notice and a fresh deliberate UI action; server stores event, not guessed consent. Withdraw uses contribute=false and accepts null or historical notice; never gate withdrawal on accepting a new notice. False on off stays off; false on on transitions withdrawn; regrant transitions on under current notice, but closed/released cohorts are not retroactively republished. `on` means candidate_only, never guaranteed publication. No raw narrative/asset contribution API exists.

## Snapshots and private export

```text
SnapshotCreate { measurement_id: ID, confirm_private_retention: true }
Snapshot { id: ID, incident_id: ID, source_measurement_id: ID,
  summary: MeasurementSummary, provenance: "app_measured",
  retained_at: Instant, expires_at: Instant,
  source_status: "raw_available"|"raw_expired", limitations: Text[] }
ExportCreate { format: "json"|"pdf", incident_ids: ID[],
  measurement_ids: ID[], include_linked_summaries: boolean }
ExportDocument { export_schema_version: "evidence-0.1", generated_at: Instant,
  timezone: "Africa/Lagos", incidents: Incident[],
  measurements: ExportMeasurement[], retained_summaries: Snapshot[],
  complaint_descriptions: ComplaintDescription[],
  assets: ExportAsset[], limitations: Text[] }
ExportMeasurement { id: ID, summary: MeasurementSummary,
  provenance: "app_measured" }
ComplaintDescription { incident_id: ID, text: Text }
ExportAsset { id: ID, incident_id: ID, media_type: string,
  size_bytes: UInt, sha256: Sha256, provenance: "user_attached" }
```

At least one incident or measurement ID, max 20 combined unique selections. Request order is preserved; duplicate IDs rejected. All resources must be same owner and live; any inaccessible selected ID fails entire export with 404, never a silent partial dossier. Linked summaries are included only for selected incidents when requested. Snapshot summary copies no raw sample arrays, secret receipt/session tokens, owner ID or contribution history. Total summaries per incident max 20. Snapshot expiry equals incident expiry; explicit linking is atomic and cannot occur after source raw expiry. Link to existing pair returns existing snapshot (200) rather than extending retention.

First export milestone has measurements/retained_summaries/assets empty arrays but uses the same document shape. Later clean asset metadata may be included automatically for selected incidents; no raw attachment bytes, storage path, URL or filename. Unsafe/pending assets are excluded with a general limitation explaining omission; counts remain private within the owner's document. Maximum generated output 5 MiB and selected resources' bounded content; renderer overflow fails with 413, not truncation. Complaint template generated from user facts only; editable client-side text must not overwrite saved source facts implicitly. Never auto-send. On-demand PDF must represent the same fields/limitations as JSON; display labels may differ but semantics must not.

## Assets and deletion

```text
AssetReserve { incident_id: ID, media_type: "image/jpeg"|"image/png"|"application/pdf",
  size_bytes: UInt }
Asset { id: ID, incident_id: ID, state: AssetState,
  media_type: string, size_bytes: UInt, sha256: Sha256|null,
  created_at: Instant, expires_at: Instant }
DeleteAll { confirm_delete_all: true }
Deletion { id: ID, state: "accepted"|"processing"|"complete"|"attention_required",
  accepted_at: Instant, primary_purge_due_at: Instant,
  message: Text }
```

Asset size 1..5,242,880 bytes; max five nondeleted assets/reservations per incident. No path/key/hash supplied by client. PUT content requires Content-Type and actual bytes matching reservation, enforces max while streaming, computes server hash, no overwrite; exact retry with same idempotency digest may return existing state. Different body/key for already uploaded asset =409. A failed upload consumes its one reservation; create a fresh one after failed reservation cleanup or explicit delete. GET content rejects not-clean with 409 state_conflict; inaccessible always404. See [evidence lifecycle](evidence-lifecycle.md) for access/purge semantics.

DELETE endpoint responses acknowledge fences, not completed storage erasure. `message` distinguishes accepted cleanup from complete primary purge and separately disclosed backup expiry. Current session may stop working immediately after delete-all, so do not require polling as proof of submission. Owner-authenticated support may explain status without treating id as an access token.

DELETE /measurements/{id} also resolves an expired raw source through live same-owner snapshots and removes all of those copies. It returns 202 when such a private preservation record exists even though GET /measurements/{id} returns 404 after raw expiry. If neither owned raw data nor owned snapshots exist, return404. This exception does not reveal another owner's source. Natural expiry denies raw reads/contribution immediately based on expires_at, without waiting for a purge job.

## Public intelligence

Query requires area_id, operator, week_start, method_version, endpoint_id, metric=`download`|`latency`; only catalogued fixed values; week_start must be Monday Lagos date. No freeform filters or arbitrary time ranges. Unknown catalog/cohort query =400; valid empty/suppressed/disabled cohort always200 with uniform unavailable response. No endpoint returns private exclusion reasons or exact suppressed counts.

```text
PublicCohort { area_id: AreaID, operator: Operator, week_start: Date,
  method_version: string, endpoint_id: string, metric: "download"|"latency",
  status: "published"|"unavailable", statistics: PublicStatistics|null,
  aggregation_version: "aggregate-0.1", limitations: Text[] }
PublicStatistics { unit: "Mbps"|"ms", median: number,
  p25: number, p75: number, raw_test_count_band: string,
  contributing_owner_count_band: string, observation_cutoff: Instant,
  published_at: Instant, expires_at: Instant,
  quality: "screened_voluntary_sample" }
```

Unavailable forces statistics=null and one generic limitation (“No publishable observations for this cohort”). It does not distinguish zero samples, too few owners, withdrawal, abuse or disabled release. Published limitations must state operator/location self-selection, client timing, pseudonymous owner count and nonrepresentative sampling. Bands and algorithm are specified only in [aggregation](aggregation.md).

## Contract walkthrough examples

Synthetic incident create (idempotency key in header):

```json
{"client_record_id":"00000000-0000-4000-8000-000000000010","client_created_at":"2026-11-16T09:00:00.000Z","fields":{"operator":"mtn","area_id":null,"category":"failed_call","occurred_at":"2026-11-16T08:55:00.000Z","narrative":"My call did not connect. This is my reported experience.","complaint_reference":null,"complaint_contacted_at":null}}
```

Separate contribution decision, never bundled into save:

```json
{"expected_revision":1,"contribute":true,"notice_version":"contribution-0.1"}
```

Withdrawal:

```json
{"expected_revision":2,"contribute":false,"notice_version":null}
```

Required negative examples for future contract tests: supplied owner_id→400; unknown category→422; B's incident ID→404; stale revision→409; same idempotency key/different narrative→409; unsupported method→422; identical saved request retry→same resource, never another test; expired session cannot sync private drafts as a new owner without user action.
