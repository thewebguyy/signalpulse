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
    -- Retention period remains configurable until explicit founder/privacy approval (NULL = unexpired/retained).
    expires_at TIMESTAMPTZ NULL,
    deleted_at TIMESTAMPTZ NULL,
    CONSTRAINT uq_incidents_owner_client_record UNIQUE (owner_id, client_record_id)
);

CREATE INDEX IF NOT EXISTS idx_incidents_owner_created ON public.incidents(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_owner_active ON public.incidents(owner_id) WHERE deleted_at IS NULL;
ALTER TABLE public.incidents ADD CONSTRAINT uq_incidents_owner_id UNIQUE (owner_id, id);

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
    -- Retention period remains configurable until explicit founder/privacy approval (NULL = unexpired/retained).
    expires_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_dossiers_owner ON public.evidence_dossiers(owner_id);

-- ==============================================================================
-- 5. ATTACHMENT METADATA (PRIVATE EVIDENCE ASSETS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attachment_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    incident_id UUID NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('receipt', 'debit_screenshot', 'ussd_error', 'other')),
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'application/pdf')),
    byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 5242880), -- 5 MiB hard limit
    sha256_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'quarantined' CHECK (status IN ('reserved', 'quarantined', 'clean', 'rejected', 'deleting')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    scanned_at TIMESTAMPTZ NULL,
    CONSTRAINT fk_attachment_owner_incident FOREIGN KEY (owner_id, incident_id)
      REFERENCES public.incidents(owner_id, id) ON DELETE CASCADE
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
-- The current server sync path does not rely on this ledger. Keep it
-- inaccessible to browser-authenticated users until a reviewed transaction
-- protocol owns its writes.
REVOKE ALL ON public.sync_operations FROM anon, authenticated;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Subscribers policies
CREATE POLICY subscribers_select_own ON public.subscribers
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY subscribers_insert_own ON public.subscribers
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id AND recovery_mode = 'none');

CREATE POLICY subscribers_update_own ON public.subscribers
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND recovery_mode = 'none');
-- Recovery state cannot be self-asserted through PostgREST. A separately verified
-- privileged confirmation workflow is required before email_linked can be set.
REVOKE UPDATE ON public.subscribers FROM authenticated;
REVOKE INSERT, DELETE ON public.subscribers FROM authenticated;

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
    WITH CHECK (auth.uid() = owner_id AND status = 'reserved' AND scanned_at IS NULL);

CREATE POLICY attachments_update_own ON public.attachment_metadata
    FOR UPDATE TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);
-- A subscriber must never assert that unscanned content is clean.
REVOKE UPDATE ON public.attachment_metadata FROM authenticated;

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

-- No authenticated storage.objects policies are granted in this migration.
-- Upload, scanning, download and deletion require a separate reviewed pipeline.

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscriber();

-- ==============================================================================
-- 11. RETENTION LIFECYCLE & PURGE MAINTENANCE
-- ==============================================================================
-- Purges expired records only when explicitly called with an approved retention threshold.
-- Retention period remains configurable until explicit founder/privacy approval.
CREATE OR REPLACE FUNCTION public.purge_expired_records(p_retention_days integer)
RETURNS TABLE(purged_incidents bigint, purged_attachments bigint, purged_dossiers bigint) AS $$
DECLARE
    v_cutoff TIMESTAMPTZ;
    v_incidents bigint;
    v_attachments bigint;
    v_dossiers bigint;
