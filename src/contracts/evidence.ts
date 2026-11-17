import { z } from "zod";
import { idSchema, instantSchema, sha256Schema, textSchema, uintSchema } from "./scalars";
import { incidentSchema } from "./incidents";
import { measurementSummarySchema } from "./measurements";

export const exportCreateSchema = z.strictObject({
  format: z.enum(["json", "pdf"]), incident_ids: z.array(idSchema).max(20),
  measurement_ids: z.array(idSchema).max(20), include_linked_summaries: z.boolean(),
}).superRefine((request, context) => {
  const ids = [...request.incident_ids, ...request.measurement_ids];
  if (ids.length === 0 || ids.length > 20 || new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", message: "Select 1 to 20 unique resources" });
  }
});
export const snapshotCreateSchema = z.strictObject({ measurement_id: idSchema, confirm_private_retention: z.literal(true) });
export const snapshotSchema = z.object({
  id: idSchema, incident_id: idSchema, source_measurement_id: idSchema, summary: measurementSummarySchema,
  provenance: z.literal("app_measured"), retained_at: instantSchema, expires_at: instantSchema,
  source_status: z.enum(["raw_available", "raw_expired"]), limitations: z.array(textSchema()),
});
export const exportDocumentSchema = z.object({
  export_schema_version: z.literal("evidence-0.1"), generated_at: instantSchema, timezone: z.literal("Africa/Lagos"),
  incidents: z.array(incidentSchema),
  measurements: z.array(z.object({ id: idSchema, summary: measurementSummarySchema, provenance: z.literal("app_measured") })),
  retained_summaries: z.array(snapshotSchema),
  complaint_descriptions: z.array(z.object({ incident_id: idSchema, text: textSchema() })),
  assets: z.array(z.object({ id: idSchema, incident_id: idSchema, media_type: z.string(), size_bytes: uintSchema, sha256: sha256Schema, provenance: z.literal("user_attached") })),
  limitations: z.array(textSchema()),
});
export type ExportCreate = z.infer<typeof exportCreateSchema>;
export type ExportDocument = z.infer<typeof exportDocumentSchema>;
