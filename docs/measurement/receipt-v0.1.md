# Receipt specification — receipt-0.1

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED. Internal authoritative schema, not a client-uploadable proof object.

## What a receipt means

| Observation | Trusted source / scope | Not established |
| --- | --- | --- |
| Session ID, owner binding, issue/expiry and declared context | Application issuance ledger | Actual operator/location/mobile data or independent person |
| Phase slot/request and server times | Controlled endpoint ledger | Unmodified browser or synchronized client clock |
| Download bytes written | Endpoint's application write counter | Browser receipt, TCP acknowledgment, radio goodput or displayed elapsed time |
| Upload bytes consumed | Endpoint read counter before ack | Radio-only upload speed or carrier-billed bytes |
| Endpoint health/timeout/cancel | Server diagnostics with minimal retention | That a failure was caused by a network operator |
| Client samples, byte reads, interruptions | Browser-submitted observations | Honest timing or genuine browser execution |
| Selected operator, LGA, mobile/VPN answers | User assertion frozen in session | Verified physical presence, serving network or VPN absence |

`endpoint_matched` means a stored client record was matched to this endpoint activity; it is not “verified measurement”. Do not serialize a `verified:true` shortcut.

## Ledger schema

Notation follows [common](../contracts/common.md). These fields are internal except the small ReceiptSummary response in [API](../contracts/api-v1.md).

```text
ServerReceipt { version: "receipt-0.1", id: ID, session_id: ID,
  owner_id: ID, method_version: "browser-http-0.1",
  endpoint_id: string, endpoint_region: string,
  declared_context: TestContext, issued_at: Instant, started_at: Instant,
  finalized_at: Instant, submit_by: Instant,
  endpoint_health: "healthy"|"degraded"|"unknown",
  phases: ServerPhase[], outcome: "completed"|"partial"|"cancelled"|"failed",
  consumed_measurement_id: ID|null }
ServerPhase { slot_id: ID, kind: "latency"|"download"|"upload",
  state: "completed"|"failed"|"cancelled"|"not_run",
  response_body_bytes_written: UInt, request_body_bytes_received: UInt,
  server_duration_ms: PositiveMs|null, started_at: Instant|null,
  ended_at: Instant|null }
```

Session ledger (before receipt) additionally stores owner/context, endpoint/method, slot IDs, token digests, reserved/consumed quota, start-by, active deadline and finalization state. Token material is generated securely and never stored in export/client draft. No narrative, precise coordinate, IP, detailed UA or billing data is part of a receipt. Upload response body bytes are control bytes, distinct from upload request bytes. The session-wide 16 MiB quota concerns transfer bodies defined by the method, not a claim to count protocol overhead.

## State and replay rules

1. Issue session after active-owner validation, test confirmation, capacity and rate/quota checks. Reserve quotas and a fixed slot plan atomically. Deny extra/concurrent/out-of-order slots. Public API cannot mint a finalized receipt.
2. First accepted phase fixes server started_at and deadline. Each slot token can transition unused→in_progress→terminal only once. A replay returns 409 and no new transfer; an interrupted slot is not restarted behind the user's back. Transport retries never allocate additional bytes.
3. Server finalizes a receipt on completed phase plan, terminal failure, cancel or deadline. A never-started session expires without a receipt. Unrun slots are recorded as not_run. GET receipt can show pending until finalization; client cannot force healthy/completed by supplying fields.
4. submit_by = finalized_at +10 minutes. Fetching or retrying does not extend it. Receipt ledger/slot rows expire24 hours after finalization/expiry, except minimal durable consumed-ID/idempotency fences needed for saved-record replay safety. A source summary stores the assessment, not the raw bearer token or full ledger.
5. Measurement save validates owner, session, receipt version/context/method/endpoint, timings, states and bytes from the authoritative ledger. Server clocks need monitored synchronization for ledger expiry/cohort boundaries; phase durations use monotonic counters. A receipt is owner-bound and cannot attach to another owner or method.
6. Atomically compare receipt unused + current ownership + request digest, create measurement and mark consumed_measurement_id. Duplicate same measurement/client_record_id is idempotent; distinct submission with consumed receipt is409. Transaction rollback leaves neither half saved. Concurrent submissions have at most one winner.
7. Missing receipt or legitimate expired same-owner receipt can save as client_only with a private reason. Unknown/foreign provided receipt returns 404; fabricated receipt contents are unknown fields and rejected. A deleted/expired ledger cannot be magically reconstructed from client JSON: offer a fresh client_only save only with null receipt/session as applicable and clear uncorroborated label, not a trusted retry. Durable consumed fences prohibit reuse of a consumed receipt ID even after ledger cleanup.
8. Late retries of an already successful saved request return the existing authorized resource through idempotency, even after receipt_submit_by; they are not a new acceptance. After deletion use replay fences to prevent resurrection; never return cached deleted content.

The browser receives only receipt ID/state/submit deadline. The application reads the ledger using a trusted server path; knowing the ID confers no access or validity. If transport is separated later, ledger ingestion requires authenticated server identity, anti-replay and approved keys/audience/canonicalization; a public signature format is intentionally not invented now.

## Privacy retention and evidence

Private MeasurementSummary records corroboration and assessed_at, original method/endpoint and limitations while raw measurement retention applies. Incident snapshots may preserve this dated assessment beyond raw/ledger expiry, explicitly stating details have expired and cannot be reverified. No raw receipt or signing key is embedded in PDFs/JSON. Manual deletion removes all summary copies; natural expiry follows ADR-005.

## Required review evidence

Synthetic walkthroughs: forged receipt body rejected; another owner's receipt404; invalid context422; valid complete receipt plus forged browser duration can still be submitted as a plausible candidate, demonstrating residual fraud risk; duplicate consume conflict; stale receipt private_only; receipt retry after successful save returns same record; unknown health excludes public use; download emitted but unread remains partial; deleted owner cannot finalize/export. Security review must explicitly acknowledge that no receipt design in this browser method proves independent people or honest client timing.
