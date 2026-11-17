import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSyntheticFixtures } from "@/fixtures/synthetic";
import { isSameOriginMutation } from "@/server/request-origin";

vi.mock("server-only", () => ({}));
vi.mock("@/server/adapters/supabase/client", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/config/server", () => ({ getServerEnvironment: vi.fn() }));

import { createSupabaseServerClient } from "@/server/adapters/supabase/client";
import { getServerEnvironment } from "@/config/server";
import { SupabaseAuthAdapter } from "@/server/adapters/supabase/auth-adapter";
import { SupabaseAttachmentAdapter } from "@/server/adapters/supabase/attachment-adapter";
import { SupabaseSyncAdapter } from "@/server/adapters/supabase/sync-adapter";

const mockClient = vi.mocked(createSupabaseServerClient);
const mockEnvironment = vi.mocked(getServerEnvironment);
const owner = "11111111-1111-4111-8111-111111111111";

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

describe("cloud boundary regressions (mocked, not hosted RLS)", () => {
  it("requires exact same-origin browser mutations", () => {
    expect(isSameOriginMutation(new Request("https://app.example/api", { method: "POST", headers: { Origin: "https://app.example" } }))).toBe(true);
    for (const origin of ["https://other.example", "null", "https://app.example.evil.test"]) {
      expect(isSameOriginMutation(new Request("https://app.example/api", { method: "POST", headers: { Origin: origin } }))).toBe(false);
    }
    expect(isSameOriginMutation(new Request("https://app.example/api", { method: "POST" }))).toBe(false);
  });

  it("checks verified user and active profile rather than trusting cookie-local session", async () => {
    const getUser = vi.fn(async () => ({ data: { user: { id: owner } }, error: null }));
    const getSession = vi.fn(() => { throw new Error("Unverified cookie state must not be read"); });
    const single = vi.fn(async () => ({ data: { status: "active", recovery_mode: "none" }, error: null }));
    mockClient.mockResolvedValue({ auth: { getUser, getSession }, from: vi.fn(() => ({ select: () => ({ eq: () => ({ single }) }) })) } as never);
    const result = await new SupabaseAuthAdapter().readSession();
    expect(result.owner_id).toBe(owner);
    expect(getUser).toHaveBeenCalledOnce();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("does not expose an owner for an invalid or expired provider session", async () => {
    mockClient.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: null }, error: new Error("expired") }) }, from: vi.fn() } as never);
    const result = await new SupabaseAuthAdapter().readSession();
    expect(result.state).toBe("signed_out");
    expect(result.owner_id).toBeNull();
  });

  it("denies a verified user whose subscriber profile is deleting", async () => {
    mockClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: owner } }, error: null }) },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { status: "deleting", recovery_mode: "none" }, error: null }) }) }) }),
    } as never);
    await expect(new SupabaseAuthAdapter().readSession()).rejects.toThrow("inactive");
  });

  it("does not initiate unverified email recovery", async () => {
    const updateUser = vi.fn();
    mockClient.mockResolvedValue({ auth: { updateUser } } as never);
    await expect(new SupabaseAuthAdapter().linkRecovery({ email: "example@example.com" })).rejects.toThrow("not yet available");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("never promotes unscanned attachment bytes to clean", async () => {
    const from = vi.fn();
    const storage = { from: vi.fn() };
    mockClient.mockResolvedValue({ from, storage } as never);
    await expect(new SupabaseAttachmentAdapter().uploadContent(crypto.randomUUID(), new Uint8Array([1, 2]))).rejects.toThrow("verified security pipeline");
    expect(from).not.toHaveBeenCalled();
    expect(storage.from).not.toHaveBeenCalled();
  });

  it("does not create orphaned attachment reservations before upload controls exist", async () => {
    const from = vi.fn();
    mockClient.mockResolvedValue({ from } as never);
    await expect(new SupabaseAttachmentAdapter().reserve({
      incident_id: crypto.randomUUID(),
      original_filename: "fictional.png",
      file_type: "receipt",
      mime_type: "image/png",
      byte_size: 3,
      sha256_hash: "0".repeat(64),
    })).rejects.toThrow("verified security pipeline");
    expect(from).not.toHaveBeenCalled();
  });

  it("does not trust a forged completed sync ledger entry", async () => {
    const { incident } = createSyntheticFixtures();
    const insert = vi.fn(() => ({ select: () => ({ maybeSingle: async () => ({ data: { id: incident.id }, error: null }) }) }));
    const from = vi.fn((table: string) => {
      if (table !== "incidents") throw new Error("The client-writable ledger must not be read as proof");
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }), insert };
    });
    mockClient.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: { id: owner } } }) }, from } as never);
    const result = await new SupabaseSyncAdapter().processBatch({
      client_mutation_id: "replayed-key",
      incidents: [incident],
      deleted_incident_ids: [],
    });
    expect(result.synced_count).toBe(1);
    expect(insert).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith("incidents");
  });
});
