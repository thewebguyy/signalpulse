# ADR-004 — Measurement endpoint and receipt boundary

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED · Owner: Codex.

**CTO direction (P0).** State precisely what the server corroborates, what remains client-reported and what may enter public summaries.

**Recommended default.** A controlled transport exposes fixed bounded phases under an expiring owner-bound test session. Colocate with the application only if streaming, buffering, cache, compression, timeout and capacity validation passes. Keep endpoint ID/region configurable and method-versioned. An opaque receipt ID resolves to a trusted server-side ledger record; the browser never supplies authoritative receipt contents. This avoids an unnecessary public signing protocol for a single system.

The server corroborates session issuance, phase requests received, bytes accepted from uploads, bytes written by the endpoint for downloads, its own elapsed times, endpoint health, phase completion and unique consumption. Bytes written are not proof of browser receipt. Browser elapsed time, bytes read, latency, network conditions, operator and location remain client observations or user assertions. A valid receipt is not device attestation or a verified speed certificate.

**Public qualification.** Only consented records matched to a timely server receipt that was unused at ingestion, then atomically consumed, may become publication candidates. A candidate metric must complete its compatible method. Endpoint errors, invalid/missing/expired receipts, unsupported methods, implausible/inconsistent metrics and insufficient test duration exclude affected metrics according to QualityIssue scope. Receipt matching is necessary but insufficient: client timing is forgeable and guest owners are Sybil-prone. Even qualified records stay unpublished until the release gate in [aggregation](../contracts/aggregation.md) is accepted. The initial proposal publishes only download and latency distributions; optional upload remains private until separately calibrated.

Private history may retain structurally valid late or uncorroborated browser results labelled `client_only`; it must not upgrade their trust based on receipt-looking text. A receipt referencing another owner is rejected without revealing existence.

**Alternatives.** Random third-party speed endpoints lack controlled semantics. Signed receipts still cannot prove cellular access. An external endpoint may later sign or authenticate server-to-server ledger updates, but requires a separate trust/key/availability review and no change to the claims permitted here.

**Founder pending.** F04: metered pilot and endpoint costs; F05: residual publication risk. **Review evidence:** replay/cross-owner tests, byte limits, no cache/compression, cancellation, malicious client timing, endpoint outages, clock skew, receipt deletion/minimization and field calibration. Exact proposal: [method](../measurement/browser-http-v0.1.md) and [receipt](../measurement/receipt-v0.1.md).
