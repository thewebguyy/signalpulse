# SignalPulse NG — Agent Operating Contract

> **Working name:** SignalPulse NG. Name, domain and trademark availability are not yet confirmed.
> **Product status:** Pre-build / MVP definition.
> **Initial geography:** Lagos State, Nigeria.
> **Canonical purpose:** Build an independent network-experience and consumer-evidence platform. Do not turn it into a generic speed-test clone or an unsubstantiated telco-accusation platform.

This file is the shared source of truth for Codex, Antigravity and any other coding agent working in this repository. Read it before inspecting or changing code. If the repository already contains stronger, relevant conventions, preserve them and raise conflicts rather than silently replacing them.

---

## 1. Product thesis

SignalPulse helps Nigerian mobile subscribers:

1. Measure selected aspects of their internet connection under clearly disclosed conditions.
2. Record service incidents in a structured way.
3. assemble private, timestamped evidence summaries for their own records and provider/NCC escalation.
4. Understand relevant official consumer-protection and NCC compensation information.
5. See carefully qualified, privacy-protected summaries of network experience in an area.

The product must distinguish **what the application measured**, **what a device reported**, **what a user claimed**, **what a user uploaded**, and **what an official source published**. These are not interchangeable forms of evidence.

### Core product promise

“Measure what can be measured. Document what happened. Understand what to do next.”

Do not claim that SignalPulse proves fraud, theft, deliberate throttling, tower failure, operator liability, or legal entitlement to compensation. The platform is an independent evidence and information tool, not a regulator, telecom operator, legal adviser, or billing-system auditor.

## 2. MVP objective and scope

### The first useful outcome

A Lagos subscriber can complete a controlled connectivity check or record a service incident, receive a clearly labelled private evidence summary, and find relevant official guidance for the next step.

### In-scope for v0.1

- Mobile-first responsive web application / installable PWA where practical.
- Operator selection, initially configurable for MTN, Airtel, Globacom (Glo) and T2mobile.
- Manual location selection using Lagos State, LGA and a curated neighbourhood list. Do not require GPS.
- User-initiated connectivity tests for application-level HTTP latency and download throughput. Upload testing may be included only if its data cost, endpoint and methodology are clearly disclosed and capped.
- A clear user confirmation that the device is using mobile data. Browser connection APIs may be used as supplemental hints only; they are not proof of cellular connectivity.
- Structured incident submission for:
  - slow or unusable data;
  - no service / loss of connectivity;
  - failed or dropped calls;
  - suspected data-bundle depletion discrepancy;
  - failed airtime or data purchase;
  - billing dispute;
  - other network/service issue.
- User-supplied incident details, optional attachment, and explicit evidence-source labels.
- Local/offline incident drafts with later sync where practical.
- Private PDF and JSON evidence export. Exports must identify themselves as user-assembled records and must not imply legal admissibility or an official operator finding.
- NCC consumer guidance and a compensation-information lookup driven only by sourced, dated official records that have been reviewed before publication.
- Public area-level summaries only when there is enough qualified data and the aggregation/privacy rules are met.
- Clear empty states when reliable data is not yet available.

### Explicitly out of scope for v0.1

- Native Android application or background measurement service.
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

## 4. Location and privacy rules

Privacy is a product requirement, not a later enhancement.

- Use manual LGA/neighbourhood selection for v0.1. GPS is not required.
- If a future feature requests location permission, it must be initiated by a clear user action, explain the purpose, and offer a manual alternative.
- Never collect continuous or background location.
- Never publish raw or precise coordinates. Public outputs must be area-level aggregates.
- Do not collect IMEI, IMSI, MSISDN/phone number, SIM serial number, contacts, advertising ID, or hardware fingerprint for measurement or deduplication.
- Do not expose private incident text or attachments publicly.
- Do not make screenshots public by default. Warn users to remove or crop personal information before upload.
- Use data minimisation, purpose limitation, retention limits, secure access controls and deletion procedures.
- Treat pseudonymous identifiers as potentially personal data. Do not describe hashing or pseudonymisation as anonymisation.
- Do not implement tracking-based “unique user” claims. Any contributor deduplication strategy must be documented, proportionate, disclosed and reviewed before public aggregation.
- Public summaries must suppress sparse cohorts. A proposed initial threshold is at least 10 distinct, qualifying contributors per displayed cohort, but this is a configurable safeguard requiring an approved privacy/deduplication design. Ten test events are not automatically ten independent people.
- Never show a neighbourhood/operator/time result if the cohort is too small or could expose an individual.
- Avoid collecting exact residential addresses. The MVP does not need street-level public mapping.
- Complete a data-protection/privacy assessment, including DPIA applicability, with qualified Nigerian advice before systematic public collection or high-risk processing.

