import { describe, expect, it } from "vitest";
import { parseEnvironment } from "@/config/environment";
import { createFailure } from "@/server/errors";
import { errorStatus, failureSchema, type ErrorCode } from "@/contracts/common";
import { sameActiveOwner } from "@/modules/incidents/ownership";

describe("environment fails closed", () => {
  it("runs without credentials and supports production compilation in synthetic mode", () => {
    expect(parseEnvironment({})).toEqual({ NODE_ENV: "development", SIGNALPULSE_DATA_MODE: "synthetic" });
    expect(parseEnvironment({ NODE_ENV: "production", PATH: "ordinary-host-variable", NEXT_PUBLIC_VERCEL_ENV: "production" }).SIGNALPULSE_DATA_MODE).toBe("synthetic");
  });
  it.each([{ SIGNALPULSE_DATA_MODE: "live" }, { SUPABASE_SERVICE_ROLE_KEY: "do-not-leak" }, { NEXT_PUBLIC_TOKEN: "do-not-leak" }, { SIGNALPULSE_UNKNOWN: "do-not-leak" }, { NODE_ENV: "do-not-leak" }])("rejects unsupported configuration without echoing values", (input) => {
    expect(() => parseEnvironment(input)).toThrow();
    try { parseEnvironment(input); } catch (error) { expect(String(error)).not.toContain("do-not-leak"); }
  });
  it("rejects privileged keys even when cloud preview mode is selected", () => {
    expect(() => parseEnvironment({ SIGNALPULSE_DATA_MODE: "cloud_preview", SUPABASE_SERVICE_ROLE_KEY: "secret" })).toThrow("Privileged");
  });
});
describe("safe API error envelopes", () => {
  const codes = Object.keys(errorStatus).filter((code) => code !== "operation_in_progress") as Exclude<ErrorCode, "operation_in_progress">[];
  it.each(codes)("maps %s with safe metadata", (code) => {
    const result = createFailure(code, "00000000-0000-4000-8000-000000000001");
    expect(result.status).toBe(errorStatus[code]);
    expect(failureSchema.parse(result.body)).toEqual(result.body);
    expect(result.body.error.fields).toEqual([]);
    expect(result.body.error.retry_after_seconds).toBe(result.body.error.retryable ? 5 : null);
  });
  it("denies invalid correlation IDs and unknown error codes", () => {
    expect(() => createFailure("not_found", "raw-stack-secret")).toThrow();
    const body = createFailure("not_found", "00000000-0000-4000-8000-000000000001").body;
    expect(failureSchema.safeParse({ ...body, error: { ...body.error, code: "database_password" } }).success).toBe(false);
  });
});
describe("ownership predicate (not authentication or RLS)", () => {
  it("permits only matching active ownership", () => {
    expect(sameActiveOwner({ actorOwnerId: "A", recordOwnerId: "A", ownerState: "active" })).toBe(true);
    for (const actorOwnerId of [null, "B"]) expect(sameActiveOwner({ actorOwnerId, recordOwnerId: "A", ownerState: "active" })).toBe(false);
    for (const ownerState of ["deleting", "deleted"] as const) expect(sameActiveOwner({ actorOwnerId: "A", recordOwnerId: "A", ownerState })).toBe(false);
  });
});
