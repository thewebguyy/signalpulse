import type { AttachmentMetadata, AttachmentReserveRequest } from "@/contracts/attachments";

/**
 * Pure domain interface for private evidence attachment storage.
 * Enforces ownership, private quarantine, and safe access proxying.
 */
export interface AttachmentStoragePort {
  reserve(request: AttachmentReserveRequest): Promise<AttachmentMetadata>;
  getMetadata(id: string): Promise<AttachmentMetadata>;
  delete(id: string): Promise<void>;
}
