# Private evidence, export and deletion lifecycle

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED. Exact duration values belong to the [privacy matrix](../architecture/privacy-decision-matrix.md). Schemas/endpoints belong to [API](api-v1.md).

## Smallest useful evidence flow

First slice: create/edit an owned incident, view its history, generate a factual complaint description and export a text-only PDF and JSON. No file upload, measurement service or public statistics is a dependency. Empty measurements/retained_summaries/assets arrays in the export schema are honest. Later measurement linkage adds private summaries; attachments are a separate later capability.

Export reads authorized current incident revisions and selected measurement/snapshot summaries in one consistent snapshot. Recheck owner/deletion fences immediately before sending. If authorization is revoked during generation, abort and discard temporary output. Already transmitted bytes cannot be recalled; acknowledge this residual rather than promising an impossible atomic download. No partial silent omission of requested private records. Files still in quarantine are not embedded or served.

Use deterministic templates from stated facts, not an LLM. Identify user reports, application measurements, user attachments and official sources separately. State observed/device time, server receipt time and generation time distinctly. Formatting in Africa/Lagos must retain UTC in JSON. Include method, endpoint, context, missing/failed states and trust limitations. Do not state compensation entitlement, legal admissibility, fraud or operator fault. All personal narrative is plain escaped text; renderer has no unrestricted network/file access, remote fonts or URL loading. JSON/PDF derive from one evidence document; cap generation, fail on overflow, never silently truncate facts.

Export does not extend record retention. It returns private/no-store attachment bytes, not a public share link; temporary buffers are discarded after response/timeout. Copies intentionally downloaded by the user are outside later server deletion. The first slice does not promise a tamper-proof legal chain of custody.

## Preserved measurement summaries

At linking, user sees the incident expiry and confirmation that a minimal measurement summary will remain with this incident after detailed samples expire. Save only API Snapshot/MeasurementSummary fields, never latency sample arrays, exact slot timings, bearer tokens, raw receipt or connection logs. Source method/context/assessed_at and limitations are immutable. Linking again returns existing copy without resetting expiry.

After90-day raw expiry, the retained private summary says raw_expired and cannot participate in public analytics. This is preservation of a dated assessment, not revalidation. All exports of it include that limitation. Source raw expiry does not cascade delete an explicitly retained snapshot; explicit source-measurement deletion does. UI must preview how many incident summaries will be removed before issuing measurement delete. Deleting a link removes that copy only; deleting an incident removes all its copies/files, not unrelated standalone measurements.

## Attachment lifecycle (later phase)

```text
reserved → quarantined → clean → deleting → purged
                       ↘ rejected → deleting → purged
reserved/partial upload → deleting → purged
```

Reservation checks owner/parent/quotas and sets expiry no later than incident expiry. Stream through application into private quarantine with generated key, hard size limit and no overwrite. Only clean files are retrievable; reservation/quarantine never yields a download route that skips state validation. Validate declared/actual type, file signature, actual size, JPEG/PNG pixel dimensions (proposed max 25 megapixels), and PDF parsing/page/expansion limits (proposed max 50 pages). Scanner timeout/error fails closed. Provider/object storage does not supply malware assurance merely by being private.

Normalize image metadata only through a disclosed derivative pipeline; preserve exactly which submitted bytes the stored hash describes. Prefer client preview/redaction before upload so needless sensitive content never leaves the device. Do not automatically retain an unredacted original after the user intentionally submits a redacted version. Never store a user's path/filename in object keys. PDF download is attachment with nosniff, never active inline content. No remote attachment URL imports.

Initial transport proxies content through owner authorization; downloads do not use signed URLs. Server checks active owner, same-owner incident, live/nondeleted asset and clean state for every stream. Deletion fences stop new streams and attempt cancellation of active streams. A downloaded byte cannot be revoked. If a future approved signed-URL design is adopted, its max TTL, logs, caching and revocation lag need an amended contract before deployment.

## Withdrawal versus deletion

Contribution withdrawal changes no private incident/measurement content. A grant is not permission to expose raw records. Within the withdrawal transaction: increment contribution revision, mark ineligible, invalidate all affected release epochs (including comparisons and any owner-week selection changes), and install a public read gate that returns unavailable. Only then return success. Queue bounded cleanup/recalculation separately. No network-based CDN invalidation can be assumed atomic: the initial public aggregate endpoint uses no-store and no CDN caching. Replicas serving public reads must honor the same fence or stop serving affected data.

User-requested deletion first tombstones/fences data and all affected contribution, then runs idempotent removal over rows, preserved copies, files, caches, queued jobs and temporary exports. A failed job cannot restore access; it enters attention_required, retries with bounded backoff and alerts an accountable operator. GET deletion reports actual primary-purge state. Support must not say “fully erased” when backups still retain protected copies.

All-data deletion fences the owner first, revokes sessions, then purges every owned domain record, attachment, snapshot and receipt association. Keep only minimal job/replay-fence records for the finite policy window. Auth-provider deletion failure is retried after access is blocked. Restore from backup must replay deletion/withdrawal fences before any service opens; otherwise rollback can resurrect data. Choose a provider backup expiry within the approved bound or revise F03 before launch. No hidden indefinite legal hold is part of the MVP.

## Required scenario review

| Scenario | Expected result |
| --- | --- |
| Text-only incident before uploads exist | JSON and PDF contain incident and empty optional collections |
| Snapshot created on day 89, raw expires day 90 | Private dated summary remains until incident expiry, raw samples gone; public eligibility ends |
| User deletes source measurement after saving snapshots | All same-owner copies disappear and affected public cells become unavailable |
| User deletes one incident | Its copies/files disappear; standalone measurement remains private to own expiry |
| User withdraws during aggregate release | Transaction version/fence prevents stale public release; no private deletion |
| User deletes during upload/export | New access denied immediately; unfinished artifacts cleaned, no re-created child |
| Scan service down | File stays inaccessible; no fail-open download |
| Old idempotency retry after deletion | record_retired or authorization denial; no body/content replay |
| Backup restored | Fences replay before traffic; deleted records never served |

These are required future acceptance cases, not executed application tests.
