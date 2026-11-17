# Privacy, ownership and retention decision matrix

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED. F02/F03/F05/F06 approval pending. These are product/engineering proposals, not legal advice or deployed settings. A qualified Nigerian adviser must review purpose/legal basis, consent, notices, DPIA applicability, minors, transfers, processor terms, rights and incident response using the NDP Act/current GAID. [NDPC GAID](https://ndpc.gov.ng/wp-content/uploads/2025/03/NDP-ACT-GAID-2025-MARCH-20TH.pdf).

## Purpose and user-control decisions

| Operation/data | Proposed minimum and user action | Control/ownership | Pending decision |
| --- | --- | --- | --- |
| Local drafting | Text, selected operator, optional LGA/time; user saves locally | No cloud owner required; clear/export local draft | F03 local/shared-device notice |
| Private cloud incident | Explicit save; no automatic contribution checkbox | Guest owner; narrative/ticket private | F02 loss/recovery; F03 basis/notice |
| Network test | Explicit metered confirmation; no precise coordinates; endpoint necessarily handles connection metadata | Owner-bound short-lived session; no indefinite IP/domain storage | F04 costs/method; F03 operational logs |
| Private measurement save | Explicit save separately from test; summaries/detail private | Owner; receipt trust labels; creation does not grant contribution | F03 purpose/retention |
| Preserve incident summary | Explicit confirm_private_retention with shown deadline | Same-owner snapshot; no public reuse | F03 longer private evidence retention |
| Optional public contribution | Deliberate per-record grant, not bundled/preselected; current notice | Only qualifying metric data; no incident narrative/assets/owner IDs public | F05 release policy; F03 legal basis and withdrawal wording |
| Withdrawal | Any time while authenticated; no new notice acceptance needed | Immediate exclusion/read fence; private data preserved | F03 targets/notice |
| Individual/all-data deletion | Explicit action and impact preview; no forced contribution loss-only substitute | Same-owner, or proportionate specialist-reviewed support process if session lost | F03 rights/support/backup bounds |
| Attachments | Later optional upload after redaction notice | Private quarantine→clean; never contribution | F06 scanning/cost; F03 third-party personal information |
| Official information | Reviewed public institutional source only | Reviewers authorized; no eligibility inference or subscriber matching | F07 editorial ownership |

No GPS in this contract version. The original product scope permits future explicit location consent, but consent alone does not justify precision/storage. No MSISDN/IMEI/IMSI/SIM/ad ID/fingerprint/contact list. Browser permission, privacy notice and legal basis are separate matters. An owner UUID or hashed IP remains potentially personal, not automatically anonymous.

## Proposed duration and propagation rules — single source of numerical policy

Durations run from the stated trigger, in UTC; calendar months use the same day/time where possible and the last valid day otherwise. No silent sliding renewal by export/edit/linking. Purge targets are operating objectives requiring proven capacity before being promised to users.

| Data class | Proposed active retention / trigger | Expiry, withdrawal and deletion behavior |
| --- | --- | --- |
| Local text drafts |30 days after last deliberate edit; warn before expiry when app runs | Purge on next app execution if expired; cannot promise timed deletion while browser is closed. No auto-cloud sync after expiry. |
| Cloud incidents |12 calendar months after server creation | Edits do not extend; removal includes assets/snapshots; explicit delete sooner |
| Detailed measurements and private standalone summaries |90 days after server receipt | Natural expiry removes raw details and standalone record; linked snapshot exception below only; removes candidate contribution |
| Explicit incident-linked measurement snapshots |Until parent incident's existing expiry | No raw sample arrays/receipt tokens; not publicly eligible; explicit source-measurement delete removes all copies even before parent expiry |
| Clean attachments |Until parent incident's existing expiry | Delete originals/derived files and metadata; deletion fence immediately, purge target 24 hours |
| Reserved/partial/orphan uploads |24 hours after reservation | Inaccessible until complete/clean; clean up regardless of abandoned session |
| Rejected/quarantined files |At most7 days after upload; normally delete rejected sooner | Never downloadable; scan failures never extend indefinitely; explicit delete sooner |
| Measurement phase/session ledger and full receipts |24 hours after finalization or unused expiry | submit window10 minutes after finalization; no new trusted ingest after it. Consumed-ID fence may remain with raw record/replay horizon; no bearer secrets retained in summaries |
| Phase capabilities |Start by60 seconds; active deadline30 seconds after start | Single-use; bounded plan; reject expired/reused requests; remove token digests with ledger |
| Application access-token policy |Proposed provider access TTL 15 minutes; application guest idle horizon 30 days since last validated activity | Refresh server-side only; revoke/fence immediately on logout/delete. Verify provider capabilities/plan and implement server idle check before promising it; do not confuse record retention with access recoverability |
| Empty/orphan guest identities |24 hours if creation never produced domain records; otherwise30 days after last owned record expires/is removed | Delete unused identities and credentials; live records still obey their own expiry; no attempt to identify a person |
| Idempotency response/digest |24 hours after terminal mutation | Replays recheck access; store resource reference, not sensitive response bodies |
| Deleted client_record_id/consumed receipt replay fences |Remaining30-day offline replay horizon after deletion (up to30 days) | Minimal owner-bound keyed digest; no content; account deletion blocks owner entirely |
| Contribution history |While raw record exists, then30 days of minimal withdrawal/compliance metadata | No public owner ledger; all-data deletion minimizes to allowed finite fences; exact lawful-basis review required |
| Minimal deletion/withdrawal restore fences |32 days after accepted deletion/withdrawal | Enough for proposed31-day backup expiry plus restore margin; keyed references, no content; restore must honor fences before serving |
| Security/abuse operational logs |At most7 days from event | No narratives/precise location/tokens/body content; raw IP avoided where feasible; short-lived controls disclosed; carrier NAT considered |
| Private moderation details |Until related raw record expiry, plus 30 days of minimized action codes if needed for review | No duplicated narrative; personal references severed on purge; append-only during its life is not forever |
| Generated exports |Response lifetime only; temporary buffers removed at completion/error, hard timeout5 minutes | No persistent server copy/share link; downloaded user copies cannot be revoked |
| Public aggregate values and private cohort membership |Public expires week_end+60 days; membership no longer than source raw retention | Current proposal suppresses on withdrawal/deletion, no incremental re-release; no permanent public metric archive |
| Backups containing private records |Maximum31 days after a copy is taken | Provider contract/config must support bound; unavailable if not verified. Restricted restore only; replay fences first. Do not promise immediate selective backup erasure |
| Official-source revision records |Retain while relevant and for correction history; public nonpersonal source facts | Separate from user evidence; reviewer identity follows staff/audit access policy, not exposed to public |

## Consistency examples

Day 0 measurement saved → raw expiry day 90. Day 30 user links it to an incident created day 30 → minimal snapshot lasts to incident creation+12 months, not indefinitely. Day 90 raw detail disappears; snapshot says raw_expired. It is never a new aggregate input. If user explicitly deletes the measurement on day 60, both raw record and every retained snapshot are removed; the UI must explain this before sending the request. Deleting only one incident preserves unrelated standalone measurements. Exporting on day 89 extends nothing.

Withdrawing contribution does not delete the private record or snapshot. Existing affected public cells are immediately suppressed; queued recalculation cannot override newer consent state. Regranting after a closed cohort's cutoff does not republish it. All-data deletion also fences old tokens, removes pending uploads and prevents offline resurrection.

Immediate means the logical authorization/public-read fence is in place before success acknowledgement. Primary physical purge target:24 hours from accepted user deletion. Candidate/job cleanup after withdrawal target:24 hours, with no serving during delay. Backup expiry follows31-day bound. Missed targets create attention_required and operator alert, never a false complete status. All numerical targets remain proposed until tested and approved.

## Unresolved specialist and operating risks

Lost guest access prevents self-serve rights requests; recovery by weak identifiers would be worse. Support needs an authenticated/proportionate verification procedure and a documented no-disclosure fallback. Cross-border region/provider agreements, minors policy, lawful basis for contribution and security logging, breach notification duties and registration obligations need specialist judgment. Consent records do not automatically settle legal compliance. No real users or data may be collected before these gates are resolved.
