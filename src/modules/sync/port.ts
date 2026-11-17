import type { SyncBatchRequest, SyncBatchResponse } from "@/contracts/sync";

/**
 * Synchronization port for reconciling local client drafts with cloud evidence storage.
 * Handles idempotent replays, batch mutations, and conflict resolution.
 */
export interface SyncPort {
  processBatch(request: SyncBatchRequest): Promise<SyncBatchResponse>;
}
