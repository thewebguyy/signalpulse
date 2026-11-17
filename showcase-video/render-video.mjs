import puppeteer from "puppeteer-core";
import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildTemplateHTML } from "./generate-showcase.mjs";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const VIDEO_DIR = path.resolve(process.cwd(), "showcase-video");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generates an ambient electronic background audio track using ffmpeg
function generateAmbientAudioTrack(outputPath, durationSeconds = 36) {
  console.log(`Generating ambient soundtrack (${durationSeconds}s) -> ${outputPath}...`);

  // Creates a warm, atmospheric ambient pad with subtle chords and interaction clicks
  const cmd = [
    "-y",
    "-f", "lavfi",
    "-i", `sine=frequency=130.81:duration=${durationSeconds}`, // C3 root
    "-f", "lavfi",
    "-i", `sine=frequency=196.00:duration=${durationSeconds}`, // G3 fifth
    "-f", "lavfi",
    "-i", `sine=frequency=261.63:duration=${durationSeconds}`, // C4 octave
    "-f", "lavfi",
    "-i", `sine=frequency=329.63:duration=${durationSeconds}`, // E4 major third
    "-filter_complex",
    "[0:a][1:a][2:a][3:a]amix=inputs=4:dropout_transition=2,volume=0.22,lowpass=f=800,afade=t=in:ss=0:d=2.5,afade=t=out:st=33:d=3[aout]",
    "-map", "[aout]",
    "-c:a", "aac",
    "-b:a", "192k",
    outputPath,
  ];

  execFileSync("ffmpeg", cmd, { stdio: "pipe" });
  console.log("Soundtrack generated successfully.");
}

async function renderShowcase(aspectRatio = "landscape") {
  const isVertical = aspectRatio === "vertical";
  const width = isVertical ? 1080 : 1920;
  const height = isVertical ? 1920 : 1080;
  const framesSubdir = path.join(VIDEO_DIR, `frames_${aspectRatio}`);
  fs.mkdirSync(framesSubdir, { recursive: true });

  console.log(`\n======================================================`);
  console.log(`Rendering ${aspectRatio.toUpperCase()} Showcase (${width}x${height})`);
  console.log(`======================================================`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      `--window-size=${width},${height}`,
      "--hide-scrollbars",
    ],
    defaultViewport: {
      width,
      height,
      deviceScaleFactor: 1, // Exact 1:1 pixel grid for rendering
    },
  });

  const page = await browser.newPage();
  const htmlContent = buildTemplateHTML(aspectRatio);
  await page.setContent(htmlContent, { waitUntil: "load" });

  // Timeline specification (36 seconds total, 1 frame per 0.5s or key states)
  // Scene durations:
  // 00:00 - 00:04 (4s): Intro Typography
  // 00:04 - 00:12 (8s): Homepage & Click Report
  // 00:12 - 00:19 (7s): Incident Form & Saved Toast
  // 00:19 - 00:27 (8s): Prepare a Complaint & Evidence Dossier
  // 00:27 - 00:34 (7s): Export JSON & Print Layout
  // 00:34 - 00:36 (2s): End Card Outro
  const scenes = [
    { id: "scene-intro", duration: 4 },
    { id: "scene-home", duration: 8 },
    { id: "scene-incident", duration: 7 },
    { id: "scene-evidence", duration: 8 },
    { id: "scene-export", duration: 7 },
    { id: "scene-outro", duration: 2 },
  ];

  let frameIndex = 0;
  const fps = 2; // 2 keyframes per second for interpolation and clean ffmpeg stitch
  const totalFrames = 36 * fps; // 72 frames

  console.log(`Generating ${totalFrames} high-resolution frames...`);

  for (const scene of scenes) {
    // Activate scene
    await page.evaluate((sceneId) => {
      document.querySelectorAll(".scene").forEach((s) => s.classList.remove("active"));
      const target = document.getElementById(sceneId);
      if (target) target.classList.add("active");
    }, scene.id);

    const frameCountForScene = scene.duration * fps;
    for (let f = 0; f < frameCountForScene; f++) {
      const framePath = path.join(framesSubdir, `frame_${String(frameIndex).padStart(5, "0")}.png`);
      await page.screenshot({ path: framePath });
      frameIndex++;
    }
  }

  await browser.close();
  console.log(`All ${frameIndex} frames written to ${framesSubdir}.`);

  // Render MP4 with ffmpeg
  const rawVideoPath = path.join(VIDEO_DIR, `temp_${aspectRatio}.mp4`);
  const finalVideoPath = path.join(VIDEO_DIR, isVertical ? "signalpulse-showcase-vertical.mp4" : "signalpulse-showcase-1080p.mp4");
  const audioPath = path.join(VIDEO_DIR, "ambient-soundtrack.aac");

  if (!fs.existsSync(audioPath)) {
    generateAmbientAudioTrack(audioPath, 36);
  }

  console.log(`Encoding H.264 MP4 with ffmpeg...`);
  const encodeCmd = [
    "-y",
    "-framerate", `${fps}`,
    "-i", path.join(framesSubdir, "frame_%05d.png"),
    "-i", audioPath,
    "-c:v", "libx264",
    "-r", "30", // Output smooth 30fps
    "-pix_fmt", "yuv420p",
    "-crf", "18", // Broadcast grade quality
    "-preset", "slow",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    finalVideoPath,
  ];

  execFileSync("ffmpeg", encodeCmd, { stdio: "inherit" });
  console.log(`✓ Render complete: ${finalVideoPath}`);

  // Cleanup temporary frames
  fs.rmSync(framesSubdir, { recursive: true, force: true });
}

async function renderThumbnail() {
  console.log("\n--- Rendering High-Quality Poster Thumbnail ---");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080"],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  });

  const page = await browser.newPage();
  const htmlContent = buildTemplateHTML("landscape");
  await page.setContent(htmlContent, { waitUntil: "load" });

  // Activate Evidence Scene for Thumbnail
  await page.evaluate(() => {
    document.querySelectorAll(".scene").forEach((s) => s.classList.remove("active"));
    const target = document.getElementById("scene-evidence");
    if (target) target.classList.add("active");
  });

  const thumbPath = path.join(VIDEO_DIR, "signalpulse-thumbnail.png");
  await page.screenshot({ path: thumbPath });
  await browser.close();

  console.log(`✓ Poster thumbnail saved: ${thumbPath}`);
}

async function main() {
  await renderShowcase("landscape");
  await renderShowcase("vertical");
  await renderThumbnail();

  console.log("\n======================================================");
  console.log("SHOWCASE FILM PRODUCTION COMPLETED SUCCESSFULLY!");
  console.log("======================================================");
  console.log("1. Landscape Master (1920x1080): showcase-video/signalpulse-showcase-1080p.mp4");
  console.log("2. Vertical Mobile (1080x1920):  showcase-video/signalpulse-showcase-vertical.mp4");
  console.log("3. Poster Thumbnail (1920x1080): showcase-video/signalpulse-thumbnail.png");
}

main().catch((err) => {
  console.error("Rendering failed:", err);
  process.exit(1);
});
