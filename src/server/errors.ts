import { failureSchema, errorStatus, type ErrorCode, type Failure } from "@/contracts/common";

const messages: Record<ErrorCode, string> = {
  bad_request: "Invalid request.", session_required: "A session is required.", session_expired: "Your session has expired.",
  request_forbidden: "This request is not allowed.", not_found: "Record not found.",
  idempotency_conflict: "This request conflicts with an earlier request.", operation_in_progress: "The operation is still processing.",
  version_conflict: "Refresh this record before trying again.", receipt_consumed: "This receipt has already been used.",
  record_retired: "This record is no longer available.", state_conflict: "This operation is not available in the current state.",
  session_window_expired: "The test session has expired.", payload_too_large: "The request exceeds the allowed size.",
  unsupported_media_type: "This media type is not supported.", validation_failed: "Check the indicated fields.",
  unsupported_method: "This methodology version is not supported.", invalid_receipt: "This receipt cannot be accepted.",
  rate_limited: "Please wait before trying again.", temporarily_unavailable: "This service is temporarily unavailable.",
  capability_disabled: "This capability is not enabled in the foundation.",
};

/** No arbitrary exception message, input value or database detail can enter this envelope. */
// common.md contradicts itself on 409 retry delay. Defer that constructor until reviewed.
export function createFailure(code: Exclude<ErrorCode, "operation_in_progress">, requestId: string): { status: number; body: Failure } {
  const retryable = code === "rate_limited" || code === "temporarily_unavailable";
  return { status: errorStatus[code], body: failureSchema.parse({
    error: { code, message: messages[code], fields: [], retryable, retry_after_seconds: retryable ? 5 : null },
    meta: { contract_version: "0.1.0", request_id: requestId },
  }) };
}
