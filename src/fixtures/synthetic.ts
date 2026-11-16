import { areaEntrySchema, operatorEntrySchema } from "@/contracts/catalogs";
import { incidentSchema, incidentCreateSchema } from "@/contracts/incidents";
import { measurementSchema } from "@/contracts/measurements";
import { exportDocumentSchema } from "@/contracts/evidence";
import { publicCohortSchema } from "@/contracts/intelligence";
import { sessionSchema } from "@/contracts/session";

export const SYNTHETIC_NOW = "2026-11-16T09:00:00.000Z";
const ids = { incident: "00000000-0000-4000-8000-000000000011", create: "00000000-0000-4000-8000-000000000010", measurement: "00000000-0000-4000-8000-000000000012" };

/** Fresh parsed copies per call. Never a mutable shared store or a database seed. */
export function createSyntheticFixtures() {
  const incidentCreate = incidentCreateSchema.parse({
    client_record_id: ids.create, client_created_at: SYNTHETIC_NOW,
    fields: { operator: "mtn", area_id: null, category: "failed_call", occurred_at: "2026-11-16T08:55:00.000Z",
      narrative: "SYNTHETIC EXAMPLE: a call did not connect. This is not a real incident.", complaint_reference: null, complaint_contacted_at: null },
  });
  const incident = incidentSchema.parse({
    id: ids.incident, client_record_id: ids.create, fields: incidentCreate.fields,
    provenance: "user_reported", revision: 1, created_at: SYNTHETIC_NOW, updated_at: SYNTHETIC_NOW, expires_at: "2027-11-16T09:00:00.000Z",
  });
  const measurement = measurementSchema.parse({
    id: ids.measurement, client_record_id: "00000000-0000-4000-8000-000000000013", provenance: "app_measured",
    summary: { method_version: "browser-http-0.1", endpoint_id: "synthetic-no-endpoint", endpoint_region: null,
      context: { operator: "mtn", area_id: null, mobile_data_confirmed: false, vpn: "unknown" },
      observed_start: SYNTHETIC_NOW, observed_end: "2026-11-16T09:00:01.000Z", received_at: "2026-11-16T09:00:02.000Z",
      state: "failed", latency: { state: "failed", value: null, unit: "ms" },
      download: { state: "failed", value: null, unit: "Mbps" }, upload: { state: "not_run", value: null, unit: "Mbps" },
      corroboration: "client_only", receipt_version: null,
      quality_flags: [{ code: "receipt_missing", scope: "record" }], assessed_at: "2026-11-16T09:00:02.000Z" },
    contribution: { state: "off", revision: 1, notice_version: null, changed_at: SYNTHETIC_NOW, publication_effect: "not_contributing" },
    created_at: SYNTHETIC_NOW, expires_at: "2027-02-14T09:00:00.000Z",
  });
  const evidence = exportDocumentSchema.parse({
    export_schema_version: "evidence-0.1", generated_at: SYNTHETIC_NOW, timezone: "Africa/Lagos", incidents: [incident],
    measurements: [], retained_summaries: [], complaint_descriptions: [{ incident_id: incident.id, text: "SYNTHETIC EXAMPLE ONLY. No complaint has been submitted." }],
    assets: [], limitations: ["Synthetic development fixture. Not consumer evidence."],
  });
  return {
    source: "synthetic" as const,
    warning: "Synthetic development fixtures only. Not real network or consumer data.",
    incidentCreate, incident, measurement, evidence,
    session: sessionSchema.parse({ state: "signed_out", owner_id: null, recovery_mode: "none", csrf_token: "synthetic-not-a-valid-token" }),
    operators: [
      { code: "mtn", display_name: "MTN" }, { code: "airtel", display_name: "Airtel" },
      { code: "glo", display_name: "Glo" }, { code: "t2mobile", display_name: "T2mobile" },
    ].map((entry) => operatorEntrySchema.parse(entry)),
    areas: [areaEntrySchema.parse({ id: "synthetic-lga", name: "Synthetic area (not a published catalog)", state: "Lagos", kind: "lga" })],
    intelligence: publicCohortSchema.parse({ area_id: "synthetic-lga", operator: "mtn", week_start: "2026-11-09",
      method_version: "browser-http-0.1", endpoint_id: "synthetic-no-endpoint", metric: "download", status: "unavailable", statistics: null,
      aggregation_version: "aggregate-0.1", limitations: ["No publishable observations for this cohort"] }),
  };
}
export type SyntheticFixtures = ReturnType<typeof createSyntheticFixtures>;
