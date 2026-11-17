import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectMagicBytes,
  validateAttachmentBytes,
  computeSha256Hex,
  containsMaliciousScriptMarkers,
  MAX_ATTACHMENT_BYTES,
} from "@/modules/attachments/validation";
import { FailClosedMalwareScanner, type MalwareScannerPort } from "@/modules/attachments/scanner";
import { SupabaseAttachmentAdapter } from "@/server/adapters/supabase/attachment-adapter";
import { SupabaseSyncAdapter } from "@/server/adapters/supabase/sync-adapter";
import { SupabaseAuthAdapter } from "@/server/adapters/supabase/auth-adapter";
import { createSyntheticFixtures } from "@/fixtures/synthetic";

vi.mock("server-only", () => ({}));
vi.mock("@/server/adapters/supabase/client", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/config/server", () => ({ getServerEnvironment: vi.fn() }));

import { createSupabaseServerClient } from "@/server/adapters/supabase/client";
import { getServerEnvironment } from "@/config/server";

const mockClient = vi.mocked(createSupabaseServerClient);
const mockEnvironment = vi.mocked(getServerEnvironment);
const testOwner = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  vi.clearAllMocks();
  mockEnvironment.mockReturnValue({
    NODE_ENV: "test",
    SIGNALPULSE_DATA_MODE: "cloud_preview",
    NEXT_PUBLIC_ENABLE_CLOUD_BACKUP: "true",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    SIGNALPULSE_ATTACHMENTS_ENABLED: "true",
  });
});

describe("Attachment Content & Signature Validation (Fail-Closed)", () => {
  const validJpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const validPngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

  it("detects magic bytes accurately for JPEG, PNG, and PDF", () => {
    expect(detectMagicBytes(validJpegHeader)).toBe("image/jpeg");
    expect(detectMagicBytes(validPngHeader)).toBe("image/png");
    expect(detectMagicBytes(validPdfHeader)).toBe("application/pdf");
    expect(detectMagicBytes(new Uint8Array([0x00, 0x00, 0x00, 0x00]))).toBeNull();
    expect(detectMagicBytes(new Uint8Array([0x47, 0x49, 0x46]))).toBeNull(); // GIF disallowed
  });

  it("rejects empty attachment files", async () => {
    const result = await validateAttachmentBytes(new Uint8Array([]), "image/jpeg");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("empty");
  });

  it("rejects files exceeding 5 MiB", async () => {
    const oversized = new Uint8Array(MAX_ATTACHMENT_BYTES + 1);
    oversized[0] = 0xff;
    oversized[1] = 0xd8;
    oversized[2] = 0xff;
    const result = await validateAttachmentBytes(oversized, "image/jpeg");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds maximum allowable limit");
  });

  it("rejects MIME type mismatches (declared JPEG, actual PNG bytes)", async () => {
    const result = await validateAttachmentBytes(validPngHeader, "image/jpeg");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("MIME type mismatch");
  });

  it("detects and rejects dangerous embedded script and HTML polyglots", () => {
    const maliciousPayload = new TextEncoder().encode("%PDF-1.7\n<script>alert('xss')</script>");
    expect(containsMaliciousScriptMarkers(maliciousPayload)).toBe(true);

    const phpPayload = new TextEncoder().encode("\xFF\xD8\xFF<?php phpinfo(); ?>");
    expect(containsMaliciousScriptMarkers(phpPayload)).toBe(true);

    const cleanPayload = new TextEncoder().encode("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj");
    expect(containsMaliciousScriptMarkers(cleanPayload)).toBe(false);
  });

  it("verifies SHA-256 checksum and flags tampering", async () => {
    const data = validPngHeader;
    const computedHash = await computeSha256Hex(data);
    expect(computedHash).toHaveLength(64);

    // Matching hash -> valid
    const validResult = await validateAttachmentBytes(data, "image/png", computedHash);
    expect(validResult.valid).toBe(true);
    expect(validResult.computedSha256).toBe(computedHash);

    // Tampered hash -> rejected
    const tamperedResult = await validateAttachmentBytes(data, "image/png", "0".repeat(64));
    expect(tamperedResult.valid).toBe(false);
    expect(tamperedResult.error).toContain("checksum mismatch");
  });
});

