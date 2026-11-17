import "server-only";
import type { AttachmentStoragePort } from "@/modules/attachments/port";
import type { AttachmentMetadata, AttachmentReserveRequest } from "@/contracts/attachments";
import { createSupabaseServerClient } from "./client";
import { getServerEnvironment } from "@/config/server";

export class SupabaseAttachmentAdapter implements AttachmentStoragePort {
  async reserve(request: AttachmentReserveRequest): Promise<AttachmentMetadata> {
    // A reservation without a bounded content pipeline creates orphaned
    // metadata and can be abused for unbounded storage. Keep it unavailable.
    void request;
    throw new Error("Attachment reservation requires a verified security pipeline.");
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
    const env = getServerEnvironment();
    if (env.SIGNALPULSE_DATA_MODE !== "cloud_preview" || env.SIGNALPULSE_ATTACHMENTS_ENABLED !== "true") throw new Error("Attachment upload is disabled.");
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error("Cloud storage disabled in synthetic mode");
    }

    // No scanner, content sniffing or digest verification is implemented. Never
    // turn untrusted bytes into a clean, downloadable evidence asset.
    void id;
    void fileBytes;
    throw new Error("Attachment content upload requires a verified security pipeline.");
  }

  async downloadContent(id: string): Promise<{ data: Uint8Array; mimeType: string; originalFilename: string }> {
    const env = getServerEnvironment();
    if (env.SIGNALPULSE_DATA_MODE !== "cloud_preview" || env.SIGNALPULSE_ATTACHMENTS_ENABLED !== "true") throw new Error("Attachment download is disabled.");
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
    const env = getServerEnvironment();
    if (env.SIGNALPULSE_DATA_MODE !== "cloud_preview" || env.SIGNALPULSE_ATTACHMENTS_ENABLED !== "true") throw new Error("Attachment deletion is disabled.");
    const supabase = await createSupabaseServerClient();
    if (!supabase) throw new Error("Cloud attachments are disabled.");

    const meta = await this.getMetadata(id);

    // Delete from storage bucket
    const { error: storageError } = await supabase.storage.from("evidence-attachments").remove([meta.storage_path]);
    if (storageError) throw new Error("Attachment object deletion could not be confirmed.");

    // Mark as deleting / remove metadata
    const { data: removed, error: metadataError } = await supabase.from("attachment_metadata").delete().eq("id", id).select("id").maybeSingle();
    if (metadataError || !removed) throw new Error("Attachment metadata deletion could not be confirmed.");
  }
}
