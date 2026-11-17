import { z } from "zod";
import { idSchema, instantSchema } from "./scalars";
import { recoveryModeSchema } from "./session";

export const subscriberStatusSchema = z.enum(["active", "deleting", "deleted"]);
export type SubscriberStatus = z.infer<typeof subscriberStatusSchema>;

export const subscriberProfileSchema = z.strictObject({
  id: idSchema,
  status: subscriberStatusSchema,
  recovery_mode: recoveryModeSchema,
  backup_enrolled: z.boolean(),
  consent_version: z.string().nullable(),
  consent_timestamp: instantSchema.nullable(),
  created_at: instantSchema,
  updated_at: instantSchema,
});
export type SubscriberProfile = z.infer<typeof subscriberProfileSchema>;

export const linkRecoveryRequestSchema = z.strictObject({
  email: z.string().email().max(255),
});
export type LinkRecoveryRequest = z.infer<typeof linkRecoveryRequestSchema>;

export const cloudBackupConsentSchema = z.strictObject({
  consent_type: z.enum(["cloud_backup", "attachment_storage", "anonymous_metrics"]),
  granted: z.boolean(),
  policy_version: z.string().min(1).max(64),
});
export type CloudBackupConsent = z.infer<typeof cloudBackupConsentSchema>;
