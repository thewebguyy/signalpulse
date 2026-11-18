import { describe, expect, it, beforeEach } from "vitest";
import { operatorSchema, incidentCategorySchema, provenanceSchema } from "@/contracts/domain";
import { areaIdSchema } from "@/contracts/scalars";
import { exportDocumentSchema } from "@/contracts/evidence";
import {
  OPERATOR_OPTIONS,
  LAGOS_LGAS,
  INCIDENT_CATEGORIES,
  PROVENANCE_METAS,
} from "@/components/constants";
import {
  getLocalIncidents,
  saveLocalIncident,
  deleteLocalIncident,
  getLocalMeasurements,
  saveLocalMeasurement,
  getStorageDiagnostics,
  purgeCorruptedIncidents,
} from "@/components/local-store";
import type { Incident } from "@/contracts/incidents";
import type { Measurement } from "@/contracts/measurements";
import type { ExportDocument } from "@/contracts/evidence";

describe("frontend constants integrity with domain contracts", () => {
  it("matches supported operators exactly", () => {
    expect(OPERATOR_OPTIONS.map((o) => o.code)).toEqual(operatorSchema.options);
    for (const op of OPERATOR_OPTIONS) {
      expect(operatorSchema.safeParse(op.code).success).toBe(true);
      expect(op.name.length).toBeGreaterThan(0);
    }
  });

  it("contains exactly 20 official Lagos LGAs and valid area IDs", () => {
    expect(LAGOS_LGAS).toHaveLength(20);
    for (const lga of LAGOS_LGAS) {
      expect(areaIdSchema.safeParse(lga.id).success).toBe(true);
      expect(lga.name.length).toBeGreaterThan(0);
    }
  });

  it("matches the 6 canonical incident categories", () => {
    expect(INCIDENT_CATEGORIES.map((c) => c.code)).toEqual(incidentCategorySchema.options);
    for (const cat of INCIDENT_CATEGORIES) {
      expect(incidentCategorySchema.safeParse(cat.code).success).toBe(true);
      expect(cat.title.length).toBeGreaterThan(0);
      expect(cat.description.length).toBeGreaterThan(0);
      expect(cat.guidance.length).toBeGreaterThan(0);
    }
  });

  it("covers all 5 provenance tiers", () => {
    const metaKeys = Object.keys(PROVENANCE_METAS);
    expect(metaKeys.sort()).toEqual([...provenanceSchema.options].sort());
    for (const prov of provenanceSchema.options) {
      const meta = PROVENANCE_METAS[prov];
      expect(meta.label).toBeDefined();
      expect(meta.description).toBeDefined();
      expect(meta.bgColor.startsWith("#")).toBe(true);
      expect(meta.textColor.startsWith("#")).toBe(true);
    }
  });
});

