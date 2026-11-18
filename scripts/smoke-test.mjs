/* global fetch */
const baseUrl = process.argv[2] || process.env.PREVIEW_URL || "http://127.0.0.1:3000";
const normalizedBase = baseUrl.replace(/\/+$/, "");

console.log(`Starting SignalPulse NG deployment smoke test against: ${normalizedBase}\n`);

const routes = [
  {
    path: "/",
    expectedStatus: 200,
    requiredStrings: [
      "SignalPulse",
      "Bad network? Keep a record.",
      "Report a problem",
    ],
  },
  {
    path: "/report",
    expectedStatus: 200,
    requiredStrings: [
      "Bad network? Keep a record.",
      "Report a problem",
      "MTN",
      "Airtel",
      "Glo",
      "T2mobile",
      "Open source. Help us build it better.",
    ],
  },
  {
    path: "/report/mtn",
    expectedStatus: 200,
    requiredStrings: [
      "MTN Nigeria",
      "Bad network on MTN? Keep a record.",
      "Step 1 of 4",
    ],
  },
  {
    path: "/report/airtel",
    expectedStatus: 200,
    requiredStrings: [
      "Airtel Nigeria",
      "Bad network on Airtel? Keep a record.",
      "Step 1 of 4",
    ],
  },
  {
    path: "/report/glo",
    expectedStatus: 200,
    requiredStrings: [
      "Globacom",
      "Bad network on Globacom? Keep a record.",
      "Step 1 of 4",
    ],
  },
  {
    path: "/report/t2mobile",
    expectedStatus: 200,
    requiredStrings: [
      "T2mobile",
      "Bad network on T2mobile? Keep a record.",
      "Step 1 of 4",
    ],
  },
  {
    path: "/check",
    expectedStatus: 200,
    requiredStrings: [
      "Network Check",
      "Connection testing",
      "Report a network problem",
    ],
  },
  {
    path: "/incidents",
    expectedStatus: 200,
    requiredStrings: [
      "My Reports",
      "New report",
      "Save report",
    ],
  },
  {
    path: "/evidence",
    expectedStatus: 200,
    requiredStrings: [
      "Prepare a Complaint",
      "Download file (JSON)",
      "Your complaint summary",
    ],
  },
  {
    path: "/intelligence",
    expectedStatus: 200,
    requiredStrings: [
      "Network Insights",
      "Area insights aren",
    ],
  },
  {
    path: "/guidance",
    expectedStatus: 200,
    requiredStrings: [
      "Get Help",
      "622",
      "consumer.ncc.gov.ng",
      "96 hours",
      "30 days",
    ],
  },
  {
    path: "/non-existent-route-for-smoke-test-404",
    expectedStatus: 404,
    requiredStrings: ["404"],
  },
];

const forbiddenKeywords = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "postgres://",
  "data-telemetry-endpoint",
];

let failed = 0;

for (const route of routes) {
  const url = `${normalizedBase}${route.path}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "SignalPulse-SmokeTest/1.0",
      },
    });

    const statusMatch = res.status === route.expectedStatus;
    const body = await res.text();

    const missingStrings = route.requiredStrings.filter((s) => !body.includes(s));
    const leakedKeywords = forbiddenKeywords.filter((k) => body.includes(k));

    if (!statusMatch || missingStrings.length > 0 || leakedKeywords.length > 0) {
      console.error(`❌ [FAIL] ${route.path}`);
      if (!statusMatch) {
        console.error(`   Expected HTTP ${route.expectedStatus}, got ${res.status}`);
      }
      if (missingStrings.length > 0) {
        console.error(`   Missing required content: ${JSON.stringify(missingStrings)}`);
      }
      if (leakedKeywords.length > 0) {
        console.error(`   Leaked forbidden keywords: ${JSON.stringify(leakedKeywords)}`);
      }
      failed++;
    } else {
      console.log(`✅ [PASS] ${route.path} (HTTP ${res.status})`);
      const robots = res.headers.get("x-robots-tag");
      if (robots) {
        console.log(`   Headers: X-Robots-Tag: ${robots}`);
      }
    }
  } catch (err) {
    console.error(`❌ [ERROR] ${route.path} - Network error: ${err.message}`);
    failed++;
  }
}

console.log("\n------------------------------------------------------------");
if (failed > 0) {
  console.error(`Smoke test completed with ${failed} failure(s).`);
  process.exitCode = 1;
} else {
  console.log(`All ${routes.length} deployment smoke tests passed successfully.`);
}
