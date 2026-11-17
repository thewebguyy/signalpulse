# SignalPulse NG — Agent Operating Contract

> **Working name:** SignalPulse NG. Name, domain and trademark availability are not yet confirmed.
> **Product status:** CTO002-A local application foundation; synthetic data only.
> **Initial geography:** Lagos State, Nigeria.
> **Canonical purpose:** Build an independent network-experience and consumer-evidence platform. Do not turn it into a generic speed-test clone or an unsubstantiated telco-accusation platform.

This file is the shared operating contract for Codex, Antigravity and any other coding agent working in this repository. Read it before inspecting or changing code. The canonical architecture and interface documents are indexed in [docs/architecture/README.md](docs/architecture/README.md); approval status matters. If relevant conventions conflict, preserve them and raise the conflict rather than silently replacing them.

---

## 0. Verified history, current mission and enduring rules

Audit baseline: 16 November 2026, `main`, commit `5ea102175c76ccf44120a5d45ae78de0fcc83fe2`.
The committed baseline tree contains only this `AGENTS.md`. Prior audit revisions and CTO001-r1's 20 documentation files existed locally as uncommitted work before CTO002-A. They are preserved. CTO002-A adds a Next.js application shell, strict TypeScript contracts, synthetic fixtures, module ports, tooling, tests, environment example and CI definition. It adds no live authentication, database integration, migrations, business API routes, measurement transport or deployment configuration. The developer README is explicitly authorized by CTO002-A. Recheck the actual tree before future work.

Historical authorization: the initial repository audit allowed inspection and instruction/documentation edits only and is complete. It is not a permanent restriction against later explicitly approved work.

Historical authorization: CTO Directive 001 permitted documentation and proposed contract definition only. CTO002-A now authorizes local scaffolding, necessary dependencies, typed unambiguous contracts, synthetic fixtures, tests and developer documentation. It prohibits live authentication, migrations, measurement endpoints, uploads, public aggregation, real data collection, production changes, deployment, commits and pushes. Stop after the foundation and verification deliverables; later product implementation requires a scoped task. A proposed ADR or contract alone is not implementation permission.

Preserve user changes. Follow explicit task authorization; do not repeatedly request approval for work already authorized. Later implementation approval does not implicitly authorize production deployment, production database changes or collection of real user data.

### Permanent precedence and change control

Explicit user/CTO task authorization governs work scope. Product, privacy and safety invariants here remain binding. Accepted ADRs define architecture; approved versioned contracts define interfaces; approved measurement specifications define metric semantics. Drafts cannot override accepted decisions. A newer date is not approval. If accepted artifacts conflict, stop dependent work and coordinate a reviewed resolution, rather than choosing silently. Historical audits are rationale, not alternative contracts.

The CTO provisionally accepted `CTO001-r1`, document/wire version `0.1.0`, as the working baseline in CTO002-A. Original proposed documents remain intact as the historical baseline: see the [canonical index](docs/architecture/README.md), [founder register](docs/architecture/founder-decisions.md) and [review record](docs/architecture/review-record.md). Only the local stack/scaffolding portion of F01 is authorized; provider, financial, privacy, production and measurement decisions remain unresolved. The [foundation record](docs/development/cto002a-foundation.md) and [coverage/gaps](docs/development/contract-coverage.md) record implementation revision `CTO002-A-r1` without changing wire semantics. Preserve one definition per concern. No agent may independently change shared schemas, interfaces, enums, consent/retention behavior or methodology.

## 1. Product thesis

SignalPulse helps Nigerian mobile subscribers:

1. Measure selected aspects of their internet connection under clearly disclosed conditions.
2. Record service incidents in a structured way.
3. Assemble private, timestamped evidence summaries for their own records and provider/NCC escalation.
4. Understand relevant official consumer-protection and NCC compensation information.
5. See carefully qualified, privacy-protected summaries of network experience in an area.

The product must distinguish **what the application measured**, **what a device reported**, **what a user claimed**, **what a user uploaded**, and **what an official source published**. These are not interchangeable forms of evidence.

### Core product promise

Positioning: An independent connectivity intelligence and consumer-protection platform that helps Nigerians measure network performance, document service failures and make better-informed decisions about their mobile networks.

“Measure what can be measured. Document what happened. Understand what to do next.”

