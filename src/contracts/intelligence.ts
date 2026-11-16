import { z } from "zod";
import { areaIdSchema, dateSchema, identifierSchema, instantSchema, textSchema } from "./scalars";
import { operatorSchema } from "./domain";

export const publicCohortQuerySchema = z.strictObject({
  area_id: areaIdSchema, operator: operatorSchema,
  week_start: dateSchema.refine((value) => new Date(`${value}T00:00:00.000Z`).getUTCDay() === 1, "Week starts on Monday"),
  method_version: z.string(), endpoint_id: identifierSchema, metric: z.enum(["download", "latency"]),
});
const publicStatisticsSchema = z.object({
  unit: z.enum(["Mbps", "ms"]), median: z.number().finite(), p25: z.number().finite(), p75: z.number().finite(),
  raw_test_count_band: z.string(), contributing_owner_count_band: z.string(),
  observation_cutoff: instantSchema, published_at: instantSchema, expires_at: instantSchema,
  quality: z.literal("screened_voluntary_sample"),
});
/** A DTO is not permission to publish. There is no aggregate producer in this milestone. */
export const publicCohortSchema = z.object({
  ...publicCohortQuerySchema.shape, status: z.enum(["published", "unavailable"]),
  statistics: publicStatisticsSchema.nullable(), aggregation_version: z.literal("aggregate-0.1"),
  limitations: z.array(textSchema()),
}).refine((value) => value.status === "unavailable" ? value.statistics === null : value.statistics !== null,
  "Unavailable cohorts cannot contain statistics")
  .refine((value) => value.statistics === null || value.statistics.unit === (value.metric === "download" ? "Mbps" : "ms"),
    "Metric unit mismatch");
export type PublicCohortQuery = z.infer<typeof publicCohortQuerySchema>;
export type PublicCohort = z.infer<typeof publicCohortSchema>;
