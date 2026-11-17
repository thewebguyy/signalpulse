# SignalPulse NG

Local engineering foundation for an independent Nigerian mobile-network experience and consumer-evidence platform. Lagos-first scope: MTN, Airtel, Glo and T2mobile.

**This build uses labelled synthetic fixtures only.** It contains no working sign-in, private save, measurement transport, upload, export renderer or aggregate publisher. The preview page is an integration scaffold, not the product experience.

## Run locally

Use **Node.js 26.12.1** and **npm 11.20.0**. The version files, package engines and preinstall guard must agree. A Node version manager may read .nvmrc or .node-version; install the pinned runtime through your usual trusted installer. Do not use a different package manager or bypass engine/peer checks.

From this repository directory:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Development and production-start commands bind to loopback. No environment file or service account is required. The optional .env.example documents synthetic mode. Never add Supabase keys or NEXT_PUBLIC_* values: this milestone rejects them. Do not expose this engineering preview as a public service.

To verify and run the optimized local build:

```sh
npm run check
npm run start
```

Use Ctrl+C to stop. On PowerShell, optionally set `$env:NEXT_TELEMETRY_DISABLED='1'` before running Next commands. CI disables Next telemetry. No remote fonts or analytics are configured.

## Commands

| Command | Purpose |
| --- | --- |
| npm ci | Reproduce dependencies from the lockfile; needs registry access on first install |
| npm run dev | Local Next development server |
| npm run typecheck | Generate route types and run strict TypeScript |
| npm run lint | ESLint, TypeScript, Next and React Hooks rules |
| npm test | Synthetic unit, contract, fixture and boundary tests |
| npm run check:boundaries | Check import graph and transitive client/server separation |
| npm run check:ci | Parse and validate the CI definition locally |
| npm run build | Optimized Next production compilation |
| npm run check:bundle | Inspect generated browser JS for configured server markers |
| npm run check | All verification above except dependency installation |
| npm run start | Serve the already-built application locally |

npm caches inside ignored .npm-cache. If an interrupted installation leaves dependencies incomplete, rerun npm ci; do not hide failures using --force or --legacy-peer-deps. Platform-native Next/Tailwind packages are in the lockfile; optional dependencies must remain enabled. A successful exit alone is insufficient: inspect build output and verify the built page.

## Source map

- src/app: minimal server-rendered integration shell.
- src/components/ui: accessible reusable semantic primitives.
- src/contracts: Zod schemas and inferred DTOs, safe to consume in browser code.
- src/modules: domain ownership predicate and ports; no database/HTTP implementation.
- src/config: environment parser and guarded server reader.
- src/server: composition root, safe error construction and reserved Supabase adapter boundary.
- src/fixtures: deterministic, synthetic, nonpersistent previews; imported only on the server.
- tests and scripts: automated checks.
- docs/architecture, docs/contracts, docs/measurement: preserved CTO001-r1.
- docs/development: current implementation coverage, decisions and handoff.

Start with [AGENTS.md](AGENTS.md), [foundation record](docs/development/cto002a-foundation.md), [contract coverage](docs/development/contract-coverage.md) and [Antigravity handoff](docs/development/antigravity-handoff.md). No API routes exist; do not point UI fetches at the proposed endpoint inventory yet.
