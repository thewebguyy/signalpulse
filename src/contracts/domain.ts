import { z } from "zod";

export const operatorSchema = z.enum(["mtn", "airtel", "glo", "t2mobile"]);
export const incidentCategorySchema = z.enum([
  "failed_call", "dropped_call", "unusable_internet", "suspicious_data_depletion",
  "failed_airtime_data_purchase", "billing_dispute",
]);
export const provenanceSchema = z.enum([
  "app_measured", "device_observed", "user_reported", "user_attached", "official_source",
]);
export const phaseStateSchema = z.enum(["completed", "failed", "cancelled", "not_run", "unsupported"]);
export const measurementStateSchema = z.enum(["completed", "partial", "cancelled", "failed"]);
export const contributionStateSchema = z.enum(["off", "on", "withdrawn"]);
export const assetStateSchema = z.enum(["reserved", "quarantined", "clean", "rejected", "deleting"]);

export type Operator = z.infer<typeof operatorSchema>;
export type IncidentCategory = z.infer<typeof incidentCategorySchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
