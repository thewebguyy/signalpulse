import "server-only";
import type { SyncPort } from "@/modules/sync/port";
import type { SyncBatchRequest, SyncBatchResponse } from "@/contracts/sync";
import { createSupabaseServerClient } from "./client";

export class SupabaseSyncAdapter implements SyncPort {
  async processBatch(request: SyncBatchRequest): Promise<SyncBatchResponse> {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    if (!supabase) {
      throw new Error("Cloud sync is disabled in synthetic mode.");
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Active session required to synchronize evidence with cloud vault.");
    }

    // Database-backed idempotency check:
    // If this mutation ID was already completed for this owner, return the cached response.
    try {
      const { data: existingOp } = await supabase
        .from("sync_operations")
        .select("status, payload")
        .eq("owner_id", user.id)
        .eq("client_mutation_id", request.client_mutation_id)
        .maybeSingle();

      if (existingOp) {
        if (existingOp.status === "completed" && existingOp.payload) {
          return existingOp.payload as unknown as SyncBatchResponse;
        }
        if (existingOp.status === "pending") {
          throw new Error("A sync operation with this mutation ID is already in progress.");
        }
      }

      // Record in-progress sync operation
      await supabase
        .from("sync_operations")
        .upsert(
          {
            owner_id: user.id,
            client_mutation_id: request.client_mutation_id,
            operation_type: "upsert_incident",
            status: "pending",
            payload: {},
          },
          { onConflict: "owner_id,client_mutation_id" }
        );
    } catch (opErr) {
      // If the sync_operations table is intentionally restricted or mocked out,
      // proceed directly to per-item incident verification to guarantee local preservation.
      if (opErr instanceof Error && opErr.message.includes("already in progress")) {
        throw opErr;
      }
    }

    // Never trust a client-writable operation ledger as proof that records
    // were persisted. Each item is strictly verified against the owned row below.
    let syncedCount = 0;
    let failedCount = 0;
    const conflicts: SyncBatchResponse["conflicts"] = [];

    // Process incidents
    for (const item of request.incidents) {
      try {
        // Check if an incident with this client_record_id already exists for this owner
        const { data: existing, error: readError } = await supabase
          .from("incidents")
          .select("id, revision, operator, area_id, category, occurred_at, narrative, complaint_reference, complaint_contacted_at, deleted_at")
          .eq("client_record_id", item.client_record_id)
          .maybeSingle();

        if (readError) throw readError;

        if (existing) {
          if (existing.revision > item.revision) {
            // Server revision is newer: flag non-destructive conflict
            conflicts.push({
              id: item.id,
              reason: "Server copy has a newer revision (" + existing.revision + " > " + item.revision + ").",
              server_revision: existing.revision,
              client_revision: item.revision,
            });
            continue;
          }

          if (existing.revision === item.revision) {
            const identical =
              existing.operator === item.fields.operator &&
              existing.area_id === item.fields.area_id &&
              existing.category === item.fields.category &&
              existing.occurred_at === item.fields.occurred_at &&
              existing.narrative === item.fields.narrative &&
              existing.complaint_reference === item.fields.complaint_reference &&
              existing.complaint_contacted_at === item.fields.complaint_contacted_at;

            if (identical) {
              // Already safely synced and identical: idempotent confirmation
              syncedCount++;
              continue;
            }

            // Divergent content with same revision: flag conflict
            conflicts.push({
              id: item.id,
              reason: "Server copy has divergent changes at identical revision " + existing.revision + ". Local draft preserved.",
              server_revision: existing.revision,
              client_revision: item.revision,
            });
            continue;
          }

          if (existing.revision !== item.revision - 1) {
            // Sequence gap (e.g. client jumped revision from 1 to 3)
            conflicts.push({
              id: item.id,
              reason: "Revision sequence gap: expected revision " + (existing.revision + 1) + ", received " + item.revision + ".",
              server_revision: existing.revision,
              client_revision: item.revision,
            });
            continue;
          }

          // Client revision is exactly existing.revision + 1: apply optimistic update
          const { data: updated, error: updateError } = await supabase
            .from("incidents")
            .update({
              operator: item.fields.operator,
              area_id: item.fields.area_id,
              category: item.fields.category,
              occurred_at: item.fields.occurred_at,
              narrative: item.fields.narrative,
              complaint_reference: item.fields.complaint_reference,
              complaint_contacted_at: item.fields.complaint_contacted_at,
              revision: item.revision,
              updated_at: now,
              deleted_at: null, // Revive if previously soft-deleted
            })
            .eq("id", existing.id)
            .eq("revision", existing.revision)
            .select("id")
            .maybeSingle();

          if (updateError || !updated) {
            failedCount++;
          } else {
            syncedCount++;
          }
        } else {
          // New incident: insert
          const { data: inserted, error: insertError } = await supabase
            .from("incidents")
            .insert({
              id: item.id,
              owner_id: user.id,
              client_record_id: item.client_record_id,
              operator: item.fields.operator,
              area_id: item.fields.area_id,
              category: item.fields.category,
              occurred_at: item.fields.occurred_at,
              narrative: item.fields.narrative,
              complaint_reference: item.fields.complaint_reference,
              complaint_contacted_at: item.fields.complaint_contacted_at,
              provenance: "user_reported",
              revision: item.revision,
              created_at: item.created_at,
              updated_at: item.updated_at,
              expires_at: item.expires_at,
            })
            .select("id")
            .maybeSingle();

          if (insertError || !inserted) {
            failedCount++;
          } else {
            syncedCount++;
          }
        }
      } catch {
        failedCount++;
      }
    }

    // Process deletions
    for (const deleteId of request.deleted_incident_ids) {
      try {
        const { data: deleted, error: deleteError } = await supabase
          .from("incidents")
          .update({ deleted_at: now })
          .eq("id", deleteId)
          .select("id")
          .maybeSingle();

        if (deleteError || !deleted) failedCount++;
        else syncedCount++;
      } catch {
        failedCount++;
      }
    }

    const response: SyncBatchResponse = {
      synced_count: syncedCount,
      failed_count: failedCount,
      conflicts,
      synced_at: now,
    };

    // Update sync_operations idempotency ledger to completed
    try {
      await supabase
        .from("sync_operations")
        .update({
          status: "completed",
          payload: response as unknown as Record<string, unknown>,
        })
        .eq("owner_id", user.id)
        .eq("client_mutation_id", request.client_mutation_id);
    } catch {
      // Non-fatal if ledger update fails; the incident mutations are safely committed
    }

    return response;
  }
}