describe("Malware Scanner Integration (Fail-Closed)", () => {
  it("fails closed when unconfigured and never reports clean", async () => {
    const scanner = new FailClosedMalwareScanner();
    expect(scanner.isConfigured()).toBe(false);

    const result = await scanner.scan(new Uint8Array([1, 2, 3]), "image/jpeg");
    expect(result.clean).toBe(false);
    expect(result.scannerVersion).toBe("unconfigured");
    expect(result.error).toContain("Fail-closed");
  });

  it("calls remote scanner when configured and reports clean scan", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clean: true, scanner_version: "clamav-0.104" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const scanner = new FailClosedMalwareScanner("https://scanner.internal/v1/scan");
    expect(scanner.isConfigured()).toBe(true);

    const result = await scanner.scan(new Uint8Array([1, 2, 3]), "image/png");
    expect(result.clean).toBe(true);
    expect(result.scannerVersion).toBe("clamav-0.104");

    vi.unstubAllGlobals();
  });
});

describe("Attachment Adapter Complete Pipeline", () => {
  it("enforces incident attachment quota (max 5 per incident)", async () => {
    const incidentId = crypto.randomUUID();
    const mockScanner: MalwareScannerPort = {
      isConfigured: () => true,
      scan: async () => ({ clean: true, scannerVersion: "mock-v1", scannedAt: new Date().toISOString() }),
    };

    const getUser = vi.fn(async () => ({ data: { user: { id: testOwner } }, error: null }));
    const single = vi.fn(async () => ({ data: { id: incidentId, owner_id: testOwner }, error: null }));

    const from = vi.fn((table: string) => {
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                is: () => ({ single }),
              }),
            }),
          }),
        };
      }
      if (table === "attachment_metadata") {
        return {
          select: () => ({
            eq: () => ({
              neq: async () => ({ count: 5, error: null }), // Already 5 attachments!
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    mockClient.mockResolvedValue({ auth: { getUser }, from } as never);

    const adapter = new SupabaseAttachmentAdapter(mockScanner);
    await expect(
      adapter.reserve({
        incident_id: incidentId,
        original_filename: "receipt.png",
        file_type: "receipt",
        mime_type: "image/png",
        byte_size: 1024,
        sha256_hash: "a".repeat(64),
      })
    ).rejects.toThrow("quota exceeded");
  });

  it("denies download of quarantined or unscanned attachments", async () => {
    const attachmentId = crypto.randomUUID();
    const getUser = vi.fn(async () => ({ data: { user: { id: testOwner } }, error: null }));
    const single = vi.fn(async () => ({
      data: {
        id: attachmentId,
        status: "quarantined", // Quarantined, not clean!
        storage_path: "path/to/file.png",
        mime_type: "image/png",
        original_filename: "receipt.png",
      },
      error: null,
    }));

    const from = vi.fn(() => ({
      select: () => ({
        eq: () => ({
          neq: () => ({ single }),
        }),
      }),
    }));

    mockClient.mockResolvedValue({ auth: { getUser }, from } as never);

    const adapter = new SupabaseAttachmentAdapter();
    await expect(adapter.downloadContent(attachmentId)).rejects.toThrow("quarantined or awaiting security scan");
  });
});

describe("Transactional Sync & Idempotency", () => {
  it("returns cached payload on idempotent replay with matching mutation ID", async () => {
    const { incident } = createSyntheticFixtures();
    const mutationId = "mutation-test-12345";
    const cachedResponse = {
      synced_count: 1,
      failed_count: 0,
      conflicts: [],
      synced_at: "2026-11-17T20:00:00.000Z",
    };

    const getUser = vi.fn(async () => ({ data: { user: { id: testOwner } }, error: null }));
    const maybeSingle = vi.fn(async () => ({
      data: { status: "completed", payload: cachedResponse },
      error: null,
    }));

    const from = vi.fn((table: string) => {
      if (table === "sync_operations") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({ maybeSingle }),
            }),
          }),
        };
      }
      throw new Error(`Should not touch ${table} on idempotent hit`);
    });

    mockClient.mockResolvedValue({ auth: { getUser }, from } as never);

    const adapter = new SupabaseSyncAdapter();
    const result = await adapter.processBatch({
      client_mutation_id: mutationId,
      incidents: [incident],
      deleted_incident_ids: [],
    });

    expect(result).toEqual(cachedResponse);
    expect(from).toHaveBeenCalledWith("sync_operations");
  });

  it("detects conflict when server copy has a newer revision", async () => {
    const { incident } = createSyntheticFixtures();
    incident.revision = 1;

    const getUser = vi.fn(async () => ({ data: { user: { id: testOwner } }, error: null }));
    const from = vi.fn((table: string) => {
      if (table === "sync_operations") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
          upsert: async () => ({ error: null }),
          update: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
        };
      }
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: incident.id,
                  revision: 3, // Server has revision 3 > client revision 1
                  operator: incident.fields.operator,
                  area_id: incident.fields.area_id,
                  category: incident.fields.category,
                  occurred_at: incident.fields.occurred_at,
                  narrative: incident.fields.narrative,
                },
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    mockClient.mockResolvedValue({ auth: { getUser }, from } as never);

    const adapter = new SupabaseSyncAdapter();
    const result = await adapter.processBatch({
      client_mutation_id: "mutation-revision-conflict",
      incidents: [incident],
      deleted_incident_ids: [],
    });

    expect(result.conflicts).toHaveLength(1);
    const firstConflict = result.conflicts[0];
    expect(firstConflict).toBeDefined();
    if (firstConflict) {
      expect(firstConflict.reason).toContain("Server copy has a newer revision");
      expect(firstConflict.server_revision).toBe(3);
      expect(firstConflict.client_revision).toBe(1);
    }
  });

  it("treats identical payload with same revision as an idempotent confirmation", async () => {
    const { incident } = createSyntheticFixtures();
    incident.revision = 2;

    const getUser = vi.fn(async () => ({ data: { user: { id: testOwner } }, error: null }));
    const from = vi.fn((table: string) => {
      if (table === "sync_operations") {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
          upsert: async () => ({ error: null }),
          update: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
        };
      }
      if (table === "incidents") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: incident.id,
                  revision: 2,
                  operator: incident.fields.operator,
                  area_id: incident.fields.area_id,
                  category: incident.fields.category,
                  occurred_at: incident.fields.occurred_at,
                  narrative: incident.fields.narrative,
                  complaint_reference: incident.fields.complaint_reference,
                  complaint_contacted_at: incident.fields.complaint_contacted_at,
                },
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    mockClient.mockResolvedValue({ auth: { getUser }, from } as never);

    const adapter = new SupabaseSyncAdapter();
    const result = await adapter.processBatch({
      client_mutation_id: "mutation-identical-replay",
      incidents: [incident],
      deleted_incident_ids: [],
    });

    expect(result.synced_count).toBe(1);
    expect(result.conflicts).toHaveLength(0);
    expect(result.failed_count).toBe(0);
  });
});