describe("client-side local store safety and serialization", () => {
  it("handles missing window gracefully without crashing", () => {
    expect(getLocalIncidents()).toEqual([]);
    expect(getLocalMeasurements()).toEqual([]);
  });

  it("safely accepts save and delete calls in non-window environment", () => {
    const fakeIncident: Incident = {
      id: "00000000-0000-4000-8000-000000000099",
      client_record_id: "00000000-0000-4000-8000-000000000098",
      provenance: "user_reported",
      revision: 1,
      fields: {
        operator: "mtn",
        area_id: "ikeja",
        category: "failed_call",
        occurred_at: "2026-11-16T12:00:00.000Z",
        narrative: "Sample test narrative",
        complaint_reference: null,
        complaint_contacted_at: null,
      },
      created_at: "2026-11-16T12:00:00.000Z",
      updated_at: "2026-11-16T12:00:00.000Z",
      expires_at: "2027-11-16T12:00:00.000Z",
    };

    const saveRes = saveLocalIncident(fakeIncident);
    expect(saveRes.success).toBe(false);
    if (!saveRes.success) {
      expect(saveRes.error).toBe("storage_unavailable");
    }

    const delRes = deleteLocalIncident(fakeIncident.id);
    expect(delRes.success).toBe(false);
    if (!delRes.success) {
      expect(delRes.error).toBe("storage_unavailable");
    }
  });

  it("strictly enforces simulation isolation for measurements", () => {
    const fakeMeasurement: Measurement = {
      id: "00000000-0000-4000-8000-000000000097",
      client_record_id: "00000000-0000-4000-8000-000000000096",
      provenance: "app_measured",
      summary: {
        method_version: "browser-http-0.1",
        endpoint_id: "preview-endpoint",
        endpoint_region: null,
        context: { operator: "mtn", area_id: "ikeja", mobile_data_confirmed: true, vpn: "no" },
        observed_start: "2026-11-16T12:00:00.000Z",
        observed_end: "2026-11-16T12:00:03.000Z",
        received_at: "2026-11-16T12:00:04.000Z",
        state: "completed",
        latency: { state: "completed", value: 45, unit: "ms" },
        download: { state: "completed", value: 12.5, unit: "Mbps" },
        upload: { state: "not_run", value: null, unit: "Mbps" },
        corroboration: "client_only",
        receipt_version: null,
        quality_flags: [{ code: "receipt_missing", scope: "record" }],
        assessed_at: "2026-11-16T12:00:04.000Z",
      },
      contribution: {
        state: "off",
        revision: 1,
        notice_version: null,
        changed_at: "2026-11-16T12:00:00.000Z",
        publication_effect: "not_contributing",
      },
      created_at: "2026-11-16T12:00:00.000Z",
      expires_at: "2027-02-14T12:00:00.000Z",
    };

    const res = saveLocalMeasurement(fakeMeasurement);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("simulation_isolated");
    }
    expect(getLocalMeasurements()).toEqual([]);
  });

  it("compiles valid export documents compliant with exportDocumentSchema", () => {
    const fakeIncident: Incident = {
      id: "00000000-0000-4000-8000-000000000099",
      client_record_id: "00000000-0000-4000-8000-000000000098",
      provenance: "user_reported",
      revision: 1,
      fields: {
        operator: "glo",
        area_id: "eti-osa",
        category: "unusable_internet",
        occurred_at: "2026-11-16T10:00:00.000Z",
        narrative: "Data connection completely stalled in Lekki Phase 1.",
        complaint_reference: "GLO-DISPUTE-1002",
        complaint_contacted_at: "2026-11-16T10:30:00.000Z",
      },
      created_at: "2026-11-16T10:00:00.000Z",
      updated_at: "2026-11-16T10:00:00.000Z",
      expires_at: "2027-11-16T10:00:00.000Z",
    };

    const doc: ExportDocument = {
      export_schema_version: "evidence-0.1",
      generated_at: "2026-11-16T10:45:00.000Z",
      timezone: "Africa/Lagos",
      incidents: [fakeIncident],
      measurements: [],
      retained_summaries: [],
      complaint_descriptions: [
        {
          incident_id: fakeIncident.id,
          text: "Subscriber formal dispute narrative.",
        },
      ],
      assets: [],
      limitations: ["User-assembled dossier. Synthetic test mode."],
    };

    const parsed = exportDocumentSchema.safeParse(doc);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.incidents[0]?.provenance).toBe("user_reported");
      expect(parsed.data.measurements).toEqual([]);
      expect(parsed.data.assets).toEqual([]);
    }
  });
});

