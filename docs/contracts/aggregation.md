# Aggregation and publication contract — aggregate-0.1

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED; public metrics disabled until F05/CTO release review. Numerical screens are defaults for review, not proof of privacy or statistical validity.

## Three distinct decisions

1. **Private acceptance:** structurally valid owned record may be saved even if client_only. No public implication.
2. **Record qualification:** a specific metric passes consent, method/receipt, context, timing and endpoint checks. It becomes a candidate, not a publishable claim.
3. **Cohort publication:** fixed cohort passes contributor/suppression and approved release reviews. If any prerequisite fails, public statistics are null.

## Record qualification

All must hold at cohort calculation and again at publication/read gate: current contribution=on under applicable notice; active owner; record live/not-deleted; method browser-http-0.1 approved for publication; valid endpoint_matched receipt assessment completed before submit deadline; supported endpoint with healthy server condition; selected Lagos LGA; mobile_data_confirmed=true and vpn=no; no visibility/connection interruption or clock-skew flag; no moderation exclusion; candidate metric completed and not marked duration_too_short/phase_mismatch/endpoint_error. Demo/fixture/imported/native/client_only observations never qualify. Upload never qualifies in this version. An incomplete optional upload alone does not exclude completed eligible latency/download metrics.

The receipt assessment persists with the raw measurement after short-lived ledger expiry; it is a historical assessment, not ongoing revalidation. Qualification cannot recover after raw measurement expiry by reading an incident snapshot. Revisions of methodology require separate series and reviewed compatibility, not averaging across them.

QualityIssue scopes in api-v1.md are authoritative: record-scoped issues exclude all public metrics; phase-scoped issues exclude only that metric. In particular duration_too_short on download does not by itself invalidate completed warmed latency. Endpoint-wide unhealthy state excludes both, even if individual phase samples look plausible.

## Cohort and contributor algorithm

Cohort key = Lagos LGA + selected operator + closed calendar week + method version + endpoint ID + metric(download or latency). Week is Monday00:00 through next Monday00:00 Africa/Lagos, expressed as half-open UTC instants. Use server session started_at, not device/user date. No rolling or user-selected ranges, neighbourhoods, demographic filters, all-operator totals or “overall quality” score.

At the fixed cutoff (week end +48 hours), take candidate records received and consented no later than cutoff. Choose an owner's earliest qualifying server-started record in that week (tie: measurement ID byte order), across all operator/LGA/method/endpoint contexts. That record pins the owner's single permitted context for that week; records in other contexts do not contribute. This deliberate restriction reduces influence and cross-cell linkage; it sacrifices multi-SIM/traveller coverage. Recompute internal memberships after withdrawal, and invalidate every affected context; do not silently move influence into a newly public cell.

Within pinned context, for each metric: per owner/day compute median over qualified records, then per owner/week compute median over their daily medians. Finally compute median/p25/p75 over weekly owner values, giving each owner exactly one value. Quantiles use linear interpolation at index `(n-1)*p` in ascending ordered values (p=0.25,0.5,0.75). Do not pool all individual tests; do not let active owners gain weight by more days/tests. Internal raw_test_count counts the qualifying source tests used for this metric after context selection, not excluded duplicate submissions. contributing_owner_count counts distinct owner IDs with an eligible weekly metric, not sessions/devices/people. An owner may contribute one value for each metric within the same pinned context.

Proposed cohort floor: at least10 owners for the metric, observations on at least3 distinct days, and no more than50% of contributing owners whose first qualified observation falls on the same calendar day. This is a temporal-concentration screen, not a proof that owners are independent. Threshold boundary tests use >=10 and <=50% exactly. Daily coverage and concentration checks are internal; exposing granular counts is unnecessary.

## Release and suppression

Required release gates: accepted/calibrated method, server capacity review, documented abuse review, privacy/differencing review, validated exclusion/consent/deletion logic and named accountable reviewer accepting residual Sybil/client-spoof risk. These gates are not satisfied by passing the count floor. If ownership independence cannot be assessed proportionately, the product must say insufficient publishable data and omit metrics, rather than add fingerprinting or claim verification.

One scheduled publication per closed week, after the48-hour cutoff and review. No continuous provisional series. Publish median/p25/p75 rounded to one decimal in their stated units. Show count bands for raw tests and contributing owners: `10–19`, `20–49`, `50–99`, `100+`; no exact count for public cohorts. Test counts cannot be less than owner counts; below10 never publishes. Publish observation_cutoff, actual published_at, expires_at=week_end+60 days, method/endpoint, quality=screened_voluntary_sample and required caveats. After expiry return unavailable, even if a private evidence snapshot remains. Raw samples last90 days; the60-day public horizon allows affected cohorts to be recomputed/withdrawn while source data exists. No unbacked long-lived public aggregate archive is introduced.

Public unavailable state is identical for no data, insufficient thresholds, withdrawal/deletion, suspected abuse, unknown health or unpublished review. Do not expose counts, reasons, owner IDs or timing clues beyond the fixed cohort query. Do not release totals/differences that reconstruct suppressed cohorts. No API pagination over source records. Operator comparison requires both cells published for the same area/week/method/endpoint/metric; the UI may show individual available values with caveats but must not infer that an unavailable operator is worse.

Withdraw/delete/late correction after release invalidates the affected public cell(s) immediately at the read gate. Do not replace a published cell with a subtly changed numerical version in aggregate-0.1; suppress it for the rest of its horizon. Internal recomputation is permitted for verification only. This trades availability for lower differencing risk. Fixed schedules, bands and suppression are mitigations, not differential privacy; previous screenshots and suppression timing remain residual risks. CDN/public caching is disabled initially so invalidation does not depend on remote purge success. Browser/user copies cannot be recalled.

## Claims and bias

Use “voluntary browser tests by pseudonymous contributors” and “selected operator/LGA; client-observed timing”. Never say independently verified people, one device per contributor, representative Nigerian subscribers, NCC-verified, proven outage, fraud, tower fault or best/worst network. Guest creation is cheap, refresh sessions do not equal owners, shared devices exist, and carrier NAT groups unrelated users. Rate limiting, session age, burst review and CAPTCHA can only change attack cost. Any new collection for abuse prevention needs privacy approval.

Opt-in sampling overrepresents people who choose to test, compatible devices, connectivity sufficient to submit, and certain locations/times. A download failure can prevent reporting entirely. This baseline therefore publishes no population failure rate or outage incidence. Medians/IQR describe the observed owner-weighted sample, not confidence intervals. No synthetic confidence percentage or opaque score. Trends remain within compatible method/endpoint cohorts and the publication horizon; absence is not improvement or decline.

## Required later verification examples

9 eligible owners→unavailable; 10 eligible owners across 3 days with concentration<=50% and all review gates satisfied→potentially publishable; 10,000 repeats from one owner→one value and unavailable; ten owners created by one attacker→may pass mechanical gates, still no independent-person claim;100 records from owner A plus 1 from B→equal owner weights; same owner across two LGAs→earliest context only; withdrawn record cannot persist through a stale release job; retained snapshot after raw expiry contributes nothing; private suppressed counts never appear in API; old method and new method never pool.

No application/statistical tests ran in this documentation mission. Independent publication review remains a launch gate.