Do not claim that SignalPulse proves fraud, theft, deliberate throttling, tower failure, operator liability, or legal entitlement to compensation. The platform is an independent evidence and information tool, not a regulator, telecom operator, legal adviser, or billing-system auditor.

## 2. MVP objective and scope

### The first useful outcome

A Lagos subscriber can complete a controlled connectivity check or record a service incident, receive a clearly labelled private evidence summary, and find relevant official guidance for the next step.

### In-scope for v0.1

- Mobile-first responsive web application / installable PWA where practical.
- Operator selection, initially configurable for MTN, Airtel, Globacom (Glo) and T2mobile.
- Manual location selection using curated Lagos LGAs in the current proposal. Neighbourhoods need a separately reviewed catalog/publication design. Do not require GPS.
- User-initiated connectivity tests for application-level HTTP latency and download throughput. Upload testing may be included only if its data cost, endpoint and methodology are clearly disclosed and capped.
- A clear user confirmation that the device is using mobile data. Browser connection APIs may be used as supplemental hints only; they are not proof of cellular connectivity.
- Structured incident submission for:
  - failed calls;
  - dropped calls;
  - unusable internet;
  - suspicious data depletion, explicitly labelled a user report;
  - failed airtime/data purchases;
  - billing disputes.
- User-supplied incident details, optional attachment, and explicit evidence-source labels.
- Local/offline incident drafts with later sync where practical.
- Private PDF and JSON evidence export. Exports must identify themselves as user-assembled records and must not imply legal admissibility or an official operator finding.
- Evidence Builder includes structured incident summaries, measurement history and editable complaint-description generation using factual templates; an LLM is not required.
- NCC consumer guidance. Investigate a compensation-information lookup driven only by sourced, dated official records reviewed before publication; investigation does not authorize an automated eligibility service.
- Public area-level summaries only when there is enough qualified data and the aggregation/privacy rules are met.
- Network Intelligence includes qualified operator comparisons, time-based trends, sample counts, freshness, measurement provenance and explicit confidence/quality indicators. Do not invent a statistical confidence score.
- Clear empty states when reliable data is not yet available.

### Explicitly out of scope for v0.1

- Native Android application or background measurement service.
- Automatic carrier billing verification or automatic data-theft detection.
- iOS native measurement.
- Automatic call-log or dropped-call monitoring.
- Automatic determination of carrier-billed data usage or data theft.
- Automatic multi-SIM switching or recommendations that imply real-time network superiority.
- Tower-sector diagnosis or claims about a specific cell site.
- Continuous location tracking or background GPS.
- AI anomaly detection, predictive models or LLM-generated accusations.
- Public display of raw incident records, private screenshots, exact coordinates or user identities.
- Class-action, legal-evidence or compensation guarantees.
- Microservices, message brokers, Kubernetes or other infrastructure without demonstrated need.

Do not add an out-of-scope feature because it looks impressive in a demo. Record a proposal and ask for approval first.

## 3. Measurement truth and evidence taxonomy

Every submitted record must have an explicit provenance/source type. Use a controlled enum or equivalent:

- `app_measured`: measured by SignalPulse in a controlled application test.
- `device_observed`: read from a supported device API with its limitations recorded.
- `user_reported`: asserted by the user and not independently verified.
- `user_attached`: a user-provided file or screenshot; the content is not automatically authenticated.
- `official_source`: information published by NCC or another identified authoritative source.

Do not silently promote a user report to a verified measurement. Do not treat a screenshot as proof of the underlying billing ledger. Do not mix test results collected under materially different methodology versions without marking the difference.

### PWA measurement constraints

A browser/PWA cannot reliably access cellular radio signal strength, cell ID, tower-sector identity, carrier billing records, system-wide data usage, or complete call failure telemetry. Do not fabricate or infer these values.

Browser Network Information API fields, where supported, are hints only. Safari and other browsers may not expose the same information. An operator selected by a user is user-supplied unless independently verified by a future supported mechanism.

Use accurate labels:

- Say **HTTP latency** or **application-level request latency**, not ICMP ping, unless actual ICMP is being measured.
- Say **measured download throughput for this test**, not the user's general network speed.
- Do not call a test “mobile-network verified” merely because the user selected an operator or confirmed mobile data.
- Never state a test proves an outage or identifies a faulty tower.

### Measurement methodology requirements

