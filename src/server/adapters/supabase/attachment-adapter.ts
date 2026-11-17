import "server-only";
import type { AttachmentStoragePort } from "@/modules/attachments/port";
import type { AttachmentMetadata, AttachmentReserveRequest } from "@/contracts/attachments";
import { createSupabaseServerClient } from "./client";
import { getServerEnvironment } from "@/config/server";
import { validateAttachmentBytes } from "@/modules/attachments/validation";
import { FailClosedMalwareScanner, type MalwareScannerPort } from "@/modules/attachments/scanner";

const MAX_ATTACHMENTS_PER_INCIDENT = 5;

export class SupabaseAttachmentAdapter implements AttachmentStoragePort {
  private readonly scanner: MalwareScannerPort;

  constructor(scanner?: MalwareScannerPort) {
    this.scanner = scanner ?? new FailClosedMalwareScanner();
  }

  async reserve(request: AttachmentReserveRequest): Promise<AttachmentMetadata> {
    const env = getServerEnvironment();
    if (env.SIGNALPULSE_DATA_MODE !== "cloud_preview" || env.SIGNALPULSE_ATTACHMENTS_ENABLED !== "true") {
      throw new Error("Attachment reservation is disabled.");
    }

    // Fail closed if scanning pipeline is unconfigured
    if (!this.scanner.isConfigured()) {
      throw new Error("Attachment reservation requires a verified security pipeline.");
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error("Cloud attachments are disabled in synthetic mode.");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Active session required to reserve evidence attachments.");
    }

    // Check parent incident ownership and existence
    const { data: incident, error: incidentError } = await supabase
      .from("incidents")
      .select("id, owner_id")
      .eq("id", request.incident_id)
      .eq("owner_id", user.id)
      .is("deleted_at", null)
      .single();

    if (incidentError || !incident) {
      throw new Error("Parent incident not found or not owned by active subscriber.");
    }

    // Enforce quota: maximum 5 attachments per incident
    const { count, error: countError } = await supabase
      .from("attachment_metadata")
      .select("id", { count: "exact", head: true })
      .eq("incident_id", request.incident_id)
      .neq("status", "deleting");

    if (countError) {
      throw new Error("Could not verify attachment quota for incident.");
    }

    if (count !== null && count >= MAX_ATTACHMENTS_PER_INCIDENT) {
      throw new Error(`Incident attachment quota exceeded (maximum ${MAX_ATTACHMENTS_PER_INCIDENT} attachments per incident).`);
    }

    // Generate isolated random storage path (never trust client filename in path)
    const fileExtension = request.mime_type === "image/jpeg"
      ? "jpg"
      : request.mime_type === "image/png"
        ? "png"
        : "pdf";
    const storagePath = `${user.id}/${request.incident_id}/${crypto.randomUUID()}.${fileExtension}`;

    const { data: reserved, error: insertError } = await supabase
      .from("attachment_metadata")
      .insert({
        owner_id: user.id,
        incident_id: request.incident_id,
        storage_path: storagePath,
        original_filename: request.original_filename,
        file_type: request.file_type,
        mime_type: request.mime_type,
        byte_size: request.byte_size,
        sha256_hash: request.sha256_hash,
        status: "reserved",
      })
      .select("*")
      .single();

    if (insertError || !reserved) {
      throw new Error("Failed to record attachment reservation.");
    }

    return {
      id: reserved.id,
      incident_id: reserved.incident_id,
      storage_path: reserved.storage_path,
      original_filename: reserved.original_filename,
      file_type: reserved.file_type,
      mime_type: reserved.mime_type,
      byte_size: reserved.byte_size,
      sha256_hash: reserved.sha256_hash,
      status: reserved.status,
      created_at: reserved.created_at,
      scanned_at: reserved.scanned_at,
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
    const env = getServerEnvironment();
    if (env.SIGNALPULSE_DATA_MODE !== "cloud_preview" || env.SIGNALPULSE_ATTACHMENTS_ENABLED !== "true") {
      throw new Error("Attachment upload is disabled.");
    }

    // Fail closed if scanning pipeline is unconfigured
    if (!this.scanner.isConfigured()) {
      throw new Error("Attachment content upload requires a verified security pipeline.");
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      throw new Error("Cloud storage disabled in synthetic mode");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Active session required to upload attachment content.");
    }

    const meta = await this.getMetadata(id);
    if (meta.status !== "reserved") {
      throw new Error(`Attachment cannot be uploaded in '${meta.status}' status (only 'reserved' permitted).`);
    }

    // Deep content validation (magic bytes, size bounds, dangerous scripts, hash verification)
    const validation = await validateAttachmentBytes(fileBytes, meta.mime_type, meta.sha256_hash);
    if (!validation.valid) {
      // Mark attachment as rejected
      await supabase
        .from("attachment_metadata")
        .update({ status: "rejected" })
        .eq("id", id);
      throw new Error(`Attachment payload validation failed: ${validation.error}`);
    }

    // Execute malware scan
    const scanResult = await this.scanner.scan(fileBytes, meta.mime_type);
    if (!scanResult.clean) {
      await supabase
        .from("attachment_metadata")
        .update({ status: "rejected" })
        .eq("id", id);
      throw new Error(`Attachment rejected by malware scanner: ${scanResult.error ?? "Threat detected"}`);
    }

    // Stream content to private bucket
    const { error: uploadError } = await supabase.storage
      .from("evidence-attachments")
      .upload(meta.storage_path, fileBytes, {
        contentType: meta.mime_type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Promote to clean
    const { data: updated, error: updateError } = await supabase
      .from("attachment_metadata")
      .update({
        status: "clean",
        scanned_at: scanResult.scannedAt,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw new Error("Failed to record scanned attachment status.");
    }

    return {
      id: updated.id,
      incident_id: updated.incident_id,
      storage_path: updated.storage_path,
      original_filename: updated.original_filename,
      file_type: updated.file_type,
      mime_type: updated.mime_type,
      byte_size: updated.byte_size,
      sha256_hash: updated.sha256_hash,
      status: updated.status,
      created_at: updated.created_at,
      scanned_at: updated.scanned_at,
    };
  }

  async downloadContent(id: string): Promise<{ data: Uint8Array; mimeType: string; originalFilename: string }> {
    const env = getServerEnvironment();
    if (env.SIGNALPULSE_DATA_MODE !== "cloud_preview" || env.SIGNALPULSE_ATTACHMENTS_ENABLED !== "true") {
      throw new Error("Attachment download is disabled.");
    }
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
    if (env.SIGNALPULSE_DATA_MODE !== "cloud_preview" || env.SIGNALPULSE_ATTACHMENTS_ENABLED !== "true") {
      throw new Error("Attachment deletion is disabled.");
    }
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
