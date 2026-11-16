# ADR-003 — Private evidence and secure object access

Version: 0.1.0 · Baseline: CTO001-r1 · Status: PROPOSED · Owner: Codex.

**CTO direction.** Private evidence storage must have explicit object-access semantics. Journal and text-only export must precede attachments.

**Recommended default.** First validate incident text, owned history, complaint template and JSON/PDF export without uploads. Later add private Supabase Storage with quarantine and clean lifecycle states; all evidence remains private after scanning. A file is an assertion supplied by a user, not authenticated billing proof.

Use application-proxied uploads/downloads for the initial attachment slice. The 5 MiB cap makes streaming through a validated host a manageable default; verify host request limits before approval. No public bucket, browser-supplied storage key, direct overwrite or signed download URL is needed initially. Proxy access checks ownership and deletion state on every request. If the host cannot support this, stop and revise the transport contract rather than silently replacing it with bearer URLs. Existing guidance about short-lived signed URLs remains an option for a separately reviewed change, not a requirement to use them.

Reserve an owned asset, stream to generated quarantine key, validate actual bytes/type/dimensions, scan, then release as clean. Incomplete/unsafe/unscannable files remain unreadable. Original filename is not an object path and is unnecessary to retain. Only JPEG/PNG/PDF are candidates; no archives, SVG/HTML, remote URL imports or active inline documents. Redaction happens before upload; a sanitized derivative is explicitly labelled. Hashes establish byte identity only.

Export uses one owner-authorized snapshot/serializer for JSON and PDF, with escaped text and renderer networking disabled. Text-only means no embedded attachments; measurement summaries can be added in a later phase without requiring uploaded files. Deletion/access revocation must not depend on storage purge finishing. Private Storage relies on separate object access policies, not bucket naming conventions. [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

**Alternatives.** Direct signed URLs reduce application bandwidth but introduce bearer access and revocation races. Public buckets are unacceptable. Broad file types expand parsing risk. Both JSON and real PDF export are retained; browser print alone is not a substitute for the PDF acceptance criteria.

**Founder pending.** F06: attachment scanning/hosting operating cost and retention; F03: deletion promises. **Review evidence:** cross-owner reads/writes, malformed/malicious uploads, orphan cleanup, private caches, concurrent delete/download and export renderer injection. See [lifecycle contract](../contracts/evidence-lifecycle.md).
