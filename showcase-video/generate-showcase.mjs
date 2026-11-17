import puppeteer from "puppeteer-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const VIDEO_DIR = path.resolve(process.cwd(), "showcase-video");
const FRAMES_DIR = path.join(VIDEO_DIR, "render-frames");

fs.mkdirSync(FRAMES_DIR, { recursive: true });

// Convert images to base64 data URIs for instantaneous, zero-latency local rendering
function getBase64Image(filename) {
  const filePath = path.join(VIDEO_DIR, "raw-captures", filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const ext = path.extname(filename).slice(1);
  const data = fs.readFileSync(filePath).toString("base64");
  return `data:image/${ext};base64,${data}`;
}

export function buildTemplateHTML(aspectRatio = "landscape") {
  const isVertical = aspectRatio === "vertical";
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;

  // Load all authentic raw browser captures
  const deskHome = getBase64Image("desk_01_home.png");
  const deskIncident = getBase64Image("desk_04_category_selected.png");
  const deskTyped = getBase64Image("desk_05_narrative_typed.png");
  const deskToast = getBase64Image("desk_06_report_saved_toast.png");
  const deskSaved = getBase64Image("desk_07_saved_record_card.png");
  const deskEvidence = getBase64Image("desk_09_evidence_selected.png");
  const deskPreview = getBase64Image("desk_10_evidence_preview.png");
  const deskExport = getBase64Image("desk_11_export_success.png");

  const mobHome = getBase64Image("mob_01_home.png");
  const mobIncidents = getBase64Image("mob_02_incidents.png");
  const mobToast = getBase64Image("mob_03_saved_toast.png");
  const mobEvidence = getBase64Image("mob_04_evidence.png");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  body {
    width: ${width}px;
    height: ${height}px;
    background: #090D16;
    color: #F8FAFC;
    overflow: hidden;
    position: relative;
  }

  /* Studio Background Grid */
  .studio-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 25%, #064E3B 0%, #0B1528 55%, #060911 100%);
    opacity: 0.95;
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: ${isVertical ? "40px 40px" : "60px 60px"};
    opacity: 0.6;
  }

  /* Glassmorphism Window Frame */
  .window-frame {
    position: absolute;
    border-radius: 14px;
    background: #FFFFFF;
    box-shadow: 0 25px 70px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15);
    overflow: hidden;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
  }
  .window-titlebar {
    height: 38px;
    background: #F1F5F9;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
  .dot-red { background: #EF4444; }
  .dot-amber { background: #F59E0B; }
  .dot-green { background: #10B981; }
  .url-bar {
    margin-left: 20px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 3px 14px;
    font-size: 11px;
    color: #475569;
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  /* Captions & Typography */
  .caption-badge {
    position: absolute;
    bottom: ${isVertical ? "110px" : "60px"};
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.88);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: ${isVertical ? "16px 28px" : "18px 36px"};
    border-radius: 9999px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    z-index: 100;
  }
  .caption-title {
    font-size: ${isVertical ? "24px" : "26px"};
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.5px;
  }
  .caption-title span { color: #34D399; }
  .caption-sub {
    font-size: ${isVertical ? "14px" : "14px"};
    font-weight: 500;
    color: #94A3B8;
    margin-top: 4px;
    letter-spacing: 0.2px;
  }

  /* Virtual Cursor */
  .virtual-cursor {
    position: absolute;
    width: 26px;
    height: 26px;
    z-index: 9999;
    pointer-events: none;
    transition: transform 0.1s ease;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
  }

  /* Scene Containers */
  .scene {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
  }
  .scene.active {
    opacity: 1;
    pointer-events: auto;
  }

  /* End Card Presentation */
  .endcard-content {
    text-align: center;
    z-index: 50;
  }
  .endcard-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: #064E3B;
    border: 1px solid rgba(52, 211, 153, 0.4);
    box-shadow: 0 10px 30px rgba(6, 78, 59, 0.6);
    margin-bottom: 24px;
  }
  .endcard-title {
    font-size: ${isVertical ? "48px" : "56px"};
    font-weight: 900;
    letter-spacing: -1.5px;
    color: #FFFFFF;
  }
  .endcard-tagline {
    font-size: ${isVertical ? "24px" : "28px"};
    font-weight: 600;
    color: #34D399;
    margin-top: 8px;
    letter-spacing: -0.3px;
  }
  .endcard-sub {
    font-size: ${isVertical ? "16px" : "18px"};
    color: #94A3B8;
    margin-top: 16px;
    font-weight: 400;
  }
  .endcard-link {
    display: inline-block;
    margin-top: 24px;
    font-size: ${isVertical ? "18px" : "20px"};
    font-weight: 700;
    color: #F8FAFC;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px 28px;
    border-radius: 12px;
  }
</style>
</head>
<body>
<div class="studio-bg"></div>
<div class="grid-pattern"></div>

<!-- SCENE 1: OPENING TYPOGRAPHY (0.0s - 4.0s) -->
<div id="scene-intro" class="scene active">
  <div style="text-align: center; max-width: 900px; padding: 20px;">
    <div style="display: inline-block; padding: 8px 18px; border-radius: 9999px; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(52, 211, 153, 0.3); color: #34D399; font-size: ${isVertical ? "15px" : "16px"}; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 24px;">
      SignalPulse NG · Nigeria
    </div>
    <h1 style="font-size: ${isVertical ? "56px" : "72px"}; font-weight: 900; line-height: 1.1; letter-spacing: -2px; color: #F8FAFC;">
      Bad network?
    </h1>
    <h2 style="font-size: ${isVertical ? "56px" : "72px"}; font-weight: 900; line-height: 1.1; letter-spacing: -2px; color: #34D399; margin-top: 10px;">
      Keep a record.
    </h2>
    <p style="font-size: ${isVertical ? "20px" : "22px"}; color: #94A3B8; margin-top: 24px; font-weight: 400; line-height: 1.5;">
      Independent mobile connectivity evidence.<br>Document service failures. Escalate to the NCC.
    </p>
  </div>
</div>

<!-- SCENE 2: REAL HOMEPAGE & REPORT CLICK (4.0s - 12.0s) -->
<div id="scene-home" class="scene">
  <div class="window-frame" style="width: ${isVertical ? "980px" : "1540px"}; height: ${isVertical ? "1300px" : "880px"}; top: ${isVertical ? "160px" : "70px"};">
    <div class="window-titlebar">
      <span class="dot dot-red"></span><span class="dot dot-amber"></span><span class="dot dot-green"></span>
      <span class="url-bar">https://signalpulse-nine.vercel.app/</span>
    </div>
    <div style="width: 100%; height: calc(100% - 38px); overflow: hidden; position: relative;">
      <img id="img-home" src="${deskHome}" style="width: 100%; height: auto; display: block;" alt="SignalPulse Home" />
    </div>
  </div>
  <div class="caption-badge">
    <div class="caption-title">From <span>Problem</span> to <span>Proof</span></div>
    <div class="caption-sub">Direct access · No signup or password needed</div>
  </div>
</div>

<!-- SCENE 3: INCIDENT FORM & SAVING (12.0s - 19.0s) -->
<div id="scene-incident" class="scene">
  <div class="window-frame" style="width: ${isVertical ? "980px" : "1540px"}; height: ${isVertical ? "1300px" : "880px"}; top: ${isVertical ? "160px" : "70px"};">
    <div class="window-titlebar">
      <span class="dot dot-red"></span><span class="dot dot-amber"></span><span class="dot dot-green"></span>
      <span class="url-bar">https://signalpulse-nine.vercel.app/incidents</span>
    </div>
    <div style="width: 100%; height: calc(100% - 38px); overflow: hidden; position: relative;">
      <img id="img-incident" src="${deskToast}" style="width: 100%; height: auto; display: block;" alt="SignalPulse Incidents" />
    </div>
  </div>
  <div class="caption-badge">
    <div class="caption-title"><span>Saved on your device</span></div>
    <div class="caption-sub">Stored locally in your browser · Zero personal tracking</div>
  </div>
</div>

<!-- SCENE 4: PREPARE A COMPLAINT & EVIDENCE (19.0s - 27.0s) -->
<div id="scene-evidence" class="scene">
  <div class="window-frame" style="width: ${isVertical ? "980px" : "1540px"}; height: ${isVertical ? "1300px" : "880px"}; top: ${isVertical ? "160px" : "70px"};">
    <div class="window-titlebar">
      <span class="dot dot-red"></span><span class="dot dot-amber"></span><span class="dot dot-green"></span>
      <span class="url-bar">https://signalpulse-nine.vercel.app/evidence</span>
    </div>
    <div style="width: 100%; height: calc(100% - 38px); overflow: hidden; position: relative;">
      <img id="img-evidence" src="${deskEvidence}" style="width: 100%; height: auto; display: block;" alt="SignalPulse Evidence" />
    </div>
  </div>
  <div class="caption-badge">
    <div class="caption-title"><span>Everything in one place</span></div>
    <div class="caption-sub">Assemble up to 20 incidents into a single dispute dossier</div>
  </div>
</div>

<!-- SCENE 5: EXPORT & RESOLUTION (27.0s - 34.0s) -->
<div id="scene-export" class="scene">
  <div class="window-frame" style="width: ${isVertical ? "980px" : "1540px"}; height: ${isVertical ? "1300px" : "880px"}; top: ${isVertical ? "160px" : "70px"};">
    <div class="window-titlebar">
      <span class="dot dot-red"></span><span class="dot dot-amber"></span><span class="dot dot-green"></span>
      <span class="url-bar">https://signalpulse-nine.vercel.app/evidence</span>
    </div>
    <div style="width: 100%; height: calc(100% - 38px); overflow: hidden; position: relative;">
      <img id="img-export" src="${deskExport}" style="width: 100%; height: auto; display: block;" alt="Export Evidence" />
    </div>
  </div>
  <div class="caption-badge">
    <div class="caption-title"><span>Ready when you need it</span></div>
    <div class="caption-sub">Standard JSON export and ink-friendly PDF for NCC escalation</div>
  </div>
</div>

<!-- SCENE 6: MULTI-DEVICE OUTRO & END CARD (34.0s - 40.0s) -->
<div id="scene-outro" class="scene">
  <div class="endcard-content">
    <div class="endcard-logo">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V4"/><path d="M22 20v-2"/>
      </svg>
    </div>
    <h1 class="endcard-title">SignalPulse NG</h1>
    <h2 class="endcard-tagline">Bad network? Keep a record.</h2>
    <p class="endcard-sub">
      Independent Consumer Evidence Platform · Built for Nigeria
    </p>
    <div class="endcard-link">
      github.com/thewebguyy/signalpulse
    </div>
  </div>
</div>

</body>
</html>`;
}