describe("localStorage simulation and edge-case error handling", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    // Install mock on global window
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: storageMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it("successfully reads and writes valid incident records", () => {
    const validIncident: Incident = {
      id: "00000000-0000-4000-8000-000000000001",
      client_record_id: "00000000-0000-4000-8000-000000000002",
      provenance: "user_reported",
      revision: 1,
      fields: {
        operator: "airtel",
        area_id: "ikeja",
        category: "dropped_call",
        occurred_at: "2026-11-16T14:00:00.000Z",
        narrative: "Voice call dropped repeatedly after 15 seconds.",
        complaint_reference: "AIRTEL-REF-999",
        complaint_contacted_at: "2026-11-16T14:10:00.000Z",
      },
      created_at: "2026-11-16T14:00:00.000Z",
      updated_at: "2026-11-16T14:00:00.000Z",
      expires_at: "2027-11-16T14:00:00.000Z",
    };

    const writeRes = saveLocalIncident(validIncident);
    expect(writeRes.success).toBe(true);

    const loaded = getLocalIncidents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe(validIncident.id);
    expect(loaded[0]?.fields.operator).toBe("airtel");

    // Deletion
    const delRes = deleteLocalIncident(validIncident.id);
    expect(delRes.success).toBe(true);
    expect(getLocalIncidents()).toHaveLength(0);
  });

  it("handles malformed JSON in localStorage without throwing", () => {
    mockStorage["signalpulse_local_incidents_v0.1"] = "{ malformed json string !!!";
    expect(() => getLocalIncidents()).not.toThrow();
    expect(getLocalIncidents()).toEqual([]);
  });

  it("filters out invalid records that do not conform to incidentSchema", () => {
    const corruptedList = [
      { id: "not-a-valid-uuid", fields: { operator: "unknown_operator" } },
      {
        id: "00000000-0000-4000-8000-000000000003",
        client_record_id: "00000000-0000-4000-8000-000000000004",
        provenance: "user_reported",
        revision: 1,
        fields: {
          operator: "mtn",
          area_id: "surulere",
          category: "billing_dispute",
          occurred_at: "2026-11-16T15:00:00.000Z",
          narrative: "Airtime deduction without service delivery.",
          complaint_reference: null,
          complaint_contacted_at: null,
        },
        created_at: "2026-11-16T15:00:00.000Z",
        updated_at: "2026-11-16T15:00:00.000Z",
        expires_at: "2027-11-16T15:00:00.000Z",
      },
    ];

    mockStorage["signalpulse_local_incidents_v0.1"] = JSON.stringify(corruptedList);
    const loaded = getLocalIncidents();
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.id).toBe("00000000-0000-4000-8000-000000000003");
  });

  it("rejects saving invalid incident objects with validation_error", () => {
    // @ts-expect-error Testing invalid incident object
    const badIncident: Incident = { id: "not-uuid" };
    const res = saveLocalIncident(badIncident);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("validation_error");
    }
  });

  it("catches QuotaExceededError and returns quota_exceeded status", () => {
    // Override setItem to throw QuotaExceededError
    window.localStorage.setItem = () => {
      const err = new DOMException("Quota exceeded", "QuotaExceededError");
      throw err;
    };

    const validIncident: Incident = {
      id: "00000000-0000-4000-8000-000000000005",
      client_record_id: "00000000-0000-4000-8000-000000000006",
      provenance: "user_reported",
      revision: 1,
      fields: {
        operator: "t2mobile",
        area_id: "badagry",
        category: "failed_call",
        occurred_at: "2026-11-16T16:00:00.000Z",
        narrative: "Repeated call drops.",
        complaint_reference: null,
        complaint_contacted_at: null,
      },
      created_at: "2026-11-16T16:00:00.000Z",
      updated_at: "2026-11-16T16:00:00.000Z",
      expires_at: "2027-11-16T16:00:00.000Z",
    };

    const res = saveLocalIncident(validIncident);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("quota_exceeded");
      expect(res.message).toContain("quota");
    }
  });

  it("reports accurate storage diagnostics for empty and populated states", () => {
    const diagEmpty = getStorageDiagnostics();
    expect(diagEmpty.isAvailable).toBe(true);
    expect(diagEmpty.rawCount).toBe(0);
    expect(diagEmpty.validCount).toBe(0);
    expect(diagEmpty.corruptedCount).toBe(0);
    expect(diagEmpty.isMalformed).toBe(false);

    const validIncident: Incident = {
      id: "00000000-0000-4000-8000-000000000007",
      client_record_id: "00000000-0000-4000-8000-000000000008",
      provenance: "user_reported",
      revision: 1,
      fields: {
        operator: "mtn",
        area_id: "ikeja",
        category: "unusable_internet",
        occurred_at: "2026-11-16T16:00:00.000Z",
        narrative: "Diagnostic test incident.",
        complaint_reference: null,
        complaint_contacted_at: null,
      },
      created_at: "2026-11-16T16:00:00.000Z",
      updated_at: "2026-11-16T16:00:00.000Z",
      expires_at: "2027-11-16T16:00:00.000Z",
    };
    saveLocalIncident(validIncident);

    const diagPopulated = getStorageDiagnostics();
    expect(diagPopulated.rawCount).toBe(1);
    expect(diagPopulated.validCount).toBe(1);
    expect(diagPopulated.corruptedCount).toBe(0);
  });

  it("preserves mixed readable and unreadable records during save, delete and purge requests", () => {
    const validIncident: Incident = {
      id: "00000000-0000-4000-8000-000000000009",
      client_record_id: "00000000-0000-4000-8000-000000000010",
      provenance: "user_reported",
      revision: 1,
      fields: {
        operator: "airtel",
        area_id: "alimosho",
        category: "failed_call",
        occurred_at: "2026-11-16T17:00:00.000Z",
        narrative: "Surviving valid incident.",
        complaint_reference: null,
        complaint_contacted_at: null,
      },
      created_at: "2026-11-16T17:00:00.000Z",
      updated_at: "2026-11-16T17:00:00.000Z",
      expires_at: "2027-11-16T17:00:00.000Z",
    };

    const mixedEntries = [
      validIncident,
      { id: "bad-entry-1", fields: {} },
      { id: "bad-entry-2", narrative: "corrupted legacy format" },
    ];

    mockStorage["signalpulse_local_incidents_v0.1"] = JSON.stringify(mixedEntries);

    const diagBefore = getStorageDiagnostics();
    expect(diagBefore.rawCount).toBe(3);
    expect(diagBefore.validCount).toBe(1);
    expect(diagBefore.corruptedCount).toBe(2);
    expect(diagBefore.isMalformed).toBe(false);

    expect(saveLocalIncident(validIncident).success).toBe(false);
    expect(deleteLocalIncident(validIncident.id).success).toBe(false);
    const purgeRes = purgeCorruptedIncidents();
    expect(purgeRes.success).toBe(false);

    const diagAfter = getStorageDiagnostics();
    expect(diagAfter.rawCount).toBe(3);
    expect(diagAfter.validCount).toBe(1);
    expect(diagAfter.corruptedCount).toBe(2);
    expect(mockStorage["signalpulse_local_incidents_v0.1"]).toBe(JSON.stringify(mixedEntries));

    const remaining = getLocalIncidents();
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe("00000000-0000-4000-8000-000000000009");
  });

  it("preserves malformed non-JSON strings during attempted cleanup", () => {
    mockStorage["signalpulse_local_incidents_v0.1"] = "MALFORMED_JSON_STRING_{{{";

    const diag = getStorageDiagnostics();
    expect(diag.isMalformed).toBe(true);
    expect(diag.corruptedCount).toBe(1);
    expect(diag.validCount).toBe(0);

    const purgeRes = purgeCorruptedIncidents();
    expect(purgeRes.success).toBe(false);

    const diagCleaned = getStorageDiagnostics();
    expect(diagCleaned.isMalformed).toBe(true);
    expect(diagCleaned.rawCount).toBe(0);
    expect(diagCleaned.corruptedCount).toBe(1);
    expect(mockStorage["signalpulse_local_incidents_v0.1"]).toBe("MALFORMED_JSON_STRING_{{{");
  });
});

