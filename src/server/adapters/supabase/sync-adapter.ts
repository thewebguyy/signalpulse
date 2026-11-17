import "server-only";
import type { SyncPort } from "@/modules/sync/port";
import type { SyncBatchRequest, SyncBatchResponse } from "@/contracts/sync";
import { createSupabaseServerClient } from "./client";

export class SupabaseSyncAdapter implements SyncPort {
  async processBatch(request: SyncBatchRequest): Promise<SyncBatchResponse> {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();

    if (!supabase) {
      // In synthetic mode, pretend all local records synced safely
      return {
        synced_count: request.incidents.length + request.deleted_incident_ids.length,
        failed_count: 0,
        conflicts: [],
        synced_at: now,
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Active session required to synchronize evidence with cloud vault.");
    }

    // Idempotency ledger check
    const { data: existingSync } = await supabase
      .from("sync_operations")
      .select("id, status")
      .eq("client_mutation_id", request.client_mutation_id)
      .maybeSingle();

    if (existingSync && existingSync.status === "completed") {
      return {
        synced_count: request.incidents.length,
        failed_count: 0,
        conflicts: [],
        synced_at: now,
      };
    }

    // Register sync operation in progress
    await supabase.from("sync_operations").upsert({
      owner_id: user.id,
      client_mutation_id: request.client_mutation_id,
      operation_type: "upsert_incident",
      status: "pending",
      payload: { count: request.incidents.length },
      created_at: now,
    });

    let syncedCount = 0;
    let failedCount = 0;
    const conflicts: SyncBatchResponse["conflicts"] = [];

    // Process incidents
    for (const item of request.incidents) {
      try {
        // Check if an incident with this client_record_id already exists for this owner
        const { data: existing } = await supabase
          .from("incidents")
          .select("id, revision, updated_at")
          .eq("client_record_id", item.client_record_id)
          .maybeSingle();

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

          // Client revision matches or is newer: update
          const { error: updateError } = await supabase
            .from("incidents")
            .update({
              operator: item.fields.operator,
              area_id: item.fields.area_id,
              category: item.fields.category,
              occurred_at: item.fields.occurred_at,
              narrative: item.fields.narrative,
              complaint_reference: item.fields.complaint_reference,
              complaint_contacted_at: item.fields.complaint_contacted_at,
              revision: item.revision + 1,
              updated_at: now,
            })
            .eq("id", existing.id);

          if (updateError) {
            failedCount++;
          } else {
            syncedCount++;
          }
        } else {
          // New incident: insert
          const { error: insertError } = await supabase
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
            });

          if (insertError) {
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
        await supabase
          .from("incidents")
          .update({ deleted_at: now })
          .eq("id", deleteId);
        syncedCount++;
      } catch {
        failedCount++;
      }
    }

    // Finalize sync operation status
    await supabase
      .from("sync_operations")
      .update({
        status: conflicts.length > 0 ? "conflict" : "completed",
      })
      .eq("client_mutation_id", request.client_mutation_id);

    return {
      synced_count: syncedCount,
      failed_count: failedCount,
      conflicts,
      synced_at: now,
    };
  }
}
