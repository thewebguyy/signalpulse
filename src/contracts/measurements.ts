import { z } from "zod";
import { areaIdSchema, idSchema, identifierSchema, instantSchema, uintSchema } from "./scalars";
import { contributionStateSchema, measurementStateSchema, operatorSchema, phaseStateSchema } from "./domain";

export const testContextSchema = z.strictObject({
  operator: operatorSchema, area_id: areaIdSchema.nullable(),
  mobile_data_confirmed: z.boolean(), vpn: z.enum(["yes", "no", "unknown"]),
});
export const qualityFlagSchema = z.enum([
  "receipt_missing", "receipt_expired", "endpoint_error", "phase_mismatch", "duration_too_short",
  "client_clock_skew", "interrupted", "mobile_unconfirmed", "location_unknown", "vpn_not_excluded", "upload_private_only",
]);
export const qualityIssueSchema = z.object({ code: qualityFlagSchema, scope: z.enum(["record", "latency", "download", "upload"]) });

function metricSchema(unit: "ms" | "Mbps") {
  return z.object({ state: phaseStateSchema, value: z.number().finite().nonnegative().nullable(), unit: z.literal(unit) })
    .refine((metric) => metric.state === "completed" ? metric.value !== null && metric.value > 0 : metric.value === null,
      "Completed metric must have a positive value; unavailable metrics must be null");
}
export const contributionSchema = z.object({
  state: contributionStateSchema, revision: uintSchema.min(1), notice_version: z.string().nullable(),
  changed_at: instantSchema, publication_effect: z.enum(["not_contributing", "candidate_only", "withdrawn"]),
}).refine((value) => ({ off: "not_contributing", on: "candidate_only", withdrawn: "withdrawn" })[value.state] === value.publication_effect,
  "Contribution state and effect disagree");
export const contributionChangeSchema = z.strictObject({
  expected_revision: uintSchema, contribute: z.boolean(), notice_version: z.string().nullable(),
}).refine((value) => !value.contribute || value.notice_version === "contribution-0.1", "Grant requires the current notice");

/** Structural DTO validation only; never performs receipt verification or qualification. */
export const measurementSummarySchema = z.object({
  method_version: z.string(), endpoint_id: identifierSchema, endpoint_region: z.string().nullable(),
  context: testContextSchema.strip(), observed_start: instantSchema, observed_end: instantSchema,
  received_at: instantSchema, state: measurementStateSchema,
  latency: metricSchema("ms"), download: metricSchema("Mbps"), upload: metricSchema("Mbps"),
  corroboration: z.enum(["client_only", "endpoint_matched"]), receipt_version: z.literal("receipt-0.1").nullable(),
  quality_flags: z.array(qualityIssueSchema), assessed_at: instantSchema,
}).refine((value) => value.observed_end >= value.observed_start, "Observation ends before it starts");
export const measurementSchema = z.object({
  id: idSchema, client_record_id: idSchema, summary: measurementSummarySchema,
  provenance: z.literal("app_measured"), contribution: contributionSchema,
  created_at: instantSchema, expires_at: instantSchema,
});
export type Measurement = z.infer<typeof measurementSchema>;
export type MeasurementSummary = z.infer<typeof measurementSummarySchema>;
export type ContributionChange = z.infer<typeof contributionChangeSchema>;
