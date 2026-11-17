import { z } from "zod";
import { areaIdSchema, idSchema, instantSchema, textSchema, uintSchema } from "./scalars";
import { incidentCategorySchema, operatorSchema } from "./domain";

export const incidentFieldsSchema = z.strictObject({
  operator: operatorSchema, area_id: areaIdSchema.nullable(), category: incidentCategorySchema,
  occurred_at: instantSchema, narrative: textSchema(1, 4000),
  complaint_reference: textSchema(1, 128).nullable(), complaint_contacted_at: instantSchema.nullable(),
});
export const incidentCreateSchema = z.strictObject({
  client_record_id: idSchema, client_created_at: instantSchema, fields: incidentFieldsSchema,
});
export const incidentReplaceSchema = z.strictObject({ expected_revision: uintSchema, fields: incidentFieldsSchema });
export const incidentSchema = z.object({
  id: idSchema, client_record_id: idSchema, fields: incidentFieldsSchema.strip(),
  provenance: z.literal("user_reported"), revision: uintSchema.min(1),
  created_at: instantSchema, updated_at: instantSchema, expires_at: instantSchema,
}).refine((record) => record.updated_at >= record.created_at && record.expires_at > record.created_at,
  "Invalid incident lifecycle timestamps");
export type IncidentFields = z.infer<typeof incidentFieldsSchema>;
export type IncidentCreate = z.infer<typeof incidentCreateSchema>;
export type IncidentReplace = z.infer<typeof incidentReplaceSchema>;
export type Incident = z.infer<typeof incidentSchema>;

/** Time/catalog checks are injected, not frozen at module import or inferred from shape alone. */
export function incidentCreateBoundary(options: { now: Date; areaIds: ReadonlySet<string> }) {
  const now = options.now.getTime();
  if (!Number.isFinite(now)) throw new Error("Boundary requires a valid clock");
  return incidentCreateSchema.superRefine((request, context) => {
    const created = Date.parse(request.client_created_at);
    if (created < now - 30 * 86400_000 || created > now + 300_000) {
      context.addIssue({ code: "custom", path: ["client_created_at"], message: "Outside save window" });
    }
    if (Date.parse(request.fields.occurred_at) > now + 300_000) {
      context.addIssue({ code: "custom", path: ["fields", "occurred_at"], message: "Observation is in the future" });
    }
    if (request.fields.area_id !== null && !options.areaIds.has(request.fields.area_id)) {
      context.addIssue({ code: "custom", path: ["fields", "area_id"], message: "Unknown area" });
    }
  });
}
