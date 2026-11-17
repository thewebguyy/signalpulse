# ADR-001 — Web and managed data architecture

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED · Owner: Codex.

**Context.** HEAD contains only AGENTS.md; the earlier audit revisions are local and uncommitted. No framework, runtime, package manager or database is installed. Preserve the product and evidence principles, not an imaginary installed stack.

**CTO direction.** Finalize a proposal for Next.js, TypeScript and managed PostgreSQL; keep implementation controlled and minimal.

**Recommended default.** One Next.js/React application using strict TypeScript, one managed Supabase PostgreSQL database, Supabase guest Auth and later private Storage. App routes form the public application contract. Separate domain rules from UI, HTTP transport and storage adapters. Runtime validation is required even with TypeScript. Choose supported versions and a single pinned package manager only during authorized scaffolding. No package/version is selected here.

The server uses verified caller identity for user operations, least-privilege access and RLS. Exposed database functions must enforce the same ownership, quotas, lifecycle and idempotency invariants as the HTTP API. Revoke direct raw writes that bypass that contract. Do not use a service-role key as the default application identity. Privileged cleanup/import tasks require distinct authorization and review. Administrative schemas/views stay unexposed.

**Alternatives.** A React SPA plus separate backend adds another integration surface without an established need. Self-managed PostgreSQL adds operations work. A second backend framework, database, event bus or microservices are unjustified. Plain managed PostgreSQL remains possible, but replacing Supabase would require a revised Auth/Storage access proposal rather than superficial SDK substitution.

**Consequences.** SQL constraints and policies remain authoritative; browser types are not security. Direct Data API calls must be tested as adversarial entry points. Database-access mode and transaction implementation need a reviewed design during implementation; they may not weaken these invariants. API adapters must not expose incidental database row shapes.

**Founder pending.** F01: provider/region, processor terms, hosting budget and cross-border arrangements. CTO acceptance: architecture and contract baseline. No deployment authorized.

**Acceptance evidence later required.** Reproducible build, scoped identity propagation, RLS/grant/function negative tests, no private rows in public views, no secrets in browser bundles and isolated staging. [Next.js HTTP API support](https://nextjs.org/docs/app/guides/backend-for-frontend), [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).
