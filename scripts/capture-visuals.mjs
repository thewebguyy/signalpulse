import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const chromePath = chromeCandidates.find((p) => fs.existsSync(p));
if (!chromePath) {
  console.error("Chrome executable not found.");
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), "docs/frontend/screenshots/v3");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const viewports = [
  { name: "320px-mobile-min", size: "320,640" },
  { name: "375px-mobile-std", size: "375,667" },
  { name: "430px-mobile-lrg", size: "430,932" },
  { name: "768px-tablet", size: "768,1024" },
  { name: "1280px-desktop", size: "1280,800" },
  { name: "1440px-wide", size: "1440,900" },
];

const routes = [
  { name: "home", path: "" },
  { name: "check", path: "check" },
  { name: "incidents", path: "incidents" },
  { name: "evidence", path: "evidence" },
  { name: "intelligence", path: "intelligence" },
  { name: "guidance", path: "guidance" },
];

console.log(`Starting headless Chrome capture using ${chromePath}...`);

for (const vp of viewports) {
  for (const r of routes) {
    const outFile = path.join(targetDir, `${r.name}-${vp.name}.png`);
    const url = `http://127.0.0.1:3000/${r.path}`;
    const args = [
      "--headless=new",
      `--screenshot=${outFile}`,
      `--window-size=${vp.size}`,
      "--force-device-scale-factor=1",
      "--hide-scrollbars",
      "--disable-gpu",
      url,
    ];

    try {
      execFileSync(chromePath, args, { stdio: "ignore", timeout: 15000 });
      if (fs.existsSync(outFile)) {
        const stats = fs.statSync(outFile);
        console.log(`✓ [${vp.name}] ${r.name} -> ${outFile} (${stats.size} bytes)`);
      } else {
        console.warn(`✗ [${vp.name}] ${r.name} -> File not created`);
      }
    } catch (err) {
      console.error(`✗ Error capturing ${r.name} at ${vp.name}:`, err.message);
    }
  }
}

console.log("Screenshot capture complete.");
