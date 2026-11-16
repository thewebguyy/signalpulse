import { z } from "zod";
import { idSchema, textSchema, uintSchema } from "./scalars";
import { CONTRACT_VERSION } from "./version";

export const errorStatus = {
  bad_request: 400, session_required: 401, session_expired: 401, request_forbidden: 403,
  not_found: 404, idempotency_conflict: 409, operation_in_progress: 409, version_conflict: 409,
  receipt_consumed: 409, record_retired: 409, state_conflict: 409, session_window_expired: 410,
  payload_too_large: 413, unsupported_media_type: 415, validation_failed: 422,
  unsupported_method: 422, invalid_receipt: 422, rate_limited: 429,
  temporarily_unavailable: 503, capability_disabled: 503,
} as const;
export const errorCodeSchema = z.enum(Object.keys(errorStatus) as [keyof typeof errorStatus, ...(keyof typeof errorStatus)[]]);
export const metaSchema = z.object({ contract_version: z.literal(CONTRACT_VERSION), request_id: idSchema });
export const fieldErrorSchema = z.object({ path: textSchema(), code: z.enum(["required", "invalid", "unsupported", "too_large"]) });
export const apiErrorSchema = z.object({
  code: errorCodeSchema, message: textSchema(), fields: z.array(fieldErrorSchema),
  retryable: z.boolean(), retry_after_seconds: uintSchema.nullable(),
});
export const failureSchema = z.object({ error: apiErrorSchema, meta: metaSchema });
export function successSchema<T extends z.ZodType>(data: T) {
  return z.object({ data, meta: metaSchema });
}
export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item).max(50), next_cursor: z.string().nullable() });
}
export type ApiError = z.infer<typeof apiErrorSchema>;
export type ErrorCode = ApiError["code"];
export type Failure = z.infer<typeof failureSchema>;
export type Success<T> = { data: T; meta: z.infer<typeof metaSchema> };
export type Page<T> = { items: T[]; next_cursor: string | null };