BEGIN
    IF p_retention_days IS NULL OR p_retention_days <= 0 THEN
        RAISE EXCEPTION 'Explicit positive retention threshold required for automated purge.';
    END IF;

    v_cutoff := now() - (p_retention_days || ' days')::interval;

    -- 1. Purge attachments of expired incidents
    WITH expired_incidents AS (
        SELECT id FROM public.incidents WHERE occurred_at < v_cutoff OR (expires_at IS NOT NULL AND expires_at < now())
    ),
    deleted_att AS (
        DELETE FROM public.attachment_metadata
        WHERE incident_id IN (SELECT id FROM expired_incidents)
        RETURNING id
    )
    SELECT count(*) INTO v_attachments FROM deleted_att;

    -- 2. Purge expired dossiers
    WITH deleted_dos AS (
        DELETE FROM public.evidence_dossiers
        WHERE created_at < v_cutoff OR (expires_at IS NOT NULL AND expires_at < now())
        RETURNING id
    )
    SELECT count(*) INTO v_dossiers FROM deleted_dos;

    -- 3. Purge expired incidents
    WITH deleted_inc AS (
        DELETE FROM public.incidents
        WHERE occurred_at < v_cutoff OR (expires_at IS NOT NULL AND expires_at < now())
        RETURNING id
    )
    SELECT count(*) INTO v_incidents FROM deleted_inc;

    RETURN QUERY SELECT v_incidents, v_attachments, v_dossiers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ==============================================================================
-- 12. ATOMIC BATCH SYNCHRONIZATION FUNCTION
-- ==============================================================================
-- Executes batch mutations within a single database transaction.
-- Enforces idempotency via sync_operations and optimistic revision locks.
CREATE OR REPLACE FUNCTION public.apply_sync_batch(
    p_client_mutation_id text,
    p_incidents jsonb,
    p_deleted_ids uuid[]
)
RETURNS jsonb AS $$
DECLARE
    v_owner_id uuid;
    v_existing_op record;
    v_item jsonb;
    v_client_record_id uuid;
    v_revision int;
    v_existing record;
    v_synced_count int := 0;
    v_failed_count int := 0;
    v_conflicts jsonb := '[]'::jsonb;
    v_now timestamptz := now();
    v_delete_id uuid;
    v_result jsonb;
