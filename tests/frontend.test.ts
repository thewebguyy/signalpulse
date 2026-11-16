import { describe, expect, it } from "vitest";
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

    expect(() => saveLocalIncident(fakeIncident)).not.toThrow();
    expect(() => deleteLocalIncident(fakeIncident.id)).not.toThrow();

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

    expect(() => saveLocalMeasurement(fakeMeasurement)).not.toThrow();
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
  });
});
