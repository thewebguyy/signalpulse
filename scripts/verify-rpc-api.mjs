import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

// Read the public test-project API key from stdin. Never write keys or tokens
// to source, environment files, argv, or test output.
const lineReader = createInterface({ input: process.stdin, terminal: false });
const input = await new Promise((resolve, reject) => {
  lineReader.once("line", (line) => {
    lineReader.close();
    try { resolve(JSON.parse(line)); } catch (error) { reject(error); }
  });
});

const { url, publishableKey } = input;
if (typeof url !== "string" || new URL(url).hostname !== "wpyfguutcbcutvsarwir.supabase.co" || typeof publishableKey !== "string") {
  throw new Error("Dedicated SignalPulse test project URL and publishable key required.");
}

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const anonymous = createClient(url, publishableKey, options);
const a = createClient(url, publishableKey, options);
const b = createClient(url, publishableKey, options);
const created = { a: [], b: [] };
const checks = [];
let failure = null;

function expectDenied(label, result) {
  assert.ok(result.error, label + " unexpectedly succeeded");
  checks.push(label + " denied (" + (result.error.code ?? "HTTP") + ")");
}

function fictionalIncident(ownerLabel) {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    client_record_id: randomUUID(),
    owner_id: randomUUID(), // Deliberately forged; RPC must ignore this.
    provenance: "user_reported",
    revision: 1,
    fields: {
      operator: "mtn",
      area_id: null,
      category: "failed_call",
      occurred_at: now,
      narrative: "CTO012-E fictional " + ownerLabel + " isolation fixture",
      complaint_reference: null,
      complaint_contacted_at: null,
    },
    created_at: now,
    updated_at: now,
  };
}

function mutation(incidents = [], deletedIds = [], id = randomUUID()) {
  return { p_client_mutation_id: id, p_incidents: incidents, p_deleted_ids: deletedIds };
}

try {
  expectDenied("anon apply_sync_batch", await anonymous.rpc("apply_sync_batch", mutation()));
  expectDenied("anon purge_expired_records", await anonymous.rpc("purge_expired_records", { p_retention_days: 0 }));
  expectDenied("anon handle_new_subscriber", await anonymous.rpc("handle_new_subscriber"));
  expectDenied("anon rls_auto_enable", await anonymous.rpc("rls_auto_enable"));
  checks.push("anonymous maintenance calls used a non-destructive retention argument");

  const [signA, signB] = await Promise.all([a.auth.signInAnonymously(), b.auth.signInAnonymously()]);
  assert.ifError(signA.error);
  assert.ifError(signB.error);
  assert.ok(signA.data.user?.id && signB.data.user?.id);
  assert.notEqual(signA.data.user.id, signB.data.user.id);
  checks.push("two distinct real anonymous Auth sessions");

  expectDenied("authenticated purge_expired_records", await a.rpc("purge_expired_records", { p_retention_days: 0 }));
  expectDenied("authenticated handle_new_subscriber", await a.rpc("handle_new_subscriber"));
  expectDenied("authenticated rls_auto_enable", await a.rpc("rls_auto_enable"));

  const incidentA = fictionalIncident("A");
  const incidentB = fictionalIncident("B");
  // The forged owner field must not grant cross-user ownership.
  incidentA.owner_id = signB.data.user.id;
  incidentB.owner_id = signA.data.user.id;
  const requestA = mutation([incidentA]);
  const requestB = mutation([incidentB]);
  created.a.push(incidentA.id);
  const createdA = await a.rpc("apply_sync_batch", requestA);
  assert.ifError(createdA.error);
  assert.equal(createdA.data?.synced_count, 1);
  created.b.push(incidentB.id);
  const createdB = await b.rpc("apply_sync_batch", requestB);
  assert.ifError(createdB.error);
  assert.equal(createdB.data?.synced_count, 1);
  checks.push("legitimate A/B synchronization succeeds");

  const [aOwn, aForeign, bOwn, bForeign] = await Promise.all([
    a.from("incidents").select("id,owner_id,narrative").eq("id", incidentA.id),
    a.from("incidents").select("id").eq("id", incidentB.id),
    b.from("incidents").select("id,owner_id,narrative").eq("id", incidentB.id),
    b.from("incidents").select("id").eq("id", incidentA.id),
  ]);
  for (const result of [aOwn, aForeign, bOwn, bForeign]) assert.ifError(result.error);
  assert.equal(aOwn.data.length, 1);
  assert.equal(bOwn.data.length, 1);
  assert.equal(aOwn.data[0].owner_id, signA.data.user.id);
  assert.equal(bOwn.data[0].owner_id, signB.data.user.id);
  assert.equal(aForeign.data.length, 0);
  assert.equal(bForeign.data.length, 0);
  checks.push("forged owner fields ignored; direct REST reads owner-isolated");

  const forgedDelete = await a.rpc("apply_sync_batch", mutation([], [incidentB.id]));
  assert.ifError(forgedDelete.error);
  assert.equal(forgedDelete.data?.synced_count, 0);
  assert.equal(forgedDelete.data?.failed_count, 1);
  const stillB = await b.from("incidents").select("id").eq("id", incidentB.id);
  assert.ifError(stillB.error);
  assert.equal(stillB.data.length, 1);
  checks.push("forged cross-owner RPC delete denied");

  const replay = await a.rpc("apply_sync_batch", requestA);
  assert.ifError(replay.error);
  assert.deepEqual(replay.data, createdA.data);
  checks.push("same-owner identical replay is idempotent");
} catch (error) {
  failure = error?.actual?.code ?? error?.code ?? error?.message ?? "unknown";
} finally {
  for (const [client, ids] of [[a, created.a], [b, created.b]]) {
    if (ids.length) {
      const cleanup = await client.from("incidents").delete().in("id", ids);
      if (cleanup.error) {
        checks.push("fixture cleanup failed (" + (cleanup.error.code ?? "HTTP") + ")");
        failure ??= "fixture_cleanup_failed";
      }
    }
    await client.auth.signOut();
  }
  console.log(JSON.stringify({ project: "signalpulse-ng", checks, fictional_incidents_created: created.a.length + created.b.length, failure }));
  if (failure) process.exitCode = 1;
}
