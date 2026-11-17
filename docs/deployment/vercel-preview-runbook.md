# SignalPulse NG — Protected Vercel Preview Runbook (CTO006-B)

> **Document Status:** Active Deployment Specification  
> **Directive:** CTO006-B (Protected Vercel Preview Preparation)  
> **Author:** Antigravity (Staff Frontend Engineer & Preview Deployment Owner)  
> **Scope:** Internal / Stakeholder Preview Only — **Synthetic Mode Strictly Enforced**  
> **Prohibited:** Public release, production traffic, live measurement endpoints, real subscriber data collection  
> **Baseline Branch:** `polish/signalpulse-ux-reliability`  
> **Baseline Commit:** `7697b52`  

---

## 1. Executive Summary & Objective

In accordance with **CTO Directive 006-B**, this runbook establishes the technical configuration, security controls, and operational procedures for deploying an **internal, password-protected preview** of SignalPulse NG on Vercel.

SignalPulse NG is currently in **Foundation Milestone CTO002-A/CTO005-B**, utilizing synthetic fixtures only (`SIGNALPULSE_DATA_MODE=synthetic`). This preview is intended strictly for internal design, product, and stakeholder validation. It does **not** authorize a public release, live measurement transport, or collection of subscriber telemetry.

---

## 2. Vercel Platform & Runtime Compatibility

### 2.1 Next.js 16 & Turbopack
- **Framework:** Next.js `16.4.6` (React `19.3.1`, Turbopack).
- **Prerendering Mode:** 100% Static Content (`○ Static`). All 8 routes (`/`, `/_not-found`, `/check`, `/evidence`, `/guidance`, `/incidents`, `/intelligence`) are statically pre-rendered at build time.
- **Bundle Inspection:** Verified with `scripts/check-bundle.mjs` — zero server markers or secrets exist in client bundles.

### 2.2 Node.js Version & Toolchain Alignment
- **Pinned Version:** Node.js `26.12.1`, npm `11.20.0` (recorded in `.nvmrc`, `.node-version`, and `package.json`).
- **Platform Support:** Node.js 26.x is the default runtime on Vercel as of 2026.
- **Build Resilience:** `scripts/check-toolchain.mjs` has been updated to detect `process.env.VERCEL === "1"` and enforce Node 26.x major runtime compatibility without breaking on minor patch variances between ephemeral build containers.

---

## 3. Required Environment Variables

The application contains strict environment fail-closed logic in `src/config/environment.ts`. The presence of any unauthorized keys will intentionally crash the build to prevent security leaks.

### 3.1 Allowed & Required Variables (Vercel Preview Scope)

| Variable | Required Value | Purpose |
| :--- | :--- | :--- |
| `SIGNALPULSE_DATA_MODE` | `synthetic` | Enforces synthetic data mode and mock simulation isolation. |
| `NODE_ENV` | `production` | Standard Next.js production optimization. |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disables Next.js anonymous usage reporting. |

