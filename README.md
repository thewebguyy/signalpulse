# SignalPulse NG

> **"Bad network? Keep a record."**  
> An independent, operator-neutral connectivity intelligence and consumer-evidence platform for Nigerian mobile subscribers across **MTN, Airtel, Globacom (Glo), and T2mobile**.

**Open source. Help us build it better.**  
Repository: [https://github.com/thewebguyy/signalpulse](https://github.com/thewebguyy/signalpulse)  
Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 1. Feature Availability Status

| Capability | Status | Description |
| :--- | :--- | :--- |
| **Universal Incident Reporting (`/report`)** | **Available** | Fast, mobile-first reporting for all 4 networks with instant switching. |
| **Direct Operator Entry Routes** | **Available** | Shareable links: `/report/mtn`, `/report/airtel`, `/report/glo`, `/report/t2mobile`. |
| **Privacy-Safe Share Card** | **Available** | Client-side PNG card generator for X & WhatsApp with zero server upload. |
| **Local-First Evidence Vault (`/evidence`)** | **Available** | Private on-device report history, dossier view, and PDF/JSON export. |
| **NCC Consumer Guidance (`/guidance`)** | **Available** | Official telecom consumer rights, complaint timelines, and escalation channels. |
| **Connection Speed/Latency Check (`/check`)** | *Planned* | Disclosed upcoming methodology. Live tests remain gated until server calibration. |
| **Network Intelligence (`/intelligence`)** | *Planned* | Public aggregation gated until privacy threshold and sample size approvals. |
| **Cloud Vault Backup** | *Disabled* | Retained in codebase, strictly disabled by default (`NEXT_PUBLIC_ENABLE_CLOUD_BACKUP=false`). |

---

## 2. Key Public Routes

- `/` — Homepage with network status overview and direct operator reporting links.
- `/report` — Universal reporting entry point ("Bad network? Keep a record.").
- `/report/mtn` — Preselected reporting for MTN Nigeria.
- `/report/airtel` — Preselected reporting for Airtel Nigeria.
- `/report/glo` — Preselected reporting for Globacom (Glo).
- `/report/t2mobile` — Preselected reporting for T2mobile.
- `/evidence` — Private on-device evidence dossier, printable summary, and JSON export.
- `/incidents` — Report history management with in-place editing, deleting, and share card generation.
- `/guidance` — Authoritative NCC consumer guidance and escalation process.
- `/check` — Transparent disclosure on upcoming browser-based network measurement.
- `/intelligence` — Area-level network intelligence methodology and privacy disclosure.

---

## 3. Run Locally

### Prerequisites
- **Node.js:** `26.12.1` (pinned via `.nvmrc` and `.node-version`)
- **npm:** `11.20.0`

### Setup & Development Server

```sh
# Clone repository
git clone https://github.com/thewebguyy/signalpulse.git
cd signalpulse

# Install dependencies strictly from lockfile
npm ci

# Start local Next.js development server (binds to loopback 127.0.0.1:3000)
npm run dev
```

Visit [http://127.0.0.1:3000](http://127.0.0.1:3000). No external services, API keys, or cloud credentials are required for local operation.

---

## 4. Verification & Quality Commands

All verification commands must pass without errors or warnings:

| Command | Purpose |
| :--- | :--- |
| `npm run typecheck` | Next route typegen and strict TypeScript checking |
| `npm run lint` | ESLint rules with `--max-warnings=0` |
| `npm test` | Vitest unit, contract, fixture, and RLS security test suites |
| `npm run check:boundaries` | Architectural module boundary isolation validation |
| `npm run check:ci` | GitHub Actions workflow syntax validation |
| `npm run build` | Next.js production build compilation |
| `npm run check:bundle` | Browser bundle inspection for server markers |
| `npm run check` | Runs all checks above in sequence |
| `npm run start` | Serve the production build locally |

---

## 5. Architectural & Privacy Invariants

1. **Independent & Operator-Neutral:** SignalPulse does not favor or single out any operator. It treats all four carriers with identical evidential standards.
2. **Local-First & Private:** Evidence is created and stored in the subscriber's browser via `localStorage`. No private descriptions, customer-care references, or phone numbers leave the device unless explicitly exported by the user.
3. **No Unsubstantiated Accusations:** SignalPulse is an evidence collection tool, not a regulator or billing auditor. It distinguishes between user assertions (`user_reported`) and technical observations.

For full architectural contracts and rules, see [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
