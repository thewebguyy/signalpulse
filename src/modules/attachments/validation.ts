/**
 * SignalPulse NG — Attachment Content & Signature Validation
 *
 * Enforces strict fail-closed file validation:
 * 1. File size limits (1 byte to 5 MiB).
 * 2. Magic byte / file signature verification against declared MIME type.
 * 3. Prohibits active script or HTML executable markers in binary uploads.
 * 4. SHA-256 digest computation and verification.
 */

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MiB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: AllowedMimeType;
  computedSha256?: string;
}

/**
 * Checks magic bytes for supported file types:
 * - JPEG: 0xFF, 0xD8, 0xFF
 * - PNG:  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
 * - PDF:  0x25, 0x50, 0x44, 0x46 ('%PDF')
 */
export function detectMagicBytes(bytes: Uint8Array): AllowedMimeType | null {
  if (bytes.length < 4) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  // PDF: 25 50 44 46 (%PDF)
  if (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  ) {
    return "application/pdf";
  }

  return null;
}

/**
 * Scans the first 2048 bytes for suspicious script / executable tags
 * that might indicate a polyglot attack disguised as an image or PDF.
 */
export function containsMaliciousScriptMarkers(bytes: Uint8Array): boolean {
  const sampleLength = Math.min(bytes.length, 2048);
  const sample = bytes.slice(0, sampleLength);
  const text = new TextDecoder("latin1").decode(sample).toLowerCase();

  const dangerousPatterns = [
    "<script",
    "javascript:",
    "<?php",
    "<!doctype html",
    "<html",
    "<svg",
    "xmlns=\"http://www.w3.org/2000/svg\"",
  ];

  return dangerousPatterns.some((pattern) => text.includes(pattern));
}

/**
 * Computes the SHA-256 hex digest of a byte array using Web Crypto.
 */
export async function computeSha256Hex(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Complete validation of uploaded attachment bytes:
 * - Checks byte length bounds.
 * - Confirms magic bytes match declared MIME type.
 * - Checks for active script polyglot markers.
 * - Computes SHA-256 and checks against declared hash (if provided).
 */
export async function validateAttachmentBytes(
  bytes: Uint8Array,
  declaredMimeType: string,
  declaredSha256?: string
): Promise<FileValidationResult> {
  if (bytes.length === 0) {
    return { valid: false, error: "Attachment payload is empty." };
  }

  if (bytes.length > MAX_ATTACHMENT_BYTES) {
    return {
      valid: false,
      error: `Attachment size (${bytes.length} bytes) exceeds maximum allowable limit of ${MAX_ATTACHMENT_BYTES} bytes (5 MiB).`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(declaredMimeType as AllowedMimeType)) {
    return {
      valid: false,
      error: `Disallowed MIME type '${declaredMimeType}'. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}.`,
    };
  }

  const detected = detectMagicBytes(bytes);
  if (!detected) {
    return {
      valid: false,
      error: "File content signature does not match any allowed format (JPEG, PNG, PDF).",
    };
  }

  if (detected !== declaredMimeType) {
    return {
      valid: false,
      error: `MIME type mismatch: declared '${declaredMimeType}' but detected '${detected}' from file signature.`,
    };
  }

  if (containsMaliciousScriptMarkers(bytes)) {
    return {
      valid: false,
      error: "Suspicious script or HTML payload detected within file header.",
    };
  }

  const computedSha256 = await computeSha256Hex(bytes);

  if (declaredSha256 && computedSha256.toLowerCase() !== declaredSha256.toLowerCase()) {
    return {
      valid: false,
      error: "SHA-256 checksum mismatch: computed hash does not match declared hash.",
      detectedMimeType: detected,
      computedSha256,
    };
  }

  return {
    valid: true,
    detectedMimeType: detected,
    computedSha256,
  };
}