Before shipping the measurement flow, document and version its method. At minimum record:

- method version;
- endpoint/environment identifier and region;
- test start/end times;
- request count and timeout rules;
- bytes actually transferred;
- elapsed duration and throughput calculation;
- HTTP latency calculation and sample count;
- whether upload was run;
- whether Wi-Fi exclusion was technically verified, user-confirmed, or unknown;
- browser/device family and app version only at a coarse, non-identifying level;
- test completion/failure state.

Use a controlled, configurable measurement endpoint. Do not assume that a generic CDN, the app host, Supabase Storage or a third-party speed-test service is a valid measurement endpoint. Evaluate hosting/platform limits and test from Nigerian mobile networks before choosing the production endpoint.

Tests must be user-initiated, bounded and cancellable. Display the expected maximum data consumption before the test. Apply hard request-size, duration and byte limits on both client and server. Do not run repeated/background tests. Make the initial test small and transparent; tune its size only after accuracy and data-cost testing. Never create an unbounded download or upload endpoint.

If test conditions cannot be established, return a limited/qualified result rather than pretending the measurement is comparable.

Use a monotonic clock for durations and separately record user-device observation time and server receipt time. Store metrics in explicit units (bytes, milliseconds, decimal Mbps). A missing, unsupported, cancelled or failed metric is not zero. Preserve failure reasons and exclude invalid results from throughput summaries without erasing failure counts.

Disable intermediary compression and caching on measurement payloads; exclude measurement routes from service-worker caches. Count received bytes rather than trusting Content-Length. Upload throughput must be based on completed server receipt, not the time taken to queue a browser request. Document connection warm-up, concurrency, transfer phases and visibility/interruption handling. Disclose that protocol overhead can make carrier-billed consumption exceed application payload bytes.

Treat browser submissions as untrusted. A signed session or server receipt can corroborate endpoint activity but cannot certify operator, location, cellular access or an untampered device. Endpoint byte/time quotas, token expiry, replay protection and capacity monitoring must work independently of client checks. A failure to reach the endpoint may be an endpoint or internet-path failure, not an operator outage.

The proposed [method](docs/measurement/browser-http-v0.1.md) and [receipt contract](docs/measurement/receipt-v0.1.md) distinguish server bytes written from browser bytes received, and browser timing from server timing. `endpoint_matched` is not a verified-speed badge. Structurally valid client-only results can be private evidence but cannot qualify for public metrics. Public numerical release remains gated even when receipts match.

## 4. Location and privacy rules

Privacy is a product requirement, not a later enhancement.

- Prefer manual LGA selection for v0.1; curated neighbourhoods need reliable definitions and adequate cohorts. GPS is not required.
- Explicitly consented location is allowed by product scope, but adding it requires an approved precision, purpose and deletion design. Request it only after a clear user action, explain the purpose, and offer a manual alternative. Prefer deriving an area and discarding coordinates without persistence.
- Never collect continuous or background location.
- Never publish raw or precise coordinates. Public outputs must be area-level aggregates.
- Do not collect IMEI, IMSI, MSISDN/phone number, SIM serial number, contacts, advertising ID, or hardware fingerprint for measurement or deduplication.
- Do not expose private incident text or attachments publicly.
- Do not make screenshots public by default. Warn users to remove or crop personal information before upload.
- Use data minimisation, purpose limitation, retention limits, secure access controls and deletion procedures.
- Treat pseudonymous identifiers as potentially personal data. Do not describe hashing or pseudonymisation as anonymisation.
- Do not implement tracking-based “unique user” claims. Any contributor deduplication strategy must be documented, proportionate, disclosed and reviewed before public aggregation.
- Public summaries must suppress sparse cohorts. The proposed floor of 10 distinct pseudonymous owners is only one screen in [aggregation](docs/contracts/aggregation.md), not proof of 10 independent people, anonymity or representativeness. All publication gates must pass; no agent may weaken them to populate a dashboard.
- Never show a neighbourhood/operator/time result if the cohort is too small or could expose an individual.
- Avoid collecting exact residential addresses. The MVP does not need street-level public mapping.
- Complete a data-protection/privacy assessment, including DPIA applicability, with qualified Nigerian advice before systematic public collection or high-risk processing.

### Security baseline

