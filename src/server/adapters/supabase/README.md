# Supabase adapter boundary

Reserved integration boundary only. There is no SDK, client, key, project ID, network call or database schema here.

Future adapters may implement `src/modules/*/port.ts` after separate approval. Resolve ownership from a verified session; enforce the same invariants through RLS/grants and directly reachable APIs. Do not introduce service-role fallback, browser provider credentials, migration SQL or a fake authenticated session in CTO002-A. The current composition root uses synthetic fixtures and refuses live environment configuration.
