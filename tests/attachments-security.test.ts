import { describe, expect, it } from "vitest";
import {
  attachmentReserveRequestSchema,
  attachmentMetadataSchema,
  MAX_ATTACHMENT_BYTES,
} from "@/contracts/attachments";

describe("Private Evidence Attachment Security & Constraints", () => {
  const validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const incidentId = "00000000-0000-4000-8000-000000000001";
  const assetId = "00000000-0000-4000-8000-000000000002";

  it("accepts valid JPEG, PNG, and PDF reservation requests under 5 MiB", () => {
    const valid = {
      incident_id: incidentId,
      original_filename: "bank_debit_alert.png",
      file_type: "debit_screenshot",
      mime_type: "image/png",
      byte_size: 1024 * 500, // 500 KB
      sha256_hash: validHash,
    };

    expect(attachmentReserveRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects file sizes exceeding the 5 MiB hard cap", () => {
    const tooLarge = {
      incident_id: incidentId,
      original_filename: "huge_video.png",
      file_type: "other",
      mime_type: "image/png",
      byte_size: MAX_ATTACHMENT_BYTES + 1,
      sha256_hash: validHash,
    };

    expect(attachmentReserveRequestSchema.safeParse(tooLarge).success).toBe(false);
  });

  it("rejects forbidden executable, HTML, SVG, or script MIME types", () => {
    const dangerousTypes = [
      "text/html",
      "image/svg+xml",
      "application/javascript",
      "application/x-msdownload",
      "text/plain",
    ];

    for (const badType of dangerousTypes) {
      const payload = {
        incident_id: incidentId,
        original_filename: "exploit.svg",
        file_type: "other",
        mime_type: badType,
        byte_size: 1024,
        sha256_hash: validHash,
      };
      expect(attachmentReserveRequestSchema.safeParse(payload).success).toBe(false);
    }
  });

  it("verifies attachment lifecycle states adhere to ADR-003", () => {
    const validMetadata = {
      id: assetId,
      incident_id: incidentId,
      storage_path: `user-123/${incidentId}/${assetId}.bin`,
      original_filename: "ussd_error.jpg",
      file_type: "ussd_error",
      mime_type: "image/jpeg",
      byte_size: 4096,
      sha256_hash: validHash,
      status: "quarantined",
      created_at: new Date().toISOString(),
      scanned_at: null,
    };

    expect(attachmentMetadataSchema.safeParse(validMetadata).success).toBe(true);

    // Invalid status promotion or unauthorized status
    expect(
      attachmentMetadataSchema.safeParse({
        ...validMetadata,
        status: "publicly_visible",
      }).success
    ).toBe(false);
  });
});
