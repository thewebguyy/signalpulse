# Antigravity handoff — CTO002-A-r1

Baseline main@5ea102175c76ccf44120a5d45ae78de0fcc83fe2 plus uncommitted CTO001-r1 and CTO002-A work. Wire 0.1.0; implementation CTO002-A-r1. Method browser-http-0.1 and receipt receipt-0.1 remain proposals, with no transport implementation. Nothing committed, pushed or deployed.

Read AGENTS.md, the preserved architecture index, api-v1/common contracts, founder decisions and ../development/contract-coverage.md. Review contract usability before frontend execution; acknowledgement has not yet occurred.

## Ownership

| Paths | Writer / coordination |
| --- | --- |
| src/contracts, src/modules, src/server, src/config, src/fixtures | Codex; contract changes require coordinated review |
| package files, runtime/config files, scripts, CI, tests for backend/contracts | Codex; request dependency/config changes with rationale |
| docs/architecture, docs/contracts, docs/measurement | Shared approved source of truth; Codex coordinates one writer and reviewed revisions |
| Future src/features and frontend interaction tests | Antigravity within an authorized task |
| src/components/ui | Initial Codex scaffold; transfer to Antigravity after acknowledging this handoff |
| src/app/layout.tsx, page.tsx, globals.css and future route files | Shared integration surface; one designated writer at a time |
| AGENTS.md and development handoff | Codex coordinator; preserve accepted responsibilities |

## Sequential integration procedure

Use sequential editing in this shared tree for the initial handoff. Before starting, record git status, HEAD, contract implementation revision and assigned files. Acknowledge the coverage table and specify the next authorized UI slice. Codex freezes shared contracts/config while Antigravity owns the agreed UI files. If backend changes become necessary, pause only dependent UI work and agree the revision before either side edits shared files. At return, review the complete diff and rerun npm run check. No reset, stash, overwrite, commit or push is implied.

If real parallel execution becomes necessary, first agree isolated worktrees/branches and an integration owner. Do not assume two agents can safely edit the same layout or contract.

## Stable interface

Consume types/schemas from @/contracts/<module>. Use the server composition root readFoundationPreview() only from a server component; pass a narrow serializable subset and the synthetic warning to client components. Never import @/server, @/config or @/fixtures into client code (the import graph check follows re-exports).

The fixture factory supplies signed-out session, four operators, one clearly synthetic area, user-reported incident, uncorroborated failed measurement, text-only export document and unavailable public cohort. There is no save/auth/test/upload adapter. Do not present buttons as successful actions against nonexistent endpoints.

Auth/incident/measurement/evidence/intelligence ports are interfaces for later adapters, not mocks that pretend to persist. NCC is contract_pending. Preserve request fields and nullability; do not replace canonical enums with UI labels. Human-readable labels belong in the presentation layer.

## Acceptance for the next UI handoff

Confirm that canonical fields support incident input, private history and text-only evidence review, and list any missing UX contract rather than inventing it. Show guest limitations before any future save; distinguish drafting from saved history; retain provenance and synthetic warnings. Keep contribution separate from saving. Keep public metrics unavailable.

Before returning UI work: typecheck, lint, contract/unit tests, import boundaries, CI validation, production build and bundle marker checks must pass. Add keyboard, responsive and accessible interactive-flow checks appropriate to the UI introduced. No live provider, metered test, data collection, upload or production deployment is authorized by this handoff.
