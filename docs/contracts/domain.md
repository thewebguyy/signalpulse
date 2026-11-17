# Domain and ownership contract

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED. Conceptual entities, not table names or migrations.

## Controlled vocabulary

IncidentCategory = `failed_call` | `dropped_call` | `unusable_internet` | `suspicious_data_depletion` | `failed_airtime_data_purchase` | `billing_dispute`.

Provenance = `app_measured` | `device_observed` | `user_reported` | `user_attached` | `official_source`.

An incident has fixed user_reported provenance; an asset user_attached; an institutional record official_source. Browser result provenance app_measured describes the measurement mechanism, not external validation. Its operator/area/conditions remain user_reported, and `corroboration` is separately `client_only` or `endpoint_matched`. No browser signal-strength field uses device_observed in this version. Clients cannot supply trusted provenance, ownership, moderation or receipt-validation state.

MeasurementState = `completed` | `partial` | `cancelled` | `failed`.
PhaseState = `completed` | `failed` | `cancelled` | `not_run` | `unsupported`.
ContributionState = `off` | `on` | `withdrawn`.
AssetState = `reserved` | `quarantined` | `clean` | `rejected` | `deleting`.

## Entities and constraints

| Concept | Required relationship and invariant | Sensitive data / index intent |
| --- | --- | --- |
| Owner | Supabase guest identity; active/deleting/deleted access state and minimal revoked-session fences; no profile fields required | ID and access state private; every owned FK indexed |
| Operators | Four stable codes and display names; IDs never reassigned | Catalog public, unique code |
| Areas | Curated Lagos LGA ID/name/state; no geometry or fuzzy location matching | Catalog public, associations private; unique ID |
| Incidents | Owner, operator, nullable area, controlled category, observation time, narrative, nullable complaint reference/date; immutable created time and retention deadline; revision | Text, timeline and ticket private; index owner + created_at/id |
| Measurements | Owner, client_record_id, method and endpoint, selected operator/area, observations, server receipt time, computed summaries, corroboration and quality state | Immutable after save except contribution/moderation/deletion; index owner/time and cohort dimensions/time; no client owner field |
| Incident measurement snapshots | Explicit same-owner incident↔measurement link; immutable minimal summary copied when linked with user's confirmation; source measurement ID may become nonresolvable after raw expiry | Unique incident/source pair; private; cannot enter aggregation; index incident and source ID for cascading explicit deletion |
| Evidence assets (later) | One incident and same owner; generated unique object key; actual size/MIME/hash; lifecycle and incident expiry | Private objects and hashes; no user-chosen path; index incident/state/time |
| Measurement sessions and receipts | Owner-bound session, declared context, method/endpoint, phase slots, quota ledger, trusted endpoint observation and consume-once receipt binding | Short-lived operational data; index session/owner/expiry; no private narrative or permanent credential |
| Contribution events | Measurement + owner, event time, notice version, granted/withdrawn, revision | Private purpose record; not demographic/profile tracking; index measurement + event time |
| Official source revisions | Source URL/publisher/hash/retrieval time, nullable publication date, review/superseded status | Reviewer details private; only reviewed factual projection public |
| Compensation areas | Reviewed source revision + operator + LGA + assessment month | Unique tuple; no subscriber eligibility, usage or payout amounts |
| Aggregate metrics | Fixed cohort + metric + algorithm version + release epoch; private qualified counts, sanitized published projection | Published projection cannot join back to owners; private membership only while raw records live |
| Moderation events | Authorized actor, concrete target, controlled exclusion/restoration/review reason and time | Append-only during retention, bounded/redactable on privacy expiry; no copied narrative; explicit target FKs, not arbitrary dangling IDs |
| Deletion jobs / replay fences | Owner-scoped removal intent, affected references, lifecycle deadlines and minimal completion status | No source content; short-lived, used to deny access and replay deletes after backup restoration |

## Ownership and deletion invariants

1. Verified session determines owner; request owner IDs are rejected. Lookup/query, link, mutate, export and download all recheck ownership and active state. Guest A cannot infer or operate on B's IDs.
2. Every link verifies both endpoints have the same owner within the transaction. Joining through a public catalog never makes a private record public. Parent deletion fences block new child links/uploads.
3. Numeric measurement observations are immutable. A new test gets a new identity; correcting user-selected operator/area requires a new explicitly labelled record or excluding the old one, not rewriting an existing receipt context. The proposed API has no measurement-edit endpoint.
4. A snapshot is an explicit preservation copy, not a backdoor raw-data archive. Natural raw expiry may null a lookup FK but retains a private source reference for display and explicit purge; the snapshot cannot resolve the expired detailed receipt. The summary's trust assessment time and original limitations remain visible.
5. A manual measurement-delete request purges all same-owner snapshots referencing it as well as raw data/contribution. Deleting an incident only removes that incident's snapshots/assets; standalone source measurements persist to their own deadline. All-data deletion covers both.
6. Consent, moderation and deletion state are checked in the same publication transaction/read gate as release eligibility. No background job can resurrect a record or publish using an obsolete contribution revision.
7. Direct Data API/Storage access must enforce equivalent restrictions. RLS must cover exposed raw tables; views/functions/grants and maintenance service-role bypass require explicit review. No permission error may be “fixed” by widening all authenticated users' access.

Index ownership predicates and required join/query paths. No partitioning, spatial index, full-text search or speculative native-device columns are justified. Exact physical schema and SQL await implementation authorization and separate review.
