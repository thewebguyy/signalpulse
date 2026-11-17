import { z } from "zod";
import { idSchema, instantSchema, uintSchema } from "./scalars";

export const attachmentFileTypeSchema = z.enum(["receipt", "debit_screenshot", "ussd_error", "other"]);
export type AttachmentFileType = z.infer<typeof attachmentFileTypeSchema>;

export const attachmentMimeTypeSchema = z.enum(["image/jpeg", "image/png", "application/pdf"]);
export type AttachmentMimeType = z.infer<typeof attachmentMimeTypeSchema>;

export const attachmentStatusSchema = z.enum(["reserved", "quarantined", "clean", "rejected", "deleting"]);
export type AttachmentStatus = z.infer<typeof attachmentStatusSchema>;

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MiB hard cap

export const attachmentMetadataSchema = z.strictObject({
  id: idSchema,
  incident_id: idSchema,
  storage_path: z.string().min(1).max(512),
  original_filename: z.string().min(1).max(255),
  file_type: attachmentFileTypeSchema,
  mime_type: attachmentMimeTypeSchema,
  byte_size: uintSchema.min(1).max(MAX_ATTACHMENT_BYTES),
  sha256_hash: z.string().regex(/^[a-f0-9]{64}$/, "Must be valid 64-char lowercase hex SHA-256"),
  status: attachmentStatusSchema,
  created_at: instantSchema,
  scanned_at: instantSchema.nullable(),
});
export type AttachmentMetadata = z.infer<typeof attachmentMetadataSchema>;

export const attachmentReserveRequestSchema = z.strictObject({
  incident_id: idSchema,
  original_filename: z.string().min(1).max(255),
  file_type: attachmentFileTypeSchema,
  mime_type: attachmentMimeTypeSchema,
  byte_size: uintSchema.min(1).max(MAX_ATTACHMENT_BYTES),
  sha256_hash: z.string().regex(/^[a-f0-9]{64}$/, "Must be valid 64-char lowercase hex SHA-256"),
});
export type AttachmentReserveRequest = z.infer<typeof attachmentReserveRequestSchema>;