- Never commit secrets, service-role keys, private keys, credentials or real user data.
- If Supabase is adopted, keep secret/service-role credentials server-side only; use equivalent controls for any other approved backend.
- Apply least privilege and Row Level Security (RLS) to user-accessible tables.
- Public clients must not be able to read raw private incidents or evidence assets.
- Validate and constrain all input server-side (for example with the project's existing schema validator or Zod if appropriate).
- Rate-limit public submission and test endpoints. Add upload size/type limits and private storage policies.
- Default proposed attachment transport is owner-authorized application proxy access. If a later approved design needs signed URLs, make them short-lived and review bearer/revocation risks first.
- Avoid logging precise locations, incident narratives, access tokens or uploaded contents.
- Document retention and deletion behaviour; do not keep data indefinitely by default.

### Ownership, uploads and local data

- Anonymous participation must still have a secure private ownership mechanism. Pseudonymous guest sessions are not verified unique people. Explain recovery limits before cloud saving and support export/deletion while the session is available.
- Check ownership on every object read, mutation, link and export; never trust an owner ID supplied by the client. Test guest A, guest B, signed-out access and privileged maintenance separately.
- If Supabase is adopted, anonymous sign-ins use the `authenticated` database role. Role membership alone is not ownership. Explicit grants and RLS must both be reviewed. Do not use user-editable metadata for authorization. Review views, functions and privileged server paths for RLS bypass.
- Quarantine uploads privately. Validate extension, MIME signature, actual size, image dimensions and parser limits server-side; allowlist supported formats. Do not render HTML/SVG or active documents. Scan files before release and reject or keep quarantined when validation cannot complete. Use generated object names, no overwrite, ownership-bound upload authorization and orphan cleanup.
- Warn about third-party personal information; provide a redaction/preview step. Disclose metadata stripping or other transformations; record original-versus-derived provenance privately. A checksum establishes byte identity, not truth or authenticity.
- Signed URLs are bearer capabilities: keep them short-lived, never log them, and never publish them. Apply attachment download headers and private/no-store caching. No remote URL import or unrestricted PDF renderer network access.
- Offline drafts belong in a versioned local store only after disclosure. Provide clear/delete controls and quota/error handling. Do not claim protection against another person using the same browser. Never cache private API responses, attachments, exports or authenticated pages in a shared service-worker cache.
- Define retention separately for drafts, incident text, measurement records, attachments, quarantine/orphans, abuse logs, exports and backups. Document deletion propagation to storage and aggregate recomputation; approve durations before real data collection.
- Keep raw IP addresses and detailed user-agent strings out of domain records. Any short-lived abuse identifiers or infrastructure logs need a separate purpose, access policy and expiry. IP-based controls alone unfairly group users behind carrier NAT.

Private saving, optional aggregate contribution and deliberate incident-summary preservation are separate actions. Contribution defaults off, requires an explicit per-record grant and supports withdrawal without deleting private evidence. No narrative or attachment becomes public through this control. Withdrawal must fence affected public output before acknowledgement.

Use the [privacy decision matrix](docs/architecture/privacy-decision-matrix.md) for proposed retention values and [evidence lifecycle](docs/contracts/evidence-lifecycle.md) for behavior. Do not keep raw measurements indefinitely to preserve a complaint: retain only an explicitly requested, bounded private summary with the incident. Natural raw expiry can preserve that summary; explicit measurement deletion removes all copies. Summaries never qualify for aggregation. These proposals require approval before implementation or user promises.

## 5. NCC / official-source information

The NCC compensation framework and complaint-escalation process may be useful product features, but the application must not invent current rules or infer individual eligibility.

For every imported official record, preserve:

- publisher/source name;
- canonical source URL or source-document reference;
- publication/effective period where available;
- date retrieved/imported;
- the specific operator, geography and assessment period covered;
- dataset/version or file hash where practical;
- review status.

Only publish records that have been checked against an authoritative NCC source. Show the relevant period and last-checked date in the UI. Explain that a lookup is informational, that the official criteria govern, and that the app cannot guarantee compensation. Do not create a live NCC integration unless an actual supported public API exists and has been verified.

Complaint guidance should explain the user's next steps and identify the official channels, but must not submit complaints or claim to act as the regulator on the user's behalf in v0.1.

Use states such as reviewed match, no reviewed match, stale source and unavailable source. Absence from imported records does not prove ineligibility. A matching area/operator/period does not prove personal entitlement. Preserve source corrections and superseded versions; never silently replace a reviewed record. Verify official complaint channels when guidance is published or reviewed, not from model memory.

## 6. Public analytics and anti-misrepresentation

- The current proposal allows only qualified, consented `app_measured` download/latency data into public metrics, subject to all release gates. User-reported incident statistics, upload comparisons and native measurements require a separate reviewed methodology; never blend sources.
- Display sample count, observation window, geography, measurement version, freshness and major limitations with each chart/summary.
- Prefer medians and distributions over averages alone; show percentiles where sample size supports them.
- Do not rank operators using an opaque single score in v0.1.
- Do not claim “best network” or “worst network” without a transparent, adequately sampled and comparable methodology.
- Do not diagnose tower congestion, deliberate throttling, billing fraud or operator fault from correlation alone.
- Do not create fabricated/demo data that can be mistaken for real submissions. If seed/demo data is required during development, mark it conspicuously as `demo`, exclude it from production aggregation, and never mix it with live observations.
- Provide an explicit empty/insufficient-data state. No data is better than misleading data.
- Keep raw user reports private. Build spam/abuse controls and a moderation/audit trail before releasing any derived public statistics.
- Start with fixed geography/time cohorts; suppress sparse cells and complementary totals or overlapping filters that could reconstruct them. Repeated tests from one guest session must not dominate a cohort. The threshold of 10 is a proposal, not proof of anonymity or representativeness; publish nothing until the cohort and abuse design is approved.
- Compare like-for-like methodology, endpoint, period and disclosed conditions. Show sampling bias and distribution limitations. Do not pool browser and future native measurements without a reviewed comparability study. A confidence indicator must describe its actual basis, not imply a representative population survey.

## 7. Technical direction

CTO002-A installs Next.js, React, strict TypeScript and Tailwind for a local synthetic foundation. Remaining technology choices below are proposed integrations, not installed services:

- Next.js + React + TypeScript for the web application.
- Supabase PostgreSQL for persistence and authentication only where needed.
- Defer PostGIS while curated area IDs and ordinary relational queries meet the MVP. Reconsider only for an approved spatial-query requirement.
- Supabase Storage for private evidence attachments, with explicit access policies.
- IndexedDB for local drafts/offline queue where appropriate.
- Prefer accessible area lists/tables initially. Defer Leaflet and MapLibre until a map solves a demonstrated task and boundary data, licensing, tile privacy and mobile performance are reviewed.
- A controlled measurement endpoint separated/configured independently from the ordinary app UI where practical.

Do not introduce FastAPI plus Node, a second backend framework, or multiple databases without a written reason and approval. Reuse established repository conventions and dependencies. Do not replace a working package manager, framework, test runner, lint setup or deployment configuration just to match this document.

### Architecture principles

- Keep the v0.1 architecture modular but simple: application, data access, measurement service, incident/evidence services.
- Keep client/server boundaries explicit. Secrets and privileged operations remain server-side.
- Use versioned database migrations. Never edit an already-applied migration to change production history; add a new migration.
- Design APIs from explicit contracts and validate payloads.
- Make ingestion idempotent where practical and protect against duplicate submissions.
- Keep measurement methodology versioned independently from UI versions.
- Use UTC timestamps in storage and render local time clearly in the UI.
- Avoid premature abstractions, generic plugin frameworks and speculative multi-city architecture.

### Coding and repository conventions

Use Node.js `26.12.1`, npm `11.20.0` and the single `package-lock.json`. Run `npm ci`, then `npm run check` (typecheck, lint, tests, boundaries, CI validation, build and bundle check). See README for local development. TypeScript is strict; Zod schemas supply runtime parsing and inferred DTO types. Requests reject undeclared fields; response parsers ignore additive fields but reject unknown enums. Validation alone does not establish ownership, receipt authenticity or publication eligibility. Tool changes require evidence of compatibility; do not force peer dependency resolution. No formatter is separately mandated.

Prefer small feature modules with separate domain rules, transport, persistence and UI. Do not expose database rows as accidental API contracts. Use bounded pagination, explicit nullability/units and stable error codes. Keep sensitive server modules out of client bundles. Store instants in UTC and label displayed times with Africa/Lagos or the selected timezone. Keep fixtures synthetic and clearly separated from production data. Avoid new dependencies unless an approved requirement justifies them.

## 8. Product language and UX

Tone: clear, calm, credible, Nigerian-context-aware and non-inflammatory.

Use language such as:
- “Your reported experience”
- “Measured during this test”
- “We could not independently verify this incident”
- “Insufficient observations to draw a reliable conclusion”
- “This may help you document your complaint”

Avoid language such as:
- “Your network stole your data”
- “Telco fraud detected”
- “This tower is defective”
- “You are guaranteed compensation”
- “NCC-verified” unless there is an explicit, documented NCC verification relationship.

Never use fear-based UI, fake urgency, fabricated ratings, fake activity counters or unqualified operator rankings.

## 9. Engineering workflow and agent responsibilities

### Before making changes

1. Read this file and the repository README, package manifest, environment example, migrations, tests and deployment configuration.
2. Map the existing architecture and identify what is already implemented.
3. Check the working tree before editing. Never overwrite or discard user changes.
4. For significant new work, provide a concise implementation plan, file-level change list, assumptions, data/security implications and acceptance criteria. Obtain approval for unapproved scope; proceed within an already approved task without repeatedly asking. CTO002-A authorizes the local foundation only; dependent live capabilities remain gated.
5. Small, reversible fixes explicitly requested by the user may be implemented directly, but must remain in scope and be tested.

### Shared-contract rule

Codex owns backend contracts and integration coordination unless the user assigns otherwise. Antigravity owns frontend implementation and must review contract usability before frontend execution. Ownership is stewardship, not unilateral authority. Before parallel work, agree and share the same approved revision of:

- API request/response schemas;
- database table/column contract;
- enum values;
- error response shape;
- authentication/anonymous submission approach;
- location granularity;
- measurement payload/methodology version.

Neither agent may independently invent or change these contracts. Any contract change must be documented and communicated before the other agent continues.

Canonical proposed artifacts now exist in `docs/architecture/`, `docs/contracts/` and `docs/measurement/`. Drafts must say proposed; record approval status and revision. Contract changes require a rationale, affected producers/consumers, compatibility plan, acceptance examples and security review evidence. Codex coordinates review; use DeepSeek V4 Pro for specialist work only when actually available, otherwise record that it did not run and keep required independent review pending. Founder approval is needed when scope, privacy, cost or public claims change. Antigravity acknowledges affected interfaces and usability before dependent frontend execution.

Use one writer per contract or migration file. For authorized parallel work, use isolated branches/worktrees and declare file ownership. Handoffs name baseline commit, contract/method versions, owned files, acceptance criteria, test commands/results and unresolved issues. Mocks must derive from the shared contract. Stop dependent work when a contract is missing or contradictory; do not guess it. Sharing a draft never authorizes a commit or push.

For this foundation, use the [Antigravity handoff](docs/development/antigravity-handoff.md): Codex owns contracts, modules, server/config, fixtures, tests/tooling and CI. Antigravity owns subsequent feature UI after contract usability review. App routes/layout/styles and reusable UI components transfer through the documented sequential procedure; no simultaneous edits to shared files. Never import server/config/fixture modules into client components; pass explicitly labelled synthetic props from the server composition root.

### Codex default responsibilities

- Repository/architecture audit and implementation plans.
- Database schema, migrations, RLS and backend services/routes.
- Validation, rate limits, evidence generation, source provenance and backend tests.
- Integration review, security review and regression verification.

### Antigravity default responsibilities

- Responsive, accessible, mobile-first UI and PWA behaviour.
- Network check, incident journal, evidence views, NCC information pages and aggregate dashboard/map UI.
- IndexedDB/offline draft experience and browser-side measurement flow.
- Frontend tests and browser/device verification.

Antigravity must not implement a competing database schema or bypass the approved API contracts. Codex must not rewrite the UI or change design direction without approval.

## 10. Definition of done

A feature is not complete merely because it renders or compiles.

For every changed feature:

- Its acceptance criteria are met.
- Relevant tests are added/updated and pass.
- Type checking, linting and production build pass where supported.
- Loading, empty, error, offline and success states are handled.
- Inputs are validated on the server, not only in the UI.
- Privacy, access-control and abuse implications are reviewed.
- No secrets or personal data are committed.
- No demo data is represented as real.
- Measurement limitations are visible to users where relevant.
- Existing production behaviour has not been broken.
- The agent reports exact files changed, commands run, test results, known limitations and anything requiring human approval.

Required regression coverage, when the relevant implementation exists: cross-owner access and object linking; raw/private-data exposure through APIs, storage, views and caches; upload spoofing/oversize/malware paths; ingestion idempotency and replay; measurement units, byte caps, cancellation and endpoint failure; offline retries and storage failure; PDF/JSON parity and escaping; source freshness; sparse-cohort suppression and deletion propagation. Use local/synthetic data. Load tests, metered mobile tests, external scans and production actions require a specifically approved target and budget. Documentation-only changes need diff/content checks, not invented application tests.

Security-critical changes require recorded review evidence before integration: exact revision/files reviewed, reviewer/model actually used, threat scenarios and negative tests, command/output evidence, findings/disposition and residual risks. Author self-review is not independent approval. Unavailable specialist tools are reported honestly; do not bypass a launch gate or claim model review from a model catalog entry. Include revoked-session denial, contribution withdrawal/publication races, retained-summary deletion, receipt forgery and direct API/storage bypass in the relevant reviews.

If a check cannot be run, say so plainly. Never claim a test passed if it was not run.

## 11. Delivery sequencing

Follow the [revised roadmap](docs/architecture/implementation-roadmap.md) after authorization. The first useful implementation milestone is:

1. User drafts a structured incident with selected operator and optional LGA.
2. User explicitly accepts guest-session limitations and saves privately with correct ownership and provenance.
3. User reviews/edits owned history and exports a factual text-only JSON/PDF summary and complaint description.
4. Validate this slice before secure attachment uploads. Measurements are also not a dependency of the first text-only export.
5. Add bounded measurements, private summary linkage/retention and then secure optional attachments in separately verifiable phases.
6. Public metrics remain disabled or show an honest unavailable state until consent, calibration, privacy and publication gates pass.
7. Add sourced guidance and any separately approved NCC lookup without promising an outcome.

No milestone definition authorizes implementation; later tasks must state the approved phase and contract revisions.

## 12. Model-aware execution

These are user-assigned routing roles, not claims about available provider model IDs. Verify the configured model before use; never claim an unavailable model ran a review.

| Actor/model | Responsibility | Boundary |
| --- | --- | --- |
| Codex | Audit, contract coordination, backend/data implementation after approval, integration and regression evidence | Cannot unilaterally approve architecture, contract changes or production actions |
| DeepSeek V4 Pro | Architecture, complex decisions, privacy/security review, database design, critical debugging and integration review | Review against repository evidence and current primary documentation; publish rationale and unresolved risks |
| DeepSeek Flash | Routine implementation, isolated components, tests, documentation and small refactors | Work only from an approved bounded task and contract; escalate schema/auth/security/methodology ambiguity to Pro/Codex |
| Antigravity | Frontend, accessibility, interaction design, PWA, offline drafts and browser measurement implementation | Consume shared contracts; cannot invent schema, change methodology or bypass server access controls |

Models are execution/review resources within the agent workflow, not separate sources of truth. Give Flash explicit input/output examples, allowed files and acceptance criteria. Break large tasks into reviewable slices. Require Pro/Codex review for security boundaries and complex work; passing generated tests is not independent proof of correctness. Never send private evidence, personal data or secrets to a model service without an approved data-processing purpose and arrangement. Do not add runtime AI features merely because engineering uses AI models.

## 13. Deployment and production safety

No deployment target is currently configured. After approval, separate development, staging and production credentials/data; previews must not connect to production by default. Use synthetic fixtures in previews. Record environment variables by purpose, client/server exposure and required/optional status without real secret values.

Use reviewed, versioned migrations only after schema approval. Never rewrite applied migration history or mutate production through ad hoc agent commands. Before a production change require the authorized target, tested release artifact, access-policy review, migration compatibility/rollback or recovery plan, backup/restore evidence, monitoring and an accountable operator. Do not imply that an application rollback reverses destructive data changes.

Private pages, APIs, uploads and exports must not enter CDN/shared caches. Restrict administrative tools, review secret exposure in bundles and logs, and scope credentials to their task. Document incident response, deletion handling, endpoint cost limits and a measurement kill switch before public collection. Never deploy, commit, push or alter hosted services solely because a build passes.