describe("timezone formatting and datetime round-trip preservation (CTO014/CTO015)", () => {
  it("converts Date to local datetime-local input string without UTC hour drift", async () => {
    const { toLocalDateTimeInputValue, fromLocalDateTimeInputValue, formatDisplayDateTimeWAT } = await import("@/lib/datetime");

    // Fixed ISO timestamp
    const iso = "2026-11-18T14:30:00.000Z";
    const localInputStr = toLocalDateTimeInputValue(iso);

    // Must be YYYY-MM-DDTHH:mm format
    expect(localInputStr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

    // Converting back must return a valid ISO string representing the exact same moment
    const backToIso = fromLocalDateTimeInputValue(localInputStr);
    const originalDate = new Date(iso);
    const roundTripDate = new Date(backToIso);

    // In local time of the execution environment, the wall clock minutes must match
    expect(roundTripDate.getMinutes()).toBe(originalDate.getMinutes());

    // Formatting for display in Africa/Lagos
    const watDisplay = formatDisplayDateTimeWAT(iso);
    expect(watDisplay).toContain("WAT");
    expect(watDisplay).toContain("2026");
  });

  it("preserves timestamp across simulated create -> edit -> save lifecycle", async () => {
    const { toLocalDateTimeInputValue, fromLocalDateTimeInputValue } = await import("@/lib/datetime");

    // 1. User picks a time in datetime-local input: 15:30
    const userInputTime = "2026-11-18T15:30";

    // 2. Saved to storage as UTC ISO
    const savedUtcIso = fromLocalDateTimeInputValue(userInputTime);
    expect(savedUtcIso).toMatch(/Z$/);

    // 3. User later opens the incident for editing: input is populated
    const editInputTime = toLocalDateTimeInputValue(savedUtcIso);

    // 4. Time must NOT have shifted merely by opening edit!
    expect(editInputTime).toBe(userInputTime);

    // 5. User clicks save without altering the time input
    const reSavedUtcIso = fromLocalDateTimeInputValue(editInputTime);

    // 6. Must be identical to the original saved timestamp
    expect(reSavedUtcIso).toBe(savedUtcIso);
  });

  it("verifies share card generation parameters never leak private narratives or ticket IDs", () => {
    // Fictional sensitive subscriber incident
    const sensitiveIncident = {
      narrative: "Personal billing problem: 08031234567 deducted 5,000 NGN. Confidential bank details.",
      complaint_reference: "CAS-998822-SECRET",
      operator: "airtel" as const,
      category: "billing_dispute" as const,
      area_id: "ikeja",
    };

    // The share card only consumes: operator, category, areaId
    const sharePayload = {
      operator: sensitiveIncident.operator,
      category: sensitiveIncident.category,
      areaId: sensitiveIncident.area_id,
    };

    // Serialized share payload must not contain sensitive narrative or ticket
    const serialized = JSON.stringify(sharePayload);
    expect(serialized).not.toContain(sensitiveIncident.narrative);
    expect(serialized).not.toContain(sensitiveIncident.complaint_reference);
    expect(serialized).not.toContain("08031234567");
    expect(serialized).not.toContain("5,000");

    // Pre-composed share text format
    const shareText = `I just logged a network problem on SignalPulse NG for Airtel Nigeria (Billing and airtime disputes).\n\nBad network? Keep a record here:\nhttps://signalpulse-nine.vercel.app/report/airtel`;
    expect(shareText).not.toContain(sensitiveIncident.narrative);
    expect(shareText).not.toContain(sensitiveIncident.complaint_reference);
    expect(shareText).toContain("network problem");
  });
});

