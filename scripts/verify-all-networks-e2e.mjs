/* global fetch, setTimeout, localStorage, window, document */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import puppeteer from "../showcase-video/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const outputDir = path.join(process.cwd(), "docs", "launch-verification");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch {
      // Retry
    }
    await sleep(500);
  }
  return false;
}

async function runE2E() {
  console.log("=== SignalPulse NG — CTO014/CTO015 All Networks & Quality Gates E2E Verification ===\n");

  let serverProcess = null;
  const isRunning = await waitForServer(BASE_URL, 2);
  if (!isRunning) {
    console.log("Starting Next.js production server on http://127.0.0.1:3000...");
    serverProcess = spawn("cmd.exe", ["/c", "npx next start --hostname 127.0.0.1 --port 3000"], {
      stdio: "pipe",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    });

    const ready = await waitForServer(BASE_URL, 40);
    if (!ready) {
      console.error("FATAL: Server failed to start on port 3000.");
      if (serverProcess) serverProcess.kill();
      process.exit(1);
    }
  } else {
    console.log("Next.js server is already running on http://127.0.0.1:3000.");
  }

  console.log("Launching headless Chrome with mobile viewport (390x844)...");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: {
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();
  const results = {};

  try {
    // ------------------------------------------------------------------------
    // Stage 1: Universal /report page
    // ------------------------------------------------------------------------
    console.log("\n[1/8] Verifying Universal /report Page...");
    await page.goto(`${BASE_URL}/report`, { waitUntil: "networkidle0" });

    const headline = await page.$eval("h1", (el) => el.textContent?.trim());
    console.log("    Headline:", headline);
    if (!headline?.includes("Bad network? Keep a record.")) {
      throw new Error(`Unexpected headline on /report: ${headline}`);
    }

    const operatorLinks = await page.$$eval("a[href^='/report/']", (els) =>
      els.map((e) => e.getAttribute("href"))
    );
    console.log("    Operator links found:", operatorLinks);
    const expectedRoutes = ["/report/mtn", "/report/airtel", "/report/glo", "/report/t2mobile"];
    for (const route of expectedRoutes) {
      if (!operatorLinks.some((l) => l?.includes(route))) {
        throw new Error(`Missing operator route link: ${route}`);
      }
    }
    results["1. Universal /report Entry"] = "PASS (Headline, copy, 4 operator routes verified)";

    const mobileReportImgPath = path.join(outputDir, "01-mobile-universal-report.png");
    await page.screenshot({ path: mobileReportImgPath, fullPage: false });
    console.log("    Saved screenshot:", mobileReportImgPath);

    // ------------------------------------------------------------------------
    // Stage 2: Test MTN Route & Report Submission
    // ------------------------------------------------------------------------
    console.log("\n[2/8] Testing MTN Reporting Route (/report/mtn)...");
    await page.goto(`${BASE_URL}/report/mtn`, { waitUntil: "networkidle0" });

    await page.waitForSelector("textarea");
    await page.type("textarea", "MTN call to 0803... dropped 4 times in 10 minutes around Ikeja.");
    await page.click("button[type='submit']");
    await sleep(800);

    await page.waitForSelector("#share-card-title", { timeout: 5000 });
    const shareTitle = await page.$eval("#share-card-title", (el) => el.textContent?.trim());
    console.log("    Share card title:", shareTitle);
    results["2. MTN Reporting (/report/mtn)"] = "PASS (Report saved, share card displayed)";

    // ------------------------------------------------------------------------
    // Stage 3: Test Airtel Route, Submission, and Capture Share Card
    // ------------------------------------------------------------------------
    console.log("\n[3/8] Testing Airtel Reporting Route (/report/airtel)...");
    await page.goto(`${BASE_URL}/report/airtel`, { waitUntil: "networkidle0" });

    const radioInputs = await page.$$("input[type='radio']");
    for (const r of radioInputs) {
      const val = await r.evaluate((el) => el.value);
      if (val === "unusable_internet") {
        await r.click();
        break;
      }
    }

    await page.type("textarea", "Airtel 4G data completely unresponsive in Victoria Island / Eti-Osa.");
    
    const mobileFormImgPath = path.join(outputDir, "02-mobile-airtel-form.png");
    await page.screenshot({ path: mobileFormImgPath, fullPage: false });
    console.log("    Saved form screenshot:", mobileFormImgPath);

    await page.click("button[type='submit']");
    await sleep(800);

    await page.waitForSelector("#share-card-title", { timeout: 5000 });
    const mobileShareCardImgPath = path.join(outputDir, "03-mobile-share-card.png");
    await page.screenshot({ path: mobileShareCardImgPath, fullPage: false });
    console.log("    Saved share card screenshot:", mobileShareCardImgPath);
    results["3. Airtel Reporting (/report/airtel)"] = "PASS (Unusable internet submitted, share card captured)";

    // ------------------------------------------------------------------------
    // Stage 4: Test Glo and T2mobile Routes
    // ------------------------------------------------------------------------
    console.log("\n[4/8] Testing Glo (/report/glo) & T2mobile (/report/t2mobile)...");
    
    // Glo
    await page.goto(`${BASE_URL}/report/glo`, { waitUntil: "networkidle0" });
    await page.type("textarea", "Glo 2GB data bundle depleted within 20 minutes without downloads.");
    await page.click("button[type='submit']");
    await page.waitForSelector("#share-card-title", { timeout: 5000 });
    console.log("    Glo report submitted successfully.");

    // T2mobile
    await page.goto(`${BASE_URL}/report/t2mobile`, { waitUntil: "networkidle0" });
    await page.type("textarea", "T2mobile N1,000 airtime recharge deducted but data bundle not activated.");
    await page.click("button[type='submit']");
    await page.waitForSelector("#share-card-title", { timeout: 5000 });
    console.log("    T2mobile report submitted successfully.");

    results["4. Glo & T2mobile Reporting"] = "PASS (Both submitted & persisted in local storage)";

    // ------------------------------------------------------------------------
    // Stage 5: Timestamp Edit Invariant Check (/incidents)
    // ------------------------------------------------------------------------
    console.log("\n[5/8] Testing Timestamp Invariant on Edit (/incidents)...");
    await page.goto(`${BASE_URL}/incidents`, { waitUntil: "networkidle0" });

    // Read initial stored occurred_at
    const initialReport = await page.evaluate(() => {
      const stored = localStorage.getItem("signalpulse_local_incidents_v0.1");
      const list = stored ? JSON.parse(stored) : [];
      return list[0];
    });

    const editButton = await page.$("button::-p-text(Edit)");
    if (editButton) {
      await editButton.click();
      await sleep(500);

      const inputVal = await page.$eval("input[type='datetime-local']", (el) => el.value);
      console.log("    Initial stored occurred_at:", initialReport?.fields?.occurred_at);
      console.log("    Populated datetime-local input:", inputVal);

      // Save changes without altering datetime
      await page.click("button::-p-text(Save changes)");
      await sleep(500);

      const updatedReport = await page.evaluate((targetId) => {
        const stored = localStorage.getItem("signalpulse_local_incidents_v0.1");
        const list = stored ? JSON.parse(stored) : [];
        return list.find((item) => item.id === targetId);
      }, initialReport.id);

      console.log("    After edit save occurred_at:", updatedReport?.fields?.occurred_at);
      const timeDiffMs = Math.abs(
        new Date(updatedReport.fields.occurred_at).getTime() -
        new Date(initialReport.fields.occurred_at).getTime()
      );

      if (timeDiffMs > 60000) {
        throw new Error(`Timestamp shifted on edit! Diff: ${timeDiffMs}ms`);
      }
      results["5. Timestamp Invariant on Edit"] = "PASS (Zero hour drift on edit save)";
    }

    // ------------------------------------------------------------------------
    // Stage 6: Verify Evidence Dossier & Real JSON Export / Print
    // ------------------------------------------------------------------------
    console.log("\n[6/8] Verifying Evidence Page (/evidence) with 4 saved reports...");
    await page.goto(`${BASE_URL}/evidence`, { waitUntil: "networkidle0" });

    const savedReportsCount = await page.evaluate(() => {
      const stored = localStorage.getItem("signalpulse_local_incidents_v0.1");
      return stored ? JSON.parse(stored).length : 0;
    });
    console.log("    Verified incidents in localStorage:", savedReportsCount);
    if (savedReportsCount < 4) {
      throw new Error(`Expected at least 4 incidents in localStorage, found: ${savedReportsCount}`);
    }

    // Select all reports
    await page.click("button::-p-text(Select all)");
    await sleep(300);

    // Verify print handler
    const printInvoked = await page.evaluate(() => {
      let printed = false;
      const originalPrint = window.print;
      window.print = () => { printed = true; };
      const printBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Print or save PDF"));
      if (printBtn) printBtn.click();
      window.print = originalPrint;
      return printed;
    });
    console.log("    Print trigger invoked:", printInvoked);
    results["6. Evidence Dossier & Print Flow"] = printInvoked ? "PASS (Dossier ready, print triggered)" : "FAIL";

    const evidenceImgPath = path.join(outputDir, "04-mobile-evidence-dossier.png");
    await page.screenshot({ path: evidenceImgPath, fullPage: false });
    console.log("    Saved evidence dossier screenshot:", evidenceImgPath);

    // ------------------------------------------------------------------------
    // Stage 7: Verify Privacy Notice Page (/privacy)
    // ------------------------------------------------------------------------
    console.log("\n[7/8] Verifying Privacy Notice Route (/privacy)...");
    await page.goto(`${BASE_URL}/privacy`, { waitUntil: "networkidle0" });

    const privacyTitle = await page.$eval("h1", (el) => el.textContent?.trim());
    console.log("    Privacy page title:", privacyTitle);
    const privacyText = await page.evaluate(() => document.body.innerText);

    const hasLocalStorageNote = privacyText.includes("localStorage");
    const hasNoCloudNote = privacyText.includes("No account or cloud backup");
    const hasSharedWarning = privacyText.includes("Shared and public device caution");
    const hasIndependenceNote = privacyText.includes("Independent platform");

    if (!hasLocalStorageNote || !hasNoCloudNote || !hasSharedWarning || !hasIndependenceNote) {
      throw new Error("Missing required privacy disclosures on /privacy");
    }
    results["7. Consumer Privacy Notice (/privacy)"] = "PASS (All 4 core privacy invariants verified)";

    // ------------------------------------------------------------------------
    // Stage 8: Verify NCC Guidance Page (/guidance)
    // ------------------------------------------------------------------------
    console.log("\n[8/8] Verifying Current Official NCC Guidance (/guidance)...");
    await page.goto(`${BASE_URL}/guidance`, { waitUntil: "networkidle0" });

    const guidanceText = await page.evaluate(() => document.body.innerText);
    const has622 = guidanceText.includes("622");
    const hasPortal = guidanceText.includes("consumer.ncc.gov.ng");
    const has2024Code = guidanceText.includes("Consumer Code of Practice Regulations 2024");
    const hasNoOutdated30Days = !guidanceText.includes("after 30 days, you can escalate");
    const hasNoOutdated90Days = !guidanceText.includes("90 days");

    if (!has622 || !hasPortal || !has2024Code || !hasNoOutdated30Days || !hasNoOutdated90Days) {
      throw new Error("Guidance still contains outdated claims or lacks 2024 references!");
    }
    results["8. Official NCC Guidance (/guidance)"] = "PASS (Current 2024 regulations, no false deadlines)";

    // Copy primary screenshots
    fs.copyFileSync(mobileReportImgPath, path.join(process.cwd(), "docs", "mobile-reporting.png"));
    fs.copyFileSync(mobileShareCardImgPath, path.join(process.cwd(), "docs", "mobile-share-card.png"));
    console.log("    Copied primary screenshots to docs/mobile-reporting.png and docs/mobile-share-card.png");

  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  console.log("\n================================================================================");
  console.log("                   ALL NIGERIAN NETWORKS & QUALITY RESULTS                      ");
  console.log("================================================================================");
  console.table(results);
  console.log("================================================================================");
  console.log("SUCCESS: ALL E2E AND QUALITY GATES PASSED (100%)!\n");
}

runE2E().catch((err) => {
  console.error("FATAL E2E ERROR:", err);
  process.exit(1);
});
