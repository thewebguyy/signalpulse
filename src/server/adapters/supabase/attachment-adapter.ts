import "server-only";
import type { AttachmentStoragePort } from "@/modules/attachments/port";
import type { AttachmentMetadata, AttachmentReserveRequest } from "@/contracts/attachments";
import { createSupabaseServerClient } from "./client";

export class SupabaseAttachmentAdapter implements AttachmentStoragePort {
  async reserve(request: AttachmentReserveRequest): Promise<AttachmentMetadata> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      const now = new Date().toISOString();
      return {
        id: crypto.randomUUID(),
        incident_id: request.incident_id,
        storage_path: `synthetic/${request.incident_id}/${request.sha256_hash.slice(0, 16)}.bin`,
        original_filename: request.original_filename,
        file_type: request.file_type,
        mime_type: request.mime_type,
        byte_size: request.byte_size,
        sha256_hash: request.sha256_hash,
        status: "reserved",
        created_at: now,
        scanned_at: null,
      };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Active session required to upload attachments.");
    }

    const id = crypto.randomUUID();
    const storagePath = `${user.id}/${request.incident_id}/${id}.bin`;
    const now = new Date().toISOString();

    const insertData = {
      id,
      owner_id: user.id,
      incident_id: request.incident_id,
      storage_path: storagePath,
      original_filename: request.original_filename,
      file_type: request.file_type,
      mime_type: request.mime_type,
      byte_size: request.byte_size,
      sha256_hash: request.sha256_hash,
      status: "reserved",
      created_at: now,
    };

    const { data, error } = await supabase
      .from("attachment_metadata")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      throw new Error("Failed to reserve attachment slot: " + (error?.message ?? "unknown"));
    }

    return {
      id: data.id,
      incident_id: data.incident_id,
      storage_path: data.storage_path,
      original_filename: data.original_filename,
      file_type: data.file_type,
      mime_type: data.mime_type,
      byte_size: data.byte_size,
      sha256_hash: data.sha256_hash,
      status: data.status,
      created_at: data.created_at,
      scanned_at: data.scanned_at,
    };
  }

  async getMetadata(id: string): Promise<AttachmentMetadata> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error("Attachment not found in synthetic mode");
    }

    const { data, error } = await supabase
      .from("attachment_metadata")
      .select("*")
      .eq("id", id)
      .neq("status", "deleting")
      .single();

    if (error || !data) {
      throw new Error("Attachment not found or inaccessible");
    }

    return {
      id: data.id,
      incident_id: data.incident_id,
      storage_path: data.storage_path,
      original_filename: data.original_filename,
      file_type: data.file_type,
      mime_type: data.mime_type,
      byte_size: data.byte_size,
      sha256_hash: data.sha256_hash,
      status: data.status,
      created_at: data.created_at,
      scanned_at: data.scanned_at,
    };
  }

  async uploadContent(id: string, fileBytes: Uint8Array): Promise<AttachmentMetadata> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error("Cloud storage disabled in synthetic mode");
    }

    const meta = await this.getMetadata(id);

    // Upload to private evidence-attachments bucket
    const { error: uploadError } = await supabase.storage
      .from("evidence-attachments")
      .upload(meta.storage_path, fileBytes, {
        contentType: meta.mime_type,
        upsert: false,
      });

    if (uploadError) {
      await supabase.from("attachment_metadata").update({ status: "rejected" }).eq("id", id);
      throw new Error("Failed to store attachment in private vault: " + uploadError.message);
    }

    // Mark as clean / quarantined
    const now = new Date().toISOString();
    const { data, error: updateError } = await supabase
      .from("attachment_metadata")
      .update({ status: "clean", scanned_at: now })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !data) {
      throw new Error("Failed to finalize attachment state");
    }

    return {
      id: data.id,
      incident_id: data.incident_id,
      storage_path: data.storage_path,
      original_filename: data.original_filename,
      file_type: data.file_type,
      mime_type: data.mime_type,
      byte_size: data.byte_size,
      sha256_hash: data.sha256_hash,
      status: data.status,
      created_at: data.created_at,
      scanned_at: data.scanned_at,
    };
  }

  async downloadContent(id: string): Promise<{ data: Uint8Array; mimeType: string; originalFilename: string }> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error("Cloud storage disabled in synthetic mode");
    }

    const meta = await this.getMetadata(id);
    if (meta.status !== "clean") {
      throw new Error("Attachment is quarantined or awaiting security scan");
    }

    const { data, error } = await supabase.storage
      .from("evidence-attachments")
      .download(meta.storage_path);

    if (error || !data) {
      throw new Error("Failed to stream attachment: " + (error?.message ?? "unknown"));
    }

    const arrayBuffer = await data.arrayBuffer();
    return {
      data: new Uint8Array(arrayBuffer),
      mimeType: meta.mime_type,
      originalFilename: meta.original_filename,
    };
  }

  async delete(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return;

    const meta = await this.getMetadata(id);

    // Delete from storage bucket
    await supabase.storage.from("evidence-attachments").remove([meta.storage_path]);

    // Mark as deleting / remove metadata
    await supabase.from("attachment_metadata").delete().eq("id", id);
  }
}
