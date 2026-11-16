# ADR-006 — Public aggregation and eligibility

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED · Owner: Codex.

**CTO direction.** Define cohorts, contributor influence limits, Sybil risk, suppression and sampling limitations without representing guest IDs as independent people.

**Recommended default.** Public results remain disabled until a separately accepted publication review. Candidate cohorts are LGA/operator/closed Lagos calendar week/method/endpoint/metric. No neighbourhoods, rolling windows, demographic slices, arbitrary filters, incident-derived rates or overall operator scores. A private measurement can pass record qualification without meeting cohort publication eligibility.

One owner contributes at most one chosen LGA/operator cohort per week and at most one owner-level value per metric in that cohort. Compute daily medians then the weekly median for that owner, then the cohort distribution over owner values. This removes extra weight from repeated tests or active days. Exact deterministic selection and thresholds are in [aggregation](../contracts/aggregation.md).

Propose at least 10 distinct pseudonymous owners spanning at least three days, plus server receipt/method/consent checks and reviewed abuse/capacity evidence. These are pragmatic screens, not statistical independence, representative sampling or formal anonymity. A person can create many owners; one owner may represent multiple people. Without a defensible residual-risk decision, publish no metrics, regardless of count. Rate limits and CAPTCHA, if adopted after privacy review, raise abuse cost but do not establish one-person-one-owner.

Publish medians/interquartile range with count bands, method, endpoint, period and limitations. A quality label reports checks and data freshness, not confidence that an operator caused an experience. No confidence interval without a justified sampling design. Comparisons require matching cohorts and all compared cells eligible. Mask internal suppression reasons and counts in public responses.

One scheduled release per closed week; no incremental counts/live updates. Changes requiring removal suppress affected cells rather than issuing fine-grained revisions. No totals that reveal suppressed complements. Numeric historical publication has a finite horizon so expired raw data does not leave unverifiable public statistics. Residual leakage from prior public copies and suppression timing remains a documented limitation, not solved by k-thresholds.

**Founder pending.** F05: publication threshold, bands, horizon, acceptable residual risk and accountable reviewer. **Review evidence:** contributor-weight fixtures, repeated-owner/Sybil simulations, withdrawal/deletion races, complementary/differencing attacks, method separation and public response field allowlists. Statistical/publication review must be independent before launch.
