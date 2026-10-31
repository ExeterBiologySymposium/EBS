# EBS administration implementation plan

Status: approved October 31, 2026; implemented and verified locally. Production configuration, bootstrap, and deployment remain outstanding.

1. Preserve the current working tree and SEO/cleanup changes; record baseline checks.
2. Write failing Node acceptance tests for allocation, authorization, verified lookup, invitations, accepted-first transfer, concurrency and uncertain-write reconciliation.
3. Implement private registry/journal/leases using existing Neon and parameterized SQL. Test SQL behavior separately with the installed PostgreSQL-compatible PGlite runtime or an isolated Postgres schema.
4. Implement production-verified Clerk gateway, pooled membership authorization, allocation, ceiling, deduplication and recovery. Keep the existing Drive namespace anchor.
5. Integrate admin UI, Account link, native Team settings and invitation landing page into current React/Vite routing and SEO generation.
6. Provide default read-only bootstrap/setup documentation and switches. Do not perform live setup or deployment as part of local implementation.
7. Run focused tests, typecheck, build and current SEO/regression checks. Verify browser flows with fake providers, review scoped changes and repair findings.
8. Apply only reviewed feature files to the actual EBS repository, preserving unrelated local work. Report local/live evidence separately.

## Completed verification

The actual EBS repository passed 28 backend/database tests (including PostgreSQL lease/constraint checks, no skips), additional SSR/UI checks, 12 SEO tests, typecheck/build/prerender, current generated-output checks, and git diff --check. Fake-provider browser verification covered desktop/mobile, keyboard add/invite, pagination, capacity denial, cleanup recovery, Team context/permission boundaries, hash reload, invitation landing, Account integration, and revocation. Live Clerk delivery and production bootstrap were not performed.
