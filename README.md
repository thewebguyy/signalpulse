# SignalPulse NG — Agent Prompt Pack

This pack contains the shared project contract and a coordinated sequence for Codex and Antigravity.

## Files

- `AGENTS.md` — canonical product, privacy, measurement and engineering rules. Place this at the repository root.
- `prompts/00-codex-repository-audit-and-architecture.md` — first prompt. Read-only repository inspection and implementation proposal.
- `prompts/01-codex-backend-and-data-layer.md` — backend/data implementation after approval.
- `prompts/02-antigravity-frontend-and-pwa.md` — frontend/PWA implementation after the API and data contracts are frozen.
- `prompts/03-codex-integration-and-red-team-review.md` — end-to-end, security, privacy and measurement review.

## Recommended execution order

1. Put `AGENTS.md` at the repository root. If the project already has an `AGENTS.md`, merge carefully; do not overwrite useful repository-specific instructions.
2. Give Codex Prompt 00. It must inspect the actual repository and return a plan without editing files.
3. Review the plan. Resolve only blocking choices and explicitly approve the implementation scope.
4. Give Codex Prompt 01. Have it publish the approved database/API contracts before substantial frontend work begins.
5. Share the exact same `AGENTS.md`, approved plan and frozen contracts with Antigravity using Prompt 02. Backend and frontend work may proceed in separate branches once the contract is stable.
6. Integrate the branches and run Prompt 03 with Codex as an independent reviewer.
7. Do not deploy or run production migrations until you have reviewed the final report and explicitly approved those actions.

## Agent coordination rules

- One canonical `AGENTS.md`; do not let agents create competing versions.
- One approved API/data contract; both agents consume it.
- Codex owns backend/schema/security by default.
- Antigravity owns frontend/PWA by default.
- No simultaneous edits to the same migration or contract file.
- Use separate branches or clearly isolated worktrees for parallel work.
- A prompt does not authorise production deployment, real user-data collection or production database changes.

## Important operating note

The PWA cannot reliably read cellular signal strength, tower identity, carrier-billed data use or complete call-failure telemetry. The MVP deliberately measures only what it can support and records other events as user reports. A future Android collector is a separate, evidence-led project, not an assumed part of the first release.
