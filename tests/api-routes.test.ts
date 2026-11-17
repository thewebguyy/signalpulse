import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));
import { GET as getSession, POST as postSession } from "@/app/api/v1/session/route";
import { POST as postRecovery } from "@/app/api/v1/session/recovery/route";
import { POST as postLogout } from "@/app/api/v1/session/logout/route";
import { POST as postSync } from "@/app/api/v1/incidents/sync/route";
import { POST as postAttachment } from "@/app/api/v1/attachments/route";
import { createSyntheticFixtures } from "@/fixtures/synthetic";

describe("API v1 Cloud Evidence Endpoints", () => {
  const { incident } = createSyntheticFixtures();

  it("GET /api/v1/session returns signed_out state in synthetic mode", async () => {
    const res = await getSession();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.state).toBe("signed_out");
    expect(body.data.recovery_mode).toBe("none");
    expect(body.meta.contract_version).toBe("0.1.0");
  });

  it("POST /api/v1/session rejects creation without explicit limitations acknowledgement", async () => {
    const req = new Request("http://127.0.0.1/api/v1/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept_guest_limitations: false }),
    });

    const res = await postSession(req);
    expect(res.status).toBe(400);
  });

  it("POST /api/v1/session establishes active guest session when limitations acknowledged", async () => {
    const req = new Request("http://127.0.0.1/api/v1/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept_guest_limitations: true }),
    });

    const res = await postSession(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.state).toBe("active_guest");
    expect(body.data.owner_id).toBeDefined();
  });

  it("POST /api/v1/session/recovery links email without phone number", async () => {
    const req = new Request("http://127.0.0.1/api/v1/session/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "subscriber@example.com" }),
    });

    const res = await postRecovery(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.recovery_mode).toBe("email_linked");
  });

  it("POST /api/v1/session/logout revokes session with 204 No Content", async () => {
    const res = await postLogout();
    expect(res.status).toBe(204);
  });

  it("POST /api/v1/incidents/sync processes batch mutations idempotently", async () => {
    const req = new Request("http://127.0.0.1/api/v1/incidents/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_mutation_id: "mut-test-1",
        incidents: [incident],
        deleted_incident_ids: [],
      }),
    });

    const res = await postSync(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.synced_count).toBe(1);
    expect(body.data.conflicts).toEqual([]);
  });

  it("POST /api/v1/attachments reserves private evidence slot within 5MB cap", async () => {
    const req = new Request("http://127.0.0.1/api/v1/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incident_id: incident.id,
        original_filename: "bank_receipt.jpg",
        file_type: "receipt",
        mime_type: "image/jpeg",
        byte_size: 1024 * 300,
        sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      }),
    });

    const res = await postAttachment(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.status).toBe("reserved");
    expect(body.data.incident_id).toBe(incident.id);
  });
});
