import "server-only";
import type { IncidentJournalPort } from "@/modules/incidents/port";
import type { Incident, IncidentCreate, IncidentReplace } from "@/contracts/incidents";
import type { Page } from "@/contracts/common";
import { createSupabaseServerClient } from "./client";
import { createSyntheticFixtures } from "@/fixtures/synthetic";

interface IncidentRow {
  id: string;
  owner_id: string;
  client_record_id: string;
  operator: string;
  area_id: string | null;
  category: string;
  occurred_at: string;
  narrative: string;
  complaint_reference: string | null;
  complaint_contacted_at: string | null;
  provenance: "user_reported";
  revision: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  deleted_at: string | null;
}

function rowToIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    client_record_id: row.client_record_id,
    fields: {
      operator: row.operator as "mtn" | "airtel" | "glo" | "t2mobile",
      area_id: row.area_id,
      category: row.category as "failed_call" | "dropped_call" | "unusable_internet" | "suspicious_data_depletion" | "failed_airtime_data_purchase" | "billing_dispute",
      occurred_at: row.occurred_at,
      narrative: row.narrative,
      complaint_reference: row.complaint_reference,
      complaint_contacted_at: row.complaint_contacted_at,
    },
    provenance: "user_reported",
    revision: row.revision,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at,
  };
}

export class SupabaseIncidentAdapter implements IncidentJournalPort {
  async list(): Promise<Page<Incident>> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const { incident } = createSyntheticFixtures();
      return { items: [incident], next_cursor: null };
    }

    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error("Failed to list private incidents: " + error.message);
    }

    const items = (data as IncidentRow[]).map(rowToIncident);
    return { items, next_cursor: null };
  }

  async read(id: string): Promise<Incident> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const { incident } = createSyntheticFixtures();
      if (id === incident.id) return incident;
      throw new Error("Incident not found");
    }

    const { data, error } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      throw new Error("Incident not found or inaccessible");
    }

    return rowToIncident(data as IncidentRow);
  }

  async create(request: IncidentCreate): Promise<Incident> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const { incident } = createSyntheticFixtures();
      return {
        ...incident,
        client_record_id: request.client_record_id,
        fields: request.fields,
        created_at: request.client_created_at,
        updated_at: request.client_created_at,
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Active session required to save evidence to cloud.");
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 90 * 86400_000).toISOString();

    const insertData = {
      owner_id: user.id,
      client_record_id: request.client_record_id,
      operator: request.fields.operator,
      area_id: request.fields.area_id,
      category: request.fields.category,
      occurred_at: request.fields.occurred_at,
      narrative: request.fields.narrative,
      complaint_reference: request.fields.complaint_reference,
      complaint_contacted_at: request.fields.complaint_contacted_at,
      provenance: "user_reported",
      revision: 1,
      created_at: now,
      updated_at: now,
      expires_at: expiresAt,
    };

    const { data, error } = await supabase
      .from("incidents")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      throw new Error("Failed to persist private incident: " + (error?.message ?? "unknown"));
    }

    return rowToIncident(data as IncidentRow);
  }

  async replace(id: string, request: IncidentReplace): Promise<Incident> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const { incident } = createSyntheticFixtures();
      return {
        ...incident,
        id,
        fields: request.fields,
        revision: request.expected_revision + 1,
        updated_at: new Date().toISOString(),
      };
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("incidents")
      .update({
        operator: request.fields.operator,
        area_id: request.fields.area_id,
        category: request.fields.category,
        occurred_at: request.fields.occurred_at,
        narrative: request.fields.narrative,
        complaint_reference: request.fields.complaint_reference,
        complaint_contacted_at: request.fields.complaint_contacted_at,
        revision: request.expected_revision + 1,
        updated_at: now,
      })
      .eq("id", id)
      .eq("revision", request.expected_revision)
      .select()
      .single();

    if (error || !data) {
      throw new Error("Failed to update incident (version conflict or inaccessible)");
    }

    return rowToIncident(data as IncidentRow);
  }

  async delete(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return;

    await supabase
      .from("incidents")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
  }
}
