# SignalPulse NG — Design System & Visual Direction (Proposal)

> **Document ID:** `CTO002-B-01`
> **Status:** Proposed (Awaiting CTO Review)
> **Owner:** Antigravity (Principal Frontend Engineer & Product Design Lead)
> **Scope:** Visual identity, color system, typography, spacing, layout grid, elevation, motion, and CSS custom property tokens.

---

## 1. Visual Identity & Design Thesis

SignalPulse NG is an independent network-experience and consumer-evidence platform for Nigerian mobile subscribers, launching in Lagos State.

### What SignalPulse NG Must Communicate
1. **Independence & Neutrality:** Not affiliated with any MNO (MTN, Airtel, Glo, T2mobile) and not a government portal. It acts as an objective civic-tech instrument and personal evidence ledger.
2. **Technical Credibility:** Every number, timestamp, and provenance badge is presented with laboratory-grade precision (`tabular-nums`, monospace metadata, explicit methodology versions, and honest uncertainty bounds).
3. **Transparency & Anti-Sensationalism:** Calm, factual presentation even when the user's connection is failing. Never uses alarmist red sirens, "fraud detected" banners, or unverified speed rankings.
4. **Lagos Daylight & Low-Bandwidth Resilience:** High-contrast surfaces readable under bright tropical sunlight (`> 7:1` primary text contrast), touch targets sized for one-handed use in transit (`>= 48px`), zero heavy decorative imagery, and system-first font fallbacks that render instantaneously on 2G/3G/edge connections.

### Aesthetic Direction: *"Civic Instrument & Field Ledger"*
Inspired by precision field-testing instruments, archival legal dockets, and structured technical documentation:
- **Warm Alabaster Paper & Deep Slate Ink** for primary reading surfaces—reducing glare outdoors compared to pure `#FFFFFF` while remaining crisp and authoritative.
- **Exposed Hairline Structural Grids (`1px solid`)** rather than heavy drop shadows or blurred glassmorphism, reinforcing the feel of an auditable engineering specification and evidence dossier.
- **High-Contrast Semantic Provenance Badges** so a subscriber or regulator can immediately tell whether a data point was `app_measured`, `device_observed`, `user_reported`, `user_attached`, or `official_source`.

---

## 2. Color System

### 2.1 Surface & Ink Palette (Light Mode Default — High-Glare Outdoor Optimized)

| Token | Hex | RGB | Role & Usage | Contrast vs `#FAF9F5` |
| :--- | :--- | :--- | :--- | :--- |
| `--sp-bg-canvas` | `#FAF9F5` | `250, 249, 245` | Primary page background (warm archival paper) | — |
| `--sp-bg-surface` | `#FFFFFF` | `255, 255, 255` | Elevated cards, interactive controls, input fields | — |
| `--sp-bg-subtle` | `#F1EFEA` | `241, 239, 234` | Secondary containers, methodology disclosure boxes, table headers | — |
| `--sp-bg-muted` | `#E5E2DC` | `229, 226, 220` | Disabled backgrounds, skeleton placeholders, progress tracks | — |
| `--sp-ink-primary` | `#111615` | `17, 22, 21` | Primary body copy, headings, numerical readouts | **17.4 : 1** (AAA) |
| `--sp-ink-secondary` | `#3D4744` | `61, 71, 68` | Supporting prose, field labels, subtitle copy | **9.1 : 1** (AAA) |
| `--sp-ink-tertiary` | `#5C6965` | `92, 105, 101` | Metadata, timestamps, helper text, Secondary captions | **5.3 : 1** (AA) |
| `--sp-border-subtle` | `#DCD8D0` | `220, 216, 208` | Card hairlines, list dividers, table cell borders | — |
| `--sp-border-strong` | `#8C9692` | `140, 150, 146` | Form input borders (3.1:1 non-text AA compliance), active card outlines | **3.1 : 1** (AA UI) |

### 2.2 Brand & Action Accents

We avoid MTN Yellow, Airtel Red, and Glo Green as primary brand actions to prevent subconscious operator association. Instead, SignalPulse NG uses **Lagoon Teal** (technical authority and civic trust) paired with **Instrument Cobalt** (precision telemetry).

| Token | Hex | Role & Usage | Contrast with `#FFFFFF` |
| :--- | :--- | :--- | :--- |
| `--sp-accent-primary` | `#0B5D4C` | Primary CTA buttons ("Check my connection"), active navigation indicator, primary focus rings | **7.6 : 1** (AAA) |
| `--sp-accent-primary-hover` | `#08473A` | Hover/active state for primary actions | **9.8 : 1** (AAA) |
| `--sp-accent-primary-subtle` | `#E6F2EF` | Selected radio/card fill, active step highlight background | — |
| `--sp-accent-telemetry` | `#1D4ED8` | Network Check progress bars, latency/throughput chart strokes | **6.7 : 1** (AA) |

### 2.3 Evidence Provenance Taxonomy Palette (Mandatory Contract Mapping)