describe("Account Deletion & Evidence Purge Lifecycle", () => {
  it("purges storage objects and all owned records upon deleteAccount", async () => {
    const getUser = vi.fn(async () => ({ data: { user: { id: testOwner } }, error: null }));
    const subscriberUpdate = vi.fn(async () => ({ error: null }));
    const deleteFn = vi.fn(async () => ({ error: null }));
    const removeStorage = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));

    const from = vi.fn((table: string) => {
      if (table === "subscribers") {
        return { update: () => ({ eq: subscriberUpdate }) };
      }
      if (table === "attachment_metadata") {
        return {
          select: () => ({
            eq: async () => ({
              data: [{ storage_path: "path/1.png" }, { storage_path: "path/2.pdf" }],
              error: null,
            }),
          }),
          delete: () => ({ eq: deleteFn }),
        };
      }
      if (["evidence_dossiers", "sync_operations", "consent_records", "incidents"].includes(table)) {
        return {
          delete: () => ({ eq: deleteFn }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    });

    mockClient.mockResolvedValue({
      auth: { getUser, signOut },
      from,
      storage: {
        from: () => ({ remove: removeStorage }),
      },
    } as never);

    const authAdapter = new SupabaseAuthAdapter();
    await authAdapter.deleteAccount();

    expect(subscriberUpdate).toHaveBeenCalledWith("id", testOwner);
    expect(removeStorage).toHaveBeenCalledWith(["path/1.png", "path/2.pdf"]);
    expect(deleteFn).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
  });
});