BEGIN
    v_owner_id := auth.uid();
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Active session required to synchronize evidence with cloud vault.';
    END IF;

    -- Check idempotency
    SELECT status, payload INTO v_existing_op
    FROM public.sync_operations
    WHERE owner_id = v_owner_id AND client_mutation_id = p_client_mutation_id;

    IF FOUND THEN
        IF v_existing_op.status = 'completed' THEN
            RETURN v_existing_op.payload;
        ELSIF v_existing_op.status = 'pending' THEN
            RAISE EXCEPTION 'A sync operation with this mutation ID is already in progress.';
        END IF;
    END IF;

    -- Record pending operation
    INSERT INTO public.sync_operations (owner_id, client_mutation_id, operation_type, status, payload)
    VALUES (v_owner_id, p_client_mutation_id, 'upsert_incident', 'pending', '{}'::jsonb)
    ON CONFLICT (owner_id, client_mutation_id) DO UPDATE SET status = 'pending';

    -- Process incident mutations
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_incidents)
    LOOP
        v_client_record_id := (v_item->>'client_record_id')::uuid;
        v_revision := (v_item->>'revision')::int;

        SELECT * INTO v_existing
        FROM public.incidents
        WHERE owner_id = v_owner_id AND client_record_id = v_client_record_id;

        IF FOUND THEN
            IF v_existing.revision > v_revision THEN
                -- Server copy is newer
                v_conflicts := v_conflicts || jsonb_build_object(
                    'id', v_item->>'id',
                    'reason', 'Server copy has a newer revision (' || v_existing.revision || ' > ' || v_revision || ').',
                    'server_revision', v_existing.revision,
                    'client_revision', v_revision
                );
            ELSIF v_existing.revision = v_revision THEN
                IF v_existing.operator = (v_item->'fields'->>'operator') AND
                   v_existing.category = (v_item->'fields'->>'category') AND
                   v_existing.narrative = (v_item->'fields'->>'narrative') THEN
                    -- Idempotent duplicate
                    v_synced_count := v_synced_count + 1;
                ELSE
                    v_conflicts := v_conflicts || jsonb_build_object(
                        'id', v_item->>'id',
                        'reason', 'Server copy has divergent changes at identical revision ' || v_existing.revision || '. Local draft preserved.',
                        'server_revision', v_existing.revision,
                        'client_revision', v_revision
                    );
                END IF;
            ELSIF v_revision = v_existing.revision + 1 THEN
                UPDATE public.incidents
                SET operator = v_item->'fields'->>'operator',
                    area_id = v_item->'fields'->>'area_id',
                    category = v_item->'fields'->>'category',
                    occurred_at = (v_item->'fields'->>'occurred_at')::timestamptz,
                    narrative = v_item->'fields'->>'narrative',
                    complaint_reference = v_item->'fields'->>'complaint_reference',
                    complaint_contacted_at = (v_item->'fields'->>'complaint_contacted_at')::timestamptz,
                    revision = v_revision,
                    updated_at = v_now,
                    deleted_at = NULL
                WHERE id = v_existing.id AND revision = v_existing.revision;

                IF FOUND THEN
                    v_synced_count := v_synced_count + 1;
                ELSE
                    v_failed_count := v_failed_count + 1;
                END IF;
            ELSE
                v_conflicts := v_conflicts || jsonb_build_object(
                    'id', v_item->>'id',
                    'reason', 'Revision sequence gap: expected revision ' || (v_existing.revision + 1) || ', received ' || v_revision || '.',
                    'server_revision', v_existing.revision,
                    'client_revision', v_revision
                );
            END IF;
        ELSE
            INSERT INTO public.incidents (
                id, owner_id, client_record_id, operator, area_id, category,
                occurred_at, narrative, complaint_reference, complaint_contacted_at,
                provenance, revision, created_at, updated_at
            ) VALUES (
                (v_item->>'id')::uuid, v_owner_id, v_client_record_id,
                v_item->'fields'->>'operator', v_item->'fields'->>'area_id', v_item->'fields'->>'category',
                (v_item->'fields'->>'occurred_at')::timestamptz, v_item->'fields'->>'narrative',
                v_item->'fields'->>'complaint_reference', (v_item->'fields'->>'complaint_contacted_at')::timestamptz,
                'user_reported', v_revision,
                (v_item->>'created_at')::timestamptz, (v_item->>'updated_at')::timestamptz
            );
            v_synced_count := v_synced_count + 1;
        END IF;
    END LOOP;

    -- Process deletions
    FOREACH v_delete_id IN ARRAY p_deleted_ids
    LOOP
        UPDATE public.incidents
        SET deleted_at = v_now
        WHERE id = v_delete_id AND owner_id = v_owner_id;

        IF FOUND THEN
            v_synced_count := v_synced_count + 1;
        ELSE
            v_failed_count := v_failed_count + 1;
        END IF;
    END LOOP;

    v_result := jsonb_build_object(
        'synced_count', v_synced_count,
        'failed_count', v_failed_count,
        'conflicts', v_conflicts,
        'synced_at', v_now
    );

    -- Update sync_operations record
    UPDATE public.sync_operations
    SET status = 'completed', payload = v_result
    WHERE owner_id = v_owner_id AND client_mutation_id = p_client_mutation_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ==============================================================================
-- 13. PRIVILEGE HARDENING & RPC ACCESS RESTRICTION (CTO012-D)
-- ==============================================================================
-- By default in PostgreSQL, functions created in the public schema grant EXECUTE to PUBLIC.
-- For SECURITY DEFINER functions, this inadvertently exposes them via PostgREST RPC
-- to anon and authenticated roles unless explicitly revoked.

-- 1. handle_new_subscriber: Internal trigger function only.
-- Revoke all execute privileges from PUBLIC, anon, and authenticated.
REVOKE ALL ON FUNCTION public.handle_new_subscriber() FROM PUBLIC, anon, authenticated;

-- 2. purge_expired_records: Administrative maintenance function.
-- Revoke all execute privileges from PUBLIC, anon, and authenticated. Grant strictly to service_role.
REVOKE ALL ON FUNCTION public.purge_expired_records(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_expired_records(integer) TO service_role;

-- 3. apply_sync_batch: Client synchronization RPC function.
-- Revoke from PUBLIC and anon (unauthenticated callers must not invoke RPC).
-- Grant strictly to authenticated subscribers and service_role.
REVOKE ALL ON FUNCTION public.apply_sync_batch(text, jsonb, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_sync_batch(text, jsonb, uuid[]) TO authenticated, service_role;

-- 4. rls_auto_enable: Supabase internal helper (if present in public schema).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'rls_auto_enable'
    ) THEN
        EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;';
    END IF;
END;
$$;

