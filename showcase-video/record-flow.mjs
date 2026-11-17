import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://127.0.0.1:3000";

const OUT_DIR = path.resolve(process.cwd(), "showcase-video", "raw-captures");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Injects custom cursor and ripple effect into page
async function injectVirtualCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById("sp-virtual-cursor")) return;

    const cursor = document.createElement("div");
    cursor.id = "sp-virtual-cursor";
    cursor.style.position = "fixed";
    cursor.style.top = "0px";
    cursor.style.left = "0px";
    cursor.style.width = "24px";
    cursor.style.height = "24px";
    cursor.style.zIndex = "9999999";
    cursor.style.pointerEvents = "none";
    cursor.style.transform = "translate(-2px, -2px)";
    cursor.style.transition = "transform 0.05s ease-out";

    // Sleek macOS/modern cursor SVG
    cursor.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,0.35));">
        <path d="M5.5 3.2L18.8 12.8C19.7 13.5 19.3 15 18.2 15.1L12.9 15.5L9.9 20.8C9.4 21.7 8.1 21.9 7.3 21.2L6.1 20.2C5.3 19.5 5.2 18.2 5.9 17.4L8.9 12.2L4.2 9.9C3.1 9.4 3 7.8 4 7.1L5.5 3.2Z" fill="#064E3B" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>
      <div id="sp-click-ripple" style="position: absolute; top: 0; left: 0; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid #064E3B; opacity: 0; transform: scale(0.5); pointer-events: none;"></div>
    `;
    document.body.appendChild(cursor);

    window.__moveVirtualCursor = (x, y) => {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    };

    window.__triggerVirtualClick = () => {
      const ripple = document.getElementById("sp-click-ripple");
      if (!ripple) return;
      ripple.style.transition = "none";
      ripple.style.opacity = "1";
      ripple.style.transform = "scale(0.5)";
      void ripple.offsetWidth;
      ripple.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      ripple.style.opacity = "0";
      ripple.style.transform = "scale(2.2)";
    };
  });
}

async function moveCursorSmooth(page, from, to, steps = 18) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // Ease-out cubic
    const ease = 1 - Math.pow(1 - t, 3);
    const x = from.x + (to.x - from.x) * ease;
    const y = from.y + (to.y - from.y) * ease;
    await page.evaluate((cx, cy) => window.__moveVirtualCursor(cx, cy), x, y);
    await sleep(15);
  }
}

async function clickAt(page, selector, currentPos) {
  const el = await page.$(selector);
  if (!el) throw new Error(`Selector not found: ${selector}`);
  const box = await el.boundingBox();
  if (!box) throw new Error(`Box not found for: ${selector}`);

  const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await moveCursorSmooth(page, currentPos, target);
  await page.evaluate(() => window.__triggerVirtualClick());
  await el.click();
  await sleep(150);
  return target;
}

export async function recordDesktopWorkflow() {
  console.log("\n--- Starting Desktop 1920x1080 Workflow Capture ---");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
      "--hide-scrollbars",
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // 2x crisp Retina DPR
    },
  });

  const page = await browser.newPage();
  let cursorPos = { x: 1200, y: 150 };

  // 1. HOME SCREEN
  console.log("Capturing 01_home...");
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
  await injectVirtualCursor(page);
  await page.evaluate((x, y) => window.__moveVirtualCursor(x, y), cursorPos.x, cursorPos.y);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_01_home.png") });

  // Hover towards Report a Problem
  cursorPos = await clickAt(page, "a[href='/incidents']", cursorPos);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_02_click_report.png") });

  // 2. INCIDENTS PAGE
  console.log("Capturing 03_incident_form...");
  await page.waitForSelector("#inc-op-mtn");
  await injectVirtualCursor(page);
  await page.evaluate((x, y) => window.__moveVirtualCursor(x, y), cursorPos.x, cursorPos.y);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_03_incident_page.png") });

  // Click MTN (already default, but explicitly click to highlight)
  cursorPos = await clickAt(page, "label[for='inc-op-mtn']", cursorPos);
  await sleep(200);

  // Select Problem Category: Paid but didn't get airtime or data
  console.log("Selecting incident category...");
  cursorPos = await clickAt(page, "input[value='failed_airtime_data_purchase']", cursorPos);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_04_category_selected.png") });

  // Type Narrative Description
  console.log("Typing incident narrative...");
  const textarea = await page.$("#narrative");
  const box = await textarea.boundingBox();
  cursorPos = { x: box.x + 80, y: box.y + 30 };
  await moveCursorSmooth(page, cursorPos, cursorPos, 5);
  await textarea.click();

  const textToType = "Bought a data bundle but it wasn't credited.";
  await textarea.type(textToType, { delay: 35 });
  await page.screenshot({ path: path.join(OUT_DIR, "desk_05_narrative_typed.png") });

  // Click Save Report
  console.log("Saving report...");
  cursorPos = await clickAt(page, "button[type='submit']", cursorPos);
  await sleep(500); // Allow toast and store update to render
  await injectVirtualCursor(page);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_06_report_saved_toast.png") });

  // Scroll to saved reports list
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await sleep(400);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_07_saved_record_card.png") });

  // 3. PREPARE A COMPLAINT
  console.log("Navigating to Evidence...");
  cursorPos = await clickAt(page, "a[href='/evidence']", cursorPos);
  await page.waitForSelector("#records-title");
  await injectVirtualCursor(page);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_08_evidence_page.png") });

  // Check the incident in the list
  console.log("Selecting incident in evidence builder...");
  const checkbox = await page.$("input[type='checkbox']");
  if (checkbox) {
    const cbox = await checkbox.boundingBox();
    cursorPos = { x: cbox.x + cbox.width / 2, y: cbox.y + cbox.height / 2 };
    await moveCursorSmooth(page, cursorPos, cursorPos, 5);
    await page.evaluate(() => window.__triggerVirtualClick());
    await checkbox.click();
    await sleep(300);
  }
  await page.screenshot({ path: path.join(OUT_DIR, "desk_09_evidence_selected.png") });

  // Scroll to preview summary
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: "smooth" }));
  await sleep(300);
  await page.screenshot({ path: path.join(OUT_DIR, "desk_10_evidence_preview.png") });

  // Click Download JSON
  console.log("Triggering Export JSON...");
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes("Download file (JSON)")) {
      const bBox = await btn.boundingBox();
      if (bBox) {
        cursorPos = { x: bBox.x + bBox.width / 2, y: bBox.y + bBox.height / 2 };
        await moveCursorSmooth(page, cursorPos, cursorPos, 5);
        await page.evaluate(() => window.__triggerVirtualClick());
        await btn.click();
        await sleep(500);
      }
      break;
    }
  }
  await page.screenshot({ path: path.join(OUT_DIR, "desk_11_export_success.png") });

  await browser.close();
  console.log("Desktop workflow captured successfully.\n");
}

export async function recordMobileWorkflow() {
  console.log("--- Starting Mobile 430x932 Workflow Capture ---");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=430,932",
      "--hide-scrollbars",
    ],
    defaultViewport: {
      width: 430,
      height: 932,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  });

  const page = await browser.newPage();

  // 1. Mobile Home
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(OUT_DIR, "mob_01_home.png") });

  // 2. Mobile Incidents Form
  await page.goto(`${BASE_URL}/incidents`, { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(OUT_DIR, "mob_02_incidents.png") });

  // Select category & type
  await page.click("input[value='failed_airtime_data_purchase']");
  const textarea = await page.$("#narrative");
  await textarea.type("Bought a data bundle but it wasn't credited.", { delay: 20 });
  await page.click("button[type='submit']");
  await sleep(500);
  await page.screenshot({ path: path.join(OUT_DIR, "mob_03_saved_toast.png") });

  // 3. Mobile Evidence
  await page.goto(`${BASE_URL}/evidence`, { waitUntil: "networkidle0" });
  const checkbox = await page.$("input[type='checkbox']");
  if (checkbox) await checkbox.click();
  await sleep(300);
  await page.screenshot({ path: path.join(OUT_DIR, "mob_04_evidence.png") });

  await browser.close();
  console.log("Mobile workflow captured successfully.\n");
}

async function main() {
  await recordDesktopWorkflow();
  await recordMobileWorkflow();
  console.log("All raw captures saved in:", OUT_DIR);
}

main().catch((err) => {
  console.error("Recording error:", err);
  process.exit(1);
});
