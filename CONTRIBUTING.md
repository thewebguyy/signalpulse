# Contributing to SignalPulse NG

Thank you for your interest in contributing to **SignalPulse NG**!

SignalPulse is an independent, operator-neutral connectivity intelligence and consumer-evidence platform built for Nigerian mobile subscribers across MTN, Airtel, Globacom (Glo), and T2mobile.

Our mission: *"Measure what can be measured. Document what happened. Understand what to do next."*

---

## Code of Conduct & Core Principles

Before opening a pull request or submitting an issue, please review our foundational operating principles:

1. **Operator Neutrality:** SignalPulse is strictly independent. We do not favor, attack, or single out any Nigerian telecommunications operator.
2. **Evidence Taxonomy:** We distinguish:
   - `app_measured`: measured in controlled tests.
   - `device_observed`: read from device APIs with recorded limitations.
   - `user_reported`: asserted by subscribers and not independently verified.
   - `user_attached`: user-provided files or screenshots.
   - `official_source`: published by the Nigerian Communications Commission (NCC).
   Never conflate user claims with independently verified measurements.
3. **Privacy First (Local-First):** All subscriber reports stay in the browser local storage unless explicitly exported or shared by the user. We never collect IMEI, IMSI, phone numbers, or background GPS location.
4. **No Speculative or Fabricated Data:** Never invent outage statistics, simulated network scores, or misleading test results. Honest empty states are strictly preferred over misleading numbers.

---

## Local Development Setup

### Prerequisites
- **Node.js:** `26.12.1` (see `.nvmrc` and `.node-version`)
- **npm:** `11.20.0`

### Installation & Run

```sh
# Clone the repository
git clone https://github.com/thewebguyy/signalpulse.git
cd signalpulse

# Install exact pinned dependencies
npm ci

# Start the local development server (binds to loopback 127.0.0.1:3000)
npm run dev
```

Visit [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

---

## Verification & Quality Gates

Every pull request must pass the automated quality pipeline before merging:

```sh
# Run full verification suite:
npm run check
```

This command runs:
1. `npm run typecheck` — TypeScript strict type validation & route typegen.
2. `npm run lint` — ESLint strict rules (zero warnings allowed).
3. `npm test` — Vitest unit, contract, and RLS security test suites.
4. `npm run check:boundaries` — Architectural module boundary & import isolation checks.
5. `npm run check:ci` — GitHub Actions workflow syntax & security check.
6. `npm run build` — Next.js production build.
7. `npm run check:bundle` — Browser bundle server-secret leak verification.

---

## Pull Request Guidelines

1. **Branch Naming:** Use focused prefixes, e.g., `feature/...`, `fix/...`, `docs/...`.
2. **Commit Hygiene:** Write clear, conventional commit messages (e.g. `feat(report): ...`, `fix(ui): ...`).
3. **Never Commit Secrets:** Do not commit `.env` files, API keys, or database credentials.
4. **Maintain Privacy Invariants:** Do not add third-party tracking scripts, invasive analytics, or unconsented telemetry.

Repository: [https://github.com/thewebguyy/signalpulse](https://github.com/thewebguyy/signalpulse)
