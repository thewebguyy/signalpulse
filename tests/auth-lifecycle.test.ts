import { describe, expect, it } from "vitest";
import { sessionSchema, guestCreateSchema } from "@/contracts/session";
import { linkRecoveryRequestSchema, cloudBackupConsentSchema } from "@/contracts/auth";

describe("Anonymous Identity & Account Recovery Lifecycle", () => {
  it("enforces explicit acknowledgement of guest limitations before cloud session creation", () => {
    expect(guestCreateSchema.safeParse({ accept_guest_limitations: true }).success).toBe(true);
    expect(guestCreateSchema.safeParse({ accept_guest_limitations: false }).success).toBe(false);
    expect(guestCreateSchema.safeParse({}).success).toBe(false);
  });

  it("validates recovery mode states in session schema", () => {
    const ownerId = "00000000-0000-4000-8000-000000000001";

    const unlinkedGuest = {
      state: "active_guest" as const,
      owner_id: ownerId,
      recovery_mode: "none" as const,
      csrf_token: "csrf-test-token",
    };
    expect(sessionSchema.safeParse(unlinkedGuest).success).toBe(true);

    const emailLinkedGuest = {
      state: "active_guest" as const,
      owner_id: ownerId,
      recovery_mode: "email_linked" as const,
      csrf_token: "csrf-test-token",
    };
    expect(sessionSchema.safeParse(emailLinkedGuest).success).toBe(true);
  });

  it("validates passwordless recovery email linking without requiring phone numbers", () => {
    expect(linkRecoveryRequestSchema.safeParse({ email: "subscriber@example.com" }).success).toBe(true);
    expect(linkRecoveryRequestSchema.safeParse({ email: "invalid-email" }).success).toBe(false);
    expect(linkRecoveryRequestSchema.safeParse({ phone: "+2348030000000" }).success).toBe(false); // Phone numbers strictly excluded
  });

  it("validates explicit subscriber consent records for cloud backup", () => {
    const consent = {
      consent_type: "cloud_backup" as const,
      granted: true,
      policy_version: "privacy-v0.1.0",
    };
    expect(cloudBackupConsentSchema.safeParse(consent).success).toBe(true);
  });
});
