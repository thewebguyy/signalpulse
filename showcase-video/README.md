# SignalPulse NG — UI/UX Product Showcase Video Project (CTO013)

This directory is an isolated motion design and video production project for **SignalPulse NG**.  
It does **not** introduce any dependencies or bundle size to the production Next.js application.

---

## Deliverables

| Deliverable | Resolution / Format | Duration | File Path |
| :--- | :--- | :--- | :--- |
| **Landscape Master** | 1920 × 1080 (16:9), H.264 MP4 | 36.00s (30 fps) | [`showcase-video/signalpulse-showcase-1080p.mp4`](file:///c:/Users/PC/Documents/signalpulse/showcase-video/signalpulse-showcase-1080p.mp4) |
| **Vertical Mobile (X / Social)** | 1080 × 1920 (9:16), H.264 MP4 | 36.00s (30 fps) | [`showcase-video/signalpulse-showcase-vertical.mp4`](file:///c:/Users/PC/Documents/signalpulse/showcase-video/signalpulse-showcase-vertical.mp4) |
| **Poster Thumbnail** | 1920 × 1080 PNG | Static Poster | [`showcase-video/signalpulse-thumbnail.png`](file:///c:/Users/PC/Documents/signalpulse/showcase-video/signalpulse-thumbnail.png) |
| **Source Captures** | High-DPI PNGs | 15 Frames | [`showcase-video/raw-captures/`](file:///c:/Users/PC/Documents/signalpulse/showcase-video/raw-captures) |

---

## Scene Timeline & Narrative Structure

```text
00:00 – 00:04 | Scene 1: Brand & Problem Statement
               - Animated typography: "Bad network?" -> "Keep a record."
               - Subtitle: "SignalPulse NG · Independent Connectivity Evidence"
               - Transition into authentic live SignalPulse homepage.

00:04 – 00:12 | Scene 2: Incident Reporting Workflow
               - Cursor glides to "Report a problem" and clicks.
               - Real form: Selects MTN, Area "Ikeja", Category "Paid but didn't get airtime or data".
               - Types: "Bought a data bundle but it wasn't credited."

00:12 – 00:19 | Scene 3: Saving & Local Device Confirmation
               - Clicks "Save report" -> instant confirmation toast appears.
               - Focuses on saved report: "Saved on this device" badge & Africa/Lagos timestamp.
               - Motion caption: "Saved on your device. Zero tracking."

00:19 – 00:27 | Scene 4: Complaint Evidence Dossier
               - Navigates to /evidence -> checks the saved MTN report (Selected: 1 of 20 max).
               - Explores customized factual complaint note.
               - Live preview of printable formal complaint summary.
               - Motion caption: "Everything in one place."

00:27 – 00:34 | Scene 5: Export & Escalation Preparation
               - Clicks "Download file (JSON)" -> genuine download confirmation toast.
               - Hovers "Print or save PDF" for ink-friendly submission to NCC / customer care.
               - Motion caption: "Ready when you need it."

00:34 – 00:36 | Scene 6: Outro & Open Source End Card
               - Studio presentation featuring desktop & mobile perspectives.
               - End card:
                 SignalPulse NG
                 Bad network? Keep a record.
                 Open source · Built for Nigeria
                 github.com/thewebguyy/signalpulse
```

---

## How to Re-Record or Re-Render

1. Ensure the local SignalPulse server is running on `http://127.0.0.1:3000`:
   ```bash
   npm run start
   ```

2. Capture raw browser workflows (uses headless Google Chrome):
   ```bash
   node showcase-video/record-flow.mjs
   ```

3. Render landscape, vertical, and thumbnail deliverables (uses `ffmpeg`):
   ```bash
   node showcase-video/render-video.mjs
   ```
