# Neon Postgres Fallback Architecture Design

**Document Version:** 0.1.0  
**Baseline:** CTO012  
**Purpose:** Architecture fallback if a dedicated free Supabase project cannot be provisioned due to organization quota limits or pending founder authorization.

---

## 1. Overview & Provider Boundary

SignalPulse NG uses managed PostgreSQL as its relational database standard (ADR-001). While Supabase is the preferred multi-capability platform (providing Postgres, Auth, and Storage in one system), **Neon Serverless Postgres** serves as the canonical direct database fallback.

Neon provides:
- Fully managed PostgreSQL 16/17 with instant branching.
- Serverless connection pooling (via PgBouncer / `@neondatabase/serverless`).
- Native standard PostgreSQL SQL compliance, matching our DDL and index requirements.

---

## 2. Capability Mapping & Emulation

| Capability | Supabase Implementation | Neon Postgres Fallback Implementation |
| :--- | :--- | :--- |
| **Relational Database** | Managed PostgreSQL (pg15/16) | Neon Serverless PostgreSQL (pg16) |
| **Identity & Authentication** | Supabase Auth (Anonymous sign-in + Email OTP) | Next.js Auth.js (v5) or Jose-signed anonymous session tokens stored in secure, HttpOnly, SameSite=Lax cookies |
| **Row Level Security (RLS)** | `auth.uid() = owner_id` via Supabase JWT | `current_setting('app.current_user_id', true)::uuid = owner_id` set per pooled connection session, or application-layer tenant isolation |
| **Attachment Storage** | Supabase Storage (`evidence-attachments` bucket) | Cloudflare R2 / AWS S3 compatible private bucket accessed via `@aws-sdk/client-s3` through application proxy |

---

## 3. Row Level Security on Neon

In Neon, tenant isolation can be maintained with PostgreSQL Row Level Security by injecting the verified caller identity into the transaction session before executing application queries:

```sql
-- Neon transaction pre-flight:
BEGIN;
SELECT set_config('app.current_user_id', $1, true);

-- RLS Policy on Neon:
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY incidents_tenant_isolation ON public.incidents
  FOR ALL
  USING (owner_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (owner_id = current_setting('app.current_user_id', true)::uuid);

-- Queries automatically enforce isolation:
SELECT * FROM public.incidents;
COMMIT;
```

---

## 4. Attachment Storage on Cloudflare R2 / S3

For private attachments under the Neon fallback:
1. Bucket: Private S3/R2 bucket named `signalpulse-evidence-attachments`.
2. Object key pattern: `{owner_id}/{incident_id}/{asset_id}.bin`.
3. Transport: Proxied strictly through the Next.js backend (`/api/v1/attachments/[id]`) with owner verification on every read and write.
4. No public bucket access, no long-lived pre-signed URLs.

---

## 5. Migration Portability

The SQL migration created in `supabase/migrations/20261117180000_private_evidence_cloud.sql` is 100% ANSI PostgreSQL compliant. 
To apply against Neon:
1. Remove `REFERENCES auth.users(id)` and replace with a local `public.subscribers(id UUID PRIMARY KEY)`.
2. Replace `auth.uid()` in RLS policies with `current_setting('app.current_user_id', true)::uuid`.
3. Tables, constraints, indexes, and triggers remain completely unchanged.
