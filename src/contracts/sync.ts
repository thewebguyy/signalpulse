import { z } from "zod";
import { idSchema, instantSchema, uintSchema } from "./scalars";
import { incidentSchema } from "./incidents";

export const syncItemStatusSchema = z.enum(["local_only", "queued", "synced", "failed", "conflict"]);
export type SyncItemStatus = z.infer<typeof syncItemStatusSchema>;

export const syncOperationTypeSchema = z.enum(["upsert_incident", "delete_incident", "link_account", "enroll_backup"]);
export type SyncOperationType = z.infer<typeof syncOperationTypeSchema>;

export const syncOperationSchema = z.strictObject({
  id: idSchema,
  client_mutation_id: z.string().min(1).max(128),
  operation_type: syncOperationTypeSchema,
  status: z.enum(["pending", "completed", "failed", "conflict"]),
  payload: z.record(z.string(), z.unknown()),
  created_at: instantSchema,
});
export type SyncOperation = z.infer<typeof syncOperationSchema>;

export const syncBatchRequestSchema = z.strictObject({
  client_mutation_id: z.string().min(1).max(128),
  incidents: z.array(incidentSchema).max(50),
  deleted_incident_ids: z.array(idSchema).max(50),
});
export type SyncBatchRequest = z.infer<typeof syncBatchRequestSchema>;

export const syncBatchResponseSchema = z.strictObject({
  synced_count: uintSchema,
  failed_count: uintSchema,
  conflicts: z.array(z.strictObject({
    id: idSchema,
    reason: z.string(),
    server_revision: uintSchema,
    client_revision: uintSchema,
  })),
  synced_at: instantSchema,
});
export type SyncBatchResponse = z.infer<typeof syncBatchResponseSchema>;
