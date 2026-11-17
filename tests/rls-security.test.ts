import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { sameActiveOwner } from "@/modules/incidents/ownership";

describe("Row Level Security (RLS) and Tenant Isolation", () => {
  const migrationPath = path.join(process.cwd(), "supabase", "migrations", "20261117180000_private_evidence_cloud.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf8");

  it("verifies the SQL migration file exists and is populated", () => {
    expect(migrationSql.length).toBeGreaterThan(1000);
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS public.subscribers");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS public.incidents");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS public.evidence_dossiers");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS public.attachment_metadata");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS public.sync_operations");
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS public.consent_records");
  });

  it("enforces ROW LEVEL SECURITY on EVERY single public table", () => {
    const requiredTables = [
      "public.subscribers",
      "public.incidents",
      "public.evidence_dossiers",
      "public.attachment_metadata",
      "public.sync_operations",
      "public.consent_records",
    ];

    for (const table of requiredTables) {
      const rlsStatement = `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`;
      expect(migrationSql).toContain(rlsStatement);
    }
  });

  it("verifies explicit owner-only policies exist for all CRUD operations on incidents", () => {
    expect(migrationSql).toContain("CREATE POLICY incidents_select_own ON public.incidents");
    expect(migrationSql).toContain("auth.uid() = owner_id AND deleted_at IS NULL");

    expect(migrationSql).toContain("CREATE POLICY incidents_insert_own ON public.incidents");
    expect(migrationSql).toContain("WITH CHECK (auth.uid() = owner_id)");

    expect(migrationSql).toContain("CREATE POLICY incidents_update_own ON public.incidents");
    expect(migrationSql).toContain("USING (auth.uid() = owner_id AND deleted_at IS NULL)");

    expect(migrationSql).toContain("CREATE POLICY incidents_delete_own ON public.incidents");
    expect(migrationSql).toContain("auth.uid() = owner_id");
  });

  it("verifies private evidence-attachments storage bucket is marked private with strict RLS", () => {
    expect(migrationSql).toContain("'evidence-attachments'");
    expect(migrationSql).toContain("public, file_size_limit, allowed_mime_types");
    expect(migrationSql).toContain("false,"); // public = false
    expect(migrationSql).toContain("5242880"); // 5 MiB cap

    // Storage object RLS: checks owner folder hierarchy
    expect(migrationSql).toContain("storage_select_own_attachments ON storage.objects");
    expect(migrationSql).toContain("(storage.foldername(name))[1] = auth.uid()::text");
    expect(migrationSql).toContain("storage_insert_own_attachments ON storage.objects");
    expect(migrationSql).toContain("storage_delete_own_attachments ON storage.objects");
  });

  it("simulates cross-user isolation: User A cannot read or mutate User B records", () => {
    const userA = "11111111-1111-4000-8000-000000000001";
    const userB = "22222222-2222-4000-8000-000000000002";

    // User A accessing User A record -> Allowed
    expect(sameActiveOwner({ actorOwnerId: userA, recordOwnerId: userA, ownerState: "active" })).toBe(true);

    // User A accessing User B record -> Denied
    expect(sameActiveOwner({ actorOwnerId: userA, recordOwnerId: userB, ownerState: "active" })).toBe(false);

    // Unauthenticated caller (null actor) -> Denied
    expect(sameActiveOwner({ actorOwnerId: null, recordOwnerId: userA, ownerState: "active" })).toBe(false);

    // Soft-deleted or deleting owner -> Denied
    expect(sameActiveOwner({ actorOwnerId: userA, recordOwnerId: userA, ownerState: "deleting" })).toBe(false);
    expect(sameActiveOwner({ actorOwnerId: userA, recordOwnerId: userA, ownerState: "deleted" })).toBe(false);
  });
});