Every record in SignalPulse NG carries one of five strict provenance types. Each provenance badge combines **a unique icon shape + explicit uppercase label + semantic color pair** so color-blind users and monochrome PDF printouts never lose distinction.

| Provenance Enum | UI Label | Badge Fill | Badge Text | Badge Border | Icon / Glyph |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `app_measured` | `APP MEASURED` | `#E8F0FE` | `#173EA6` | `#AECBFA` | Pulse / Waveform `[~]` |
| `device_observed` | `DEVICE HINT` | `#F3E8FD` | `#5B21B6` | `#D8B4FE` | Smartphone / Sensor `[i]` |
| `user_reported` | `USER REPORTED` | `#FEF3C7` | `#92400E` | `#FCD34D` | User Note / Pen `[*]` |
| `user_attached` | `USER ATTACHED` | `#F1F5F9` | `#334155` | `#CBD5E1` | Paperclip / File `[+]` |
| `official_source` | `OFFICIAL SOURCE` | `#DCFCE7` | `#115E34` | `#86EFAC` | Landmark / Document `[§]` |

### 2.4 Semantic Feedback Colors (Restrained & Non-Inflammatory)

| State | Fill Token | Text/Icon Token | Border Token | Usage Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Info / Qualification** | `#EFF6FF` | `#1E40AF` | `#BFDBFE` | Methodology notes, data-cap disclosures, browser capability limits |
| **Success / Recorded** | `#ECFDF5` | `#065F46` | `#A7F3D0` | Test completed, incident saved locally, evidence bundle ready |
| **Warning / Capped** | `#FFFBEB` | `#92400E` | `#FDE68A` | Offline draft pending sync, partial/timeout test result, PII upload warning |
| **Danger / Destructive** | `#FEF2F2` | `#991B1B` | `#FECACA` | Delete local draft confirmation, hard network error. **Never used to accuse an operator.** |

### 2.5 Neutral Operator Identification (Non-Promotional)

Operators are displayed using uniform typographic monograms and neutral structural pills, with a subtle `4px` left-border indicator so users can scan their own multi-SIM logs quickly without turning the UI into an operator billboard:
- **MTN:** Indicator `#D99B00` (Muted Ochre-Gold, legible against light backgrounds) | Monogram `MTN`
- **Airtel:** Indicator `#C82333` (Muted Crimson) | Monogram `AIR`
- **Glo:** Indicator `#1F7A3E` (Forest Green) | Monogram `GLO`
- **T2mobile:** Indicator `#0F62FE` (Technical Blue) | Monogram `T2M`

---

## 3. Typography System

### 3.1 Font Stack Strategy (Zero-Latency First Paint)
To guarantee instant text rendering on degraded Nigerian mobile connections (`2G/3G` or high packet loss), SignalPulse NG uses a progressive font stack that renders cleanly with native Android (`Roboto`) and iOS/macOS (`SF Pro`) fonts immediately, optionally enhanced by locally self-hosted `Plus Jakarta Sans` / `Inter` and `JetBrains Mono` (`font-display: swap`).

- `--sp-font-sans`: `'Inter', -apple-system, BlinkMacSystemFont, 'Roboto', 'Segoe UI', sans-serif`
- `--sp-font-mono`: `'JetBrains Mono', ui-monospace, 'SFMono-Regular', 'Roboto Mono', Menlo, monospace`

### 3.2 Type Scale & Hierarchy (Mobile-First with Fluid Desktop Scaling)

All numeric metrics, timestamps, byte counters, and durations **must** apply `font-variant-numeric: tabular-nums` so digits never jitter during live latency/download updates.