### Security baseline

- Never commit secrets, service-role keys, private keys, credentials or real user data.
- Keep Supabase service-role credentials server-side only.
- Apply least privilege and Row Level Security (RLS) to user-accessible tables.
- Public clients must not be able to read raw private incidents or evidence assets.
- Validate and constrain all input server-side (for example with the project's existing schema validator or Zod if appropriate).
- Rate-limit public submission and test endpoints. Add upload size/type limits and private storage policies.
- Use signed, short-lived URLs for private attachments where needed.
- Avoid logging precise locations, incident narratives, access tokens or uploaded contents.
- Document retention and deletion behaviour; do not keep data indefinitely by default.

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

## 6. Public analytics and anti-misrepresentation

- Public analytics must be derived from qualified `app_measured` and/or explicitly labelled `user_reported` datasets. Do not blend them without separate labels.
- Display sample count, observation window, geography, measurement version, freshness and major limitations with each chart/summary.
- Prefer medians and distributions over averages alone; show percentiles where sample size supports them.
- Do not rank operators using an opaque single score in v0.1.
- Do not claim “best network” or “worst network” without a transparent, adequately sampled and comparable methodology.
- Do not diagnose tower congestion, deliberate throttling, billing fraud or operator fault from correlation alone.
- Do not create fabricated/demo data that can be mistaken for real submissions. If seed/demo data is required during development, mark it conspicuously as `demo`, exclude it from production aggregation, and never mix it with live observations.
- Provide an explicit empty/insufficient-data state. No data is better than misleading data.
- Build basic spam/abuse controls and a moderation/audit trail before making user reports public.

## 7. Technical direction

Preferred default stack for a new implementation, subject to repository inspection:

- Next.js + React + TypeScript for the web application.
- Supabase PostgreSQL for persistence and authentication only where needed.
- PostGIS for future geospatial aggregation; do not introduce it if the existing database/environment cannot support it without approval.
- Supabase Storage for private evidence attachments, with explicit access policies.
- IndexedDB for local drafts/offline queue where appropriate.
- Leaflet or MapLibre for mapping, chosen after reviewing existing dependencies and requirements.
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
4. For significant work, provide a concise implementation plan, file-level change list, assumptions, data/security implications and acceptance criteria. Wait for explicit approval before implementation.
5. Small, reversible fixes explicitly requested by the user may be implemented directly, but must remain in scope and be tested.

### Shared-contract rule

Codex owns backend/data contracts unless the user assigns otherwise. Antigravity owns frontend implementation unless the user assigns otherwise. Before parallel work, agree and commit/share:

- API request/response schemas;
- database table/column contract;
- enum values;
- error response shape;
- authentication/anonymous submission approach;
- location granularity;
- measurement payload/methodology version.

Neither agent may independently invent or change these contracts. Any contract change must be documented and communicated before the other agent continues.

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

If a check cannot be run, say so plainly. Never claim a test passed if it was not run.

## 11. Required first milestone

The initial milestone is a working vertical slice:

1. User chooses operator and Lagos area.
2. User explicitly confirms mobile-data testing conditions.
3. User runs a bounded, documented HTTP latency/download test, or records an incident.
4. Data is stored with correct provenance and privacy controls.
5. User can review a private incident/test history or export a clear evidence summary.
6. Public analytics show only adequately sampled, qualified aggregate data; otherwise they show an honest empty state.
7. The user can consult sourced NCC guidance and compensation information without being promised an outcome.

Anything beyond this milestone requires a separate prioritised decision.