### 3.2 Strictly Prohibited Variables
The application throws an unrecoverable exception if any of the following exist in the environment:
- Any variable starting with `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_SUPABASE_*`).
- Any variable containing `SUPABASE` (e.g. `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- Any variable starting with `SIGNALPULSE_` other than `SIGNALPULSE_DATA_MODE`.
- Database connection strings (`POSTGRES_*`, `DATABASE_URL`).

---

## 4. Protected Preview Configuration (`vercel.json`)

To prevent unauthorized public discovery or search indexing, `vercel.json` has been committed to the repository with strict security and privacy headers:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci --no-audit",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow, noarchive" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### 4.1 Access Protection Requirement (Mandatory)
Before sharing the preview URL with any team member, one of the following Vercel protection mechanisms **must** be activated in the Vercel Dashboard (**Project Settings > Deployment Protection**):

1. **Option A: Vercel Authentication (Recommended)**
   - Only authorized members of your Vercel team account can access the preview URL.
   - Visiting the URL redirects unauthenticated visitors to a Vercel login screen.
2. **Option B: Password Protection (For external stakeholders)**
   - Sets a single shared passphrase required to view preview deployments.
   - Recommended password policy: Minimum 16 characters, randomized.

---

## 5. GitHub Branch Deployment Strategy

To prevent accidental production deployments or direct pushes to `main`:

```
[ polish/signalpulse-ux-reliability ] (Frontend UX Polish & Diagnostics)
                    │
                    ▼  (Pull Request)
[ design/signalpulse-experience-v2 ]   ◄─── TRIGGERS VERCEL PREVIEW
                    │
                    ▼  (Code Review + Codex Integration)
[ feature/signalpulse-app-foundation ] ◄─── FOUNDATION BASELINE
                    │
                    ▼  (Final CTO Audit)
                 [ main ]              ◄─── RESTRICTED PRODUCTION BRANCH
```

1. **Production Branch on Vercel:** Set to a restricted branch (or leave as `main` with Automatic Production Deployments **Paused**).
2. **Preview Deployments:** Triggered automatically whenever commits are pushed to feature branches or PRs are opened targeting `design/signalpulse-experience-v2`.
3. **Ephemeral URLs:** Vercel generates unique, isolated URLs for each preview (e.g. `https://signalpulse-git-polish-signalpulse-ux-reliability-*.vercel.app`).

---

## 6. Simulated Intelligence & Evidence Disclosures

To satisfy **Objective 7** and ensure simulated demonstrations cannot be mistaken for genuine observations:

1. **Connectivity Check (`/check`):**
   - Prominently displays `"Notice: Live Network Measurements Unavailable in this Release"`.
   - Explicitly discloses: *"In this local foundation milestone, measurement transport and live carrier speed tests are not yet connected to prevent recording inaccurate or uncalibrated network data."*
   - Features the **Evidence Integrity Guarantee**: simulated measurements cannot be saved to the ledger or exported into genuine dispute dockets.
2. **Network Intelligence (`/intelligence`):**
   - Labeled with the `app_measured` provenance badge and explicit disclaimer: *"Screened, privacy-protected public network summaries for Lagos State. Strictly aggregated across Monday-to-Monday observation cohorts."*
   - Discloses sample sizes and suppression thresholds.
3. **Incident Journal (`/incidents`):**
   - Explicitly marked as `user_reported` provenance.
   - Informs subscribers that data is stored solely in local browser storage (`window.localStorage`).
4. **Evidence Builder (`/evidence`):**
   - Generates structured JSON evidence dockets matching `exportDocumentSchema`.
   - Includes standard disclaimer: user-assembled records that do not imply regulatory certification or operator liability.

---

## 7. Subscriber Privacy & Zero-Transmission Assurance

- **No Remote Telemetry:** `NEXT_TELEMETRY_DISABLED=1` is enforced.
- **No Cloud Database / Persistence:** Zero database connections, Supabase keys, or external backend services.
- **No User Telemetry Transmitted:** Incident narratives and complaint references are stored strictly on the user's client device via `localStorage`.
- **No PII Collected:** The application does not request, read, or store IMEI, IMSI, phone number, MAC address, contacts, or GPS coordinates.

---

## 8. Deployment Smoke Testing Suite

An automated deployment smoke testing script (`scripts/smoke-test.mjs`) is provided to verify route health and security boundaries both locally and against live preview deployments.

### 8.1 Local Execution
```bash
npm run smoke
```

### 8.2 Remote Preview Execution
Once Vercel generates a preview URL, execute:
```bash
node scripts/smoke-test.mjs https://<your-preview-subdomain>.vercel.app
```

### 8.3 Smoke Test Assertions
The test evaluates all 7 canonical scenarios:
1. `GET /`: HTTP 200, checks for platform branding and consumer evidence mission.
2. `GET /check`: HTTP 200, verifies presence of the "Live Network Measurements Unavailable" disclaimer and Evidence Integrity Guarantee.
3. `GET /incidents`: HTTP 200, verifies local persistence notices and incident reporting controls.
4. `GET /evidence`: HTTP 200, verifies Evidence Builder workspace and disclosure headers.
5. `GET /intelligence`: HTTP 200, verifies synthetic preview notices and publication safeguards.
6. `GET /guidance`: HTTP 200, verifies NCC dispute escalation channels, toll-free number (622), and statutory timelines.
7. `GET /non-existent-route-for-smoke-test-404`: HTTP 404, verifies clean error handling.
8. **Forbidden Secret Leak Check:** Scans all responses for forbidden keywords (`SUPABASE_*`, `postgres://`, etc.).

---

## 9. Rollback & Instant Revocation Procedures

If an unexpected behavior, sensitive text, or configuration flaw is discovered:

### 9.1 Instant Deployment Rollback (Vercel Dashboard)
1. Navigate to **Deployments** in the Vercel project.
2. Find the previous stable preview deployment.
3. Click the three dots (`...`) and select **Instant Rollback** (or **Assign Domain**).

### 9.2 Immediate Access Revocation
1. Go to **Settings > Deployment Protection**.
2. Toggle **Password Protection** ON (or change the existing passphrase).
3. Any open sessions or shared links immediately become inaccessible without the new password.

### 9.3 Git-Level Rollback
1. Revert or delete the preview branch:
   ```bash
   git push origin --delete <branch-name>
   ```
2. Vercel automatically cancels active builds and de-indexes the preview branch.

---

## 10. Step-by-Step Activation Checklist for the CTO

1. **Connect GitHub Repository:**
   - In Vercel, click **Add New Project** and select `thewebguyy/signalpulse`.
2. **Configure Build Settings:**
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci --no-audit`
3. **Configure Environment Variables:**
   - Add `SIGNALPULSE_DATA_MODE` = `synthetic` (Target: Preview, Development).
   - Add `NEXT_TELEMETRY_DISABLED` = `1`.
   - **Do NOT** add any other keys.
4. **Enable Deployment Protection:**
   - In **Project Settings > Deployment Protection**, enable **Vercel Authentication** or **Password Protection**.
5. **Trigger Preview Build:**
   - Push a commit or create a PR for `polish/signalpulse-ux-reliability`.
6. **Execute Smoke Tests:**
   - Run `node scripts/smoke-test.mjs <preview-url>` to confirm all 7 checks pass.
