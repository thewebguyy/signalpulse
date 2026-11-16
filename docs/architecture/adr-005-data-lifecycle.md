# ADR-005 — Consent, retention and private evidence preservation

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED · Owner: Codex.

**CTO direction.** Separate private saving from contribution; support withdrawal/deletion; reconcile 90-day raw measurement retention with longer incident evidence.

**Recommended default.** Every cloud measurement begins private with contribution `off`. Saving, running a test, retaining a summary with an incident and contributing to public aggregates are separate deliberate actions. Contribution is per measurement, no preselected box, account-wide opt-in or silent retroactive bulk contribution. Grant requires the current notice version; withdrawal is always accepted regardless of notice-version changes. Incident narratives/files never become public contributions.

At explicit incident linking, create an immutable minimal evidence snapshot: selected context, numeric summary, method/endpoint, conditions, timestamps, quality/trust labels and limitations. Retain it until that incident expires; it is private and ineligible for aggregation. Delete detailed raw samples and short-lived receipt material on their own schedules. A reference to a deleted raw row is not enough; a bounded summary is necessary for useful long-lived evidence. Display “retained incident summary; raw samples expired” after expiry, never imply that expired underlying detail can be reverified.

An incident expires 12 calendar months after creation in the proposed default. Linking, editing or exporting does not reset its clock. An unlinked raw measurement expires 90 days after server receipt; explicit linking does not extend raw retention. Manual measurement deletion removes all retained snapshots derived from that measurement, with an impact preview; natural raw expiry preserves deliberately retained incident summaries. Deleting an incident removes its snapshots/files but does not implicitly delete standalone measurements. All-data deletion removes both. There is no hidden legal-hold feature or indefinite copy.

Withdrawal immediately excludes the record from future work and suppresses affected public cells before acknowledging. Purge/recompute follows bounded jobs; default suppresses already-published affected cells instead of publishing small revision differences. Private data remains until user deletion/expiry. Deletion/withdrawal cannot retract third-party screenshots or previously downloaded evidence; say so accurately.

**Tradeoff.** Useful private evidence lasts longer than detailed measurement telemetry, with clear source limitations. Consent and deletion require durable bounded audit/cleanup state, not merely changing a checkbox. Numerical durations and service targets are proposals in [privacy matrix](privacy-decision-matrix.md), not implemented policy or legal conclusions.

**Founder pending.** F03: purpose/legal basis, consent, retention/backup/deletion targets and specialist Nigerian review. **Review evidence:** expired raw data with valid private summary, delete across all copies, no aggregation of snapshots, withdrawal during publication, backup restore replay of deletion fences, and no cache resurrection.
