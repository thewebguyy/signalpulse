-- SignalPulse NG — Private Evidence Cloud Foundation Migration
-- Version: 0.1.0 (CTO012)
-- Architecture: ADR-001 (Web & Managed Data), ADR-002 (Guest Ownership), ADR-003 (Private Evidence)
-- Canonical Reference: docs/contracts/domain.md, docs/contracts/api-v1.md, docs/contracts/auth-sessions.md

-- ==============================================================================
-- 1. EXTENSIONS & SCHEMAS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. SUBSCRIBER PROFILES & IDENTITY
-- ==============================================================================
-- Maps 1:1 with Supabase Auth users (both anonymous guests and linked accounts)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleting', 'deleted')),
    recovery_mode TEXT NOT NULL DEFAULT 'none' CHECK (recovery_mode IN ('none', 'email_linked', 'passkey')),
    recovery_identifier_hash TEXT NULL,
    backup_enrolled BOOLEAN NOT NULL DEFAULT false,
    consent_version TEXT NULL,
    consent_timestamp TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. INCIDENTS (PRIVATE EVIDENCE JOURNAL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_record_id UUID NOT NULL,
    operator TEXT NOT NULL CHECK (operator IN ('mtn', 'airtel', 'glo', 't2mobile')),
    area_id TEXT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'failed_call',
        'dropped_call',
        'unusable_internet',
        'suspicious_data_depletion',
        'failed_airtime_data_purchase',
        'billing_dispute'
    )),
    occurred_at TIMESTAMPTZ NOT NULL,
    narrative TEXT NOT NULL CHECK (char_length(narrative) >= 1 AND char_length(narrative) <= 4000),
    complaint_reference TEXT NULL CHECK (complaint_reference IS NULL OR (char_length(complaint_reference) >= 1 AND char_length(complaint_reference) <= 128)),
    complaint_contacted_at TIMESTAMPTZ NULL,
    provenance TEXT NOT NULL DEFAULT 'user_reported' CHECK (provenance = 'user_reported'),
    revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_incidents_owner_client_record UNIQUE (owner_id, client_record_id)
);

CREATE INDEX IF NOT EXISTS idx_incidents_owner_created ON public.incidents(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_owner_active ON public.incidents(owner_id) WHERE deleted_at IS NULL;

-- ==============================================================================
-- 4. EVIDENCE DOSSIERS (COMPLAINT PACKAGES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evidence_dossiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Evidence Dossier',
    consumer_statement TEXT NULL,
    incident_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE INDEX IF NOT EXISTS idx_dossiers_owner ON public.evidence_dossiers(owner_id);

-- ==============================================================================
-- 5. ATTACHMENT METADATA (PRIVATE EVIDENCE ASSETS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attachment_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('receipt', 'debit_screenshot', 'ussd_error', 'other')),
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'application/pdf')),
    byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 5242880), -- 5 MiB hard limit
    sha256_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'quarantined' CHECK (status IN ('reserved', 'quarantined', 'clean', 'rejected', 'deleting')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    scanned_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_incident ON public.attachment_metadata(incident_id);
CREATE INDEX IF NOT EXISTS idx_attachments_owner ON public.attachment_metadata(owner_id);

-- ==============================================================================
-- 6. SYNC OPERATIONS (IDEMPOTENT REPLAY & CONFLICT LOG)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_mutation_id TEXT NOT NULL,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('upsert_incident', 'delete_incident', 'link_account', 'enroll_backup')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'conflict')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_sync_owner_mutation UNIQUE (owner_id, client_mutation_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_operations_owner ON public.sync_operations(owner_id, created_at DESC);

-- ==============================================================================
-- 7. CONSENT & PRIVACY PREFERENCES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('cloud_backup', 'attachment_storage', 'anonymous_metrics')),
    granted BOOLEAN NOT NULL,
    policy_version TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_owner ON public.consent_records(owner_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Invariant: Every table has RLS enabled.
-- Invariant: Cross-user access is strictly denied.
-- Invariant: Anonymous role cannot read or mutate records without valid auth.uid().

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachment_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Subscribers policies
CREATE POLICY subscribers_select_own ON public.subscribers
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY subscribers_insert_own ON public.subscribers
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY subscribers_update_own ON public.subscribers
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY subscribers_delete_own ON public.subscribers
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

-- Incidents policies (Active records only for select/update)
CREATE POLICY incidents_select_own ON public.incidents
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id AND deleted_at IS NULL);

CREATE POLICY incidents_insert_own ON public.incidents
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY incidents_update_own ON public.incidents
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY incidents_delete_own ON public.incidents
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);

-- Evidence dossiers policies
CREATE POLICY dossiers_select_own ON public.evidence_dossiers
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY dossiers_insert_own ON public.evidence_dossiers
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY dossiers_update_own ON public.evidence_dossiers
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY dossiers_delete_own ON public.evidence_dossiers
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);

-- Attachment metadata policies
CREATE POLICY attachments_select_own ON public.attachment_metadata
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id AND status != 'deleting');

CREATE POLICY attachments_insert_own ON public.attachment_metadata
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY attachments_update_own ON public.attachment_metadata
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY attachments_delete_own ON public.attachment_metadata
    FOR DELETE TO authenticated
    USING (auth.uid() = owner_id);

-- Sync operations policies
CREATE POLICY sync_select_own ON public.sync_operations
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY sync_insert_own ON public.sync_operations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY sync_update_own ON public.sync_operations
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Consent records policies
CREATE POLICY consent_select_own ON public.consent_records
    FOR SELECT TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY consent_insert_own ON public.consent_records
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET & OBJECT POLICIES
-- ==============================================================================
-- Create the private evidence-attachments bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'evidence-attachments',
    'evidence-attachments',
    false,
    5242880, -- 5 MiB
    ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- Storage RLS: Owner-isolated folder hierarchy (evidence-attachments/{owner_id}/*)
CREATE POLICY storage_select_own_attachments ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'evidence-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY storage_insert_own_attachments ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'evidence-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY storage_delete_own_attachments ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'evidence-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ==============================================================================
-- 10. AUTH TRIGGER: AUTO-PROVISION SUBSCRIBER RECORD
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_subscriber()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.subscribers (id, status, recovery_mode, backup_enrolled)
    VALUES (NEW.id, 'active', 'none', false)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscriber();