| Token | Size (Mobile -> Desktop) | Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--sp-text-display` | `2.0rem` (32px) -> `2.5rem` (40px) | `1.15` | `700` | `-0.02em` | Measured throughput/latency primary readout (`tabular-nums`) |
| `--sp-text-h1` | `1.5rem` (24px) -> `1.875rem` (30px) | `1.2` | `700` | `-0.015em` | Page titles (e.g., "Network Check", "Incident Journal") |
| `--sp-text-h2` | `1.25rem` (20px) -> `1.5rem` (24px) | `1.25` | `600` | `-0.01em` | Section headers, step titles |
| `--sp-text-h3` | `1.0625rem` (17px) -> `1.125rem` (18px) | `1.35` | `600` | `0` | Card titles, incident category names |
| `--sp-text-body` | `1.0rem` (16px) | `1.5` | `400` | `0` | Default body copy, form inputs (prevents iOS auto-zoom on focus) |
| `--sp-text-body-sm` | `0.875rem` (14px) | `1.45` | `400` | `0` | Secondary descriptions, methodology disclosures, table cells |
| `--sp-text-caption` | `0.75rem` (12px) | `1.35` | `600` | `+0.04em` | Provenance badges, uppercase field eyebrows, UTC/WAT timestamps |

---

## 4. Spacing, Grid & Viewport Architecture

### 4.1 4px Base Spatial Scale
- `--sp-space-1`: `0.25rem` (`4px`) — inline icon gaps, badge padding
- `--sp-space-2`: `0.5rem` (`8px`) — tight stack spacing, chip groups
- `--sp-space-3`: `0.75rem` (`12px`) — compact card padding (320px screens), input vertical padding
- `--sp-space-4`: `1.0rem` (`16px`) — standard mobile container gutter, card internal padding
- `--sp-space-5`: `1.25rem` (`20px`) — section sub-group spacing
- `--sp-space-6`: `1.5rem` (`24px`) — major section separation on mobile
- `--sp-space-8`: `2.0rem` (`32px`) — desktop card padding, major layout breaks
- `--sp-space-12`: `3.0rem` (`48px`) — minimum interactive touch target height

### 4.2 Responsive Breakpoints & Container Constraints
Designed explicitly around real Nigerian device viewports:
- **`xs` (`320px` – `359px`)**: Entry-level Android devices (e.g., Tecno Pop, Itel, older Samsung A-series). Single-column stack, `12px` outer horizontal padding, compact 2x2 operator grid, wrapping provenance pills.
- **`sm` (`360px` – `430px`)**: Mainstream mobile phones (`375px` iPhone SE/mini, `390px`–`412px` Android, `430px` large phones). Single-column stack, `16px` outer horizontal padding, sticky bottom navigation bar (`64px` height).
- **`md` (`768px` – `1023px`)**: Tablets and foldable screens. 8-column grid, `24px` gutters, 2-column card layouts for Incident Journal and Evidence Builder preview.
- **`lg` (`1024px`+)**: Desktop viewports. Max content width `1120px` centered, persistent left navigation rail (`240px` wide) replacing the mobile bottom tab bar, split-pane Evidence Builder (left: record selector & form; right: live docket preview).

### 4.3 Touch Targets, Borders & Motion Rules
- **Touch Target Floor:** Every interactive element (operator selector, LGA dropdown, checkbox, cancel button, tab item) must have a minimum hit area of `48px x 48px`.
- **Border Radius:** Restrained and structural—`--sp-radius-sm: 4px` (badges, code tags), `--sp-radius-md: 8px` (buttons, inputs, cards), `--sp-radius-lg: 12px` (modals, bottom sheets).
- **Motion:** Functional only. Progress bar transitions use `cubic-bezier(0.22, 1, 0.36, 1)` (`150ms–250ms`). All animations respect `@media (prefers-reduced-motion: reduce)` by switching to instant state updates and static progress indicators.

---

## 5. Reference CSS Custom Properties (`tokens.css` Blueprint)

```css
:root {
  /* Surfaces */
  --sp-bg-canvas: #FAF9F5;
  --sp-bg-surface: #FFFFFF;
  --sp-bg-subtle: #F1EFEA;
  --sp-bg-muted: #E5E2DC;

  /* Ink */
  --sp-ink-primary: #111615;
  --sp-ink-secondary: #3D4744;
  --sp-ink-tertiary: #5C6965;

  /* Borders */
  --sp-border-subtle: #DCD8D0;
  --sp-border-strong: #8C9692;

  /* Brand & Action */
  --sp-accent-primary: #0B5D4C;
  --sp-accent-primary-hover: #08473A;
  --sp-accent-primary-subtle: #E6F2EF;
  --sp-accent-telemetry: #1D4ED8;

  /* Provenance Badges */
  --sp-prov-measured-bg: #E8F0FE;
  --sp-prov-measured-fg: #173EA6;
  --sp-prov-measured-border: #AECBFA;

  --sp-prov-device-bg: #F3E8FD;
  --sp-prov-device-fg: #5B21B6;
  --sp-prov-device-border: #D8B4FE;

  --sp-prov-reported-bg: #FEF3C7;
  --sp-prov-reported-fg: #92400E;
  --sp-prov-reported-border: #FCD34D;

  --sp-prov-attached-bg: #F1F5F9;
  --sp-prov-attached-fg: #334155;
  --sp-prov-attached-border: #CBD5E1;

  --sp-prov-official-bg: #DCFCE7;
  --sp-prov-official-fg: #115E34;
  --sp-prov-official-border: #86EFAC;

  /* Semantic States */
  --sp-state-info-bg: #EFF6FF;
  --sp-state-info-fg: #1E40AF;
  --sp-state-info-border: #BFDBFE;

  --sp-state-success-bg: #ECFDF5;
  --sp-state-success-fg: #065F46;
  --sp-state-success-border: #A7F3D0;

  --sp-state-warn-bg: #FFFBEB;
  --sp-state-warn-fg: #92400E;
  --sp-state-warn-border: #FDE68A;

  --sp-state-danger-bg: #FEF2F2;
  --sp-state-danger-fg: #991B1B;
  --sp-state-danger-border: #FECACA;

  /* Typography */
  --sp-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Roboto', 'Segoe UI', sans-serif;
  --sp-font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', 'Roboto Mono', Menlo, monospace;

  /* Geometry */
  --sp-radius-sm: 4px;
  --sp-radius-md: 8px;
  --sp-radius-lg: 12px;
  --sp-touch-target: 48px;
}
```
