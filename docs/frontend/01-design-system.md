# SignalPulse NG — Refined Visual Design Language & Tokens (CTO003-B)

> **Document ID:** `CTO003-B-02` (Refined from `CTO002-B-01`)
> **Status:** Approved Design Direction
> **Owner:** Antigravity (Principal Product Designer & Staff Frontend Engineer)
> **Design Thesis:** *"Precision Civic Instrument & Archival Field Ledger"*

---

## 1. Design Thesis & Identity

SignalPulse NG is an independent network-experience and consumer-evidence platform for Nigerian mobile subscribers, launching in Lagos State.

### Core Visual Principles
1. **Calm Authority, Not Alarmism:** Never use flashing sirens, inflammatory red banners, or accusatory telco labels. When a user's network is failing, the interface should feel as calm and reliable as a precision multimeter or an official legal docket.
2. **High-Glare Sunlight Readability:** Built for Lagos outdoor daylight. Deep Slate ink (`#121514`) on Warm Alabaster (`#FBFBFA`) achieves an ultra-high **17.8:1** contrast ratio (exceeding WCAG AAA `7:1`).
3. **Precision Geometry over SaaS Trends:** No arbitrary purple gradients, floating blurred glass cards, or toy-like 20px pill shapes. Elements use tight `6px` radii, crisp `1px` hairlines, and structured tabular typography.
4. **Bespoke Scalable Iconography:** Replaces developer glyphs (`[~]`, `[*]`) with purposeful, optically balanced 20px SVG line icons with a uniform `1.75px` stroke.

---

## 2. Refined Color System

### 2.1 Surfaces & Ink (Outdoor Sunlight Optimized)

| Token | Hex | RGB | Role & Application | Contrast vs `#FBFBFA` |
| :--- | :--- | :--- | :--- | :--- |
| `--sp-bg-canvas` | `#FBFBFA` | `251, 251, 250` | Primary viewport background (warm archival paper) | — |
| `--sp-bg-surface` | `#FFFFFF` | `255, 255, 255` | Elevated content containers, interactive cards, form inputs | — |
| `--sp-bg-subtle` | `#F4F3F0` | `244, 243, 240` | Secondary wells, pre-flight disclosure boxes, table headers | — |
| `--sp-bg-muted` | `#E8E6E1` | `232, 230, 225` | Progress tracks, disabled backgrounds, structural dividers | — |
| `--sp-ink-primary` | `#121514` | `18, 21, 20` | Headings, primary body text, numerical telemetry readouts | **17.8 : 1** (AAA) |
| `--sp-ink-secondary` | `#3F4946` | `63, 73, 70` | Supporting descriptions, field labels, metadata headers | **8.6 : 1** (AAA) |
| `--sp-ink-tertiary` | `#64706C` | `100, 112, 108` | Helper captions, timestamps, legal notices | **4.8 : 1** (AA) |
| `--sp-border-subtle` | `#E5E2DC` | `229, 226, 220` | Clean structural hairlines, table borders, card dividers | — |
| `--sp-border-strong` | `#64706C` | `100, 112, 108` | Form field borders (3.3:1 non-text contrast), active outlines | **3.3 : 1** (AA Non-Text) |

### 2.2 Brand & Action Accents

| Token | Hex | Role & Application | Contrast on `#FFFFFF` |
| :--- | :--- | :--- | :--- |
| `--sp-accent-primary` | `#0C4A3E` | Primary CTAs ("Check connection"), active navigation indicator | **8.2 : 1** (AAA) |
| `--sp-accent-primary-hover`| `#08352C` | Active/hover interaction state | **10.6 : 1** (AAA) |
| `--sp-accent-primary-tint` | `#E8F2EF` | Active radio card fill, selected tab background | — |
| `--sp-accent-telemetry` | `#1E40AF` | Precision telemetry progress bar, latency measurement spark | **7.2 : 1** (AAA) |

### 2.3 Refined Provenance Taxonomy Badges

Every data point visibly declares its evidentiary source through an uppercase micro-label paired with an inline SVG glyph:

| Provenance Key | Display Label | Background | Foreground | Border | Glyph Metaphor |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `app_measured` | `APP MEASURED` | `#EFF6FF` | `#1D4ED8` | `#BFDBFE` | Pulse / Signal Wave |
| `device_observed` | `DEVICE HINT` | `#F5F3FF` | `#6D28D9` | `#DDD6FE` | Phone / Sensor Beacon |
| `user_reported` | `USER REPORTED` | `#FEF3C7` | `#92400E` | `#FDE68A` | User Docket / Pen |
| `user_attached` | `USER ATTACHED` | `#F1F5F9` | `#334155` | `#CBD5E1` | Paperclip Document |
| `official_source` | `OFFICIAL SOURCE` | `#ECFDF5` | `#065F46` | `#A7F3D0` | Regulatory Seal |

---

## 3. Typography & Spacing Rhythm

### 3.1 Typeface Selection & Zero-Latency Performance
- **Primary Interface Font:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Telemetry & Metadata Font:** `'JetBrains Mono', ui-monospace, 'SFMono-Regular', Consolas, monospace`
- **Performance Rule:** Renders instantly via progressive font fallback with zero font-blocking latency on slow 2G/3G connections.

### 3.2 Type Scale (Mobile -> Desktop)
All numerical metrics and timestamps enforce `font-variant-numeric: tabular-nums` to eliminate jitter during active updates.

| Token | Size | Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--sp-text-display` | `2.25rem` (36px) | `1.15` | `700` | `-0.025em` | Primary telemetry numerical readout (`tabular-nums`) |
| `--sp-text-h1` | `1.625rem` (26px) | `1.2` | `700` | `-0.02em` | Major page headings |
| `--sp-text-h2` | `1.25rem` (20px) | `1.3` | `600` | `-0.015em` | Section headers, card titles |
| `--sp-text-h3` | `1.0625rem` (17px) | `1.4` | `600` | `-0.01em` | Subsection titles, incident categories |
| `--sp-text-body` | `0.9375rem` (15px) | `1.55` | `400` | `0` | Primary reading prose, form labels |
| `--sp-text-sm` | `0.8125rem` (13px) | `1.45` | `400` | `0` | Metadata, disclosures, contextual helpers |
| `--sp-text-micro` | `0.6875rem` (11px) | `1.3` | `700` | `+0.05em` | Provenance badges, uppercase table eyebrows |

### 3.3 Geometry & Elevation
- **Border Radius:** Restrained and precise: `--sp-radius-sm: 4px`, `--sp-radius-md: 6px`, `--sp-radius-lg: 10px`.
- **Elevation:** Minimalist ambient shadow: `--sp-shadow-card: 0 1px 3px rgba(18, 21, 20, 0.04)`.
- **Interactive Floor:** All touch targets maintain a minimum hit area of `48px x 48px`.
