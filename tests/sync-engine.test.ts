import { describe, expect, it } from "vitest";
import { syncBatchRequestSchema, syncBatchResponseSchema } from "@/contracts/sync";
import { createSyntheticFixtures } from "@/fixtures/synthetic";

describe("Local-First Sync Engine & Replay Contracts", () => {
  const { incident } = createSyntheticFixtures();

  it("validates a well-formed sync batch request", () => {
    const validBatch = {
      client_mutation_id: "mut-20261117-001",
      incidents: [incident],
      deleted_incident_ids: [],
    };

    const parsed = syncBatchRequestSchema.safeParse(validBatch);
    expect(parsed.success).toBe(true);
  });

  it("rejects batch requests exceeding maximum items", () => {
    const tooMany = Array(51).fill(incident);
    const result = syncBatchRequestSchema.safeParse({
      client_mutation_id: "mut-overflow",
      incidents: tooMany,
      deleted_incident_ids: [],
    });
    expect(result.success).toBe(false);
  });

  it("enforces safe non-destructive conflict response semantics", () => {
    const conflictResponse = {
      synced_count: 1,
      failed_count: 0,
      conflicts: [
        {
          id: incident.id,
          reason: "Server copy has a newer revision (3 > 2)",
          server_revision: 3,
          client_revision: 2,
        },
      ],
      synced_at: new Date().toISOString(),
    };

    const parsed = syncBatchResponseSchema.safeParse(conflictResponse);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.conflicts[0]?.server_revision).toBe(3);
      expect(parsed.data.conflicts[0]?.client_revision).toBe(2);
    }
  });

  it("handles empty sync batch as valid no-op", () => {
    const emptyBatch = {
      client_mutation_id: "mut-empty",
      incidents: [],
      deleted_incident_ids: [],
    };

    expect(syncBatchRequestSchema.safeParse(emptyBatch).success).toBe(true);
  });
});
